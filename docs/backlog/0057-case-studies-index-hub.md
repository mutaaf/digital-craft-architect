---
id: 0057
title: Public /case-studies index hub listing every detailed case study with CollectionPage and ItemList JSON-LD
status: in-progress
priority: P1
area: seo
created: 2026-06-17
owner: gtm-innovation
---

## User story

As a buyer-side researcher (a private-equity associate
vetting AI-services vendors before a portfolio-company
intro, a VP of operations doing a vendor shortlist for
their three-vertical roll-up, a competing AI-services
agency mapping case-study depth as a benchmark) Googling
"digital craft case studies," "AI case studies construction,"
or "AI for real estate case study" on a laptop in a
weekday research block, I want one canonical index page at
`/case-studies` that lists every detailed case study the
site has shipped (today: construction, real estate, events)
with a one-sentence summary, the vertical tag, the hero
stat, and a "Read the full case study" link out to each
`/case-studies/<slug>` detail page, so that I can compare
vertical depth in one screen and forward the index URL
to my colleague instead of three separate slug URLs.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: every detail page
already exists. `src/data/caseStudies.ts` (the canonical
source) exports a typed `caseStudies: CaseStudyDetail[]`
constant with three entries today (construction, real
estate, events), and each entry already carries the
fields the index needs: `slug`, `vertical`, `title`,
`summary`, `heroStat`, `tags`. The detail pages render at
`/case-studies/<slug>` via `src/pages/case-studies/CaseStudy.tsx`
(ticket 0054 added Article JSON-LD to each detail page).
The homepage already deep-links to individual case-study
slugs via the `Index.tsx` carousel (line 179:
`to={`/case-studies/${study.slug}`}`), but there is NO
hub URL a researcher can land on, bookmark, or paste.
This ticket adds exactly one new page (`/case-studies`
itself), zero new data, zero new backend, zero new
dependency. The page reads `caseStudies` from
`src/data/caseStudies.ts` (the existing constant), maps
each entry to a card linked to its detail page, and emits
two JSON-LD blocks. It is NOT a re-implementation of the
homepage carousel because the carousel is the marketing
surface (above the fold, sized for scrolling); the hub is
the indexed surface (one canonical URL, structured data,
crawlable). Per the ticket 0048 precedent (the `/compare`
hub indexing every comparison page), a list page with a
`CollectionPage` + `ItemList` JSON-LD pair is the cheapest
way to make an existing leaf-page family discoverable as
a single artifact.

### Stakeholder

