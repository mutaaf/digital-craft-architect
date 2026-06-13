---
id: 0051
title: Emit LocalBusiness JSON-LD on /locations/texas so the state-level location page indexes as a local search artifact
status: groomed
priority: P2
area: seo
created: 2026-06-13
owner: gtm-innovation
---

## User story

As a Dallas, Houston, or Austin business owner Googling
"construction AI Dallas," "Texas real estate AI," "AI
automation Austin," or "AI for Texas contractors" on a phone
during the workday, I want the public `/locations/texas` page
to expose itself as a canonical Texas-market AI-automation
business in search results, so that the SERP listing reads as
a real local-business artifact eligible for local-pack
treatment instead of a generic landing page, and a Texas
operator clicks through knowing the service actually serves
their metro.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: `/locations/texas`
(`src/pages/locations/Texas.tsx`) is a real, shipped state-
level location page covering Dallas, Houston, and Austin
with metro-specific market context and two vertical funnels
(construction + real estate). Today the page emits exactly
ONE JSON-LD block (`BreadcrumbList`, lines 80-92) and zero
local-business signals. That is the correct shape for a
non-local page but the wrong shape for a state-level
location page. The page's metro-named structure (CITIES
constant at line 34, STATS at line 27, VERTICALS at line
52) maps directly onto schema.org `LocalBusiness` plus
`areaServed` for the three metros. One JSON-LD block added
inside the existing Helmet head publishes the structure
without changing one line of UI copy. Same pattern as the
Quiz JSON-LD ticket 0039 and the Trust AboutPage JSON-LD
ticket 0044: take a uniquely-shaped artifact already
shipped and publish its shape to crawlers. The page is the
ONLY `/locations/*` page on the site today; the schema
shape established here is the template a future
`/locations/california` or `/locations/florida` page would
mirror.

### Stakeholder

