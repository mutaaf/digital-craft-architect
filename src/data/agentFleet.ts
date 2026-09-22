// Ticket 0090 - canonical AI agent fleet row list. Read by
// `src/pages/AgentFleet.tsx` and by `tests/e2e/agent-fleet-page.spec.ts`
// per the 2026-06-07 src-imports-tests lesson so the visible row cards,
// the CollectionPage / ItemList JSON-LD, and the spec count assertion
// cannot drift.
//
// Per the 2026-09-12 code-beats-prose lesson, the row list is pinned to
// the agents ACTUALLY defined in `.claude/agents/` on branch head, not
// to the ticket's inline six-role enumeration. Grep documented in the
// Implementation log of `docs/backlog/0090-agent-fleet-transparency-page.md`:
//
//   .claude/agents/gtm-innovation.md      -> Groomer + blog author
//   .claude/agents/implementation-dev.md  -> Shipper on feat/ branches
//   .claude/agents/review.md              -> Reviewer, votes on every PR
//   .claude/agents/eng-dev.md             -> Engineer on eng/ branches
//   .claude/agents/validation.md          -> Base-vs-head regression prover
//
// The ticket's inline enumeration also named a "blog-innovation" agent
// and "heal" runners; neither is a distinct file in `.claude/agents/` on
// branch head. Blog authorship is one of the two jobs `gtm-innovation`
// owns per its own agent card ("Groom" + "Generate"), so blog work rolls
// into the `gtm-innovation` row's `intendedUse`. "Heal" is a run-mode
// bounded by the AGENTS.md Hard NO ("Never exceed 2 heal: attempts on
// one PR"), not a standalone agent; it is called out inside the shipper
// and reviewer guardrails.
//
// Every `sinceDate` cites the git log anchor when the agent's
// `.claude/agents/*.md` file first landed or was substantially defined
// on `main`. Adoption dates advance only on a real agent redefinition;
// `git blame .claude/agents/` is the audit path.
//
// Every `branchPrefix` is pinned verbatim to AGENTS.md line 48-50 (`##
// Agent parameters` > Agent branch prefixes) plus the review /
// validation runners which open no branch of their own.
//
// Every guardrail bullet is pinned to an AGENTS.md `## Hard NOs` line
// (line 59-71) or to the agent card's own "Hard NOs" section.
//
// Per the 2026-05-07 em-dash Hard NO every string in this module uses
// hyphens; Self-Review greps the diff for U+2014 before pushing.
//
// The mirror-source string constants (PAGE_H1, PAGE_URL, META_DESCRIPTION,
// COLLECTION_PAGE_NAME) live in this data module rather than in the page
// so that `tests/e2e/agent-fleet-page.spec.ts` can import them without
// pulling `react-helmet-async` into the Playwright test collector (which
// runs in Node ESM and cannot resolve the Helmet named export). The page
// re-imports and uses them verbatim; the mirror-source rule (2026-05-25)
// is preserved because there is still exactly one source of truth for
// each string across the Helmet meta tag, the visible render, and the
// JSON-LD blocks.

export const PAGE_H1 = 'Agent fleet';
export const PAGE_URL = 'https://digitalcraftai.com/agent-fleet';
export const COLLECTION_PAGE_NAME = 'Digital Craft AI Agent Fleet';
export const META_DESCRIPTION =
  'Dated list of every autonomous agent that runs on this codebase in production. One row per agent with its role, branch prefix, invocation cadence, intended use, and the guardrails that bound it. Forward the URL to your engineering lead or compliance reviewer as documentary evidence of the AI-labor inventory.';

export interface AgentFleetRow {
  /** Stable id for the DOM key AND for the CollectionPage ItemList
   *  fragment url (`https://digitalcraftai.com/agent-fleet#<id>`). */
  id: string;
  /** Agent name pinned to the `.claude/agents/<name>.md` file stem so
   *  a reader can `ls .claude/agents/` and match every row. */
  name: string;
  /** Short role label (groomer, shipper, reviewer, engineer, validator). */
  role: string;
  /** Exact branch prefix this agent opens PRs under, pinned to
   *  AGENTS.md line 48-50. Reviewer and validator open no branch of
   *  their own; those rows carry a "(no branch, votes / verdicts on
   *  open PRs)" chip. Rendered in a monospace pill. */
  branchPrefix: string;
  /** Invocation cadence chip text (hourly, every 15m, on-demand, etc.). */
  cadence: string;
  /** One-paragraph plain-language description of what this agent is
   *  called for on this codebase in production. */
  intendedUse: string;
  /** Two to four guardrail strings, each pinned to an AGENTS.md Hard NO
   *  line or the agent card's own hard-constraint section. Hyphen-only
   *  per the em-dash Hard NO. */
  guardrails: readonly string[];
  /** ISO YYYY-MM-DD - the date this agent's definition file first
   *  landed or was substantially defined on main. Advances only on a
   *  real agent redefinition. */
  sinceDate: string;
}

