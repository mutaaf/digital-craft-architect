---
id: 0054
title: Emit Article JSON-LD on every /case-studies/:slug page so each case study indexes as a structured article artifact
status: shipped
priority: P1
area: seo
created: 2026-06-15
owner: gtm-innovation
---

## User story

As a Google crawler visiting the three existing case-study
detail pages (`/case-studies/construction`, `/case-studies/real-estate`,
`/case-studies/events`) and as a small-business owner who
arrives on one of these pages from a "AI for construction case
study" or "AI case study real estate" SERP query, I want each
page to declare an `Article` JSON-LD block naming the headline,
the published date, the author (Digital Craft AI), the canonical
URL, and the linked vertical so the page becomes eligible for
article-style rich results in SERP and so the same crawler that
indexed `/changelog` ItemList entries (ticket 0043) and the
`/compare` hub CollectionPage (ticket 0048) can index every
case study as a first-class structured artifact, so that the
three case-study pages stop being structurally invisible to
SERP rich-results and start carrying their share of the
"how AI works for [vertical]" long-tail.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: `src/pages/case-studies/CaseStudy.tsx`
already exists, already emits a `BreadcrumbList` JSON-LD block
(line 33-38, asserted by the ticket-0019 / 0044 family of
breadcrumb conventions), already renders three case studies
from `src/data/caseStudies.ts` (`caseStudies: CaseStudyDetail[]`
with slugs `construction`, `real-estate`, `events`), and already
has a `<link rel="canonical">` per the existing Helmet block.
What is missing is the `Article` block - the schema.org type
that is purpose-built for "a published article with a title,
date, author, and body." Adding it requires ONE new module-
level helper inside `CaseStudy.tsx` that builds the schema
from the existing `CaseStudyDetail` shape (no new data, no
new file outside the spec, no copy edits to the three case
studies). The three case-study slugs are also currently
MISSING from `src/data/routes.ts` ROUTES per the 2026-06-07
src-imports-tests lesson convention (routes.ts header explicitly
says "Dynamic-param routes (:slug etc.) are excluded - add a
dedicated test if you need to cover them with real slugs"),
which is the right call for `:slug` patterns but means the
three KNOWN slug values (the three caseStudies entries) have
no route-list membership and the smoke spec does not visit
them. This ticket fixes both halves: the JSON-LD block AND
explicit ROUTES membership for the three known slugs so the
smoke spec exercises them and the sitemap generator emits
them with `lastmod`.

### Stakeholder

This widens the SEO moat by giving the case-study family the
same structured-data treatment the homepage (Organization 0025),
the pricing FAQ (FAQPage 0012), the glossary (DefinedTermSet
0013), the demos hub (SoftwareApplication 0030), the changelog
(ItemList 0043), the trust page (AboutPage 0044), the texas
location (LocalBusiness 0051), the compare hub (CollectionPage
0048), and the roi page (WebApplication 0046) all already
have. Case studies are arguably the highest-trust artifact a
buyer reads on the site (real challenge, real solution, real
results, real quote), so they are the highest-leverage
candidate for `Article` rich results: a SERP that surfaces
"How a Construction Firm Booked More Jobs by Answering Leads
Instantly" with the published date, the author, and a
headline image (the existing `og-construction.png` / og-default
mapping reused as `image`) wins clicks that a plain blue link
cannot. Ticket 0044 explicitly named "AboutPage on /trust" as
the first structurally-indexable artifact JSON-LD addition;
this ticket extends the same pattern to the case-study family
which 0044's Out of Scope did not name but which is the next
obvious gap. The `Article` block also links each case study to
its vertical via `mainEntityOfPage` and `about`, so the
crawler sees `/case-studies/construction` as canonically
about the `/construction` vertical, deepening the cross-page
SEO graph that 0027 (related demos) and 0048 (compare hub)
started.

### Visitor (in the real moment of use)

A small-business owner Googles "AI for construction case study"
on a phone over lunch. Today the SERP listing for
`/case-studies/construction` is a plain blue link with a title
and a description. With `Article` JSON-LD shipped, the listing
becomes eligible for the article rich-result treatment (the
published date next to the headline, the author byline, a
larger thumbnail when the `image` field maps to the existing
`og-construction.png`). The visitor reads the headline date
and recognizes the case study is current. They tap the listing
and land on the same case-study page they always would have -
the JSON-LD changes the SERP experience, not the on-page
experience. The on-page article remains a single column of
challenge / solution / results / quote / CTA per the existing
CaseStudy.tsx render; no copy, layout, or component change.

### Growth

The "show me" moment is the SERP screenshot a Digital Craft
team member sends to a prospect: "look, even Google treats our
case studies as published articles, not marketing pages." That
is exactly the credibility signal an enterprise-curious buyer
needs in the discovery moment. The three case-study slugs are
also a measurable acquisition surface: each `trackCTAClick`
fire from the on-page calendly link already labels with
`'case_study'` (line 114 of CaseStudy.tsx), so the rich-result
uplift is directly attributable in GA against the
case-study-detail family. Per the ticket 0043 / 0048
precedent, structurally indexable artifacts are the cheapest
acquisition lever the SEO moat has because every new artifact
is a permanent SERP surface that earns clicks 24/7 with no
ongoing cost.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] `src/pages/case-studies/CaseStudy.tsx` emits a SECOND JSON-LD `<script type="application/ld+json">` block inside the existing `<Helmet>` head (under 30 added lines total), carrying `@type: 'Article'` with the following fields built from the matched `CaseStudyDetail`: `headline` (study.title), `description` (study.summary), `author: { '@type': 'Organization', name: 'Digital Craft AI', url: 'https://digitalcraftai.com' }`, `publisher: { '@type': 'Organization', name: 'Digital Craft AI', url: 'https://digitalcraftai.com', logo: { '@type': 'ImageObject', url: 'https://digitalcraftai.com/favicon.svg' } }`, `mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://digitalcraftai.com/case-studies/' + study.slug }`, `about: { '@type': 'Thing', name: study.vertical }`, `image: 'https://digitalcraftai.com' + IMAGE_BY_VERTICAL[study.vertical]` where IMAGE_BY_VERTICAL is a module-level lookup mapping the existing public/og-*.png filenames to the three verticals (Construction -> /og-construction.png, Real Estate -> /og-realestate.png, Events -> /og-events.png; default -> /og-default.png), and `datePublished`+`dateModified` both set to a NEW module-level `PUBLISHED_DATES: Record<string, string>` constant keyed by slug that maps each of the three known slugs to its YYYY-MM-DD first-published date as named in an HTML comment ("anchored to repo first-introduction of each caseStudies entry, not regenerated on every build, so dateModified does not churn"). The three dates can be set to `2025-09-01`, `2025-09-15`, `2025-10-01` as a defensible placeholder until a true repo-history audit is run; a comment explicitly says "if a case-study entry is added to src/data/caseStudies.ts, the implementer must add a matching PUBLISHED_DATES entry in the same PR or the existing fallback (`new Date().toISOString().slice(0,10)`) will date-stamp it as today, which check-blog-dates does NOT gate (only blogPosts.ts is gated)."
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/*-jsonld.spec.ts` AND every `tests/e2e/case-*.spec.ts` for `=== 'Article'` predicates. As of today there is no Article JSON-LD anywhere in `src/`; the only `Article`-adjacent emission is blog post Helmet meta `og:type=article` which is not a JSON-LD `@type`. The grep is mandatory regardless and the result is documented in the Implementation log. The pre-existing `BreadcrumbList` block on the same page is NOT edited (per the 2026-05-30 mirror-source-fix rule, only assertions that collide with the NEW block need rewriting; the BreadcrumbList block stays as shipped).
- [ ] The three known case-study slug routes (`/case-studies/construction`, `/case-studies/real-estate`, `/case-studies/events`) are added to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson, just below the `/locations/texas` entry near line 112. The routes.ts header comment that says "Dynamic-param routes (:slug etc.) are excluded - add a dedicated test if you need to cover them with real slugs" is amended in the SAME commit to read "Dynamic-param routes are excluded unless the slug values are themselves a known finite set (the three case-study slugs from src/data/caseStudies.ts are listed explicitly so the smoke spec exercises them)." The smoke spec inherits the three new routes automatically via the `tests/e2e/routes.ts` re-export. The sitemap generator (ticket 0022) picks up the three routes and emits `lastmod`.
- [ ] A new e2e spec at `tests/e2e/case-study-article-jsonld.spec.ts` (modeled on `tests/e2e/trust-aboutpage-jsonld.spec.ts` from ticket 0044, the closest peer for "asserts a second JSON-LD block on a single-page route") asserts: for each of the three slugs, the page emits exactly one `Article` JSON-LD block carrying the seven required fields (`headline`, `description`, `author`, `publisher`, `mainEntityOfPage`, `about`, `image`), the `image` URL ends with the correct vertical-mapped filename, the `mainEntityOfPage.@id` matches the canonical URL, the `BreadcrumbList` block from line 33-38 is still present and its `itemListElement` array still has three items (regression check), the page text contains no `String.fromCharCode(8212)` code point, and dark mode renders cleanly via `document.documentElement.classList.add('dark')`. The spec imports `caseStudies` from `src/data/caseStudies.ts` and iterates over the three known entries by slug rather than hardcoding them, so a future fourth case study automatically gets the same assertions (and fails loudly if `PUBLISHED_DATES` is not updated in the same PR).
- [ ] The `Article` JSON-LD block's `description` string MUST be identical to `study.summary` (the same string already used in the Helmet `meta[name="description"]` and `og:description` per the 2026-05-25 mirror-source rule). The implementer does NOT write a new description per case study; reusing the existing summary keeps the visible page text and the structured data identical. Every string in the new schema-building helper uses hyphens, never em-dashes. The new IMAGE_BY_VERTICAL constant and PUBLISHED_DATES constant both live as module-level constants inside CaseStudy.tsx (no new file in `src/data/` because both constants are tightly coupled to the JSON-LD emission and would be dead weight elsewhere).
- [ ] No `/api/` change, no new hostname (`favicon.svg` and the four `og-*.png` files all already exist in `public/`), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/data/caseStudies.ts` (the three entries stay as shipped), no edits to the rendered case-study layout (article body, results grid, quote, CTA all stay byte-identical to today), no edits to the existing `/case-studies/:slug` `BreadcrumbList` block (it stays as shipped per the no-collision baseline). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; every pre-existing JSON-LD spec (0012, 0013, 0016, 0025, 0030, 0039, 0043, 0044, 0046, 0048, 0049, 0051, 0052) stays green; the existing `tests/e2e/case-studies.spec.ts` (if any) stays green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- Emitting a `NewsArticle` or `BlogPosting` subtype instead
  of plain `Article`. The three case studies are
  marketing-style published articles, not news and not
  blog posts; `Article` is the correct base type per
  schema.org guidance. A future `BlogPosting` JSON-LD on
  blog post pages is its own ticket (the blog pipeline
  already emits `og:type=article` but no JSON-LD).
- Adding a `Person` author byline naming a specific Digital
  Craft team member. The existing on-page author is the
  organization (the three case studies are anonymized
  client stories authored institutionally), and the
  AGENTS.md Hard NO on invented client/team names applies.
  `author: { '@type': 'Organization', name: 'Digital Craft AI' }`
  is the defensible choice.
- Building a `/case-studies` HUB page indexing the three
  detail pages with `CollectionPage` + `ItemList` JSON-LD.
  The homepage already has a `CaseStudies` carousel
  component (`src/components/CaseStudies.tsx`) anchored at
  `/#case-studies` which is the existing hub; a separate
  `/case-studies` route would compete with that anchor and
  is a separate cross-cutting ticket. This ticket covers
  the three detail pages only.
- Adding a `Review` or `AggregateRating` JSON-LD block to
  each case study. The case studies are case studies, not
  product reviews; conflating the two types creates a
  schema.org-validator warning and is the wrong reading.
- Editing the existing `BreadcrumbList` block on
  `/case-studies/:slug` to add a `/case-studies` middle
  item. There is no `/case-studies` index route today, so
  a middle item would link to a 404. If the future
  CollectionPage hub ticket ships, that ticket updates
  the breadcrumb (the 2026-05-30 mirror-source-fix rule
  applies in the OTHER direction at that point).
- A backfill ticket adding the `@type=Article` block to
  blog posts at `/blog/:slug`. The blog pipeline is
  structurally different (gated by `check-blog-dates`,
  driven by `src/data/blogPosts.ts`) and a parallel ticket
  belongs in the content area, not bundled here.
- Internationalization (`inLanguage` fields on schema).
  The page is English-only, matching the case-study copy.
- Adding the three `/case-studies/<slug>` routes to the
  `index.html` SEO Pilot `pages` table. That is its own
  SEO-hygiene ticket and applies uniformly to dynamic-slug
  routes (the existing SEO Pilot table contains no slug
  routes). Out of scope here per the 2026-05-25 SEO Pilot
  lesson.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- `src/pages/case-studies/CaseStudy.tsx` - additive
  edits only (target: under 50 added lines).
  - Add two module-level constants ABOVE the `CaseStudy`
    component declaration (line 11):
    `const IMAGE_BY_VERTICAL: Record<string, string> = { 'Construction': '/og-construction.png', 'Real Estate': '/og-realestate.png', 'Events': '/og-events.png' }`
    and
    `const PUBLISHED_DATES: Record<string, string> = { 'construction': '2025-09-01', 'real-estate': '2025-09-15', 'events': '2025-10-01' }`.
    Each constant has an HTML comment naming the source
    rule and the maintenance contract (per the
    2026-05-25 mirror-source rule).
  - Inside the existing `<Helmet>` block, immediately
    after the existing `BreadcrumbList` `<script>` tag
    (line 31-39), add a SECOND
    `<script type="application/ld+json">` tag emitting
    the Article schema. Build the object inline (no
    helper function unless it crosses 15 lines) so the
    diff is auditable in one read. Reuse `study.title`,
    `study.summary`, `study.vertical`, `study.slug` from
    the existing render scope; pull `image` from
    `IMAGE_BY_VERTICAL[study.vertical] ?? '/og-default.png'`
    and `datePublished` from
    `PUBLISHED_DATES[study.slug] ?? new Date().toISOString().slice(0,10)`
    (the today-fallback is the documented escape hatch
    for an unmaintained new slug, named in the constant
    comment).
- `src/data/routes.ts` - add three lines below
  `/locations/texas`:
  `'/case-studies/construction',`,
  `'/case-studies/real-estate',`,
  `'/case-studies/events',`.
  Amend the header comment paragraph that excludes
  slug routes to name the case-study exception
  explicitly per the acceptance criterion above.
- Per the 2026-05-30 second-@type lesson, BEFORE
  writing code grep `tests/e2e/*-jsonld.spec.ts` and
  `tests/e2e/case-*.spec.ts` for `=== 'Article'`
  predicates. Document the grep result in the
  Implementation log. As of the agent's read today
  there is no `Article` `@type` JSON-LD anywhere in
  `src/`, so the new block does not collide; the grep
  is mandatory regardless.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e
  spec asserts the Helmet-managed second
  `<script type="application/ld+json">` block content
  directly via
  `page.locator('script[type="application/ld+json"]').nth(<index>)`
  patterns established in the ticket 0044 spec, NOT
  `page.toHaveTitle()`. The route is not in the
  `index.html` SEO Pilot pages table and is not added
  in this ticket.
- Per the 2026-05-07 em-dash Hard NO, every string in
  the new helper (the two constants, the seven schema
  field values, the comment text) uses hyphens.
  Self-Review greps the diff for
  `String.fromCharCode(8212)` before pushing.
- `tests/e2e/case-study-article-jsonld.spec.ts` (new)
  - one assertion per acceptance box. Model the spec
  on `tests/e2e/trust-aboutpage-jsonld.spec.ts`
  (ticket 0044, the closest peer for "second JSON-LD
  block on a single page"). Import `caseStudies` from
  `src/data/caseStudies.ts` and iterate by slug so the
  spec is future-proof against a fourth case study.
  The image-suffix assertion uses
  `expect(articleSchema.image).toMatch(/\/og-.+\.png$/)`
  to assert the verical-mapped file shape without
  hardcoding three URLs.
- Per the 2026-05-22 two-PR ship lesson, ship will
  need a follow-up `chore/0054-ship-status` PR after
  the feat PR merges to flip the ticket frontmatter
  AND its `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing the
  second PR so the file and index never drift mid-flip.
- New deps: NO. The page reuses the existing
  `react-helmet-async`, `react-router-dom`, the
  existing `og-*.png` images already shipped in
  `public/`, and the existing `caseStudies` data
  array. Schema migration: no. Privacy/security
  surface change: no - the JSON-LD is read-only
  structured data over already-rendered marketing
  copy; no new persistent store, no new network
  call, no PII. The /trust page disclosure list
  does NOT need an edit.

## Implementation log

(Appended by the implementation-dev agent during execution.)

### 2026-06-15 - implementation-dev pickup

Branch: `feat/0054-case-study-article-jsonld`.

Pre-write grep for the 2026-05-30 second-@type lesson, run BEFORE any
code edits:

- `rg "=== 'Article'" tests/e2e/*-jsonld.spec.ts tests/e2e/case-*.spec.ts`
  returns ZERO matches today. The only `'Article'`-bearing strings in the
  repo are the ticket file itself and an `og:type="article"` Helmet meta
  on this page (string equality, not a JSON-LD `@type` predicate). The
  new `Article` JSON-LD block therefore cannot collide with any existing
  spec's "exactly-one-of-this-@type" assertion. No predecessor spec needs
  widening as a precondition.
- Existing JSON-LD specs reviewed for sibling collisions:
  `homepage-organization-jsonld`, `website-sitelinks-jsonld`,
  `demos-softwareapplication-jsonld`, `quiz-jsonld`,
  `changelog-itemlist-jsonld`, `trust-aboutpage-jsonld`,
  `texas-localbusiness-jsonld`. None target `/case-studies/:slug` and
  none assert an `Article` predicate.
- The pre-existing `BreadcrumbList` block on `/case-studies/:slug`
  (CaseStudy.tsx lines 31-39) is per-URL scoped; no global "exactly one
  BreadcrumbList site-wide" spec exists. The new Article block sits in
  the same `<Helmet>` alongside it without touching its emission.


