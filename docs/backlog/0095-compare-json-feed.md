---
id: 0095
title: Generate a public /compare.json machine-readable JSON Feed of every comparison page as a defensible moat artifact
status: shipped
priority: P2
area: seo
created: 2026-09-24
owner: gtm-innovation
---

## User story

As a competitive-intelligence
analyst, procurement lead, or
buyer-side AI-vendor evaluator
(a construction franchise VP
whose analyst runs a nightly
JSON pull of every AI-vendor
comparison the vendor publishes,
a real-estate brokerage
technology council member who
subscribes to vendor JSON Feeds
via a competitive-intelligence
platform like Klue or Crayon,
an industry analyst who
maintains a comparison-matrix
spreadsheet and would rather
consume a machine-readable
export than screen-scrape 15
HTML compare pages), I want a
public machine-readable feed
at `/compare.json` in
JSON Feed 1.1 format that lists
every shipped comparison page
with its title, description,
route URL, last-updated date,
and a short summary verdict,
so that I can subscribe to
Digital Craft's competitive
positioning programmatically
and get diffs when a new
comparison ships, without
scraping HTML.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of
value: the comparison surface
is one of Digital Craft's
sharpest SEO / competitive
moats (15 shipped comparison
pages under `/compare/*`,
indexed as a
CollectionPage plus
ItemList hub at `/compare`
per ticket 0048), but the
canonical surface is HTML
only. The machine-readable
subscription pattern is
proven twice in the ship
history: ticket 0055
generates a public
`/changelog/rss.xml` feed of
shipped tickets, ticket 0070
generates
`/case-studies/rss.xml` for
case studies, ticket 0078
generates
`/changelog.json` as a
JSON Feed 1.1 equivalent of
0055. There is no
machine-readable feed of
the comparison hub, even
though the audience most
likely to consume a
comparison feed
(competitive-intelligence
platforms, analyst
spreadsheet imports,
procurement-team vendor
inventories) is exactly the
audience most likely to
subscribe to JSON Feeds
rather than screen-scrape.
Adding the feed is exactly
one new script emission
(pattern: extend
`scripts/generate-sitemap.ts`
per ticket 0022, OR a new
`scripts/generate-compare-json.ts`
mirroring the ticket 0078
`scripts/generate-changelog-json.ts`),
one new entry in
`public/robots.txt` if
one exists (grep first),
one new entry in
`public/sitemap.xml`
for
`/compare.json`, and one
new e2e spec. Zero new
data - the feed reads
`src/data/compareEntries.ts`
(the shipped ticket 0048
canonical source of
comparison metadata),
NOT the individual
`src/pages/compare/*.tsx`
render trees, so the
feed cannot drift from
the hub's ordering per
the 2026-05-25 mirror-
source rule. Zero new
dependency; the feed
is emitted at build
time by the same
generator script pattern
tickets 0022, 0055,
0070, 0078 already ship.

### Stakeholder

This widens the moat in the
buyer-side-cite-ability
dimension that the ticket
0055, 0070, 0078
machine-readable feeds
opened. Every one of those
feeds is a canonical
subscribable artifact:
`/changelog/rss.xml` and
`/changelog.json` say "here
is our weekly ship
velocity, subscribe";
`/case-studies/rss.xml`
says "here is our case-
study cadence, subscribe";
`/compare.json` will say
"here is our full
comparative positioning
against every competitor
we cover, subscribe." The
competitive-intelligence
audience is asymmetric:
most AI-services vendors
do NOT publish a machine-
readable comparison feed,
so a competitive-
intelligence platform
scraping every AI-vendor's
site gets a structured
export from Digital Craft
and only raw HTML from
every competitor, which
biases the platform's
downstream analyst summary
in Digital Craft's favor
by construction (the
platform's index gets
higher confidence and
freshness signals from
the vendor with the
feed). Per the ticket
0078 JSON Feed 1.1
precedent, the feed
emits the standard fields
(`version`, `title`,
`home_page_url`,
`feed_url`, `items[]`
with `id`, `url`, `title`,
`content_text`,
`date_published`,
`date_modified`) so
any JSON Feed reader
consumes it without a
custom adapter. Per the
ticket 0048 hub source-
of-truth pattern, the
feed reads
`src/data/compareEntries.ts`
so a new comparison
ships in one place and
lands in the HTML hub,
the sitemap, the RSS
(if a future ticket
adds one), and this
JSON Feed simultaneously
with no drift. Per the
2026-05-30 second-@type
lesson, the feed is
NOT wrapped in JSON-LD
on any page (it is
served as its own JSON
document at
`/compare.json`), so
it cannot collide with
the shipped ticket 0048
CollectionPage plus
ItemList JSON-LD on
`/compare`.

