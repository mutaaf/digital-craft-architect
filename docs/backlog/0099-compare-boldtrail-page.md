---
id: 0099
title: Comparison page "Digital Craft vs BoldTrail" for real-estate CRM lead-generation switchers
status: groomed
priority: P1
area: seo
created: 2026-09-26
owner: gtm-innovation
---

## User story

As a residential real-estate broker or team lead evaluating BoldTrail as
their CRM plus lead-generation stack (a 25-agent brokerage two years into
a BoldTrail subscription evaluating whether the platform answers the
buyer leads it stores after 6pm, an independent team lead comparing
BoldTrail and Follow Up Boss at renewal, an operations lead for a
mid-market brokerage weighing BoldTrail's website plus CRM plus paid-
lead bundle against the AI agent conversation layer), Googling "BoldTrail
alternative," "BoldTrail vs," "AI for real estate CRM," "BoldTrail AI
integration," "kvCORE BoldTrail comparison," or arriving from the
`/compare` hub after tapping the fifteenth card, I want one honest
comparison page at `/compare/boldtrail` that names which job BoldTrail
does well (a residential-real-estate operating system bundling IDX
websites, paid-lead capture, CRM, drip campaigns, smart-plans, and
squeeze-page landing pages under the Inside Real Estate umbrella that
absorbed kvCORE) and which job Digital Craft does instead (answering,
qualifying, and voice-negotiating the leads a real-estate CRM already
stores, plus running live AI voice negotiations with sellers), so that I
can decide in 90 seconds whether the AI agent layer is a replacement, a
complement, or a pass without bouncing back to search.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the comparison-page pattern is
now proven across FIFTEEN shipped pages under `src/pages/compare/*.tsx`
(HubSpot, GoHighLevel, Zapier, Make, Intercom, Jobber, ServiceTitan,
Podium, Housecall Pro, Buildertrend, Thumbtack, Angi, Follow Up Boss,
JobTread, kvCORE) and the canonical `/compare` hub (ticket 0048) reads
from `src/data/compareEntries.ts` and picks up any sixteenth entry
automatically. Adding this comparison is one new page file, one new spec
file, two two-line entries (route in `src/App.tsx`, path in
`src/data/routes.ts`), and one new entry in `src/data/compareEntries.ts`.
BoldTrail is the closest ADJACENT residential-real-estate CRM to kvCORE
(ticket 0086) and Follow Up Boss (ticket 0065) but the positioning is
distinct: BoldTrail is Inside Real Estate's next-generation consolidated
platform (the successor and rebrand of kvCORE plus BoomTown), pitched to
teams and brokerages that want IDX website plus CRM plus paid-lead
capture plus smart-plans in one contract with one bill. Both kvCORE
(ticket 0086) and BoldTrail explicitly compete for the same paying real-
estate brokerage buyer, and the ticket 0086 kvCORE page's own Out of
Scope list pre-authorizes future comparisons against other Inside Real
Estate platforms per the 2026-05-22 bootstrap-from-Out-of-Scope
convention. Structurally identical to kvCORE (ticket 0086) and Follow Up
Boss (ticket 0065) in the compare-page shape and in the real-estate
vertical positioning. Zero new component, zero new data shape, zero new
JSON-LD `@type` first emission.

### Stakeholder

