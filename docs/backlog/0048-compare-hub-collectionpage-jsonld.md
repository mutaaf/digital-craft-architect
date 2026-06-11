---
id: 0048
title: Public /compare hub indexing every comparison page with CollectionPage and ItemList JSON-LD
status: groomed
priority: P1
area: seo
created: 2026-06-11
owner: gtm-innovation
---

## User story

As a buyer who searched for "Digital Craft alternatives" or
"AI for contractors vs other tools" and landed on one comparison
page (say `/compare/jobber`) but wants to see what other
incumbents Digital Craft is positioned against without
re-Googling, I want a single hub at `/compare` that lists every
shipped comparison page with a one-line positioning summary and
a thumbnail, so that I can pick the comparison that matches the
tool I actually pay for today instead of hunting for the right
URL or bouncing back to search.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: TEN comparison pages
ship at `/compare/{hubspot,gohighlevel,zapier,make,intercom,jobber,servicetitan,podium,housecallpro,buildertrend}`
today and the only way to discover them is via direct Google
search per the comparison-page URL or via per-page cross-links
that do not exist yet (ticket 0042 Out of Scope explicitly
deferred cross-linking). A single hub at `/compare` joining all
ten in a discoverable grid, with one new JSON-LD `CollectionPage`
block and one new `ItemList` block (NEITHER currently emitted
anywhere on the site - the `/changelog` page ticket 0043 emits
`ItemList` but the schema is per-list-scoped so `/compare` can
emit its own without collision), turns ten orphan SEO artifacts
into one canonical hub. One new page, two new JSON-LD blocks of
genuinely new @type combinations, zero new endpoint, zero new
component beyond the page itself.

### Stakeholder

This widens the SEO moat in a query class no existing page
covers: the "Digital Craft alternatives" / "Digital Craft
comparison" SERP. Today that query has no hub-level destination,
so each comparison page ranks alone and competes with itself for
related queries. A `/compare` hub becomes the canonical
collection page Google can elevate above the ten individual
comparison pages for hub-shaped queries, while each comparison
page keeps its own ranking signal for the brand-specific query.
The pattern is structurally identical to what ticket 0011
shipped for `/demos` (an `ItemList`-bearing hub above the
individual demo routes) and what ticket 0030 reinforced with
`SoftwareApplication`. `/compare` is the third such hub and
completes the triple of canonical hubs the site has earned:
`/demos` for demos, `/changelog` for ship velocity (ticket
0043), and now `/compare` for competitive positioning. The
hub is also a natural surface to add a future eleventh or
twelfth comparison page without re-architecting any of the
ten existing pages (the hub reads a single source-of-truth
constant; new comparisons append one line and surface
automatically).

### Visitor (in the real moment of use)

