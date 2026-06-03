---
id: 0032
title: Public /changelog page surfacing weekly ship velocity to crawlers and repeat visitors
status: groomed
priority: P2
area: content
created: 2026-06-03
owner: gtm-innovation
---

## User story

As a returning prospect who saw the site three weeks ago and wants
to know whether the team is actually shipping, AND as Google's
freshness crawler looking for a recency signal on the domain, I want
a public `/changelog` page that lists the last 12 weeks of shipped
backlog tickets (id, short title, date) sourced from
`docs/backlog/README.md` plus the shipped-ticket frontmatter, so
that "is this team alive" stops requiring a LinkedIn check and
Google has one fresh, dated, internally-linked page per week to
re-crawl.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the data already exists. The
backlog at `docs/backlog/` contains 29 shipped ticket files with
`status: shipped` and a `created:` date in their frontmatter, plus
a README index that orders them. Today none of that is public; a
returning prospect or a brand-name search has no way to see "Digital
Craft AI shipped 4 features last week." One static page that reads
the same `docs/backlog/*.md` files at BUILD time (via a small
`scripts/generate-changelog.ts` invoked from the existing
`scripts/generate-sitemap.ts` pattern) and emits a typed
`changelogEntries` constant the page renders is under 200 lines of
diff and zero new runtime data sources. The page is static, indexed
crawlable copy.

### Stakeholder

This deepens both the content moat and the SEO moat at zero
ongoing-content cost. SEO: a `/changelog` route updated on every
backlog ship gives Google a high-frequency `lastmod` signal on the
domain (the ticket 0022 `lastmod` infra already exists; this page
adds a new URL the existing emitter picks up). Content: a public
ship log is the single most credible "team is shipping" signal a
B2B vendor can publish, and it requires no new authored copy
beyond the ticket titles that already exist. The same data also
feeds a future RSS feed or a homepage "What's new" widget if a
follow-up ticket wants them; this ticket only ships the page.

### Visitor (in the real moment of use)

A construction owner who skimmed the site three weeks ago and got
distracted opens `/changelog` from the footer link on a phone. They
see a clean reverse-chronological list grouped by month: "June 2026
- 4 ships" expands to four rows naming the ticket, a one-line
description, and the date. One tap on a row that says "Shareable
voice-call summary link" jumps them to the voice-negotiator demo
that produced the artifact. The page renders in light and dark mode,
needs no scroll on first viewport to see the latest two months, and
contains zero hype copy.

### Growth

The "show me" moment is the link a salesperson can paste in a
follow-up: "We've shipped 12 things since we last talked - here's
the list." That artifact (a dated, scannable, dark-mode-clean
public ship log) is the single piece of evidence a B2B prospect
weighs to decide whether a vendor will still be around in six
months. Each backlog ship also gives Google a fresh URL with a real
`lastmod` for the existing sitemap-recrawl signal (ticket 0022),
which compounds the SEO win over time. The page also fires
`trackCTAClick('changelog_demo_jump', '<ticketId>')` on any
demo-row click so we can see whether the page actually drives
demo opens from returning visitors.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new `scripts/generate-changelog.ts` (new file, under 120 lines) reads every `docs/backlog/*.md` file at build time, parses the YAML frontmatter (`id`, `title`, `status`, `area`, `created`), filters to `status === 'shipped'`, sorts by `created` descending, and writes a typed `src/data/changelogEntries.ts` (gitignored or committed; the implementer picks ONE and documents the choice in the Implementation log). The script is wired into `npm run build` BEFORE `vite build`, mirroring the existing `npx tsx scripts/generate-sitemap.ts` invocation (per the 2026-05-28 inline-assertion-in-the-gated-script lesson, so the script can encode its own assertions: no entry with a missing `created`, no `created` in the future, no duplicate `id`).
- [ ] A new `src/pages/Changelog.tsx` (new file, under 160 lines) renders a public page at `/changelog` that imports `changelogEntries` and lists every entry grouped by month-year (e.g. "June 2026"). Each entry row shows the ticket id (e.g. `0029`), the title, the area chip (`demos`, `seo`, `content`, `trust`, `conversion`, `infra`, `perf`), the `created` date formatted as `YYYY-MM-DD`, and a small "Try the demo" link IF the entry's `area === 'demos'` (the link points at the first demo route in `KNOWN_PATHS` whose path contains a substring matching the ticket title, or omits the link if no match). The page uses the same `Helmet` + `Navbar` + `Footer` shell as `src/pages/Trust.tsx` (ticket 0018), the same `useContent()` pattern, and the same canonical/OG/description meta tags.
- [ ] The page caps the visible list at the last 36 entries (about 12 weeks of typical ship cadence). Older entries are not rendered (keeps the page light); the cap is a `const VISIBLE_LIMIT = 36` at module top so the implementer can bump it later without a code review. A `data-testid="changelog-entry"` attribute is present on every rendered row so the e2e spec can count them.
- [ ] `/changelog` is registered in `src/App.tsx` next to the other top-level content routes (near `/trust`, `/glossary`). The sitemap generator picks up the new route automatically; the new entry inherits the `lastmod` infra from ticket 0022 so each backlog ship bumps the page's freshness signal.
- [ ] The footer's existing link block in `src/components/Footer.tsx` gains one new `<Link to="/changelog">Changelog</Link>` entry near the existing `Trust` or `Glossary` link (one-line edit, no restructure of the footer column). Clicking the footer link fires `trackCTAClick('open_changelog', 'footer')` per the existing footer analytics pattern.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text (every ticket title in the backlog has already been brand-voice-checked per the 2026-05-07 Hard NO, but the spec asserts the rendered DOM contains no `U+2014` code point anyway), and every ticket-row `Try the demo` link resolves to a route in `KNOWN_PATHS` from `src/utils/recentDemosStore.ts` (the same allow-list ticket 0026 and 0027 use, so a stale entry cannot strand a dead link).
- [ ] The new e2e spec at `tests/e2e/changelog-page.spec.ts` navigates to `/changelog`, asserts at least 10 entries are rendered (the backlog has 29 shipped today so this is a safe floor), asserts the footer link points at `/changelog`, asserts dark-mode renders cleanly, asserts no `U+2014` code point in `page.textContent('main')` (use `String.fromCharCode(8212)` in the assertion), and asserts the `lastmod` for `/changelog` in `public/sitemap.xml` updates when the generator script runs (the existing ticket 0022 sitemap-lastmod assertion pattern, encoded inline in `scripts/generate-sitemap.ts` per the 2026-05-28 lesson).
- [ ] No new hostnames, no `/api/` change, no new npm dependency (the frontmatter parse uses a minimal hand-rolled YAML-front-matter regex or imports the existing `gray-matter`-equivalent already in the repo - the implementer greps `package.json` to confirm; if no such dep exists, the parse is a hand-rolled `--- ... ---` reader, NOT a new dependency). `node scripts/check-backlog.mjs` stays green, `npm run check-links` stays green, `npm run check-meta` stays green, `npm run typecheck` stays clean.