This widens the SEO moat in a query class the fifteen existing
comparison pages structurally cannot capture: the real-estate-CRM SERP
niche around BoldTrail ("BoldTrail alternative," "BoldTrail vs,"
"BoldTrail AI integration," "AI for real estate CRM," "Inside Real
Estate BoldTrail comparison," "BoldTrail kvCORE difference"). BoldTrail
is now one of the three dominant residential real-estate CRMs (with
Follow Up Boss and kvCORE) and is the fastest-growing because it
consolidates the Inside Real Estate portfolio; the real-estate funnel
(`/realestate`, `/realestate/demo`, `/case-studies/realestate`) now has
Follow Up Boss and kvCORE comparison anchors but no BoldTrail anchor.
Per the 2026-05-30 second-@type lesson, BEFORE writing code the
implementer greps every existing `tests/e2e/compare-*.spec.ts` AND
every existing `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'`
AND `=== 'WebPage'` predicates; the fifteen predecessor compare specs
are each URL-scoped to their own `/compare/<tool>` route per the ticket
0086 Implementation log, so a sixteenth `/compare/boldtrail`-scoped
pair cannot collide. The grep is mandatory and its result is documented
in the Implementation log. This is also the THIRD real-estate-vertical-
specific comparison page (Follow Up Boss and kvCORE were the first
two), which structurally lifts the credibility of the entire
`/realestate` funnel: a broker who taps "vs BoldTrail" from the
`/compare` hub self-selects as a paying real-estate-CRM subscriber, the
highest-intent prospect the real-estate funnel can produce.

### User (in the real moment of use)

A team lead running 25 agents Googles "BoldTrail alternative for
mid-market brokerage" on a laptop between morning showings. The SERP
surfaces `/compare/boldtrail` with a description that names the actual
frustration (paying for an IDX-plus-CRM-plus-paid-lead bundle that
captures leads all weekend but never answers the buyer who filled the
squeeze page Saturday night). One click and the page loads in under one
screen with a positioning sentence at the top ("BoldTrail runs your IDX
website, CRM, and paid-lead pipeline. Digital Craft answers the leads
that never become buyer appointments"), a four-row comparison table
(Lead capture, First response, Qualification, Voice negotiation), a
"Use both" section acknowledging BoldTrail still owns the IDX site,
squeeze-page, paid-lead-source, and CRM record work a brokerage depends
on while AI handles the first-touch and after-hours qualification,
three demo CTAs routing to the existing real-estate demos
(`/realestate/demo/lead-responder`, `/realestate/demo/property-
negotiator`, `/realestate/demo/voice-negotiator`), and one strategy-
call CTA below. The broker leaves in 90 seconds knowing whether the AI
agent layer is a replacement, a complement, or a pass. Light and dark
mode supported; the page reads cleanly on a 375px viewport.

### Growth

The "show me" moment is the SERP listing for "BoldTrail alternative"
surfacing a real, honest comparison page that does NOT trash BoldTrail
but reframes the spend (their IDX-plus-CRM-plus-paid-lead bundle plus
our AI agent layer, not their platform replaced). A team lead who
Slack-shares the page to a peer with "this is exactly the frame I was
missing" is the cheapest qualified strategy-call the real-estate funnel
can produce because the share is peer-to-peer between two paying
BoldTrail subscribers, both of whom are already spending on real-estate
CRM software. The comparison hub (`/compare`) picks up the new entry
via `COMPARE_ENTRIES.length` mapping automatically per the ticket 0048
mirror-source pattern. The compare JSON Feed (ticket 0095
`/compare.json`) also picks up the new entry automatically because its
generator reads `COMPARE_ENTRIES` verbatim, so a competitive-intelligence
platform subscribed to the JSON Feed gets the BoldTrail comparison on
the next fetch after ship day with zero additional work.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against
this list before writing code.

- [ ] A new page `src/pages/compare/BoldTrail.tsx` (new file, under 260
  lines) renders at `/compare/boldtrail`, modeled 1:1 on
  `src/pages/compare/KvCore.tsx` (ticket 0086, the closest structural
  peer at similar file size AND hub-aware breadcrumb shape) with real-
  estate-vertical positioning cross-referenced against
  `src/pages/compare/FollowUpBoss.tsx` (ticket 0065) for the
  "specialist tool plus AI layer" narrative shape. The page has a hero
  H1 ("Digital Craft AI vs BoldTrail"), a positioning paragraph naming
  BoldTrail's real strength (Inside Real Estate's next-generation
  residential-real-estate operating system bundling IDX websites,
  squeeze-page and paid-lead capture, CRM, drip campaigns, and smart-
  plans for brokerages and teams; the successor and rebrand of kvCORE
  plus BoomTown) and Digital Craft's complementary strength (AI
  answering, qualifying, and voice-negotiating the leads a real-estate
  CRM stores, plus live AI voice negotiations with sellers), a four-row
  comparison table (Lead capture, First response, Qualification, Voice
  negotiation) with short text cells (NOT check/x icons, matching the
  ticket 0086 rationale that the two tools solve different jobs), a
  "Use both" or three-differentiator strip, three demo CTAs routing to
  `/realestate/demo/lead-responder`,
  `/realestate/demo/property-negotiator`,
  `/realestate/demo/voice-negotiator`, and one strategy-call CTA
  reusing the existing Calendly URL. Every claim is defensible: no
  invented brokerage names, no fabricated efficacy percentages, no
  BoldTrail pricing figure the page cannot cite from
  `insiderealestate.com` or `boldtrail.com` in an HTML source comment
  per the 2026-05-25 mirror-source-fix rule. Positioning is complement-
  not-replace per the ticket 0086 precedent.
