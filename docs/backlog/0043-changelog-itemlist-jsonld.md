---
id: 0043
title: Emit ItemList JSON-LD on /changelog so search engines can index individual ship entries
status: shipped
priority: P1
area: seo
created: 2026-06-09
owner: gtm-innovation
---

## User story

As a prospect or analyst Googling "Digital Craft AI changelog,"
"Digital Craft AI updates," or "what did Digital Craft ship this
week," I want the public `/changelog` page to expose its
shipped-ticket list as structured data so the SERP listing
surfaces a rich item list with individual ship entries
(date + title + area), so that I can scan the most recent ships
straight from the search result and click through with intent
to a specific demo or page instead of bouncing on a flat date
list.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: `/changelog` (ticket
0032) is a real, working page that already renders the
shipped-ticket list from `src/data/changelogEntries.ts`, with
each entry carrying `id`, `title`, `area`, and `created` fields.
Today the page has ZERO structured data (grep
`script type="application/ld+json"` against
`src/pages/Changelog.tsx` returns nothing). The
list-of-dated-entries shape maps directly onto schema.org
`ItemList` (with `itemListElement: ListItem[]` carrying
position, name, and url for each entry). One JSON-LD block
inside the existing `<Helmet>` head publishes the structure
without changing one line of UI copy or the changelog render.
Same pattern as the Quiz JSON-LD ticket 0039 and the
SoftwareApplication ticket 0030: take a uniquely-shaped
artifact already shipped and publish its shape to crawlers.
No new endpoint, no new component, no new dependency.

### Stakeholder

This widens the SEO moat in a content class no comparison
page, landing page, or trust page can earn: a canonical
ship-velocity artifact. `/changelog` is the only DigitalCraft
surface that proves "we ship every week" with dated
historical receipts; structured data is the prerequisite to
Google ever displaying individual entries as a list rich
result (the same way the FAQPage ticket 0012 earned the FAQ
rich result and the Quiz ticket 0039 earned the Quiz rich
result). The page also feeds the `/uptime` trust narrative
(ticket 0036) and the "what's new since you visited" strip
(ticket 0040), so any SERP-side visibility lift compounds
across the trust funnel. The pattern is repeatable: the same
ItemList approach can later apply to `/glossary` definitions
and `/uptime` incidents.

### Visitor (in the real moment of use)