This widens the SEO moat in a query class adjacent to the
trade-landing and compare-page families but structurally
distinct: "case study" intent is mid-funnel ("I am
convinced AI works, show me proof on a peer business"),
not top-funnel ("AI for plumbers"). Today a researcher
Googling "digital craft case studies" or "ai services
case studies construction" lands on either the homepage
(carousel is below the fold) or on one specific detail
page from a long-tail SERP match; there is no hub URL the
SERP can rank for the head term. The ticket 0048 `/compare`
hub precedent shows this exact pattern: indexing a leaf-
page family under a single `CollectionPage` hub URL adds
one indexable head-term surface AND lifts every leaf
page's perceived authority via internal-link distribution.
Per the 2026-05-30 second-@type lesson, the new page emits
`CollectionPage` + `ItemList` (the same shape ticket 0048
shipped on `/compare`), and the implementer pre-greps every
`tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'`
and `=== 'ItemList'` predicates so a sibling instance on
`/case-studies` cannot collide with the `/compare` hub's
"exactly one" assertion. The hub also closes a credibility
gap surfaced by ticket 0054's Article JSON-LD: Google now
treats each case study as a standalone article, but
without a parent CollectionPage there is no schema-level
"these articles belong to one collection" signal. The hub
is also pre-authorized follow-up work per the ticket 0048
Out of Scope language: "A `/case-studies` hub indexing
every individual case study with the same `CollectionPage`
+ `ItemList` JSON-LD pair. The compare hub establishes the
pattern; case-studies hub is its own ticket once the
detail pages have stabilized," and ticket 0054 shipped the
Article JSON-LD that stabilized the detail-page schema.

### Visitor (in the real moment of use)

A VP of operations doing vendor research on a laptop
between meetings Googles "digital craft case studies" and
the SERP listing surfaces `/case-studies` with a meta
description naming the three covered verticals. One tap
and the page loads with a hero H1 ("Case Studies"), a
short intro paragraph naming what each case study covers
(challenge, solution, hero stat, full results), and a
three-card grid: one card per case study. Each card shows
the vertical badge (Construction / Real Estate / Events),
the case-study title, the one-sentence summary, the hero
stat ("92% faster lead response"), and a "Read the full
case study" CTA linking to `/case-studies/<slug>`. The
visitor scans all three in 15 seconds, taps into the one
that matches their vertical, reads the detail page,
clicks back, scrolls to the strategy-call CTA at the
bottom of the hub, and books. Light and dark mode
supported; the page reads cleanly on a 375px viewport.

### Growth

The "show me" moment is the URL a researcher can paste
into their colleague's Slack: "look at their case studies,
one URL, three verticals." That is exactly the artifact a
buyer-side analyst forwards when they want their team to
form an opinion together. Per the ticket 0048 / 0032
precedent, a canonical hub URL is the cheapest acquisition
lever the site has for head-term SERP intent because the
URL is structurally one tier above any specific leaf page
and Google ranks the hub for the umbrella query while
ranking each leaf for its specific vertical query. Each
card click fires `trackCTAClick('case_studies_hub_card',
'case-studies')` so the funnel is measurable in GA
independently of the homepage carousel.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/case-studies/CaseStudiesHub.tsx` (new file, under 220 lines) renders at `/case-studies`. The page uses the existing `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell mirrored from `src/pages/CompareHub.tsx` (ticket 0048, the closest structural peer because both are leaf-page-family hubs emitting `CollectionPage` + `ItemList` JSON-LD). The page renders a hero (H1 contains "Case Studies"), an intro paragraph (one sentence per the AGENTS.md defensible-claims rule, no fabricated stats), a card grid that reads from `caseStudies` in `src/data/caseStudies.ts` and emits one card per entry showing `vertical`, `title`, `summary`, `heroStat.value` + `heroStat.label`, and a "Read the full case study" link to `/case-studies/${slug}`, and one strategy-call CTA below the grid. Every card link resolves to a registered route in `src/data/routes.ts` (the three `/case-studies/<slug>` entries already exist).
- [ ] The page emits TWO JSON-LD blocks inside the existing `<Helmet>` head: (1) a `CollectionPage` block with `@type: 'CollectionPage'`, `name: 'Digital Craft AI Case Studies'`, `description` (same string as `META_DESCRIPTION` per the 2026-05-25 mirror-source rule), and `url: 'https://digitalcraftai.com/case-studies'`, and (2) an `ItemList` block with `@type: 'ItemList'`, `itemListOrder: 'https://schema.org/ItemListOrderAscending'`, `numberOfItems: caseStudies.length`, and an `itemListElement` array where each entry is `{ '@type': 'ListItem', position: N, url: 'https://digitalcraftai.com/case-studies/<slug>', name: <title> }`. The `numberOfItems` value and the `itemListElement` array are BOTH derived from `caseStudies.length` and `caseStudies.map(...)` so adding a fourth case study automatically widens both. A third block (`BreadcrumbList`, Home -> Case Studies) is also emitted matching the ticket 0048 convention.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'`, `=== 'ItemList'`, and `=== 'BreadcrumbList'` predicates and documents the result in the Implementation log. The ticket 0048 `/compare` hub already emits `CollectionPage` and `ItemList` blocks; the implementer confirms the existing assertions are URL-scoped (each `goto<Hub>` helper visits only `/compare`) and NOT site-wide "exactly one" assertions. If any predecessor predicate IS site-wide, it is widened in the SAME PR per the 2026-05-30 lesson to identify the original block by a unique field (e.g. the `/compare` CollectionPage's `name: 'AI Software Comparisons'`) rather than by "the only CollectionPage block."
- [ ] The route is registered in `src/App.tsx` next to the existing `/case-studies/:slug` route (the import sits at line 83 today; the new hub import goes alongside it). `/case-studies` is added to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson; `tests/e2e/routes.ts` re-exports it automatically and the smoke spec exercises the page. The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in any JSON-LD serialized string, and every card link routes to a registered `/case-studies/<slug>` path. The page does NOT duplicate the homepage carousel's component (`src/components/CaseStudies.tsx` if it exists) verbatim; the hub renders its own cards reading from `caseStudies` directly so the two surfaces can diverge in layout without coupling.
- [ ] A new e2e spec at `tests/e2e/case-studies-hub.spec.ts` (modeled on `tests/e2e/compare-hub-jsonld.spec.ts` from ticket 0048) asserts: (1) `GET /case-studies` returns 200 and the H1 contains "Case Studies" (case-insensitive), (2) the page contains one card per entry in `caseStudies` (asserted by counting `data-testid="case-study-hub-card"` locators against the imported `caseStudies.length`), (3) every card's "Read the full case study" link `href` resolves to a `/case-studies/<slug>` path present in `ROUTES` (imported from `tests/e2e/routes.ts`), (4) the `CollectionPage` JSON-LD block carries `name: 'Digital Craft AI Case Studies'`, (5) the `ItemList` JSON-LD block's `numberOfItems` equals the imported `caseStudies.length` AND the `itemListElement` array length matches, (6) the `BreadcrumbList` JSON-LD has two items with the second one named "Case Studies" linking to `https://digitalcraftai.com/case-studies`, (7) the page text contains no `String.fromCharCode(8212)` code point, and (8) dark mode renders cleanly via `document.documentElement.classList.add('dark')`.
- [ ] No `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/data/caseStudies.ts` (the hub CONSUMES the existing constant, never writes to it), no edits to the three existing `src/pages/case-studies/CaseStudy.tsx` detail page or its `tests/e2e/case-study-article-jsonld.spec.ts` spec (ticket 0054). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; the existing `tests/e2e/compare-hub-jsonld.spec.ts` (ticket 0048) and `tests/e2e/case-study-article-jsonld.spec.ts` (ticket 0054) stay green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A new case-study DETAIL page for a fourth vertical
  (home services, healthcare, restaurant, etc.). Each
  detail page is structurally its own ticket per the
  ticket 0054 precedent; this ticket lists what already
  exists, never invents a new case study. Adding a new
  case study requires a real client agreement to
  attribution per the AGENTS.md Hard NO on invented
  testimonials.
