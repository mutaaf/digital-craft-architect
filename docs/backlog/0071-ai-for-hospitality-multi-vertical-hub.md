---
id: 0071
title: AI-for-hospitality multi-vertical hub page indexing events, restaurant, kidsplay, salon, and fitness demos with CollectionPage JSON-LD
status: in-progress
priority: P1
area: content
created: 2026-09-08
owner: gtm-innovation
---

## User story

As an operator running a hospitality-adjacent business
(a venue owner comparing event booking, catering, and
front-desk automation across three brands, a franchise
director evaluating AI for a portfolio that spans a
salon chain plus a kids-play birthday-party operation
plus a fitness studio, a hospitality-technology
consultant advising a family-office owner) Googling
"AI for hospitality," "AI for hospitality businesses,"
"AI receptionist for hospitality," "AI for event
venues and restaurants," or "hospitality AI
automation" on a laptop between site visits, I want
one canonical hub page at `/ai-for-hospitality` that
lists the five hospitality-adjacent verticals Digital
Craft already ships demos for (events, restaurant,
kidsplay, salon, fitness) with a one-sentence summary
per vertical, the demo count, and a "See the demos"
link out to each `/<vertical>/demo` hub, so that I can
map the hospitality footprint of my portfolio in one
screen and forward the URL to my operations partner
instead of five separate vertical links.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: every leaf page
already exists. `src/data/routes.ts` (the canonical
allow-list per the 2026-06-07 src-imports-tests
lesson) already carries `/events`, `/events/demo`,
`/restaurant`, `/restaurant/demo`, `/kidsplay`,
`/kidsplay/demo`, `/salon`, `/salon/demo`, `/fitness`,
`/fitness/demo`, plus the per-vertical demo children.
The vertical marketing pages render at each root, the
demo hubs render at `/<vertical>/demo`, and the demos
themselves are covered by ticket 0011's `/demos` index
hub. There is NO umbrella page for the hospitality
category. This ticket adds exactly one new hub page
that groups the five verticals under a single canonical
URL, so a hospitality-focused SERP query lands on one
page that talks to that persona instead of dropping
them onto the events page OR the restaurant page OR
the fitness page depending on which head term Google
chose. Zero new backend, zero new demo, zero new
dependency; the hub reads a new module-level
constant `HOSPITALITY_VERTICALS: readonly HospitalityVertical[]`
listing each vertical's `path`, `demoPath`, `label`,
`summary`, and `demoCount` derived from the existing
ROUTES array (the demoCount is a `filter` over ROUTES
matching `/<vertical>/demo/*`). The hub emits a
`CollectionPage` + `ItemList` + `BreadcrumbList`
JSON-LD triple mirroring the ticket 0048 `/compare`
hub and ticket 0057 `/case-studies` hub patterns.

### Stakeholder

