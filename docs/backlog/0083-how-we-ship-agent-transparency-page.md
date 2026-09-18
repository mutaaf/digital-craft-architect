---
id: 0083
title: Public /how-we-ship transparency page describing the autonomous-agent ship loop as a defensible moat artifact
status: groomed
priority: P1
area: trust
created: 2026-09-18
owner: gtm-innovation
---

## User story

As a technically-skeptical buyer evaluating whether
Digital Craft can actually deliver on the AI-
automation promise it markets (a construction GC's
in-house engineer who has watched three prior AI
vendors miss ship dates, a real-estate operations
lead who wants to see actual ship cadence before
booking a call, a property-management CTO comparing
Digital Craft against an incumbent CRM's "AI
roadmap" slide, a hospitality group's engineering
director who wants documentary evidence the vendor
is not just a landing-page shell), and as a
recruiter or partner exploring how the site itself
is built, I want one honest public page at
`/how-we-ship` that describes the autonomous-agent
ship loop the site runs on today (groom -> ship ->
review -> auto-merge -> auto-deploy every hour), the
dated hard-gates every PR must pass (`build`,
`smoke-required`), the dated Hard NOs the agents
enforce (no em-dash, no fake testimonials, dark mode
required, no /api/ edits from the GTM queue), and
the live evidence links (public `/changelog`, public
`/changelog/rss.xml`, public `/changelog.json`) that
prove the cadence is real, so that I can verify the
ship cadence for myself in one tab before booking a
strategy call, and so that my engineering lead can
confirm the vendor's delivery rhythm without a phone
call.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the site
already publishes the OUTPUT of the autonomous
agent system (the public `/changelog` from ticket
0032, the RSS feed from ticket 0055, the JSON Feed
from ticket 0078, the `/playbook` methodology page
from ticket 0059) but does NOT publish the SYSTEM
itself. Today a buyer who sees ~1 shipped ticket
per hour on `/changelog` has to trust that a real
autonomous agent produces the ships, not a human
team writing timestamps. This ticket adds one new
public page at `/how-we-ship` that describes the
ship loop verbatim (mirroring the AGENTS.md "The
loop" ASCII diagram byte-for-byte per the
2026-05-25 mirror-source rule) plus the dated gates
(from AGENTS.md "Agent parameters") plus the dated
Hard NOs (from AGENTS.md "Hard NOs") plus a live
"See it for yourself" section cross-linking
`/changelog`, `/changelog/rss.xml`, `/changelog.json`,
and `/uptime` as evidence that the cadence is real
and verifiable. Zero new backend, zero new
dependency, zero new persistent store. One new
page, one new data file (`src/data/shipLoopStages.ts`
enumerating the four stages), one new route entry,
one new sitemap row, one new spec, one new footer
chip. The page is INTENTIONALLY light on marketing
copy: it is a documentary artifact, not a sales
surface.

### Stakeholder

This widens the moat in a dimension no shipped
ticket covers: PROCESS TRANSPARENCY as a
competitive moat. Per the ticket 0059 `/playbook`
precedent (HowTo JSON-LD for the deployment
methodology) and the ticket 0032 / 0055 / 0078
changelog surfaces (ship velocity as an evidence
artifact), the missing surface is a canonical
public description of the AUTONOMOUS-AGENT SYSTEM
that produces the ship velocity. A competitor
imitating this must first (a) build an equivalent
agent fleet, (b) publish its rules, (c) accept a
public commitment to the dated Hard NOs the agents
enforce. That triad is structurally harder to fake
than a landing-page copy edit. The page also
converts the site itself into a live case study
(the ship velocity a buyer can measure on
`/changelog` IS the case study), which is
structurally the strongest case-study format
because the buyer can independently verify every
row. Per the 2026-09-12 code-beats-prose lesson,
BEFORE writing code the implementer greps the
actual AGENTS.md file for the exact loop ASCII
block and the exact gate check names and the exact
Hard NO bullets; the page mirrors the AGENTS.md
strings VERBATIM rather than paraphrasing them, so
a rule change in AGENTS.md never drifts the public
page (a follow-up ticket can wire a build-time
guard that greps AGENTS.md and fails the build if
the page's mirrored strings drift, but the
initial ship is a one-way copy). Per the ticket
0069 subprocessors precedent, the page emits
`TechArticle` plus `BreadcrumbList` JSON-LD scoped
to `/how-we-ship`; the pre-code grep confirms
every predecessor TechArticle and BreadcrumbList
assertion is URL-scoped so a sibling instance
cannot collide (per the 2026-05-30 second-@type
lesson).

