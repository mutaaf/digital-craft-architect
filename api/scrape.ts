import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(422).json({ error: 'Missing or invalid "url" field' });
  }

  // Try Firecrawl first (if API key is configured)
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  if (firecrawlKey) {
    try {
      const resp = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firecrawlKey}`,
        },
        body: JSON.stringify({ url, formats: ['markdown'], timeout: 30000 }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const content = data?.data?.markdown ?? '';
        if (content.length > 100) {
          return res.status(200).json({ content, source: 'firecrawl' });
        }
      }
    } catch {
      // Fall through to Jina
    }
  }

  // Jina fallback
  try {
    const resp = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: 'text/markdown' },
    });

    if (resp.ok) {
      const content = await resp.text();
      if (content.length > 100) {
        return res.status(200).json({ content, source: 'jina' });
      }
    }
  } catch {
    // Fall through to error
  }

  return res.status(422).json({ error: 'Failed to scrape URL with both Firecrawl and Jina' });
}
