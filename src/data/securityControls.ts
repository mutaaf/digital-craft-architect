// Ticket 0081 - canonical security controls list. Read by
// `src/pages/Security.tsx` and by `tests/e2e/security-posture-page.spec.ts`
// per the 2026-06-07 src-imports-tests lesson so the visible cards and the
// spec count-assertion cannot drift.
//
// Every string in this module is defensible per AGENTS.md - no invented
// certifications, no invented compliance frameworks, no invented insurance
// coverage claims. Aspirational rows are labeled aspirational so a
// compliance reviewer reads the exact same posture the site can actually
// defend today.
//
// Per the 2026-05-07 em-dash Hard NO every string uses hyphens; Self-Review
// greps the diff for U+2014 before pushing.
//
// Per the 2026-05-25 mirror-source rule, the shape mirrored by the
// CollectionPage JSON-LD `hasPart` array in `src/pages/Security.tsx`
// (CreativeWork entries with name / description / dateModified) is driven
// from this constant so a change to either surface is visible in one diff.

export type SecurityControlStatus = 'in-place' | 'in-progress' | 'aspirational';

export interface SecurityControl {
  /** Stable id for the DOM key and for any future anchor deep-link. */
  id: string;
  /** Short control-category name rendered as the card H3. */
  name: string;
  /** One-sentence plain-language description of the current control. */
  description: string;
  /** Enum: in-place today, in-progress this quarter, aspirational for later. */
  status: SecurityControlStatus;
  /** ISO YYYY-MM-DD - the most recent date this row was reviewed. */
  lastReviewed: string;
  /** Optional cross-link to a sibling trust surface for further detail. */
  seeAlso?: { label: string; href: string };
}

// Every row's `lastReviewed` is 2026-09-15 on initial ship per AC #1. A
// future review-cadence pass (quarterly minimum, per AC #2 "How this page
// is maintained" note) advances individual dates as controls are re-checked.
const LAST_REVIEWED = '2026-09-15';

export const securityControls: readonly SecurityControl[] = [
  {
    id: 'tls-in-transit',
    name: 'TLS in transit',
    description:
      'All visitor traffic to digitalcraftai.com and to every /api/ serverless function is served over HTTPS. Vercel provisions and rotates the TLS certificate automatically; there is no HTTP fallback in the production configuration.',
    status: 'in-place',
    lastReviewed: LAST_REVIEWED,
    seeAlso: { label: 'How our demos handle your data', href: '/trust' },
  },
  {
    id: 'secrets-storage',
    name: 'Secrets storage',
    description:
      'Every API key (OpenAI, Vapi, Firecrawl, Sentry) lives only as a Vercel environment variable scoped to the serverless runtime. No key is checked into the repository, embedded in a build artifact, or shipped to the browser bundle.',
    status: 'in-place',
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: 'vendor-data-recipients',
    name: 'Vendor data recipients',
    description:
      "A public sub-processor list enumerates every third-party service the site routes visitor or customer data through, with the vendor name, category, and a link to each vendor's public privacy or trust page.",
    status: 'in-place',
    lastReviewed: LAST_REVIEWED,
    seeAlso: { label: 'Sub-processor list', href: '/subprocessors' },
  },
  {
    id: 'session-only-client-storage',
    name: 'Session-only client storage',
    description:
      "Personalization data (scraped company profile, demo answers, AI response cache) lives in the visitor's own sessionStorage or localStorage with a 30-minute cache TTL. Digital Craft servers do not persist these artifacts.",
    status: 'in-place',
    lastReviewed: LAST_REVIEWED,
    seeAlso: { label: 'How our demos handle your data', href: '/trust' },
  },
  {
    id: 'incident-response-cadence',
    name: 'Incident response cadence',
    description:
      'Serverless function health and demo availability are published on a live public page so a reviewer can see the current-state posture without opening a ticket. A production incident triggers a same-day public status update.',
    status: 'in-place',
    lastReviewed: LAST_REVIEWED,
    seeAlso: { label: 'Live uptime status', href: '/uptime' },
  },
  {
    id: 'access-control-production-deploys',
    name: 'Access control on production deploys',
    description:
      'Production deploys land only via a squash-merge to the main branch on GitHub, which requires a passing CI gate. Vercel auto-deploys from main; no ad-hoc pushes to the deploy target are configured.',
    status: 'in-place',
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: 'data-retention-client-artifacts',
    name: 'Data retention on client-side artifacts',
    description:
      'Cached AI responses, saved estimates, and demo progress use short TTLs (30 minutes for AI cache) or are cleared when the visitor closes the tab. Nothing on the browser side is designed to outlive an active session without explicit visitor action.',
    status: 'in-place',
    lastReviewed: LAST_REVIEWED,
    seeAlso: { label: 'How our demos handle your data', href: '/trust' },
  },
  {
    id: 'third-party-penetration-testing',
    name: 'Third-party penetration testing',
    description:
      'A scheduled independent penetration test against the production surface is aspirational, not yet contracted. Buyers who need a report as a pilot precondition are invited to raise the requirement on a discovery call so the scoping can be dated in a follow-up.',
    status: 'aspirational',
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: 'ethics-hard-nos',
    name: 'Ethics hard-NO commitments',
    description:
      "A dated public page enumerates the things Digital Craft will not do with visitor data or on voice calls (no fabricated testimonials, no dark-pattern email capture, no persona misrepresentation, no scraped-data resale). Each commitment carries an in-effect-since date.",
    status: 'in-place',
    lastReviewed: LAST_REVIEWED,
    seeAlso: { label: 'What we will not do', href: '/ethics' },
  },
];
