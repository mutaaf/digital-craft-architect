import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CLASS_SESSIONS } from './_classSessions.js';

export const config = { maxDuration: 5 };

/** Resolve dynamic OG data for /classes, /classes/<slug>, and
 *  /classes/<slug>/register routes. */
function resolveClassSessionOg(
  path: string,
  origin: string,
): { title: string; description: string; image: string } | null {
  // Bare /classes hub — program-level OG with a hub-mode image.
  if (path === '/classes' || path === '/classes/') {
    const upcoming = CLASS_SESSIONS.filter(
      (s) => new Date(s.endDate).getTime() >= Date.now() && s.status !== 'closed',
    ).length;
    return {
      title: 'AI Classes — In-Person Sessions for Kids, Teens & Adults | Digital Craft',
      description:
        upcoming > 0
          ? `Hands-on, in-person AI classes from Digital Craft. ${upcoming} upcoming session${upcoming === 1 ? '' : 's'}. Taught in libraries and community spaces — youth, adult, and family tracks.`
          : 'Hands-on, in-person AI classes from Digital Craft. Taught in libraries and community spaces — youth, adult, and family tracks. Sign up to hear about the next session.',
      image: `${origin}/api/og-image?type=hub`,
    };
  }
  const match = path.match(/^\/classes\/([^/]+)(\/register)?\/?$/);
  if (!match) return null;
  const slug = match[1];
  const session = CLASS_SESSIONS.find((s) => s.slug === slug);
  if (!session) return null;
  const isRegister = !!match[2];
  return {
    title: isRegister
      ? `Register — ${session.social.ogTitle}`
      : `${session.social.ogTitle} | Digital Craft`,
    description: isRegister
      ? `Register for ${session.social.ogTitle}. ${session.dateLabel} · ${session.location.venue}, ${session.location.city} ${session.location.state}.`
      : session.social.ogDescription,
    image: `${origin}/api/og-image?slug=${session.slug}`,
  };
}

/** OG meta tags per route — served to link preview crawlers */
const OG_DATA: Record<string, { title: string; description: string; image?: string }> = {
  '/construction': {
    title: 'AI Systems for Construction Businesses | DigitalCraft AI',
    description:
      'Interactive AI demos for construction: Lead Responder, Smart Estimates, Review Automation, Deal Analyzer, and Voice Negotiator.',
    image: '/og-construction.png',
  },
  '/construction/demo': {
    title: 'Interactive AI Demos for Construction | DigitalCraft AI',
    description:
      'Five working AI proof-of-concepts for construction businesses. Enter your website to see demos personalized to your company.',
    image: '/og-construction.png',
  },
  '/realestate': {
    title: 'AI Systems for Real Estate Professionals | DigitalCraft AI',
    description:
      'AI-powered deal analysis, voice negotiation, and lead qualification for real estate investors and agents.',
    image: '/og-realestate.png',
  },
  '/realestate/demo': {
    title: 'Interactive AI Demos for Real Estate | DigitalCraft AI',
    description:
      'Three working AI proof-of-concepts: Deal Analyzer, Voice Negotiator, and Lead Qualifier. See the future of your real estate business.',
    image: '/og-realestate.png',
  },
  '/events': {
    title: 'AI Systems for Event Planners | DigitalCraft AI',
    description:
      'AI-powered booking, proposal generation, and client management for event planning businesses.',
    image: '/og-events.png',
  },
  '/events/demo': {
    title: 'Interactive AI Demos for Events | DigitalCraft AI',
    description:
      'Working AI proof-of-concepts for event planners: AI Booking Agent, Proposal Generator, and Lead Qualifier.',
    image: '/og-events.png',
  },
  '/setupclaw': {
    title: 'SetupClaw — White-Glove AI Assistant Deployment | Dallas, Austin & Remote',
    description:
      'We deploy and maintain your team\'s AI assistant on a Mac Mini — remotely or on-site in DFW and Austin, TX. No technical knowledge required. Starting at $5,000.',
    image: '/og-setupclaw.png',
  },
};

const DEFAULT_OG = {
  title: 'DigitalCraft AI | AI Automation for Traditional Industries',
  description:
    'We build AI systems for construction, real estate, and event planning businesses. See live demos personalized to your company.',
  image: '/og-default.png',
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  const path = (req.query.path as string) || '/';
  const site = req.query.site as string | undefined;

  const origin = `https://${req.headers.host || 'digitalcraftai.com'}`;

  // /classes/<slug> and /classes/<slug>/register get per-session OG with a
  // dynamically rendered image from /api/og-image.
  const classOg = resolveClassSessionOg(path, origin);

  // Find the best match: exact first, then prefix
  const baseOg =
    classOg ||
    OG_DATA[path] ||
    OG_DATA[Object.keys(OG_DATA).find((k) => path.startsWith(k + '/')) || ''] ||
    DEFAULT_OG;

  // If ?site= is present, personalize the OG tags with the business name
  const companyName = site
    ? site.replace(/^www\./, '').replace(/\.\w+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  const og = companyName
    ? {
        ...baseOg,
        title: `See How AI Would Work for ${companyName} | DigitalCraft AI`,
        description: `Live AI demos customized for ${companyName}: ${baseOg.description}`,
      }
    : baseOg;

  const image = og.image || DEFAULT_OG.image;
  const fullImage = image?.startsWith('http') ? image : `${origin}${image}`;
  const fullUrl = site ? `${origin}${path}?site=${encodeURIComponent(site)}` : `${origin}${path}`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${og.title}</title>
  <meta name="description" content="${og.description}" />
  <meta property="og:title" content="${og.title}" />
  <meta property="og:description" content="${og.description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${fullUrl}" />
  <meta property="og:image" content="${fullImage}" />
  <meta property="og:site_name" content="DigitalCraft AI" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${og.title}" />
  <meta name="twitter:description" content="${og.description}" />
  <meta name="twitter:image" content="${fullImage}" />
  <meta http-equiv="refresh" content="0;url=${fullUrl}" />
</head>
<body>
  <p>Redirecting to <a href="${fullUrl}">${og.title}</a>...</p>
</body>
</html>`);
}
