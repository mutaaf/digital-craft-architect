---
id: 0070
title: Generate a public /case-studies/rss.xml feed of shipped case studies so feed readers and SEO crawlers subscribe to the case-study cadence
status: shipped
priority: P2
area: seo
created: 2026-09-08
owner: gtm-innovation
---

## User story

As a peer-watching audience (a competing AI-services
agency benchmarking case-study depth against ours, a
prospect who read our first case study a month ago and
wants to be told when the next one lands, a vertical-
focused analyst mapping who publishes real proof in AI
services), as a feedreader-using SEO crawler (Feedly,
Inoreader, the FreshRSS instances on operators' NAS
boxes), and as a search-engine content-freshness
signal, I want to subscribe to a real RSS feed at
`/case-studies/rss.xml` that lists every shipped case
study with its title, vertical, hero stat, summary, and
a permalink back to the `/case-studies/<slug>` detail
page, so that I do not have to manually re-check the
hub every week to learn that a new events-vertical case
study shipped last Tuesday.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the case-study
data is already canonical. `src/data/caseStudies.ts`
exports a typed `caseStudies: CaseStudyDetail[]`
constant (three entries today: construction, real
estate, events) with `slug`, `vertical`, `title`,
`summary`, `heroStat`, `tags` fields, and the detail
pages already render at `/case-studies/<slug>` via
`src/pages/case-studies/CaseStudy.tsx` (ticket 0054
added Article JSON-LD to each). The `/case-studies`
hub (ticket 0057) shipped a CollectionPage + ItemList
JSON-LD pair over the same array. The existing
changelog-RSS generator
(`scripts/generate-changelog-rss.ts`, ticket 0055,
output `public/changelog/rss.xml`) reads a data
constant (`src/data/changelogEntries.ts`) and emits a
standards-compliant RSS 2.0 feed with `<atom:link
rel="self">`, `<channel>`, `<item>`, `<pubDate>`,
`<link>`, `<guid>`, escaped XML. This ticket
combines the two: write a new sibling script
`scripts/generate-case-studies-rss.ts` that reads
`src/data/caseStudies.ts` (the already-canonical
constant) and writes `public/case-studies/rss.xml`
using the same XML-escape and RSS 2.0 shape as the
changelog generator. No new data shape, no new
parser, no new dependency, no edit to the existing
blog-RSS or changelog-RSS generators. The script is
invoked from the same build glue that already runs
`generate-changelog.ts` and its chained
`generate-changelog-rss.ts` before `vite build` per
the ticket 0055 Implementation log.

### Stakeholder

This widens the moat in a specific and durable way: a
public RSS feed of case-study cadence is a first-class
signal to a peer-watching audience (competing AI-
services agencies, prospect engineering leads,
vertical analysts, SEO crawlers that index feed URLs
differently than HTML pages). Ticket 0057 shipped the
`/case-studies` hub for human visitors, ticket 0054
shipped Article JSON-LD for structured indexing, and
this ticket adds the feedreader surface for the
audience that prefers to subscribe instead of
bookmark. The Out of Scope of ticket 0057 explicitly
named this work: "Adding a JSON Feed or RSS feed at
`/case-studies/rss.xml`. The ticket 0055 changelog
feed is the precedent; a case-study feed is a
follow-up ticket once the hub itself earns subscriber
telemetry." This is pre-authorized follow-up work per
the 2026-05-22 "bootstrap pre-authorized follow-ups"
lesson, not speculative grooming. The feed also
doubles as a sitemap-freshness signal: search engines
treat `application/rss+xml` URLs as ping-able update
streams and recrawl pages referenced from fresh feed
items faster than they recrawl the parent HTML.
Pairing the feed with the existing ItemList JSON-LD
on the hub and the Article JSON-LD on each detail
page means a freshly shipped case study gets THREE
discovery paths within minutes of merge: HTML hub
render, JSON-LD ItemList entry, RSS feed item. Per
the 2026-06-15 negated-character-class lesson, the
implementer greps the new spec's channel-block regex
for `[^/>]*` over an XML attribute list and rewrites
any occurrence to `[^>]*` before committing (the
`atom:link` `type="application/rss+xml"` attribute
value contains a forward slash that would break the
predecessor pattern).