This widens the moat in a query class no existing page
covers: state-level and metro-level local search. Google
treats `LocalBusiness` JSON-LD as one of the strongest
signals for local-pack eligibility, and the homepage
`Organization` block (ticket 0025) is a national-business
shape, not a local-business shape. Today `/locations/texas`
ranks (if at all) as a generic landing page; with a
properly-structured `LocalBusiness` block naming Dallas,
Houston, and Austin in `areaServed`, the page becomes the
canonical artifact Google can elevate for "AI automation in
Texas" or metro-named SERPs. The page is also the natural
first canonical location artifact the site has earned: per
the ticket 0025 Out of Scope ("Adding the homepage to a
future `LocalBusiness` schema, the site does not have a
single physical address yet"), `LocalBusiness` was
intentionally deferred from the homepage because the
business is multi-metro. The state-level location page is
the correct surface for the deferred work because it has
the multi-metro reality baked into its design (three
named cities, statewide market context). First
`LocalBusiness` emission site-wide; the new pattern
becomes the template for `/locations/california`,
`/locations/florida`, etc. without re-architecting any
of the homepage Organization shape.

### Visitor (in the real moment of use)

A Dallas general-contractor owner Googles "construction AI
Dallas" on a phone Tuesday morning between estimates. The
SERP listing surfaces `/locations/texas` with a
description that names Dallas, Houston, and Austin and a
"Serves Dallas-Fort Worth" sub-line because Google has
elevated the page on the strength of the
`LocalBusiness.areaServed` field. The visitor taps and
arrives at a page that already names their metro at the
top with the existing market-context paragraph; the page
feels written for Texas, not adapted from a national
landing page. Nothing visual changes from today's shipped
page; the entire ticket is a head-tag emission that makes
the page Google-readable as the local artifact it
already is on the surface.

### Growth

The "show me" moment is the SERP listing for "construction
AI Dallas" or "Texas real estate AI" returning the
location page directly with rich-result treatment instead
of the generic homepage. A Texas operator who arrives
from a metro-named query has self-selected as an in-
market prospect, which is the highest-intent local-search
click the funnel can produce. The page already emits the
two vertical CTAs (`/construction`, `/realestate`) per
the existing shipped layout; the JSON-LD addition does
not change CTAs, copy, or layout. The same `LocalBusiness`
pattern, once landed, is the template a future
California or Florida location page would mirror in a
two-line copy without re-deriving the schema shape.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] `src/pages/locations/Texas.tsx` gets ONE new `LocalBusiness` JSON-LD block injected inside the existing `<Helmet>` head, ALONGSIDE the existing `BreadcrumbList` block; the existing `BreadcrumbList` is NOT removed or edited. The new block is built from a new module-level constant `LOCALBUSINESS_SCHEMA` mirroring the visible page content: `@type: 'LocalBusiness'`, `name: 'Digital Craft AI - Texas'`, `description` (same string as the existing Helmet `<meta name="description">` per the 2026-05-25 mirror-source rule; extract the meta description into a module-level `META_DESCRIPTION` constant if it is currently inlined, and reuse it in both surfaces), `url: 'https://digitalcraftai.com/locations/texas'`, `areaServed: [{ '@type': 'City', name: 'Dallas-Fort Worth' }, { '@type': 'City', name: 'Houston' }, { '@type': 'City', name: 'Austin' }, { '@type': 'State', name: 'Texas' }]`, `serviceType: ['AI Lead Response', 'AI Voice Agents', 'AI Estimate Generation', 'AI Deal Analysis']`, and `parentOrganization` pointing to the existing DigitalCraft Organization by URL. No physical-address fields (no `address`, no `geo`, no `telephone`) because the business has no single Texas storefront and the AGENTS.md defensible-claims rule forbids inventing one.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/*-jsonld.spec.ts` for `=== 'LocalBusiness'` AND `=== 'BreadcrumbList'` predicates. `LocalBusiness` is expected to return zero matches (first emission site-wide); `BreadcrumbList` matches per-URL scoped specs only per the ticket 0048 Implementation log. The grep result is documented in the Implementation log. Confirm specifically that the homepage `Organization` spec (`tests/e2e/homepage-organization-jsonld.spec.ts`) does NOT contain a "no `LocalBusiness` block site-wide" predicate; if it does, the predecessor spec must be widened in the same PR per the 2026-05-30 lesson family.
- [ ] A new e2e spec at `tests/e2e/texas-localbusiness-jsonld.spec.ts` asserts: (1) navigates to `/locations/texas`, asserts the page returns < 400 status, (2) parses every JSON-LD block in the head and asserts exactly one `BreadcrumbList` block exists (regression check against accidentally removing the existing block), (3) asserts exactly one `LocalBusiness` block exists with the expected `name`, `url`, and `parentOrganization`, (4) asserts the `areaServed` array contains exactly four entries with `name` fields ['Dallas-Fort Worth', 'Houston', 'Austin', 'Texas'] in that order, (5) asserts the `serviceType` array contains exactly four service strings, (6) asserts the `description` field equals the LAST `meta[name="description"]` content byte-for-byte (mirror-source guarantee, asserted on the LAST `meta` per the 2026-05-25 Helmet-appends lesson), (7) asserts the page text contains no `U+2014` code point, (8) asserts dark mode renders cleanly. Spec mirrors the structure of `tests/e2e/trust-aboutpage-jsonld.spec.ts` (ticket 0044, the closest peer for "add one JSON-LD block alongside an existing BreadcrumbList without changing UI copy").
- [ ] No visible UI change on `/locations/texas`. The hero copy, the STATS row, the CITIES blurbs, the VERTICALS cards, the testimonial placeholders, the CTAs, and every existing string stays byte-identical with one exception: extracting the meta description into a `META_DESCRIPTION` constant per the mirror-source rule is a refactor that does not change the rendered text. A `git diff main src/pages/locations/Texas.tsx` shows ONLY the new constant, the new schema constant, the new `<script type="application/ld+json">` tag inside Helmet, and (if the meta description was inlined) the swap from inline string to `META_DESCRIPTION` constant reference; nothing else changes.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport (the existing layout is already dark-mode-ready; the ticket adds no new visible element), and the new JSON-LD block contains zero em-dash characters (`U+2014`) in any string. Per the 2026-05-07 em-dash Hard NO and the 2026-05-25 mirror-source rule, the `LOCALBUSINESS_SCHEMA.description` reuses `META_DESCRIPTION` (which is hyphen-only by the existing 0017-0047 trade-page convention); if the inlined meta description on `/locations/texas` today contains any U+2014 (it should not per the 2026-05-22 Self-Review grep, but verify), the implementer fixes the em-dash AT the source per the 2026-05-25 mirror-source-fix lesson rather than stripping it only in the mirror.
- [ ] No `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/pages/Index.tsx` or to `src/pages/Construction.tsx` or to `src/pages/RealEstate.tsx` (the homepage Organization block from ticket 0025 stays unchanged; the new `LocalBusiness` block is a parallel, not a replacement). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; every pre-existing JSON-LD spec (tickets 0012, 0013, 0016, 0019, 0025, 0030, 0039, 0043, 0044, 0048) stays green; the homepage `Organization` spec stays green (the new block is `/locations/texas`-scoped only, not the homepage).

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- Adding a `LocalBusiness` block on the homepage (`/`).
  Per the ticket 0025 Out of Scope explicit deferral
  ("Adding the homepage to a future `LocalBusiness`
  schema"), the homepage `Organization` shape stays as
  shipped. A homepage `LocalBusiness` block would
  require a single physical address the business does
  not have; out of scope here.
- Adding a `LocalBusiness` block on `/construction`,
  `/realestate`, or any vertical page. The vertical
  pages are national in scope; only `/locations/*`
  pages get `LocalBusiness` per this ticket's pattern.
- Creating a new `/locations/california` or
  `/locations/florida` page. The schema shape this
  ticket establishes is the template such future
  pages would mirror, but creating them is each its
  own ticket per the AGENTS.md small-focused-PR rule.
- Adding `aggregateRating` or `review` fields to the
  `LocalBusiness` block. The AGENTS.md Hard NO on
  invented testimonials and the defensible-claims rule
  forbid inventing review aggregates; real reviews
  ship through their own pipeline once available.
- Adding `priceRange`, `openingHours`, or
  `telephone` fields. The business has no Texas
  storefront, no fixed price range, no published phone
  line for the location page; inventing them would
  violate the defensible-claims rule. Out of scope.
- Adding `geo` (latitude/longitude) coordinates. With
  three named metros and no physical office, geo would
  be misleading. Out of scope.
- Editing the visible page copy (the hero, the STATS,
  the CITIES blurbs, the VERTICALS cards, the
  testimonial placeholders). The ticket is a head-tag
  emission only; copy edits are explicitly deferred.
- Adding `/locations/texas` to the `index.html` SEO
  Pilot `pages` table. That is its own SEO-hygiene
  ticket per the 2026-05-25 SEO Pilot lesson; out of
  scope here.
- A LocalBusiness-rich-result-targeting blog post. Blog
  content ships through `src/data/blogPosts.ts` and is
  gated by `check-blog-dates`; thematic content is its
  own ticket.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- `src/pages/locations/Texas.tsx` - add three new
  module-level constants near the existing
  `BREADCRUMB_SCHEMA` (lines 80-92): `META_DESCRIPTION`
  (extracted from the inline `<meta name="description"
  content="...">` Helmet tag at line 102-104),
  `ORG_REF` (an object `{ '@type': 'Organization', name: 'Digital Craft AI', url: 'https://digitalcraftai.com' }`
  reused inside `LOCALBUSINESS_SCHEMA.parentOrganization`
  to keep the reference identity stable), and
  `LOCALBUSINESS_SCHEMA` (the new block). The new
  schema constant is purely additive; the existing
  `BREADCRUMB_SCHEMA` and its emission tag at line 111
  stay byte-identical.
- Inside the existing `<Helmet>` head, swap the inlined
  meta description (line 102-104) to
  `<meta name="description" content={META_DESCRIPTION} />`
  and add ONE new `<script type="application/ld+json">{JSON.stringify(LOCALBUSINESS_SCHEMA)}</script>`
  tag immediately after the existing
  `BREADCRUMB_SCHEMA` script tag at line 111. The
  ordering matches the ticket 0044 pattern of
  appending the new block after the existing
  breadcrumb block.
- Per the 2026-05-30 second-@type lesson, BEFORE
  writing code grep `tests/e2e/*-jsonld.spec.ts` for
  `=== 'LocalBusiness'`, `=== 'Organization'`, AND
  `=== 'BreadcrumbList'` predicates. The
  `LocalBusiness` predicate is expected to return zero
  matches (first emission site-wide). The
  `Organization` predicate matches the homepage
  spec (`tests/e2e/homepage-organization-jsonld.spec.ts`)
  and the website spec
  (`tests/e2e/website-sitelinks-jsonld.spec.ts`); both
  are URL-scoped to `/` per the existing convention,
  so the new `/locations/texas`-scoped `LocalBusiness`
  block does NOT collide with either. The
  `BreadcrumbList` predicate matches many specs, all
  URL-scoped per the ticket 0048 Implementation log.
  Document the grep result in the Implementation log.
- The new schema MUST NOT carry an `address`, `geo`,
  `telephone`, `openingHours`, `priceRange`,
  `aggregateRating`, or `review` field. The AGENTS.md
  defensible-claims rule forbids inventing any of
  these. The grep `grep -n "'address'\|'geo'\|'telephone'\|'openingHours'\|'priceRange'\|'aggregateRating'\|'review'" src/pages/locations/Texas.tsx`
  in the Self-Review must return zero matches.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e
  spec asserts the Helmet-managed
  `meta[name="description"]` content directly (LAST
  `meta[name="description"]` per the 2026-05-25
  Helmet-appends lesson), NOT `page.toHaveTitle()`.
  `/locations/texas` is not in the `index.html` SEO
  Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every string in
  the new `LOCALBUSINESS_SCHEMA` constant (the `name`,
  the `description` (mirrored from `META_DESCRIPTION`),
  the `serviceType` array entries, the `areaServed`
  city names) uses hyphens. Self-Review greps the diff
  for `String.fromCharCode(8212)` before pushing.
- `tests/e2e/texas-localbusiness-jsonld.spec.ts` (new)
  - one assertion per acceptance box. Model end-to-end
  on `tests/e2e/trust-aboutpage-jsonld.spec.ts`
  (ticket 0044, the closest peer for "emit one JSON-LD
  block alongside an existing BreadcrumbList without
  changing UI copy"). The byte-for-byte mirror-source
  assertion (`LOCALBUSINESS_SCHEMA.description ===
  meta[name="description"].content`) is the same shape
  as the ticket 0044 spec's equivalent assertion.
- Per the 2026-05-22 two-PR ship lesson, ship will
  need a follow-up `chore/0051-ship-status` PR after
  the feat PR merges to flip the ticket frontmatter
  AND its `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing the
  second PR so the file and index never drift mid-flip.
- New deps: NO. The page already imports Helmet and
  the existing schema-emission idiom. Schema
  migration: no. Privacy/security surface change: no
  - the new block is static derived from page content;
  no new network call, no new field on visitor data.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0051-...` opened
- YYYY-MM-DD - failing test added in `tests/...`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
