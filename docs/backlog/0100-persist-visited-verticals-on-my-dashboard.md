---
id: 0100
title: Persist visited AI-for-vertical landing pages and surface a "Verticals you're evaluating" card on /my dashboard
status: shipped
priority: P1
area: demos
created: 2026-09-28
owner: gtm-innovation
---

## User story

As a returning multi-vertical buyer scouting Digital Craft across the site's
long-tail vertical family (a home-services holding-company owner who owns a
plumbing, HVAC, and roofing brand and is quietly evaluating whether one AI
stack could serve all three; a franchise VP whose portfolio spans cleaning,
pest control, and pool service; a real-estate acquisitions lead whose next
deal touches property management, moving companies, and restoration
services), I want the `/my` dashboard to remember the AI-for-vertical
landing pages I visited (with the vertical label, the date I last visited,
and a one-tap reopen link) and render them as one compact "Verticals you're
evaluating" card, so that when I come back to the site next week I can
resume across my three or four active verticals without hunting the
navigation, without any email capture, and without any new account.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the site now ships 17 AI-for-vertical
long-tail landing pages (`/ai-for-plumbers` 0017, `/ai-for-hvac` 0020,
`/ai-for-roofers` 0024, `/ai-for-electricians` 0034, `/ai-for-painters`
0037, `/ai-for-landscapers` 0041, `/ai-for-property-managers` 0047,
`/ai-for-cleaning-services` 0050, `/ai-for-pest-control` 0056,
`/ai-for-pool-service` 0058, `/ai-for-restoration-services` 0072,
`/ai-for-moving-companies` 0080, `/ai-for-solar-installers` 0084,
`/ai-for-window-installers` 0087, `/ai-for-garage-door-companies` 0089,
`/ai-for-tree-services` 0092, `/ai-for-fencing-contractors` 0096) plus the
`/ai-for-hospitality` hub 0071. That is the largest single content family on
the site, and none of the 17 have a persistent-retention hook. Every peer
family already does: shareable estimate 0009 and last estimate 0014 for the
estimate demo, recent demos strip 0026 for the demo hub, recent compares
0074 for the comparison family, quiz history sparkline 0076 for the quiz,
read blog posts 0091 for the blog. The missing sibling is a "verticals
you've viewed" store, which is exactly one new util
(`src/utils/recentVerticalsStore.ts` mirroring
`src/utils/recentComparesStore.ts` from ticket 0074), one additive edit to
each vertical page's mount effect (append-on-visit through a shared hook,
one line per page), one additive edit to `src/pages/MyDashboard.tsx`
adding a `RecentVerticalsCard` component, and one additive entry in
`src/data/demoDisclosures.ts` under `NEW_PERSISTENT_STORES`. Zero new
backend, zero new dependency, zero edit to the 17 landing pages' JSON-LD,
zero edit to the shipped `/my` dashboard layout beyond adding one card.

### Stakeholder

This widens the moat in the retention dimension that the 0045 dashboard
family opened. Nine sibling persistent-artifact cards already sit on `/my`
(last estimate 0014, recent demos 0026, quiz persona and quiz history 0045
plus 0076, last ROI 0062, printable recap 0066, recent compares 0074, read
blog posts 0091, saved ROI scenarios 0093). Every one of those cards
tracks a demo-side or content-side surface EXCEPT the AI-for-vertical
family, which is by row count the biggest surface on the site. A visitor
who has viewed three vertical pages in the last 30 days has told us they
are a multi-vertical operator, which is the exact ICP for the site's
higher-tier services offer; surfacing that pattern back at them on `/my`
is the shortest bridge from "I read three landing pages" to "I book a
call about all three." Per the ticket 0074 recent-compares precedent, the
new store uses a parse-safe read with a valid-routes allow-list derived
from `src/data/routes.ts` so a stale or forged path can never poison the
store. The new localStorage key (`dca_recent_verticals_v1`) is added to
the `NEW_PERSISTENT_STORES` constant in `src/data/demoDisclosures.ts` and
rendered on the `/trust` data-handling disclosure list in the same PR per
the ticket 0018 / 0033 / 0045 / 0060 / 0062 / 0074 / 0076 / 0091 / 0093
honesty rule that every persistent store appears in the disclosure.

### User (in the real moment of use)