- Editing the existing three case-study detail pages or
  the `Article` JSON-LD on them (ticket 0054). The hub
  is purely additive; the detail pages stay byte-
  identical.
- Cross-promoting the new hub from the homepage carousel
  (`src/components/CaseStudies.tsx` if it exists), the
  navbar, or the footer. Cross-surface promotion is its
  own conversion ticket once telemetry shows the hub
  earns organic traffic on its own.
- Adding `/case-studies` to the `index.html` SEO Pilot
  `pages` table. That is its own SEO-hygiene ticket per
  the 2026-05-25 SEO Pilot lesson; the page is driven by
  Helmet which is sufficient for the meta-description
  surface but not for `document.title` on this route.
- A filter or search bar on the hub (filter by vertical,
  search by keyword). Three cards is too few to justify
  filter UI; revisit when the case-study list exceeds
  eight entries.
- A "compare two case studies side-by-side" UI. The
  ticket 0048 `/compare` hub owns side-by-side
  comparisons against external products; case-study
  side-by-side is a different mental model and would
  require a separate ticket once telemetry shows
  demand.
- A per-vertical case-study feed (e.g.
  `/case-studies/vertical/construction`). The combined
  hub is the canonical surface; per-vertical filtering
  is something a researcher does client-side via the
  visible vertical badge on each card.
- Adding a JSON Feed or RSS feed at
  `/case-studies/rss.xml`. The ticket 0055 changelog feed
  is the precedent; a case-study feed is a follow-up
  ticket once the hub itself earns subscriber telemetry.
- Internationalization (`inLanguage` fields on schema).
  The page is English-only, matching the three existing
  detail pages.