A small-business owner Googles "Digital Craft AI changelog" on
a phone. The SERP listing for `/changelog` shows the page
title, the meta description, and (after this ticket and
Google's normal indexing cycle) the first few ship entries
surfaced as a list rich preview with dates. The visitor
recognises "this product ships every week, here is what they
shipped this month" and clicks through with intent to a
specific entry rather than the full list. On `/changelog`
itself, nothing visible changes (the JSON-LD is head-only);
the page still loads, renders, groups by month, and resolves
demo-area entries to demo routes exactly as today. No new UI
element, no new input, no copy change.

### Growth

The "show me" moment is the Google rich-results test
(`search.google.com/test/rich-results`) returning a green
`ItemList`-detected card for `/changelog`. That is the single
screenshot the Product Owner can paste into a stakeholder
review as proof the ship cadence is indexable. A returning
visitor who lands on the SERP for "Digital Craft AI updates"
is by construction high-intent; structured data is the
cheapest, most defensible lever to compete for that listing
position. Each ship entry that earns its own SERP click
becomes a deep-link into the funnel: an `area === 'demos'`
entry routes directly to the demo it shipped, an
`area === 'seo'` entry routes to the surface it added.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] An `ItemList` JSON-LD block is emitted inside the existing `<Helmet>` head of `src/pages/Changelog.tsx` via `<script type="application/ld+json">`. The block's `@context` is `https://schema.org`, its `@type` is `ItemList`, and it carries: `name: 'Digital Craft AI Changelog'`, `description` (same string as the Helmet meta description per the 2026-05-25 mirror-source rule), `numberOfItems: <length of the rendered entry list>`, `itemListOrder: 'https://schema.org/ItemListOrderDescending'` (entries are newest-first), and `itemListElement: ListItem[]` with one entry per visible changelog row. Each `ListItem` has `@type: 'ListItem'`, `position: <1..N>` (1 = most recent), `name: <entry.title>`, and `url: 'https://digitalcraftai.com/changelog#<entry.id>'` (the hash anchor points at the per-entry block id rendered on the page; the implementer adds `id={entry.id}` to the entry's wrapper div if it is not already present).
- [ ] The `itemListElement` array length equals the number of entries the page actually renders (the existing `VISIBLE_LIMIT = 36` cap, or the full `changelogEntries.length` if smaller). The implementer does NOT hardcode the count; the JSON-LD is built by mapping over the same sliced array the page renders so any future entry add or remove updates the schema automatically. Per the 2026-05-25 mirror-source rule, `changelogEntries` is the single shared source for both the visible page and the schema; an e2e assertion confirms `itemListElement.length === <count of rendered .changelog-entry rows>` by counting visible rows on `/changelog`.
- [ ] A `BreadcrumbList` JSON-LD block is ALSO emitted inside the same `<Helmet>` head (Home -> Changelog), matching the existing pattern in `src/pages/AiForElectricians.tsx` and `src/pages/compare/Podium.tsx`. Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/*-jsonld.spec.ts` for a `=== 'BreadcrumbList'` predicate AND a `=== 'ItemList'` predicate to confirm no existing spec asserts "exactly one of either @type block site-wide" (the `/demos` hub already emits a `SoftwareApplication` with an embedded `mainEntity` per ticket 0030, which uses an ItemList-shaped node; the grep must verify whether that block's spec asserts uniqueness of top-level `ItemList`). The grep result is documented in the Implementation log.
- [ ] No copy on `/changelog` changes: the meta description, the H1, the entry-row markup, the area chip colors, the demo-link resolver, and every rendered string stay byte-for-byte identical to the current build. The diff is additive only (one ItemList block + one BreadcrumbList block inside the existing Helmet, plus optionally one `id={entry.id}` attribute on each entry wrapper if it is not already there). A regression e2e asserts: the H1 still reads "Changelog" (or the current literal text), the first rendered entry's title matches the first entry's title in `changelogEntries`, the demo-link resolver still emits a "Try the demo" link for the same `area === 'demos'` entries.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, the ItemList JSON-LD parses as valid JSON (a parse failure throws and the spec catches it), and the JSON-LD block contains zero em-dash characters (`U+2014`). Per the 2026-05-25 mirror-source-fix lesson, if any string in the existing `changelogEntries` already contains an em-dash (the file is generated from `docs/backlog/*.md` titles by `scripts/generate-changelog.ts`, so the source would be a ticket title; check `String.fromCharCode(8212)` in the rendered list AND the generated `src/data/changelogEntries.ts`), repair it AT THE SOURCE (the backlog ticket title in `docs/backlog/<id>-*.md` frontmatter) in this same PR so the visible page and the JSON-LD mirror stay identical. The repair is in-scope as a single-source punctuation fix per the 2026-05-25 mirror-source-fix lesson; the diff cap stays under 220 lines.
- [ ] A new e2e spec at `tests/e2e/changelog-itemlist-jsonld.spec.ts` asserts: navigate to `/changelog` and read all `script[type="application/ld+json"]` blocks; exactly one block has top-level `@type === 'ItemList'` (the `/demos` hub `SoftwareApplication` block's nested `mainEntity` does not count because it lives at a different URL); the ItemList block parses as valid JSON; `ItemList.numberOfItems` equals `ItemList.itemListElement.length`; every entry has `@type === 'ListItem'`, a positive integer `position`, a non-empty `name`, and a `url` that starts with `https://digitalcraftai.com/changelog#`; the first entry's `position === 1` and its `name` matches the first rendered entry's title; exactly one block has `@type === 'BreadcrumbList'`; the BreadcrumbList's second item names "Changelog." The spec also asserts the `meta[name="description"]` content matches the ItemList block's `description` field exactly (mirror-source guarantee), reading the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson. Per the 2026-05-25 SEO Pilot lesson, the spec does NOT use `page.toHaveTitle()` (`/changelog` is not in the SEO Pilot table per the existing ticket 0032 note in `Changelog.tsx` lines 19-24).
- [ ] No `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `scripts/generate-changelog.ts` (the generator's output shape stays unchanged; the schema is derived at render time, not at build time). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta` stay green; `npm run typecheck` stays clean. The new spec passes; the existing `tests/e2e/changelog-page.spec.ts` (ticket 0032) AND the `tests/e2e/demos-softwareapplication-jsonld.spec.ts` (ticket 0030) stay green.

## Out of scope

- Adding `/changelog` to the `index.html` SEO Pilot `pages`
  table. That is its own SEO-hygiene ticket. Out of scope here
  per the same logic as ticket 0032.
- Emitting a per-entry `BlogPosting` or `NewsArticle` schema.
  Each ship is a one-line title, not a long-form article; the
  ItemList shape is the correct fit. Out of scope.
- Emitting an RSS feed for `/changelog`. The site already
  generates `public/rss.xml` for blog posts via
  `scripts/generate-rss.ts`; a changelog-specific feed is its
  own ticket.
- Adding `inLanguage`, `provider`, or `creator` fields to the
  ItemList block. The schema is the minimal set Google
  consumes for list rich results; richer fields can be added
  later if a SERP rich-result audit shows they help.
- Changing the visible page layout, the `VISIBLE_LIMIT`, the
  area chip colors, the demo-link resolver, or the
  month-grouping logic. The ticket is structured-data
  publication of the artifact AS IT IS today, not a redesign.
- Adding `/changelog` to the `Hero` or `Navbar` as a top-level
  link. Cross-promotion is its own conversion ticket; the
  page already has the "what's new" strip surfacing it
  (ticket 0040).
- Backfilling the `changelogEntries` generator to also emit
  per-entry `description` text. The generator today emits
  `id`, `title`, `area`, and `created` only; widening the
  field set is its own infra ticket.
- A Google rich-results validation script as part of the local
  gate. The 2026-05-28 lesson on inlined assertions vs. new
  frameworks applies: the validation is done by the new spec
  reading the schema, not by adding a new validator script.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- `src/pages/Changelog.tsx` - add two new JSON-LD blocks
  inside the existing `<Helmet>` head. The blocks are built as
  module-level constants (`CHANGELOG_ITEMLIST_SCHEMA`,
  `BREADCRUMB_SCHEMA`) OR as values derived inside the
  component from the already-sliced render array (the
  `VISIBLE_LIMIT` cap applies). Per the 2026-05-25 mirror-source
  rule, the `META_DESCRIPTION` constant already defined at line
  35-36 (`CHANGELOG_DESCRIPTION`) is read from BOTH
  `<meta name="description" content={CHANGELOG_DESCRIPTION} />`
  AND the ItemList block's `description` field; no second
  description string is introduced.
- The `ItemList.itemListElement` array is built by mapping
  over the SAME sliced array the page renders (the
  `changelogEntries.slice(0, VISIBLE_LIMIT)` or equivalent),
  so the schema length tracks the rendered length exactly.
  Each `ListItem` derives `name` from `entry.title` and `url`
  from `https://digitalcraftai.com/changelog#${entry.id}`; the
  implementer adds `id={entry.id}` to the per-entry wrapper div
  if the existing rendered markup does not already carry one
  (grep the file first; ticket 0032's rendered shape may or
  may not already include this).
- The Helmet emits the two JSON-LD blocks as
  `<script type="application/ld+json">{JSON.stringify(CHANGELOG_ITEMLIST_SCHEMA)}</script>`
  AND a second `<script>` for `BREADCRUMB_SCHEMA`. Two
  separate script tags is the same shape as the
  AiForRoofers / AiForElectricians / Quiz pages today; do NOT
  wrap them in a `@graph` since Google parses sibling script
  tags independently.
- Per the 2026-05-30 second-@type lesson, the implementer
  greps `tests/e2e/*-jsonld.spec.ts` for both
  `=== 'BreadcrumbList'` AND `=== 'ItemList'`. The
  BreadcrumbList grep is the same pattern as ticket 0039's
  pre-write grep (which returned 14 per-URL scoped matches
  per the 0039 Implementation log). The ItemList grep must
  confirm whether the `demos-softwareapplication-jsonld.spec.ts`
  (ticket 0030) asserts uniqueness of top-level ItemList
  blocks at ANY URL (the `/demos` hub's `SoftwareApplication`
  carries a nested ItemList-shaped `mainEntity`); per-URL
  scoping is the existing convention, so the risk is
  structurally low, but the grep is mandatory.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e spec asserts
  the Helmet-managed `meta[name="description"]` content
  directly (reading the LAST `meta[name="description"]`
  element in the head per the 2026-05-25 Helmet-appends
  lesson), NOT `page.toHaveTitle()`. The route is not in the
  `index.html` SEO Pilot pages table per the ticket 0032
  note in `Changelog.tsx`.
- Per the 2026-05-07 em-dash Hard NO, every string in the
  emitted JSON-LD (the ItemList `name`, `description`, every
  ListItem `name`, the BreadcrumbList names) uses hyphens.
  Self-Review greps the diff for `String.fromCharCode(8212)`
  before pushing. The 2026-05-25 mirror-source-fix applies if
  any pre-existing entry title in `changelogEntries` already
  contains an em-dash - repair AT THE SOURCE (the backlog
  ticket title in `docs/backlog/<id>-*.md` frontmatter, which
  is the source the generator reads) so visible and mirror
  stay identical.
- `tests/e2e/changelog-itemlist-jsonld.spec.ts` (new) - one
  spec per acceptance box. Model the spec on
  `tests/e2e/quiz-jsonld.spec.ts` (ticket 0039, the closest
  peer for "publish structure of an existing artifact"). JSON-LD
  case: read all `script[type="application/ld+json"]` blocks,
  filter to top-level `@type === 'ItemList'`, assert exactly
  one. Length case: assert
  `ItemList.numberOfItems === ItemList.itemListElement.length`
  AND assert the length equals the visible row count on the
  page. Shape case: assert every itemListElement entry has
  `@type === 'ListItem'`, a positive integer `position`, a
  non-empty `name`, and a `url` that starts with
  `https://digitalcraftai.com/changelog#`. Mirror case: read
  the LAST `meta[name="description"]` content, assert it
  equals the ItemList block's `description` byte-for-byte.
  Breadcrumb case: filter to `@type === 'BreadcrumbList'`,
  assert exactly one, assert second item name is "Changelog."
  No-em-dash case: read the rendered text AND the JSON-LD
  serialized strings, assert neither contains
  `String.fromCharCode(8212)`. Dark-mode case: apply
  `document.documentElement.classList.add('dark')` and assert
  the page renders. Regression case: assert the first rendered
  entry's title matches the first entry in `changelogEntries`.
- Per the 2026-05-22 two-PR ship lesson, ship will need a
  follow-up `chore/0043-ship-status` PR after the feat PR
  merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to `shipped` together;
  run `node scripts/check-backlog.mjs` before pushing the
  second PR so the file and index never drift mid-flip.
- New deps: NO. The page already uses `react-helmet-async`;
  no new component, no new utility, no new test framework.
  Schema migration: no. Privacy/security surface change:
  no - the JSON-LD is static derived from the existing
  `changelogEntries` array; no new data flow, no new
  analytics field, no new external network destination is
  introduced.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-06-09 - branch `feat/0043-changelog-itemlist-jsonld` opened off fresh `origin/main` (5b0423c). Ticket flipped to `in-progress`; README index row flipped together in the same commit; `node scripts/check-backlog.mjs` green.
- 2026-06-09 - Pre-write grep per the 2026-05-30 second-@type lesson, run against `tests/e2e/*-jsonld.spec.ts` AND the broader `tests/e2e/` directory:
  - `=== 'ItemList'` matches:
    - `tests/e2e/demos-softwareapplication-jsonld.spec.ts:73` - `isItemList` helper, scoped to `/demos`.
    - `tests/e2e/demos-index-hub.spec.ts:60` - `isItemList` helper, scoped to `/demos`; spec asserts "exactly one ItemList block expected" but only after `goto('/demos')`, so the assertion is URL-scoped, not site-wide.
    - `tests/e2e/website-sitelinks-jsonld.spec.ts:91` - `isItemList` helper, scoped to `/`; used only to unwrap SiteNavigationElement children from a possible ItemList wrapper, not to assert ItemList uniqueness.
  - `=== 'BreadcrumbList'` matches: 14 hits across compare-*, ai-for-*, quiz-jsonld, demo-breadcrumbs specs; each is per-URL scoped (the spec navigates to a specific route then asserts exactly one BreadcrumbList block on that route). No spec asserts site-wide BreadcrumbList uniqueness.
  - Conclusion: no existing spec asserts global uniqueness of either `ItemList` or `BreadcrumbList`. Adding both to `/changelog` is safe; no predecessor spec needs widening. The new `tests/e2e/changelog-itemlist-jsonld.spec.ts` is URL-scoped to `/changelog`, matching the convention.
- 2026-06-09 - Em-dash audit per the 2026-05-25 mirror-source-fix lesson: `String.fromCharCode(8212)` count in `src/data/changelogEntries.ts` is 0; em-dash count in `docs/backlog/*.md` frontmatter `title:` lines is 0. No source repair required.
- 2026-06-09 - failing test added in `tests/e2e/changelog-itemlist-jsonld.spec.ts`
- 2026-06-09 - PR #N opened, CI [state]
- 2026-06-09 - merged to main