A 12-employee residential contractor who arrived at
`/compare/buildertrend` from a Google search wants to know
"what about my CRM" and taps a Navbar link or a footer link to
`/compare`. The hub loads in one screen: a calm grid of ten
cards, each naming an incumbent tool and a one-line positioning
summary ("Buildertrend - project management depth + add Digital
Craft as the AI lead-capture layer," "ServiceTitan - field-
service CRM, Digital Craft is the AI conversation layer," etc.),
each card linking to the matching `/compare/*` page. No
marketing fluff, no hero CTA above the grid, no testimonials -
just a clean directory. Light and dark mode supported; the
grid reads cleanly as one column on a 375px viewport.

### Growth

The "show me" moment is the SERP listing for "Digital Craft AI
comparison" or "Digital Craft alternatives" surfacing a real hub
page instead of one comparison or the homepage. A buyer who
arrives at the hub from search and clicks one card has self-
selected the most-relevant comparison; that is the highest-
intent click the comparison family can produce. Each card click
fires `trackCTAClick` with a `comparehub_*` location label
naming the destination comparison, so the funnel reveals which
incumbent positioning earns the most click-through - directly
informing which next comparison page is the highest-leverage
ship. The hub is also the natural Navbar / Footer link surface
once it exists; per the AGENTS.md "small focused PRs" rule the
Navbar / Footer wiring is a follow-up ticket once the hub itself
ranks.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/CompareHub.tsx` (new file, under 180 lines) renders at `/compare`. The page uses the existing `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell mirrored from `src/pages/Demos.tsx`. The page renders one short hero (one H1 reading "Compare Digital Craft to your current stack," one supporting paragraph, no CTA above the grid), one grid of N cards (N = the length of the new `COMPARE_ENTRIES` constant, today 10), and one footer note. Each card names the incumbent tool, one-line positioning summary, and a "See comparison" link routing to the matching `/compare/*` path. No marketing testimonials, no inflated numbers; the positioning summaries are factual one-liners about which side wins which dimension.
- [ ] A new data file `src/data/compareEntries.ts` (under 80 lines) exports a typed `COMPARE_ENTRIES` constant of shape `{ id: string; tool: string; path: string; tagline: string }[]` listing all ten existing comparison pages (HubSpot, GoHighLevel, Zapier, Make, Intercom, Jobber, ServiceTitan, Podium, Housecall Pro, Buildertrend). The constant is the SINGLE source of truth for both the hub grid AND the `ItemList` JSON-LD per the 2026-05-25 mirror-source rule; the hub does NOT maintain a second list. Each `path` field MUST appear in the `ROUTES` array of `src/data/routes.ts`; an e2e assertion confirms this membership by importing both files.
- [ ] The page emits THREE JSON-LD blocks inside the existing `<Helmet>` head: (1) a `BreadcrumbList` (Home -> Compare) mirroring the shape from `src/pages/AiForLandscapers.tsx`, (2) a `CollectionPage` block with `@type: 'CollectionPage'`, `name: 'Digital Craft Comparisons'`, `description` (same string as `META_DESCRIPTION` per the 2026-05-25 mirror-source rule), and `isPartOf` pointing to the existing `WebSite` block from ticket 0016, and (3) an `ItemList` block with `@type: 'ItemList'`, `itemListElement` built by mapping over `COMPARE_ENTRIES` so each entry becomes a `ListItem` with `position`, `name` (`Digital Craft vs <tool>`), and `url` (absolute URL built from `https://digitalcraftai.com` + entry.path). Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'`, `=== 'ItemList'`, AND `=== 'BreadcrumbList'` predicates. No existing page emits a `CollectionPage` block today (this is the first); `ItemList` is emitted on `/demos` (ticket 0011) and `/changelog` (ticket 0043), both URL-scoped per the existing spec convention so adding a third `ItemList` on `/compare` is structurally safe; the grep result is documented in the Implementation log.
- [ ] The route is registered in `src/App.tsx` next to the ten existing `/compare/*` routes. `/compare` is added to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson; `tests/e2e/routes.ts` re-exports it automatically and the smoke spec exercises the page. The sitemap generator (ticket 0022) picks up the new App route and emits a `lastmod` from the commit date. The hub URL is the new canonical link surface for cross-comparison discovery; the ten existing comparison pages do NOT need an edit in this ticket (their own internal-link wiring is a separate cross-linking ticket per the ticket 0042 Out of Scope deferral).
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in any JSON-LD serialized string, and every card link resolves to a registered `/compare/*` route. The grid renders as one column on 375px, two columns on tablet widths, and three or more columns on desktop widths (mirror the existing `/demos` hub grid Tailwind class pattern: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`).
- [ ] A new e2e spec at `tests/e2e/compare-hub.spec.ts` asserts: (1) navigates to `/compare`, asserts the page returns < 400 status and the H1 contains "Compare," (2) asserts ten cards render (each carrying `data-testid="compare-hub-card"`); a new comparison appended to `COMPARE_ENTRIES` would increment this count automatically (the spec asserts the count equals `COMPARE_ENTRIES.length` by importing the constant), (3) asserts every card's link `href` matches a `/compare/*` path present in `ROUTES`, (4) asserts the JSON-LD `BreadcrumbList` names "Compare" in the second item, (5) asserts exactly one `CollectionPage` block exists with the expected `name`, (6) asserts exactly one `ItemList` block exists with `itemListElement.length === COMPARE_ENTRIES.length` AND each ListItem's `url` field matches the expected absolute URL pattern, (7) asserts the page text contains no `U+2014` code point, (8) asserts dark mode renders cleanly, (9) asserts the `meta[name="description"]` content (LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson) matches the `CollectionPage.description` field exactly (mirror-source guarantee).
- [ ] No `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the ten existing `src/pages/compare/*.tsx` pages or their specs, no edits to `src/components/Navbar.tsx` or `src/components/Footer.tsx` (the Navbar / Footer link to `/compare` is a follow-up ticket per the AGENTS.md small-focused-PR rule). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; the existing ten `tests/e2e/compare-*.spec.ts` specs stay green; the existing ticket 0011 demos-hub spec and ticket 0043 changelog-itemlist spec stay green (`ItemList` per-URL scoping confirmed by the pre-code grep).

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- Adding `/compare` to the Navbar or Footer. Cross-promotion
  wiring is its own follow-up ticket once the hub itself ranks
  for "Digital Craft alternatives" queries; per the AGENTS.md
  small-focused-PR rule each surface gets its own ticket.
- Editing the ten existing comparison pages to cross-link
  back to `/compare` or to each other. Internal-link cluster
  edits across ten files exceed the 200-line diff budget and
  are explicitly deferred per the ticket 0042 Out of Scope.
- Adding an eleventh or twelfth comparison page in the same
  ticket. The hub ships as-is with the ten existing pages;
  a new comparison page is its own ticket (each comparison
  page is structurally one ticket per the ticket 0021-0042
  precedent).
- Adding `/compare` to the `index.html` SEO Pilot `pages`
  table. That is its own SEO-hygiene ticket and applies
  uniformly to all eleven compare-family routes (the hub plus
  the ten existing comparison pages), none of which are in the
  table per the 2026-05-25 SEO Pilot lesson. Out of scope here.
- Emitting a `Product` or `SoftwareApplication` block on the
  hub. The `/demos` hub already emits `SoftwareApplication`
  per ticket 0030; a sibling on `/compare` would duplicate
  semantics without adding rich-result eligibility. The
  `CollectionPage` + `ItemList` pair is the correct schema for
  a directory of comparison pages.
- An interactive filter on the hub (e.g. "show only field-
  service comparisons," "show only marketing-automation
  comparisons"). The ten entries are few enough to scan in
  one screen; a filter is feature-creep for a small directory.
- A "request a new comparison" form. Three capture surfaces
  exist already (tickets 0002, 0015, 0033) and ticket 0036
  explicitly closed the door on a fourth as noise.
- Server-side rendering or pre-rendering the hub differently
  from the rest of the SPA. The hub is static derived from
  `COMPARE_ENTRIES` and is fully crawlable as-is.
- Internationalization (`inLanguage` field on the schema).
  The hub is English-only; an i18n pass is a separate cross-
  cutting ticket.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/CompareHub.tsx` (under 180 lines). Mirror the
  page-shell pattern of `src/pages/Demos.tsx` (Navbar, Footer,
  ScrollProgress, Helmet). Define module-level constants
  `META_DESCRIPTION`, `BREADCRUMB_SCHEMA`, `COLLECTION_SCHEMA`,
  `ITEM_LIST_SCHEMA` per the 2026-05-25 mirror-source rule (the
  description used in the Helmet meta tag and in
  `COLLECTION_SCHEMA.description` MUST be the same
  `META_DESCRIPTION` constant). The `ITEM_LIST_SCHEMA` is built
  by `COMPARE_ENTRIES.map((entry, i) => ({ '@type': 'ListItem', position: i + 1, name: 'Digital Craft vs ' + entry.tool, url: 'https://digitalcraftai.com' + entry.path }))`
  so a future eleventh comparison appended to `COMPARE_ENTRIES`
  surfaces automatically in both the grid and the schema.
- New `src/data/compareEntries.ts` (under 80 lines). Export
  typed `CompareEntry` interface and `COMPARE_ENTRIES` constant
  listing the ten existing comparisons. Each tagline is a
  factual one-liner (e.g. "Buildertrend - project management
  depth + add Digital Craft as the AI lead-capture layer";
  "Jobber - SMB field-service ops + add Digital Craft as the
  AI conversation layer") sourced from the visible H1 + intro
  of the matching `/compare/*` page so the hub copy and the
  comparison page stay in sync. No em-dashes; use hyphens for
  the dash-style separators per the 2026-05-07 em-dash Hard NO.
- `src/App.tsx` - import `CompareHub` and add
  `<Route path="/compare" element={<CompareHub />} />` next to
  the existing `/compare/buildertrend` route. Mirror the
  (non-)lazy-loading convention of the adjacent compare routes
  per the ticket 0042 precedent.
- `src/data/routes.ts` - add `/compare` to the `ROUTES` array
  per the 2026-06-07 src-imports-tests lesson;
  `tests/e2e/routes.ts` re-exports it automatically and the
  smoke spec exercises the page.
- Per the 2026-05-30 second-@type lesson, BEFORE writing code
  grep `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'`,
  `=== 'ItemList'`, AND `=== 'BreadcrumbList'` predicates.
  Document the grep result in the Implementation log. The
  `ItemList` predicate is expected to match the existing
  `demos-index-hub.spec.ts` (ticket 0011) and
  `changelog-itemlist-jsonld.spec.ts` (ticket 0043); both are
  URL-scoped per the existing spec convention so adding a
  third `ItemList` on `/compare` is structurally safe. The
  `CollectionPage` predicate is expected to return zero
  matches (first emission site-wide).
- Per the 2026-05-25 SEO Pilot lesson, the new e2e spec
  asserts the Helmet-managed `meta[name="description"]`
  content directly (LAST `meta[name="description"]` per the
  2026-05-25 Helmet-appends lesson), NOT `page.toHaveTitle()`.
  `/compare` is not in the `index.html` SEO Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every string in the
  page module, the new `COMPARE_ENTRIES` constant (every
  tagline), the JSON-LD strings, and the H1 / footer note uses
  hyphens. Self-Review greps the diff for
  `String.fromCharCode(8212)` before pushing.
- `tests/e2e/compare-hub.spec.ts` (new) - one assertion per
  acceptance box. Model the spec on
  `tests/e2e/demos-index-hub.spec.ts` (ticket 0011, the
  closest peer for "hub page with ItemList JSON-LD listing a
  collection of routes") and on
  `tests/e2e/changelog-itemlist-jsonld.spec.ts` (ticket 0043,
  the closest peer for "ItemList JSON-LD built by mapping a
  shared constant"). The membership assertion imports both
  `COMPARE_ENTRIES` from `src/data/compareEntries.ts` and
  `ROUTES` from `tests/e2e/routes.ts` (which re-exports from
  `src/data/routes.ts`) and asserts every `entry.path` is in
  `ROUTES`.
- Per the 2026-05-22 two-PR ship lesson, ship will need a
  follow-up `chore/0048-ship-status` PR after the feat PR
  merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to `shipped` together;
  run `node scripts/check-backlog.mjs` before pushing the
  second PR so the file and index never drift mid-flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, the existing Navbar /
  Footer / ScrollProgress components, and the existing
  `trackCTAClick` helper. Schema migration: no. Privacy/
  security surface change: no - the hub is static derived
  from a typed constant, no new localStorage write, no new
  external network call, no new analytics field beyond the
  existing `trackCTAClick` helper.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0048-compare-hub-collectionpage-jsonld` opened
- YYYY-MM-DD - failing tests added in `tests/e2e/compare-hub.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