- [ ] The page emits TWO JSON-LD blocks inside the existing `<Helmet>`
  head matching the fifteen-page convention: a `BreadcrumbList` (Home
  to Compare to Digital Craft vs BoldTrail) using the hub-aware three-
  item shape from `src/pages/compare/KvCore.tsx` (with the middle item
  named "Compare" linking to `/compare`), and a `WebPage` block with
  `name`, `description` (equal to `META_DESCRIPTION` per the 2026-05-25
  mirror-source rule), `url:
  'https://digitalcraftai.com/compare/boldtrail'`, and `isPartOf: {
  '@type': 'WebSite', url: 'https://digitalcraftai.com' }`. Per the
  2026-05-30 second-@type lesson, BEFORE writing code the implementer
  greps every existing `tests/e2e/compare-*.spec.ts` AND every existing
  `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'` AND `===
  'WebPage'` predicates; the fifteen predecessor compare specs are each
  URL-scoped to their own `/compare/<tool>` route per the ticket 0086
  Implementation log, so a sixteenth `/compare/boldtrail`-scoped pair
  cannot collide. The grep is mandatory regardless and the result is
  documented in the Implementation log.
- [ ] A new entry is appended to `src/data/compareEntries.ts` for
  BoldTrail: `{ id: 'boldtrail', tool: 'BoldTrail', path:
  '/compare/boldtrail', tagline: 'BoldTrail bundles your IDX website,
  paid-lead capture, and CRM under the Inside Real Estate umbrella.
  Digital Craft is the AI agent layer that answers the buyer leads a
  CRM never gets around to.' }`. The tagline is hyphen-only per the
  2026-05-07 em-dash Hard NO. The `/compare` hub (ticket 0048
  `src/pages/CompareHub.tsx`) reads `COMPARE_ENTRIES.length` and
  renders one card per entry automatically, so appending here surfaces
  the BoldTrail card on the hub without a hub edit. The hub's
  `ItemList` JSON-LD `numberOfItems` and `itemListElement` both derive
  from `COMPARE_ENTRIES` so both widen automatically. The compare JSON
  Feed (ticket 0095 `/compare.json`) also derives its item count and
  entries from `COMPARE_ENTRIES` so the new BoldTrail entry lands in
  the JSON Feed on ship day with zero additional work; the new spec
  asserts that `/compare.json`'s `items.length` equals
  `COMPARE_ENTRIES.length` after the additive edit (regression check
  per the ticket 0095 mirror-source rule).
- [ ] The new route is registered in `src/App.tsx` next to the existing
  `/compare/kvcore` route. The implementer adds `/compare/boldtrail` to
  the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-
  imports-tests lesson; `tests/e2e/routes.ts` re-exports it
  automatically and the smoke spec exercises the page. The sitemap
  generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the
  new App route automatically and emits a `lastmod` from the commit
  date. Per the 2026-09-05 route-code-splitting lesson, if the route
  is `React.lazy`-wrapped mirroring adjacent `/compare/*` routes, the
  new spec must NOT rely on `root.innerHTML.length > N` for readiness;
  the `gotoBoldTrail` helper adds an H1 visibility wait per the
  2026-09-10 mount-signal lesson.