### User (in the real moment of use)

A property-management CTO opens `/how-we-ship`
from a footer chip on the homepage after skimming
`/changelog` and noticing three ships in the last
six hours. The page renders a calm single-column
layout: an H1 reading "How we ship" with a
supporting sentence naming what the page is (a
dated description of the autonomous-agent loop the
site runs on today, updated every ship that touches
the loop itself). Below the intro: (a) a four-stage
ASCII loop diagram mirroring AGENTS.md verbatim
(groom, ship, review, auto-merge), each stage
rendered as a bordered card with a name, a one-
sentence description, a cadence chip ("hourly" for
ship, "every 15 minutes" for review, "daily" for
groom), and a "last reviewed 2026-09-18" date;
(b) a "Gates every PR must pass" section listing
`build` and `smoke-required` verbatim from
AGENTS.md; (c) a "Hard NOs the agents enforce"
section listing the six AGENTS.md Hard NOs
verbatim (no em-dash, no fake testimonials, dark-
mode required, no /api/ edits, no /package.json
edits from the GTM queue, no unauthorized
force-push); (d) a "See it for yourself" section
with three chips linking to `/changelog`,
`/changelog/rss.xml`, and `/changelog.json` as
live evidence; (e) a small closing paragraph
inviting the reader to book a strategy call. On
a 375px viewport the four-stage loop stacks; light
and dark mode both read cleanly.

### Growth

