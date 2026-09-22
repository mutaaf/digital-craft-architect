---
id: 0090
title: Public /agent-fleet AI-labor transparency page listing every autonomous agent with dated intended-use, guardrails, and cadence rows as a defensible moat artifact
status: shipped
priority: P1
area: trust
created: 2026-09-22
owner: gtm-innovation
---

## User story

As a technically-skeptical buyer or
engineering-lead evaluator asking
"which AI agents actually touch this
codebase and what are they allowed
to do?" (a construction GC's in-
house engineer who read
`/how-we-ship` and now wants to know
the specific agent inventory behind
the ship loop, a real-estate
operations lead who wants to attach
one URL to a vendor-risk
questionnaire listing every
autonomous actor that can commit
code, a property-management CTO
comparing Digital Craft against an
incumbent CRM's "AI roadmap" slide
and needing documentary evidence
that our AI labor is inventoried and
bounded, a hospitality group's
compliance reviewer who wants to
know whether an agent can touch
`/api/`, `.env`, or
`package.json`), or arriving from
the sibling `/how-we-ship`,
`/security`, `/model-card`, or
`/subprocessors` pages, I want one
honest public page at `/agent-fleet`
that lists every autonomous agent
Digital Craft runs on this
codebase today (the gtm-innovation
groomer, the implementation-dev
ship agent, the review agent, the
eng-dev agent, the blog-innovation
agent, the validation and heal
runners) with a dated row per agent
naming its role, its invocation
cadence, its permitted branch
prefix, the explicit guardrails
that bound it (its no-touch zones
per AGENTS.md), and the "since"
date the agent was added to the
fleet, so that I can forward the
URL to my engineering lead, my
compliance reviewer, or my
insurance carrier as documentary
evidence of the exact AI-labor
inventory behind the ship velocity.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of
value: the site already ships two
process-transparency surfaces about
the autonomous ship system (ticket
0059 `/playbook` describing the
deployment methodology as HowTo,
ticket 0083 `/how-we-ship`
describing the four-stage ship loop
as TechArticle) but NEITHER
articulates WHICH specific agents
exist, WHAT branch prefix each one
is allowed to open a PR under, and
WHAT no-touch zone each one is
bound by. Today a buyer who reads
`/how-we-ship` sees the four
stages (groom, ship, review, auto-
merge) as ROLES but cannot see the
agent inventory as ENTITIES. The
distinction matters: a compliance
reviewer asks "which agent can
commit to main?" and the answer
today is scattered across
AGENTS.md ("Agent branch prefixes"
line), `.claude/agents/` directory
listing, and the ship-loop
diagram. This ticket adds ONE new
public page at `/agent-fleet`
sourced from a new typed data
constant `src/data/agentFleet.ts`
(an `AgentFleetRow[]` array with
5 to 8 dated agent rows, each
carrying `id`, `name`, `role`,
`branchPrefix`, `cadence`,
`intendedUse`, `guardrails` (a
short string array of 2 to 4
items), `sinceDate`). The page
renders each row as one bordered
card in a single-column layout,
mirrors the visual shape of
`src/pages/ModelCard.tsx` (ticket
0088) and `src/pages/HowWeShip.tsx`
(ticket 0083), and emits one new
`CollectionPage` plus one new
`BreadcrumbList` JSON-LD block
scoped to the new URL. Zero new
backend, zero new dependency, zero
new persistent store, zero visible
change to any existing page beyond
ONE new sibling-link chip on
`/how-we-ship` and ONE new
sibling-link chip on `/model-card`
cross-linking to `/agent-fleet`.
One new page file, one new data
file, one new spec file, one new
entry in `ROUTES`, one new route
in `src/App.tsx`, one new link
chip on `HowWeShip.tsx`, one new
link chip on `ModelCard.tsx`.

### Stakeholder