- [ ] The page renders in light AND dark mode on a 375px mobile
  viewport, contains zero em-dash characters (`U+2014`) in any
  rendered text, in the `compareEntries.ts` addition, or in any
  JSON-LD serialized string. Per the 2026-09-08 em-dash-JSON-LD-block-
  filter lesson, the em-dash check in the new spec scopes ONLY to the
  two blocks THIS page emits (`BreadcrumbList` and `WebPage`) filtered
  by their `@type`, NOT to every `application/ld+json` block on the
  page. The homepage Organization block from `index.html` carries a
  legitimate em-dash and must not be flagged by the
  `/compare/boldtrail` spec. Every CTA route resolves to a registered
  route in `src/data/routes.ts`. The three demo CTAs route to
  `/realestate/demo/lead-responder`,
  `/realestate/demo/property-negotiator`, and
  `/realestate/demo/voice-negotiator` (the three real-estate demos
  that map to the four comparison dimensions); the strategy-call CTA
  opens Calendly in a new tab with `rel="noopener noreferrer"`
  matching the existing compare-page convention from 0086.
- [ ] A new e2e spec at `tests/e2e/compare-boldtrail.spec.ts` (modeled
  on `tests/e2e/compare-kvcore.spec.ts` from ticket 0086) asserts,
  using a `gotoBoldTrail(page)` helper that waits for RouteFallback
  detach AND the H1 to be visible before reading page state (2026-09-05
  + 2026-09-10 lessons): (1) the page returns a status under 400 and
  the H1 contains "BoldTrail" (case-insensitive substring), (2) the
  `meta[name="description"]` content names "BoldTrail" (asserted on the
  LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends
  lesson), (3) the `BreadcrumbList` JSON-LD has three items, the
  middle one named "Compare" and linking to
  `https://digitalcraftai.com/compare`, the third named matching the
  H1 substring and linking to
  `https://digitalcraftai.com/compare/boldtrail`, (4) the `WebPage`
  JSON-LD's `description` byte-matches the `meta[name="description"]`
  content per the 2026-05-25 mirror-source rule, (5) the four
  comparison-table rows exist (Lead capture, First response,
  Qualification, Voice negotiation) via
  `data-testid="boldtrail-comparison-row"` count of 4, (6) the three
  demo CTAs each resolve to a `/realestate/demo/*` route present in
  `ROUTES` (imported from `tests/e2e/routes.ts`), (7) the page text
  contains no `String.fromCharCode(8212)` code point, (8) dark mode
  renders cleanly via `document.documentElement.classList.add('dark')`,
  (9) sibling-hub-regression case navigates to `/compare` and asserts
  (a) the hub card count equals `COMPARE_ENTRIES.length` (imported
  from `src/data/compareEntries.ts` per the 2026-06-07 lesson), (b) a
  card with tool text "BoldTrail" is present, (c) the hub's `ItemList`
  JSON-LD `numberOfItems` equals `COMPARE_ENTRIES.length` to prove the
  additive `compareEntries.ts` edit widened both the render and the
  schema per the ticket 0048 mirror-source rule, (d) an HTTP GET to
  `/compare.json` (ticket 0095) returns 200 and the parsed body's
  `items.length` equals `COMPARE_ENTRIES.length` (regression check
  that the additive edit also widened the JSON Feed per the ticket
  0095 pattern). Per the 2026-09-08 sibling-hub SPA-navigation lesson
  the hub-regression case polls until at least one JSON-LD block's
  `name` equals the hub's own expected name before reading, not just
  "count greater than zero." Per the 2026-06-15 attribute-list regex
  lesson, any regex in the spec that matches XML/HTML attribute lists
  uses `[^>]*`, not `[^/>]*`.
- [ ] Standard box: no `/api/` change, no new hostname (the only
  external link is the existing Calendly URL already used on every
  compare page), no new npm dependency, no edits to
  `package.json` / `package-lock.json`, no edits to the fifteen
  existing `src/pages/compare/*.tsx` pages or their specs beyond the
  additive `compareEntries.ts` entry. `node scripts/check-backlog.mjs`,
  `npm run check-links`, `npm run check-images`, `npm run check-meta`,
  `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`,
  `npm run build` all stay green. The new spec passes; every pre-
  existing `tests/e2e/compare-*.spec.ts` (fifteen of them) stays green;
  the existing `tests/e2e/compare-hub.spec.ts` (ticket 0048) stays
  green because its assertion reads `COMPARE_ENTRIES.length` and
  widens automatically; the existing `tests/e2e/compare-json-feed.spec.ts`
  (ticket 0095) stays green because its assertion also reads
  `COMPARE_ENTRIES.length` and widens automatically.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem
