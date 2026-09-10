---
id: 0074
title: Persist the visitor's viewed comparison pages and surface a "Comparisons you're weighing" card on /my dashboard
status: shipped
priority: P1
area: demos
created: 2026-09-10
owner: gtm-innovation
---

## User story

As a returning prospect who is actively evaluating
Digital Craft against the CRM their team already
pays for (a real-estate broker who tapped
`/compare/followupboss` last Tuesday, a GC who
opened `/compare/buildertrend` on their laptop over
the weekend, a plumbing-shop owner who bounced
between `/compare/jobber`, `/compare/servicetitan`,
and `/compare/housecallpro` in one Sunday-evening
session), I want the compare pages I have opened to
persist in my browser and surface as one saved card
on the `/my` dashboard when I come back Monday
morning, so that I can reopen the exact comparison
I was reading without re-searching the SERP, plus
see one "you might also compare" chip pointing at
a sibling comparison I have not opened yet, without
any email capture, any push notification, or any
new account.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: compare-page
visit tracking is a NEW retention artifact type
that does NOT exist today. Every other high-intent
artifact on the site persists to localStorage and
surfaces on `/my`: the estimate calculator persists
via `dca_last_estimate_v1_<vertical>` (ticket
0014's `src/pages/construction/lastEstimateStore.ts`);
the ROI calculator persists via
`dca_last_roi_result_v1` (ticket 0062's
`src/utils/roiResultStore.ts`); demo visits persist
via `dca_recent_demos_v1` (ticket 0026's
`src/utils/recentDemosStore.ts`); the quiz tier
persona persists via `dca_quiz_persona_v1` (ticket
0045's `quizPersonaStore.ts`); the visit-streak
count persists via `dca_visit_days_v1` (ticket
0060's `src/utils/visitStreakStore.ts`). Compare
pages are the ONLY high-intent surface family with
no persistent-store equivalent, even though a
visitor who taps into `/compare/<tool>` has
self-selected as a competitive-evaluation prospect
(the highest-intent audience the site can produce,
per the ticket 0065 stakeholder argument). This
ticket adds the missing store
(`src/utils/recentComparesStore.ts`, mirroring the
allow-list-validated shape of
`recentDemosStore.ts`), wires a one-line
`recordCompareVisit` call into each
`src/pages/compare/*.tsx` page (fourteen additive
one-line edits after ticket 0073 ships JobTread),
and renders one new card on `/my` that shows the
visited comparisons with quick-return links plus
one "you might also compare" sibling chip pointing
at an unvisited entry from
`src/data/compareEntries.ts`. One new util, one
additive edit each to the fourteen compare pages
(a single-line `useEffect` at the top of each) and
`MyDashboard.tsx`, one additive edit to
`src/data/demoDisclosures.ts` and `Trust.tsx`'s
persistent-store disclosure list, zero new
backend, zero new dependency.

### Stakeholder

This widens the moat in the retention dimension
that the ticket 0045 dashboard opened but has NOT
extended to the compare-page family. The `/my`
dashboard already surfaces the four sibling
persistent artifacts (estimate, demos, quiz
persona, ROI) plus the visit-streak badge; the
compare-page family is the missing fifth. A
visitor who tapped three compare pages last week
is materially further down the funnel than a
visitor who tried one demo, and surfacing the
compare-page recap on `/my` is the single cheapest
retention lever that closes the "which
comparison did I read again" loop for a
returning prospect. The
`recentComparesStore.ts` module also unlocks a
"you compared us to X, here's Y" sibling nudge
that the `/compare` hub itself (ticket 0048)
cannot surface because the hub renders every
entry equally; the `/my` dashboard is the correct
surface for a personalized suggestion because it
already knows the visitor's history. Per the
ticket 0026 recentDemosStore precedent, the new
store uses an ALLOW-LIST derived from
`COMPARE_ENTRIES` in `src/data/compareEntries.ts`
so a renamed or removed comparison cannot strand
a dead recap link, mirroring the
`recentDemosStore.KNOWN_PATHS` set. The new
localStorage key
(`dca_recent_compares_v1`) is added to the
`/trust` data-handling disclosure list in the
same PR per the ticket 0018 / 0033 / 0045 /
0060 / 0062 honesty rule that every persistent
store appears in the disclosure.

### Visitor (in the real moment of use)

A GC who tapped `/compare/buildertrend` on Sunday
evening, then `/compare/jobber` on Monday
morning, opens `/my` Tuesday morning to pick up
where they left off. Above the existing
saved-estimate card, saved-ROI card, and recent-
demos card, one new "Comparisons you're weighing"
card renders with two small rows: one for
Buildertrend and one for Jobber, each with the
tool name, the "viewed 2 days ago" timestamp, and
a "Reopen comparison" button that routes to
`/compare/<tool>`. Below the two rows, one small
"You have not compared us to Follow Up Boss yet"
chip routes to an unvisited entry from
`COMPARE_ENTRIES` (the entry chosen deterministically
by nearest-vertical fit; the exact heuristic is
documented in the store). On a first-time visitor
with no history, the card is hidden entirely (no
empty state, no nag), so the first-time experience
is identical to today. Light and dark mode
supported; the card reads cleanly on a 375px
viewport.

### Growth

The "show me" moment is the screenshot a
salesperson can paste into a follow-up email:
"Open digitalcraftai.com/my and you will see the
three comparisons you tapped last week at the top,
plus one comparison we recommend you look at
next." That implicit "we remembered plus we
noticed you skipped one" signal is the same
retention lever tickets 0014, 0026, 0045, 0062
proved for other artifacts, lifted to the
highest-intent artifact family the site has. It
also creates a measurable retention KPI: clicks
on the "Reopen comparison" and "Compare next"
buttons fire as distinct `trackCTAClick` events
(`my_compare_reopen` and `my_compare_suggest`)
so returning-visit compare-page depth is
measurable in GA. Per the ticket 0062 dashboard-
card precedent, the card is filed on `/my`
NOT on `/compare` because retention surfaces
belong on the personalized dashboard, not on
crawler-facing hubs.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new client-side store at `src/utils/recentComparesStore.ts` (new file, under 180 lines) exports `recordCompareVisit(path: string, tool: string): void`, `getRecentCompares(): RecentCompare[]`, `suggestNextCompare(): CompareEntry | null`, and `clearRecentCompares(): void`. The store persists at most 5 entries (most recent first) under the localStorage key `dca_recent_compares_v1`, deduplicates by `path` (a re-visit moves the entry to the front, does not append a duplicate), is parse-safe (a malformed value returns `[]` without throwing), and is bounded so a quota-exceeded write silently no-ops per the ticket 0026 `recentDemosStore.ts` convention. The `RecentCompare` shape is `{ path: string; tool: string; viewedAt: number }`. The path allow-list is derived at module load time from `COMPARE_ENTRIES.map(e => e.path)` (imported from `src/data/compareEntries.ts`); a `recordCompareVisit` call with a path outside the allow-list is a no-op, mirroring the ticket 0026 `KNOWN_PATHS` invariant. Entries whose path is no longer in the allow-list are filtered at read time so a renamed comparison cannot strand a dead recap link.
- [ ] `suggestNextCompare(): CompareEntry | null` returns the FIRST entry from `COMPARE_ENTRIES` (in array order) whose `path` is NOT present in the current `getRecentCompares()` list. When every entry has been viewed the function returns `null`. When no entry has been viewed (empty history) it returns `null` (the suggestion chip is only shown to visitors who have already tapped at least one comparison, so a first-time visitor sees nothing). The function is deterministic and pure per the ticket 0026 `getRecentDemos` shape.
- [ ] Each of the fourteen `src/pages/compare/*.tsx` pages gains ONE new `useEffect` at the top of its component body that calls `recordCompareVisit(location.pathname, TOOL_NAME)` on mount, where `TOOL_NAME` is a module-level string constant already present in every compare page (the `PAGE_H1` or a dedicated `TOOL_NAME` constant, following the 2026-05-25 mirror-source rule). The `useEffect` has an empty dependency array. This is fourteen additive one-line edits (fifteen once ticket 0073 JobTread ships and lands its own `useEffect`) that do not otherwise touch the render tree.
- [ ] `src/pages/MyDashboard.tsx` gains ONE new card component (`RecentComparesCard`, inline or under `src/components/`) that renders ABOVE the existing saved-estimate / saved-ROI / recent-demos cards when `getRecentCompares().length > 0`. The card renders (a) an H3 heading "Comparisons you're weighing", (b) one row per stored entry with the tool name, a relative-time chip (e.g. "viewed 2 days ago" computed client-side, no fabricated dates), and a `<Link to={compare.path}>` "Reopen comparison" button firing `trackCTAClick('my_compare_reopen', 'my_dashboard')`, (c) one "Compare us to X next" chip below the rows ONLY when `suggestNextCompare()` returns a non-null entry, routing to that entry's `path` and firing `trackCTAClick('my_compare_suggest', 'my_dashboard')`. On a visitor with zero stored entries the entire card is null (no empty state, no nag).
- [ ] The `dca_recent_compares_v1` localStorage key is added to `src/data/demoDisclosures.ts` (the source of truth for per-store disclosures on `/trust` per ticket 0033) AND to the persistent-stores list rendered on `src/pages/Trust.tsx` per the ticket 0018 / 0033 / 0045 / 0060 / 0062 honesty rule. The disclosure text names the key, the shape (path + tool + viewedAt), and the "client-side only, never leaves your browser" language mirroring the ticket 0062 ROI-store disclosure. The `/trust` render tree passes its existing `tests/e2e/trust-page.spec.ts` after the additive edit.
- [ ] Per the 2026-05-30 second-@type lesson, this ticket adds NO new JSON-LD blocks (the `/my` dashboard already emits BreadcrumbList + WebPage per ticket 0045, and no compare page JSON-LD changes). The pre-code grep for JSON-LD predicate collisions is a no-op, but the implementer records "no new JSON-LD blocks added" in the Implementation log for auditability. The existing `tests/e2e/my-dashboard.spec.ts` (ticket 0045) MUST stay green after the additive card insertion; the spec asserts the dashboard renders and the existing cards render but does NOT assert "no additional cards on the dashboard," so an additive card is safe.
- [ ] A new e2e spec at `tests/e2e/recent-compares-recap.spec.ts` (modeled on `tests/e2e/recent-demos-recap.spec.ts` from ticket 0026) asserts: (1) with an empty `dca_recent_compares_v1` value, `/my` renders WITHOUT the RecentComparesCard (`page.getByTestId('recent-compares-card').count() === 0`), (2) after `page.evaluate` seeds two entries with valid paths from `COMPARE_ENTRIES`, `/my` renders exactly two `data-testid="recent-compare-row"` rows with the tool names visible, (3) each row's "Reopen comparison" anchor href matches `/compare/<tool>` and resolves to a path present in `ROUTES` (imported from `tests/e2e/routes.ts`), (4) navigating to any of the fourteen (or fifteen after 0073) `/compare/<tool>` routes and then to `/my` causes that path to appear at position 1 of the recap card (write-through case), (5) a duplicate visit to the same compare path does NOT create a second row (dedup case), (6) a seeded entry whose path is NOT in `COMPARE_ENTRIES` (an invalid path) is filtered at read time and does NOT render (allow-list case), (7) when at least one entry is stored AND at least one `COMPARE_ENTRIES` entry is NOT in the stored list, exactly one `data-testid="compare-suggest-chip"` renders with a valid `/compare/<tool>` href, (8) when every `COMPARE_ENTRIES` entry has been visited, the suggest chip is absent (`toHaveCount(0)`), (9) the page text on `/my` contains no `String.fromCharCode(8212)` code point in any RecentComparesCard string, (10) dark mode renders cleanly via `document.documentElement.classList.add('dark')` and the card is still visible, (11) sibling-page-regression case navigates to `/compare/jobber`, then `/compare/buildertrend`, then `/my`, and asserts both rows appear in reverse-visit order (most-recent-first) with the JobTread ticket 0073 pattern preserved when merged.
- [ ] Standard box: no `/api/` change, no new hostname (the store is localStorage only, no network), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/data/compareEntries.ts` beyond a possible import (this ticket does NOT append a new comparison entry; ticket 0073 owns JobTread). Every string in the new util, the RecentComparesCard, and the disclosure additions is hyphen-only per the 2026-05-07 em-dash Hard NO; Self-Review greps the diff for `String.fromCharCode(8212)`. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the existing `tests/e2e/my-dashboard.spec.ts`, `tests/e2e/recent-demos-recap.spec.ts`, `tests/e2e/trust-page.spec.ts`, and every `tests/e2e/compare-*.spec.ts` (the fourteen predecessor compare-page specs) stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- Standard anti-goals: no /api/ changes, no
  package.json changes, no em-dashes in copy,
  dark-mode required.
- Emitting an email digest of viewed comparisons.
  The store is client-side only and no
  server-side surface (email, webhook, analytics
  event beyond the existing `trackCTAClick`) is
  wired. Email retention is its own ticket once
  ticket 0002 (5-day course opt-in) confirms
  email consent.
- Adding a "Comparisons you skipped" section to
  the `/compare` hub itself. Retention surfaces
  belong on `/my`, not on crawler-facing hubs
  per the ticket 0045 / 0062 precedent; the hub
  renders every entry equally as an SEO surface.
- A comparison-suggestion algorithm that reads
  the visitor's quiz persona, ROI figure, or
  recent-demo history and blends them. The
  suggestion is the FIRST unvisited entry from
  `COMPARE_ENTRIES` in array order, matching
  the deterministic simplicity of ticket 0026's
  `getRecentDemos`. A blended suggestion is its
  own follow-up ticket once telemetry justifies
  the complexity.
- Displaying the compare-page tagline from
  `COMPARE_ENTRIES` on the RecentComparesCard.
  The card shows tool name + timestamp + reopen
  button only, mirroring the ticket 0026 recent
  demos strip minimalism. Adding the tagline
  would balloon the card and duplicate the
  `/compare` hub's card shape.
- A "clear compare history" button visible in the
  RecentComparesCard. `clearRecentCompares()` is
  exported for future use but no visible UI is
  wired, mirroring the ticket 0026 pattern of
  reserving the clear function for a later
  general-clear UI ticket.
- Cross-promoting the card from the homepage
  hero, `/demos`, or any vertical strip.
  Cross-surface promotion is its own follow-up
  ticket once telemetry shows the card earns
  return-visit engagement.
- Emitting a `Person` or `ProfilePage` JSON-LD
  block on `/my`. The dashboard already emits
  WebPage per ticket 0045 and adding a Person
  block would misrepresent the artifact (there
  is no named person). Out of scope.
- Persisting the visitor's OUTCOME of a
  comparison (which tool they chose, which
  demo they clicked from the compare page). The
  store records visits only, no downstream
  choice; a choice-capture surface is its own
  ticket if a lead-capture surface ever wants
  the signal.
- Serverside sync of the compare visits (so a
  visitor sees the same recap on a different
  device). The store is browser-local per the
  privacy posture of the four sibling stores;
  cross-device sync is its own major ticket and
  requires a backend account surface.
- Fabricated relative-time strings ("viewed 100
  days ago" rendered for a 3-day-old entry).
  The relative-time chip is computed
  client-side via `Date.now() - viewedAt` per
  standard patterns; no display gets a
  fabricated value.
- Editing the shipped ticket 0060 visit-streak
  badge, ticket 0045 dashboard layout beyond
  inserting the card, or the ticket 0026
  recent-demos strip. The card sits ABOVE the
  existing cards with no reorder of the
  predecessor artifacts.
- Adding the RecentComparesCard to the
  `index.html` SEO Pilot pages table. The `/my`
  route is not in the table per the ticket 0045
  precedent and is not indexable.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/utils/recentComparesStore.ts` (under
  180 lines). Copy the shape of
  `src/utils/recentDemosStore.ts` (ticket 0026):
  parse-safe read via `isRecentCompare` type
  guard, dedup-by-path append that moves an
  existing entry to the front, quota-tolerant
  write. The path allow-list is derived at
  module load time from
  `COMPARE_ENTRIES.map(e => e.path)` (imported
  from `../data/compareEntries`) so appending
  a fifteenth comparison automatically widens
  the allow-list. Export
  `recordCompareVisit`, `getRecentCompares`,
  `suggestNextCompare`, and
  `clearRecentCompares`. The `RecentCompare`
  interface is `{ path: string; tool: string; viewedAt: number }`.
- Each of the fourteen (fifteen post-0073)
  `src/pages/compare/*.tsx` pages gains ONE
  additive `useEffect(() => { recordCompareVisit(location.pathname, TOOL_NAME); }, []);`
  at the top of the component body. The
  `TOOL_NAME` constant is the existing
  module-level `PAGE_H1` or a new `TOOL_NAME`
  constant sourced from the H1's tool
  substring (2026-05-25 mirror-source rule).
  The `useEffect` has an empty dependency
  array. This is a mechanical one-line edit
  per page; the render tree is unchanged.
- `src/pages/MyDashboard.tsx` gains one new
  `RecentComparesCard` render block (either
  inline or under `src/components/RecentComparesCard.tsx`).
  The block reads `getRecentCompares()` once
  on mount into local state, renders a
  `data-testid="recent-compares-card"` wrapper
  when the length is > 0, and returns null
  otherwise. The card renders above the
  existing saved-estimate / saved-ROI cards
  per the ticket 0062 vertical-order precedent
  (top-of-dashboard retention artifacts first,
  then estimate/demos/quiz below). Each row
  is `data-testid="recent-compare-row"`; the
  suggest chip is `data-testid="compare-suggest-chip"`.
- `src/data/demoDisclosures.ts` gains one new
  entry describing the `dca_recent_compares_v1`
  key: purpose, shape, "client-side only,
  never leaves your browser," per the ticket
  0033 disclosure convention. `src/pages/Trust.tsx`
  automatically renders the additive entry
  because its persistent-stores list reads
  from the demoDisclosures constant per the
  ticket 0018 / 0033 mirror-source rule; the
  render adds one row to the visible list.
- Per the 2026-05-25 mirror-source rule, the
  fifth-column entry on `/my` (the store key
  disclosure list, if the dashboard renders
  one) and the `/trust` disclosure MUST share
  the same source. Do NOT hand-roll a second
  copy of the disclosure string.
- Per the 2026-05-30 second-@type lesson,
  this ticket adds NO new JSON-LD blocks. The
  pre-code grep is a no-op; record the
  no-op in the Implementation log for
  auditability.
- Per the 2026-05-07 em-dash Hard NO, every
  string in the new util, the
  RecentComparesCard, and the disclosure
  additions is hyphen-only. Self-Review greps
  the diff for `String.fromCharCode(8212)`
  before pushing.
- Per the 2026-09-06 VISIBLE_LIMIT window
  drift lesson, the new spec's row-count
  assertion uses `toHaveCount(N)` over the
  seeded-then-read state, NOT `count > 0`
  over the live dashboard whose card
  visibility depends on prior state. The
  spec seeds `dca_recent_compares_v1` via
  `page.evaluate` at the start of each case
  so the assertion is deterministic.
- `tests/e2e/recent-compares-recap.spec.ts`
  (new) - one assertion per acceptance box.
  Model the spec on
  `tests/e2e/recent-demos-recap.spec.ts`
  (ticket 0026, the direct peer for a
  recap-strip retention surface) and on
  `tests/e2e/roi-card-on-dashboard.spec.ts`
  (ticket 0062, the direct peer for a
  dashboard-card retention surface). The
  allow-list case seeds an invalid path and
  asserts it does NOT render.
- Per the 2026-05-22 two-PR ship lesson,
  ship will need a follow-up
  `chore/0074-ship-status` PR after the feat
  PR merges to flip the ticket frontmatter
  AND its `docs/backlog/README.md` index row
  to `shipped` together; run
  `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and
  index never drift mid-flip.
- New deps: NO. The store reuses `localStorage`
  and standard `try/catch` per the ticket
  0026 pattern. The card reuses
  `react-router-dom`, `lucide-react`, and
  Tailwind utility classes already in use on
  `/my`. Schema migration: no. Privacy /
  security surface change: YES - the new
  `dca_recent_compares_v1` key is added to
  the `/trust` disclosure list in the same
  PR per the ticket 0018 / 0033 / 0045 /
  0060 / 0062 honesty rule; no data leaves
  the browser.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-10 - branch `feat/0074-persist-viewed-compares-on-my-dashboard` opened
- 2026-09-10 - grep for new JSON-LD blocks: no-op (this ticket adds no JSON-LD)
- 2026-09-10 - failing test added in `tests/e2e/recent-compares-recap.spec.ts` (11 boxes, 1 per acceptance criterion)
- 2026-09-10 - new store `src/utils/recentComparesStore.ts` under 130 lines, allow-list from COMPARE_ENTRIES
- 2026-09-10 - 14 compare pages gain `TOOL_NAME` constant + one-line `useEffect` (H1-derived for the 4 pages with `PAGE_H1`, string constant for the other 10)
- 2026-09-10 - RecentComparesCard block added to `src/pages/MyDashboard.tsx` above existing cards
- 2026-09-10 - `dca_recent_compares_v1` disclosure entry added to `src/data/demoDisclosures.ts` and rendered on `/trust` via shared `NEW_PERSISTENT_STORES` source
- 2026-09-10 - full local gate green: lint, typecheck, check-links, check-images, check-meta, check-blog-dates, check-backlog, build
- 2026-09-10 - new spec (11 tests) green; predecessor specs (my-dashboard, recent-demos-recap, trust-page, compare-*) green single-worker (2 pre-existing parallel-worker flakes in trust-page and compare-hub CollectionPage tests are covered by CI retries: 1 per the 2026-09-05 route-fallback lesson)
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