// AGENTS.md first landed 2026-05-22 (commit f8ac986). The four originally
// named subagents (implementation-dev, gtm-innovation, review, eng-dev)
// are traceable to that anchor per the AGENTS.md line 53-54 "Subagents"
// list. The validation runner's `.claude/agents/validation.md` file
// captures a lesson dated 2026-08-18, so the validation-agent anchor
// is 2026-08-18 (the earliest date the base-vs-head rule is referenced
// in the file itself).
const FLEET_STANDARD_SINCE = '2026-05-22';
const VALIDATION_AGENT_SINCE = '2026-08-18';

export const AGENT_FLEET_ROWS: readonly AgentFleetRow[] = [
  {
    id: 'gtm-innovation',
    name: 'gtm-innovation',
    role: 'Groomer and blog author',
    branchPrefix: 'chore/gtm-',
    cadence: 'daily (groom) + on-demand (blog)',
    intendedUse:
      'Turns conversion, SEO, and trust hypotheses into shippable backlog tickets under docs/backlog/, re-ranks priorities, and moves ready tickets from proposed to groomed. Also authors long-tail blog posts under src/data/blogPosts.ts dated to today, one post per run.',
    guardrails: [
      'Never touches src/, tests/, /api/, or package.json (writes specs and blog content only, never implementation code).',
      'Never invents testimonials, client names, or inflated numbers; claims stay defensible.',
      'Every blog post dates to today and never duplicates an existing date; check-blog-dates gates it.',
      'Every proposed ticket respects the AGENTS.md no-touch zones and the em-dash Hard NO.',
    ],
    sinceDate: FLEET_STANDARD_SINCE,
  },
  {
    id: 'implementation-dev',
    name: 'implementation-dev',
    role: 'Feature shipper',
    branchPrefix: 'feat/',
    cadence: 'hourly',
    intendedUse:
      'Picks the highest-priority groomed backlog ticket, ships the minimum code and tests on a feat/ branch, opens a PR against main, arms squash auto-merge, and watches the build and smoke-required gating checks turn green.',
    guardrails: [
      'Never pushes to main; never bypasses branch protection; never merges with a red gating check.',
      'Never touches /api/, .env*, package.json, or package-lock.json.',
      'Never writes an em-dash into copy; never ships a component without dark: variants.',
      'Never exceeds two heal: attempts on one PR (escalates via a human comment instead).',
    ],
    sinceDate: FLEET_STANDARD_SINCE,
  },
  {
    id: 'review',
    name: 'review',
    role: 'PR reviewer',
    branchPrefix: '(no branch, votes on open PRs)',
    cadence: 'every 15m',
    intendedUse:
      'Grades every open agent PR against AGENTS.md and the ticket it implements. Posts either a comment sign-off (auto-merge proceeds) or a request-changes vote (blocks merge). Runs read-only over the diff and cannot approve because it runs as the PR author.',
    guardrails: [
      'Never approves (cannot, runs as the PR author); only comments or requests changes.',
      'Never ignores an AGENTS.md Hard NO on a PR under review; that is an automatic request-changes.',
      'Never requests changes over Vercel preview or Lighthouse warnings; only build and smoke-required gate.',
      'Never merges the PR itself; GitHub auto-merge lands it on green plus no blocking review.',
    ],
    sinceDate: FLEET_STANDARD_SINCE,
  },
  {
    id: 'eng-dev',
    name: 'eng-dev',
    role: 'Engineering shipper',
    branchPrefix: 'eng/',
    cadence: 'every 6h',
    intendedUse:
      'Peer of implementation-dev for code-quality work only (type safety, performance, test infra, build health). Ships on an eng/ branch, proves the fix with a failing test or benchmark first, then makes the minimum change.',
    guardrails: [
      'Never changes user-facing copy or visuals; that is the feature loop, not the eng queue.',
      'Never touches /api/ or .env*. May touch package.json only with a ticket line authorizing it.',
      'Never weakens a check or pushes to main.',
      'Never exceeds two heal attempts on one PR (escalates via a human comment instead).',
    ],
    sinceDate: FLEET_STANDARD_SINCE,
  },
  {
    id: 'validation',
    name: 'validation',
    role: 'Regression prover',
    branchPrefix: '(no branch, verdicts on open PRs)',
    cadence: 'on-demand (before merging risky PRs)',
    intendedUse:
      'Proves a PR introduces no regression by measuring the built artifact and the running app on both base and head. Runs scripts/validate-pr.sh, interprets the deltas (entry chunk bytes, bundle size, e2e pass rate, sitemap URL count), and posts a NO REGRESSION, REGRESSION, or INCONCLUSIVE verdict.',
    guardrails: [
      'Never judges head alone; a failing test proves nothing until base has been measured identically.',
      'Never merges or pushes; only produces a verdict a human or the shipper acts on.',
      'Never invents a metric it did not measure (no estimated load times, no guessed Lighthouse scores).',
      'Never overstates coverage; a verdict states plainly what was NOT covered.',
    ],
    sinceDate: VALIDATION_AGENT_SINCE,
  },
];