related.

- Standard anti-goals: no `/api/` changes, no `package.json` changes,
  no em-dashes in copy, dark-mode required.
- A second comparison page in the same ticket (Real Geeks, Sierra
  Interactive, Lofty, Chime, LionDesk, Wise Agent, Placester, CINC).
  Each comparison is one ticket per the ticket 0021 to 0086 precedent;
  this ticket picks BoldTrail as the next real-estate-vertical
  incumbent not yet covered. The other names above are separate future
  tickets.
- Editing the ticket 0086 kvCORE page. This ticket is purely additive;
  the kvCORE peer stays byte-identical.
- Editing the ticket 0065 Follow Up Boss page. Same rule; the peer
  stays byte-identical.
- A "BoomTown vs BoldTrail" or "kvCORE vs BoldTrail" cross-comparison
  page. Each comparison is scoped to Digital Craft vs one competitor
  per the ticket 0021 to 0086 pattern; multi-competitor comparisons
  are a distinct product surface.
- Cross-promoting the new page from the homepage hero, the
  `/realestate` landing page, or the `/case-studies` hub. Cross-
  surface promotion is its own follow-up ticket.
- Adding a Google-Reviews AggregateRating JSON-LD block. Digital Craft
  does not have a defensible source for a real-estate-vertical
  aggregate rating; a fabricated rating is a Hard NO per AGENTS.md.
- Adding BoldTrail-specific pricing figures without a citable source.
  If the page names a BoldTrail price tier, the price must be cite-
  able to `insiderealestate.com` or `boldtrail.com` in an HTML source
  comment per the 2026-05-25 mirror-source-fix rule and the 2026-09-12
  code-beats-prose lesson. If no defensible public price exists at
  branch head, the page omits the price and names only the bundle
  shape (IDX plus CRM plus paid-lead capture) without a dollar figure.
- Adding a "migrate from BoldTrail to Digital Craft" step-by-step CTA.
  The page is complement-positioned per the ticket 0086 precedent;
  the strategy-call CTA is the single conversion action.
- Adding a `Product` or `Offer` JSON-LD block for a specific Digital
  Craft service tier as part of this ticket. The ticket 0075 homepage
  Product+Offer block is the canonical offer JSON-LD; adding a second
  on the compare page would risk a per-page collision.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't
have to re-discover the architecture.

- New `src/pages/compare/BoldTrail.tsx` (under 260 lines). Mirror
  `src/pages/compare/KvCore.tsx` (ticket 0086) verbatim: same imports,
  same section layout, same four-row comparison table, same three
  demo-card grid, same footer strategy-call CTA. Every Tailwind color
  class carries its `dark:` variant. Substitute the BoldTrail copy in
  every string slot; leave every href identical.
- Copy for the positioning paragraph, the comparison table cells, and
  the "use both" strip is defensible per AGENTS.md: name BoldTrail's
  real strength (Inside Real Estate's consolidated platform, IDX +
  CRM + paid-lead capture + smart-plans) without inventing efficacy
  percentages, brokerage-count claims, or lead-volume figures. Draw
  the language from public Inside Real Estate documentation
  (`insiderealestate.com`, `boldtrail.com`) without citing specific
  cost-per-tier figures unless a defensible public source exists at
  branch head.
- `src/App.tsx` - add `<Route path="/compare/boldtrail" element={<BoldTrail />} />`
  after the existing `/compare/kvcore` route per the ticket 0086
  convention. Wrap in the existing
  `<Suspense fallback={<RouteFallback />}>` shell and lazy-import via
  `React.lazy(() => import('./pages/compare/BoldTrail'))` per the
  2026-09-05 route-code-splitting lesson.
