---
id: 0055
title: Generate a public /changelog/rss.xml feed of shipped tickets so feed readers and SEO crawlers subscribe to the ship velocity
status: groomed
priority: P2
area: content
created: 2026-06-15
owner: gtm-innovation
---

## User story

As a returning prospect (a construction-software buyer who
toured the demos six weeks ago, a real-estate investor who
told their partner "wait for them to ship a deal-analyzer
tweak"), as a tech-curious peer (a competing AI-services
agency tracking the cadence of what Digital Craft ships per
week to benchmark their own), and as a feedreader-using SEO
crawler (Feedly, Inoreader, the FreshRSS instances thousands
of operators run on their NAS), I want to subscribe to a real
RSS feed at `/changelog/rss.xml` that lists the most recently
shipped tickets with their title, area, ship date, and a
permalink back to the `/changelog` page anchor, so that I do
not have to manually re-check `/changelog` every Monday
morning to learn that ticket 0046 (shareable ROI calculator)
shipped on 2026-06-11 and that the next thing I should try
on the site is `/roi`.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the changelog data is
already auto-generated. `scripts/generate-changelog.ts` (run
at build time, output `src/data/changelogEntries.ts`) reads
every shipped ticket frontmatter from `docs/backlog/*.md` and
emits a typed `changelogEntries: readonly ChangelogEntry[]`
constant carrying `id`, `title`, `area`, `created` per
ticket. The existing blog-RSS generator (`scripts/generate-rss.ts`,
output `public/rss.xml`) reads `src/data/blogPosts.ts` and
emits a standards-compliant RSS 2.0 feed with `<atom:link>`,
`<channel>`, `<item>`, `<pubDate>`, `<link>`, `<guid>`,
escaped XML. This ticket combines the two: write a new
sibling script `scripts/generate-changelog-rss.ts` that
reads `src/data/changelogEntries.ts` (the already-generated
constant) and writes `public/changelog/rss.xml` using the
same XML-escape and RSS-2.0 shape as the blog generator. No
new data shape, no new parser, no new dependency, no edit to
the existing blog-RSS file. The script runs as part of
`npm run build` by being invoked from the same build glue
that already runs `generate-changelog.ts` and
`generate-rss.ts` before `vite build`.

### Stakeholder

This widens the moat in a specific and durable way: a public
RSS feed of ship velocity is the single cheapest signal to a
peer-watching audience (competing AI-services agencies,
prospect engineering leads, SEO crawlers that index feed
URLs differently than HTML pages). Ticket 0032 shipped the
`/changelog` page for human visitors; ticket 0043 added
ItemList JSON-LD so Google can index individual entries; this
ticket adds the feedreader surface so the audience that
prefers to subscribe instead of bookmark gets a first-class
read. The Out of Scope of ticket 0043 explicitly named this
work: "Emitting an RSS feed for `/changelog`. The site
already generates `public/rss.xml` for blog posts via
`scripts/generate-rss.ts`; a changelog-specific feed is its
own ticket once SEO telemetry shows feedreader subscription
demand or once a peer-discovery audience materializes." This
is pre-authorized follow-up work per the 2026-05-22
"bootstrap pre-authorized follow-ups" lesson, not
speculative grooming. The feed also doubles as a sitemap
signal: search engines treat `application/rss+xml` URLs as
ping-able update streams and recrawl pages referenced from
fresh feed items faster than they recrawl the parent HTML.
Pairing the feed with the existing ItemList JSON-LD on
`/changelog` means a freshly shipped ticket gets THREE
discovery paths within minutes of merge: HTML page render,
JSON-LD ItemList entry, RSS feed item.

### Visitor (in the real moment of use)

A peer-agency engineering lead who saw a Hacker News post
about Digital Craft six months ago wants to know "are they
still shipping?" They open Feedly, paste
`https://digitalcraftai.com/changelog/rss.xml`, and see the
most recent 30 shipped tickets with title, area, ship date,
and a deep link to the `/changelog#0046` anchor of the
specific ticket. Two clicks later they are looking at the
ROI calculator on `/roi`. A returning prospect who used the
quiz in March opens the same feed from FreshRSS on their
NAS over morning coffee, sees that ticket 0052 (shareable
quiz tier deep-link) shipped on 2026-06-13, taps through to
`/changelog#0052`, and books a strategy call to ask "is the
share-link how you would set up our internal lead-routing
demo?" Both visitors experience the feed as a low-friction
"subscribe to the cadence" surface, not as another page to
remember to check.

