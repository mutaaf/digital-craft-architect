---
id: 0086
title: Comparison page "Digital Craft vs kvCORE" for real-estate high-intent CRM switchers
status: in-progress
priority: P1
area: seo
created: 2026-09-20
owner: gtm-innovation
---

## User story

As a residential real-estate broker or team lead
(a 20-agent brokerage two years into a kvCORE
subscription evaluating whether the platform
answers the buyer leads it stores after 6pm, an
independent agent comparing kvCORE and Follow Up
Boss at renewal, an operations lead for a
mid-market brokerage weighing kvCORE's IDX-plus-
CRM bundle against the AI agent conversation
layer), Googling "kvCORE alternative," "kvCORE
vs," "AI for real estate CRM," "kvCORE AI
integration," or arriving from the `/compare`
hub after tapping the fourteenth card, I want
one honest comparison page at `/compare/kvcore`
that names which job kvCORE does well (a
real-estate operating system bundling IDX
websites, lead capture, CRM, drip campaigns,
smart-plans, and squeeze-page landing pages) and
which job Digital Craft does instead (answering,
qualifying, and voice-negotiating the leads a
real-estate CRM already stores, plus running
live AI voice negotiations with sellers), so
that I can decide in 90 seconds whether the AI
agent layer is a replacement, a complement, or
a pass without bouncing back to search.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the
comparison-page pattern is now proven across
FOURTEEN shipped pages under
`src/pages/compare/*.tsx` (HubSpot, GoHighLevel,
Zapier, Make, Intercom, Jobber, ServiceTitan,
Podium, Housecall Pro, Buildertrend, Thumbtack,
Angi, Follow Up Boss, JobTread) and the
canonical `/compare` hub (ticket 0048) reads
from `src/data/compareEntries.ts` and picks up
any fifteenth entry automatically. Adding this
comparison is one new page file, one new spec
file, two two-line entries (route in
`src/App.tsx`, path in `src/data/routes.ts`),
and one new entry in
`src/data/compareEntries.ts`. kvCORE is the
closest ADJACENT residential-real-estate CRM to
Follow Up Boss (ticket 0065) but the positioning
is distinct: kvCORE bundles IDX websites,
squeeze-page lead capture, drip campaigns, and
smart-plans around a single CRM record, while
Follow Up Boss is a specialist CRM without the
IDX-website tier. Both target the same paying
brokerage buyer, and ticket 0065's own Out of
Scope list explicitly names a "kvCORE, Chime, or
BoomTown comparison page" as a separate future
ticket, pre-authorizing this scope per the
2026-05-22 bootstrap-from-Out-of-Scope
convention. Structurally identical to Follow Up
Boss (ticket 0065) in the compare-page shape and
in the real-estate vertical positioning. Zero
new component, zero new data shape, zero new
JSON-LD `@type` first emission.

### Stakeholder

