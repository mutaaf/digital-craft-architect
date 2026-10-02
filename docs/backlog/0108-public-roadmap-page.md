---
id: 0108
title: Public /roadmap dated intended-ship-week page derived from groomed-status backlog tickets as a defensible moat artifact
status: groomed
priority: P1
area: trust
created: 2026-10-02
owner: gtm-innovation
---

## User story

As a buyer evaluating Digital Craft's forward velocity before committing
to a pilot (a construction GC's procurement lead whose onboarding packet
asks "what features is this vendor shipping in the next 60 days;" a
franchise VP whose CFO wants to see the vendor's dated near-term plan
before the first payment; a real-estate brokerage's IT lead whose vendor
checklist includes "a public roadmap with intended ship weeks;" a home-
services owner who already saw `/changelog` prove 100+ shipped tickets
and now wants to see what is NEXT), I want one public dated page at
`/roadmap` listing every currently-groomed backlog ticket with the
intended ship week and the "autonomous ship cadence" caveat, so that I
can cite a defensible forward posture to my committee alongside the
backward-looking `/changelog`, and I can hand the URL to my counsel as
evidence that the vendor's near-term work is itemized rather than
hand-waved as "quarterly priorities."

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the site now ships a public dated
`/changelog` page (ticket 0032) listing every shipped ticket, a public
dated changelog RSS feed (ticket 0055), a JSON Feed (ticket 0078), and
an OPML aggregator (ticket 0098) - a complete BACKWARD-looking surface
family. What is missing is the FORWARD-looking peer: a dated public page
that reads every `docs/backlog/*.md` ticket at build time, filters to
`status: groomed`, pairs each row with an "intended ship week" derived
from the ship cadence documented on `/how-we-ship` (ticket 0083), and
renders a dated hub. The generator pattern is already proven: ticket
0032's `scripts/generate-changelog.ts` reads frontmatter, validates
dates, and writes a typed `src/data/changelogEntries.ts` array that the
page component imports. Adding the forward sibling is exactly one new
build-time generator script (`scripts/generate-roadmap.ts` modeled 1:1
on the ticket 0032 generator but filtering to `status: groomed` and
`status: in-progress` instead of `shipped`), one new data file
(`src/data/roadmapEntries.ts`, auto-emitted and gitignored under a build
step that writes it in CI), one new page component (`src/pages/Roadmap.tsx`
modeled 1:1 on `src/pages/Changelog.tsx` from ticket 0032), one new
entry in `src/data/routes.ts`, one new route in `src/App.tsx`, one new
footer trust-chip link, one new cross-link chip on `/trust`, and one
new spec. Zero new backend, zero new dependency.

### Stakeholder

This widens the moat in a dimension no shipped trust artifact fully
addresses. Ticket 0032 `/changelog` and 0083 `/how-we-ship` describe
HOW the loop ships and WHAT has already shipped; ticket 0090
`/agent-fleet` describes WHICH agents run. None of the shipped trust
family names WHAT IS COMING NEXT, dated. A dated forward-looking
roadmap is the specific artifact a CFO or a procurement lead asks for
when they want to know whether the vendor's near-term plan matches their
timeline, and it is the artifact competitors are least likely to copy
because publishing a dated roadmap costs more than publishing a dated
changelog (you have to be comfortable with the shipping cadence missing
a week, visibly). Per the 2026-05-28 inline-assertion-in-the-gated-script
lesson, the roadmap generator script fails the local gate if a groomed
ticket is missing a `created` date, has an invalid `priority`, or has a
duplicate id; the page's defensible posture is therefore enforced at
build time, not promised in copy. Per the ticket 0094 / 0097 / 0102
precedent, the page emits CollectionPage plus ItemList plus
BreadcrumbList JSON-LD so search engines index it as a canonical
collection of dated rows. Competitors with a backend-stored roadmap
cannot match this with a markdown-only backlog because they have no
public groomed-queue source of truth. The forward posture is auditable:
every row cites its ticket file path (`docs/backlog/0106-...md`), its
priority, its area, and its "intended ship week" derived from a
deterministic function of the row's position in the groomed queue plus
the shipped-ticket cadence from `/how-we-ship`.

### User (in the real moment of use)

