---
id: 0063
title: Emit BreadcrumbList JSON-LD on /glossary so the AI glossary indexes as a navigable artifact
status: groomed
priority: P2
area: seo
created: 2026-06-19
owner: gtm-innovation
---

## User story

As a search engine crawler (Googlebot or Bingbot) fetching
`/glossary` to evaluate it for an AI-terminology rich-
result placement on a query like "what is a large
language model" or "RAG meaning AI," I want a
`BreadcrumbList` JSON-LD block on the page that names the
canonical position of the glossary in the site hierarchy
(Home -> AI & Automation Glossary), so that the SERP
listing can render a breadcrumb path under the title and
a researcher comparing two glossary pages can tell at a
glance which one is rooted inside a credible business-
automation site versus a free-standing pile of
definitions.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: every other
static trust-class or content-class page on the site
emits a `BreadcrumbList` JSON-LD block by convention.
`src/pages/Trust.tsx` does (ticket 0044). `src/pages/Changelog.tsx`
does (ticket 0043 - the file already has the
BreadcrumbList constant at line 38-44 per the 2026-06-19
inventory). `src/pages/MyDashboard.tsx` does (ticket
0045, line 30-37). `src/pages/Playbook.tsx` does (ticket
0059). `src/pages/RoiCalculator.tsx` does (ticket 0046).
Every `/ai-for-*` page does (tickets 0017-0058). Every
`/compare/*` page does. The `/case-studies` hub does
(ticket 0057). The `/glossary` page (ticket 0013) is the
ONLY indexable static content page in the site that does
NOT - the page emits a single `DefinedTermSet` block
inside its `<Helmet>` (`src/pages/Glossary.tsx` line 80-
90 per the 2026-06-19 inventory) and stops there. This
ticket closes that gap with the smallest possible
additive edit: one new `BREADCRUMB_SCHEMA` constant in
the existing module, one new `<script type="application/ld+json">`
tag inside the existing `<Helmet>` at Glossary.tsx line
97-101. Zero new files, zero new dependency, zero edit
to any other surface.

### Stakeholder

