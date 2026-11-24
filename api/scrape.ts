import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isIP } from 'node:net';
import { guard, upstream, type GuardContext } from './_lib/guard.js';

export const config = { maxDuration: 60 };

const MAX_CONTENT = 200_000;

/** Returns a normalized public http(s) URL, or null if it is not one we will fetch. */
export function publicUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  let s = raw.trim();
  if (!s || s.length > 2048) return null;
  // Visitors type "acme.com"; accept that like the front end does.
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = `https://${s}`;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (u.username || u.password) return null;
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (!host || isIP(host)) return null;
  if (!host.includes('.')) return null;
  if (host === 'localhost' || host.endsWith('.localhost')) return null;
  if (host.endsWith('.local') || host.endsWith('.internal')) return null;
  // Pure-numeric dotted forms that isIP misses (e.g. "0x7f.1").
  if (/^[0-9x.]+$/i.test(host)) return null;
  return u.toString();
}

export default guard(
  'scrape',
  { methods: ['POST'], rate: { limit: 10, windowMs: 60_000 }, maxBodyBytes: 8_192 },
  async (req: VercelRequest, res: VercelResponse, ctx: GuardContext) => {
    const url = publicUrl(req.body?.url);
    if (!url) {
      ctx.err = 'invalid_url';
      return res.status(422).json({ error: 'Missing or invalid "url" field' });
    }

    // Try Firecrawl first (if API key is configured)
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    if (firecrawlKey) {
      try {
        const resp = await upstream(
          ctx,
          'https://api.firecrawl.dev/v1/scrape',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${firecrawlKey}` },
            body: JSON.stringify({ url, formats: ['markdown'], timeout: 30000 }),
          },
          35_000,
        );
        if (resp.ok) {
          const data = await resp.json();
          const content: string = typeof data?.data?.markdown === 'string' ? data.data.markdown : '';
          if (content.length > 100) {
            return res.status(200).json({ content: content.slice(0, MAX_CONTENT), source: 'firecrawl' });
          }
        }
      } catch {
        // Fall through to Jina
      }
    }

    // Jina fallback
    try {
      const resp = await upstream(ctx, `https://r.jina.ai/${url}`, { headers: { Accept: 'text/markdown' } }, 20_000);
      if (resp.ok) {
        const content = await resp.text();
        if (content.length > 100) {
          return res.status(200).json({ content: content.slice(0, MAX_CONTENT), source: 'jina' });
        }
      }
    } catch {
      // Fall through to error
    }

    ctx.err = 'scrape_failed';
    return res.status(422).json({ error: 'Failed to scrape URL with both Firecrawl and Jina' });
  },
);