- `src/data/routes.ts` - add `/compare/boldtrail` to the `ROUTES`
  array after the existing `/compare/kvcore` entry per the ticket
  0086 convention. Per the 2026-09-12 code-beats-prose lesson, the
  implementer greps the actual order at branch head before inserting.
- `src/data/compareEntries.ts` - append the BoldTrail entry
  `{ id: 'boldtrail', tool: 'BoldTrail', path: '/compare/boldtrail',
  tagline: '...' }`. Per the 2026-09-12 code-beats-prose lesson AND
  the ticket 0095 implementer's note that the actual shape is
  `id | tool | path | tagline`, the implementer greps the file first
  and pins the fields to the shipped shape.
- Per the 2026-05-25 mirror-source rule, the `META_DESCRIPTION`
  string authored inside `BoldTrail.tsx` is the same string set on
  the `meta[name="description"]` (via Helmet), emitted into the
  `WebPage` JSON-LD `description`, and referenced by the spec. Do
  NOT hand-roll a second copy.
- Per the 2026-05-30 second-@type lesson, BEFORE writing code grep
  every `tests/e2e/compare-*.spec.ts` AND every
  `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'` AND `===
  'WebPage'` predicates. Every predecessor compare-page assertion is
  URL-scoped so the sibling on `/compare/boldtrail` cannot collide.
  The grep result is documented in the Implementation log.
- Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the spec's
  em-dash assertion filters the block list to the two `@type`s THIS
  page emits before iterating; it does NOT loop over every
  `application/ld+json` script on the page (the homepage Organization
  block from `index.html` ships site-wide and carries a legitimate
  em-dash).
- Per the 2026-09-05 route-code-splitting lesson, the new page's e2e
  helper waits for the RouteFallback to detach AND for the hero H1 to
  be visible before probing the DOM. Do NOT rely on
  `root.innerHTML.length > 500` alone; the fallback trips that
  heuristic before the lazy chunk mounts.
- Per the 2026-09-08 sibling-hub-name-poll lesson, the sibling-hub-
  regression case in the new spec that navigates from
  `/compare/boldtrail` to `/compare` polls until at least one JSON-LD
  block's `name` equals the hub's own expected name before reading;
  do NOT rely on a "count greater than zero" JSON-LD poll (Helmet's
  head-swap timing during an SPA navigation is a known-stale-DOM
  window per the ticket 0071 lesson).
- Per the 2026-06-07 mirror-source-across-src-tests lesson, the spec
  imports `COMPARE_ENTRIES` from `src/data/compareEntries.ts` and
  `ROUTES` from `src/data/routes.ts` directly; do NOT hand-roll
  copies in the test file.
- Per the 2026-06-15 attribute-list regex lesson, any regex in the
  spec that matches XML/HTML attribute lists (e.g. reading `<script
  type="application/ld+json">` blocks by tag matching) uses `[^>]*`,
  not `[^/>]*`.
- Per the ticket 0095 mirror-source cascade, the new spec's
  regression case for `/compare.json` re-fetches the JSON Feed and
  asserts its `items.length` equals `COMPARE_ENTRIES.length` after
  the additive edit; a mismatch signals a regeneration gap. This is
  the same pattern as the ticket 0086 `/compare` hub `ItemList`
  regression check widened to include the JSON Feed.
- `tests/e2e/compare-boldtrail.spec.ts` (new) - one assertion per
  acceptance box. Model the spec on
  `tests/e2e/compare-kvcore.spec.ts` (ticket 0086, the direct
  predecessor peer for a real-estate-vertical comparison page).
- Per the 2026-05-22 two-PR ship lesson, ship will need a follow-up
  `chore/0099-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter AND its `docs/backlog/README.md` index row to
  `shipped` together; run `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index never drift mid-flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, and Tailwind utility classes
  already in use on the fifteen predecessor compare pages. Schema
  migration: no. Privacy / security surface change: no (the page
  renders server-side-safe static content; no new localStorage key,
  no new hostname, no new outbound network call beyond the existing
  Calendly URL used on every compare page).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0099-compare-boldtrail-page` opened
- YYYY-MM-DD - failing test added in `tests/e2e/compare-boldtrail.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