A home-services holding-company owner reads `/ai-for-plumbers` on Monday
evening, `/ai-for-hvac` on Wednesday morning, and `/ai-for-roofers` on
Friday afternoon on his phone during a job walk. On Sunday night he opens
`/my` from the footer trust-cluster on his laptop. Below the existing
last-ROI card, one new "Verticals you're evaluating" card renders with a
compact 2-column table: vertical label (Plumbers, HVAC, Roofers), last-
visited date, a one-tap "Reopen" chip that routes to the vertical page.
The row order is most-recent-first, capped at 5 entries, matching the
0074 recent-compares FIFO evict shape. On a first-time visitor with zero
persisted verticals, the entire card is hidden with no empty state and no
nag, so the first-time experience is identical to today. Light and dark
mode both read cleanly, and the card reads cleanly on a 375px viewport
which is where the holding-company owner most likely opens `/my` first.

### Growth

The "show me" moment is a screenshot a Digital Craft salesperson can paste
into a follow-up mailto: "Open digitalcraftai.com/my on the browser you
used last week; you'll see the three verticals you scoped (Plumbing on
Monday, HVAC on Wednesday, Roofing on Friday) side by side with a one-tap
reopen for each. Reply to this email and I'll bring a cross-vertical
proposal to our call." That implicit "we remembered your three verticals
and stacked them" signal is the same retention lever tickets 0014, 0026,
0062, 0074, 0091, 0093 proved for other single-slot and multi-slot
artifacts, lifted to the vertical-landing family. It also creates a
measurable retention KPI: clicks on "Reopen vertical" fire as a distinct
`trackCTAClick` event (`my_vertical_reopen`) so cross-vertical resume
depth is measurable in GA. Per the ticket 0091 read-blog precedent, the
card is filed on `/my` NOT on any vertical page itself; the vertical
pages stay crawler-facing SEO surfaces with zero visitor-state UI.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests
against this list before writing code.