This widens the SEO moat in the structurally cheapest
dimension: a BreadcrumbList JSON-LD block is the single
piece of structured data Google explicitly cites in its
breadcrumb rich-result documentation as the trigger for
the breadcrumb-path SERP enhancement, and every other
static page on the site already emits one. The glossary
is the highest-traffic indexable content artifact in the
site by raw definition count (37 terms per Glossary.tsx
TERMS array length, each with its own anchor at `#<slug>`)
- the kind of page that earns long-tail definitional
traffic ("what is RAG," "AI agent meaning") where the
breadcrumb-path SERP enhancement actually moves CTR. Per
the 2026-05-30 second-@type lesson, BEFORE writing code
the implementer greps every `tests/e2e/*-jsonld.spec.ts`
AND `tests/e2e/glossary-definedtermset-schema.spec.ts`
for `=== 'BreadcrumbList'` predicates; every existing
predecessor predicate is per-URL scoped per the ticket
0058 / 0059 inventory (each spec calls `page.goto('/trust')`
or `/changelog` or `/playbook` etc. before counting
BreadcrumbList blocks), so adding a new `/glossary`-
scoped BreadcrumbList block cannot collide with any
prior assertion. The grep is mandatory regardless and
the result is documented in the Implementation log.
The page also already passes the 2026-05-25 SEO Pilot
lesson trap because `/glossary` is in the index.html
SEO Pilot pages table (the existing per-route table the
Helmet title falls through to per the 2026-05-25
lesson - re-verified on today's main during this
ticket's grooming).

### Visitor (in the real moment of use)

A researcher Googles "RAG AI meaning" on a laptop. The
SERP listing for `/glossary#retrieval-augmented-generation`
surfaces with a breadcrumb path "digitalcraftai.com >
AI & Automation Glossary" visible under the title -
that signal is what the new BreadcrumbList block
unlocks. They click through, the glossary loads, the
existing DefinedTermSet JSON-LD continues to power the
in-page definitions, and the existing per-term anchor
links (`scroll-mt-28` at Glossary.tsx line 145) work
identically. No visible change on the page itself; the
artifact is invisible-to-humans structured data only.
Light and dark mode untouched; the page is byte-identical
in the rendered DOM and reads cleanly on a 375px
viewport because the edit is `<Helmet>`-only.

### Growth

The "show me" moment is the SERP listing itself: a
researcher comparing two glossary pages sees ours with
a clean breadcrumb path showing it lives inside a
business-automation site (not a random definitional
blog) and clicks ours. Per the ticket 0019 / 0043 /
0044 / 0048 / 0057 / 0059 precedent (six prior
BreadcrumbList tickets on a per-surface basis), each
BreadcrumbList emission costs roughly 8 lines of code
and ships an indexable signal that compounds with the
rest of the structured-data graph. The page also
remains the cheapest acquisition lever for
definitional long-tail queries the site has, because
each of the 37 terms is an indexable
`/glossary#<slug>` anchor and the breadcrumb path
applies to every anchor.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] `src/pages/Glossary.tsx` gets ONE additive edit: a new module-level constant `BREADCRUMB_SCHEMA` is defined adjacent to the existing `definedTermSetJsonLd` constant at line 80-90. The constant mirrors the shape of `Changelog.tsx`'s BreadcrumbList at line 44 (the closest peer because both are static content-class pages) - exactly `{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' }, { '@type': 'ListItem', position: 2, name: 'AI & Automation Glossary', item: 'https://digitalcraftai.com/glossary' }] }`. The Home position-1 URL and the position-2 URL match the SITE_URL pattern used in every other shipped BreadcrumbList on the site.
- [ ] The existing `<Helmet>` block (Glossary.tsx line 97-101) gets ONE additive line: a second `<script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>` placed BEFORE the existing DefinedTermSet script tag (so the BreadcrumbList appears first in the head, matching the convention every other dual-JSON-LD page on the site uses: `/trust`, `/playbook`, `/my`, `/roi`, `/changelog`). No existing line in the file is reformatted, removed, or otherwise touched; the diff is exactly the new constant declaration plus one new line inside the Helmet.
- [ ] The BreadcrumbList's `name: 'AI & Automation Glossary'` field equals the existing `GLOSSARY_NAME` constant at Glossary.tsx line 67 per the 2026-05-25 mirror-source rule (the visible page heading copy in the hero strip already reads "AI & Automation Glossary" via the same constant), so the schema cannot drift from the visible page identity. The implementer reuses `GLOSSARY_NAME` in the BreadcrumbList rather than hardcoding a second string literal.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` AND `tests/e2e/glossary-definedtermset-schema.spec.ts` for `=== 'BreadcrumbList'` predicates AND `=== 'DefinedTermSet'` predicates and documents the result in the Implementation log. The BreadcrumbList grep is expected to return many matches across `tests/e2e/*-jsonld.spec.ts` and other specs, all URL-scoped per the existing convention. The DefinedTermSet grep is expected to return matches only in `glossary-definedtermset-schema.spec.ts`; the implementer confirms that spec's predicate identifies the DefinedTermSet block by `@type` alone and would NOT misidentify a sibling BreadcrumbList. Per the 2026-05-25 mirror-source-fix family rule, if any predecessor predicate on `/glossary` is "exactly one JSON-LD block" rather than "exactly one DefinedTermSet block," the implementer widens it in the SAME PR.
- [ ] The page renders byte-identical in the rendered DOM (the new Helmet emission is head-only, no visible-text change), in both light and dark mode, on a 375px mobile viewport. The page contains zero em-dash characters (`U+2014`) in the new constant or in the JSON-LD serialized string. The existing `definedTermSetJsonLd` constant and every `TERMS` entry stay byte-identical.
- [ ] A new e2e spec at `tests/e2e/glossary-breadcrumb-jsonld.spec.ts` asserts: (1) `GET /glossary` returns 200, (2) at least one `<script type="application/ld+json">` block on `/glossary` parses to a JSON object with `@type === 'BreadcrumbList'`, (3) that block has `itemListElement.length === 2`, (4) the first item is a ListItem with `position: 1`, `name: 'Home'`, `item: 'https://digitalcraftai.com'`, (5) the second item is a ListItem with `position: 2`, `name` matching the `GLOSSARY_NAME` constant value `'AI & Automation Glossary'`, `item: 'https://digitalcraftai.com/glossary'`, (6) the existing DefinedTermSet block STILL renders (asserted by counting `<script type="application/ld+json">` blocks whose parsed `@type === 'DefinedTermSet'` is exactly 1 - this is the non-regression check against ticket 0013's spec), (7) the page text contains no `String.fromCharCode(8212)` code point, (8) dark mode renders cleanly via `document.documentElement.classList.add('dark')`.
- [ ] No `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any other source file (the ticket is one file plus one new spec). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; `tests/e2e/glossary-definedtermset-schema.spec.ts` (ticket 0013) stays green; every other shipped `*-jsonld.spec.ts` stays green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A change to the existing DefinedTermSet block. The
  ticket 0013 schema stays byte-identical; widening
  it (e.g. adding `inLanguage`, or threading
  individual term schema.org IDs) is a separate
  SEO-hygiene ticket.
- Visible breadcrumb navigation chrome on the page
  itself (a rendered `<nav aria-label="Breadcrumb">`
  strip above the hero). Ticket 0019 added visible
  breadcrumbs on demo pages only; adding a visible
  breadcrumb to `/glossary` would compete with the
  existing hero badge ("AI & Automation Glossary"
  pill at Glossary.tsx line 109-112) for the same
  spatial attention and is its own UX ticket. The
  invisible-to-humans JSON-LD is this ticket's
  scope.
- A WebPage JSON-LD block on the page (mirroring
  `/my`'s WEBPAGE_SCHEMA at MyDashboard.tsx line 42-
  50). WebPage emission is its own SEO ticket and
  would force a 2026-05-30 second-@type collision
  audit on every other shipped WebPage spec; out of
  scope here. This ticket only adds BreadcrumbList.
- An Article JSON-LD block on the glossary. The
  glossary is a reference artifact (DefinedTermSet
  is the correct schema family), not an article;
  Article would misrepresent it.
- A change to the existing GLOSSARY_NAME or
  GLOSSARY_DESCRIPTION constants. The ticket
  reuses GLOSSARY_NAME for the BreadcrumbList
  second-position name field; renaming the
  constant or its value would force a sibling edit
  to the DefinedTermSet block and risk a
  ticket-0013-spec regression. Out of scope.
- Sitemap or routing changes. The `/glossary`
  route is already in `src/data/routes.ts` (ROUTES
  line 86 per the 2026-06-19 inventory) and in the
  sitemap generator output; this ticket is head-
  only structured data.
- A change to the index.html SEO Pilot pages
  table for `/glossary`. The route is already in
  the table per the 2026-06-19 inventory; per
  the 2026-05-25 SEO Pilot lesson, the e2e spec
  for this ticket asserts the JSON-LD block
  directly and does NOT use `page.toHaveTitle()`.
- Adding a per-term DefinedTerm `@id` field
  ("https://digitalcraftai.com/glossary#<slug>"
  on each DefinedTerm). That is its own schema
  enrichment ticket; mixing it with the
  BreadcrumbList add inflates the diff and the
  audit surface.
- Cross-promoting the BreadcrumbList from the
  homepage or any other page. Each surface emits
  its own BreadcrumbList per ticket 0019 / 0043 /
  0044 precedent; cross-promotion is not how
  BreadcrumbList works.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- `src/pages/Glossary.tsx` - the ONLY source file
  edited in this ticket. Add a new module-level
  constant `BREADCRUMB_SCHEMA` adjacent to the
  existing `definedTermSetJsonLd` constant at line
  80-90. Mirror the shape of `Changelog.tsx` line
  44 (the closest peer for a single-Helmet content
  page emitting a BreadcrumbList). Reuse
  `GLOSSARY_NAME` (Glossary.tsx line 67) for the
  position-2 name field per the 2026-05-25
  mirror-source rule. Add ONE new
  `<script type="application/ld+json">` tag inside
  the existing `<Helmet>` block (line 97-101) BEFORE
  the existing DefinedTermSet script tag.
- Per the 2026-05-30 second-@type lesson, BEFORE
  writing code grep `tests/e2e/*-jsonld.spec.ts`
  and `tests/e2e/glossary-definedtermset-schema.spec.ts`
  for `=== 'BreadcrumbList'` AND
  `=== 'DefinedTermSet'` predicates. Document the
  grep result in the Implementation log. The
  BreadcrumbList grep is expected to surface
  matches across many specs, all URL-scoped per the
  shipped convention; the DefinedTermSet grep is
  expected to surface matches in the ticket 0013
  spec only. The existing ticket-0013 spec MUST
  stay green; widen its predicate ONLY if the
  pre-code grep reveals it asserts "exactly one
  JSON-LD block on /glossary" rather than "exactly
  one DefinedTermSet on /glossary."
- Per the 2026-05-25 SEO Pilot lesson, the new
  e2e spec asserts the JSON-LD block directly via
  `page.locator('script[type="application/ld+json"]').evaluateAll(...)`
  and parses each block's text content; it does
  NOT use `page.toHaveTitle()`. `/glossary` is in
  the index.html SEO Pilot pages table so its
  title is set, but title is not the artifact
  this ticket emits.
- Per the 2026-05-07 em-dash Hard NO, every
  string in the new BREADCRUMB_SCHEMA constant
  and in the new spec uses hyphens. Self-Review
  greps the diff for `String.fromCharCode(8212)`
  before pushing.
- `tests/e2e/glossary-breadcrumb-jsonld.spec.ts`
  (new) - model the spec on
  `tests/e2e/trust-aboutpage-jsonld.spec.ts`
  (the closest peer for "single static content
  page emitting a BreadcrumbList block alongside
  another @type"). The non-regression assertion
  for the existing DefinedTermSet block reads
  every `<script type="application/ld+json">`,
  parses each to JSON, and filters by
  `@type === 'DefinedTermSet'` with
  `.toHaveLength(1)`. The same parsing pass
  filters by `@type === 'BreadcrumbList'` for
  the positive assertions.
- Per the 2026-06-15 negated-character-class
  lesson, any regex used to identify the JSON-LD
  block by tag shape uses `[^>]*` (not
  `[^/>]*`); inline `<script type="application/ld+json">`
  tags do not contain forward slashes in their
  attribute values, but matching from a
  stringified DOM is safer with `[^>]*`. In
  practice the spec uses `evaluateAll` on the
  Playwright locator, not a regex, so this trap
  is avoided structurally.
- Per the 2026-05-22 two-PR ship lesson, ship
  will need a follow-up
  `chore/0063-ship-status` PR after the feat PR
  merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index
  never drift mid-flip.
- New deps: NO. The edit reuses
  `react-helmet-async` already imported at
  Glossary.tsx line 3. Schema migration: no.
  Privacy/security surface change: no - the
  edit is head-only structured data with no
  visible-text change, no new network call, no
  new persistent storage, no new external link.
  The /trust page disclosure list does NOT need
  an edit because no new persistent store is
  added.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0063-...` opened
- YYYY-MM-DD - failing test added in `tests/...`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
