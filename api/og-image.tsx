import { ImageResponse } from '@vercel/og';
import { CLASS_SESSIONS } from './_classSessions.js';

/**
 * Dynamic 1200x630 OG image for class sessions.
 *
 *   /api/og-image?slug=<session-slug>
 *
 * Renders a branded card (cream/gold/green palette + Playfair Display / DM Sans
 * to match /classes/<slug>) using @vercel/og on Vercel's Edge runtime. The
 * resulting PNG is cached at the edge for ~1 day so we don't burn render
 * cycles on every social-crawler fetch.
 */

export const config = { runtime: 'edge' };

// Google Fonts CSS endpoints — we parse them to find the woff2 URLs at runtime.
const FONT_PLAYFAIR =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&display=swap';
const FONT_DM_SANS = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&display=swap';

async function fetchFont(cssUrl: string): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(cssUrl, {
      headers: {
        // Force a User-Agent that yields TTF (not woff2) so @vercel/og can parse it.
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('(woff2|truetype)'\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug') ?? '';
  const session = CLASS_SESSIONS.find((s) => s.slug === slug) ?? CLASS_SESSIONS[0];

  if (!session) {
    return new Response('No class session configured', { status: 404 });
  }

  // Fetch fonts in parallel. If anything fails we still render with @vercel/og's
  // built-in fallback — the image just won't have the brand typography.
  const [playfair, dmSans] = await Promise.all([fetchFont(FONT_PLAYFAIR), fetchFont(FONT_DM_SANS)]);

  const fonts: Array<{ name: string; data: ArrayBuffer; weight: 400 | 500 | 700 | 900; style: 'normal' }> = [];
  if (playfair) fonts.push({ name: 'Playfair Display', data: playfair, weight: 900, style: 'normal' });
  if (dmSans) fonts.push({ name: 'DM Sans', data: dmSans, weight: 500, style: 'normal' });

  const fontBody = dmSans ? 'DM Sans' : 'sans-serif';
  const fontDisplay = playfair ? 'Playfair Display' : 'serif';

  const priceFrom = session.tracks.reduce((min, t) => {
    const n = parseInt(t.price.replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(n) ? min : Math.min(min, n);
  }, Number.POSITIVE_INFINITY);
  const priceTo = session.tracks.reduce((max, t) => {
    const n = parseInt(t.price.replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(n) ? max : Math.max(max, n);
  }, 0);
  const priceLabel =
    priceFrom !== Number.POSITIVE_INFINITY && priceTo > priceFrom
      ? `$${priceFrom} – $${priceTo}`
      : priceTo
      ? `From $${priceFrom}`
      : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#1a1714',
          color: '#fdf8f2',
          fontFamily: fontBody,
          position: 'relative',
        }}
      >
        {/* Top accent stripe */}
        <div
          style={{
            display: 'flex',
            height: 12,
            background: 'linear-gradient(90deg, #2d9b6e 0%, #c9913a 50%, #4a63d4 100%)',
          }}
        />

        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background:
              'radial-gradient(ellipse 60% 80% at 85% 50%, rgba(45,155,110,0.22) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 15% 100%, rgba(201,145,58,0.18) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
            padding: '52px 72px',
            position: 'relative',
          }}
        >
          {/* Header / brand */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                fontFamily: fontDisplay,
                fontSize: 30,
                fontWeight: 900,
                letterSpacing: '0.005em',
                color: '#fdf8f2',
                display: 'flex',
              }}
            >
              Digital<span style={{ color: '#c9913a', fontStyle: 'italic' }}>Craft</span>
            </div>
            <div
              style={{
                fontSize: 16,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#c9913a',
                fontWeight: 500,
                display: 'flex',
              }}
            >
              {session.seasonLabel} · In-Person
            </div>
          </div>

          {/* Body */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div
              style={{
                fontSize: 18,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#c9913a',
                fontWeight: 500,
                display: 'flex',
              }}
            >
              {session.social.imageSubhead}
            </div>
            <div
              style={{
                fontFamily: fontDisplay,
                fontSize: 96,
                fontWeight: 900,
                lineHeight: 1.02,
                color: '#fdf8f2',
                display: 'flex',
                maxWidth: 980,
              }}
            >
              {session.social.imageHeadline}
            </div>
            <div
              style={{
                fontSize: 28,
                color: '#c8c2ba',
                lineHeight: 1.35,
                display: 'flex',
                maxWidth: 980,
              }}
            >
              {session.social.imageFooter}
            </div>
          </div>

          {/* Footer chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div
              style={{
                background: 'rgba(45,155,110,0.18)',
                border: '1px solid rgba(45,155,110,0.55)',
                color: '#9ee0bf',
                padding: '12px 22px',
                borderRadius: 999,
                fontSize: 20,
                fontWeight: 700,
                display: 'flex',
              }}
            >
              {session.audience}
            </div>
            {priceLabel && (
              <div
                style={{
                  background: 'rgba(201,145,58,0.16)',
                  border: '1px solid rgba(201,145,58,0.5)',
                  color: '#e8c997',
                  padding: '12px 22px',
                  borderRadius: 999,
                  fontSize: 20,
                  fontWeight: 700,
                  display: 'flex',
                }}
              >
                {priceLabel}
              </div>
            )}
            <div
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.16)',
                color: '#c8c2ba',
                padding: '12px 22px',
                borderRadius: 999,
                fontSize: 20,
                display: 'flex',
              }}
            >
              digitalcraftai.com/classes/{session.slug}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length > 0 ? fonts : undefined,
      headers: {
        // Cache aggressively at the edge so a viral share doesn't keep re-rendering.
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  );
}