- [ ] A new client-side store at `src/utils/recentVerticalsStore.ts` (new file, under 200 lines) exports `recordVerticalVisit(path: string, label: string): void`, `getRecentVerticals(): RecentVertical[]`, and `clearRecentVerticals(): void`. The store persists at most 5 entries (most-recent-first) under the localStorage key `dca_recent_verticals_v1`, deduplicates by `path` (a re-visit updates the entry's `lastVisitedAt` in place and moves it to the front, does not append a duplicate), is parse-safe (a malformed value returns `[]` without throwing), and is bounded so a quota-exceeded write silently no-ops per the ticket 0074 `recentComparesStore.ts` convention. The `RecentVertical` shape is `{ path: string; label: string; lastVisitedAt: number }`. The `path` is validated against the imported `ROUTES` allow-list from `src/data/routes.ts` and MUST start with `/ai-for-`; any path failing either check is dropped at write time and filtered at read time. Per the 2026-09-10 raw-vs-sliced lesson, keep a private `readAllVerticals()` helper that returns the full validated list; expose `getRecentVerticals()` as `readAllVerticals().slice(0, MAX_RECENT_VERTICALS)` for display.
- [ ] A new shared hook at `src/hooks/useRecordVerticalVisit.ts` (new file, under 60 lines) accepts `{ path, label }` and calls `recordVerticalVisit(path, label)` exactly once on mount inside a `useEffect(..., [])`. Each of the 17 shipped `AiFor*.tsx` vertical pages plus the `/ai-for-hospitality` hub gains ONE additive `useRecordVerticalVisit({ path: '/ai-for-plumbers', label: 'Plumbers' })` call at the top of the component body. This is the ONLY edit to the shipped vertical page files, and the label strings are authored ONCE in `src/data/verticalLabels.ts` (new file, under 40 lines) and imported by both the vertical pages and the `RecentVerticalsCard` per the 2026-05-25 mirror-source rule. Do NOT hand-roll a second label string in the card.
- [ ] `src/pages/MyDashboard.tsx` gains ONE new `RecentVerticalsCard` component (inline or under `src/components/RecentVerticalsCard.tsx` mirroring the ticket 0091 `RecentBlogPostsCard` pattern) that renders BELOW the existing ticket 0093 saved-ROI-scenarios card when `getRecentVerticals().length > 0`. The card renders (a) an H2 heading "Verticals you're evaluating", (b) a compact 2-column table with one row per stored vertical: label, last-visited date formatted `YYYY-MM-DD`, and a "Reopen" anchor whose href is the stored `path` firing `trackCTAClick('my_vertical_reopen', 'my_dashboard')`. On a visitor with zero stored verticals the entire card is null (no empty state, no nag). The card renders `data-testid="recent-verticals-card"` on the wrapper and `data-testid="recent-vertical-row"` on each row per the 2026-09-06 VISIBLE_LIMIT lesson so row-count assertions can use `toHaveCount(N)`.
- [ ] The `dca_recent_verticals_v1` localStorage key is added to `src/data/demoDisclosures.ts` under the existing `NEW_PERSISTENT_STORES` constant per the ticket 0074 / 0076 / 0091 / 0093 precedent AND (transitively via that constant's render loop on `/trust`) to the persistent-stores list rendered on `src/pages/Trust.tsx` per the ticket 0018 / 0033 honesty rule. The disclosure text names the key, the shape (path + label + lastVisitedAt), and the "client-side only, never leaves your browser" language mirroring the ticket 0091 read-posts disclosure.
- [ ] A new e2e spec at `tests/e2e/recent-verticals-card.spec.ts` (modeled on `tests/e2e/recent-compares-recap.spec.ts` from ticket 0074) asserts, using `gotoPath` helpers that wait for RouteFallback detach per the 2026-09-05 lesson: (1) with an empty `dca_recent_verticals_v1`, `/my` renders WITHOUT the card (`page.getByTestId('recent-verticals-card')` has `toHaveCount(0)`), (2) after `page.evaluate` seeds three entries with valid `/ai-for-*` paths, `/my` renders exactly three `data-testid="recent-vertical-row"` rows with the labels visible, (3) each row's "Reopen" anchor href matches a route present in the imported `ROUTES` from `src/data/routes.ts` (mirror-source assertion per the 2026-06-07 rule), (4) visiting `/ai-for-plumbers` then navigating to `/my` renders exactly one row whose label is the shared label constant imported from `src/data/verticalLabels.ts` (write-through case; the vertical-page-mount signal is the H1 visible), (5) revisiting a page with an already-recorded path moves the row to the top and does NOT create a duplicate (dedup case), (6) when the store holds 5 entries and a sixth vertical is visited, the oldest entry is evicted (FIFO evict case, `toHaveCount(5)` before and after), (7) a seeded entry whose `path` is not in `ROUTES` or does not start with `/ai-for-` is filtered at read time and does NOT render (validation-allow-list case), (8) the rendered card body contains zero `String.fromCharCode(8212)` code points per the 2026-05-07 em-dash Hard NO, (9) dark mode renders cleanly via `document.documentElement.classList.add('dark')` and the card is still visible.
- [ ] Standard box: no `/api/` change, no new hostname (the store is localStorage only, no network), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any vertical page beyond the one additive `useRecordVerticalVisit` line at the top of the component body, no edits to the shipped `/my` dashboard cards above the new insertion point. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the existing `tests/e2e/my-dashboard.spec.ts`, `tests/e2e/recent-compares-recap.spec.ts`, and every shipped `tests/e2e/ai-for-*.spec.ts` stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem
related.

- Standard anti-goals: no `/api/` changes, no `package.json` changes, no em-dashes in copy, dark-mode required.
- Recording visits to non-vertical pages (comparison pages 0021/0028/etc., blog posts, case studies, the homepage, or the demo hub). Those surfaces already have their own persistence stores (0074 compares, 0091 blog posts, 0026 recent demos); this store is scoped strictly to `/ai-for-*` routes.
- Adding cross-vertical recommendations INSIDE the vertical pages (the ticket 0027 "more like this" strip already covers cross-demo suggestions on demo pages; a same-family cross-link on landing pages is a distinct SEO ticket).
- Editing the shipped 0071 `/ai-for-hospitality` hub JSON-LD or the shipped 0017-0096 vertical-page JSON-LD blocks. This ticket is strictly retention-side; every SEO surface stays byte-identical.
- Cross-device sync of visited verticals (so a visitor sees the same list on desktop and phone). The store is browser-local per the privacy posture of the sibling stores; cross-device sync requires a backend account surface.
- Emitting a `Dataset` or `ItemList` JSON-LD block for the recent-verticals card on `/my`. `/my` is a retention surface, not an SEO surface (per the ticket 0045 precedent) and adding a public JSON-LD block for private client-side state would misrepresent the artifact.
- Emailing the visited-verticals list to the visitor. The ticket 0082 dossier JSON export already covers programmatic access and will transitively pick up the new store per the ticket 0082 everything-in-one-dossier pattern.
- A "cross-vertical proposal" CTA on `/my` that opens a mailto: with the visited verticals in the body. That composed-mailto CTA is its own conversion-area ticket; this ticket ships the persistence and card only.
- Persisting verticals older than the 5-entry FIFO cap. A larger cap or an archive tab is a follow-up ticket once telemetry justifies it.
- Fabricated vertical labels seeded from UTM, industry guess, or company name. Every label comes from the shared `src/data/verticalLabels.ts` constant, one per shipped `/ai-for-*` route.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev
doesn't have to re-discover the architecture.

- New `src/utils/recentVerticalsStore.ts` (under 200 lines). Copy the shape of `src/utils/recentComparesStore.ts` (ticket 0074): parse-safe read via an `isRecentVertical` type guard, dedup-by-path append that moves an existing entry to the front, quota-tolerant write. The `ROUTES` allow-list import is `src/data/routes.ts`. Per the 2026-09-10 raw-vs-sliced lesson keep a private `readAllVerticals()` helper.
- New `src/data/verticalLabels.ts` (under 40 lines). Export a `VERTICAL_LABELS` const-record keyed by path (e.g. `'/ai-for-plumbers': 'Plumbers'`) covering all 17 shipped vertical routes plus `/ai-for-hospitality`. Per the 2026-05-25 mirror-source rule, this is the single source rendered on both the vertical pages' `useRecordVerticalVisit` call and the `RecentVerticalsCard`.
- New `src/hooks/useRecordVerticalVisit.ts` (under 60 lines). Signature: `useRecordVerticalVisit({ path, label }: { path: string; label: string }): void`. Fires `recordVerticalVisit(path, label)` exactly once on mount via `useEffect(() => { ... }, [])`. Per the 2026-09-10 mount-signal lesson the hook does NOT rely on any router-side signal.
- Additive edit to each of the 17 shipped `src/pages/AiFor*.tsx` vertical pages plus `src/pages/AiForHospitality.tsx`. Add one `useRecordVerticalVisit({ path: <route>, label: VERTICAL_LABELS[<route>] })` call at the top of the component body. Grep the actual file list at branch head per the 2026-09-12 code-beats-prose lesson before touching (do not trust the count in prose).
- `src/pages/MyDashboard.tsx` gains one new `RecentVerticalsCard` render block, either inline or under `src/components/RecentVerticalsCard.tsx` mirroring the ticket 0091 `RecentBlogPostsCard` pattern. The block reads `getRecentVerticals()` once on mount into local state, renders `data-testid="recent-verticals-card"` when length > 0, and returns null otherwise. Place the block directly under the ticket 0093 saved-ROI-scenarios card in the top-of-dashboard retention cluster.
- `src/data/demoDisclosures.ts` gains one new entry describing the `dca_recent_verticals_v1` key per the ticket 0074 / 0091 / 0093 disclosure convention. Append to the `NEW_PERSISTENT_STORES` constant so the `/trust` render loop picks it up automatically.
- Per the 2026-05-30 second-@type lesson, this ticket adds NO new JSON-LD blocks. The pre-code grep is a no-op; record "no new JSON-LD blocks added" in the Implementation log for auditability.
- Per the 2026-05-07 em-dash Hard NO, every string in the new util, the label map, the card, the disclosure additions, and the spec is hyphen-only. Self-Review greps the diff for `String.fromCharCode(8212)`.
- Per the 2026-09-06 VISIBLE_LIMIT lesson, the new spec's row-count assertion uses `toHaveCount(N)` over the seeded-then-read state, NOT `count > 0` over the live derived state. Seed `dca_recent_verticals_v1` via `page.evaluate` at the start of each case.
- Per the 2026-06-07 mirror-source-across-src-tests lesson, the spec imports `VERTICAL_LABELS` from `src/data/verticalLabels.ts` and `ROUTES` from `src/data/routes.ts` directly; do NOT hand-roll copies in the test file.
- `tests/e2e/recent-verticals-card.spec.ts` (new), one assertion per acceptance box, modeled on `tests/e2e/recent-compares-recap.spec.ts` (ticket 0074).
- Per the 2026-05-22 two-PR ship lesson, ship needs a follow-up `chore/0100-ship-status` PR after the feat PR merges to flip the ticket frontmatter AND its `docs/backlog/README.md` index row to `shipped` together; run `node scripts/check-backlog.mjs` before pushing the second PR.
- New deps: NO. The store reuses `localStorage`; the card reuses `react-router-dom`, `lucide-react`, and Tailwind utilities already in use on `/my`. Schema migration: no. Privacy / security surface change: YES, the new `dca_recent_verticals_v1` key is added to `NEW_PERSISTENT_STORES` and rendered on `/trust` in the same PR per the honesty rule; no data leaves the browser.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-28 - branch `feat/0100-persist-visited-verticals-on-my-dashboard` opened, status flipped to `in-progress`.
- YYYY-MM-DD - failing test added in `tests/e2e/recent-verticals-card.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
