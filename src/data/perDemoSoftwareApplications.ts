// Ticket 0103 - canonical per-demo SoftwareApplication rows for the five
// shipped construction demo routes. Read by each demo page's Helmet
// block AND by tests/e2e/per-demo-softwareapplication-jsonld.spec.ts
// (2026-06-07 mirror-source-across-src-tests lesson) so the spec and
// the emitted JSON-LD cannot drift.
//
// Design decisions per the ticket:
// - One row per shipped demo route; the /demos hub SoftwareApplication
//   from ticket 0030 stays byte-identical (this file does NOT re-emit
//   the hub block).
// - Every `route` string is validated at module load against the
//   ROUTES allow-list imported from src/data/routes.ts (throw
//   NOT_IN_ROUTES on violation per the 2026-05-28 sitemap-lastmod
//   encoded-invariant lesson; same pattern as src/data/accessibilityStatement.ts).
// - Every `demoId` is unique.
// - Every `priceAnchor` string is non-empty and contains a `$`
//   character so the visible pricing anchor stays defensible per the
//   AGENTS.md conservative-claims rule.
// - Per the 2026-05-25 mirror-source rule, each row's `description`
//   is byte-identical to the string emitted into the demo's
//   `meta[name="description"]` on the same page today. Grep of each
//   demo's Helmet at branch head confirms the five descriptions
//   below match the shipped meta descriptions verbatim (code beats
//   prose per the 2026-09-12 lesson).
// - Per the 2026-05-07 em-dash Hard NO every string in this module
//   uses hyphens; the module-load assertion throws on any U+2014.
//
// Deviation from the ticket engineering-notes prose: the ticket says
// each priceAnchor's `$` must be "grepable from `src/data/pricing.ts`",
// but that file does not exist at branch head (verified via
// `ls src/data/`). Per the 2026-09-12 code-beats-prose lesson the real
// source is authoritative: the demo pages all render a visible "POC
// Demo" badge and each vertical hub renders a "Free AI Audit" CTA, so
// "$0 (POC demo)" is the defensible anchor grepable from real code.
// The module-load assertion enforces `priceAnchor.includes('$')` and
// non-empty; it does not gate on a specific file that does not exist.

import { ROUTES } from './routes';

/**
 * One SoftwareApplication block emitted on a single demo page. Every
 * field on this row is used verbatim in the JSON-LD block on that
 * page; there is no per-component transform.
 */
export interface PerDemoSoftwareApplication {
  /** Stable id (used for uniqueness assertion; not emitted). */
  demoId: string;
  /** Route the block is emitted on; must be present in ROUTES. */
  route: string;
  /** SoftwareApplication.name - the visible H1-equivalent demo name. */
  name: string;
  /**
   * SoftwareApplication.description AND the demo's
   * meta[name="description"] content on the same page (mirror-source
   * per the 2026-05-25 lesson).
   */
  description: string;
  /** SoftwareApplication.applicationCategory (schema.org enumeration). */
  applicationCategory: string;
  /** SoftwareApplication.operatingSystem (schema.org guidance). */
  operatingSystem: string;
  /**
   * Human-readable pricing anchor emitted as the Offer.description.
   * All demos are free to try; anchor contains "$" so the SoftwareApplication
   * Offer stays consistent with the /demos hub's price: "0" from ticket 0030.
   */
  priceAnchor: string;
}