### Visitor (in the real moment of use)

A competing agency's analyst opens their feedreader
Monday morning and sees a new item titled "How a
Regional Events Venue Booked More Discovery Calls by
Answering Every Inquiry" alongside the existing
Digital Craft changelog items and the blog items they
already subscribe to. One tap and their feedreader
opens the detail page at
`/case-studies/events` in a fresh browser tab. The
feed item includes the vertical tag (Events), the
hero stat ("68% more booked calls"), the one-sentence
summary, and a permalink back to
`https://digitalcraftai.com/case-studies/events`.
A prospect who added the feed URL to Feedly six weeks
ago gets the same notification path with zero polling
effort on their end.

### Growth

The "show me" moment is the "Subscribe" chip in a
feedreader UI pointed at
`digitalcraftai.com/case-studies/rss.xml`. That is
the single artifact most likely to convert a "wait
for them to ship something" fence-sitter because it
collapses the "when will they publish another case
study" question from a manual re-check into a
zero-effort push notification. Per the ticket 0055
`/changelog/rss.xml` precedent and the ticket 0032
`/changelog` precedent, a public subscription
surface is the cheapest retention lever the site has
against a passive audience. The hub page
(`/case-studies`) emits a
`<link rel="alternate" type="application/rss+xml"
title="Digital Craft AI Case Studies"
href="https://digitalcraftai.com/case-studies/rss.xml">`
tag via Helmet so feedreader browser-extensions can
auto-detect the feed on the hub URL. The
`/case-studies` hub also gains ONE small visible
"Subscribe (RSS)" text link near the hero routing
directly to `/case-studies/rss.xml`, mirroring the
ticket 0055 subscribe-link pattern on `/changelog`.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new script `scripts/generate-case-studies-rss.ts` (new file, under 220 lines) reads `src/data/caseStudies.ts` and writes `public/case-studies/rss.xml` (the `public/case-studies/` directory is created if absent). The script mirrors the shape of `scripts/generate-changelog-rss.ts` (ticket 0055): it exports a default `generateCaseStudiesRss()` function AND is invocable directly via `if (process.argv[1] && process.argv[1].endsWith("generate-case-studies-rss.ts"))`. Per the 2026-05-28 "encode assertions in the gated script" lesson, the script asserts on its own output BEFORE writing (channel block present, exactly one channel, one item per case study, no unescaped ampersands outside CDATA); any assertion failure throws and blocks the build via the local gate's `npm run build` step so a broken feed never lands.
- [ ] `scripts/generate-case-studies-rss.ts` is invoked from `scripts/generate-sitemap.ts` (which already runs at the start of `npm run build` per the ticket 0022 Implementation log) alongside the existing `generateChangelog()` chain, so a single `npm run build` regenerates the case-studies feed. Alternatively per the ticket 0055 chaining precedent (`generate-changelog.ts` dynamically imports `generate-changelog-rss.ts`), the implementer may add a sibling dynamic import from `scripts/generate-sitemap.ts` after the existing changelog chain. Either wiring keeps the script inside the existing build gate; no new npm-run script is added to `package.json`.
- [ ] The generated `public/case-studies/rss.xml` file is a valid RSS 2.0 document with `<?xml version="1.0" encoding="UTF-8"?>` at position 0, an `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">` root, exactly one `<channel>` block, and one `<item>` per entry in `caseStudies`. The channel block contains `<title>`, `<link>https://digitalcraftai.com/case-studies</link>`, `<description>`, `<language>en-us</language>`, `<lastBuildDate>` (ISO-8601 or RFC-822 per RSS 2.0), and an `<atom:link href="https://digitalcraftai.com/case-studies/rss.xml" rel="self" type="application/rss+xml" />` self-link (attribute order matches ticket 0055; per the 2026-06-15 lesson the spec's regex for this tag uses `[^>]*` NOT `[^/>]*`).
- [ ] Each `<item>` block contains `<title>` (the case study `title`), `<link>` (the permalink `https://digitalcraftai.com/case-studies/<slug>`), `<description>` (the case study `summary` PLUS the hero stat value + label), `<guid isPermaLink="true">` (identical to the link), `<pubDate>` (a valid RFC-822 date; the implementer picks either the ticket-frontmatter `created` date from the source case-study ticket if available OR the current build date - the choice is documented in the Implementation log), and `<category>` (the `vertical` field, e.g. "Construction", "Real Estate", "Events"). Every string value is XML-escaped so `&`, `<`, `>`, `"`, `'` never appear unescaped outside a `<![CDATA[...]]>` block per the ticket 0055 escape pattern.
- [ ] The `/case-studies` hub page (`src/pages/case-studies/CaseStudiesHub.tsx`, ticket 0057) is edited to add ONE `<link rel="alternate" type="application/rss+xml" title="Digital Craft AI Case Studies" href="https://digitalcraftai.com/case-studies/rss.xml" />` inside the existing `<Helmet>` head block, mirroring the ticket 0055 pattern on `/changelog`. The hub also gains ONE small visible "Subscribe (RSS)" text link near the hero routing to `/case-studies/rss.xml` (under 6 added lines; no existing copy is rewritten, no existing card layout is edited).
- [ ] Per the 2026-05-30 second-@type lesson, this ticket adds NO new JSON-LD blocks (the hub already emits CollectionPage + ItemList + BreadcrumbList per ticket 0057, and each detail page already emits Article per ticket 0054). The pre-code grep for JSON-LD predicate collisions is therefore a no-op, but the implementer still records "no new JSON-LD blocks added" in the Implementation log for auditability. The existing `tests/e2e/case-studies-hub.spec.ts` (ticket 0057) MUST stay green after the Helmet `<link rel="alternate">` insertion; the ticket 0057 spec does NOT assert "no additional Helmet children on the hub" per its explicit test surface, so an additive `<link>` is safe.
- [ ] The route `/case-studies/rss.xml` is added to `vercel.json` if needed to guarantee the correct `Content-Type: application/xml` header (mirror the ticket 0055 vercel.json pattern for `/changelog/rss.xml`; the implementer confirms the existing changelog RSS route already establishes the pattern and copies the same rewrite / header rule). The route is NOT added to the `ROUTES` array in `src/data/routes.ts` because ROUTES tracks React SPA routes, not static assets served from `public/`; the smoke spec exercises the feed via `request.get('/case-studies/rss.xml')` (network fetch) not `page.goto()`. Per the 2026-05-25 SEO Pilot lesson, the feed URL is NOT in the `index.html` SEO Pilot pages table (it is not an SPA route).
- [ ] The generated feed contains zero em-dash characters (`U+2014`) in any XML string, in any escaped CDATA, in any `<title>` / `<description>` / `<category>` cell, or in any generator comment. The generator script contains zero em-dashes in its source. If any `caseStudies` entry `title` or `summary` currently contains an em-dash, the fix is applied at the single source (`src/data/caseStudies.ts`) per the 2026-05-25 mirror-source-fix rule, since the same string is also rendered on the detail page and would otherwise create a visible/feed drift.
- [ ] A new e2e spec at `tests/e2e/case-studies-rss-feed.spec.ts` (modeled on `tests/e2e/changelog-rss-feed.spec.ts` from ticket 0055) asserts: (1) `GET /case-studies/rss.xml` returns 200 and the content-type contains "xml", (2) the body starts with `<?xml` and contains exactly one `<channel>` block, (3) the channel block has `<title>`, `<link>https://digitalcraftai.com/case-studies</link>`, `<description>`, `<language>en-us</language>`, and an `<atom:link rel="self">` self-link matched with a `[^>]*` regex per the 2026-06-15 lesson, (4) the number of `<item>` blocks equals the number of entries in `caseStudies` (imported from `src/data/caseStudies.ts`), (5) every `<item>` has a `<title>`, `<link>` matching `^https:\/\/digitalcraftai\.com\/case-studies\/[a-z-]+$`, `<description>`, `<guid isPermaLink="true">`, `<pubDate>`, and `<category>`, (6) every `<link>` inside every `<item>` resolves to a slug present in `caseStudies` (no orphan items, no missing entries), (7) the feed body contains no `String.fromCharCode(8212)` code point, (8) `GET /case-studies` (the hub HTML) contains a `<link rel="alternate" type="application/rss+xml" href="https://digitalcraftai.com/case-studies/rss.xml">` in the head (asserted via the Helmet-emitted head element per the 2026-05-25 Helmet-appends lesson), (9) the hub also renders a visible "Subscribe (RSS)" anchor routing to `/case-studies/rss.xml`, (10) sibling-hub-regression case navigates to `/case-studies` and re-runs the key ticket 0057 assertions (H1 substring, `data-testid="case-study-hub-card"` count equals `caseStudies.length`, CollectionPage + ItemList JSON-LD present with `numberOfItems === caseStudies.length`) to prove the additive Helmet edit did not break the hub.
- [ ] Standard box: no em-dash in any script source, feed output, hub edit, or JSON-LD (there is none new); dark-mode variants required on every new visible element (the small "Subscribe (RSS)" anchor is the only new visible element); no `/api/` change; no `package.json` / `package-lock.json` edit (the script is invoked from the existing sitemap generator that `npm run build` already runs; no new npm-run entry is added); no new hostname (the feed self-references `digitalcraftai.com` only). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the existing `tests/e2e/case-studies-hub.spec.ts` (ticket 0057), `tests/e2e/case-study-article-jsonld.spec.ts` (ticket 0054), and `tests/e2e/changelog-rss-feed.spec.ts` (ticket 0055) all stay green.

## Out of scope

- Standard anti-goals: no /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A JSON Feed (`/case-studies/feed.json`) or Atom feed
  (`/case-studies/atom.xml`) sibling. RSS 2.0 is the
  format the ticket 0055 changelog feed shipped, and
  the existing blog RSS uses the same shape; adding a
  second format is its own ticket once subscriber
  telemetry justifies it.
- A per-vertical case-study feed (e.g.
  `/case-studies/vertical/construction/rss.xml`).
  Three case studies is too few to justify per-
  vertical fan-out; revisit when the case-study list
  exceeds eight entries per the ticket 0057 filter
  precedent.
- Enclosures (embedded images or media) inside each
  `<item>`. The detail-page permalink is sufficient
  for the reader to view the case-study visuals; RSS
  enclosures would require hosting images at stable
  URLs and are its own ticket.
- A push-notification / webhook / IFTTT bridge on
  feed updates. The RSS feed itself is the
  subscription channel; downstream bridges belong to
  the consumer.
- A cross-link from the site navbar or the footer to
  the feed URL. Per the ticket 0023 footer-chip
  precedent, cross-surface promotion ships on its own
  ticket only after telemetry shows subscriber
  demand. The ONLY cross-link in this ticket is the
  small "Subscribe (RSS)" anchor on the hub.
- Author-per-case-study `<author>` fields. Case
  studies are institution-attributed to Digital
  Craft, not individual-authored; adding an author
  would require the AGENTS.md defensible-claims rule
  to apply per author and is out of scope here.
- Adding the feed URL to the `sitemap.xml` root as a
  `<url>` entry. Search engines discover feeds via
  the `<link rel="alternate">` in the parent HTML;
  duplicating the feed URL in sitemap.xml would create
  drift with the changelog-feed pattern.
- A `<link rel="alternate">` on any page other than
  `/case-studies`. The feed is scoped to the case-
  study family; adding it to the hompage or `/demos`
  would misrepresent the feed's scope.
- Editing the ticket 0054 Article JSON-LD on the
  detail pages. The Article block per detail page is
  already the correct schema; the RSS item is a
  distribution format, not a structured-data
  duplication.
- Adding the feed to the `index.html` SEO Pilot
  pages table. Static assets from `public/` are not
  SPA routes and the SEO Pilot table only covers
  Helmet-driven HTML routes per the 2026-05-25 SEO
  Pilot lesson.
- Internationalization (`<language>` values other
  than `en-us`). The case-study detail pages are
  English-only matching every existing artifact.
- A `Podcast` or `PodcastEpisode` schema.org type
  on the hub. The case-study format is written
  narrative, not audio; misclassifying would trigger
  a Google structured-data warning.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `scripts/generate-case-studies-rss.ts` (under
  220 lines). Mirror the shape of
  `scripts/generate-changelog-rss.ts` (ticket 0055):
  export a default `generateCaseStudiesRss()` function
  reading `caseStudies` from
  `../src/data/caseStudies.ts` (relative import from
  `scripts/`); XML-escape every string via the same
  escape helper the ticket 0055 script uses (copy-
  paste the small helper inline rather than extract
  it to a shared file, since two callers is not yet
  worth a scripts/utils/ extraction); write the
  output to `public/case-studies/rss.xml`; mkdir the
  parent directory if absent (`fs.mkdirSync(dir,
  { recursive: true })`); assert on the output BEFORE
  writing per the 2026-05-28 inline-assertions lesson
  (channel-block present, exactly one channel, item-
  count equals `caseStudies.length`, no `&`
  characters outside CDATA or already-escaped
  `&amp;`); throw on any assertion failure so a
  broken feed never lands. The direct-CLI-invocation
  guard matches ticket 0055:
  `if (process.argv[1] && process.argv[1].endsWith("generate-case-studies-rss.ts")) { ... }`.
- Wire the new script into the build gate per the
  ticket 0055 chain: `scripts/generate-sitemap.ts`
  already runs at the start of `npm run build` and
  already chains `generate-changelog.ts` (which
  chains `generate-changelog-rss.ts`); add a similar
  dynamic import `await import("./generate-case-studies-rss")`
  from the appropriate glue point (either directly
  from `generate-sitemap.ts` after the changelog
  chain, OR from a new leaf inside
  `generate-changelog.ts` if that pattern is more
  consistent; the implementer picks and documents
  the choice in the Implementation log). Either way,
  no new npm-run script is added to `package.json`.
- `src/pages/case-studies/CaseStudiesHub.tsx`
  (ticket 0057) - TWO additive edits: (1) add
  `<link rel="alternate" type="application/rss+xml" title="Digital Craft AI Case Studies" href="https://digitalcraftai.com/case-studies/rss.xml" />`
  inside the existing `<Helmet>` head block
  (mirroring the ticket 0055 pattern), and (2) add
  ONE small visible "Subscribe (RSS)" text anchor
  near the hero routing to `/case-studies/rss.xml`
  with `data-testid="case-studies-rss-link"` for the
  spec (under 6 added lines; no existing copy is
  rewritten, no existing card layout is edited).
- `vercel.json` - if the ticket 0055 pattern
  established a Content-Type header rule for
  `/changelog/rss.xml`, copy the same rule for
  `/case-studies/rss.xml` so browsers and feedreaders
  see `application/xml` (or `application/rss+xml`).
  The implementer confirms the current vercel.json
  pattern before deciding whether the copy is needed
  (if `/changelog/rss.xml` works today with the
  default Vercel MIME for `.xml`, no edit is
  needed; if there is an explicit rule, mirror it).
- Do NOT edit `src/data/routes.ts`. `/case-studies/rss.xml`
  is a static file served from `public/`, not a React
  SPA route; the ROUTES array tracks SPA routes only.
- Per the 2026-06-15 negated-character-class lesson,
  the new spec's `<atom:link rel="self">` regex uses
  `[^>]*` NOT `[^/>]*` because the attribute value
  `type="application/rss+xml"` contains a forward
  slash that would break the negated-slash pattern.
  Copy the working regex directly from
  `tests/e2e/changelog-rss-feed.spec.ts` if the
  ticket 0055 spec was patched per the same lesson.
- Per the 2026-05-30 second-@type lesson, this
  ticket adds NO new JSON-LD blocks (the hub's
  CollectionPage + ItemList + BreadcrumbList from
  ticket 0057 and each detail page's Article from
  ticket 0054 remain unchanged). The pre-code grep
  is a no-op but the implementer records "no new
  JSON-LD blocks; only an additive `<link rel="alternate">`
  in Helmet on the hub" in the Implementation log
  for auditability.
- Per the 2026-05-07 em-dash Hard NO, every string
  in the script (channel title, channel
  description, item template, hero anchor label,
  Helmet link title) uses hyphens. Every string in
  the hub edit uses hyphens. Self-Review greps the
  diff for `String.fromCharCode(8212)` before
  pushing. If any existing `caseStudies` entry
  `title` or `summary` contains an em-dash, fix it
  at the single source (`src/data/caseStudies.ts`)
  per the 2026-05-25 mirror-source-fix rule
  because the same string is rendered on the
  detail page too.
- `tests/e2e/case-studies-rss-feed.spec.ts` (new)
  - one test per acceptance box. Model the spec on
  `tests/e2e/changelog-rss-feed.spec.ts` (ticket
  0055, the direct peer). The feed fetch uses
  `request.get('/case-studies/rss.xml')`
  (Playwright's request context handles the fetch
  without a browser). The sibling-hub-regression
  case re-runs the ticket 0057 hub key
  assertions to prove the additive Helmet
  `<link rel="alternate">` did not break the hub.
- Per the 2026-05-22 two-PR ship lesson, ship will
  need a follow-up `chore/0070-ship-status` PR
  after the feat PR merges to flip the ticket
  frontmatter AND its `docs/backlog/README.md`
  index row to `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing
  the second PR so the file and index never drift
  mid-flip.
- New deps: NO. The script reuses `fs`, `path`,
  and a small inline XML-escape helper mirroring
  ticket 0055. The hub edit reuses
  `react-helmet-async` and the existing anchor
  component. Schema migration: no. Privacy /
  security surface change: no - the feed contains
  the same case-study data already public on the
  detail pages and the hub.

## Implementation log

### 2026-09-08 - Wired case-studies RSS into the existing build chain

- New `scripts/generate-case-studies-rss.ts` mirrors
  `scripts/generate-changelog-rss.ts` (ticket 0055): default-
  exported `generateCaseStudiesRss()`, direct-CLI guard on the
  `generate-case-studies-rss.ts` argv suffix, shared
  `escapeXml` helper from `scripts/lib/escapeXml.ts`, pre-write
  inline assertions per the 2026-05-28 lesson (channel-block
  count, item-count equals `caseStudies.length`, required
  child tags per item, no U+2014, no unescaped ampersands).
  Chained via a dynamic `await import("./generate-case-studies-rss")`
  from `scripts/generate-changelog.ts` right after the existing
  changelog-RSS chain, so the same `npm run build` covers both
  feeds without adding a new npm-run script (GTM Hard NO).
- pubDate strategy: the case-study data has no per-entry created
  date, so every `<pubDate>` and the channel `<lastBuildDate>`
  anchor on today's build date at noon UTC. Documented here
  per the acceptance-criteria clause that asks the choice be
  recorded.
- JSON-LD grep per 2026-05-30 second-@type lesson: no new
  JSON-LD blocks added. The only Helmet surface change on the
  hub is an additive `<link rel="alternate" type="application/rss+xml">`
  auto-discovery tag; ticket 0057's `case-studies-hub.spec.ts`
  does not assert "no additional Helmet children," so this is
  safe. The sibling-hub regression case in the new spec re-runs
  the ticket 0057 H1, card-count, CollectionPage, and ItemList
  numberOfItems assertions to prove no drift.
- No `caseStudies` entry `title` or `summary` contained a
  U+2014 em-dash, so the 2026-05-25 mirror-source-fix rule did
  not require a source edit.
- No `vercel.json` change: `/changelog/rss.xml` (ticket 0055)
  ships today with the Vercel default MIME for `.xml` and no
  explicit header rule; the same default covers the new
  `/case-studies/rss.xml` path.
- No `src/data/routes.ts` change: `/case-studies/rss.xml` is a
  static asset served from `public/`, not a React SPA route
  (the smoke spec fetches it via `request.get(...)`, not
  `page.goto(...)`). Per the 2026-05-25 SEO Pilot lesson the
  feed URL is NOT added to the `index.html` SEO Pilot pages
  table for the same reason.