This widens the SEO moat in a query class the
fourteen existing comparison pages structurally
cannot capture: the real-estate-CRM SERP niche
around kvCORE ("kvCORE alternative," "kvCORE
vs," "kvCORE AI integration," "AI for real
estate CRM," "kvCORE Follow Up Boss
comparison"). kvCORE is one of the two dominant
residential real-estate CRMs (the other is
Follow Up Boss, covered by ticket 0065), and
the real-estate funnel (`/realestate`,
`/realestate/demo`, `/case-studies/realestate`)
now has a Follow Up Boss comparison anchor but
no kvCORE anchor. Per the 2026-05-30 second-
@type lesson, BEFORE writing code the
implementer greps every existing
`tests/e2e/compare-*.spec.ts` AND every existing
`tests/e2e/*-jsonld.spec.ts` for
`=== 'BreadcrumbList'` AND `=== 'WebPage'`
predicates; the fourteen predecessor compare
specs are each URL-scoped to their own
`/compare/<tool>` route per the ticket 0073
Implementation log, so a fifteenth
`/compare/kvcore`-scoped pair cannot collide.
The grep is mandatory and its result is
documented in the Implementation log. This is
also the SECOND real-estate-vertical-specific
comparison page (Follow Up Boss was the first),
which structurally lifts the credibility of the
entire `/realestate` funnel: a broker who taps
"vs kvCORE" from the `/compare` hub self-selects
as a paying real-estate-CRM subscriber, the
highest-intent prospect the real-estate funnel
can produce.

### User (in the real moment of use)

A team lead running 20 agents Googles "kvCORE
alternative for small brokerage" on a laptop
between morning showings. The SERP surfaces
`/compare/kvcore` with a description that names
the actual frustration (paying for an
IDX-plus-CRM bundle that captures leads all
weekend but never answers the buyer who filled
the squeeze page Saturday night). One click and
the page loads in under one screen with a
positioning sentence at the top ("kvCORE runs
your IDX website and CRM, Digital Craft answers
the leads that never become buyer
appointments"), a four-row comparison table
(Lead capture, First response, Qualification,
Voice negotiation), a "Use both" section
acknowledging kvCORE still owns the IDX site,
squeeze-page, and CRM record work a brokerage
depends on while AI handles the first-touch and
after-hours qualification, three demo CTAs
routing to the existing real-estate demos
(`/realestate/demo/lead-responder`,
`/realestate/demo/property-negotiator`,
`/realestate/demo/voice-negotiator`), and one
strategy-call CTA below. The broker leaves in
90 seconds knowing whether the AI agent layer
is a replacement, a complement, or a pass.
Light and dark mode supported; the page reads
cleanly on a 375px viewport.

### Growth

The "show me" moment is the SERP listing for
"kvCORE alternative" surfacing a real, honest
comparison page that does NOT trash kvCORE but
reframes the spend (their IDX-plus-CRM bundle
plus our AI agent layer, not their platform
replaced). A team lead who Slack-shares the page
to a peer with "this is exactly the frame I
was missing" is the cheapest qualified
strategy-call the real-estate funnel can
produce because the share is peer-to-peer
between two paying kvCORE subscribers, both of
whom are already spending on real-estate CRM
software. The comparison hub (`/compare`) picks
up the new entry via `COMPARE_ENTRIES.length`
mapping automatically per the ticket 0048
mirror-source pattern.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/compare/KvCore.tsx` (new file, under 260 lines) renders at `/compare/kvcore`, modeled 1:1 on `src/pages/compare/FollowUpBoss.tsx` (ticket 0065, the closest structural peer at similar file size AND hub-aware breadcrumb shape) with real-estate-vertical positioning cross-referenced against `src/pages/compare/Jobber.tsx` (ticket 0021) for the "specialist tool plus AI layer" narrative shape. The page has a hero H1 ("Digital Craft AI vs kvCORE"), a positioning paragraph naming kvCORE's real strength (a residential real-estate operating system bundling IDX websites, squeeze-page lead capture, CRM, drip campaigns, and smart-plans for brokerages and teams) and Digital Craft's complementary strength (AI answering, qualifying, and voice-negotiating the leads a real-estate CRM stores, plus live AI voice negotiations with sellers), a four-row comparison table (Lead capture, First response, Qualification, Voice negotiation) with short text cells (NOT check/x icons, matching the ticket 0065 rationale that the two tools solve different jobs), a "Use both" or three-differentiator strip, three demo CTAs routing to `/realestate/demo/lead-responder`, `/realestate/demo/property-negotiator`, `/realestate/demo/voice-negotiator`, and one strategy-call CTA reusing the existing Calendly URL. Every claim is defensible: no invented brokerage names, no fabricated efficacy percentages, no kvCORE pricing figure the page cannot cite from `insiderealestate.com` or `kvcore.com/pricing` in an HTML source comment per the 2026-05-25 mirror-source-fix rule. Positioning is complement-not-replace per the ticket 0065 precedent.
- [ ] The page emits TWO JSON-LD blocks inside the existing `<Helmet>` head matching the fourteen-page convention: a `BreadcrumbList` (Home to Compare to Digital Craft vs kvCORE) using the hub-aware three-item shape from `src/pages/compare/FollowUpBoss.tsx` (with the middle item named "Compare" linking to `/compare`), and a `WebPage` block with `name`, `description` (equal to `META_DESCRIPTION` per the 2026-05-25 mirror-source rule), `url: 'https://digitalcraftai.com/compare/kvcore'`, and `isPartOf: { '@type': 'WebSite', url: 'https://digitalcraftai.com' }`. Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/compare-*.spec.ts` AND every existing `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'` AND `=== 'WebPage'` predicates; the fourteen predecessor compare specs are each URL-scoped to their own `/compare/<tool>` route per the ticket 0073 Implementation log, so a fifteenth `/compare/kvcore`-scoped pair cannot collide. The grep is mandatory regardless and the result is documented in the Implementation log.
- [ ] A new entry is appended to `src/data/compareEntries.ts` for kvCORE: `{ id: 'kvcore', tool: 'kvCORE', path: '/compare/kvcore', tagline: 'kvCORE bundles your IDX website, squeeze pages, and CRM. Digital Craft is the AI agent layer that answers the buyer leads a CRM never gets around to.' }`. The tagline is hyphen-only per the 2026-05-07 em-dash Hard NO. The `/compare` hub (ticket 0048 `src/pages/CompareHub.tsx`) reads `COMPARE_ENTRIES.length` and renders one card per entry automatically, so appending here surfaces the kvCORE card on the hub without a hub edit. The hub's `ItemList` JSON-LD `numberOfItems` and `itemListElement` both derive from `COMPARE_ENTRIES` so both widen automatically.
- [ ] The new route is registered in `src/App.tsx` next to the existing `/compare/followupboss` route. The implementer adds `/compare/kvcore` to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson; `tests/e2e/routes.ts` re-exports it automatically and the smoke spec exercises the page. The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date. Per the 2026-09-05 route-code-splitting lesson, if the route is `React.lazy`-wrapped mirroring adjacent `/compare/*` routes, the new spec must NOT rely on `root.innerHTML.length > N` for readiness; the `gotoKvCore` helper adds an H1 visibility wait per the 2026-09-10 mount-signal lesson.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text, in the `compareEntries.ts` addition, or in any JSON-LD serialized string. Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the em-dash check in the new spec scopes ONLY to the two blocks THIS page emits (`BreadcrumbList` and `WebPage`) filtered by their `@type`, NOT to every `application/ld+json` block on the page. The homepage Organization block from `index.html` carries a legitimate em-dash and must not be flagged by the `/compare/kvcore` spec. Every CTA route resolves to a registered route in `src/data/routes.ts`. The three demo CTAs route to `/realestate/demo/lead-responder`, `/realestate/demo/property-negotiator`, and `/realestate/demo/voice-negotiator` (the three real-estate demos that map to the four comparison dimensions); the strategy-call CTA opens Calendly in a new tab with `rel="noopener noreferrer"` matching the existing compare-page convention from 0065.
- [ ] A new e2e spec at `tests/e2e/compare-kvcore.spec.ts` (modeled on `tests/e2e/compare-followupboss.spec.ts`) asserts, using a `gotoKvCore(page)` helper that waits for RouteFallback detach AND the H1 to be visible before reading page state (2026-09-05 + 2026-09-10 lessons): (1) the page returns a status under 400 and the H1 contains "kvCORE" (case-insensitive substring), (2) the `meta[name="description"]` content names "kvCORE" (asserted on the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson), (3) the `BreadcrumbList` JSON-LD has three items, the middle one named "Compare" and linking to `https://digitalcraftai.com/compare`, the third named matching the H1 substring and linking to `https://digitalcraftai.com/compare/kvcore`, (4) the `WebPage` JSON-LD's `description` byte-matches the `meta[name="description"]` content per the 2026-05-25 mirror-source rule, (5) the four comparison-table rows exist (Lead capture, First response, Qualification, Voice negotiation) via `data-testid="kvcore-comparison-row"` count of 4, (6) the three demo CTAs each resolve to a `/realestate/demo/*` route present in `ROUTES` (imported from `tests/e2e/routes.ts`), (7) the page text contains no `String.fromCharCode(8212)` code point, (8) dark mode renders cleanly via `document.documentElement.classList.add('dark')`, (9) sibling-hub-regression case navigates to `/compare` and asserts (a) the hub card count equals `COMPARE_ENTRIES.length` (imported from `src/data/compareEntries.ts`), (b) a card with tool text "kvCORE" is present, (c) the hub's `ItemList` JSON-LD `numberOfItems` equals `COMPARE_ENTRIES.length` to prove the additive `compareEntries.ts` edit widened both the render and the schema per the ticket 0048 mirror-source rule. Per the 2026-09-08 sibling-hub SPA-navigation lesson the hub-regression case polls until at least one JSON-LD block's `name` equals the hub's own expected name before reading, not just "count greater than zero."
- [ ] Standard box: no `/api/` change, no new hostname (the only external link is the existing Calendly URL already used on every compare page), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the fourteen existing `src/pages/compare/*.tsx` pages or their specs beyond the additive `compareEntries.ts` entry. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; every pre-existing `tests/e2e/compare-*.spec.ts` (fourteen of them) stays green; the existing `tests/e2e/compare-hub.spec.ts` (ticket 0048) stays green because its assertion reads `COMPARE_ENTRIES.length` and widens automatically.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- Standard anti-goals: no `/api/`
  changes, no `package.json` changes,
  no em-dashes in copy, dark-mode
  required.
- A second comparison page in the same
  ticket (Chime, BoomTown, Real Geeks,
  Sierra Interactive, Lofty, LionDesk,
  Wise Agent, Placester). Each
  comparison is one ticket per the
  ticket 0021 to 0073 precedent; this
  ticket picks kvCORE as the next
  real-estate-vertical incumbent not
  yet covered. The other names above
  are separate future tickets and were
  pre-authorized only for Chime and
  BoomTown by ticket 0065's Out of
  Scope list.
- Editing the ticket 0065 Follow Up
  Boss page. This ticket is purely
  additive; the Follow Up Boss peer
  stays byte-identical.
- Cross-promoting the new page from
  the homepage hero, the `/realestate`
  marketing page, or any vertical
  strip. Cross-surface promotion is
  its own follow-up ticket once
  telemetry shows the page earns
  organic traffic on its own.
- Adding `/compare/kvcore` to the
  `index.html` SEO Pilot `pages`
  table. That is its own SEO-hygiene
  ticket and applies uniformly to
  every `/compare/*` route per the
  2026-05-25 SEO Pilot lesson.
- A "kvCORE alternative" blog post
  pointing at `/compare/kvcore`. Blog
  content ships through the
  `src/data/blogPosts.ts` pipeline
  and is gated by
  `check-blog-dates`; cross-promotion
  is its own content ticket.
- Adding a `Product` or
  `SoftwareApplication` JSON-LD block
  on the page (kvCORE's schema). The
  compare-page family emits
  `BreadcrumbList` and `WebPage` only
  per the ticket 0065 Implementation
  log; adding a new `@type` would
  trigger the 2026-05-30 second-@type
  collision audit on every compare
  spec, out of scope here.
- Adding a rating or review card
  citing a specific kvCORE G2 or
  Capterra rating. Reviews are
  third-party attributed and cannot
  be defensibly repeated on this
  page per the AGENTS.md
  conservative-claims rule.
- Fabricated pricing comparisons
  ("kvCORE costs 5x more"). Every
  price citation MUST link to the
  kvCORE pricing source in an HTML
  source comment per the 2026-05-25
  mirror-source-fix rule; no invented
  figures.
- Cross-vertical related-demos
  surfacing of the new page in the
  `RelatedDemos` component (ticket
  0027). The component reads from a
  separate `relatedDemos` data
  structure and is its own follow-up
  ticket.
- Internationalization (`inLanguage`
  fields on schema). The page is
  English-only, matching every
  existing compare page.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/compare/KvCore.tsx`
  (under 260 lines). Copy
  `src/pages/compare/FollowUpBoss.tsx`
  (ticket 0065, the direct peer for
  hub-aware breadcrumb shape at
  similar file size and same
  real-estate vertical) end-to-end
  as the starting frame, then swap
  every "Follow Up Boss" / "FUB" /
  "real estate CRM" string for the
  kvCORE equivalent. Keep the same
  module-level mirror-source
  constants: `PAGE_H1`, `PAGE_NAME`,
  `META_DESCRIPTION`,
  `COMPARISON_ROWS`, `DIFFERENTIATORS`,
  `CRUMBS`, `BREADCRUMB_SCHEMA`,
  `WEBPAGE_SCHEMA` (per the
  2026-05-25 mirror-source rule the
  description used in the Helmet
  meta tag AND the `WebPage`
  JSON-LD description MUST read
  from the same `META_DESCRIPTION`
  constant). Swap the four
  COMPARISON_ROWS dimensions to Lead
  capture, First response,
  Qualification, Voice negotiation.
  Keep it factual: no efficacy
  numbers, no client names, cite
  kvCORE pricing via an HTML source
  comment linking to
  `https://www.insiderealestate.com`
  or the current kvCORE pricing
  page.
- Append one new entry to
  `src/data/compareEntries.ts`:
  `{ id: 'kvcore', tool: 'kvCORE', path: '/compare/kvcore', tagline: '...' }`
  with a hyphen-only tagline. The
  `COMPARE_ENTRIES` array is the
  single mirror-source for both the
  `/compare` hub card grid AND the
  hub's `ItemList` JSON-LD
  `itemListElement` array per
  ticket 0048, so appending here
  automatically widens both.
- New route in `src/App.tsx`:
  import `KvCore` from
  `./pages/compare/KvCore` and add
  `<Route path="/compare/kvcore" element={<KvCore />} />`
  next to the existing
  `/compare/followupboss` route.
  Mirror the (non-)lazy-loading
  convention of the adjacent
  compare route. Per the
  2026-09-05 route-code-splitting
  lesson, if the route lazy-loads,
  the new spec must NOT rely on
  `root.innerHTML.length > N` for
  readiness.
- Per the 2026-06-07 src-imports-
  tests lesson, add `/compare/kvcore`
  to the `ROUTES` array in
  `src/data/routes.ts`;
  `tests/e2e/routes.ts` re-exports
  it automatically.
- Per the 2026-05-30 second-@type
  lesson, BEFORE writing code grep
  `tests/e2e/compare-*.spec.ts`
  AND `tests/e2e/*-jsonld.spec.ts`
  for `=== 'BreadcrumbList'` AND
  `=== 'WebPage'` predicates.
  Document the grep result in the
  Implementation log. The fourteen
  predecessor compare specs are
  each URL-scoped to their own
  `/compare/<tool>` route per the
  ticket 0073 Implementation log.
- Per the 2026-09-08 em-dash-
  JSON-LD-block-filter lesson,
  the em-dash assertion in the
  new spec filters the block list
  by the two `@type` values THIS
  page emits (`BreadcrumbList`,
  `WebPage`) BEFORE iterating.
  Never `for (const b of allBlocks)`.
  The homepage Organization block
  from `index.html` carries a
  legitimate em-dash.
- Per the 2026-05-25 SEO Pilot
  lesson, the new e2e spec
  asserts the Helmet-managed
  `meta[name="description"]`
  content directly (LAST
  `meta[name="description"]` per
  the 2026-05-25 Helmet-appends
  lesson), NOT
  `page.toHaveTitle()`.
  `/compare/kvcore` is NOT in
  the `index.html` SEO Pilot
  pages table.
- Per the 2026-05-07 em-dash
  Hard NO, every string in the
  page module and in the
  `compareEntries.ts` tagline
  uses hyphens. Self-Review
  greps the diff for
  `String.fromCharCode(8212)`
  before pushing.
- `tests/e2e/compare-kvcore.spec.ts`
  (new) - one assertion per
  acceptance box. Model the spec
  on
  `tests/e2e/compare-followupboss.spec.ts`
  (ticket 0065, the direct
  peer). The sibling-hub-
  regression case navigates to
  `/compare` and re-runs one key
  hub assertion (`COMPARE_ENTRIES.length`,
  card count, ItemList
  numberOfItems) to prove the
  additive edit widened both
  the render and the schema.
  Per the 2026-09-08 sibling-
  hub SPA-navigation lesson,
  the hub-regression case polls
  until at least one JSON-LD
  block's `name` equals the
  hub's expected name before
  reading.
- Per the 2026-05-22 two-PR
  ship lesson, ship will need
  a follow-up
  `chore/0086-ship-status` PR
  after the feat PR merges to
  flip the ticket frontmatter
  AND its `docs/backlog/README.md`
  index row to `shipped`
  together; run
  `node scripts/check-backlog.mjs`
  before pushing the second PR
  so the file and index never
  drift mid-flip.
- New deps: NO. The page
  reuses `react-router-dom`,
  `react-helmet-async`,
  `lucide-react`, the existing
  Navbar / Footer / StickyCTA /
  ScrollProgress components,
  the existing `trackCTAClick`
  helper, and the existing
  `useContent` hook. Schema
  migration: no. Privacy /
  security surface change: NO -
  the page is static marketing
  copy and emits no new network
  call.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-20 - branch `feat/0086-compare-kvcore` opened; ticket flipped to in-progress on branch (main branch protected).
- 2026-09-20 - Pre-code grep per the 2026-05-30 second-@type lesson. `grep -rn "=== 'BreadcrumbList'" tests/e2e/compare-*.spec.ts tests/e2e/*-jsonld.spec.ts` and `grep -rn "=== 'WebPage'" tests/e2e/compare-*.spec.ts tests/e2e/*-jsonld.spec.ts`. Every predecessor "exactly one" predicate over `BreadcrumbList` or `WebPage` is URL-scoped to a different route (`/compare/{buildertrend,housecallpro,jobber,podium,jobtread,angi,thumbtack,servicetitan,followupboss}`, `/compare`, `/changelog`, `/trust`, `/texas`, `/quiz`, `/glossary`, per-case-study, blog collection). None assert "exactly one of either `@type` site-wide"; a new `/compare/kvcore`-scoped pair does NOT collide.
- YYYY-MM-DD - failing test added in `tests/e2e/compare-kvcore.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