This widens the SEO moat in a head-term query class
that no shipped page targets. The tickets 0017 / 0020
/ 0024 / 0034 / 0037 / 0041 / 0047 / 0050 / 0056 /
0058 shipped ten single-trade AI-for-X landing pages
(plumbers, HVAC, roofers, electricians, painters,
landscapers, property managers, cleaning services,
pest control, pool service) all inside the home-
services family. There is no MULTI-vertical hub in
that family and there is no hospitality-family hub at
all. Hospitality is a distinct SERP category
(travel, events, restaurants, salons, fitness studios,
kids-entertainment venues, front-of-house-heavy
businesses) that a portfolio-owner or franchise-
director search skew targets specifically. Per the
user-brief guardrail explicitly allowing a multi-
vertical hub ("unless you're proposing a materially
different structure e.g. a MULTI-vertical hub, not
another single-vertical page"), this ticket does not
repeat the single-vertical pattern. It is structurally
closer to the ticket 0048 `/compare` hub and ticket
0011 `/demos` hub than to any single AI-for-X page.
Per the 2026-05-30 second-@type lesson, BEFORE
writing code the implementer greps every
`tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'`,
`=== 'ItemList'`, and `=== 'BreadcrumbList'`
predicates and confirms the ticket 0048 `/compare`
hub, ticket 0057 `/case-studies` hub, and ticket 0011
`/demos` hub predicates are all URL-scoped (their
`gotoHub` helpers each navigate to only their
canonical URL) per each ticket's Implementation log,
so a sibling `CollectionPage` + `ItemList` block on
`/ai-for-hospitality` cannot collide. If any
predecessor predicate IS site-wide, the implementer
widens it in the SAME PR by identifying its block by
a unique field (e.g. `/compare` CollectionPage
`name: 'AI Software Comparisons'`) rather than by
"the only CollectionPage block."

### Visitor (in the real moment of use)

A hospitality-technology consultant scrolls a client
brief on a laptop Monday morning ("evaluate AI for
their events + salon + fitness portfolio"), Googles
"AI for hospitality automation," and taps the top
result at `/ai-for-hospitality`. The page loads with
a hero H1 ("AI for Hospitality Businesses"), a one-
paragraph intro naming the five verticals covered
and the shared hospitality pattern (front-of-house
inquiry response, booking flow, follow-up, review
capture), then a five-card grid: one card per
vertical. Each card shows the vertical badge
(Events / Restaurant / Kids-Play / Salon / Fitness),
a one-sentence summary of the vertical's AI
opportunity (e.g. "Answer every event-venue inquiry
in seconds, qualify budget and date, and book
walkthroughs on autopilot" for Events), the demo
count ("3 live demos"), and two links: "See the
demos" to `/<vertical>/demo` and "Read the vertical
page" to `/<vertical>`. A short "Why hospitality
buyers pick Digital Craft" section below the grid
lists three shared reasons (no fabricated stats),
each linking to the corresponding trust artifact
(`/trust`, `/playbook`, `/questions-to-ask-an-ai-vendor`).
At the bottom: one strategy-call CTA. Light and
dark mode supported; the page reads cleanly on a
375px viewport.

### Growth

The "show me" moment is the URL a consultant forwards
to their franchise-director client: "one link, five
verticals, matches your portfolio." That is exactly
the artifact a multi-brand operator forwards when
they want their board to see the umbrella coverage
before drilling into any single vertical. Per the
ticket 0048 `/compare` hub, ticket 0057
`/case-studies` hub, and ticket 0011 `/demos` hub
precedents, a canonical hub URL is the cheapest
acquisition lever for head-term SERP intent because
the URL is one tier above any specific leaf page and
Google ranks the hub for the umbrella query while
ranking each leaf for its specific vertical query.
Each vertical card's primary link fires
`trackCTAClick('hospitality_hub_card_<vertical>',
'ai-for-hospitality')` and the bottom strategy-call
CTA fires
`trackCTAClick('hospitality_hub_strategy_call',
'ai-for-hospitality')` per the ticket 0057 hub-card
telemetry pattern.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/AiForHospitality.tsx` (new file, under 260 lines) renders at `/ai-for-hospitality`. The page uses the existing `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell mirrored from `src/pages/CompareHub.tsx` (ticket 0048, the closest structural peer because both are cross-family hubs emitting `CollectionPage` + `ItemList` JSON-LD over a five-plus-item grid) and NOT from any single `AiForX.tsx` page (which are single-vertical landing pages, a structurally different pattern). The page renders a hero (H1 contains "Hospitality" case-insensitive substring), an intro paragraph (one to two sentences per the AGENTS.md defensible-claims rule; no fabricated efficacy numbers, no client names), a five-card grid reading from a module-level `HOSPITALITY_VERTICALS` constant, a short "Why hospitality buyers pick Digital Craft" section with three shared reasons each linking to `/trust`, `/playbook`, or `/questions-to-ask-an-ai-vendor` respectively (the exact mapping is the implementer's choice; the spec asserts three trust-artifact links resolve to routes in ROUTES), and one strategy-call CTA at the bottom.
- [ ] The page exports `HOSPITALITY_VERTICALS: readonly HospitalityVertical[]` where `interface HospitalityVertical { id: string; label: string; path: string; demoPath: string; summary: string; demoCount: number }`. The five entries cover: (1) Events (`/events`, `/events/demo`), (2) Restaurant (`/restaurant`, `/restaurant/demo`), (3) Kids-Play (`/kidsplay`, `/kidsplay/demo`), (4) Salon (`/salon`, `/salon/demo`), (5) Fitness (`/fitness`, `/fitness/demo`). Each `path` and `demoPath` value MUST resolve to a path present in `ROUTES` from `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson. Each `demoCount` value is the count of ROUTES entries that start with `<demoPath>/` (i.e. per-demo children). The `demoCount` values are computed at module load time from the imported ROUTES array so they cannot drift when a new demo is added under any of the five demoPath prefixes; the spec asserts the rendered "N live demos" string per card matches this computed value.
- [ ] The card grid renders one card per `HOSPITALITY_VERTICALS` entry with `data-testid="hospitality-vertical-card"` for spec counting. Each card renders (a) the vertical `label` as an H3 or badge, (b) the `summary` as a one-sentence paragraph, (c) the demoCount as a small chip reading "N live demos" (rendered from the numeric value), (d) a primary anchor `<Link to={demoPath} data-testid="hospitality-vertical-demo-link">` labeled "See the demos", and (e) a secondary anchor `<Link to={path} data-testid="hospitality-vertical-page-link">` labeled "Read the vertical page". Every anchor's href is a static string derived from the `HOSPITALITY_VERTICALS` entry; there are no dynamic query params on the hub links.
- [ ] The page emits THREE JSON-LD blocks inside the existing `<Helmet>` head: (1) a `BreadcrumbList` (Home -> AI for Hospitality) mirroring the shape used in `src/pages/CompareHub.tsx`, (2) a `CollectionPage` block with `@type: 'CollectionPage'`, `name: 'AI for Hospitality Businesses'`, `description` (same string as the module-level `META_DESCRIPTION` constant per the 2026-05-25 mirror-source rule), `url: 'https://digitalcraftai.com/ai-for-hospitality'`, and (3) an `ItemList` block with `@type: 'ItemList'`, `itemListOrder: 'https://schema.org/ItemListOrderAscending'`, `numberOfItems: HOSPITALITY_VERTICALS.length`, and an `itemListElement` array where each entry is `{ '@type': 'ListItem', position: N, url: 'https://digitalcraftai.com<demoPath>', name: <label> }`. Both `numberOfItems` and `itemListElement` are derived from `HOSPITALITY_VERTICALS.length` and `.map(...)` so adding a sixth vertical automatically widens both.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'`, `=== 'ItemList'`, and `=== 'BreadcrumbList'` predicates and documents the result in the Implementation log. The ticket 0048 `/compare` hub, ticket 0057 `/case-studies` hub, and ticket 0011 `/demos` hub predicates for CollectionPage and ItemList are URL-scoped per each Implementation log; the ticket 0016 homepage WebSite spec is scoped to `/`. A sibling instance on `/ai-for-hospitality` therefore cannot collide with any predecessor "exactly one" predicate. If any predecessor predicate IS site-wide (widened uniqueness fields expected: `/compare` `name: 'AI Software Comparisons'`, `/case-studies` `name: 'Digital Craft AI Case Studies'`, `/demos` `SoftwareApplication` name), the implementer widens the predecessor in the SAME PR per the 2026-05-25 mirror-source-fix family rule. The BreadcrumbList grep is expected to return many URL-scoped matches per ticket 0063.
- [ ] The route is registered in `src/App.tsx` next to the existing `/ai-for-small-business` route (the small-business page is the closest sibling because both are cross-vertical umbrella pages, distinct from the ten single-trade `AiForX` pages). `/ai-for-hospitality` is added to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson; `tests/e2e/routes.ts` re-exports it automatically and the smoke spec exercises the page. The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date. Per the 2026-09-05 route-code-splitting lesson, if the route is `React.lazy`-wrapped mirroring adjacent AI-for-X routes, the new spec must NOT rely on `root.innerHTML.length > N` for readiness; auto-retrying `await expect(locator).toBeVisible()` and `.toHaveCount()` are required and the spec's `gotoRoute` helper waits for the RouteFallback spinner detachment per the same lesson.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text, in the `HOSPITALITY_VERTICALS` constant strings, or in any JSON-LD serialized string. Every hub link routes to a registered `/events`, `/events/demo`, `/restaurant`, `/restaurant/demo`, `/kidsplay`, `/kidsplay/demo`, `/salon`, `/salon/demo`, `/fitness`, or `/fitness/demo` path present in the imported `ROUTES` array. The three trust-artifact links (`/trust`, `/playbook`, `/questions-to-ask-an-ai-vendor` or the implementer's chosen subset of three) also resolve to routes in ROUTES.
- [ ] A new e2e spec at `tests/e2e/ai-for-hospitality.spec.ts` (modeled on `tests/e2e/compare-hub.spec.ts` from ticket 0048 for the hub-shape assertions and on the existing `tests/e2e/ai-for-plumbers.spec.ts` family for the AI-for-X-page shape) asserts: (1) `GET /ai-for-hospitality` returns 200 and the H1 contains "Hospitality" (case-insensitive substring), (2) the grid contains exactly five `data-testid="hospitality-vertical-card"` cards, (3) every `data-testid="hospitality-vertical-demo-link"` href resolves to a `<vertical>/demo` path present in the imported `ROUTES`, (4) every `data-testid="hospitality-vertical-page-link"` href resolves to a `<vertical>` path present in `ROUTES`, (5) the "N live demos" chip per card renders a numeric value matching the computed `demoCount` from ROUTES for that vertical's demoPath prefix, (6) the `CollectionPage` JSON-LD block carries `name: 'AI for Hospitality Businesses'` and `url: 'https://digitalcraftai.com/ai-for-hospitality'`, (7) the `ItemList` JSON-LD block has `numberOfItems === 5` AND `itemListElement.length === 5` AND each element's `url` matches `^https:\/\/digitalcraftai\.com\/(events|restaurant|kidsplay|salon|fitness)\/demo$`, (8) the `BreadcrumbList` JSON-LD has two items with the second one named matching the page H1 substring and linking to `https://digitalcraftai.com/ai-for-hospitality`, (9) the three "Why hospitality buyers pick Digital Craft" reason anchors resolve to routes in `ROUTES` (`/trust`, `/playbook`, `/questions-to-ask-an-ai-vendor` are all present today), (10) no-em-dash case reads `page.textContent('body')` and asserts no `String.fromCharCode(8212)`, (11) dark-mode case applies `document.documentElement.classList.add('dark')` and asserts the card grid still renders, (12) sibling-hub-regression case navigates to `/compare` and `/case-studies` and re-runs one key assertion per (CollectionPage `name` and ItemList `numberOfItems`) to prove the new hub did not silently widen a predecessor's site-wide predicate.
- [ ] Standard box: no em-dash in any copy or JSON-LD, dark-mode variants required on every new element, no `/api/` change, no `package.json` / `package-lock.json` edit, no new hostname (all links route to existing SPA routes on `digitalcraftai.com` and Calendly on the strategy-call CTA per the existing precedent). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint` stay green. The new spec passes; the existing `tests/e2e/compare-hub.spec.ts` (ticket 0048), `tests/e2e/case-studies-hub.spec.ts` (ticket 0057), `tests/e2e/demos-index-hub.spec.ts` (ticket 0011), `tests/e2e/ai-for-plumbers.spec.ts` and its nine per-trade siblings all stay green.

## Out of scope

- Standard anti-goals: no /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A sixth vertical (travel, hotel, spa, catering-only,
  gym-chain corporate, wedding-venue-specific,
  concierge, boutique-retail) added to the grid or
  the ROUTES array. This hub lists the five
  hospitality-adjacent verticals that already ship
  demos; adding a new vertical requires a full
  demo hub per the ticket 0011 pattern and is its
  own ticket. This ticket is CONSUMPTION-only over
  the existing ROUTES surface.
- A per-hospitality-vertical AiForX single-trade
  landing page (`AiForRestaurants.tsx`,
  `AiForSalons.tsx`, etc.). Each vertical already
  has its own marketing page at `/<vertical>` per
  the existing routes; a new single-vertical landing
  page under the AI-for-X pattern would duplicate
  the existing vertical page and violate the user-
  brief guardrail against another single-vertical
  page.
- A comparison table between the five verticals
  (which vertical has more demos, which has voice,
  etc.). The hub is a discovery surface, not a
  comparison surface; the ticket 0048 `/compare` hub
  owns comparison patterns.
- A search / filter widget on the grid. Five cards
  is too few to justify filter UI; revisit if the
  list exceeds eight entries per the ticket 0057
  filter precedent.
- A filter for demo type (voice / chat / estimate /
  reviews). The `/demos` hub (ticket 0011) already
  owns cross-vertical demo listing; duplicating
  that on this hub would create drift.
- Cross-promoting the new hub from the navbar or
  the footer. Per the ticket 0023 footer-chip
  precedent, cross-surface promotion ships on its
  own ticket only after telemetry shows the hub
  earns organic traffic on its own.
- Adding `/ai-for-hospitality` to the `index.html`
  SEO Pilot pages table. That is its own SEO-
  hygiene ticket per the 2026-05-25 SEO Pilot
  lesson; the new e2e spec asserts the Helmet-
  managed `meta[name="description"]` directly, not
  `page.toHaveTitle()`.
- An RSS or JSON feed at
  `/ai-for-hospitality/rss.xml`. The hub is a
  content-stable page (verticals shift infrequently);
  a feed is the wrong distribution channel.
- Editing any of the five underlying vertical pages
  or their demo hubs. This ticket is purely
  additive over ROUTES; the ticket 0011 `/demos`
  hub, the ticket 0057 `/case-studies` hub, and
  each `/vertical/demo` hub stay byte-identical.
- Fabricated efficacy numbers or hospitality-
  industry statistics on the hub ("hospitality
  businesses lose 60% of after-hours leads"). Every
  claim MUST be defensible per the AGENTS.md rule;
  the hub is a discovery surface, not a stats
  billboard.
- Emitting a `LocalBusiness` JSON-LD block on the
  hub. LocalBusiness is per-location (ticket 0051
  `/locations/texas` owns it) and this hub is not
  a location page.
- Emitting a `Service` JSON-LD block per vertical
  card. Service schema is per-productized-service;
  the cards here are category groupings, not
  productized services. `CollectionPage` +
  `ItemList` is the correct shape.
- Adding a booking widget or a hospitality-
  industry email-capture form. The hub is a
  discovery artifact; capture is owned by the
  existing homepage 5-day-course opt-in and the
  strategy-call CTA per the ticket 0002 precedent.
- Internationalization (`inLanguage` fields on
  schema). The hub is English-only matching every
  existing hub.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/AiForHospitality.tsx` (under 260
  lines). Mirror the page-shell pattern of
  `src/pages/CompareHub.tsx` (ticket 0048, the
  closest peer because both are cross-family hubs
  emitting `CollectionPage` + `ItemList`) and NOT
  `src/pages/AiForPlumbers.tsx` or any single-
  trade AiForX (those are single-vertical landing
  pages, a structurally different pattern per the
  user brief). Define module-level constants
  `META_DESCRIPTION`, `PAGE_H1`, `HOSPITALITY_VERTICALS`,
  `COLLECTION_PAGE_SCHEMA`, `ITEM_LIST_SCHEMA`,
  `BREADCRUMB_SCHEMA` per the 2026-05-25 mirror-
  source rule (the description used in the Helmet
  meta tag AND in
  `COLLECTION_PAGE_SCHEMA.description` MUST be a
  single `META_DESCRIPTION` constant; the H1
  string used in the render AND in the
  BreadcrumbList second item MUST be a single
  `PAGE_H1` constant).
- `HOSPITALITY_VERTICALS` is typed as
  `readonly HospitalityVertical[]` where
  `interface HospitalityVertical { id: string; label: string; path: string; demoPath: string; summary: string; demoCount: number }`.
  The constant has exactly five entries: events,
  restaurant, kidsplay, salon, fitness. Each
  `path` and `demoPath` value MUST match a string
  in the imported `ROUTES` array from
  `src/data/routes.ts` (the constant declaration
  imports ROUTES and asserts at module load time
  via a small `const _validate = HOSPITALITY_VERTICALS.every(v => ROUTES.includes(v.path) && ROUTES.includes(v.demoPath));`
  followed by `if (!_validate) throw new Error(...)`
  so a future ROUTES rename fails at module load
  instead of at Playwright run time). The
  `demoCount` value is computed as
  `ROUTES.filter(r => r.startsWith(demoPath + '/')).length`
  at module load time so it stays in sync with the
  ROUTES source when a new demo lands.
- New route in `src/App.tsx`: import
  `AiForHospitality` from `./pages/AiForHospitality`
  and add
  `<Route path="/ai-for-hospitality" element={<AiForHospitality />} />`
  next to the existing `/ai-for-small-business`
  route (the small-business page is the closest
  sibling because it is the only existing cross-
  vertical umbrella page). Mirror the (non-)lazy-
  loading convention of the adjacent
  `/ai-for-small-business` route. Per the
  2026-09-05 route-code-splitting lesson, if the
  route lazy-loads, the new spec must NOT rely on
  `root.innerHTML.length > N` for readiness; the
  spec's `gotoRoute` helper must wait for the
  RouteFallback spinner detachment (either by
  its unique testid or via
  `page.locator('[role="status"][aria-label="Loading"]').waitFor({ state: 'hidden' })`).
- Per the 2026-06-07 src-imports-tests lesson,
  add `/ai-for-hospitality` to the `ROUTES`
  array in `src/data/routes.ts` (the canonical
  allow-list); `tests/e2e/routes.ts` re-exports
  it automatically and the smoke spec exercises
  the page.
- Per the 2026-05-30 second-@type lesson, BEFORE
  writing code grep `tests/e2e/*-jsonld.spec.ts`
  for `=== 'CollectionPage'`, `=== 'ItemList'`,
  and `=== 'BreadcrumbList'` predicates. Document
  the grep result in the Implementation log. The
  ticket 0048 `/compare` hub spec, ticket 0057
  `/case-studies` hub spec, and ticket 0011
  `/demos` hub spec CollectionPage and ItemList
  predicates are URL-scoped per each ticket's
  Implementation log; the ticket 0016 homepage
  WebSite spec is scoped to `/`. A sibling
  `/ai-for-hospitality`-scoped
  CollectionPage + ItemList cannot collide. If
  any predecessor predicate IS site-wide,
  widen it in the SAME PR by identifying its
  block by a unique field (e.g. `/compare`
  `name: 'AI Software Comparisons'`,
  `/case-studies` `name: 'Digital Craft AI Case Studies'`,
  `/demos` `SoftwareApplication` name) rather
  than by "the only CollectionPage block"
  wording. The BreadcrumbList grep is expected
  to return many matches, all URL-scoped per
  ticket 0063.
- Per the 2026-05-25 SEO Pilot lesson, the new
  e2e spec asserts the Helmet-managed
  `meta[name="description"]` content directly
  (LAST `meta[name="description"]` per the
  2026-05-25 Helmet-appends lesson), NOT
  `page.toHaveTitle()`. `/ai-for-hospitality` is
  NOT in the `index.html` SEO Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every
  string in the page module (the H1, the
  META_DESCRIPTION, the five HOSPITALITY_VERTICALS
  labels and summaries, the "N live demos" chip
  template, the JSON-LD strings, the CTA label,
  the three trust-artifact anchor labels) uses
  hyphens. Self-Review greps the diff for
  `String.fromCharCode(8212)` before pushing.
- Per the 2026-09-06 VISIBLE_LIMIT window drift
  lesson, the new spec MUST NOT assert
  `count > 0` over a sliced ROUTES filter that
  could shift with data drift. The five cards
  are a FIXED list; the spec asserts
  `toHaveCount(5)`. The `demoCount` per-card
  assertion reads the computed value from
  ROUTES at test-import time so a future demo
  addition under any of the five demoPath
  prefixes is automatically absorbed by the
  spec.
- `tests/e2e/ai-for-hospitality.spec.ts` (new)
  - one assertion per acceptance box. Model
  the spec on `tests/e2e/compare-hub.spec.ts`
  (ticket 0048, the closest peer for "cross-
  family hub with CollectionPage + ItemList
  over a fixed grid"). The demoCount-per-card
  assertion imports `ROUTES` from
  `tests/e2e/routes.ts` (which re-exports
  `src/data/routes.ts`) and computes the
  expected count per demoPath in the test-
  environment code so the assertion tracks
  ROUTES drift automatically. The sibling-hub-
  regression case navigates to `/compare` and
  `/case-studies` and re-runs one CollectionPage
  `name` assertion per hub to prove no
  predecessor's site-wide predicate was silently
  widened.
- Per the 2026-05-22 two-PR ship lesson, ship
  will need a follow-up `chore/0071-ship-status`
  PR after the feat PR merges to flip the ticket
  frontmatter AND its `docs/backlog/README.md`
  index row to `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing
  the second PR so the file and index never
  drift mid-flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, the
  existing Navbar / Footer / ScrollProgress
  components, the existing `trackCTAClick`
  helper, and the existing `ROUTES` constant.
  Schema migration: no. Privacy / security
  surface change: no - the page is static
  marketing copy and emits no new network call.
  The `/trust` page disclosure list does NOT
  need an edit because no new persistent store
  is added.

## Implementation log

### 2026-09-08 - Pre-code grep per 2026-05-30 second-@type lesson

Ran `grep -rn "=== 'CollectionPage'" tests/e2e/`,
`grep -rn "=== 'ItemList'" tests/e2e/`, and
`grep -rn "=== 'BreadcrumbList'" tests/e2e/`. Results:

- `CollectionPage`: three matches - `compare-hub.spec.ts`,
  `case-studies-hub.spec.ts`, `subprocessors.spec.ts`. Every
  `.toHaveLength(1)` predicate for CollectionPage runs inside a
  test body that opens the page via a URL-scoped
  `gotoCompareHub` / `gotoCaseStudiesHub` /
  `gotoSubprocessors` helper (each navigates only to its own
  `/compare`, `/case-studies`, or `/subprocessors` route). No
  predecessor `CollectionPage` predicate is site-wide, so a
  new `/ai-for-hospitality`-scoped CollectionPage block
  cannot collide with any of them.
- `ItemList`: matches in `compare-hub.spec.ts`,
  `case-studies-hub.spec.ts`, `demos-index-hub.spec.ts`,
  `demos-softwareapplication-jsonld.spec.ts`,
  `changelog-itemlist-jsonld.spec.ts`,
  `website-sitelinks-jsonld.spec.ts`. Every "exactly one"
  ItemList predicate is URL-scoped (the compare and
  case-studies hubs to their own path, the demos ones to
  `/demos`, changelog to `/changelog`, website-sitelinks to
  `/`). A new `/ai-for-hospitality`-scoped ItemList cannot
  collide.
- `BreadcrumbList`: many matches, every one URL-scoped per
  ticket 0063; new `/ai-for-hospitality` BreadcrumbList is
  additive and non-colliding.

No predecessor predicate needs widening in this PR.
