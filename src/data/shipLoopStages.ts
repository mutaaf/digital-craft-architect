// Ticket 0083 - canonical ship-loop enumeration. Read by
// `src/pages/HowWeShip.tsx` and by `tests/e2e/how-we-ship.spec.ts` per the
// 2026-06-07 src-imports-tests lesson so the visible cards, the JSON-LD
// mirror, and the spec count-assertions cannot drift.
//
// Every string in this module is pinned to `AGENTS.md` on branch head per
// the 2026-09-12 code-beats-prose lesson. AGENTS.md is the single source of
// truth for the loop diagram (line 27-32, "The loop" fenced block), the
// gating checks (line 45-48, "Agent parameters"), and the Hard-NO list
// (line 59-71). Where the ticket prose enumerates a count that diverges
// from the real AGENTS.md source, the source wins:
//
//  - The ticket's User section names "six Hard NOs". AGENTS.md's `## Hard NOs`
//    section actually has SEVEN bullets. We mirror all seven per the
//    2026-09-12 code-beats-prose rule. The deviation is documented in the
//    ticket Implementation log.
//
//  - The seventh bullet in AGENTS.md contains a literal em-dash character
//    ("Never exceed 2 heal: attempts on one PR - escalate via a human
//    comment.") - AGENTS.md is out-of-scope for this ticket (would create a
//    circular edit per the ticket 0077 precedent), so per the 2026-05-25
//    lesson we do punctuation repair on the mirror side (em-dash to hyphen).
//    The mirror is one-way; a follow-up ticket may wire a drift-guard.
//
// Every `sinceDate` cites a real anchor documented in `git log AGENTS.md` or
// `docs/LESSONS.md`. AGENTS.md first landed 2026-05-22 (commit f8ac986,
// "chore: stage the agent-fleet standard") and the `## Hard NOs` section
// has not been substantively re-scoped since; the shared anchor is
// 2026-05-22.
//
// Per the 2026-05-07 em-dash Hard NO every string in this module is
// hyphen-only; Self-Review greps the diff for U+2014 before pushing.
//
// Per the 2026-05-25 mirror-source rule the shape read by the TechArticle
// and BreadcrumbList JSON-LD blocks in `src/pages/HowWeShip.tsx` derives
// from this constant so a change to either surface is visible in one diff.

export type ShipLoopStageId = 'groom' | 'ship' | 'review' | 'auto-merge';

export interface ShipLoopStage {
  /** Stable id for the DOM key, the anchor deep-link, and the JSON-LD position. */
  id: ShipLoopStageId;
  /** Short stage name rendered as the card H2 and pinned to the AGENTS.md loop diagram. */
  name: string;
  /** One-sentence description derived from AGENTS.md, no invented process detail. */
  description: string;
  /** Cadence chip text pinned verbatim to the AGENTS.md loop diagram's parenthesized cadence line. */
  cadence: string;
  /** ISO YYYY-MM-DD - the most recent date this row was reviewed against AGENTS.md. */
  lastReviewed: string;
}

export interface HardNo {
  /** Stable id for the DOM key and any future anchor deep-link. */
  id: string;
  /** The Hard-NO bullet statement, mirrored from AGENTS.md with punctuation-only repair for em-dashes. */
  statement: string;
  /** ISO YYYY-MM-DD - the earliest anchor date this Hard-NO is documented at. */
  sinceDate: string;
}

// The first date all four stages were reviewed against AGENTS.md as it
// stands today. Every stage advances its own `lastReviewed` when a
// subsequent review confirms the AGENTS.md source is still current.
const LAST_REVIEWED = '2026-09-18';

// Shared anchor: AGENTS.md first landed 2026-05-22 in commit f8ac986
// ("chore: stage the agent-fleet standard"). The `## Hard NOs` section has
// not been substantively re-scoped since, so 2026-05-22 is the defensible
// in-effect-since date for every bullet. See `git log AGENTS.md` for
// audit.
const AGENTS_MD_SINCE = '2026-05-22';

export const SHIP_LOOP_STAGES: readonly ShipLoopStage[] = [
  {
    id: 'groom',
    name: 'Groom',
    description:
      'A groomer agent refreshes the docs/backlog/ ticket files daily. Each ticket file is the source of truth for its own status and the README index row is kept in sync by check-backlog.mjs.',
    cadence: 'daily',
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: 'ship',
    name: 'Ship',
    description:
      'An implementation-dev agent picks the highest-priority groomed ticket, ships the code and tests on a feat/ branch, opens a PR, and arms squash auto-merge.',
    cadence: 'hourly',
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: 'review',
    name: 'Review',
    description:
      'A review agent votes on every open PR against the AGENTS.md rules. A BLOCK vote blocks auto-merge until the ship agent replies with a fix; an approving vote clears the way.',
    cadence: 'every 15m',
    lastReviewed: LAST_REVIEWED,
  },
  {
    id: 'auto-merge',
    name: 'Auto-merge',
    description:
      'GitHub squash-merges the PR to main once the build and smoke-required gating checks are both green and no reviewer block sits on it. Vercel auto-deploys from main.',
    cadence: 'on green + no block',
    lastReviewed: LAST_REVIEWED,
  },
];

// Gate names pinned verbatim to AGENTS.md line 45-48 (`## Agent parameters`
// > `Gating checks`). Anything else in CI (Vercel preview, Lighthouse
// warnings) is informational and MUST be ignored per AGENTS.md.
export const SHIP_LOOP_GATES: readonly string[] = ['build', 'smoke-required'];

// Hard-NO statements pinned to AGENTS.md line 59-71 (`## Hard NOs`). Seven
// bullets, not the six the ticket prose enumerated - see this file's
// leading comment for the code-beats-prose rationale.
export const SHIP_LOOP_HARD_NOS: readonly HardNo[] = [
  {
    id: 'never-push-main',
    statement:
      'Never push to main; never bypass branch protection; never merge with a red gating check (build, smoke-required).',
    sinceDate: AGENTS_MD_SINCE,
  },
  {
    id: 'never-touch-no-touch-zones',
    statement:
      'Never touch /api/, .env*, or (GTM queue) package.json / package-lock.json. The eng queue MAY touch deps with a ticket line.',
    sinceDate: AGENTS_MD_SINCE,
  },
  {
    id: 'never-em-dash',
    statement:
      'Never write an em-dash (U+2014) into copy. Self-review greps the diff for it.',
    sinceDate: AGENTS_MD_SINCE,
  },
  {
    id: 'never-stale-blog-date',
    statement:
      'Never ship a blog post dated anything but today; never duplicate a date.',
    sinceDate: AGENTS_MD_SINCE,
  },
  {
    id: 'never-ship-without-dark-mode',
    statement: 'Never ship a component without dark: variants.',
    sinceDate: AGENTS_MD_SINCE,
  },
  {
    id: 'never-invent-social-proof',
    statement: 'Never invent testimonials, client names, or inflated numbers.',
    sinceDate: AGENTS_MD_SINCE,
  },
  {
    id: 'never-exceed-two-heal-attempts',
    statement:
      'Never exceed 2 heal: attempts on one PR - escalate via a human comment.',
    sinceDate: AGENTS_MD_SINCE,
  },
];