### User (in the real moment of use)

A competitive-
intelligence analyst at
a real-estate brokerage
technology council opens
her Klue dashboard on
Monday morning and sees a
new-vendor alert for
Digital Craft. She opens
the Digital Craft site
looking for a
machine-readable
subscription surface,
finds
`/compare.json` linked
from the `/compare` hub
footer and from the
site's `robots.txt`,
copies the URL, and
pastes it into Klue's
JSON Feed subscription
UI. Klue immediately
ingests all 15
comparison entries with
title, URL, description,
and last-updated date,
and configures a nightly
diff so a new
comparison ships to her
inbox as a summary the
following morning. She
does not have to
screen-scrape any HTML
page, does not have to
maintain a custom
parser, does not have to
rerun the ingest when
Digital Craft ships a
new comparison. Her
downstream analyst
brief cites
`digitalcraftai.com/compare.json`
as the canonical
source and gives Digital
Craft a "high
transparency" score
that flows into every
buyer-side vendor-
selection matrix the
council publishes.

### Growth

The "show me" moment is
the JSON feed pasted into
a competitive-intelligence
platform's subscription
UI, ingesting instantly,
and producing a downstream
analyst brief that cites
Digital Craft as the
transparency reference for
the AI-services category.
That single ingest is the
shortest path from "we
have HTML comparison
pages" to "we are the
category's reference for
buyer-side vendor
subscription" because
every analyst platform's
crawler prefers a
structured export over
HTML. It also creates
a measurable SEO signal:
a comparison JSON Feed
subscribed to by a
platform crawler
generates outbound
referral traffic AND
signals to Googlebot
that the `/compare/*`
family is a canonical
subscribed surface,
which further widens
the moat opened by
the ticket 0048 hub.
The generator ships
as one new build-time
emission plus one
new spec plus a
handful of small
edits (sitemap,
compare-hub footer
link, robots.txt);
the growth value is
entirely in the
subscribed-crawler
audience the feed
opens.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new build-time-emitted file at `dist/compare.json` (served publicly at `/compare.json`) is written during the sitemap generator pass (or a new sibling script `scripts/generate-compare-json.ts` invoked from the same npm `build` prebuild step that the ticket 0055 `scripts/generate-changelog-rss.ts` and ticket 0078 `scripts/generate-changelog-json.ts` are invoked from). The file MUST be valid JSON parseable by `JSON.parse` and MUST conform to JSON Feed 1.1 (`https://jsonfeed.org/version/1.1`) with the following required top-level fields: `version` (exactly `"https://jsonfeed.org/version/1.1"`), `title` (exactly `"Digital Craft AI comparison feed"`), `home_page_url` (exactly `"https://digitalcraftai.com/compare"`), `feed_url` (exactly `"https://digitalcraftai.com/compare.json"`), `description` (a defensible one-sentence summary of the feed's purpose, hyphen-only), `items` (an array). Per the ticket 0078 JSON Feed precedent, the schema mirrors ticket 0078's `dist/changelog.json` shape verbatim, substituting the compare-specific title and home_page_url.
- [ ] `items` is an array whose length equals `COMPARE_ENTRIES.length` in `src/data/compareEntries.ts` (the shipped ticket 0048 source of truth), where every entry emits exactly one `items[]` object with the following fields: `id` (a stable URL string, exactly `home_page_url + "/" + entry.slug`), `url` (the public route URL, exactly `"https://digitalcraftai.com/compare/" + entry.slug`), `title` (the entry's shipped title, byte-identical to the visible `<h1>` on the compare page per the 2026-05-25 mirror-source rule), `content_text` (a short summary verdict derived from the entry's shipped description or meta field in `compareEntries.ts`; hyphen-only, no em-dashes, no fabricated stat), `date_published` (a real ISO 8601 datetime string in UTC, `YYYY-MM-DDTHH:MM:SSZ`, matching the entry's shipped ship date if available OR the constant fallback of the ticket 0048 `/compare` hub ship date if the entry has no per-row date), `date_modified` (a real ISO 8601 datetime string, defaulting to `date_published` when not otherwise tracked). Per the 2026-06-15 attribute-list regex lesson (which was actually about self-closing XML tags but its family principle applies here), and the 2026-05-28 sitemap-lastmod lesson (encode acceptance invariants inside the generator script that the gate already runs), the generator itself asserts on each iteration that every emitted `items[]` object has all required fields non-empty and throws with a `.broken` output written alongside `dist/compare.json` when an assertion fails. Per the 2026-05-25 mirror-source rule, the item ordering matches `COMPARE_ENTRIES` array order exactly; do NOT reorder in the feed.
- [ ] `vercel.json` (or the equivalent Vercel routing config) is grepped to confirm `/compare.json` is served with `Content-Type: application/feed+json` (or `application/json` if the router does not support the JSON Feed media type). If the router already serves `.json` files from `dist/` with `application/json`, no edit is required and the implementer confirms this via a `curl -I` test against a local preview build. If a rewrite or content-type header IS required (e.g., because the router treats `.json` as SPA-rewritten to `/index.html`), one additive `vercel.json` route entry is added serving `dist/compare.json` at path `/compare.json` with the correct content-type header, mirroring the shipped ticket 0055 `/changelog/rss.xml` and ticket 0078 `/changelog.json` routing pattern. Per the 2026-05-25 mirror-source rule, if the ticket 0078 `/changelog.json` routing works via a specific `vercel.json` shape, this ticket mirrors that shape verbatim.
- [ ] `public/robots.txt` (grep first for the existing file; if the file does not exist, create it with the standard `User-agent: *` block) gains one new line `Sitemap: https://digitalcraftai.com/compare.json` OR a comment line `# Comparison JSON Feed: /compare.json` so JSON-Feed-aware crawlers discover the feed. If robots.txt already contains the ticket 0078 `/changelog.json` line via the sitemap-index convention, mirror that same convention verbatim.
- [ ] `public/sitemap.xml` (grep the shipped generator output first) gains one new `<url>` entry for `/compare.json` with `lastmod` set to the build date and `priority` 0.4 (mirroring the ticket 0078 `/changelog.json` sitemap row per the 2026-05-28 sitemap-lastmod lesson). If the sitemap generator auto-emits every file under `dist/` at its root, no manual edit is required and the implementer confirms auto-inclusion by grepping `dist/sitemap.xml` for `/compare.json` after a local build.
- [ ] `src/pages/CompareHub.tsx` (the shipped ticket 0048 hub page) gains ONE additive footer chip in its existing footer section linking to `/compare.json` with the label "Subscribe (JSON Feed)" and firing `trackCTAClick('compare_subscribe_json', 'compare_hub_footer')` on click. This is one additive edit inside the shipped `<Helmet>`-scoped page; the ticket 0048 CollectionPage JSON-LD and ItemList JSON-LD stay byte-identical. Per the 2026-05-25 mirror-source rule, the chip label is authored once in the CompareHub component and rendered from that single source. Per the 2026-05-30 second-@type lesson, this ticket adds NO new JSON-LD block on `/compare` (the ticket 0048 CollectionPage plus ItemList blocks stay unchanged); the pre-code grep for JSON-LD predicate collisions is a no-op, but the implementer records the no-op in the Implementation log for auditability.
- [ ] Per the 2026-05-07 em-dash Hard NO, every string emitted into the JSON Feed (`title`, `description`, every item's `title`, every item's `content_text`) AND every string in the new CompareHub footer chip AND every string in the new e2e spec is hyphen-only. Self-Review greps the diff for `String.fromCharCode(8212)` and the generator script's output for the raw em-dash byte `0xE2 0x80 0x94` before pushing. Per the 2026-06-03 UTF-8 sign-extension lesson (applied here to the JSON emission), the generator emits raw UTF-8 for every string; do NOT hand-roll a per-byte JSON escape helper (the built-in `JSON.stringify` handles this correctly and the ticket 0078 generator's pattern is authoritative).
- [ ] Per the 2026-05-28 sitemap-lastmod encoded-invariant lesson, the generator script (`scripts/generate-compare-json.ts` OR the extension of `scripts/generate-sitemap.ts`) encodes the acceptance invariants as post-write assertions in the same script: (a) `dist/compare.json` parses via `JSON.parse`, (b) the parsed object has `version === "https://jsonfeed.org/version/1.1"`, (c) `items.length === COMPARE_ENTRIES.length`, (d) every item has non-empty `id`, `url`, `title`, `content_text`, `date_published`, `date_modified`, (e) every item's `url` matches `^https://digitalcraftai\.com/compare/[a-z0-9-]+$` (per the ticket 0074 slug allow-list pattern), (f) every item's `content_text` contains no U+2014 em-dash (`String.fromCharCode(8212)`). The script throws on any assertion failure, writes `dist/compare.json.broken` alongside for debugging, and exits non-zero so `npm run build` fails locally and in CI's `build` gating job.
- [ ] A new e2e spec at `tests/e2e/compare-json-feed.spec.ts` (modeled on `tests/e2e/changelog-json-feed.spec.ts` from ticket 0078) asserts, using an HTTP GET against the preview server: (1) `GET /compare.json` returns 200 with `content-type` containing `application/feed+json` or `application/json`, (2) the response body parses via `JSON.parse` and the parsed object has `version === "https://jsonfeed.org/version/1.1"`, (3) `items.length === COMPARE_ENTRIES.length` (mirror-source assertion importing `COMPARE_ENTRIES` from `src/data/compareEntries.ts` per the 2026-06-07 lesson), (4) every item's `url` route is present in the `src/data/routes.ts` `ROUTES` array (imported from `src/data/routes.ts` per the 2026-06-07 lesson; a URL pointing outside the allow-list is a spec failure), (5) every item's `title` byte-identically equals the corresponding `COMPARE_ENTRIES[i].title` field (mirror-source assertion per the 2026-05-25 rule), (6) every item's `date_published` and `date_modified` parse as valid ISO 8601 datetimes via `Date.parse(...)` and represent a datetime on or before the current UTC time, (7) every item's `content_text` contains zero `String.fromCharCode(8212)` code points, (8) the response body's total size is under 200KB (a soft cap so a future 200-comparison expansion still ships as one file; the spec asserts a warning at 100KB and a failure at 200KB), (9) the CompareHub `/compare` page renders one visible `data-testid="compare-json-feed-link"` anchor with `href="/compare.json"` and a click on it fires `trackCTAClick('compare_subscribe_json', 'compare_hub_footer')` in the analytics pipeline, (10) the ticket 0048 CompareHub CollectionPage and ItemList JSON-LD blocks stay byte-identical after the additive footer chip (regression check per the 2026-05-30 second-@type lesson; the spec fetches the ticket 0048 CollectionPage block by its `name` field per the 2026-09-08 sibling-hub-name-poll lesson). Per the 2026-06-15 attribute-list regex lesson, any regex in the new spec that matches an XML/HTML attribute list uses `[^>]*`, not `[^/>]*`.
- [ ] Standard box: no `/api/` change, no new hostname (the feed is served from the same origin as the site), no new npm dependency (the generator uses only Node built-ins per the ticket 0078 pattern), no edits to `package.json` / `package-lock.json` beyond a possible one-line `npm run build` script chain edit ONLY if the generator is emitted via a new script (grep the shipped `package.json` first; if the ticket 0055 / 0078 generators already share a `prebuild` script the new generator hooks into that chain and no `package.json` edit is required per the GTM queue Hard NO on `package.json`; if a `package.json` edit WOULD be required, the ticket falls back to emitting the JSON via the existing `scripts/generate-sitemap.ts` invocation so the shipped `npm run build` chain stays byte-identical). No edits to `src/data/compareEntries.ts` (byte-identical source of truth), no edits to any shipped `src/pages/compare/*.tsx` file (byte-identical predecessors). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the existing `tests/e2e/compare-hub.spec.ts` (ticket 0048), `tests/e2e/changelog-json-feed.spec.ts` (ticket 0078), and every shipped `tests/e2e/compare-*.spec.ts` stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- Standard anti-goals: no /api/
  changes, no `package.json`
  changes (per the GTM Hard
  NO; the generator must
  hook into an existing
  build script per the
  2026-05-28 encoded-
  invariant lesson), no em-
  dashes in copy, dark-mode
  required.
- A separate RSS 2.0 feed
  at `/compare/rss.xml`. The
  JSON Feed 1.1 format is
  the modern subscription
  surface; adding an RSS
  parallel is a follow-up
  ticket once telemetry
  justifies the second
  format. The ticket 0055
  changelog RSS and ticket
  0078 changelog JSON
  precedent shows both
  formats can coexist, but
  the MVP ships JSON only.
- Renaming or reordering
  the shipped ticket 0048
  hub or its
  CollectionPage /
  ItemList JSON-LD.
  Every predecessor stays
  byte-identical; the
  feed is strictly
  additive.
- Emitting the compare
  JSON Feed as a signed
  or authenticated
  document (a JWT-
  wrapped payload for
  authorized readers).
  Every JSON Feed 1.1
  precedent on this
  site (ticket 0078) is
  publicly readable
  without auth; a
  signed feed is its
  own major ticket.
- Adding per-item
  `image` or `banner_image`
  fields with generated
  logo assets. Logo
  generation is a
  design surface with
  its own review; the
  MVP ships text-only
  items.
- Adding per-item
  `authors` fields
  citing individual
  comparison authors.
  Every comparison is
  authored by the
  agent fleet
  collectively; a
  per-item author
  field would either
  fabricate a name
  or be redundant
  with the site's
  `/agent-fleet`
  page.
- Emitting a JSON-LD
  block wrapping the
  JSON Feed on the
  `/compare` hub page
  (e.g. a Dataset
  block pointing at
  `/compare.json`).
  Per the 2026-05-30
  second-@type lesson,
  the ticket 0048
  CollectionPage plus
  ItemList blocks are
  the canonical
  structured-data
  artifact for the
  hub; adding a
  third Dataset
  block risks
  collision. A
  Dataset wrapper
  is its own follow-
  up ticket.
- Client-side
  hydration of the
  feed into the
  `/compare` hub UI
  (e.g. reading
  `/compare.json`
  from
  `CompareHub.tsx`
  and rendering the
  items). The hub
  already renders
  from
  `COMPARE_ENTRIES`;
  a second read
  path via the
  feed would
  duplicate the
  render and risk
  drift.
- Cross-linking
  `/compare.json`
  from every
  comparison page,
  every AI-for
  page, or the
  homepage. The
  MVP wires exactly
  one hub-footer
  chip and lets
  crawlers
  discover from
  robots.txt and
  the sitemap;
  cross-surface
  promotion is
  its own follow-
  up ticket.
- A "diff since
  last week" or
  "new since date"
  query parameter
  on
  `/compare.json?since=...`.
  The MVP ships
  the full feed
  every time;
  server-side
  filtering is
  its own ticket.
- A subscription
  confirmation
  email or a
  webhook when
  the feed
  updates. Push
  notification
  patterns are
  their own
  tickets once
  ticket 0002
  (5-day course)
  confirms
  email/push
  consent.
- Fabricated
  competitor
  descriptions
  or verdicts
  in the feed
  that differ
  from the
  shipped
  compare page
  copy. Every
  `content_text`
  is derived
  from the
  shipped
  `compareEntries.ts`
  description
  field; no
  new verdict
  copy is
  authored.
- Emitting a
  per-item
  `_ext_dcp`
  namespace of
  Digital
  Craft
  extension
  fields (e.g.
  `_dcp_confidence_score`).
  Every field
  is standard
  JSON Feed 1.1;
  extensions
  are their
  own follow-
  up ticket
  once a
  consumer
  reports the
  need.
- Editing the
  shipped
  ticket 0055
  changelog
  RSS or
  ticket 0078
  changelog
  JSON Feed
  generator
  logic
  beyond
  possibly
  extracting a
  shared
  helper.
  The
  compare
  feed
  generator
  is a NEW
  script that
  MIRRORS the
  ticket 0078
  pattern; it
  does not
  refactor the
  predecessor
  generator.
- Adding the
  feed URL to
  the
  `index.html`
  SEO Pilot
  pages
  table. The
  feed is a
  static
  JSON file
  at
  `/compare.json`;
  it does
  not need a
  Helmet-
  managed
  head
  element
  because it
  is not an
  HTML page.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New
  `scripts/generate-compare-json.ts`
  (or extend
  `scripts/generate-sitemap.ts`
  to also emit
  `dist/compare.json`).
  Mirror the shape of
  `scripts/generate-changelog-json.ts`
  from ticket 0078
  verbatim: read
  `src/data/compareEntries.ts`
  (the shipped ticket
  0048 source of
  truth), iterate the
  `COMPARE_ENTRIES`
  array, emit one
  JSON Feed 1.1
  `items[]` object per
  entry, write
  `dist/compare.json`.
  Per the 2026-05-28
  encoded-invariant
  lesson, encode the
  acceptance
  invariants as post-
  write assertions
  in the same script
  (parse, version,
  length, non-empty
  fields, URL allow-
  list, em-dash
  absence), throw on
  violation, write
  `dist/compare.json.broken`
  alongside on
  failure, exit non-
  zero so
  `npm run build`
  fails.
- Per the GTM Hard NO
  on
  `package.json`, do
  NOT add a new
  `npm run` script.
  Grep the shipped
  `package.json`
  first; the ticket
  0055 / 0070 / 0078
  generators MUST
  already share a
  `prebuild` (or
  equivalent
  build-hook) script
  that the new
  generator hooks
  into. If the
  shipped
  `package.json`
  does not have
  such a hook, the
  fallback is to
  emit the JSON
  Feed inline from
  the existing
  `scripts/generate-sitemap.ts`
  (which the
  shipped
  `npm run build`
  chain already
  invokes per
  ticket 0022) so
  the build
  script chain
  stays byte-
  identical.
- Per the 2026-05-25
  mirror-source rule,
  the feed reads
  `src/data/compareEntries.ts`
  as the canonical
  source of the
  `title`,
  description, and
  slug fields for
  every entry; do
  NOT read the
  individual
  `src/pages/compare/*.tsx`
  render trees.
  Every field
  emitted into the
  feed's items[]
  comes from
  `COMPARE_ENTRIES`;
  a future
  comparison-page
  addition lands in
  one place
  (`compareEntries.ts`)
  and flows into
  the hub, the
  sitemap, and this
  feed
  simultaneously.
- Per the 2026-09-12
  code-beats-prose
  lesson, the
  implementer greps
  the ACTUAL
  `COMPARE_ENTRIES`
  shape at branch
  head before
  wiring the
  generator so the
  field names match
  the shipped
  source. If a
  field name in
  the ticket
  prose does not
  match the shipped
  source, the
  implementer pins
  to the shipped
  source's real
  name and notes
  the deviation
  in the
  Implementation
  log.
- Per the 2026-05-30
  second-@type
  lesson, this
  ticket adds NO
  new JSON-LD
  block on
  `/compare` (the
  ticket 0048
  CollectionPage
  plus ItemList
  blocks stay
  byte-identical).
  The pre-code
  grep for JSON-
  LD predicate
  collisions is
  a no-op;
  record the
  no-op in the
  Implementation
  log for
  auditability.
- Per the 2026-05-07
  em-dash Hard NO,
  every string
  emitted into
  the JSON Feed
  is hyphen-only.
  Self-Review
  greps
  `dist/compare.json`
  for the raw
  UTF-8 em-dash
  byte sequence
  `E2 80 94`
  before
  pushing. Per
  the 2026-06-03
  UTF-8 sign-
  extension
  lesson, the
  generator does
  NOT hand-roll
  a per-byte
  JSON escape;
  `JSON.stringify`
  in Node's
  built-in JSON
  correctly
  emits raw
  UTF-8 for
  strings, and
  the ticket
  0078 pattern
  is
  authoritative.
- `src/pages/CompareHub.tsx`
  gains one new
  footer chip
  linking to
  `/compare.json`.
  Grep the file
  first for the
  existing
  footer render;
  place the new
  chip in the
  same footer
  cluster. The
  chip is
  additive and
  does not touch
  the shipped
  ticket 0048
  CollectionPage
  and ItemList
  JSON-LD
  blocks.
- Per the 2026-06-15
  attribute-list
  regex lesson,
  any regex in
  the new spec
  that matches
  an XML/HTML
  attribute list
  (e.g. matching
  the ticket
  0048
  CollectionPage
  block in the
  regression
  case) uses
  `[^>]*`, not
  `[^/>]*`.
- Per the 2026-09-08
  sibling-hub-
  name-poll
  lesson, the
  regression
  case in the
  new spec
  that
  navigates to
  `/compare`
  and reads
  the ticket
  0048
  CollectionPage
  block keys
  its JSON-LD
  block poll
  on the
  target hub's
  own `name`
  field, not
  on
  `count > 0`
  scripts.
- Per the 2026-09-05
  route-code-
  splitting
  lesson, the
  new spec's
  helper waits
  for the
  RouteFallback
  detach AND
  for the
  CompareHub
  H1 to be
  visible
  before
  probing the
  DOM on the
  `/compare`
  regression
  case.
- Per the 2026-05-25
  mirror-source
  rule, the
  spec imports
  `COMPARE_ENTRIES`
  from
  `src/data/compareEntries.ts`
  and `ROUTES`
  from
  `src/data/routes.ts`
  directly (per
  the 2026-06-07
  src-imports-
  tests
  lesson); do
  NOT hand-
  roll copies
  in the test
  file.
- `vercel.json` -
  grep first
  for the
  ticket 0055
  `/changelog/rss.xml`
  and ticket
  0078
  `/changelog.json`
  routing
  entries. If
  the routing
  is already
  handled by
  the default
  static-file
  server for
  `dist/*.json`
  files
  (which the
  ticket 0078
  implementer
  notes may
  confirm),
  no
  `vercel.json`
  edit is
  required
  and the
  implementer
  runs
  `curl -I`
  against a
  local
  preview to
  confirm. If
  a rewrite
  or header
  IS
  required,
  mirror the
  ticket 0078
  routing
  shape
  verbatim.
- `public/robots.txt` -
  grep first;
  add one
  line if the
  file
  exists,
  create the
  file with
  a standard
  block plus
  the new
  line if it
  does not.
- `public/sitemap.xml`
  or
  `scripts/generate-sitemap.ts` -
  add
  `/compare.json`
  as a new
  URL entry
  with
  `priority`
  0.4 per
  the ticket
  0078
  precedent.
- `tests/e2e/compare-json-feed.spec.ts`
  (new) - one
  assertion
  per
  acceptance
  box. Model
  the spec on
  `tests/e2e/changelog-json-feed.spec.ts`
  (ticket
  0078, the
  direct peer
  for a JSON
  Feed
  surface).
- Per the 2026-05-22
  two-PR ship
  lesson, ship
  will need a
  follow-up
  `chore/0095-ship-status`
  PR after
  the feat
  PR merges
  to flip the
  ticket
  frontmatter
  AND its
  `docs/backlog/README.md`
  index row
  to
  `shipped`
  together;
  run
  `node scripts/check-backlog.mjs`
  before
  pushing the
  second PR
  so the
  file and
  index never
  drift mid-
  flip.
- New deps:
  NO. The
  generator
  uses only
  Node built-
  ins
  (`fs`,
  `path`,
  `JSON`) per
  the ticket
  0078
  pattern.
  The
  CompareHub
  edit
  reuses
  `react-
  router-dom`
  and
  Tailwind
  utility
  classes
  already in
  use.
  Schema
  migration:
  no.
  Privacy /
  security
  surface
  change: no
  (the feed
  is
  publicly
  readable
  static
  JSON, no
  new
  outbound
  network
  call, no
  new
  localStorage
  key).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-24 - branch `feat/0095-compare-json-feed` opened; ticket + README index flipped to in-progress in the same commit per the 2026-05-22 backlog-validator lesson.
- 2026-09-24 - Pre-code grep of COMPARE_ENTRIES shape (per the 2026-09-12 code-beats-prose lesson): the real fields on `src/data/compareEntries.ts` are `id | tool | path | tagline`. The ticket prose named `entry.slug`, `entry.title`, `entry.description` (placeholder prose from the groomer). Mirror-source deviation: `id` maps to `entry.id`, item.title derives as `"Digital Craft vs " + entry.tool` (byte-identical to the H2 rendered on the hub AND to the ItemList JSON-LD `name` field), and item.content_text mirrors `entry.tagline` verbatim. There is no per-entry ship date field, so `date_published` uses the ticket 0048 hub ship date constant `2026-06-11T12:00:00Z` per AC #2's stated fallback.
- 2026-09-24 - Pre-code grep for JSON-LD `@type` collisions on `/compare` (per the 2026-05-30 second-@type lesson): NO-OP by construction; this ticket adds ZERO new JSON-LD blocks (the CompareHub footer chip is a plain `<a>` anchor). The ticket 0048 BreadcrumbList + CollectionPage + ItemList blocks stay byte-identical.
- 2026-09-24 - Sitemap AC deviation (per the 2026-09-12 code-beats-prose lesson): AC #5 says "mirror the ticket 0078 `/changelog.json` sitemap row"; grepping `public/sitemap.xml` at branch head shows NO row for `/changelog.json`. Ticket 0078 ships without a sitemap row (feed discovery is via `<link rel="alternate">` and Vercel default static serving from `public/`). Mirroring 0078 verbatim: no sitemap row added for `/compare.json` either. Crawlers discover the feed via the CompareHub footer chip and the new `robots.txt` comment line.
- 2026-09-24 - Vercel routing AC deviation (per the 2026-09-12 code-beats-prose lesson): AC #3 says grep for a specific `/changelog.json` routing entry in `vercel.json`; the grep returns zero matches for any `changelog.json` / `compare.json` / `.json` header rule. Ticket 0078 relies on Vercel default static serving of `dist/*.json` with `application/json`. Mirroring verbatim: no `vercel.json` edit. Playwright spec assertion allows `application/feed+json` OR `application/json`.
- 2026-09-24 - failing test added in `tests/e2e/compare-json-feed.spec.ts`
- 2026-09-24 - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
