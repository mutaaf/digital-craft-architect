---
id: 0098
title: Generate a public /feeds.opml subscription index aggregating every RSS and JSON Feed the site publishes as a one-click feed-reader import artifact
status: in-progress
priority: P2
area: content
created: 2026-09-26
owner: gtm-innovation
---

## User story

As an RSS-native follower of the AI-services category (a construction-
industry analyst who runs Feedbin or NetNewsWire and subscribes to every
AI vendor's feed for weekly-summary compilation, a real-estate franchise
technology council member who imports vendor feed bundles into an
enterprise reader like Inoreader, a competitive-intelligence analyst whose
tooling accepts an OPML import as the canonical way to bulk-subscribe to
a vendor's feed cluster, a technical-blog reader who wants to grab every
Digital Craft feed in one click without hunting the site for each URL), I
want a public OPML file at `/feeds.opml` listing every RSS and JSON Feed
Digital Craft publishes, in the standard OPML 2.0 outline format that
every mainstream feed reader (NetNewsWire, Feedbin, Inoreader, Feedly,
The Old Reader, Reeder, News Explorer, and Vivaldi's built-in reader)
accepts as a one-click bulk import, so that I can subscribe to Digital
Craft's changelog RSS, changelog JSON Feed, case-studies RSS, blog RSS,
compare JSON Feed, and any future feed in a single import action.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the site now ships FIVE machine-
readable feeds (`/changelog/rss.xml` from ticket 0055, `/changelog.json`
from ticket 0078 in JSON Feed 1.1 format, `/case-studies/rss.xml` from
ticket 0070, `/compare.json` from ticket 0095 in JSON Feed 1.1 format,
plus the pre-existing `/blog/rss.xml` from `scripts/generate-rss.ts`) and
they are discoverable individually via footer trust-chip links and via
per-hub-page cross-links, but they are NOT bundled into a single
subscribable OPML outline that a feed reader can import in one click. The
subscription pattern is proven twice in the ship history: the ticket 0055
/ 0078 changelog family shows that publishing one machine-readable feed
opens a subscribable audience of feed-reader users; the ticket 0095
compare-JSON-feed shows the same for competitive-intelligence platforms.
Adding OPML is exactly one new generator script
(`scripts/generate-feeds-opml.ts` mirroring the ticket 0095
`scripts/generate-compare-json.ts` pattern), one new data file
(`src/data/publishedFeeds.ts` listing the five feeds' URLs, titles, and
types), one new sitemap entry (auto-emitted from the routes pattern used
by every prior feed), one new footer trust-chip link, one new e2e spec,
and one new robots.txt line (if the file exists). Zero new dependency;
OPML is XML that Node built-in `fs` writes directly. Zero new data - the
generator reads the shipped feed URLs (each already emitted at build
time) from a single canonical list.

### Stakeholder

This widens the moat in the buyer-side subscription dimension that the
five machine-readable feeds opened. Every one of the five is a canonical
subscribable artifact on its own, but the "how do I subscribe to
everything Digital Craft publishes" question currently has no one-click
answer. An OPML file is the standard cross-reader import format (RFC-
adjacent; every mainstream reader implements it since Google Reader
established the practice in 2005). The competitive positioning is
asymmetric: most AI-services vendors do NOT publish an OPML outline of
their feed cluster (the vendors who publish machine-readable feeds
typically link each individually and force the analyst to add each feed
by hand). A one-click OPML import in a competitive-intelligence
analyst's reader means a new Digital Craft feed (a future case-studies
JSON Feed, a future events-vertical RSS, a future locations-hreflang
feed) can land in the OPML on ship day and every subscribed reader
picks it up on the next fetch, without the analyst having to hunt for
the URL. Per the ticket 0078 JSON Feed 1.1 precedent and the ticket
0095 compare-json-feed precedent, the OPML file is served as its own
static file at `/feeds.opml` (no JSON-LD wrapper on any HTML page,
avoiding the 2026-05-30 second-@type collision risk). The moat: a
search for "AI services vendor OPML," "Digital Craft feed subscribe
all," or an analyst's tooling that scans a site for a `/feeds.opml`
canonical path lands on one file that says "subscribe to everything
in one click."

### User (in the real moment of use)

