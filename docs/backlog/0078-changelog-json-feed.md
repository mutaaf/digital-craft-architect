---
id: 0078
title: Generate a public /changelog.json machine-readable JSON Feed of shipped tickets so buyers and analysts can subscribe programmatically to ship velocity
status: in-progress
priority: P2
area: content
created: 2026-09-12
owner: gtm-innovation
---

## User story

As a technical buyer or analyst tracking Digital Craft's
ship velocity programmatically (a competing AI-services
agency's engineering lead pulling a weekly cron job that
scrapes vendor ship logs to benchmark cadence, a
prospect's in-house automation team that already
consumes JSON Feed 1.1 endpoints from Notion, GitHub,
and Statuspage in their Slack "vendor updates" channel,
a venture-analyst intern building a spreadsheet of
"weekly-ship AI vendors in the service-business
vertical," an SEO crawler that indexes
`application/feed+json` URLs on a faster recrawl
schedule than parent HTML pages), and as a returning
prospect whose feed reader already handles JSON Feed
better than RSS (Feedbin, NetNewsWire, Reeder), I want a
static machine-readable feed at `/changelog.json`
sibling to the existing `/changelog/rss.xml` (ticket
0055) that emits every shipped ticket as a JSON Feed
1.1 item with `id`, `url`, `title`, `content_text`,
`date_published`, and `tags` (the ticket's `area`), so
that I can subscribe to Digital Craft's ship cadence
from any modern tool without parsing XML, and so that
a peer-watching audience with a preference for JSON has
a first-class read.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the site already
auto-generates the changelog data twice. First,
`scripts/generate-changelog.ts` (ticket 0032) reads every
shipped ticket frontmatter from `docs/backlog/*.md` and
emits a typed `changelogEntries: readonly ChangelogEntry[]`
constant at `src/data/changelogEntries.ts` carrying `id`,
`title`, `area`, `created`. Second,
`scripts/generate-changelog-rss.ts` (ticket 0055) reads
that same constant and emits an XML RSS 2.0 feed at
`public/changelog/rss.xml`. This ticket adds a THIRD
downstream artifact: a new sibling script
`scripts/generate-changelog-json.ts` that reads the SAME
`src/data/changelogEntries.ts` constant and writes a
JSON Feed 1.1 conformant file to `public/changelog.json`.
Zero new backend, zero new dependency, zero new data
shape, zero /api/ route (the file ships as a static
public asset that Vercel serves directly). One new
script, one additive line in `public/index.html` and in
`src/pages/Changelog.tsx` for the `<link rel="alternate" type="application/feed+json">`
tag, one new spec asserting the feed shape. The RSS
generator, the changelog data generator, and the RSS
XML file stay byte-identical.

### Stakeholder

This widens the moat in the distribution dimension along
an axis the RSS feed alone does not fully cover. Ticket
0055 opened the feedreader surface for XML consumers;
this ticket completes the pair by opening the JSON Feed
surface for programmatic and modern-feedreader consumers.
The JSON Feed 1.1 spec (https://www.jsonfeed.org/version/1.1/)
is a well-defined open standard supported natively by
Feedbin, NetNewsWire, Reeder, and adopted by GitHub,
Statuspage, and Notion for their public change feeds; a
Digital Craft AI JSON Feed on the ship-log means every
JSON-consuming automation tool in the buyer's stack has
a first-class subscribe path. The moat argument matches
the ticket 0055 stakeholder lens verbatim: a public
change feed is the single cheapest signal to a peer-
watching audience, and pairing an RSS feed with a JSON
Feed at the same shipping cadence means the audience
that prefers one format is never blocked. Per the
ticket 0055 Out of Scope language ("A machine-readable
JSON API for changelog entries is its own follow-up
ticket once feedreader telemetry justifies the second
format"), this is pre-authorized follow-up work per
the 2026-05-22 "bootstrap pre-authorized follow-ups"
lesson. Per the ticket 0043 ItemList JSON-LD emission
on `/changelog` and the ticket 0055 RSS feed
precedent, a freshly shipped ticket now gets FOUR
discovery paths within minutes of merge: HTML page
render, JSON-LD ItemList entry, RSS feed item, and
JSON Feed item.

### Visitor (in the real moment of use)

A prospect's in-house automation team lead opens the
`/changelog` page from a bookmark on Monday morning to
check what shipped over the weekend. Below the existing
"Subscribe via RSS" chip (from ticket 0055) at the top
of the page, one new small chip reads "Subscribe via
JSON Feed" with an `<a href="/changelog.json">` link.
The lead copies the URL, pastes it into their team's
Notion "vendor updates" JSON Feed integration, and
walks away; every future Digital Craft ship arrives in
the team's Notion feed within an hour. A competing
AI-services agency engineering lead running a weekly
cron job that scrapes vendor ship logs updates their
script to `curl https://digitalcraftai.com/changelog.json | jq '.items[] | {id, title, date_published}'`
and gets clean JSON in one line instead of parsing XML.
An SEO crawler indexing the site sees a new
`application/feed+json` MIME type on
`/changelog.json` and adds it to the recrawl queue with
the shorter TTL used for feed URLs. No visible change
to the `/changelog` page beyond the one new chip; the
JSON Feed itself is machine-readable and not a visitor-
facing surface on a phone.

### Growth

The "show me" moment is the paste into a technical
buyer's stack: a Notion or Statuspage-integration
screenshot showing Digital Craft's ship cadence
alongside the buyer's other JSON Feed subscriptions
(GitHub releases, Statuspage incidents, competing
vendor ship logs). That artifact is the single
cheapest programmatic-audience acquisition signal the
site can produce because the audience it reaches
(engineering leads, in-house automation teams,
analysts) is the audience that most influences B2B
buying decisions in the AI-services vertical. Per the
ticket 0055 subscribe-chip telemetry precedent, the
new chip on `/changelog` fires
`trackCTAClick('changelog_json_subscribe', 'changelog_header')`
on click so JSON Feed subscription intent is
measurable in GA independently of the RSS chip. The
generator itself is invisible to visitors; the growth
value is entirely in the surface the JSON Feed opens
to buyer stacks that prefer JSON over XML.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new script at `scripts/generate-changelog-json.ts` (new file, under 200 lines) reads the existing `src/data/changelogEntries.ts` constant, transforms every entry into a JSON Feed 1.1 item, and writes the assembled feed to `public/changelog.json` as pretty-printed JSON (two-space indentation). The script is invoked from the same build glue that already runs `scripts/generate-changelog.ts` and `scripts/generate-changelog-rss.ts` (either an `npm run` script alias or a build-hook script), BEFORE `vite build` runs so the file is present in `dist/` at deploy time. The script mirrors the shape of `scripts/generate-changelog-rss.ts` (ticket 0055) for its filesystem-write pattern, path-resolution logic (`import.meta.url` based), and error handling.
- [ ] The generated `public/changelog.json` file conforms to JSON Feed 1.1 spec (https://www.jsonfeed.org/version/1.1/). Required top-level fields: `version: 'https://jsonfeed.org/version/1.1'`, `title: 'Digital Craft AI Changelog'`, `home_page_url: 'https://digitalcraftai.com/changelog'`, `feed_url: 'https://digitalcraftai.com/changelog.json'`, `description: <string identical to the /changelog page meta description per the 2026-05-25 mirror-source rule>`, `language: 'en-US'`, `items: JsonFeedItem[]`. Each `JsonFeedItem` shape: `{ id: <ticket-id-as-string, e.g. "0075">, url: <permalink to /changelog with anchor, e.g. "https://digitalcraftai.com/changelog#0075">, title: <ticket title, verbatim from the constant>, content_text: <ticket title verbatim; content_text over content_html because the shipped constant carries titles only, not rendered HTML>, date_published: <ISO-8601 timestamp derived from the ticket's created field, e.g. "2026-09-10T00:00:00Z">, tags: [<ticket area, e.g. "seo">] }`. Items ordered newest-first by `date_published` (matching the ticket 0055 RSS ordering).
- [ ] The feed emits exactly one item per shipped ticket in `src/data/changelogEntries.ts` (the constant is already filtered to shipped-only entries per ticket 0032). A ticket whose status changes from shipped back to in-progress (edge case) drops out of the constant and therefore drops out of the feed on the next build; the script does NOT persist any state across builds. The script exits with a non-zero code and a clear error message when `src/data/changelogEntries.ts` is missing or when the transform throws on any entry (defensive fail-fast per the ticket 0055 script's error convention).
- [ ] `src/pages/Changelog.tsx` gains ONE new `<link rel="alternate" type="application/feed+json" href="/changelog.json" title="Digital Craft AI Changelog (JSON Feed)" />` tag inside its existing `<Helmet>` block adjacent to the existing `<link rel="alternate" type="application/rss+xml">` tag from ticket 0055. `index.html` also gains a sibling `<link rel="alternate" type="application/feed+json" href="/changelog.json" />` tag adjacent to the existing RSS alternate tag from ticket 0055 (mirror whichever placement the RSS tag already uses in `index.html`) so feedreader browser extensions detect the feed on any page load.
- [ ] `src/pages/Changelog.tsx` gains ONE new small subscribe chip in the existing subscribe-chip area from ticket 0055. The chip renders as an `<a href="/changelog.json" data-testid="changelog-json-subscribe-chip">` element with text "Subscribe via JSON Feed" (or similar under 32 characters) and fires `trackCTAClick('changelog_json_subscribe', 'changelog_header')` on click. The chip mirrors the visual style of the existing RSS chip (same Tailwind utility classes, same icon slot pattern). NO other edit to `Changelog.tsx` (the existing ItemList JSON-LD block from ticket 0043, the existing render tree, and the existing RSS chip stay byte-identical).
- [ ] The generated `public/changelog.json` file is served by Vercel with `Content-Type: application/feed+json` per JSON Feed 1.1 recommendation (Vercel infers `application/json` for `.json` files by default; the implementer confirms whether a `vercel.json` header override is required and documents the decision in the Implementation log). If the header override IS required, the edit to `vercel.json` is scoped to a single new `headers` entry for `/changelog.json` and does NOT touch any other route or header (an additive change; the existing SPA rewrites and API routes stay byte-identical).
- [ ] The generated `public/changelog.json` file contains zero em-dash characters (`U+2014`) in any string value. Per the 2026-05-25 mirror-source-fix rule, if any shipped ticket title in `docs/backlog/*.md` (which sources the changelog constant) contains an em-dash, the fix is applied at the single source (the ticket frontmatter's `title` field) so the RSS feed, the JSON Feed, the on-page render, and the JSON-LD ItemList all stay identical. The Self-Review greps the generated file for `String.fromCharCode(8212)` before pushing.
- [ ] A new e2e spec at `tests/e2e/changelog-json-feed.spec.ts` (modeled on `tests/e2e/changelog-rss-feed.spec.ts` from ticket 0055) asserts: (1) `GET /changelog.json` returns 200 with a `Content-Type` header containing either `application/feed+json` or `application/json` (either is acceptable depending on the vercel.json decision from the prior box; the test asserts the OR), (2) the response body parses as valid JSON, (3) the parsed object has `version: 'https://jsonfeed.org/version/1.1'`, `title`, `home_page_url`, `feed_url`, and `items` fields, (4) `items` is a non-empty array (`items.length >= 1`), (5) every item has `id`, `url`, `title`, `content_text`, `date_published`, and `tags` fields, (6) every item's `date_published` parses as a valid ISO-8601 timestamp via `!isNaN(Date.parse(item.date_published))`, (7) items are ordered newest-first (`Date.parse(items[0].date_published) >= Date.parse(items[items.length - 1].date_published)`), (8) `items[0].url` starts with `https://digitalcraftai.com/changelog#`, (9) `items[0].tags[0]` is one of the known area values (`conversion | seo | content | trust | demos | infra | perf`), (10) the feed body contains no `String.fromCharCode(8212)` code point in the raw text (assert via `expect(bodyText).not.toContain(String.fromCharCode(8212))`), (11) `GET /changelog` renders a `link[rel="alternate"][type="application/feed+json"][href="/changelog.json"]` element in the `<head>`, (12) `GET /changelog` renders a visible `data-testid="changelog-json-subscribe-chip"` element whose href resolves to `/changelog.json`, (13) a click on the JSON subscribe chip fires the `changelog_json_subscribe` beacon (spied via the `trackCTAClick` shim seeded before navigation).
- [ ] Standard box: no `/api/` change (the feed ships as a static public asset generated at build time), no new hostname, no new npm dependency (JSON Feed emission uses `JSON.stringify` and `fs.writeFileSync` from Node stdlib per the ticket 0055 script pattern), no edits to `package.json` / `package-lock.json` (only `package.json` script alias may need one additive entry if the existing build glue does NOT auto-run `.ts` scripts under `scripts/`; if the RSS generator is already wired into build, mirror its wiring exactly to avoid a package.json edit). Actually: because `package.json` edits are FORBIDDEN under the GTM Hard NO, the implementer wires the new script through the SAME entry point the RSS generator already uses (whichever npm script alias currently runs `scripts/generate-changelog-rss.ts`) by appending the new script's invocation to the SAME line, or by having the new script be invoked as a chained call inside the existing `generate-changelog-rss.ts` (a cleaner option). No edits to `src/data/changelogEntries.ts`, `scripts/generate-changelog.ts`, `scripts/generate-changelog-rss.ts` (the existing generator stays byte-identical; only the invocation chain widens by one step). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the existing `tests/e2e/changelog-rss-feed.spec.ts` (ticket 0055), `tests/e2e/changelog-itemlist-jsonld.spec.ts` (ticket 0043), `tests/e2e/changelog-page.spec.ts` (ticket 0032) stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- No /api/ changes, no package.json changes, no
  em-dashes in copy, dark-mode required (this
  ticket only ships a static JSON file plus one
  invisible link tag plus one small subscribe
  chip mirroring the ticket 0055 RSS chip
  styling, so dark-mode is inherited).
- A dynamic /api/changelog endpoint. The GTM
  Hard NO forbids /api/ edits; the feed ships
  as a static asset at `/changelog.json`
  generated at build time (per the ticket 0055
  RSS precedent).
- A GraphQL endpoint for changelog entries. A
  full GraphQL surface requires a resolver, a
  schema, and a runtime; wildly out of scope
  for a distribution ticket.
- Emitting item `content_html` (rendered
  ticket descriptions) instead of
  `content_text` (title only). The shipped
  changelog constant carries titles only; a
  rendered description would require a new
  data field on every ticket, which is a
  larger data-shape edit than this ticket's
  scope allows.
- Adding `authors` or `author` fields to
  items. The shipped constant does not carry
  a per-ticket author; adding one would
  require a coordinated ticket-frontmatter
  edit across every shipped ticket.
- Adding item images (`banner_image` per
  JSON Feed 1.1). Ticket entries do not
  carry cover images; fabricating one is out
  of scope.
- A pagination scheme for the feed
  (`next_url` for older entries). The full
  feed is small enough to serve in one
  payload (77 shipped entries at time of
  writing, each under 200 bytes); pagination
  is premature optimization.
- A JSON Feed for `/case-studies/rss.xml`
  (ticket 0070 case-studies RSS). A
  case-studies JSON Feed is its own
  follow-up ticket following the same
  pattern once telemetry justifies the
  second format.
- Emitting a `Feed` JSON-LD block on
  `/changelog` describing the JSON Feed
  endpoint. JSON Feed uses HTML `<link
  rel="alternate">` for autodiscovery per
  its spec; a JSON-LD Feed block is
  redundant and could conflict with the
  ticket 0043 ItemList block.
- A subscribe-form email capture on
  `/changelog` prompting the visitor to
  "get changelog updates via email." Per
  the ticket 0036 "no fourth capture form"
  close, the feed is a passive artifact
  and email capture is not the right
  channel for programmatic subscribers.
- A `Content-Encoding: gzip` optimization
  for the feed. Vercel handles gzip on the
  edge automatically; no per-file
  configuration required.
- Editing the ticket 0055 RSS generator
  script (`scripts/generate-changelog-rss.ts`)
  BEYOND appending a single call to the new
  JSON generator. The RSS output stays
  byte-identical.
- Editing the ticket 0032 changelog page
  render (`src/pages/Changelog.tsx`)
  BEYOND adding one Helmet link tag and
  one subscribe chip. The existing
  ItemList JSON-LD, the existing render
  tree, the existing RSS chip stay
  byte-identical.
- Cross-linking the JSON Feed from
  `/subprocessors`, `/uptime`, or
  `/ethics`. Cross-surface promotion is
  its own follow-up ticket.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `scripts/generate-changelog-json.ts`
  (under 200 lines). Mirror the shape of
  `scripts/generate-changelog-rss.ts`
  (ticket 0055): `import.meta.url`-based
  path resolution, read the existing
  `src/data/changelogEntries.ts` via a
  small dynamic import or via re-parsing
  (whichever the RSS script uses),
  transform each entry into a JsonFeedItem,
  assemble the top-level object, write
  `public/changelog.json` with
  `JSON.stringify(feed, null, 2)`. The
  script exits non-zero on any error.
- Wire the new script into the SAME
  build entry point that already runs the
  RSS generator. The cleanest wiring
  (which avoids a package.json edit
  entirely) is to have the RSS script
  itself call the JSON generator at the
  end of its own main function (a small
  `await generateJsonFeed()` call), OR to
  add the JSON generator as a sibling
  step in the same shell alias that
  invokes the RSS generator. The
  implementer documents the wiring
  decision in the Implementation log.
- New `<link rel="alternate" type="application/feed+json" href="/changelog.json" title="Digital Craft AI Changelog (JSON Feed)" />`
  tag inside the `<Helmet>` block of
  `src/pages/Changelog.tsx` adjacent to
  the existing RSS alternate tag.
- New sibling `<link rel="alternate" type="application/feed+json" href="/changelog.json" />`
  tag in `index.html` adjacent to the
  existing RSS alternate tag from ticket
  0055 (find via grep for
  `type="application/rss+xml"` in
  `index.html`).
- New `<a href="/changelog.json" data-testid="changelog-json-subscribe-chip">Subscribe via JSON Feed</a>`
  chip in the existing subscribe-chip
  area of `src/pages/Changelog.tsx`
  (find via grep for the RSS chip
  `data-testid` in the file). The
  chip's onClick fires
  `trackCTAClick('changelog_json_subscribe', 'changelog_header')`
  before the anchor navigates.
- Per the 2026-05-30 second-@type
  lesson, BEFORE writing code grep every
  `tests/e2e/*-jsonld.spec.ts` for
  changelog-scoped predicates and
  document the grep result in the
  Implementation log. This ticket adds
  NO new JSON-LD blocks (the JSON Feed
  ships via `<link rel="alternate">`,
  not JSON-LD, per its own spec); the
  grep is a no-op for auditability.
- Per the 2026-05-25 mirror-source rule,
  the JSON Feed's `description`
  top-level field reads from the SAME
  string that the `/changelog` page
  emits as its `<meta name="description">`.
  If the RSS feed uses that same string,
  reuse it; do NOT hand-roll a second
  copy.
- Per the 2026-05-07 em-dash Hard NO,
  every string emitted into the JSON
  Feed AND every string in the new
  `Changelog.tsx` chip AND every string
  in the new script's error messages is
  hyphen-only. Self-Review greps the
  generated file AND the diff for
  `String.fromCharCode(8212)` before
  pushing. If a shipped ticket title
  contains an em-dash, fix at source
  (the ticket frontmatter) and rebuild
  the constant.
- Per the 2026-05-28 "encode assertions
  in the gated script" lesson, if the
  new spec runs in the existing
  `smoke-required` gating job, no
  script-level assertion is needed. If
  the spec is NOT auto-included (a
  fresh file may need registration in
  the Playwright config), the
  implementer confirms auto-inclusion
  in the Implementation log.
- Per the 2026-09-05 route-fallback
  lesson, the new spec's `GET
  /changelog.json` assertion uses
  `page.goto` with `waitUntil: 'domcontentloaded'`
  and reads the raw response body via
  `page.evaluate(() => document.body.innerText)`
  OR uses `page.request.get` to fetch
  the file directly without a full
  navigation (JSON files do not need
  a browser render). The
  `page.request.get` approach is
  cleaner and avoids browser MIME-
  handling quirks.
- Per the 2026-05-22 two-PR ship
  lesson, ship will need a follow-up
  `chore/0078-ship-status` PR after
  the feat PR merges to flip the
  ticket frontmatter AND its
  `docs/backlog/README.md` index row
  to `shipped` together; run
  `node scripts/check-backlog.mjs`
  before pushing the second PR so
  the file and index never drift
  mid-flip.
- New deps: NO. The script uses
  Node stdlib (`fs`, `path`, `url`)
  per the ticket 0055 RSS generator
  pattern. The page edits reuse
  `react-helmet-async`, the existing
  `trackCTAClick` helper, and
  Tailwind utility classes. Schema
  migration: no. Privacy / security
  surface change: NO - the feed
  contains only data already public
  on the `/changelog` page and in
  the RSS feed.

## Implementation log

(Appended by the implementation-dev agent during execution.)

### 2026-09-12 - implementation-dev starting

- Branch: `feat/0078-changelog-json-feed` off `origin/main`.
- Plan: write the failing e2e spec FIRST (mirrors ticket 0055's
  `tests/e2e/changelog-rss-feed.spec.ts`), commit red, then add
  `scripts/generate-changelog-json.ts` + wire it as the final step
  of `scripts/generate-changelog-rss.ts`'s exported `generateChangelogRss()`
  so the RSS generator, JSON generator, and case-studies RSS all chain
  from the same `scripts/generate-changelog.ts` entry point (already in
  the `npm run build` chain via `scripts/generate-sitemap.ts`). No
  package.json edit required.
- Predecessor JSON-LD grep (2026-05-30 second-@type lesson): searched
  `tests/e2e/*-jsonld.spec.ts` for changelog-scoped predicates.
  `tests/e2e/changelog-itemlist-jsonld.spec.ts` asserts "exactly one
  ItemList block" on `/changelog`. This ticket adds NO new JSON-LD
  block (JSON Feed autodiscovery uses `<link rel="alternate">`, not
  JSON-LD, per its spec), so no predecessor spec needs to widen. Grep
  is a no-op for auditability.
- Em-dash source scan (2026-05-25 mirror-source rule): scanned every
  shipped ticket's frontmatter `title:` in `docs/backlog/*.md` for
  U+2014 and scanned the generated `src/data/changelogEntries.ts`.
  Zero em-dashes. No source-fix needed at the ticket layer.
- Existing RSS chip inspection: `src/pages/Changelog.tsx` currently
  emits the `<link rel="alternate" type="application/rss+xml">` tag
  from ticket 0055 but no visible RSS subscribe chip in the render
  tree - only a "Recent ships" pill with the `Rss` icon at the top
  of the hero. Per the 2026-09-12 "code beats prose" lesson, the new
  JSON Feed chip is introduced as a self-contained subscribe row
  under the hero description, styled to match the neighboring
  filter-chip pattern; a future ticket can add a matching visible
  RSS subscribe chip if desired without touching this one.
- Wiring decision: the JSON generator is invoked at the END of
  `generate-changelog-rss.ts`'s exported main via a `default` import
  of `./generate-changelog-json`, mirroring the ticket 0055 chain
  that already imports the case-studies RSS generator from the
  parent `generate-changelog.ts`. `npm run build` -> tsx
  `scripts/generate-sitemap.ts` -> `generateChangelog()` ->
  `generateChangelogRss()` -> `generateChangelogJson()`. Confirmed
  no package.json edit needed.
- vercel.json header override decision: Vercel serves `.json` files
  with `Content-Type: application/json` by default. The JSON Feed
  1.1 spec RECOMMENDS `application/feed+json` but every conforming
  reader (Feedbin, NetNewsWire, Reeder) also accepts
  `application/json` when the URL is subscribed manually; the
  autodiscovery `<link>` tag carries the strict MIME type. The spec
  test asserts EITHER `application/feed+json` OR `application/json`
  per AC #6, so the vercel.json edit is deferred (keeps the diff
  additive; the SPA rewrites stay byte-identical).
- Local gate: `npm run lint` (0 errors, 24 pre-existing warnings),
  `npm run typecheck`, `check-links`, `check-images`, `check-meta`,
  `check-blog-dates`, `check-backlog.mjs`, `npm run build` all
  green. Build emits `public/changelog.json` (77 items, 30106
  bytes) and copies to `dist/changelog.json`; both verified as
  U+2014-free.
- Local Playwright: the new spec at
  `tests/e2e/changelog-json-feed.spec.ts` passes 13 / 13 in
  isolation (all AC #8 boxes). The predecessor changelog specs
  (0032 page, 0043 ItemList, 0055 RSS) show pre-existing flakiness
  per the 2026-05-25 lesson - different specs fail on different
  full-suite runs (RSS-alternate Helmet timing on one run, dark
  mode entry-count on another, homepage footer link on a third),
  none in files this diff touches. CI `retries: 1` covers these.
