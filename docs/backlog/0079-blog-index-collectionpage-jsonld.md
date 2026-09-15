---
id: 0079
title: Emit CollectionPage plus ItemList plus BreadcrumbList JSON-LD on the /blog index so the blog indexes as a canonical article collection
status: in-progress
priority: P1
area: seo
created: 2026-09-15
owner: gtm-innovation
---

## User story

As an SEO crawler indexing Digital Craft's content library
(Googlebot rendering `/blog` on a weekly recrawl cycle,
Bingbot following the sitemap entry, an LLM training
crawler pulling structured article lists to seed a
retrieval index), a buyer-side researcher Googling
"digital craft blog," "AI automation blog construction,"
or "AI for real estate blog posts" on a laptop between
meetings, and a competing agency's marketing lead
comparing content depth as a benchmark, I want the
`/blog` index page to emit three JSON-LD blocks
(`CollectionPage` describing the blog surface, `ItemList`
enumerating every shipped `BlogPosting` with its slug,
title, date, and URL, and `BreadcrumbList` positioning
`/blog` under the homepage), so that the blog indexes as
one canonical article-collection artifact the SERP can
rank for the head term "digital craft blog" and every
individual post inherits the collection-membership signal
Google needs to weight the index over any single leaf
post.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: every leaf blog
post already ships full `BlogPosting` plus
`BreadcrumbList` JSON-LD from
`src/pages/BlogPost.tsx` (a hand-rolled emission that
mirrors ticket 0054's Article JSON-LD pattern for case
studies). The `/blog` INDEX page (`src/pages/Blog.tsx`)
currently emits zero structured data - only a `<title>`,
a `<meta name="description">`, and OpenGraph tags. That
is the same pre-shipping state `/case-studies` was in
before ticket 0057 added the CollectionPage plus
ItemList plus BreadcrumbList triple, and the same
pre-shipping state `/compare` was in before ticket 0048.
This ticket completes the third leg of the three-hub SEO
symmetry (`/compare` shipped 0048, `/case-studies`
shipped 0057, `/blog` is the third) by reading the
already-typed `blogPosts: BlogPost[]` constant from
`src/data/blogPosts.ts` (77 posts as of 2026-09-15) and
mapping each entry into an `ItemList` item. Zero new
data, zero new backend, zero new dependency, zero new
route, zero visible change to the page render. One JSON-LD
block trio added inside the existing `<Helmet>` block and
one new e2e spec. The blog post detail-page JSON-LD stays
byte-identical (BlogPost detail is out of scope, exactly
mirroring how 0057 left the ticket 0054 Article JSON-LD
untouched).

### Stakeholder

This widens the SEO moat in the mid-funnel article
discovery dimension along an axis the leaf-page JSON-LD
does not fully cover. Today Google treats every blog post
as a standalone `BlogPosting` document with no collection
parent; there is no schema-level "these 77 articles
belong to one collection" signal, so the head term
"digital craft blog" ranks the homepage over the blog
index (measured: the SERP snippet for that head term
today surfaces the homepage description, not the blog
description). Per the ticket 0057 stakeholder lens
verbatim and the ticket 0048 precedent, adding a
`CollectionPage` plus `ItemList` pair to a leaf-page-
family hub is the single cheapest SERP surface upgrade a
static site can ship because it lifts both the head-term
rank for the hub URL AND every leaf page's perceived
authority via internal-link and collection-membership
distribution. Per the 2026-05-30 second-@type lesson the
implementer pre-greps every `tests/e2e/*-jsonld.spec.ts`
for `=== 'CollectionPage'` and `=== 'ItemList'` and
`=== 'BreadcrumbList'` predicates and confirms every
predecessor "exactly one" assertion is URL-scoped to a
route other than `/blog` before writing code, so the
three sibling instances on `/blog` cannot collide with
`/compare`, `/case-studies`, or any per-detail-page
BreadcrumbList assertion. The block trio also completes
a symmetry with the RSS feed at `/rss.xml` that the
existing `Blog.tsx` already links to in its footer chip
(so a crawler discovering the JSON-LD ItemList and the
RSS feed at the same URL sees two mutually reinforcing
signals about the same collection).

### User (in the real moment of use)