A construction-industry analyst at 8:45am on a Tuesday sits down with
Inoreader open in one tab and Digital Craft's `/changelog` page in
another. She wants to bulk-subscribe to every Digital Craft feed
without adding each one by hand. She scrolls to the footer, sees a
"Subscribe (OPML)" chip next to the existing "Subscribe (RSS)" and
"Subscribe (JSON)" chips, right-clicks and copies the URL, opens
Inoreader's Preferences to Import/Export, pastes the URL into the
"Import OPML from URL" field, clicks Import. Inoreader parses the
outline, adds five new subscriptions (Digital Craft Changelog RSS,
Digital Craft Changelog JSON, Digital Craft Case Studies RSS, Digital
Craft Blog RSS, Digital Craft Compare JSON), and she immediately sees
the last 20 items across all five feeds in her unified river. No
per-feed URL hunt, no manual re-subscription when Digital Craft ships
a new feed (the next OPML fetch adds it). Light and dark mode
supported on the CompareHub-adjacent footer chip; the OPML file
itself is not a rendered page but the chip label is defensible.

### Growth

The "show me" moment is a competitive-intelligence analyst pasting
`digitalcraftai.com/feeds.opml` into her reader's import UI, clicking
Import, and having every Digital Craft feed available in one click.
That single ingest is the shortest path from "we publish five
machine-readable feeds" to "we are the reference AI-services vendor
for feed-reader subscribers." The peer-share signal is second-order:
one analyst OPML-import screenshot in a technology-council Slack is a
peer-to-peer endorsement of Digital Craft's subscribe-ability that no
other AI vendor's static feed page can match. It also creates a
measurable SEO signal: the OPML file is a canonical dated artifact
Googlebot can index (via the sitemap `<url>` entry) as evidence that
the site publishes a curated feed cluster, further widening the
machine-readable moat the shipped tickets 0055 / 0070 / 0078 / 0095
opened.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against
this list before writing code.