A construction GC's procurement lead sits down Thursday afternoon to
finish the vendor onboarding packet. Her checklist has a "near-term
roadmap with dated intended ship weeks" line. She opens
`digitalcraftai.com/roadmap` from the footer trust-chip cluster; the
page loads under one screen on her laptop with a hero H1 ("What We Are
Shipping Next"), a top-of-page "Generated: 2026-10-02" line, a one-
paragraph explainer naming the autonomous-ship cadence (one ticket per
hour on the ship loop per `/how-we-ship`, with a 1-5 ticket per week
realized cadence based on backlog depth and heal retries), and a
per-ticket table with columns: Ticket id, Title, Priority, Area,
Intended ship week, Status. Rows are grouped by priority (P1 first,
then P2) and sorted by ticket id within each priority group. A visible
caveat at the top: "Dates are a planning signal, not a commitment; the
autonomous ship loop reorders groomed tickets based on backlog depth,
heal rate, and reviewer blocks, so an intended ship week can slip or
accelerate." At the bottom, a "Shipped tickets live at /changelog" link
back to the backward-looking peer and a "How we decide what to ship next"
link to `/how-we-ship`. She copies the URL into her vendor packet and
moves on. Light and dark mode read cleanly; the mobile view stacks the
table columns per the ticket 0094 pattern.

### Growth

The "show me" moment is a procurement lead forwarding
`digitalcraftai.com/roadmap` to a peer with the note "this vendor is the
first small-shop I've seen with a public dated roadmap AND a public
changelog that lines up on the same timeline; approving the pilot." That
single forward is the shortest path from "we are a small AI vendor you
have not heard of" to "we cleared the forward-velocity gate that a
material fraction of your competitors cannot clear." The peer-share
signal is a second-order effect: procurement leads swap notes across
enterprise buyers, and a vendor with a dated public roadmap plus a
dated public changelog becomes a reference vendor in that informal peer
network. It also creates a measurable SEO signal: the page is a
canonical dated CollectionPage that Googlebot recrawls on its lastmod
cadence, widening the trust-artifact SEO cluster the site has been
building since ticket 0018.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests
against this list before writing code.

- [ ] A new build-time generator at `scripts/generate-roadmap.ts` (new file, under 220 lines) modeled 1:1 on `scripts/generate-changelog.ts` from ticket 0032. The generator reads every `docs/backlog/*.md` file, parses the YAML frontmatter with the same hand-rolled regex pattern (no new dependency per the GTM queue Hard NO), filters to `status === 'groomed'` or `status === 'in-progress'`, sorts by priority (P0 before P1 before P2 before P3) then by ticket id ascending within each priority group, validates every row (`id` 4-digit, `title` non-empty, `priority` in the set `{P0,P1,P2,P3}`, `area` in the set `{conversion,seo,content,trust,demos,infra,perf}`, `created` a valid `YYYY-MM-DD` not in the future), computes a deterministic `intendedShipWeek` for each row (ISO week of the Monday that is `queuePosition * 7` days after the first Monday on or after today's date, where `queuePosition` is the row's 0-indexed position in the sorted output), and writes a typed `src/data/roadmapEntries.ts` file with an exported `ROADMAP_GENERATED_AT` ISO date, `ROADMAP_CADENCE_NOTE` explainer string, and `ROADMAP_ENTRIES` readonly array. Per the 2026-05-28 inline-assertion-in-the-gated-script lesson, the script THROWS on validation violation and writes a `.broken` artifact; a thrown generator fails `npm run build` through the ticket 0032 chain (`generate-sitemap.ts` imports `generate-changelog.ts` which imports `generate-roadmap.ts` next to it, or a direct invocation added to the sitemap generator). The generator is wired into `npm run build` through the same chain `generate-changelog.ts` is wired into (no `package.json` edit, no new script entry).
- [ ] A new page at `src/pages/Roadmap.tsx` (new file, under 220 lines) modeled 1:1 on `src/pages/Changelog.tsx` from ticket 0032. The page renders (a) a hero H1 "What We Are Shipping Next", (b) a top-of-page "Generated: ${ROADMAP_GENERATED_AT}" line, (c) a one-paragraph explainer (`ROADMAP_CADENCE_NOTE`) naming the autonomous-ship cadence and the "dates are a planning signal, not a commitment" caveat, (d) a per-ticket table with columns Ticket id, Title, Priority, Area, Intended ship week, Status. One row per entry in `ROADMAP_ENTRIES`. Each row is a plain markdown row (no linked anchor to the ticket file since `docs/backlog/*.md` is NOT a public URL per the AGENTS.md "do not expose the backlog file paths" posture); the row's "Status" cell is a `data-testid="roadmap-row-status"` chip reading either `groomed` or `in-progress`. Below the table, a "Shipped tickets live at /changelog" link back to the backward-looking peer and a "How we decide what to ship next" link to `/how-we-ship`. Every string is defensible per AGENTS.md: no invented ship dates not derived from the deterministic function, no fabricated "we always ship weekly" claim. Hyphens not em-dashes per the 2026-05-07 em-dash Hard NO.
- [ ] A new route entry at `src/App.tsx` mapping `/roadmap` to the new page component, lazy-imported through the existing `React.lazy` pattern all other trust pages use per the 2026-09-05 route-code-splitting lesson, wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell. A new entry in `src/data/routes.ts` for `/roadmap` placed next to the existing `/changelog` entry (per the 2026-09-12 code-beats-prose lesson, the implementer greps the actual ordering at branch head before inserting).
- [ ] The page emits three JSON-LD blocks inside its `<Helmet>` block matching the trust-artifact family shape: (1) `CollectionPage` describing the roadmap as a canonical dated collection of upcoming ship rows, with `name` "Digital Craft AI Roadmap", `url` "https://digitalcraftai.com/roadmap", `description` byte-identically matching the page's `meta[name="description"]` per the 2026-05-25 mirror-source rule, `dateModified` equal to `ROADMAP_GENERATED_AT`; (2) `ItemList` whose `itemListElement` array mirrors the rendered rows 1:1 with `position` and `name` fields pulling from `ROADMAP_ENTRIES[i].title`; (3) `BreadcrumbList` positioning the page under the homepage (two levels: Home, Roadmap). Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'`, `=== 'ItemList'`, and `=== 'BreadcrumbList'` predicates. Every predecessor is URL-scoped (every CollectionPage block in the trust family already names its own hub path per the ticket 0102 Implementation log; the ticket 0043 changelog ItemList is URL-scoped to `/changelog`); the sibling scoped to `/roadmap` cannot collide. The grep result is documented in the Implementation log.
- [ ] The `/trust` page (`src/pages/Trust.tsx`) gains one new inline cross-link chip inside the existing trust-cluster section pointing at `/roadmap` with label "Roadmap". This is one additive line inside the shipped ticket 0018 trust page; the ticket 0018 AboutPage JSON-LD and BreadcrumbList JSON-LD stay byte-identical. The site footer (`src/components/Footer.tsx`) gains one new trust-chip link to `/roadmap` next to the existing trust-family links per the ticket 0023 footer chip pattern.
- [ ] The page emits an auto-sitemap entry for `/roadmap` via `scripts/generate-sitemap.ts` (ticket 0022). The implementer confirms auto-emission by grepping `dist/sitemap.xml` for `/roadmap` after a local `npm run build` and records the result in the Implementation log. The sitemap `<lastmod>` value for `/roadmap` is `ROADMAP_GENERATED_AT`'s date portion (the sitemap generator reads it the same way it reads the ticket 0032 changelog `generatedAt`).
- [ ] Per the 2026-05-07 em-dash Hard NO, every string in the new generator, the new data file (auto-emitted), the new page, the three JSON-LD blocks, and the new spec is hyphen-only. The generator emits a build-time assertion that THROWS if any `title` string in the output contains `String.fromCharCode(8212)` (an em-dash), so a groomed ticket written with an em-dash in its title fails `npm run build` before the roadmap page can render it. The spec also asserts the rendered page body contains zero `String.fromCharCode(8212)` code points.
- [ ] A new e2e spec at `tests/e2e/roadmap-page.spec.ts` (modeled on `tests/e2e/changelog-page.spec.ts` from ticket 0032 and on `tests/e2e/hallucination-safeguards.spec.ts` from ticket 0102) asserts, using a `gotoRoadmap(page)` helper that waits for RouteFallback detach per the 2026-09-05 lesson and the H1 mount signal per the 2026-09-10 lesson: (1) `GET /roadmap` returns 200, (2) the page renders an H1 containing "What We Are Shipping Next", (3) the page renders a "Generated:" line matching `ROADMAP_GENERATED_AT` imported from `src/data/roadmapEntries.ts` (mirror-source per the 2026-06-07 rule), (4) the per-ticket table renders exactly `ROADMAP_ENTRIES.length` rows with `data-testid="roadmap-entry-row"` per the 2026-09-06 VISIBLE_LIMIT lesson (`toHaveCount(ROADMAP_ENTRIES.length)` over the imported constant), (5) every row's status cell reads `groomed` or `in-progress` (NEVER `shipped`, NEVER `proposed`), (6) exactly one `CollectionPage` JSON-LD block with `name` byte-matching the page's H1 substring and `dateModified` byte-matching `ROADMAP_GENERATED_AT`, (7) exactly one `ItemList` block whose `itemListElement` length byte-matches `ROADMAP_ENTRIES.length`, (8) exactly one `BreadcrumbList` block with two itemListElement entries named "Home" and "Roadmap", (9) the em-dash assertion scopes only to the three owned blocks per the 2026-09-08 filter lesson; the rendered page body contains zero `String.fromCharCode(8212)` code points, (10) the page renders cleanly in both light and dark mode (`html.dark` toggle), (11) the `/trust` page shows the new "Roadmap" cross-link chip with href `/roadmap`, (12) the footer on the homepage shows the new trust-chip link to `/roadmap`, (13) per the 2026-06-15 attribute-list regex lesson, any regex in the spec over stringified JSON-LD uses `[^>]*`, not `[^/>]*`. The spec is a build-time snapshot of the roadmap state and relies on `ROADMAP_ENTRIES.length > 0` holding at test time; if the groomed queue is empty on the test branch, the generator renders a zero-row "no groomed tickets" explanatory state and the row-count assertion falls through to zero (the generator's empty-queue branch is itself tested in a dedicated case per the 2026-09-06 lesson).
- [ ] Standard box: no `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any predecessor trust-artifact page beyond the one additive chip line in `Trust.tsx` and the one additive link line in `Footer.tsx`, no edits to the ticket 0032 changelog generator or page beyond adding the new sibling generator call in the same `generate-sitemap.ts` chain. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; `tests/e2e/changelog-page.spec.ts` and `tests/e2e/trust-page.spec.ts` stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem
related.

- Standard anti-goals: no `/api/` changes, no `package.json` changes, no em-dashes in copy, dark-mode required.
- Including `proposed` tickets. The generator filters strictly to `groomed` and `in-progress`; `proposed` tickets are not yet in the ship queue and would misrepresent the forward posture per the AGENTS.md conservative-claims rule.
- Including `rejected` or `needs-discovery` tickets. The former is explicitly dead; the latter is a research signal, not a ship signal.
- Including `area: infra` or `area: perf` tickets. The eng queue has no groomer per the 2026-05-22 "eng has no groomer" lesson; eng tickets bootstrap at `status: in-progress` from pre-authorized follow-ups and would not benefit from a public roadmap row. The MVP scopes the roadmap to `area in {conversion, seo, content, trust, demos}` to match the gtm-innovation grooming surface.
- Promising a ship date. The intended-ship-week value is a deterministic planning signal, not a commitment; the caveat is rendered inline and the JSON-LD does not mark the dates as a `dueDate` or `scheduledTime` property.
- Linking each row to the raw `docs/backlog/0NNN-*.md` ticket file. The backlog markdown is not a public URL per the AGENTS.md posture; the row shows the id and the title only.
- Rendering a changelog-style ItemList with `url` entries for each ticket. The ticket 0043 changelog ItemList links to shipped tickets' resolved page URLs (where resolvable); the roadmap items have no public page yet, so the ItemList emits `name` and `position` only.
- Adding a per-ticket "notify me when this ships" email capture. The ticket 0002 course optin and the ticket 0098 OPML aggregator already cover the "subscribe to the ship cadence" surface at the aggregate level; per-ticket notification is a distinct retention ticket.
- Adding an RSS or JSON feed sibling for the roadmap. A roadmap RSS feed is its own content ticket; the MVP ships the HTML page and the JSON-LD only.
- Fabricating an "estimated ship probability" or "confidence score" per ticket. The roadmap is a dated ORDER, not a probabilistic forecast; a confidence-score column would misrepresent the artifact per the AGENTS.md conservative-claims rule.
- Adding a tri-state "slipping / on-track / accelerated" indicator per row. That requires a shipping-rate derivation that depends on live heal rate; it is its own distinct infra ticket.
- Editing any shipped trust-artifact page beyond the additive `Trust.tsx` chip and `Footer.tsx` link.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't
have to re-discover the architecture.

- New `scripts/generate-roadmap.ts` (under 220 lines). Mirror the structure of `scripts/generate-changelog.ts` (ticket 0032): import `readdirSync`, `readFileSync`, `writeFileSync` from node:fs; hand-rolled frontmatter regex (no dependency); same output-file dance (writes `src/data/roadmapEntries.ts` on success, `.broken` on validation failure). The deterministic `intendedShipWeek` function: `firstMonday = next Monday on or after today`; `intendedShipWeek[i] = ISO week string of firstMonday + i * 7 days`. The script is invoked from `scripts/generate-sitemap.ts` the same way the ticket 0032 changelog generator is invoked, so no `package.json` edit is required per the GTM queue Hard NO.
- The emitted `src/data/roadmapEntries.ts` is a generated file; per the ticket 0032 convention it IS committed (not gitignored) so typecheck and lint see a real typed import. The implementer commits the generated file alongside the generator and the page in the same PR.
- New `src/pages/Roadmap.tsx` (under 220 lines). Mirror the file structure of `src/pages/Changelog.tsx` (ticket 0032) verbatim: same imports, same section layout, same top-of-page dated header, same table rendering. Every Tailwind color class carries its `dark:` variant.
- Per the 2026-05-25 mirror-source rule, the `ROADMAP_CADENCE_NOTE` string in the data file is the same string rendered in the visible page body's introduction paragraph AND emitted into the CollectionPage JSON-LD `description` field AND set as the `meta[name="description"]` content. Do NOT hand-roll a second copy.
- Per the 2026-05-30 second-@type lesson, BEFORE writing code grep every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'`, `=== 'ItemList'`, and `=== 'BreadcrumbList'` predicates. Every predecessor is URL-scoped per the ticket 0102 Implementation log; document the grep result in the Implementation log. The ticket 0043 ItemList predicate on `/changelog` is URL-scoped to `/changelog`.
- Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the spec's em-dash assertion filters the block list to the three `@type`s THIS page emits before iterating; it does NOT loop over every `application/ld+json` script on the page.
- Per the 2026-05-28 inline-assertion-in-the-gated-script lesson, the generator throws on any invariant violation (invalid `created`, duplicate id, missing `priority`, invalid `area`, em-dash in title). The thrown generator fails `npm run build` which already runs the chain.
- Per the 2026-09-05 route-code-splitting lesson, the new page's e2e helper waits for the RouteFallback to detach AND for the hero H1 to be visible before probing the DOM.
- Per the 2026-09-06 VISIBLE_LIMIT lesson, the row-count assertion in the spec uses `toHaveCount(ROADMAP_ENTRIES.length)` over the imported constant, NOT `count > 0`.
- Per the 2026-06-07 mirror-source-across-src-tests lesson, the spec imports `ROADMAP_GENERATED_AT`, `ROADMAP_CADENCE_NOTE`, `ROADMAP_ENTRIES` from `src/data/roadmapEntries.ts` directly; do NOT hand-roll copies.
- Per the 2026-06-15 attribute-list regex lesson, any regex in the spec that matches self-closing tags in stringified JSON-LD uses `[^>]*`, not `[^/>]*`.
- Per the 2026-09-26 static-file MIME-shim lesson: NOT applicable here, no new static extension is introduced (the roadmap page is an SPA HTML route). Record "no new static extension shipped" in the Implementation log for auditability.
- `src/App.tsx` gains one `<Route path="/roadmap" element={<Roadmap />} />` after the existing `/changelog` route, wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell and lazy-imported via `React.lazy(() => import('./pages/Roadmap'))`.
- `src/data/routes.ts` gains `/roadmap` after the existing `/changelog` entry per the 2026-09-12 code-beats-prose convention (verify at branch head).
- `src/pages/Trust.tsx` gains one additive cross-link chip inside the existing trust-cluster section. The chip is additive and does not touch the shipped ticket 0018 JSON-LD.
- `src/components/Footer.tsx` gains one additive trust-chip link next to the existing trust-family links per the ticket 0023 / 0097 / 0102 footer chip pattern.
- `tests/e2e/roadmap-page.spec.ts` (new), one assertion per acceptance box, modeled on `tests/e2e/changelog-page.spec.ts` (ticket 0032) and `tests/e2e/hallucination-safeguards.spec.ts` (ticket 0102).
- Per the 2026-05-22 two-PR ship lesson, ship needs a follow-up `chore/0108-ship-status` PR after the feat PR merges to flip the ticket frontmatter AND its `docs/backlog/README.md` index row to `shipped` together; run `node scripts/check-backlog.mjs` before pushing the second PR.
- New deps: NO. The generator uses `node:fs` and hand-rolled regex per the ticket 0032 pattern; the page reuses `react-router-dom`, `react-helmet-async`, `lucide-react`, and Tailwind utility classes already in use across the trust-artifact family. Schema migration: no. Privacy / security surface change: no (the page renders static content; no new localStorage key, no new hostname, no new outbound network call; the forward-looking data is a public derivation of already-public ticket files).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0108-...` opened
- YYYY-MM-DD - failing test added in `tests/...`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