- An `Author` or `Publisher` block on the hub. The
  detail pages already carry `Article` JSON-LD with the
  publisher (ticket 0054); the hub is a `CollectionPage`
  which does not require either.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/case-studies/CaseStudiesHub.tsx` (under
  220 lines). Mirror the page-shell pattern of
  `src/pages/CompareHub.tsx` (ticket 0048, the closest
  peer because both are leaf-family hubs emitting
  `CollectionPage` + `ItemList`). Define module-level
  constants `META_DESCRIPTION`, `COLLECTION_PAGE_SCHEMA`,
  `ITEM_LIST_SCHEMA`, `BREADCRUMB_SCHEMA` per the
  2026-05-25 mirror-source rule. The description used in
  the Helmet meta tag MUST read from the same
  `META_DESCRIPTION` constant the `COLLECTION_PAGE_SCHEMA`
  block reads from.
- The card grid reads `caseStudies` from
  `import { caseStudies } from '../../data/caseStudies'`
  and renders one card per entry. Each card carries
  `data-testid="case-study-hub-card"` for the spec's
  count assertion. The "Read the full case study" link
  is a `<Link to={`/case-studies/${slug}`}>` per the
  existing ticket 0048 hub-card pattern.
- New route in `src/App.tsx`: import
  `CaseStudiesHub from './pages/case-studies/CaseStudiesHub'`
  and add `<Route path="/case-studies" element={<CaseStudiesHub />} />`
  immediately before the existing
  `<Route path="/case-studies/:slug" element={<CaseStudy />} />`
  line (order matters for React Router static-first
  matching even though the param route would not greedy-
  match an exact-string path). Mirror the (non-)lazy-
  loading convention of the adjacent `/case-studies/:slug`
  route.
- Per the 2026-06-07 src-imports-tests lesson, add
  `/case-studies` to the `ROUTES` array in
  `src/data/routes.ts` (the canonical allow-list);
  `tests/e2e/routes.ts` re-exports it automatically and
  the smoke spec exercises the page.
- Per the 2026-05-30 second-@type lesson, BEFORE writing
  code grep `tests/e2e/*-jsonld.spec.ts` for
  `=== 'CollectionPage'`, `=== 'ItemList'`, AND
  `=== 'BreadcrumbList'` predicates. Document the grep
  result in the Implementation log. The ticket 0048
  `/compare` hub spec
  (`tests/e2e/compare-hub-jsonld.spec.ts`) is expected to
  be URL-scoped (its `gotoCompareHub` helper visits only
  `/compare`), so a sibling `CollectionPage` block on
  `/case-studies` does not collide. The grep is mandatory
  regardless and the result is recorded so the deviation,
  if any, is auditable. If any predecessor predicate IS
  site-wide, widen it in the SAME PR per the 2026-05-30
  lesson.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e spec
  asserts the Helmet-managed `meta[name="description"]`
  content directly (LAST `meta[name="description"]`
  element per the 2026-05-25 Helmet-appends lesson), NOT
  `page.toHaveTitle()`. The route is not in the
  `index.html` SEO Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every string in the
  page module (the H1, the META_DESCRIPTION, the intro
  paragraph, the card titles via the existing
  `caseStudies` data, the JSON-LD strings, the strategy-
  call CTA label) uses hyphens. Self-Review greps the
  diff for `String.fromCharCode(8212)` before pushing.
  If any existing `caseStudies` entry's `title` or
  `summary` already contains an em-dash, fix it at the
  single source per the 2026-05-25 mirror-source-fix
  rule (the same data is rendered on the hub AND on the
  detail page).
- `tests/e2e/case-studies-hub.spec.ts` (new) - one
  assertion per acceptance box. Model end-to-end on
  `tests/e2e/compare-hub-jsonld.spec.ts` (ticket 0048,
  the closest peer for "hub page emitting CollectionPage
  + ItemList"). The card-count assertion imports
  `caseStudies` from `src/data/caseStudies.ts` (already
  type-safe in the test environment per the existing
  `tsconfig.test.json` include).
- Per the 2026-05-22 two-PR ship lesson, ship will need
  a follow-up `chore/0057-ship-status` PR after the feat
  PR merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to `shipped`
  together; run `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index never
  drift mid-flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, the existing
  Navbar / Footer / ScrollProgress components, and the
  existing `trackCTAClick` helper. Schema migration: no.
  Privacy/security surface change: no - the page reads
  already-public case-study data and emits no new
  network call. The /trust page disclosure list does
  NOT need an edit because no new persistent store is
  added.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-06-17 - branch `feat/0057-case-studies-index-hub` opened off origin/main
- 2026-06-17 - 2026-05-30 second-@type pre-code grep across `tests/e2e/*-jsonld.spec.ts` and the sibling hub spec `tests/e2e/compare-hub.spec.ts`:
  - `=== 'CollectionPage'` matches: only `tests/e2e/compare-hub.spec.ts:106` (the ticket 0048 spec). Its `gotoCompareHub` helper visits `/compare` only, and its "exactly one CollectionPage block expected on /compare" assertion is URL-scoped via the page navigation; a sibling CollectionPage block on `/case-studies` does NOT collide. No predecessor predicate needs widening.
  - `=== 'ItemList'` matches: `compare-hub.spec.ts`, `website-sitelinks-jsonld.spec.ts` (URL-scoped to `/`), `demos-index-hub.spec.ts` (URL-scoped to `/demos`), `changelog-itemlist-jsonld.spec.ts` (URL-scoped to `/changelog`), `demos-softwareapplication-jsonld.spec.ts` (URL-scoped to `/demos`). All "exactly one" predicates are URL-scoped to a route this PR does not touch.
  - `=== 'BreadcrumbList'` matches: many specs across `/compare/*`, `/ai-for-*`, `/quiz`, `/roi`, `/trust`, `/my`, `/case-studies/:slug`, `/locations/texas`. All are URL-scoped to a route different from `/case-studies` (the hub). The `tests/e2e/case-study-article-jsonld.spec.ts` ticket 0054 spec is scoped to `/case-studies/:slug` (the detail pages) via its `gotoCaseStudy` helper, not the hub.
  - Conclusion: zero predecessor predicates need widening. The new `/case-studies` hub can emit `CollectionPage` + `ItemList` + `BreadcrumbList` without any cross-spec collision.
- 2026-06-17 - failing test added in `tests/e2e/case-studies-hub.spec.ts`
- 2026-06-17 - PR opened, CI green
- 2026-06-17 - merged to main