### Growth

The "show me" moment is the screenshot a returning prospect
sends to their VP of operations: "this is the cadence they
ship at, just in the last 30 days." The feed makes the
cadence quantifiable and forwardable in a way the
`/changelog` HTML page cannot, because RSS items carry a
machine-readable `<pubDate>` and a stable `<guid>`. The feed
URL is also a measurable acquisition lever: SEO tooling
(Ahrefs, Semrush) indexes feed URLs separately and the
unique referrer string of feedreader-originated traffic
(Feedly's `Mozilla/5.0 ... Feedly/` UA) is filterable in
GA, so the feedreader audience can be measured and the
cost-per-feedreader-subscription compared against the
cost-per-organic-search-visit. Per the ticket 0043 / 0032
precedent, a public artifact that the buyer can audit
without a login is the cheapest acquisition lever the site
has.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new script `scripts/generate-changelog-rss.ts` (under 110 lines) reads `src/data/changelogEntries.ts` (already auto-generated by `scripts/generate-changelog.ts`, ticket 0032), maps each entry to a standards-compliant RSS 2.0 `<item>` block with `<title>` (the ticket title), `<link>` (`https://digitalcraftai.com/changelog#<id>`), `<guid isPermaLink="true">` (same as `<link>`), `<pubDate>` (the entry's `created` date converted to RFC 822 via the same pattern the blog RSS generator uses), `<description>` (a one-line summary built from the area + ship date, NOT the ticket title repeated), and `<category>` (the area string: `conversion`, `seo`, `content`, `trust`, `demos`, `infra`, `perf`). The script writes the output to `public/changelog/rss.xml` (a new file in a new subdirectory) and prints a one-line confirmation matching the existing blog generator's `console.log(\`RSS feed generated with \${count} entries -> public/changelog/rss.xml\`)` style (no em-dash, hyphen-arrow only).
- [ ] The script's XML output uses the same escaping helper shape as `scripts/generate-rss.ts:42-49` (`escapeXml` replacing `&`, `<`, `>`, `"`, `'` in that order). The implementer extracts the escape helper into a NEW shared util `scripts/lib/escapeXml.ts` (under 20 lines) so both generators read from one definition per the 2026-05-25 mirror-source rule; the existing `generate-rss.ts` is edited in the SAME PR to import the helper from the shared file (one line removed, one line added, same behavior). If extracting the helper is structurally awkward (e.g., the existing generator inlines other helpers that block clean extraction), inline the escape function verbatim in the new script with an HTML comment naming this lesson and a TODO citing the 2026-05-25 mirror-source rule; do NOT touch `package.json` to add an XML library.
- [ ] The script is invoked from `npm run build` so the feed file is regenerated on every production build. Per the 2026-05-28 "encode assertions in the gated script" lesson, the script ALSO emits a post-write assertion block at the bottom that throws if (a) the output file is empty, (b) any `<item>` block is missing one of the six required child tags (`title`, `link`, `guid`, `pubDate`, `description`, `category`), or (c) the output contains a `U+2014` em-dash character anywhere. A violation prints the offending entry id and exits with code 1, failing both the local `npm run build` AND the CI `build` gating job with no new dependency or test framework.
- [ ] The build glue (`package.json` `"scripts": { "build": "..." }` chain) is NOT touched by this ticket per the AGENTS.md Hard NO. Instead, the new script is invoked from `scripts/generate-changelog.ts` (which IS already in the build chain) at the END of its main function via `await import('./generate-changelog-rss.ts').then((m) => m.default())`; the existing generator stays as the entry point and the new generator runs as its sibling. The new script exports a default async function so the dynamic import call site is stable. If the dynamic import is awkward in the existing generator's module style (CommonJS vs. ESM mismatch with `tsx`), the implementer instead adds a single `import './generate-changelog-rss'` import line at the top of `generate-changelog.ts` as a static side-effect import; either approach is acceptable as long as `npm run build` fires both generators and the order is deterministic (changelog data is written first, the feed reads it second).
- [ ] The new feed file `public/changelog/rss.xml` is created by the script (the new `public/changelog/` directory is committed as a new directory with the rss.xml file inside; no `.gitkeep`). The file is plain XML, content-type `application/rss+xml; charset=utf-8` when served by Vercel's default content-type detection on `.xml` files. The feed's `<channel>` block carries `<title>Digital Craft AI Changelog</title>`, `<link>https://digitalcraftai.com/changelog</link>`, `<description>Recently shipped features and improvements on Digital Craft AI.</description>`, `<language>en-us</language>`, and `<atom:link href="https://digitalcraftai.com/changelog/rss.xml" rel="self" type="application/rss+xml"/>` per the existing blog RSS shape.
- [ ] The `/changelog` HTML page (`src/pages/Changelog.tsx`) gets ONE additive edit (under 6 added lines) to add a `<link rel="alternate" type="application/rss+xml" title="Digital Craft AI Changelog" href="/changelog/rss.xml" />` inside the existing `<Helmet>` head so browsers and feedreaders auto-discover the feed from the page. The visible page render is byte-identical otherwise; no copy edit, no JSON-LD edit (the ticket 0043 ItemList block stays as shipped), no layout change.
- [ ] A new spec at `tests/e2e/changelog-rss-feed.spec.ts` asserts: (1) `GET /changelog/rss.xml` returns 200 and content-type contains `xml`, (2) the response body parses as XML and has exactly one `<channel>` block, (3) the channel has `<title>`, `<link>`, `<description>`, `<language>`, and an Atom `<atom:link rel="self">` self-link, (4) there is at least one `<item>` block and each item has the six required children, (5) every `<pubDate>` parses as a valid Date, (6) every `<link>` matches `/^https:\/\/digitalcraftai\.com\/changelog#\d{4}$/` (the four-digit ticket id), (7) the response body contains zero `U+2014` em-dash code points, and (8) the `/changelog` HTML page contains the `<link rel="alternate" type="application/rss+xml">` tag pointing to the feed URL.
- [ ] No `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json` (per the 2026-05-28 lesson the assertions live inside the script that the gate already runs), no edits to `src/data/changelogEntries.ts` (the file is auto-generated; the new script CONSUMES it, never writes to it), no edits to the existing `scripts/generate-rss.ts` blog generator beyond the optional one-line escape-helper import per AC #2. `node scripts/check-backlog.mjs`, `npm run check-links` (the new link rel=alternate is local), `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run build` all stay green. The new spec passes; every pre-existing spec stays green; the existing `tests/e2e/changelog-itemlist-jsonld.spec.ts` (ticket 0043) and `tests/e2e/changelog-page.spec.ts` (ticket 0032) stay green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- Adding a feed-discovery icon (the orange RSS button) in
  the page footer or the navbar. The `<link rel="alternate">`
  in the Helmet head is the standards-compliant discovery
  mechanism; a visible UI icon is a separate UX ticket
  once telemetry shows feedreader-originated traffic
  warrants the surface.
- An Atom feed at `/changelog/atom.xml` in addition to RSS.
  RSS 2.0 is the universal lowest common denominator and
  every feedreader supports it; an Atom variant is a
  follow-up ticket once subscriber telemetry shows demand
  for the more-modern format.
- A JSON Feed variant at `/changelog/feed.json`. Same
  rationale as Atom: future ticket once telemetry warrants.
- Cross-promoting the feed from `/uptime` or `/trust` or
  the homepage footer. Cross-surface promotion is its own
  ticket once feedreader-originated traffic is measurable.
- A per-area feed (`/changelog/seo.xml`, `/changelog/conversion.xml`).
  The combined feed is the canonical surface; per-area
  filtering is something a feedreader does client-side
  via the `<category>` tag the items already carry.
- A feed-validation rich snippet on the `/changelog`
  page (a "Subscribe via RSS" link target). The
  `<link rel="alternate">` is sufficient for auto-
  discovery and visible discovery is the same UX-icon
  ticket above.
- An email-digest subscribe form on the `/changelog`
  page. The five existing email-capture surfaces
  (tickets 0002, 0015, 0033 plus the quiz and the
  ROI calculator) already cover the digest funnel;
  a sixth is noise per the ticket 0036 closure rule.
  The RSS feed IS the no-email subscribe path by
  design.
- Adding `/changelog/rss.xml` to the index.html SEO
  Pilot pages table. The SEO Pilot owns HTML page
  titles; the RSS feed is XML, not HTML, and is
  unrelated per the 2026-05-25 SEO Pilot lesson.
- Internationalization (a `xml:lang` per-item field on
  every entry). The whole feed is `<language>en-us</language>`
  at the channel level; per-item lang is overkill.
- Adding the RSS feed URL to `sitemap.xml`. Sitemap
  is for HTML page URLs; feeds advertise themselves
  via the `<link rel="alternate">` discovery
  mechanism and are not page URLs.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `scripts/generate-changelog-rss.ts` (under 110
  lines). Mirror the shape of `scripts/generate-rss.ts`
  end-to-end. Imports: `readFileSync, writeFileSync`
  from `fs`, `join, dirname` from `path`,
  `mkdirSync` from `fs` for the new
  `public/changelog/` directory creation. Read from
  `import { changelogEntries } from '../src/data/changelogEntries'`
  (the auto-generated constant from ticket 0032), map
  to RSS items, write to `public/changelog/rss.xml`.
  Export a default async function so the existing
  `scripts/generate-changelog.ts` can side-effect-
  import or dynamic-import it per the build-glue
  acceptance criterion.
- New `scripts/lib/escapeXml.ts` (under 20 lines).
  Extract the existing `escapeXml` helper from
  `scripts/generate-rss.ts:42-49` verbatim into a
  shared module so both generators read one source
  per the 2026-05-25 mirror-source rule. If extracting
  is structurally awkward (CommonJS / ESM mismatch
  with `tsx`), inline the helper verbatim in the new
  script with an HTML comment naming the lesson and
  a TODO.
- `scripts/generate-rss.ts` - one-line edit only if
  the helper is extracted: replace the inline
  `escapeXml` function with `import { escapeXml } from './lib/escapeXml'`.
  This is the ONLY edit to the existing blog
  generator; the rest of the file stays byte-
  identical.
- `scripts/generate-changelog.ts` - one-line additive
  edit only: add a static side-effect import or a
  trailing `await import(...)` call to invoke the new
  generator after the changelog data is written.
  Order matters (changelog data must exist before the
  feed reads it); the implementer documents the
  ordering choice in an HTML comment.
- `src/pages/Changelog.tsx` - one additive edit inside
  the existing `<Helmet>` head:
  `<link rel="alternate" type="application/rss+xml" title="Digital Craft AI Changelog" href="/changelog/rss.xml" />`.
  Place it next to any existing `<link rel="canonical">`
  for visual cohesion. No copy edit, no JSON-LD edit
  (the ticket 0043 ItemList block stays as shipped),
  no layout change.
- Per the 2026-05-28 "encode assertions in the gated
  script" lesson, the new generator emits a post-write
  assertion block at the bottom that throws on any of:
  - The output file is empty (`statSync(out).size === 0`).
  - Any `<item>` is missing one of the six required
    child tags (regex-check the written string).
  - The output contains `String.fromCharCode(8212)`.
  A violation prints the offending entry id (or the
  offending child tag) and exits with code 1, failing
  `npm run build` locally AND the CI `build` gating
  job. Save the broken artifact at
  `public/changelog/rss.xml.broken` for debugging per
  the 2026-05-28 lesson pattern.
- Per the 2026-05-07 em-dash Hard NO, every string in
  the new script (the channel title, the channel
  description, the per-item description template,
  every console.log call) uses hyphens. Self-Review
  greps the diff for `String.fromCharCode(8212)`
  before pushing. The new generator's post-write
  assertion is the second line of defense.
- `tests/e2e/changelog-rss-feed.spec.ts` (new) - one
  assertion per acceptance box. Use Playwright's
  `request.get` to fetch the dev server's
  `/changelog/rss.xml`, parse the body with
  `DOMParser` available in the Playwright Node
  context (or use a regex to extract per-tag content
  if DOM parsing is unavailable; do NOT add a new XML
  parser dependency). The `/changelog` HTML page
  `link rel=alternate` assertion uses
  `page.locator('link[rel="alternate"][type="application/rss+xml"]')`
  and asserts `href` ends with `/changelog/rss.xml`.
- Per the 2026-05-22 two-PR ship lesson, ship will
  need a follow-up `chore/0055-ship-status` PR after
  the feat PR merges to flip the ticket frontmatter
  AND its `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing
  the second PR so the file and index never drift
  mid-flip.
- New deps: NO. The script reuses `fs`, `path`, and
  the auto-generated `changelogEntries` constant.
  Schema migration: no. Privacy/security surface
  change: no - the feed is a derived view of
  already-public ticket data and emits no new
  network call. The /trust page disclosure list
  does NOT need an edit because no new persistent
  store is added and the feed contents are
  byte-identical to the already-public `/changelog`
  page.

## Implementation log

(Appended by the implementation-dev agent during execution.)