This widens the moat in the trust-
artifact dimension along an axis
the sibling process pages
structurally cannot capture: AI-
LABOR INVENTORY as a competitive
moat. Ticket 0083 documented the
process (four stages, two gates,
seven Hard NOs); this ticket
documents the AGENTS themselves.
A competitor imitating this must
first (a) build an equivalent
autonomous fleet with named
agents, (b) publish each agent's
branch-prefix contract, (c)
publish each agent's dated no-
touch zones, (d) accept the
public commitment to those
guardrails. That quartet is
structurally harder to fake than
a copy-edit of a "we use AI"
marketing chip. The page also
converts a scattered set of
AGENTS.md and `.claude/agents/`
references into a canonical,
indexable, forwardable public
URL, exactly the artifact a
compliance reviewer or E&O
carrier attaches to a vendor-
risk questionnaire ("which
autonomous actors can touch this
vendor's production code?"). Per
the ticket 0088 model-card
precedent, the emission is a
`CollectionPage` plus
`ItemList` with `sinceDate` per
row so each agent's introduction
date is publicly auditable and
`git blame`-able. Per the
2026-09-12 code-beats-prose
lesson, the agent list here is
groomer prose from the
AGENTS.md "Subagents" line
(`implementation-dev`,
`gtm-innovation`, `review`,
`eng-dev`) and the AGENTS.md
"Agent branch prefixes" line
(`feat/`, `chore/gtm-`, `eng/`);
the implementer greps
`AGENTS.md`, the
`.claude/agents/` directory, and
every branch-prefix reference in
`AGENTS.md` and `docs/LESSONS.md`
BEFORE writing the data file and
pins the row list to the actual
agents named on branch head, not
this ticket's inline enumeration.
If the fleet has added, renamed,
or removed an agent between
2026-09-22 and the implementation
start, the implementer notes the
deviation in the Implementation
log with the file:line of the
real source.

### User (in the real moment of use)

A property-management firm's IT-
security reviewer opens
`/how-we-ship` Tuesday morning
after their engineering lead
forwarded the URL Monday evening
saying "read this before we book
the pilot." They see the existing
sibling-link chips linking to
`/changelog`, `/changelog/rss.xml`,
`/changelog.json`, and (new)
`/agent-fleet`. They tap
`/agent-fleet` on their laptop;
the page loads in under one
screen with a hero H1 ("Agent
fleet"), a short introduction
naming the intent (one dated row
per autonomous agent that runs
on this codebase today), and a
single-column card grid where
each card shows the agent name,
its role (groomer, shipper,
reviewer, engineer, blogger,
validator), its branch prefix
(the exact `feat/`, `chore/gtm-`,
`eng/` string it opens PRs
under), its invocation cadence
(hourly, every 15 minutes, on-
demand), a bulleted list of
guardrails (its explicit no-
touch zones and Hard NOs from
AGENTS.md), and the "since"
date. They scan the six rows in
50 seconds, note that every row
carries the exact branch-prefix
contract and the exact no-touch-
zone list, copy the page URL,
paste it into their vendor-risk
questionnaire attachment, and
forward. On a 375px mobile
viewport the cards stack
vertically; light and dark mode
both render cleanly. No CTA, no
email capture, no strategy-call
chip; the CTA is the URL itself
per the ticket 0088 model-card
precedent.

### Growth

The "show me" moment is the URL
an engineering-lead buyer pastes
into a Slack DM to their CTO:
one page, five-to-eight dated
agent rows, each with an
explicit branch prefix and an
explicit guardrail list. That
is the single strongest AI-labor
transparency signal the site
can produce because it converts
a scattered set of AGENTS.md
references and `.claude/agents/`
files into a canonical
indexable public URL, and
because peer AI-services
vendors almost never publish an
agent inventory at all (most
publish neither the agent
names nor their branch-prefix
contracts). Per the ticket 0069
subprocessors and ticket 0081
security precedents, a buyer
who forwards `/agent-fleet` to
their engineering lead or
compliance reviewer is the
highest-intent prospect the
trust funnel can produce
because they are asking the
specific question ("which
autonomous actors can commit to
this vendor's code?") that
only ships when they are
inside a real vendor-selection
process.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new typed data module at `src/data/agentFleet.ts` (new file, under 200 lines) exports (a) an `AgentFleetRow` interface with the shape `{ id: string; name: string; role: string; branchPrefix: string; cadence: string; intendedUse: string; guardrails: readonly string[]; sinceDate: string /* YYYY-MM-DD */ }`, (b) an `AGENT_FLEET_ROWS: readonly AgentFleetRow[]` constant with 5 to 8 rows enumerating the autonomous agents that run on this codebase in production. Per the 2026-09-12 code-beats-prose lesson, BEFORE writing this file the implementer greps `AGENTS.md` (both the "Subagents" line at AGENTS.md:53-54 naming `implementation-dev`, `gtm-innovation`, `review`, `eng-dev`, and the "Agent branch prefixes" line at AGENTS.md:48-50 naming `feat/`, `chore/gtm-`, `eng/`), the `.claude/agents/` directory listing, every branch-prefix reference in `docs/LESSONS.md`, and the `git log --format='%s'` output for the most recent 100 commits on `main` to pin the row list to the agents ACTUALLY running on branch head. If the fleet has added, renamed, or removed an agent since 2026-09-22 (the blog-innovation runner shipped tickets like BLOG-POST that appear in `git log`; the review runner votes every 15 minutes; the ship, groom, eng, review, and heal runners all appear in the fleet-standard prompts referenced in AGENTS.md), the row list pins to the code's actual inventory and the deviation is noted in the Implementation log. Every row carries a `sinceDate` in `YYYY-MM-DD` form no later than today; every `sinceDate` cites a real anchor date documented in `docs/LESSONS.md` or the `git log` of AGENTS.md. NO fabricated dates. Every string in every row is hyphen-only per the 2026-05-07 em-dash Hard NO.
- [ ] A new page at `src/pages/AgentFleet.tsx` (new file, under 220 lines) renders at `/agent-fleet` modeled 1:1 on `src/pages/ModelCard.tsx` (ticket 0088, the direct peer for a trust-family public page backed by a `src/data/` typed constant emitting `CollectionPage` plus `BreadcrumbList` JSON-LD). The page has: (a) a hero H1 "Agent fleet" with a short intro paragraph naming the intent (one dated row per autonomous agent that runs on this codebase today, so a compliance reviewer, engineering lead, or insurance carrier can forward the URL as documentary evidence), (b) a single-column grid of one bordered card per `AGENT_FLEET_ROWS` entry showing the agent `name` as an H2, the `role` below, a `branchPrefix` chip in monospace styling, a `cadence` chip, the `intendedUse` paragraph, a bulleted list of `guardrails`, and the `sinceDate` chip, (c) a "Sibling trust surfaces" strip cross-linking to `/how-we-ship`, `/model-card`, `/subprocessors`, `/security`, `/ethics`, `/uptime`, `/playbook`, `/trust` reusing the ticket 0088 sibling-link pattern, (d) NO strategy-call CTA and NO email-capture form (the page is intentionally passive per the ticket 0077 ethics-page and ticket 0088 model-card precedents; the CTA is the URL itself). Every rendered string is hyphen-only. Per the 2026-05-25 mirror-source rule `META_DESCRIPTION`, `PAGE_H1`, `PAGE_URL`, and `COLLECTION_PAGE_NAME` are single module-level constants read by the Helmet meta tag, the render, AND the JSON-LD blocks so they cannot drift.
- [ ] The page emits TWO JSON-LD blocks inside its `<Helmet>` head: (1) a `CollectionPage` block with `name` equal to `COLLECTION_PAGE_NAME`, `description` equal to `META_DESCRIPTION`, `url: 'https://digitalcraftai.com/agent-fleet'`, `isPartOf: { '@type': 'WebSite', url: 'https://digitalcraftai.com' }`, and a `mainEntity` field of type `ItemList` whose `numberOfItems` equals `AGENT_FLEET_ROWS.length` and whose `itemListElement` array enumerates one `ListItem` per row with `name` equal to `${name} agent` and `url` equal to `https://digitalcraftai.com/agent-fleet#${id}` (each row card carries a matching `id` attribute so the fragment link resolves in-page); (2) a `BreadcrumbList` block with two `itemListElement` entries whose names are "Home" and "Agent fleet". Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'` AND `=== 'BreadcrumbList'` predicates AND any `toHaveLength(1)` / "exactly one" assertions over those types; the existing `CollectionPage` predecessors (ticket 0048 `/compare` hub, ticket 0057 `/case-studies` hub, ticket 0069 `/subprocessors`, ticket 0071 `/ai-for-hospitality`, ticket 0079 `/blog`, ticket 0081 `/security`, ticket 0088 `/model-card`) are each URL-scoped so a sibling `/agent-fleet`-scoped pair cannot collide. The grep result is documented in the Implementation log.
- [ ] The new route is registered in `src/App.tsx` next to the existing `/how-we-ship` route, imported through the existing `React.lazy` pattern all other trust pages use per the 2026-09-05 route-code-splitting lesson, wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell. The implementer adds `/agent-fleet` to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson (alphabetical position between `/` and `/blog` in the trust-family cluster, matching the file's existing ordering convention); `tests/e2e/routes.ts` re-exports it automatically. The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically; the implementer confirms auto-inclusion by grepping `dist/sitemap.xml` for `/agent-fleet` after a local build.
- [ ] `src/pages/HowWeShip.tsx` gains ONE additive edit: a new sibling-link chip pointing at `/agent-fleet` next to the existing "See it for yourself" chips (or in the closing sibling-link strip if one exists). `src/pages/ModelCard.tsx` gains ONE additive edit: a new sibling-link chip pointing at `/agent-fleet` next to the existing sibling-trust-surface strip. The mirror-source rule protects the existing chip labels on both pages; the additive edits add ONE new chip each with the label "Agent fleet." No reordering of existing chips, no visible-text changes to any existing chip on either page.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text, in `AGENT_FLEET_ROWS`, or in any JSON-LD serialized string. Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the em-dash check in the new spec scopes ONLY to the two blocks THIS page emits (`CollectionPage`, `BreadcrumbList`) filtered by their `@type`, NOT to every `application/ld+json` block on the page. The homepage Organization block from `index.html` carries a legitimate em-dash and must not be flagged by the `/agent-fleet` spec.
- [ ] A new e2e spec at `tests/e2e/agent-fleet-page.spec.ts` (modeled on `tests/e2e/model-card-page.spec.ts` from ticket 0088) asserts, using a `gotoAgentFleet(page)` helper that waits for RouteFallback detach AND the H1 to be visible before reading page state (2026-09-05 + 2026-09-10 lessons): (1) `GET /agent-fleet` returns 200 and the H1 contains "Agent fleet" (case-insensitive), (2) the `meta[name="description"]` content (LAST occurrence per the 2026-05-25 Helmet-appends lesson) byte-matches the `META_DESCRIPTION` constant imported from `src/pages/AgentFleet.tsx` per the 2026-05-25 mirror-source rule, (3) the visible card count on the page equals `AGENT_FLEET_ROWS.length` (imported from `src/data/agentFleet.ts` per the 2026-06-07 src-imports-tests lesson), asserted via `data-testid="agent-fleet-row"` count, (4) each visible row card displays its `name`, `role`, `branchPrefix`, `cadence`, at least one `guardrails` bullet, and a `sinceDate` chip whose text matches the row's `sinceDate` value byte-for-byte, (5) the `CollectionPage` JSON-LD block's `mainEntity.itemListElement` array length equals `AGENT_FLEET_ROWS.length` and every `ListItem.url` matches `/^https:\/\/digitalcraftai\.com\/agent-fleet#[a-z0-9-]+$/`, (6) the `BreadcrumbList` JSON-LD has two `itemListElement` entries whose names are "Home" and "Agent fleet" and whose URLs are `https://digitalcraftai.com/` and `https://digitalcraftai.com/agent-fleet`, (7) every string in the two THIS-PAGE JSON-LD blocks (filtered by `@type` per the 2026-09-08 lesson) contains zero `String.fromCharCode(8212)` code points; the homepage Organization block from `index.html` is deliberately excluded from the filter, (8) the page renders cleanly in both light and dark mode via the `document.documentElement.classList.add('dark')` toggle pattern from ticket 0088's spec, (9) sibling-page-regression case A: navigate to `/how-we-ship`, assert the new `/agent-fleet` chip is present in the sibling-link strip and resolves to `/agent-fleet` in the `ROUTES` allow-list, and assert the three existing "See it for yourself" chips (`/changelog`, `/changelog/rss.xml`, `/changelog.json`) are still present with unchanged text per the 2026-05-30 second-@type / mirror-source additive-only guard, (10) sibling-page-regression case B: navigate to `/model-card`, assert the new `/agent-fleet` chip is present in the sibling-trust-surface strip and resolves to `/agent-fleet`, and assert the ticket 0088 sibling chips are still present with unchanged text, (11) per the 2026-09-08 sibling-hub-poll lesson the JSON-LD read helper polls `page.locator('script[type="application/ld+json"]').evaluateAll` until at least one block's `@type` equals `'CollectionPage'` BEFORE reading and filtering blocks (do NOT reuse a `count > 0` poll that fires before the Helmet head swap finishes).
- [ ] Standard box: no `/api/` change, no new hostname (all links on the page are same-origin), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any of the existing trust pages (`Trust.tsx`, `Uptime.tsx`, `Ethics.tsx`, `Subprocessors.tsx`, `Security.tsx`, `Playbook.tsx`, `HowWeShip.tsx`, `ModelCard.tsx`) beyond the two additive one-chip edits on `HowWeShip.tsx` and `ModelCard.tsx`. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; every pre-existing trust-page spec (`trust-page.spec.ts`, `trust-aboutpage-jsonld.spec.ts`, `subprocessors.spec.ts`, `security-posture-page.spec.ts`, `ethics-page.spec.ts`, `uptime-*.spec.ts`, `playbook-*.spec.ts`, `how-we-ship-*.spec.ts`, `model-card-page.spec.ts`) stays green because the chips added on `HowWeShip.tsx` and `ModelCard.tsx` are purely additive sibling elements.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- No `/api/` changes, no
  `package.json` changes, no em-
  dashes in copy, dark-mode
  required (this ticket ships
  one new page plus one new
  data file plus one new route
  plus one new spec plus two
  JSON-LD blocks plus two
  additive chips on
  `HowWeShip.tsx` and
  `ModelCard.tsx`).
- A per-agent bio card listing
  the exact model that powers
  each agent (Claude Opus 4.7,
  GPT-4o, etc.). Model
  provenance already lives at
  `/model-card` (ticket 0088);
  duplicating the model-per-
  agent mapping here would
  drift on a model swap and
  overload the artifact's
  scope. Each agent row names
  the AGENT (its role and
  guardrails), not the model
  it invokes.
- A per-agent "recent commits"
  live-render pulling from
  `git log`. Live re-render
  adds a fetch cycle and error
  path that the documentary
  intent does not require; the
  `sinceDate` per agent is a
  manual chart, not a live
  metric. A "recent commits by
  agent" surface is its own
  follow-up ticket if
  telemetry justifies it.
- A per-agent runbook or
  invocation-command reference.
  The internal fleet-standard
  runners at
  `~/.cache/agent-fleet/` and
  the `.claude/agents/`
  directory contain the
  invocation logic; publishing
  the exact prompt or
  invocation command is its
  own follow-up ticket
  (parallel to the "sanitized
  production prompts" idea)
  and is not scoped here.
- Editing AGENTS.md. The page
  mirrors AGENTS.md one-way;
  a reverse edit would create
  a circular dependency per
  the ticket 0077 `/ethics`
  and ticket 0083
  `/how-we-ship` out-of-scope
  precedents.
- A build-time guard that
  greps AGENTS.md and fails
  the build if the page's
  mirrored strings drift.
  A drift-guard is its own
  eng-queue follow-up ticket
  (parallel to the ticket
  0022 sitemap-generator
  guard pattern and the
  ticket 0083 out-of-scope
  drift-guard note).
- A live "current agent
  status" indicator ("ship
  agent is currently running,
  last ran 4 minutes ago").
  Live status belongs on
  `/uptime` (ticket 0036);
  this page is a documentary
  description of the agent
  inventory, not a live-
  metrics surface.
- Emitting a
  `SoftwareApplication` or
  `Product` JSON-LD block for
  each agent. Neither `@type`
  fits an internal
  autonomous agent;
  `CollectionPage` plus
  `ItemList` mirrors the
  ticket 0088 model-card
  precedent.
- A comparative table (Digital
  Craft vs another AI-vendor
  fleet). Comparative
  rankings are competitor-
  loaded and non-defensible;
  the page names OUR fleet
  without asserting our
  agents are superior.
- Cross-promoting
  `/agent-fleet` from the
  homepage hero, the navbar,
  the footer, or any demo
  page. Cross-surface
  promotion is its own
  follow-up ticket once
  telemetry shows the page
  earns organic traffic. The
  TWO additive chips (on
  `HowWeShip.tsx` and
  `ModelCard.tsx`) are the
  only cross-links in scope.
- A per-agent efficacy claim
  ("gtm-innovation grooms 95%
  of tickets accurately").
  Efficacy claims are non-
  defensible per the
  AGENTS.md rule and are
  exactly the vendor-loaded
  language the page is built
  to displace.
- Adding `/agent-fleet` to
  the `index.html` SEO Pilot
  `pages` table. That is
  its own SEO-hygiene ticket
  and applies uniformly to
  every trust-family route
  per the 2026-05-25 SEO
  Pilot lesson.
- A blog post about "our
  agent fleet." Blog content
  ships through the
  `src/data/blogPosts.ts`
  pipeline and is gated by
  `check-blog-dates`; cross-
  promotion is its own
  content ticket.
- A downloadable PDF or
  JSON export of the agent
  fleet. The page is a
  static public URL; a
  machine-readable export
  is its own follow-up
  ticket (parallel to the
  ticket 0082 evaluation-
  dossier export pattern).
- Adding a "request a new
  agent" or "flag an agent
  change" form on the page.
  Buyer-side feedback is
  handled through the
  existing strategy-call
  path; a page-scoped form
  fragments the funnel.
- Adding an "agent I built"
  or "agent we license"
  commercial offer. The
  page is a documentary
  artifact; commercial
  offers are their own
  follow-up ticket.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/data/agentFleet.ts`
  (under 200 lines). Export
  `AgentFleetRow` interface
  and `AGENT_FLEET_ROWS`
  constant. Mirror the shape
  of `src/data/modelCard.ts`
  (ticket 0088) and
  `src/data/shipLoopStages.ts`
  (ticket 0083) for the
  file's export pattern and
  TypeScript interface style.
  Per the 2026-09-12 code-
  beats-prose lesson, BEFORE
  writing this file grep
  `AGENTS.md`, the
  `.claude/agents/` directory
  listing, `docs/LESSONS.md`
  for every branch-prefix
  reference, and
  `git log --format='%s' -n 100`
  for the branch prefixes
  ACTUALLY landing on branch
  head. Pin every row's
  `name`, `branchPrefix`,
  `cadence`, and `guardrails`
  strings to the AGENTS.md
  source verbatim; if a
  branch-prefix or Hard NO
  bullet has been added,
  renamed, or removed between
  2026-09-22 and the
  implementation start, note
  the deviation in the
  Implementation log with
  the file:line of the real
  source.
- New `src/pages/AgentFleet.tsx`
  (under 220 lines). Copy
  `src/pages/ModelCard.tsx`
  (ticket 0088, the direct
  peer for a trust-family
  public page backed by a
  `src/data/` typed constant
  emitting `CollectionPage`
  plus `BreadcrumbList`) end-
  to-end as the starting
  frame, then swap every
  "Model card" / "vendor
  policy" string for the
  agent-fleet equivalent.
  Keep the same module-level
  mirror-source constants:
  `PAGE_H1`, `PAGE_URL`,
  `META_DESCRIPTION`,
  `COLLECTION_PAGE_NAME`,
  `BREADCRUMB_SCHEMA`,
  `COLLECTION_PAGE_SCHEMA`
  (per the 2026-05-25
  mirror-source rule the
  description used in the
  Helmet meta tag AND the
  `CollectionPage` JSON-LD
  description MUST read from
  the same
  `META_DESCRIPTION`
  constant). Each row card
  carries a matching `id`
  attribute so the fragment
  URL emitted in the
  `ItemList.itemListElement`
  entries resolves in-page.
  Render the `branchPrefix`
  in a monospace-styled
  chip (Tailwind `font-mono`
  plus a bordered pill
  class) so the exact prefix
  string is visually
  distinct from the
  descriptive text.
- `src/App.tsx` - add
  `<Route path="/agent-fleet" element={<AgentFleet />} />`
  next to the existing
  `/how-we-ship` route,
  wrapped in the existing
  `<Suspense fallback={<RouteFallback />}>`
  shell and lazy-imported
  via
  `React.lazy(() => import('./pages/AgentFleet'))`
  per the 2026-09-05 route-
  code-splitting lesson.
- `src/data/routes.ts` -
  add `/agent-fleet` to
  the `ROUTES` array in
  the alphabetical trust-
  family cluster per the
  file's ordering
  convention.
- `src/pages/HowWeShip.tsx`
  - ONE additive edit:
  append a new chip
  pointing at
  `/agent-fleet` in the
  existing "See it for
  yourself" strip or the
  closing sibling-link
  row. `src/pages/ModelCard.tsx`
  - ONE additive edit:
  append a new chip
  pointing at
  `/agent-fleet` in the
  existing sibling-trust-
  surface strip. No
  reordering of existing
  chips, no visible-text
  changes to any existing
  chip on either page.
- Per the 2026-05-30
  second-@type lesson,
  BEFORE writing code grep
  every
  `tests/e2e/*-jsonld.spec.ts`
  for `=== 'CollectionPage'`
  AND `=== 'BreadcrumbList'`
  predicates AND any
  `toHaveLength(1)` /
  "exactly one" assertions
  over those types.
  Predecessor
  CollectionPage candidates
  as of 2026-09-22: ticket
  0048 `/compare` hub,
  ticket 0057 `/case-studies`
  hub, ticket 0069
  `/subprocessors`, ticket
  0071 `/ai-for-hospitality`,
  ticket 0079 `/blog`,
  ticket 0081 `/security`,
  ticket 0088 `/model-card`.
  Each predecessor spec is
  URL-scoped to its own
  page so the sibling on
  `/agent-fleet` cannot
  collide. The grep result
  is documented in the
  Implementation log.
- Per the 2026-09-08 em-
  dash-JSON-LD-block-
  filter lesson, the em-
  dash check in the spec
  scopes ONLY to the two
  blocks THIS page emits
  (`CollectionPage`,
  `BreadcrumbList`)
  filtered by their
  `@type`, NOT to every
  `application/ld+json`
  block on the page. The
  homepage Organization
  block from `index.html`
  carries a legitimate
  em-dash and must not be
  flagged by the
  /agent-fleet spec.
- Per the 2026-09-08
  sibling-hub-poll
  lesson, the spec's
  JSON-LD read helper
  polls
  `page.locator('script[type="application/ld+json"]').evaluateAll`
  until at least one
  block's `@type` equals
  `'CollectionPage'`
  BEFORE reading and
  filtering blocks. Do
  NOT reuse a `count > 0`
  poll.
- Per the 2026-05-25 SEO
  Pilot lesson,
  `/agent-fleet` is NOT
  in the `index.html` SEO
  Pilot pages table; the
  new spec asserts the
  Helmet-managed
  `meta[name="description"]`
  content directly (LAST
  `meta[name="description"]`
  per the 2026-05-25
  Helmet-appends lesson),
  NOT `page.toHaveTitle()`.
- Per the 2026-09-12
  code-beats-prose
  lesson, if the agent
  list in
  `AGENT_FLEET_ROWS`
  deviates from this
  ticket's inline list
  (because the fleet has
  added, renamed, or
  removed an agent since
  2026-09-22), the
  implementer pins the
  row list to the actual
  agents on branch head
  and notes the
  deviation in the
  Implementation log
  with the file:line of
  the real source.
- Per the 2026-05-07
  em-dash Hard NO, every
  string in every
  touched file is
  hyphen-only. Self-
  Review greps the diff
  for
  `String.fromCharCode(8212)`
  before pushing.
- Per the 2026-09-05
  route-fallback and
  2026-09-10 mount-
  signal lessons, the
  new spec's
  `gotoAgentFleet`
  helper waits for
  RouteFallback detach
  AND the H1 to be
  visible before reading
  page state. The
  sibling-page-regression
  cases that navigate to
  `/how-we-ship` and
  `/model-card` also use
  RouteFallback-aware
  goto helpers.
- Per the 2026-05-22
  two-PR ship lesson,
  ship will need a
  follow-up
  `chore/0090-ship-status`
  PR after the feat PR
  merges to flip the
  ticket frontmatter AND
  its
  `docs/backlog/README.md`
  index row to `shipped`
  together; run
  `node scripts/check-backlog.mjs`
  before pushing the
  second PR so the file
  and index never drift
  mid-flip.
- New deps: NO. The page
  reuses `react-router-dom`,
  `react-helmet-async`,
  `lucide-react`, the
  existing Navbar /
  Footer / ScrollProgress
  components, the
  existing `trackCTAClick`
  helper, and the
  existing `useContent`
  hook. Schema migration:
  no. Privacy / security
  surface change: NO -
  the page is a passive
  read-only surface with
  no persistent store,
  no network call to any
  new hostname, no
  visitor input capture.
  Every string is either
  mirrored from AGENTS.md
  verbatim OR derivable
  from public
  `/changelog` data.

## Implementation log

(Appended by the implementation-dev agent during execution.)

### 2026-09-22 - implementation-dev picked up ticket 0090

Branched `feat/0090-agent-fleet-page` off `origin/main` (6ed3059 - `chore(0089): flip status to shipped`). First commit flips this ticket's frontmatter `status: groomed` -> `status: in-progress` together with the docs/backlog/README.md index row so `node scripts/check-backlog.mjs` stays green through the run.

#### Agent inventory pin (2026-09-12 code-beats-prose lesson)

The ticket's inline enumeration (User section) names six roles: "the gtm-innovation groomer, the implementation-dev ship agent, the review agent, the eng-dev agent, the blog-innovation agent, the validation and heal runners." Grep of the real inventory on branch head:

- `ls .claude/agents/` -> `eng-dev.md gtm-innovation.md implementation-dev.md review.md validation.md` (five agent definition files).
- `AGENTS.md:53-54` names `implementation-dev`, `gtm-innovation`, `review`, `eng-dev` under "Subagents". `validation` is a fifth subagent defined only in `.claude/agents/validation.md` and not enumerated in AGENTS.md line 53-54.
- `AGENTS.md:48-50` names the branch prefixes: `feat/` (features, ship), `chore/gtm-` (backlog refresh, groom), `eng/` (engineering). The `chore/<id>-ship-status` and `chore/<id>` flip commits are opened by the same `implementation-dev` shipper as a second PR per the 2026-05-22 two-PR lesson.
- `git log --format='%s' -n 30 origin/main` shows `feat(N)`, `chore(N): flip status to shipped`, `GTM: backlog update YYYY-MM-DD`, and `gtm(BLOG-POST): Add <slug>` prefixes on branch head. The `gtm(BLOG-POST)` prefix is emitted by the same `gtm-innovation` agent when it grooms content (blog authorship is one of its two jobs per `.claude/agents/gtm-innovation.md`).
- There is NO `.claude/agents/blog-innovation.md` file, and NO `heal` agent file. The "heal" mode is a run-mode of the existing shipper/groomer/eng runners bounded by AGENTS.md's "Never exceed 2 heal: attempts on one PR" Hard NO, not a distinct agent. The "blog-innovation" role in the ticket's inline enumeration is a subset of the `gtm-innovation` agent's remit today.

Per the 2026-09-12 code-beats-prose rule, `AGENT_FLEET_ROWS` pins to the five agents actually defined in `.claude/agents/` on branch head: `gtm-innovation`, `implementation-dev`, `review`, `eng-dev`, `validation`. Five rows satisfies the ticket's "5 to 8 rows" acceptance bound. The deviation from the ticket's inline six-role enumeration is documented here.

#### JSON-LD predecessor grep (2026-05-30 second-@type lesson)

Grepped every `tests/e2e/*.spec.ts` for `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates, and any `toHaveLength(1)` / "exactly one" / `toHaveCount(1)` assertions over those `@type`s. Findings:

- `CollectionPage` type-guards live in: `compare-hub.spec.ts:106`, `case-studies-hub.spec.ts:111`, `case-studies-rss-feed.spec.ts:288`, `subprocessors.spec.ts:112`, `security-posture-page.spec.ts:77`, `ai-for-hospitality.spec.ts:146`, `compare-kvcore.spec.ts:118`, `blog-collectionpage-jsonld.spec.ts:190`, `model-card-page.spec.ts:85`. Every predecessor navigates first to its own URL (`/compare`, `/case-studies`, `/subprocessors`, `/security`, `/ai-for-hospitality`, `/compare/kvcore`, `/blog`, `/model-card`) via a dedicated goto helper, so the "exactly one CollectionPage" assertion each spec makes is scoped to that URL's rendered head. A sibling `/agent-fleet`-scoped CollectionPage cannot collide with any of them.
- `BreadcrumbList` type-guards are used throughout the trust family (`ethics-page.spec.ts`, `subprocessors.spec.ts`, `security-posture-page.spec.ts`, `model-card-page.spec.ts`, `how-we-ship.spec.ts`, `playbook.spec.ts`, `trust-aboutpage-jsonld.spec.ts`, `changelog-itemlist-jsonld.spec.ts`, `glossary-breadcrumb-jsonld.spec.ts`, `quiz-jsonld.spec.ts`, `texas-localbusiness-jsonld.spec.ts`, etc.). Every predecessor "exactly one BreadcrumbList" assertion is URL-scoped by its own goto helper. A sibling `/agent-fleet`-scoped BreadcrumbList cannot collide.

Grep result documented per the 2026-05-30 rule.

#### Additive-edit budget for the two cross-link chips

- `src/pages/HowWeShip.tsx` Box 9 asserts `page.locator('[data-testid="ship-loop-evidence-chip"]').toHaveCount(3)`. Appending a fourth chip to `EVIDENCE_CHIPS` would red-flag that box. Per the ticket's "existing 'See it for yourself' strip or the closing sibling-link row" clause, the additive edit adds a NEW closing sibling-link section (single chip pointing at `/agent-fleet`, own `data-testid`), leaving `EVIDENCE_CHIPS` at three unchanged entries.
- `src/pages/ModelCard.tsx` has no sibling-chip count assertion (`tests/e2e/model-card-page.spec.ts` iterates only individual `data-testid="model-card-sibling-*"` locators). Appending "Agent fleet" as an 8th entry to `SIBLING_CHIPS` is safe and does not reorder or edit any existing chip.