- [ ] A new build-time-emitted file at `dist/feeds.opml` (served publicly
  at `/feeds.opml`) is written during a new generator script
  `scripts/generate-feeds-opml.ts` invoked from the existing prebuild
  step that the ticket 0095 `scripts/generate-compare-json.ts` and
  ticket 0078 `scripts/generate-changelog-json.ts` hook into (grep the
  `package.json` `scripts.build` chain FIRST; if the existing chain
  already runs a `prebuild` step that iterates over
  `scripts/generate-*.ts`, the new script hooks in automatically. If NO
  such iteration exists, the fallback per the GTM Hard NO on
  `package.json` is to emit the OPML inline from
  `scripts/generate-sitemap.ts` per the ticket 0095 fallback pattern
  documented in that ticket's Implementation log). The file MUST be
  valid XML parseable by a standard XML parser AND MUST conform to
  OPML 2.0 (`http://opml.org/spec2.html`) with the following required
  structure: `<?xml version="1.0" encoding="UTF-8"?><opml version="2.0">
  <head><title>Digital Craft AI Feeds</title>
  <dateCreated>{ISO date}</dateCreated></head>
  <body><outline type="rss" text="{feed title}" xmlUrl="{feed URL}"
  htmlUrl="{feed's canonical HTML page URL}"/> ... </body></opml>`.
- [ ] A new data file at `src/data/publishedFeeds.ts` (new file, under
  60 lines) exports a `PUBLISHED_FEEDS` readonly array of
  `{ id: string; title: string; xmlUrl: string; htmlUrl: string;
  type: 'rss' | 'json' }` objects, one per feed the site actually
  publishes at branch head. Grep at branch head FIRST for every
  `scripts/generate-*.ts` file emitting a feed, and pin the array to
  the actual shipped feeds: as of 2026-09-26 the expected shipped set
  is `/changelog/rss.xml` (ticket 0055), `/changelog.json` (ticket
  0078), `/case-studies/rss.xml` (ticket 0070), `/compare.json`
  (ticket 0095), `/blog/rss.xml` (pre-existing per `scripts/generate-
  rss.ts`), but per the 2026-09-12 code-beats-prose lesson the
  implementer treats this list as groomer prose and verifies the
  actual generator scripts at branch head before pinning. If a listed
  feed does not exist at branch head, omit it and note the deviation
  in the Implementation log; if a NEW feed exists that this list
  omits, add it. The `PUBLISHED_FEEDS` array is the single canonical
  source of truth per the 2026-05-25 mirror-source rule; the OPML
  generator reads it verbatim, and the future footer chip cluster on
  `Footer.tsx` (if extended) can read from the same array.
- [ ] The generator script encodes the acceptance invariants as post-
  write assertions per the 2026-05-28 sitemap-lastmod encoded-
  invariant lesson: (a) `dist/feeds.opml` parses as valid XML via a
  Node built-in (a hand-rolled regex over the raw text is acceptable
  because OPML shape is fixed and the ticket 0055 RSS generator uses
  the same technique; do NOT install `xml2js`), (b) the root element
  is `<opml version="2.0">`, (c) the `<head>` block contains a
  `<title>` matching "Digital Craft AI Feeds", (d) the `<body>`
  contains exactly `PUBLISHED_FEEDS.length` `<outline>` elements,
  (e) every `<outline>` has a non-empty `xmlUrl` attribute matching
  `^https://digitalcraftai\.com/`, (f) every `<outline>` has a
  non-empty `type` attribute equal to either `"rss"` or `"json"`,
  (g) every `<outline>`'s `xmlUrl` is present in
  `PUBLISHED_FEEDS[*].xmlUrl` (mirror-source), (h) no string in the
  emitted OPML contains `String.fromCharCode(8212)` (em-dash Hard NO).
  The script throws on any assertion failure, writes
  `dist/feeds.opml.broken` alongside for debugging, and exits non-zero
  so `npm run build` fails locally and in CI's `build` gating job.
- [ ] `public/robots.txt` (grep first for the existing file; if the
  file does not exist per the ticket 0095 implementer's note that it
  may not exist, do NOT create it just for this ticket) gains one new
  comment line `# Feed subscription bundle: /feeds.opml` above the
  existing feed comment lines. Per the ticket 0095 precedent that the
  Sitemap: directive is not the right convention for OPML files,
  discovery is via the footer chip and the sitemap `<url>` entry.
- [ ] `public/sitemap.xml` gains one new `<url>` entry for `/feeds.opml`
  with `lastmod` set to the build date and `priority` 0.3 (below the
  ticket 0095 `/compare.json` 0.4 because OPML is a discovery aid, not
  a canonical content surface). If the sitemap generator auto-emits
  every file under `dist/` (or every entry in a canonical routes list),
  no manual XML edit is required and the implementer confirms auto-
  inclusion by grepping `dist/sitemap.xml` for `/feeds.opml` after a
  local build per the 2026-05-28 encoded-invariant lesson.
- [ ] `src/components/Footer.tsx` gains ONE additive chip inside the
  existing footer trust-chip cluster labeled "Subscribe (OPML)" linking
  to `/feeds.opml`, firing
  `trackCTAClick('feeds_opml_subscribe', 'footer')` on click.  Grep the
  file first for the existing feed chip cluster (the ticket 0055
  Subscribe (RSS) chip, the ticket 0078 Subscribe (JSON) chip); place
  the new chip next to those. The chip is additive; every predecessor
  chip stays byte-identical.
- [ ] Per the 2026-05-07 em-dash Hard NO, every string emitted into the
  OPML file (title, dateCreated, outline text attributes) AND every
  string in the new footer chip AND every string in the new e2e spec
  is hyphen-only. Self-Review greps the diff for
  `String.fromCharCode(8212)` and the generator script's output for
  the raw em-dash byte `0xE2 0x80 0x94` before pushing.
- [ ] Per the 2026-05-30 second-@type lesson, this ticket adds NO new
  JSON-LD blocks (the footer chip is a plain `<a>` anchor). The pre-
  code grep for JSON-LD predicate collisions is a no-op, but the
  implementer records the no-op in the Implementation log for
  auditability.
- [ ] A new e2e spec at `tests/e2e/feeds-opml-subscription-index.spec.ts`
  (modeled on `tests/e2e/compare-json-feed.spec.ts` from ticket 0095)
  asserts, using an HTTP GET against the preview server: (1) `GET
  /feeds.opml` returns 200 with `content-type` containing `application/
  xml` or `text/xml` or `text/x-opml` (whichever the router serves;
  every mainstream reader accepts any of the three), (2) the response
  body parses as XML (a Node `DOMParser` shim or a small hand-rolled
  regex-based parser mirroring the ticket 0055 RSS spec pattern), (3)
  the root element is `<opml version="2.0">`, (4) the `<head>`
  contains a `<title>` element with text "Digital Craft AI Feeds", (5)
  the `<body>` contains exactly `PUBLISHED_FEEDS.length` `<outline>`
  elements (mirror-source assertion importing `PUBLISHED_FEEDS` from
  `src/data/publishedFeeds.ts` per the 2026-06-07 lesson), (6) every
  `<outline>`'s `xmlUrl` attribute is byte-identical to the
  corresponding `PUBLISHED_FEEDS[i].xmlUrl`, (7) every `<outline>`'s
  `type` attribute is either `"rss"` or `"json"` matching
  `PUBLISHED_FEEDS[i].type`, (8) the response body contains zero
  `String.fromCharCode(8212)` code points, (9) the response body size
  is under 20KB (a soft cap because OPML files are tiny; the spec
  asserts a warning at 10KB and a failure at 20KB), (10) the homepage
  footer renders one visible `data-testid="feeds-opml-link"` anchor
  with `href="/feeds.opml"`, (11) navigating to each `xmlUrl` in
  `PUBLISHED_FEEDS` returns 200 (regression check that every advertised
  feed is actually live on the same build; a broken feed URL in the
  OPML is a spec failure). Per the 2026-06-15 attribute-list regex
  lesson, any regex in the spec that matches XML attribute lists uses
  `[^>]*`, not `[^/>]*`.
- [ ] Standard box: no `/api/` change, no new hostname (all feed URLs
  are on the same origin), no new npm dependency (the generator uses
  only Node built-ins; do NOT install `xml2js`, `xmlbuilder2`, or
  `opml-parser`), no edits to `package.json` / `package-lock.json`
  beyond the possible generator-hook line (per the ticket 0095
  Implementation log, the generator hooks into an existing prebuild
  chain or falls back to being emitted from
  `scripts/generate-sitemap.ts` so `package.json` stays byte-
  identical). No edits to any of the five predecessor feed generators
  (`scripts/generate-changelog-rss.ts`, `scripts/generate-changelog-
  json.ts`, `scripts/generate-case-studies-rss.ts`,
  `scripts/generate-compare-json.ts`, `scripts/generate-rss.ts`) or
  the shipped feed files themselves.
  `node scripts/check-backlog.mjs`, `npm run check-links`,
  `npm run check-images`, `npm run check-meta`, `npm run check-blog-
  dates`, `npm run typecheck`, `npm run lint`, `npm run build` all
  stay green. The new spec passes; the five predecessor feed specs
  (0055, 0070, 0078, 0095, and the blog RSS spec if it exists) all
  stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem
related.

- Standard anti-goals: no `/api/` changes, no `package.json` changes
  (per the GTM Hard NO; the generator must hook into an existing build
  script per the 2026-05-28 encoded-invariant lesson), no em-dashes in
  copy, dark-mode required.
- Adding a second OPML file scoped to a subset (e.g. `/feeds-json.opml`
  containing only JSON Feeds). The MVP is one bundle listing every
  feed; per-format sub-bundles are a follow-up ticket only if a
  consumer reports the need.
- Adding an OPML-nested-outline hierarchy (grouping feeds under "Ship
  velocity", "Content", "Case studies" folders). OPML supports nested
  outlines but the MVP flat list is unambiguous and every reader
  imports it correctly; nesting is a follow-up ticket.
- Emitting a JSON-LD `Dataset` wrapper referencing `/feeds.opml` on any
  page. Per the 2026-05-30 second-@type lesson AND the ticket 0095
  precedent, adding a Dataset block risks collision with the shipped
  ticket 0048 CollectionPage / ItemList blocks on `/compare` and the
  ticket 0044 AboutPage block on `/trust`.
- Cross-linking `/feeds.opml` from every comparison page, every
  AI-for-* page, or the homepage hero. The MVP wires exactly one
  footer chip and lets crawlers discover from the sitemap; cross-
  surface promotion is its own follow-up ticket.
- Emitting an authenticated or signed OPML file (a JWT-wrapped payload
  for authorized readers). Every feed the OPML references is
  publicly readable; a signed OPML is its own major ticket.
- Adding per-outline `category` attributes tagging feeds by vertical
  (`construction`, `real-estate`, `home-services`). OPML supports
  `category` but the MVP flat list stays hyphen-only ASCII to
  maximize reader compatibility; category tagging is a follow-up
  ticket.
- Editing the five predecessor feed generators to emit an OPML
  self-link element. The OPML file is a separate artifact; the
  predecessors stay byte-identical.
- A "Subscribe (OPML)" chip on every hub page (`/changelog`,
  `/case-studies`, `/blog`, `/compare`). The MVP wires one footer
  chip; per-hub OPML links are a follow-up ticket once telemetry
  justifies duplication.
- A dynamic `/feeds.opml?since=...` query parameter surface (a
  filtered OPML). The MVP is a static file; server-side filtering
  requires a `/api/*` route and is a GTM Hard NO.
- Adding OPML 2.0 `expansionState` or `vertScrollState` fields (which
  encode a reader's UI state). Those are reader-side, not publisher-
  side, and are out of scope.
- Emitting OPML 1.0 as a fallback. Every mainstream reader supports
  OPML 2.0; a fallback would double the artifact count for no gain.
- Client-side hydration of the OPML on any HTML page (rendering the
  feed list from `/feeds.opml` at runtime on the homepage or a
  hypothetical `/feeds` page). The OPML is a static import artifact
  for readers; a rendered `/feeds` page would duplicate the footer
  chip cluster and is a distinct future ticket.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't
have to re-discover the architecture.

- New `scripts/generate-feeds-opml.ts`. Mirror the shape of
  `scripts/generate-compare-json.ts` from ticket 0095 verbatim: read
  `src/data/publishedFeeds.ts`, iterate `PUBLISHED_FEEDS`, emit one
  `<outline type="{type}" text="{title}" xmlUrl="{xmlUrl}"
  htmlUrl="{htmlUrl}"/>` per feed, write `dist/feeds.opml`. Per the
  2026-05-28 encoded-invariant lesson, encode the acceptance
  invariants as post-write assertions in the same script (parse,
  version, outline count, URL scheme, em-dash absence), throw on
  violation, write `dist/feeds.opml.broken` alongside on failure,
  exit non-zero so `npm run build` fails.
- Per the GTM Hard NO on `package.json`, do NOT add a new `npm run`
  script. Grep the shipped `package.json` first; per the ticket 0095
  Implementation log the ticket 0055 / 0070 / 0078 generators MUST
  already share a `prebuild` (or equivalent build-hook) script that
  the new generator hooks into. If the shipped `package.json` does
  not have such a hook, the fallback per the ticket 0095 precedent is
  to emit the OPML inline from the existing
  `scripts/generate-sitemap.ts` (which the shipped `npm run build`
  chain already invokes per ticket 0022) so the build script chain
  stays byte-identical.
- New `src/data/publishedFeeds.ts` (under 60 lines). Mirror the shape
  of `src/data/compareEntries.ts` (ticket 0048) or
  `src/data/aiRisksWatchlist.ts` (ticket 0094): exported readonly
  array of typed objects, one per feed the site actually publishes at
  branch head. Per the 2026-09-12 code-beats-prose lesson, the
  implementer greps at branch head FIRST for every
  `scripts/generate-*.ts` file emitting a feed AND for every shipped
  feed under `dist/` after a local build, and pins the array to the
  actual shipped feeds. The ticket's expected set is groomer prose;
  the code (the generator scripts) is authoritative.
- Per the 2026-05-25 mirror-source rule, the OPML generator reads
  `src/data/publishedFeeds.ts` as the canonical source of feed
  metadata; a future feed addition lands in one place
  (`publishedFeeds.ts`) and flows into the OPML, the future footer
  chip cluster, and any future `/feeds` hub page simultaneously.
- Per the 2026-05-30 second-@type lesson, this ticket adds NO new
  JSON-LD block on any HTML page (the OPML is served as its own XML
  document at `/feeds.opml`). The pre-code grep for JSON-LD
  predicate collisions is a no-op; record the no-op in the
  Implementation log for auditability.
- Per the 2026-05-07 em-dash Hard NO, every string emitted into the
  OPML file is hyphen-only. Self-Review greps `dist/feeds.opml` for
  the raw UTF-8 em-dash byte sequence `E2 80 94` before pushing.
- `src/components/Footer.tsx` gains one new "Subscribe (OPML)" chip
  next to the existing feed chips per the ticket 0055 / 0078 footer
  pattern. Grep the file first for the existing chip cluster; place
  the new chip in the same section. The chip is additive.
- Per the 2026-06-15 attribute-list regex lesson, any regex in the
  new spec that matches XML/OPML attribute lists uses `[^>]*`, not
  `[^/>]*`. The forward slash is a legitimate character in URL
  attribute values (paths inside `xmlUrl` / `htmlUrl`).
- Per the 2026-06-07 mirror-source-across-src-tests lesson, the spec
  imports `PUBLISHED_FEEDS` from `src/data/publishedFeeds.ts`
  directly; do NOT hand-roll a copy in the test file.
- Per the 2026-09-05 route-code-splitting lesson, the new spec's
  homepage-footer check waits for the RouteFallback detach AND for
  the H1 to be visible before probing the DOM (the homepage renders
  eagerly, but the safety pattern is cheap and matches every recent
  spec).
- `vercel.json` - grep first for the ticket 0055 `/changelog/rss.xml`
  and ticket 0095 `/compare.json` routing entries. Per the ticket
  0095 Implementation log, Vercel default static-file serving from
  `dist/` covers the OPML file with `application/xml` content-type;
  no `vercel.json` edit is required and the implementer runs `curl -
  I` against a local preview to confirm. If a rewrite or explicit
  content-type IS required, mirror the ticket 0095 routing shape
  verbatim.
- `public/robots.txt` - grep first per the ticket 0095 note that the
  file may not exist. If it exists, add one comment line
  `# Feed subscription bundle: /feeds.opml` above any existing feed
  comments. Do NOT create the file just for this ticket if it does
  not exist; discovery is via the footer chip and the sitemap.
- `public/sitemap.xml` or `scripts/generate-sitemap.ts` - add
  `/feeds.opml` as a new URL entry with `priority` 0.3 mirroring the
  ticket 0095 sitemap pattern per the 2026-05-28 sitemap-lastmod
  lesson. If the generator auto-emits from a routes list, no manual
  edit is required.
- `tests/e2e/feeds-opml-subscription-index.spec.ts` (new) - one
  assertion per acceptance box. Model the spec on
  `tests/e2e/compare-json-feed.spec.ts` (ticket 0095, the direct peer
  for a machine-readable-feed surface) and on
  `tests/e2e/changelog-rss-feed.spec.ts` (ticket 0055, for XML
  parsing regex patterns).
- Per the 2026-05-22 two-PR ship lesson, ship will need a follow-up
  `chore/0098-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter AND its `docs/backlog/README.md` index row to
  `shipped` together; run `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index never drift mid-flip.
- New deps: NO. The generator uses only Node built-ins (`fs`, `path`,
  `Date`) per the ticket 0095 pattern. The Footer chip reuses
  `react-router-dom` and Tailwind utility classes already in use.
  Schema migration: no. Privacy / security surface change: no (the
  OPML is a publicly readable static XML file, no new outbound
  network call, no new localStorage key).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-26 - branch `feat/0098-feeds-opml-subscription-index` opened
- 2026-09-26 - grepped generator scripts + `public/` to pin
  `PUBLISHED_FEEDS` per 2026-09-12 code-beats-prose: shipped feeds are
  `/rss.xml` (blog, `scripts/generate-rss.ts` writes to `public/rss.xml`;
  ticket prose said `/blog/rss.xml`, code is authoritative),
  `/changelog/rss.xml` (0055), `/changelog.json` (0078),
  `/case-studies/rss.xml` (0070), `/compare.json` (0095). Deviation:
  blog feed URL is `/rss.xml`, not `/blog/rss.xml`.
- 2026-09-26 - `package.json` has no `prebuild` iteration; per the AC #1
  fallback, hooked `scripts/generate-feeds-opml.ts` into
  `scripts/generate-sitemap.ts`'s `run()` alongside the ticket 0095
  `generateCompareJson()` dynamic import. `package.json` byte-identical.
- 2026-09-26 - JSON-LD grep no-op (per AC): no new JSON-LD block on any
  HTML page (chip is a plain `<a>`). Recorded for auditability.
- 2026-09-26 - failing test added in
  `tests/e2e/feeds-opml-subscription-index.spec.ts` (one assertion per
  acceptance box, imports `PUBLISHED_FEEDS` per 2026-06-07 mirror rule,
  uses `[^>]*` per 2026-06-15 attribute-list regex lesson).
- 2026-09-26 - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
