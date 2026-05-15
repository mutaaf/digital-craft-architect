import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CLASS_SESSIONS } from './_classSessions';

export const config = { maxDuration: 5 };

/** Resolve dynamic OG data for /classes/<slug>(/register)? routes. */
function resolveClassSessionOg(
  path: string,
  origin: string,
): { t: string; d: string; i: string } | null {
  const match = path.match(/^\/classes\/([^/]+)(\/register)?\/?$/);
  if (!match) return null;
  const slug = match[1];
  const session = CLASS_SESSIONS.find((s) => s.slug === slug);
  if (!session) return null;
  const isRegister = !!match[2];
  return {
    t: isRegister
      ? `Register — ${session.social.ogTitle}`
      : `${session.social.ogTitle} | Digital Craft`,
    d: isRegister
      ? `Register for ${session.social.ogTitle}. ${session.dateLabel} · ${session.location.venue}, ${session.location.city} ${session.location.state}.`
      : session.social.ogDescription,
    // Already absolute — point straight at the dynamic image endpoint.
    i: `${origin}/api/og-image?slug=${session.slug}`,
  };
}

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
  '/construction/demo/lead-responder': {
    t: 'AI Lead Responder Demo | DigitalCraft AI',
    d: 'Chat with an AI lead responder that qualifies construction leads, extracts project details, and books consultations in real time.',
    i: '/og-construction.png',
  },
  '/construction/demo/estimate': {
    t: 'Smart Estimate Generator Demo | DigitalCraft AI',
    d: 'Generate branded construction estimates in under 60 seconds using AI-powered pricing.',
    i: '/og-construction.png',
  },
  '/construction/demo/reviews': {
    t: 'Review Request System Demo | DigitalCraft AI',
    d: 'Automated SMS review requests that turn completed projects into 5-star Google reviews.',
    i: '/og-construction.png',
  },
  '/construction/demo/property-negotiator': {
    t: 'AI Deal Analyzer Demo | DigitalCraft AI',
    d: 'Paste a listing URL or enter property details and get a full negotiation playbook with offer price, strategy, and ROI projection.',
    i: '/og-construction.png',
  },
  '/construction/demo/voice-negotiator': {
    t: 'AI Voice Negotiator Demo | DigitalCraft AI',
    d: 'Analyze a property, set your bid range, and let the AI negotiate with the seller by phone with live transcription.',
    i: '/og-construction.png',
  },
  '/realestate/demo/lead-responder': {
    t: 'AI Lead Qualifier Demo | DigitalCraft AI',
    d: 'Chat with an AI that qualifies real estate leads, captures property preferences, and schedules showings automatically.',
    i: '/og-realestate.png',
  },
  '/realestate/demo/property-negotiator': {
    t: 'AI Deal Analyzer Demo | DigitalCraft AI',
    d: 'Get a full negotiation playbook with comparable sales analysis, offer price, strategy, and ROI projection for any property.',
    i: '/og-realestate.png',
  },
  '/realestate/demo/voice-negotiator': {
    t: 'AI Voice Negotiator Demo | DigitalCraft AI',
    d: 'Set your bid range and let the AI call the seller to negotiate on your behalf with live transcription.',
    i: '/og-realestate.png',
  },
  '/events/demo/inquiry': {
    t: 'AI Inquiry Qualifier Demo | DigitalCraft AI',
    d: 'AI-powered event inquiry qualification that captures lead details and books consultations automatically.',
    i: '/og-events.png',
  },
  '/events/demo/proposal': {
    t: 'Smart Proposal Generator Demo | DigitalCraft AI',
    d: 'Generate branded event proposals in 60 seconds using AI-powered pricing.',
    i: '/og-events.png',
  },
  '/events/demo/voice-booking': {
    t: 'AI Voice Booking Agent Demo | DigitalCraft AI',
    d: 'Let the AI call leads to confirm interest, discuss packages, and schedule consultations with live transcription.',
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
  const origin = `https://${req.headers.host || 'digitalcraftai.com'}`;

  // /classes/<slug> + /classes/<slug>/register resolve to per-session OG that
  // points at the dynamically-rendered /api/og-image endpoint.
  const classOg = resolveClassSessionOg(path, origin);

  // Find best OG match
  const og =
    classOg ||
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

  const fullImage = og.i.startsWith('http') ? og.i : `${origin}${og.i}`;
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