export const PER_DEMO_SOFTWARE_APPLICATIONS: readonly PerDemoSoftwareApplication[] = [
  {
    demoId: 'construction-lead-responder',
    route: '/construction/demo/lead-responder',
    name: 'AI Lead Responder Demo',
    description:
      'Chat with an AI lead responder that qualifies construction leads, extracts project details, and books consultations in real time using GPT-4o.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    priceAnchor: '$0 (POC demo)',
  },
  {
    demoId: 'construction-estimate',
    route: '/construction/demo/estimate',
    name: 'AI Construction Estimate Generator',
    description:
      'Generate branded construction estimates in under 60 seconds. Enter project type and square footage for an instant ballpark estimate.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    priceAnchor: '$0 (POC demo)',
  },
  {
    demoId: 'construction-reviews',
    route: '/construction/demo/reviews',
    name: 'AI Review Request System',
    description:
      'Experience automated SMS review requests that turn completed projects into 5-star Google reviews with smart follow-ups.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    priceAnchor: '$0 (POC demo)',
  },
  {
    demoId: 'construction-property-negotiator',
    route: '/construction/demo/property-negotiator',
    name: 'AI Property Deal Analyzer',
    description:
      'Paste a property listing, watch the AI work through 4 steps live, get comps, strategy, and ready-to-send seller messages.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    priceAnchor: '$0 (POC demo)',
  },
  {
    demoId: 'construction-voice-negotiator',
    route: '/construction/demo/voice-negotiator',
    name: 'AI Voice Negotiator',
    description:
      'AI-powered voice negotiation for real estate deals. The AI calls sellers, negotiates pricing, and provides a full call summary.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    priceAnchor: '$0 (POC demo)',
  },
];

/**
 * Look up a row by its demo route. Every demo page reads its own row
 * through this helper so no page hardcodes an array index.
 */
export function getDemoApplicationByRoute(
  route: string,
): PerDemoSoftwareApplication | undefined {
  return PER_DEMO_SOFTWARE_APPLICATIONS.find((row) => row.route === route);
}

/**
 * Build the SoftwareApplication JSON-LD object for a given row. The
 * shape mirrors the ticket 0030 hub block verbatim (schema.org
 * context, SoftwareApplication type, single Offer with the string
 * "0" price) so the two sibling schemas share one shape.
 */
export function buildDemoSoftwareApplicationSchema(
  row: PerDemoSoftwareApplication,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: row.name,
    description: row.description,
    url: `https://digitalcraftai.com${row.route}`,
    applicationCategory: row.applicationCategory,
    operatingSystem: row.operatingSystem,
    offers: {
      '@type': 'Offer',
      // price is the string "0" per the ticket 0030 hub block precedent;
      // JSON-LD validators that require schema.org Number-as-string
      // semantics accept it and the per-demo spec explicitly asserts
      // typeof === 'string'.
      price: '0',
      priceCurrency: 'USD',
      description: row.priceAnchor,
    },
  };
}

/**
 * Encoded-invariant assertion per the 2026-05-28 sitemap-lastmod
 * lesson. Fires at module load; because every demo page imports this
 * module, a violation fails `npm run build` locally and CI's `build`
 * gating job without any package.json edit. The error messages name
 * the offending row so a future editor can trace which entry broke
 * the invariant.
 */
function assertPerDemoSoftwareApplications(): void {
  const routeSet = new Set<string>(ROUTES);
  const seenIds = new Set<string>();
  const seenRoutes = new Set<string>();
  const emDash = String.fromCharCode(8212);

  for (const row of PER_DEMO_SOFTWARE_APPLICATIONS) {
    if (!routeSet.has(row.route)) {
      throw new Error(
        `perDemoSoftwareApplications: route "${row.route}" NOT_IN_ROUTES for demo "${row.demoId}"`,
      );
    }
    if (seenIds.has(row.demoId)) {
      throw new Error(
        `perDemoSoftwareApplications: duplicate demoId "${row.demoId}"`,
      );
    }
    seenIds.add(row.demoId);
    if (seenRoutes.has(row.route)) {
      throw new Error(
        `perDemoSoftwareApplications: duplicate route "${row.route}" for demo "${row.demoId}"`,
      );
    }
    seenRoutes.add(row.route);
    if (row.priceAnchor.length === 0 || !row.priceAnchor.includes('$')) {
      throw new Error(
        `perDemoSoftwareApplications: priceAnchor must be non-empty and contain a "$" character on demo "${row.demoId}"`,
      );
    }
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'string' && value.includes(emDash)) {
        throw new Error(
          `perDemoSoftwareApplications: field "${key}" contains em-dash on demo "${row.demoId}"`,
        );
      }
    }
  }
}

assertPerDemoSoftwareApplications();
