import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

export const config = { maxDuration: 5 };

const OG: Record<string, { t: string; d: string; i: string }> = {
  '/construction': {
    t: 'AI Systems for Construction Businesses | DigitalCraft AI',
    d: 'Interactive AI demos for construction: Lead Responder, Smart Estimates, Review Automation, Deal Analyzer, and Voice Negotiator.',
    i: '/og-construction.png',
  },
  '/construction/demo': {
    t: 'Interactive AI Demos for Construction | DigitalCraft AI',
    d: 'Five working AI proof-of-concepts for construction businesses. Enter your website to see demos personalized to your company.',
    i: '/og-construction.png',
  },
  '/realestate': {
    t: 'AI Systems for Real Estate Professionals | DigitalCraft AI',
    d: 'AI-powered deal analysis, voice negotiation, and lead qualification for real estate investors and agents.',
    i: '/og-realestate.png',
  },
  '/realestate/demo': {
    t: 'Interactive AI Demos for Real Estate | DigitalCraft AI',
    d: 'Three working AI proof-of-concepts: Deal Analyzer, Voice Negotiator, and Lead Qualifier.',
    i: '/og-realestate.png',
  },
  '/events': {
    t: 'AI Systems for Event Planners | DigitalCraft AI',
    d: 'AI-powered booking, proposal generation, and client management for event planning businesses.',
    i: '/og-events.png',
  },
  '/events/demo': {
    t: 'Interactive AI Demos for Events | DigitalCraft AI',
    d: 'Working AI proof-of-concepts for event planners: AI Booking Agent, Proposal Generator, and Lead Qualifier.',
    i: '/og-events.png',
  },
  '/setupclaw': {
    t: 'SetupClaw — White-Glove AI Assistant Deployment | Dallas, Austin & Remote',
    d: "We deploy and maintain your team's AI assistant on a Mac Mini — remotely or on-site in DFW and Austin, TX. No technical knowledge required. Starting at $5,000.",
    i: '/og-setupclaw.png',
  },
};

let cachedHtml: string | null = null;

function getSpaHtml(): string {
  if (cachedHtml) return cachedHtml;
  try {
    // In Vercel, the built output is in .vercel/output/static or dist
    // The index.html is served as the SPA shell
    const paths = [
      join(process.cwd(), 'dist', 'index.html'),
      join(process.cwd(), '.vercel', 'output', 'static', 'index.html'),
      join(process.cwd(), 'index.html'),
    ];
    for (const p of paths) {
      try {
        cachedHtml = readFileSync(p, 'utf-8');
        return cachedHtml;
      } catch { /* try next */ }
    }
  } catch { /* fall through */ }
  return '';
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const path = (req.query.path as string) || '/';

  // Find best OG match
  const og =
    OG[path] ||
    OG[Object.keys(OG).find((k) => path.startsWith(k + '/')) || ''] ||
    null;

  let html = getSpaHtml();

  // If no SPA HTML found or no custom OG, fall through to index.html
  if (!html || !og) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html || '<!DOCTYPE html><html><body>Loading...</body></html>');
    return;
  }

  const origin = `https://${req.headers.host || 'digitalcraftai.com'}`;
  const fullImage = `${origin}${og.i}`;
  const fullUrl = `${origin}${path}`;

  // Replace static meta tags with route-specific ones
  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${og.t}</title>`)
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${og.d}" />`
    )
    .replace(
      /<meta property="og:title" content="[^"]*" \/>/,
      `<meta property="og:title" content="${og.t}" />`
    )
    .replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${og.d}" />`
    )
    .replace(
      /<meta property="og:image" content="[^"]*" \/>/,
      `<meta property="og:image" content="${fullImage}" />`
    )
    .replace(
      /<meta property="og:url" content="[^"]*" \/>/,
      `<meta property="og:url" content="${fullUrl}" />`
    )
    .replace(
      /<meta name="twitter:card" content="[^"]*" \/>/,
      `<meta name="twitter:card" content="summary_large_image" />`
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*" \/>/,
      `<meta name="twitter:title" content="${og.t}" />`
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*" \/>/,
      `<meta name="twitter:description" content="${og.d}" />`
    )
    .replace(
      /<meta name="twitter:image" content="[^"]*" \/>/,
      `<meta name="twitter:image" content="${fullImage}" />`
    )
    // Also handle property="twitter:*" variant
    .replace(
      /<meta property="twitter:card" content="[^"]*" \/>/,
      `<meta property="twitter:card" content="summary_large_image" />`
    )
    .replace(
      /<meta property="twitter:title" content="[^"]*" \/>/,
      `<meta property="twitter:title" content="${og.t}" />`
    )
    .replace(
      /<meta property="twitter:description" content="[^"]*" \/>/,
      `<meta property="twitter:description" content="${og.d}" />`
    )
    .replace(
      /<meta property="twitter:image" content="[^"]*" \/>/,
      `<meta property="twitter:image" content="${fullImage}" />`
    );

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(html);
}