## Out of scope

- Adding RSS or Atom feed output. A future ticket can layer that on
  top of `src/data/changelogEntries.ts` once the page exists; it is
  not required to ship a useful public ship log.
- Personalizing the changelog by vertical (showing only demos for
  the visitor's detected industry). The full reverse-chronological
  list is the credible artifact; filtering it dilutes the "look
  how much we ship" signal.
- A "Subscribe to changelog" email capture. Email captures already
  exist via tickets 0002 and 0015; adding a third capture surface
  is noise. A future ticket can wire one if usage justifies it.
- Editing the ticket files themselves to add a `summary` or
  `userVisibleSummary` frontmatter field. The page uses `title` and
  the four-lens "Why now" `User` section is too long to render
  inline; the page renders only the title. A future ticket can add
  a `changelog_summary` frontmatter if titles prove too terse.
- Rendering rejected tickets or `proposed` / `groomed` tickets.
  Only `status: shipped` ships on the public page. Rejected
  tickets stay in their files for archive value but do not surface
  publicly.
- A schema.org `ItemList` or `Article` block for the changelog
  entries. The page is content-style, not a list of products; a
  schema add is its own ticket if SEO impact analysis later
  justifies it.
- Documenting the changelog on `/trust`. The page reads only
  already-public ticket titles and dates; nothing new about the
  data flow needs disclosure.
- Linking from the homepage hero or top navbar. The footer link is
  enough; promoting it higher is a follow-up A/B test once we
  measure baseline traffic.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `scripts/generate-changelog.ts` (under 120 lines). Reads every
  `docs/backlog/*.md` file with `fs.readdirSync` + `fs.readFileSync`,
  parses the YAML frontmatter between the leading `---` and the
  next `---` line with a small hand-rolled regex (the existing
  scripts already do similar parses; grep `scripts/` for
  `frontmatter` or `^---` patterns to find the precedent), filters
  to `status: shipped`, sorts by `created` descending, validates
  `created` is a real `YYYY-MM-DD` and not in the future, and writes
  the resulting array to `src/data/changelogEntries.ts` as a typed
  exported constant. Encode the validation assertions INSIDE the
  script per the 2026-05-28 inline-assertion-in-the-gated-script
  lesson: a malformed entry throws and fails `npm run build`. Save
  a `.broken` artifact on validation failure for debugging per the
  same lesson.
- Wire the new script into `npm run build` BEFORE `vite build`,
  next to the existing `npx tsx scripts/generate-sitemap.ts` call.
  Look in `package.json` `scripts.build` for the existing shell
  string; ADD `npx tsx scripts/generate-changelog.ts && ` in front
  of the existing build chain. NOTE: this edits `package.json` ONLY
  IF the build script chain is in `package.json`. Per the AGENTS.md
  Hard NO, the GTM queue CANNOT touch `package.json`. If the build
  chain lives in `package.json`, this ticket MUST instead invoke
  the changelog generator from the EXISTING
  `scripts/generate-sitemap.ts` (which is already in the build
  chain) by having that script call into a `generateChangelog()`
  function exported from `scripts/generate-changelog.ts`. The
  implementer documents which path was chosen in the Implementation
  log. The 2026-05-28 lesson explicitly covers this scenario: when
  a build-time invariant cannot be added without touching
  `package.json`, inline it into an already-gated script.
- New `src/pages/Changelog.tsx` (under 160 lines). Model the page
  on `src/pages/Trust.tsx` (ticket 0018) exactly: `Helmet` head,
  `Navbar` at the top, `ScrollProgress`, jump-nav by month-year id,
  `<Footer data={content.footer} />` via `useContent()`. The page
  imports `changelogEntries` from `src/data/changelogEntries.ts`
  (generated at build time), groups entries by `created.slice(0, 7)`
  (e.g. `2026-06`), and renders each group with a month-year
  heading and a list of entry rows. Apply `dark:` Tailwind variants
  on every new class per the AGENTS.md Hard NO.
- `src/App.tsx` - register `<Route path="/changelog" element={<Changelog />} />`
  next to the existing `/trust` and `/glossary` routes. The
  sitemap generator (per ticket 0022) picks up the new route
  automatically and emits a `lastmod` from today's commit date.
- `src/components/Footer.tsx` - one-line addition of a
  `<Link to="/changelog">Changelog</Link>` near the existing
  `Trust & Privacy` link, with the same `onClick` analytics pattern
  the other footer links use. This is the only edit to the footer.
- The 2026-05-25 mirror-source lesson applies in two places:
  (1) the changelog page reads from `src/data/changelogEntries.ts`,
  which is itself derived from `docs/backlog/*.md` at build time -
  the backlog files remain the single source of truth, and any
  drift between them and the page is caught by the script's own
  assertions; (2) the `Try the demo` link's match against
  `KNOWN_PATHS` in `src/utils/recentDemosStore.ts` ensures the
  page cannot render a dead link to a renamed demo.
- The 2026-05-25 SEO Pilot lesson applies: `/changelog` is not
  in the `index.html` SEO Pilot `pages` table, so
  `document.title` on SPA navigation will fall back to the homepage
  title. The new e2e spec MUST assert the Helmet-managed
  `meta[name="description"]` content directly, NOT
  `page.toHaveTitle()`. Adding `/changelog` to the SEO Pilot
  table is its own SEO concern, out of scope here.
- The 2026-05-30 "second @type instance" lesson is not directly
  triggered (this ticket emits no JSON-LD). If the implementer
  decides to add a `WebPage` or `CollectionPage` schema for the
  changelog, they MUST grep `tests/e2e/*-jsonld.spec.ts` for
  matching `@type` predicates over the page's parent routes first.
  Default posture: no new JSON-LD.
- Per the 2026-05-07 em-dash Hard NO, the page chrome copy ("Recent
  ships", "Try the demo", etc.) uses hyphens. The ticket titles
  themselves are sourced from the backlog files where the brand-
  voice gate already ran at ship time; the e2e spec asserts no
  `U+2014` code point appears in the rendered text as a
  defense-in-depth check.
- `tests/e2e/changelog-page.spec.ts` (new) - one spec per
  acceptance box. Page-renders case: navigate to `/changelog`,
  assert the heading is visible, count at least 10
  `data-testid="changelog-entry"` rows. Footer-link case: navigate
  to `/`, click the footer `Changelog` link, assert URL changes to
  `/changelog`. Dark-mode case: apply
  `document.documentElement.classList.add('dark')` and assert the
  page renders. No-em-dash case: read `page.textContent('main')`
  and assert no `U+2014` code point. Sitemap-lastmod case: read
  `public/sitemap.xml`, assert a `<url>` entry exists for
  `/changelog` AND a `<lastmod>` is present, mirroring the
  ticket-0022 sitemap-lastmod assertion pattern.
- Per the 2026-05-22 two-PR ship lesson, ship will need a follow-up
  `chore/0032-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter AND its `docs/backlog/README.md` index row to
  `shipped` together; run `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index never drift mid-flip.
- New deps: NO. The frontmatter parse is hand-rolled; if a YAML
  parser is needed beyond the simple `---` frontmatter shape, the
  implementer extracts the existing `js-yaml` or `gray-matter` from
  the repo (grep `node_modules` and `package.json` to confirm
  presence). If neither exists, the parse stays hand-rolled. Per
  the AGENTS.md Hard NO, the GTM queue cannot touch `package.json`.
  Schema migration: no. Privacy/security surface change: no - the
  page reads only public backlog metadata already published in
  the GitHub repo.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0032-...` opened
- YYYY-MM-DD - failing test added in `tests/e2e/changelog-page.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
