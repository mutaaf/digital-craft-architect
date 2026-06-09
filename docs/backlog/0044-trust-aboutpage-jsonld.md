---
id: 0044
title: Emit AboutPage + BreadcrumbList JSON-LD on /trust so the data-handling disclosure indexes as a canonical artifact
status: groomed
priority: P2
area: seo
created: 2026-06-09
owner: gtm-innovation
---

## User story

As a procurement-conscious owner Googling "Digital Craft AI
privacy," "Digital Craft AI data handling," "Digital Craft AI
trust," or "where does Digital Craft AI send my data," I want
the public `/trust` page to expose itself as a canonical
data-handling disclosure artifact in search results, so that
the SERP listing reads as a real privacy document I can cite
in a procurement review instead of a marketing page, and I
click through to a specific section (scraped data, voice
audio, email, browser storage, never-stored, deletion) with
one tap.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: `/trust` (ticket 0018)
is a real, working data-handling disclosure with six
plain-language sections (`scraped-website-data`,
`voice-call-audio`, `email-form-submissions`, `browser-storage`,
`never-stored`, `deletion-contact`) and a nine-provider list,
each section already carrying a stable `id` for jump-anchor
navigation. Today the page emits ZERO structured data
(`src/pages/Trust.tsx` Helmet head at lines 221-225 contains
only the title, description, and canonical link; the
comment at line 20 explicitly notes "per the 2026-05-30
second-@type lesson no JSON-LD" was emitted at ship time, a
correct decision then but the site has matured since). The
page's section-list-with-stable-anchors shape maps directly
onto schema.org `AboutPage` (the canonical type for "about
the organization's data handling"). One JSON-LD block inside
the existing Helmet head publishes the structure without
changing one line of UI copy. Same pattern as the Quiz
JSON-LD ticket 0039 and the Organization JSON-LD ticket
0025: take a uniquely-shaped artifact already shipped and
publish its shape to crawlers.

### Stakeholder

This widens the SEO moat in a content class no comparison
page, landing page, or demo can earn: a canonical trust
artifact. `/trust` is the only DigitalCraft surface that
names every third-party provider in the data pipeline by
name (OpenAI, Vapi, ElevenLabs, Deepgram, Firecrawl, Jina,
Formspree, Sentry, Google Analytics) and discloses where
each piece of visitor data actually goes; structured data
is the prerequisite to Google ever displaying it as a
trust rich result. The page also backs the data-disclosure
chip on every demo (ticket 0033), the footer "AI providers
we use" chip (ticket 0023), and the per-demo "what we
store" wording (ticket 0033) - so any SERP-side visibility
lift compounds across the trust funnel. Same pattern as
the FAQPage ticket 0012 earned for pricing-FAQ and the
DefinedTermSet ticket 0013 earned for glossary: publish
the existing structure to crawlers.

### Visitor (in the real moment of use)

A small-business owner with a procurement checklist Googles
"Digital Craft AI data handling" on a phone. The SERP
listing for `/trust` shows the page title, the meta
description, and (after this ticket and Google's normal
indexing cycle) the page is correctly classified as an
AboutPage about an Organization, with breadcrumbs Home ->
Trust visible in the SERP. The visitor recognises "this is
an actual disclosure document, not a marketing page" and
clicks through with intent to a specific section via the
existing jump-anchor nav. On `/trust` itself, nothing
visible changes (the JSON-LD is head-only); the page still
loads, renders the providers card, the six sections, and
the deletion-contact mailto exactly as today. No new UI
element, no new input, no copy change.

### Growth

The "show me" moment is the Google rich-results test
(`search.google.com/test/rich-results`) returning a green
`AboutPage`-detected card for `/trust` with the canonical
Organization correctly linked via the `about` field to the
homepage Organization JSON-LD (ticket 0025). That is the
single screenshot the Product Owner can paste into a
stakeholder review as proof the trust disclosure is
indexable as a canonical artifact. A returning visitor on a
procurement review is by construction high-intent;
structured data is the cheapest, most defensible lever to
compete for that listing position against the generic
"AI privacy" articles that currently rank.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] An `AboutPage` JSON-LD block is emitted inside the existing `<Helmet>` head of `src/pages/Trust.tsx` via `<script type="application/ld+json">`. The block's `@context` is `https://schema.org`, its `@type` is `AboutPage`, and it carries: `name: 'How Our Demos Handle Your Data'` (matching the rendered H1 in the existing Hero block), `description` (same string as the `TRUST_DESCRIPTION` constant per the 2026-05-25 mirror-source rule), `url: 'https://digitalcraftai.com/trust'`, `inLanguage: 'en-US'`, `dateModified: <YYYY-MM-DD>` (sourced from `git log -1 --format=%cs -- src/pages/Trust.tsx` at build time, mirroring the sitemap-lastmod pattern from ticket 0022; if git history is unavailable in the build cache, the implementer hard-codes today's date in a single module constant `TRUST_LAST_MODIFIED` and documents the fallback in the Implementation log), `mainContentOfPage: ItemList` whose `itemListElement` mirrors the existing `SECTIONS` array - each entry is a `WebPageElement` with `name: <section.heading>`, `url: 'https://digitalcraftai.com/trust#<section.id>'`, and a positive integer `position`, and `about` linking to the Organization via `{ '@type': 'Organization', name: 'DigitalCraft AI', url: 'https://digitalcraftai.com' }` so the AboutPage correctly references the homepage Organization JSON-LD (ticket 0025).
- [ ] The `mainContentOfPage.itemListElement` array length equals `SECTIONS.length` (today 6). The implementer does NOT hardcode 6; the JSON-LD is built by mapping over the same `SECTIONS` array the visible jump-nav and the section render both read so any future section add or remove updates the schema automatically. Per the 2026-05-25 mirror-source rule, `SECTIONS` is the single shared source for the visible nav, the visible body, and the schema; an e2e assertion confirms `mainContentOfPage.itemListElement.length` equals the count of rendered `[id]` anchors inside the SECTIONS render block.
- [ ] A `BreadcrumbList` JSON-LD block is ALSO emitted inside the same `<Helmet>` head (Home -> Trust), matching the existing pattern in `src/pages/AiForElectricians.tsx`, `src/pages/AIReadinessQuiz.tsx`, and the compare pages. Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/*-jsonld.spec.ts` for a `=== 'BreadcrumbList'` predicate AND a `=== 'AboutPage'` predicate to confirm no existing spec asserts "exactly one of either @type block site-wide" (the AboutPage @type is new to the codebase per the line-20 comment in `Trust.tsx`, so the AboutPage grep is expected to return zero matches; the grep is mandatory and the result is documented in the Implementation log).
- [ ] No copy on `/trust` changes: the H1, the hero description, the providers list, the six section headings and bodies, the jump-nav anchors, and every rendered string stay byte-for-byte identical to the current build. The diff is additive only (one AboutPage block + one BreadcrumbList block + at most one `TRUST_LAST_MODIFIED` constant inside the existing module, plus the Helmet inserts). A regression e2e asserts: the H1 still reads "How Our Demos Handle Your Data" (split across the two existing spans), every entry in the existing `PROVIDERS` constant still appears in the rendered body, every entry in the existing `SECTIONS` constant still renders a `[id="<section.id>"]` anchor that the jump-nav link targets.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, the AboutPage JSON-LD parses as valid JSON (a parse failure throws and the spec catches it), and the JSON-LD block contains zero em-dash characters (`U+2014`). Per the 2026-05-25 mirror-source-fix lesson, if any string in the existing `SECTIONS[i].heading` or `TRUST_DESCRIPTION` or `PROVIDERS[i].purpose` already contains an em-dash, repair it AT THE SOURCE in this same PR so the visible page and the JSON-LD mirror stay identical. (Heading strings are pulled directly into the schema; the others stay visible-only. The 0040 mirror-source repair pattern applies.)
- [ ] A new e2e spec at `tests/e2e/trust-aboutpage-jsonld.spec.ts` asserts: navigate to `/trust` and read all `script[type="application/ld+json"]` blocks; exactly one block has top-level `@type === 'AboutPage'`; the AboutPage block parses as valid JSON; `AboutPage.about['@type'] === 'Organization'` and `AboutPage.about.url === 'https://digitalcraftai.com'`; `AboutPage.url === 'https://digitalcraftai.com/trust'`; `AboutPage.mainContentOfPage.itemListElement.length === 6` (matching SECTIONS.length); every itemListElement entry has a `name` that matches one of the rendered jump-nav anchor texts and a `url` that ends in `/trust#<id>`; exactly one block has `@type === 'BreadcrumbList'`; the BreadcrumbList's second item names "Trust"; the page text contains no `U+2014` code point and the JSON-LD serialized strings contain no `U+2014` either. The spec also asserts the `meta[name="description"]` content matches the AboutPage block's `description` field exactly (mirror-source guarantee), reading the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson. Per the 2026-05-25 SEO Pilot lesson, the spec does NOT use `page.toHaveTitle()` (`/trust` is not in the SEO Pilot table per the ticket 0018 / 0023 note in `Trust.tsx` line 34).
- [ ] No `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/pages/Index.tsx` or `src/data/organizationSchema.ts` (the AboutPage references the Organization via a minimal inline `about` field; widening to include the full Organization block would risk a 2026-05-30 second-@type collision against the homepage Organization spec ticket 0025 and is out of scope here). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta` stay green; `npm run typecheck` stays clean. The new spec passes; the existing `tests/e2e/trust-page.spec.ts` (ticket 0018) AND the existing `tests/e2e/homepage-organization-jsonld.spec.ts` (ticket 0025) stay green.

## Out of scope

- Adding `/trust` to the `index.html` SEO Pilot `pages` table.
  That is its own SEO-hygiene ticket per the ticket 0018 note
  at `Trust.tsx` line 34. Out of scope here.
- Emitting a `FAQPage` JSON-LD on `/trust`. The six section
  bodies are React node trees with `<p>` and `<ul>` children,
  not plain strings; extracting a clean Question / Answer
  pair without losing structure would require a separate
  source-of-truth data file and is its own ticket. Out of
  scope here.
- Emitting an `Organization` JSON-LD on `/trust`. The homepage
  Organization JSON-LD (ticket 0025) is the single canonical
  Organization artifact; duplicating it here would trip the
  2026-05-30 second-@type collision risk against the existing
  homepage spec. The AboutPage references it via a minimal
  inline `about: { '@type': 'Organization', name, url }` only.
- Adding a `Person` schema for the founder. The trust page is
  about data handling, not about the founder; the founder
  surface is its own conversion page and own ticket.
- Adding `sameAs`, `contactPoint`, `address`, or any contact
  data to the AboutPage block. The deletion contact is
  rendered as a `mailto:` link on the page; the structured-
  data shape is intentionally minimal so the AboutPage
  references the Organization rather than re-declaring it.
- Changing the visible page layout, the jump-nav, the
  providers card, the six section bodies, or the deletion
  contact mailto. The ticket is structured-data publication
  of the artifact AS IT IS today, not a redesign.
- Backdating `dateModified` to an older value than the current
  git history of `Trust.tsx`. The field reflects the actual
  last commit date; falsifying it would mislead crawlers.
- A Google rich-results validation script as part of the local
  gate. The 2026-05-28 lesson on inlined assertions vs. new
  frameworks applies: the validation is done by the new spec
  reading the schema, not by adding a new validator script.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- `src/pages/Trust.tsx` - add two new JSON-LD blocks inside
  the existing `<Helmet>` head (lines 221-225). The blocks
  are built as module-level constants
  (`ABOUT_PAGE_SCHEMA`, `BREADCRUMB_SCHEMA`) so the page
  module stays readable; do NOT inline a giant object
  literal inside the Helmet JSX. Per the 2026-05-25 mirror-
  source rule, the `TRUST_DESCRIPTION` constant already
  defined at line 46-47 is read from BOTH
  `<meta name="description" content={TRUST_DESCRIPTION} />`
  AND `ABOUT_PAGE_SCHEMA.description`; no second
  description string is introduced. The `name` field reads
  exactly "How Our Demos Handle Your Data" (the existing H1
  text reconstructed from the two spans at lines 236-238 in
  the current source).
- The `ABOUT_PAGE_SCHEMA.mainContentOfPage.itemListElement`
  array is built by mapping over the existing `SECTIONS`
  array
  (`SECTIONS.map((s, i) => ({ '@type': 'WebPageElement', position: i + 1, name: s.heading, url: 'https://digitalcraftai.com/trust#' + s.id }))`)
  so the schema length always equals the rendered section
  count and a future section add does not need a schema
  edit. The `dateModified` field is sourced from a single
  module-level constant `TRUST_LAST_MODIFIED` (the
  implementer sets this to today's date manually in the same
  PR; a build-time git-log read would require a generator
  script and would balloon the diff, so the static-constant
  approach is the right granularity here per the 2026-05-28
  inline-assertions lesson - the field is verified by the
  new spec, not by a new build step).
- The Helmet emits the two JSON-LD blocks as
  `<script type="application/ld+json">{JSON.stringify(ABOUT_PAGE_SCHEMA)}</script>`
  AND a second `<script>` for `BREADCRUMB_SCHEMA`. Two
  separate script tags is the same shape as the
  AiForRoofers / AiForElectricians / Quiz pages today; do
  NOT wrap them in a `@graph` since Google parses sibling
  script tags independently.
- Per the 2026-05-30 second-@type lesson, the implementer
  greps `tests/e2e/*-jsonld.spec.ts` for both
  `=== 'BreadcrumbList'` AND `=== 'AboutPage'`. The
  BreadcrumbList grep is the same pattern as ticket 0039's
  pre-write grep (which returned 14 per-URL scoped matches
  per the 0039 Implementation log). The AboutPage grep is
  expected to return zero matches (the @type is new to the
  codebase per the line-20 comment in `Trust.tsx`); document
  the result in the Implementation log.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e spec
  asserts the Helmet-managed `meta[name="description"]`
  content directly (reading the LAST `meta[name="description"]`
  element in the head per the 2026-05-25 Helmet-appends
  lesson), NOT `page.toHaveTitle()`. The route is not in
  the `index.html` SEO Pilot pages table per the ticket
  0018 note in `Trust.tsx`.
- Per the 2026-05-07 em-dash Hard NO, every string in the
  emitted JSON-LD (the AboutPage `name`, `description`, every
  WebPageElement `name`, the BreadcrumbList names) uses
  hyphens. Self-Review greps the diff for
  `String.fromCharCode(8212)` before pushing. The 2026-05-25
  mirror-source-fix applies if any pre-existing
  `SECTIONS[i].heading`, `TRUST_DESCRIPTION`, or visible
  body string already contains an em-dash - repair AT THE
  SOURCE (the `SECTIONS` constant or the body JSX) so
  visible and mirror stay identical.
- `tests/e2e/trust-aboutpage-jsonld.spec.ts` (new) - one
  spec per acceptance box. Model the spec on
  `tests/e2e/quiz-jsonld.spec.ts` (ticket 0039, the closest
  peer for "publish structure of an existing artifact").
  JSON-LD case: read all
  `script[type="application/ld+json"]` blocks, filter to
  top-level `@type === 'AboutPage'`, assert exactly one.
  Shape case: assert `AboutPage.about['@type'] === 'Organization'`,
  `AboutPage.url === 'https://digitalcraftai.com/trust'`,
  `mainContentOfPage.itemListElement.length === 6`. Mirror
  case: read the LAST `meta[name="description"]` content,
  assert it equals the AboutPage block's `description`
  byte-for-byte. Breadcrumb case: filter to
  `@type === 'BreadcrumbList'`, assert exactly one, assert
  second item name is "Trust." Anchor-match case: for each
  itemListElement entry, parse the hash from its `url`
  field, assert the page has a rendered element with that
  `id`. No-em-dash case: read the rendered text AND the
  JSON-LD serialized strings, assert neither contains
  `String.fromCharCode(8212)`. Dark-mode case: apply
  `document.documentElement.classList.add('dark')` and
  assert the H1 renders.
- Per the 2026-05-22 two-PR ship lesson, ship will need a
  follow-up `chore/0044-ship-status` PR after the feat PR
  merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to `shipped` together;
  run `node scripts/check-backlog.mjs` before pushing the
  second PR so the file and index never drift mid-flip.
- New deps: NO. The page already uses `react-helmet-async`;
  no new component, no new utility, no new test framework.
  Schema migration: no. Privacy/security surface change:
  no - the JSON-LD is static derived from the existing
  `SECTIONS` and `TRUST_DESCRIPTION` constants; no new
  data flow, no new analytics field, no new external
  network destination is introduced. (Per the line-20 ticket-
  0018 comment, the prior "no JSON-LD" stance was the
  correct call at ship time; this ticket revisits it now
  that the second-@type lesson has matured and the codebase
  has shipped 16 other JSON-LD blocks under the same
  per-URL-scoped predicate pattern.)

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0044-...` opened
- YYYY-MM-DD - failing test added in `tests/e2e/trust-aboutpage-jsonld.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