The "show me" moment is the URL an engineering-
lead buyer pastes into a Slack DM to their CTO:
one page, four dated stages, two dated gates, six
dated Hard NOs, three live-evidence links to
verify the cadence is real. That is the single
cheapest engineering-audience trust signal the
site can produce because the audience it unblocks
(technically-skeptical engineering leads,
platform CTOs, procurement engineers) is the
audience most likely to gate an AI-vendor pilot
based on delivery rhythm. Per the ticket 0077
growth lens verbatim, a public dated commitment
is a screenshot a buyer's engineer attaches to a
review thread that no vendor claim can substitute
for. The new footer chip on every page ("How we
ship") fires `trackCTAClick('footer_how_we_ship_chip', <current-route>)`
on click so the referral path is measurable in GA
independently of the other trust-family chips
(ticket 0023 AI providers, ticket 0069 Data
recipients, ticket 0081 Security posture).

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new typed data file at `src/data/shipLoopStages.ts` (new file, under 200 lines) exports a `SHIP_LOOP_STAGES: readonly ShipLoopStage[]` constant enumerating the four stages `{ id: 'groom' | 'ship' | 'review' | 'auto-merge', name: string, description: string, cadence: string, lastReviewed: string /* ISO YYYY-MM-DD */ }`. Per the 2026-09-12 code-beats-prose lesson, BEFORE writing code the implementer greps the actual `AGENTS.md` file "The loop" ASCII block and pins each stage's `name`, `description`, and `cadence` string to the AGENTS.md source; if the AGENTS.md loop diagram has been edited since 2026-09-18, the implementer treats this ticket's inline enumeration as placeholder groomer prose and pins to the real source. All four `lastReviewed` dates are `'2026-09-18'` on initial ship. Every string is defensible per AGENTS.md: no invented cadences, no invented gate names, no invented Hard NOs.
- [ ] A new typed data file additive to `src/data/shipLoopStages.ts` (same file) OR a sibling `src/data/shipLoopPolicy.ts` exports (a) `SHIP_LOOP_GATES: readonly string[]` = the exact gate check names from AGENTS.md ("Agent parameters" section: `build`, `smoke-required`); (b) `SHIP_LOOP_HARD_NOS: readonly HardNo[]` where `HardNo = { id: string, statement: string, sinceDate: string }` enumerating the six AGENTS.md Hard NOs verbatim (per the 2026-09-12 code-beats-prose lesson, the implementer greps AGENTS.md's "Hard NOs" section on branch head and pins each `statement` to the real bullet text; the ticket's inline enumeration is placeholder groomer prose per the 2026-09-12 rule). Every `sinceDate` cites a real anchor date documented in `docs/LESSONS.md` or the `git log` of AGENTS.md; NO fabricated dates.
- [ ] A new page at `src/pages/HowWeShip.tsx` (new file, under 220 lines) renders at `/how-we-ship`. The page uses the existing `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell mirrored from `src/pages/Playbook.tsx` (ticket 0059) and `src/pages/Security.tsx` (ticket 0081). Renders (a) a hero H1 "How we ship" with a supporting one-paragraph intro, (b) a stacked "Ship loop" section with one bordered card per `ShipLoopStage`, each card showing the stage `name` as an H2, the description below, a cadence chip, and a "Last reviewed: <date>" line in muted text, (c) a "Gates every PR must pass" section listing each `SHIP_LOOP_GATES` string as a small monospace chip, (d) a "Hard NOs" section rendering each `SHIP_LOOP_HARD_NOS` entry as a stacked list item with the `statement` as a bold sentence and an "In effect since <sinceDate>" chip below (mirror the ticket 0077 `/ethics` commitment card pattern), (e) a "See it for yourself" section with three chips linking to `/changelog`, `/changelog/rss.xml`, and `/changelog.json`, (f) a strategy-call CTA at the bottom mirroring the trust-surface family pattern.
- [ ] A new route entry at `src/App.tsx` mapping `/how-we-ship` to the new page component, imported through the existing `React.lazy` pattern per the 2026-09-05 route-code-splitting lesson. Wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell.
- [ ] A new entry in `src/data/routes.ts` exactly `'/how-we-ship'`, placed in the file's existing ordering convention alongside the other trust-family routes (`/trust`, `/uptime`, `/subprocessors`, `/ethics`, `/security`, `/playbook`). Per the 2026-06-07 mirror-source-across-src-tests lesson, `tests/e2e/routes.ts` re-exports ROUTES verbatim and requires no separate edit.
- [ ] The sitemap generator at `scripts/generate-sitemap.ts` picks up the new route from its existing enumeration source (per the ticket 0081 implementer note, the generator reads routes from `src/App.tsx` via a regex; both the App.tsx and routes.ts entries land in the same PR so no manual sitemap edit is required). The implementer confirms auto-inclusion by grepping `dist/sitemap.xml` for `/how-we-ship` after a local build and documents the confirmation in the Implementation log.
- [ ] The page emits two JSON-LD blocks inside its `<Helmet>` block: (1) `TechArticle` describing the ship-loop process with `headline`, `datePublished: '2026-09-18'`, `dateModified` matching the latest `lastReviewed` across stages, `author: { '@type': 'Organization', name: 'Digital Craft AI' }`, `about: { '@type': 'Thing', name: 'Autonomous agent ship loop' }`, and a `description` string read from a module-top `META_DESCRIPTION` constant that ALSO drives the `<meta name="description">` tag per the 2026-05-25 mirror-source rule; (2) `BreadcrumbList` positioning `/how-we-ship` under the homepage (two levels: Home, How we ship).
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'TechArticle'` and `=== 'BreadcrumbList'` predicates and any "exactly one" / `toHaveLength(1)` assertions over those `@type`s. TechArticle candidates: check every `tests/e2e/case-studies-*.spec.ts` and the ticket 0059 `/playbook` spec (HowTo, not TechArticle, but worth confirming). BreadcrumbList candidates: 0018 /trust, 0044 /trust AboutPage, 0063 /glossary, 0069 /subprocessors, 0071 /ai-for-hospitality, 0077 /ethics, 0079 /blog, 0081 /security, plus every compare-page and ai-for-* spec. The grep result is documented in the Implementation log. Every predecessor BreadcrumbList assertion is URL-scoped so the `/how-we-ship`-scoped block cannot collide; if any predecessor TechArticle assertion exists and is NOT URL-scoped, widen it in the same PR per the 2026-05-30 lesson (never ship a knowingly-red sibling test).
- [ ] A new footer chip in `src/components/Footer.tsx` reading "How we ship" linking to `/how-we-ship`, styled to match the ticket 0023 (AI providers), ticket 0069 (Data recipients), and ticket 0081 (Security posture) chip patterns. The chip fires `trackCTAClick('footer_how_we_ship_chip', <current-route>)` on click before navigating. The chip is added in the trust-surface chip row, alphabetically ordered between "Data recipients" and "Security posture" or per the row's existing alphabetical convention.
- [ ] Per the 2026-05-07 em-dash Hard NO, every string in `shipLoopStages.ts` AND every string in `HowWeShip.tsx` AND every string in the new footer chip AND every string in the new spec is hyphen-only. Self-Review greps the diff for `String.fromCharCode(8212)` before pushing. No invented ship velocity numbers ("we ship 100 tickets per hour"), no invented reviewer names, no invented approval rates. Every claim is either mirrored from AGENTS.md verbatim OR derivable from public `/changelog` data.
- [ ] The page ships full dark-mode support: every Tailwind color class carries its `dark:` variant, mirroring the ticket 0081 `Security.tsx` structure. A viewport-width check on 375px, 768px, and 1280px shows the four ship-loop cards stacking on mobile, two-up on tablet, and either two-up or four-up on desktop (matching the trust-surface card grid pattern used on `/security`).
- [ ] A new e2e spec at `tests/e2e/how-we-ship.spec.ts` (modeled on `tests/e2e/security-posture-page.spec.ts` from ticket 0081) asserts, using a `gotoHowWeShip(page)` helper that navigates to `/how-we-ship` and waits for RouteFallback detach per the 2026-09-05 lesson and the H1 mount signal per the 2026-09-10 lesson: (1) `GET /how-we-ship` returns 200, (2) the page renders an H1 containing "How we ship" (case-insensitive), (3) the page renders exactly `SHIP_LOOP_STAGES.length` stage cards (imported from the mirror-source path per the 2026-05-25 mirror-source rule so the count is derived, not hard-coded), (4) the page renders exactly `SHIP_LOOP_GATES.length` gate chips whose text content matches the array entries verbatim, (5) the page renders exactly `SHIP_LOOP_HARD_NOS.length` Hard-NO items with a visible `sinceDate` chip matching `/In effect since \d{4}-\d{2}-\d{2}/`, (6) exactly one `TechArticle` JSON-LD block on the page whose `about.name` equals "Autonomous agent ship loop", (7) exactly one `BreadcrumbList` block with two `itemListElement` entries whose names are "Home" and "How we ship", (8) per the 2026-09-08 em-dash-JSON-LD-block-filter lesson the em-dash check scopes ONLY to blocks THIS PAGE emits (TechArticle, BreadcrumbList) filtered by their `@type`, NOT to every `application/ld+json` block on the page (the homepage Organization block from `index.html` carries a legitimate em-dash and must not be flagged), (9) the "See it for yourself" section renders three chips whose hrefs are `/changelog`, `/changelog/rss.xml`, and `/changelog.json` respectively, (10) the "How we ship" footer chip renders on the homepage `/` and clicking it fires `trackCTAClick('footer_how_we_ship_chip', ...)` and navigates to `/how-we-ship`, (11) the page renders cleanly in both light and dark mode (the `html.dark` class toggle test pattern from ticket 0081's spec), (12) per the 2026-09-08 sibling-hub-poll lesson the JSON-LD read helper polls `page.locator('script[type="application/ld+json"]').evaluateAll` until at least one block's `@type` equals `'TechArticle'` BEFORE reading and filtering blocks (do NOT reuse a `count > 0` poll that fires before the Helmet head swap finishes).
- [ ] Standard box: no `/api/` change (the page ships as a static React route reading from static TypeScript constants), no new hostname (all cross-link hrefs are same-origin), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to AGENTS.md (the page mirrors AGENTS.md one-way; a reverse edit would create a circular dependency per the ticket 0077 out-of-scope precedent). `node scripts/check-backlog.mjs`, `npm run check-links` (the three "See it for yourself" hrefs must all resolve), `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the adjacent trust-family specs (`tests/e2e/trust-page.spec.ts` 0018 / 0044, `tests/e2e/uptime.spec.ts` 0036, `tests/e2e/subprocessors.spec.ts` 0069, `tests/e2e/ethics-page.spec.ts` 0077, `tests/e2e/security-posture-page.spec.ts` 0081, `tests/e2e/playbook.spec.ts` 0059) all stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- No `/api/` changes, no `package.json`
  changes, no em-dashes in copy, dark-
  mode required (this ticket ships one
  new page plus one or two new data
  files plus one new route plus one new
  sitemap entry plus one new spec plus
  two JSON-LD blocks plus one footer
  chip).
- Editing AGENTS.md. The page mirrors
  AGENTS.md one-way; a reverse edit
  would create a circular dependency
  per the ticket 0077 `/ethics`
  out-of-scope precedent.
- A build-time guard that greps
  AGENTS.md and fails the build if
  the page's mirrored strings drift.
  A drift-guard is its own eng-queue
  follow-up ticket (parallel to the
  ticket 0022 sitemap-generator
  guard pattern).
- A live reviewer-approval-rate
  dashboard or an agent-heal-success
  counter. Live metrics are on
  `/uptime` (ticket 0036); this page
  is a documentary description of
  the process, not a live-metrics
  surface.
- A per-agent bio card (a card per
  ship-agent, groom-agent, review-
  agent, eng-agent describing its
  prompt or invocation cadence).
  Per-agent bio cards would drift
  from the actual `.claude/agents/`
  files and are their own follow-up
  ticket if buyer telemetry
  justifies it.
- A downloadable PDF of the ship
  loop diagram. A one-page PDF
  export is a distinct printable-
  artifact ticket (per the ticket
  0066 / 0067 printable-summary
  precedent).
- A "see the actual PR that
  shipped this ticket" cross-link
  from each ship-loop stage to a
  live GitHub PR. GitHub-PR links
  are unstable (repo renames,
  history rewrites); the
  `/changelog` and `/changelog.json`
  surfaces are the canonical live
  evidence.
- A comparison table of Digital
  Craft's ship cadence vs
  competitor cadences. Comparison
  is a distinct area (SEO /
  compare-page family) with a
  different template.
- A "hire our ship loop" managed-
  services offer or a "license
  the agent fleet" sales chip.
  The page is a documentary
  artifact; commercial offers are
  their own follow-up ticket.
- A per-ship changelog integration
  that re-renders the ship-loop
  card timestamps from live
  `/changelog.json` data. Live
  re-render adds a fetch cycle
  and error path that the
  documentary intent does not
  require; the `lastReviewed`
  date per stage is a manual
  chart, not a live metric.
- Emitting a HowTo JSON-LD block
  on this page. HowTo is already
  emitted on `/playbook` (ticket
  0059) for the deployment
  methodology; a second HowTo on
  `/how-we-ship` would risk a
  second-@type collision and
  overload the schema graph.
  TechArticle plus BreadcrumbList
  is the correct emission for
  this page's shape.
- Adding a "How we ship" section
  to the homepage hero or to
  `/trust`. Cross-linking from
  the footer chip is sufficient
  for one PR; hero-level surface
  changes are their own
  follow-up ticket.
- Adding a "Report a ship-loop
  bug" form or contact widget on
  the page. The page is a
  passive artifact; a reporting
  channel is a distinct ticket.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/data/shipLoopStages.ts`
  (under 200 lines) exporting
  `SHIP_LOOP_STAGES`, `SHIP_LOOP_GATES`,
  `SHIP_LOOP_HARD_NOS`, and the
  `ShipLoopStage` + `HardNo`
  interfaces. Mirror the shape of
  `src/data/securityControls.ts`
  (ticket 0081) for the file's
  export pattern and TypeScript
  interface style. Per the
  2026-09-12 code-beats-prose
  lesson, grep AGENTS.md on branch
  head BEFORE authoring the arrays
  and pin every stage name,
  description, cadence, gate name,
  and Hard-NO statement to the
  actual AGENTS.md source.
- New `src/pages/HowWeShip.tsx`
  (under 220 lines). Mirror the
  file structure of
  `src/pages/Security.tsx` (ticket
  0081) and `src/pages/Playbook.tsx`
  (ticket 0059): same imports, same
  Helmet block shape, same card-
  grid pattern. Every color class
  carries its `dark:` variant.
- New `src/App.tsx` route entry
  mapping `/how-we-ship` to the
  new component, wrapped in the
  existing
  `<Suspense fallback={<RouteFallback />}>`
  shell and lazy-imported via
  `React.lazy(() => import('./pages/HowWeShip'))`
  per the 2026-09-05 route-code-
  splitting lesson.
- New entry in `src/data/routes.ts`
  at the trust-family slot for
  `/how-we-ship` next to `/trust`,
  `/uptime`, `/subprocessors`,
  `/ethics`, `/security`,
  `/playbook`.
- Two JSON-LD blocks inside the
  `<Helmet>` block: TechArticle
  (with `datePublished`,
  `dateModified`, `about`, and
  `description` mirroring the
  META_DESCRIPTION constant) and
  BreadcrumbList (two levels). A
  module-top `META_DESCRIPTION`
  constant that both the
  `<meta name="description">` tag
  AND the TechArticle.description
  read from per the 2026-05-25
  mirror-source rule.
- New footer chip in
  `src/components/Footer.tsx`
  reading "How we ship" linking
  to `/how-we-ship`. Mirror the
  ticket 0023 (AI providers),
  ticket 0069 (Data recipients),
  and ticket 0081 (Security
  posture) chip patterns; add
  alphabetically in the trust-
  chip row. The chip fires
  `trackCTAClick('footer_how_we_ship_chip', <current-route>)`
  before navigation.
- Per the 2026-05-30 second-@type
  lesson, BEFORE writing code
  grep every `tests/e2e/*-jsonld.spec.ts`
  AND every `tests/e2e/*-jsonld*.spec.ts`
  AND every trust-page spec for
  `=== 'TechArticle'` and
  `=== 'BreadcrumbList'` predicates.
  Predecessor candidates as of
  2026-09-18: 0018 /trust, 0044
  /trust AboutPage, 0063 /glossary,
  0069 /subprocessors, 0071
  /ai-for-hospitality, 0077 /ethics,
  0079 /blog, 0081 /security, plus
  every compare-page and
  ai-for-* spec for BreadcrumbList;
  every case-studies spec for
  TechArticle if any. Each
  predecessor is URL-scoped so
  the sibling on `/how-we-ship`
  cannot collide. The grep result
  is documented in the
  Implementation log.
- Per the 2026-09-08 em-dash-
  JSON-LD-block-filter lesson,
  the em-dash check in the spec
  scopes ONLY to blocks THIS
  page emits (TechArticle,
  BreadcrumbList) filtered by
  their `@type`, NOT to every
  `application/ld+json` block on
  the page. The homepage
  Organization block from
  `index.html` carries a
  legitimate em-dash and must
  not be flagged by the
  /how-we-ship spec.
- Per the 2026-09-08 sibling-
  hub-poll lesson, the spec's
  JSON-LD read helper polls
  `page.locator('script[type="application/ld+json"]').evaluateAll`
  until at least one block's
  `@type` equals `'TechArticle'`
  BEFORE reading and filtering
  blocks. Do NOT reuse a
  `count > 0` poll.
- Per the 2026-05-25 mirror-
  source rule, every string that
  appears on both the visible
  page AND the TechArticle
  JSON-LD is read from one
  constant (the SHIP_LOOP_STAGES
  array per-stage strings, the
  META_DESCRIPTION module-top
  constant for the page-level
  description).
- Per the 2026-05-07 em-dash
  Hard NO, every string in every
  touched file is hyphen-only.
  Self-Review greps the diff for
  `String.fromCharCode(8212)`
  before pushing.
- Per the 2026-09-05 route-
  fallback and 2026-09-10 mount-
  signal lessons, the new spec's
  `gotoHowWeShip` helper waits
  for RouteFallback detach AND
  the H1 to be visible before
  reading page state.
- Per the 2026-05-22 two-PR
  ship lesson, ship will need a
  follow-up
  `chore/0083-ship-status` PR
  after the feat PR merges to
  flip the ticket frontmatter
  AND its `docs/backlog/README.md`
  index row to `shipped` together;
  run
  `node scripts/check-backlog.mjs`
  before pushing the second PR
  so the file and index never
  drift mid-flip.
- New deps: NO. The page reuses
  `react-helmet-async`,
  `react-router-dom`, the
  existing `trackCTAClick`
  helper, the existing UI
  primitives from
  `@/components/ui/*`, and
  Tailwind utility classes.
  Schema migration: no. Privacy
  / security surface change: NO -
  the page contains only
  defensible static text
  describing the ship loop
  system; it does NOT introduce
  any new data-collection
  behavior on the site.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0083-...` opened
- YYYY-MM-DD - failing test added in `tests/e2e/how-we-ship.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