A buyer-side researcher on a laptop Googles "AI for
construction blog" during a weekday research block. The
SERP listing now surfaces `/blog` as its own indexed
result (previously the SERP surfaced individual leaf
posts or the homepage) with a meta description naming
what the blog covers and a rich-result treatment where
Google feels confident enough to show a top-three list
of recent post titles from the ItemList. The researcher
taps the head result, `/blog` renders with the existing
card grid intact (zero visible change to the page beyond
the invisible JSON-LD), scans three cards in ten seconds,
and taps into the one that matches their vertical. No
mobile change - the JSON-LD ships inside `<Helmet>` and
is invisible to visitors. The RSS chip at the bottom of
the page stays where it is; the researcher can copy the
URL and paste it into their team's shared feed reader
knowing the same collection is described in two formats.

### Growth

The "show me" moment is the SERP snippet upgrade a
marketing lead notices two to four weeks after ship: the
`/blog` head-term query now returns `/blog` as the top
result with the collection description (previously the
homepage description) and a possible rich-result
treatment showing three recent post titles. That is the
single cheapest programmatic-audience acquisition signal
the site can produce for the content-library moat
because the audience it reaches (researchers Googling
"digital craft blog" or "AI for X blog" head terms) is
the audience that most influences B2B buyer trust
signals. The generator ships invisible; the growth value
is entirely in the surface the JSON-LD triple opens to
crawlers and to any downstream tool that consumes
`application/ld+json` on discovery (LLM training
crawlers, feed-reader search integrations, Slack link
previews, LinkedIn share cards).

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] `src/pages/Blog.tsx` gains exactly three new `<script type="application/ld+json">` blocks inside its existing `<Helmet>` block, in this order: (1) `CollectionPage` describing `/blog`, (2) `BreadcrumbList` positioning `/blog` under the homepage, (3) `ItemList` enumerating every entry in `blogPosts` from `src/data/blogPosts.ts`. The blocks read from a `META_DESCRIPTION` string constant declared once at module top (per the 2026-05-25 mirror-source rule) that the existing `<meta name="description">` and the new `CollectionPage.description` both reference verbatim. No other edit to `Blog.tsx` (the existing card-grid render tree, the existing RSS subscribe chip, the existing Navbar and Footer, the existing animation classes stay byte-identical). No edit to `src/pages/BlogPost.tsx` (the per-post BlogPosting plus BreadcrumbList schema stays byte-identical).
- [ ] The `CollectionPage` block emits `{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Digital Craft AI Blog', url: 'https://digitalcraftai.com/blog', description: <META_DESCRIPTION>, inLanguage: 'en-US', isPartOf: { '@type': 'WebSite', url: 'https://digitalcraftai.com' }, mainEntity: { '@id': 'https://digitalcraftai.com/blog#posts' } }`. The `mainEntity` `@id` points at the ItemList block below via that block's own matching `@id`, so a JSON-LD graph walker resolves the reference in one hop.
- [ ] The `ItemList` block emits `{ '@context': 'https://schema.org', '@type': 'ItemList', '@id': 'https://digitalcraftai.com/blog#posts', name: 'Digital Craft AI Blog Posts', itemListOrder: 'https://schema.org/ItemListOrderDescending', numberOfItems: <blogPosts.length>, itemListElement: BlogListItem[] }`. Each `BlogListItem`: `{ '@type': 'ListItem', position: <1-indexed rank>, url: 'https://digitalcraftai.com/blog/<slug>', name: <post.title verbatim>, item: { '@type': 'BlogPosting', '@id': 'https://digitalcraftai.com/blog/<slug>', headline: <post.title>, url: 'https://digitalcraftai.com/blog/<slug>', datePublished: <post.date>, author: { '@type': 'Organization', name: <post.author>, url: 'https://digitalcraftai.com' } } }`. Items are ordered exactly as `blogPosts` is ordered in `src/data/blogPosts.ts` (the file's own comment declares "Posts display in array order (first = newest at top)"), so position 1 is the newest post and `itemListOrder` correctly reads Descending.
- [ ] The `BreadcrumbList` block emits `{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' }, { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://digitalcraftai.com/blog' }] }`. Only two levels (Home, Blog) because `/blog` is a top-level route; the per-post `BreadcrumbList` from `src/pages/BlogPost.tsx` already handles the three-level (Home / Blog / Post Title) case on leaf pages and stays byte-identical.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'`, `=== 'ItemList'`, and `=== 'BreadcrumbList'` predicates AND every `toHaveLength(1)` / "exactly one" assertion over any of those three `@type`s, and documents the grep result in the Implementation log. Every predecessor "exactly one CollectionPage on /compare" (ticket 0048), "exactly one CollectionPage on /case-studies" (ticket 0057), and per-page BreadcrumbList (tickets 0019, 0044, 0063) assertion must be URL-scoped (its poll must use a `gotoX(page, '/compare')` / `'/case-studies'` / `'/demo/*'` / `'/trust'` / `'/glossary'` helper, not a bare `page.goto('/')`), so the sibling blocks on `/blog` cannot collide. If any predecessor assertion is NOT URL-scoped, the implementer widens it in the SAME PR per the 2026-05-30 mirror-source-fix rule.
- [ ] Per the 2026-05-07 em-dash Hard NO, every string emitted into the three JSON-LD blocks AND every string in the new e2e spec's assertions contains zero em-dash characters (U+2014). If any shipped blog post's `title` string in `src/data/blogPosts.ts` contains an em-dash, the fix is applied at the single source (the post entry) so the visible card, the leaf-page `<Helmet>`, the per-post BlogPosting JSON-LD, and the new index-page ItemList item all stay identical. Self-Review greps the emitted DOM for `String.fromCharCode(8212)` before pushing.
- [ ] A new e2e spec at `tests/e2e/blog-collectionpage-jsonld.spec.ts` (modeled on `tests/e2e/case-studies-hub.spec.ts` from ticket 0057) asserts, using a `gotoBlogIndex(page)` helper that navigates to `/blog` and waits for the RouteFallback to detach per the 2026-09-05 lesson (either wait for the `article` cards to appear via `page.locator('article').first().waitFor({ state: 'visible' })` or wait for `page.locator('[role="status"][aria-label="Loading"]').waitFor({ state: 'hidden' }).catch(() => {})`): (1) `GET /blog` renders exactly one `script[type="application/ld+json"]` block with `@type === 'CollectionPage'` and that block's `url` is `'https://digitalcraftai.com/blog'`, (2) exactly one `ItemList` block on `/blog` with `numberOfItems === blogPosts.length` imported from the mirror-source path (via `src/data/blogPosts`), (3) the ItemList's `itemListElement` array length equals `blogPosts.length`, (4) every `itemListElement[i].position` is `i + 1` (1-indexed), (5) every `itemListElement[i].url` matches `/^https:\/\/digitalcraftai\.com\/blog\/[a-z0-9-]+$/`, (6) every `itemListElement[i].name` equals `blogPosts[i].title` byte-for-byte, (7) every `itemListElement[i].item.datePublished` parses as a valid ISO date via `!isNaN(Date.parse(...))`, (8) exactly one `BreadcrumbList` block on `/blog` with exactly two `itemListElement` entries whose names are `'Home'` and `'Blog'`, (9) the `CollectionPage.description` equals the value of the page's `<meta name="description">` byte-for-byte (mirror-source assertion), (10) the raw HTML of the page contains zero `String.fromCharCode(8212)` code points, (11) `GET /blog/<slug of newest post>` still renders exactly one `BlogPosting` block whose `headline` equals `blogPosts[0].title` (regression check confirming the leaf-page schema stayed byte-identical), (12) `GET /` renders no `CollectionPage` block with `url === 'https://digitalcraftai.com/blog'` (regression check confirming the block did not leak site-wide via `index.html`).
- [ ] Standard box: no `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/pages/BlogPost.tsx` (leaf-page schema stays byte-identical), no edits to `src/data/blogPosts.ts` UNLESS a shipped post title carries a U+2014 (the mirror-source fix), no edits to `index.html`, no edits to `vercel.json`, dark mode inherited (no new visible UI, only JSON-LD). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the existing `tests/e2e/case-studies-hub.spec.ts` (ticket 0057), `tests/e2e/compare-hub.spec.ts` (ticket 0048), `tests/e2e/blog-post-*.spec.ts` if present, and any predecessor JSON-LD spec named in the pre-code grep all stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- No `/api/` changes, no `package.json` changes,
  no em-dashes in copy, dark-mode inherited
  (this ticket ships only JSON-LD blocks
  invisible to visitors plus one mirror-source
  meta-description constant, so dark-mode is
  inherited by construction).
- Editing the per-post `BlogPosting` schema in
  `src/pages/BlogPost.tsx`. The leaf-page
  emission from that file stays byte-identical;
  this ticket only adds the index-page emission.
- Adding a visible "N posts" count element to
  the `/blog` header. The `numberOfItems`
  field in the ItemList JSON-LD carries the
  count for crawlers; a visible count is a
  separate copy decision out of scope here.
- Adding a search or filter UI on `/blog`.
  Search over the blog is a distinct
  feature-shape ticket.
- Adding pagination JSON-LD (`nextPage` /
  `previousPage` on the CollectionPage). The
  full blog is small enough (77 posts as of
  2026-09-15) to serve as one page; pagination
  is premature optimization until a viewport
  scroll-length threshold is exceeded.
- Emitting `Blog` (the `Blog` schema.org
  type) as a top-level block INSTEAD of
  `CollectionPage`. `Blog` is a valid
  schema.org type but Google's Search Central
  documentation recommends `CollectionPage`
  for hub-index pages and reserves `Blog` for
  the underlying blog concept - both would be
  emitted only if the blog were a site of its
  own, which is out of scope.
- Emitting `authors` at the CollectionPage or
  ItemList level (per-item `author` is
  already emitted inside each `item.item`
  object). A hub-level author list would
  require a collated de-duplicated set,
  which is a data-shape change out of scope.
- Adding an OpenGraph or Twitter card image
  specific to `/blog`. OG-card imagery for
  hub pages is a distinct social-share
  ticket.
- Editing the RSS feed at `/rss.xml` or its
  linked chip in `Blog.tsx`. The RSS feed
  and its subscribe chip stay byte-identical.
- Cross-linking the new ItemList block from
  `/subprocessors`, `/uptime`, or `/ethics`.
  Cross-surface promotion is its own follow-up
  ticket.
- Adding a `keywords` field at the
  CollectionPage level derived from the union
  of every post's tags. The per-item tags are
  still emitted inside each `BlogPosting`
  through the leaf-page schema; a rolled-up
  keyword list is a data-decision out of
  scope.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- `src/pages/Blog.tsx` - add exactly three
  `<script type="application/ld+json">` blocks
  inside the existing `<Helmet>` block, placed
  AFTER the existing `<link rel="canonical">`
  tag. The pattern to mirror is
  `src/pages/case-studies/CaseStudiesHub.tsx`
  (ticket 0057), which emits the same three-
  block triple on `/case-studies` with a
  module-top `META_DESCRIPTION` constant, a
  `SITE_URL` constant, and hand-rolled schema
  objects wrapped in `JSON.stringify`. Copy
  the file structure verbatim; substitute
  `blogPosts` for `caseStudies` and adjust
  the CollectionPage `name` and `url` fields.
- Declare a `META_DESCRIPTION` string constant
  at module top matching the value currently
  inlined in the `<meta name="description">`
  tag (the existing string:
  `'Insights on AI automation for construction, real estate, and event planning businesses. Learn how AI is transforming traditional industries.'`).
  The Helmet tag AND the CollectionPage JSON-LD
  read from that one constant, so a future copy
  edit propagates to both.
- Reuse the existing `import { blogPosts } from '@/data/blogPosts'`
  line (already present in `Blog.tsx`). Do
  NOT import the type definition twice; the
  runtime constant is enough.
- Per the 2026-05-30 second-@type lesson,
  BEFORE writing code grep every
  `tests/e2e/*-jsonld.spec.ts` for
  `CollectionPage`, `ItemList`, and
  `BreadcrumbList` predicates. Documented
  candidates as of 2026-09-15:
  `tests/e2e/case-studies-hub.spec.ts` (0057),
  `tests/e2e/compare-hub.spec.ts` (0048),
  `tests/e2e/changelog-itemlist-jsonld.spec.ts`
  (0043), `tests/e2e/demo-breadcrumbs.spec.ts`
  (0019), `tests/e2e/trust-page.spec.ts`
  (0044), `tests/e2e/glossary-breadcrumb-jsonld.spec.ts`
  (0063). The implementer confirms each
  predecessor assertion is URL-scoped (poll
  navigates to its own hub path) so the
  three new blocks on `/blog` cannot
  collide. Document the grep result in the
  Implementation log.
- Per the 2026-05-25 mirror-source rule, the
  `CollectionPage.description` and the
  `<meta name="description">` on `/blog`
  read from the SAME `META_DESCRIPTION`
  constant. The new spec asserts they match
  byte-for-byte via a `.toBe(...)` check
  against the value read via
  `page.locator('meta[name="description"]').getAttribute('content')`.
- Per the 2026-05-07 em-dash Hard NO, every
  string emitted into the three JSON-LD
  blocks AND the `META_DESCRIPTION` constant
  AND the new spec's assertions is
  hyphen-only. Self-Review greps the
  emitted DOM for `String.fromCharCode(8212)`
  before pushing. If any shipped post's
  title carries U+2014, fix at the single
  source (the `blogPosts` entry) and rebuild.
- Per the 2026-09-05 route-fallback lesson,
  the new spec's `gotoBlogIndex(page)`
  helper waits for the RouteFallback to
  detach via
  `page.locator('[role="status"][aria-label="Loading"]').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {})`
  after the innerHTML-length poll, then
  waits for the first `article` card to be
  visible per the 2026-09-10 mount-signal
  lesson. Auto-retrying assertions
  (`await expect(locator).toHaveCount(N)`)
  are used over one-shot `.$$eval(...)` for
  any count that depends on the lazy
  chunk mounting.
- Per the 2026-05-22 two-PR ship lesson,
  ship will need a follow-up
  `chore/0079-ship-status` PR after the
  feat PR merges to flip the ticket
  frontmatter AND its
  `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and
  index never drift mid-flip.
- New deps: NO. The page edits reuse
  `react-helmet-async` (already imported),
  the existing `blogPosts` typed constant,
  and Tailwind utility classes. Schema
  migration: no. Privacy / security surface
  change: NO - the JSON-LD contains only
  data already public on the `/blog`
  page and its leaf blog posts.

## Implementation log

### 2026-09-15 - kickoff (feat/0079-blog-collectionpage-jsonld)

Pre-code JSON-LD collision grep across `tests/e2e/*.spec.ts` for
`=== 'CollectionPage'`, `=== 'ItemList'`, `=== 'BreadcrumbList'` predicates
and every `toHaveLength(1)` / "exactly one" assertion over those three
@types (per the 2026-05-30 second-@type lesson). Every predecessor
"exactly one" predicate is URL-scoped to a route this PR does NOT touch:

- `CollectionPage`: `compare-hub.spec.ts:195` (URL `/compare` via
  `gotoCompareHub`), `case-studies-hub.spec.ts:334` (URL `/case-studies`
  via `gotoCaseStudiesHub`), `subprocessors.spec.ts:183,383` (URL
  `/subprocessors`), `ai-for-hospitality.spec.ts:277,459` (URL
  `/ai-for-hospitality`), plus `case-studies-rss-feed.spec.ts:289`
  (reads the hub during the RSS feed spec, still `/case-studies`).
- `ItemList`: predecessors in `compare-hub.spec.ts`, `case-studies-hub.spec.ts`,
  `demos-index-hub.spec.ts`, `demos-softwareapplication-jsonld.spec.ts`,
  `changelog-itemlist-jsonld.spec.ts`, `ai-for-hospitality.spec.ts`,
  `case-studies-rss-feed.spec.ts` - each URL-scoped to a route this PR
  does NOT touch.
- `BreadcrumbList`: predecessors across `/compare/*`, `/ai-for-*`,
  `/quiz`, `/roi`, `/trust`, `/my`, `/case-studies/:slug`,
  `/glossary`, `/ethics`, `/playbook`, `/vendor-scorecard`,
  `/changelog`, `/subprocessors` - all URL-scoped to their own route.

Zero predecessor predicates need widening. No spec asserts anything
about `/blog` today, and no spec touches `/` while checking that
CollectionPage / ItemList / BreadcrumbList with a `/blog` URL is
absent (regression box 12 in this ticket will be the first).

Blog index route is `lazy(() => import("./pages/Blog"))` in `src/App.tsx:110`,
so per the 2026-09-05 route-fallback and 2026-09-10 mount-signal lessons
the new `gotoBlogIndex` helper polls innerHTML length, waits for the
RouteFallback to detach, then waits for the first `article` card to be
visible before reading JSON-LD.

Verified no shipped blog post `title` in `src/data/blogPosts.ts` carries
a U+2014 em-dash (grepped with Python; zero matches), so no mirror-source
fix is required at the single source.
