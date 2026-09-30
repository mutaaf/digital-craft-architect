---
id: 0104
title: Persist visited trust-family pages and surface a "Compliance you've reviewed" card on /my dashboard
status: groomed
priority: P1
area: demos
created: 2026-09-30
owner: gtm-innovation
---

## User story

As a returning compliance-minded buyer scouting Digital Craft across
the site's trust-artifact family (a public-sector construction GC's
procurement lead who visited `/security`, `/subprocessors`, and
`/accessibility-statement` on separate coffee-break sessions; a
real-estate brokerage's E&O insurance underwriter who has opened
`/model-card`, `/hallucination-safeguards`, and `/ai-risks-we-watch`
across three afternoons; a franchise VP's ADA counsel who has
reviewed `/ethics`, `/agent-fleet`, and `/how-we-ship`), I want the
`/my` dashboard to remember the trust-family pages I visited (with
the page label, the date I last visited, and a one-tap reopen link)
and render them as one compact "Compliance you've reviewed" card,
so that when I sit down to compile the vendor onboarding packet next
week I can resume across my three or four already-reviewed
compliance artifacts without hunting the footer, without any email
capture, and without any new account.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the site now ships twelve
trust-family artifacts (`/trust` 0018, `/uptime` 0036,
`/subprocessors` 0069, `/ethics` 0077, `/security` 0081,
`/how-we-ship` 0083, `/model-card` 0088, `/agent-fleet` 0090,
`/ai-risks-we-watch` 0094, `/accessibility-statement` 0097,
`/hallucination-safeguards` 0102, plus the buyer-side
`/questions-to-ask-an-ai-vendor` 0061 and its printable scorecard
0067). That is one of the two largest content families on the site
(alongside the AI-for-vertical family that ticket 0100 already
covers), and none of the twelve trust pages have a persistent-
retention hook. Every peer family already does: recent verticals
0100 for the vertical family, recent compares 0074 for the
comparison family, recent demos 0026 for the demos, read blog posts
0091 for blog articles. The missing sibling is a "trust pages
reviewed" store, which is exactly one new util
(`src/utils/reviewedTrustPagesStore.ts` mirroring
`src/utils/recentVerticalsStore.ts` from ticket 0100), one shared
hook (`src/hooks/useRecordTrustPageVisit.ts` mirroring
`src/hooks/useRecordVerticalVisit.ts` from ticket 0100), one
additive one-line mount call per trust page, one new component
(`src/components/ReviewedTrustPagesCard.tsx`) rendered on `/my`
below the ticket 0100 recent-verticals card, one new label map
(`src/data/trustPageLabels.ts`), one new entry in
`NEW_PERSISTENT_STORES` under `src/data/demoDisclosures.ts`, and one
new spec. Zero new backend, zero new dependency, zero edit to the
twelve trust pages' JSON-LD blocks or visible copy, zero edit to
the shipped `/my` dashboard cards above the insertion point.

### Stakeholder

This widens the moat in the retention dimension that the ticket
0045 dashboard family opened and the ticket 0100 vertical-tracking
extended. Ten sibling persistent-artifact cards already sit on `/my`
(last estimate 0014, recent demos 0026, quiz persona + quiz history
0045 plus 0076, last ROI 0062, printable recap 0066, recent
compares 0074, read blog posts 0091, saved ROI scenarios 0093,
recent verticals 0100). Every one of those tracks a demo-side or
content-side surface EXCEPT the trust-family, which is by page count
tied with the vertical family as the biggest surface on the site
and is the surface most likely to correlate with a real buyer's
procurement workflow. A visitor who has read three trust pages in
the last 30 days has told us they are a compliance-driven buyer,
which is a distinct ICP from the multi-vertical operator ticket
0100 tracks; surfacing that pattern back at them on `/my` is the
shortest bridge from "I read three compliance artifacts" to "I
book a call to close the vendor-onboarding packet." Per the ticket
0100 recent-verticals precedent, the new store uses a parse-safe
read with a valid-routes allow-list derived from
`src/data/routes.ts`, scoped to a `TRUST_ROUTES` sub-set so a
non-trust route can never poison the store. The new localStorage
key (`dca_reviewed_trust_pages_v1`) is added to
`NEW_PERSISTENT_STORES` in `src/data/demoDisclosures.ts` and
rendered on the `/trust` data-handling disclosure list in the same
PR per the ticket 0018 / 0033 / 0100 honesty rule that every
persistent store appears in the disclosure.

### User (in the real moment of use)

A public-sector construction GC's procurement lead opens `/security`
on Monday during her Section 508 review, `/subprocessors` on Tuesday
while cross-checking the vendor data-recipient list, and
`/accessibility-statement` on Wednesday to grab the WCAG conformance
URL for her spreadsheet. On Thursday afternoon she opens `/my` from
the footer trust-cluster on her laptop to finish the onboarding
packet. Below the ticket 0100 verticals card (empty for her, hidden
by the ticket 0100 zero-state rule), one new "Compliance you've
reviewed" card renders with a compact 2-column table: page label
(Security, Subprocessors, Accessibility Statement), last-visited
date, a "Reopen" chip that routes to the trust page. Row order is
most-recent-first, capped at 6 entries per the trust family's
larger footprint (vs. 5 for verticals - documented deviation from
0100). On a first-time visitor with zero reviewed trust pages, the
entire card is hidden with no empty state and no nag, so the first-
time experience is identical to today. Light and dark mode both
read cleanly; the card reads cleanly on a 375px viewport per the
ticket 0097 accessibility-statement posture; every "Reopen" link
target is present in the imported `TRUST_ROUTES` allow-list so no
dead link can ever render even after a future trust-page rename.

### Growth

The "show me" moment is a Digital Craft salesperson pasting a follow-
up mailto: to the procurement lead: "Open digitalcraftai.com/my on
the browser you used last week; you'll see the three compliance
artifacts you already reviewed (Security on Monday, Subprocessors on
Tuesday, Accessibility Statement on Wednesday) stacked in one card
with a one-tap reopen for each. Reply and I'll bring the ticket
0102 hallucination-safeguards page and the ticket 0088 model-card
walkthrough to our call." That implicit "we remembered which
compliance artifacts you read" signal is the same retention lever
tickets 0014, 0026, 0091, 0100 proved for other single-slot and
multi-slot artifacts, lifted to the trust-family which is the ICP-
tightest surface on the site. Clicks on "Reopen trust page" fire as
a distinct `trackCTAClick` event (`my_trust_reopen`) so cross-trust
resume depth is measurable in GA. Per the ticket 0091 read-blog
precedent, the card is filed on `/my` NOT on any trust page itself;
the twelve trust pages stay crawler-facing SEO surfaces with zero
visitor-state UI.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests
against this list before writing code.

- [ ] A new client-side store at `src/utils/reviewedTrustPagesStore.ts` (new file, under 200 lines) exports `recordTrustPageVisit(path: string, label: string): void`, `getReviewedTrustPages(): ReviewedTrustPage[]`, and `clearReviewedTrustPages(): void`. The store persists at most 6 entries (most-recent-first) under the localStorage key `dca_reviewed_trust_pages_v1`, deduplicates by `path` (a re-visit updates the entry's `lastVisitedAt` in place and moves it to the front, does not append a duplicate), is parse-safe (a malformed value returns `[]` without throwing), and is bounded so a quota-exceeded write silently no-ops per the ticket 0100 `recentVerticalsStore.ts` convention. The `ReviewedTrustPage` shape is `{ path: string; label: string; lastVisitedAt: number }`. The `path` is validated against a `TRUST_ROUTES` allow-list (new export in `src/data/trustPageLabels.ts`, a subset of `ROUTES` covering exactly the twelve trust-family paths); any path failing the check is dropped at write time and filtered at read time. Per the 2026-09-10 raw-vs-sliced lesson keep a private `readAllReviewed()` helper that returns the full validated list; expose `getReviewedTrustPages()` as `readAllReviewed().slice(0, MAX_REVIEWED_TRUST_PAGES)` for display.
- [ ] A new shared hook at `src/hooks/useRecordTrustPageVisit.ts` (new file, under 60 lines) accepts `{ path, label }` and calls `recordTrustPageVisit(path, label)` exactly once on mount inside a `useEffect(..., [])`, mirroring the ticket 0100 `useRecordVerticalVisit.ts` shape. Each of the twelve shipped trust-page components gains ONE additive `useRecordTrustPageVisit({ path: '/security', label: 'Security' })` call at the top of the component body. This is the ONLY edit to the shipped trust page files, and the label strings are authored ONCE in `src/data/trustPageLabels.ts` (new file, under 60 lines) and imported by both the trust pages and the `ReviewedTrustPagesCard` per the 2026-05-25 mirror-source rule. Per the 2026-09-12 code-beats-prose lesson, the implementer greps the actual set of trust-page files at branch head before touching (do not trust the "twelve" count in prose; if a trust page has been added or removed since 2026-09-30, mirror the real code list into `TRUST_ROUTES`).
- [ ] `src/pages/MyDashboard.tsx` gains ONE new `ReviewedTrustPagesCard` component (under `src/components/ReviewedTrustPagesCard.tsx` mirroring the ticket 0100 `RecentVerticalsCard` pattern) that renders BELOW the ticket 0100 recent-verticals card when `getReviewedTrustPages().length > 0`. The card renders (a) an H2 heading "Compliance you've reviewed", (b) a compact 2-column table with one row per stored trust page: label, last-visited date formatted `YYYY-MM-DD`, and a "Reopen" anchor whose href is the stored `path` firing `trackCTAClick('my_trust_reopen', 'my_dashboard')`. On a visitor with zero stored reviewed pages the entire card is null (no empty state, no nag). The card renders `data-testid="reviewed-trust-pages-card"` on the wrapper and `data-testid="reviewed-trust-page-row"` on each row per the 2026-09-06 VISIBLE_LIMIT lesson so row-count assertions can use `toHaveCount(N)`.
- [ ] The `dca_reviewed_trust_pages_v1` localStorage key is added to `src/data/demoDisclosures.ts` under the existing `NEW_PERSISTENT_STORES` constant per the ticket 0074 / 0076 / 0091 / 0093 / 0100 precedent AND (transitively via that constant's render loop on `/trust`) to the persistent-stores list rendered on `src/pages/Trust.tsx` per the ticket 0018 / 0033 honesty rule. The disclosure text names the key, the shape (path + label + lastVisitedAt), and the "client-side only, never leaves your browser" language mirroring the ticket 0100 recent-verticals disclosure.
- [ ] A new e2e spec at `tests/e2e/reviewed-trust-pages-card.spec.ts` (modeled on `tests/e2e/recent-verticals-card.spec.ts` from ticket 0100) asserts, using `gotoPath` helpers that wait for RouteFallback detach per the 2026-09-05 lesson AND for the target page's H1 mount signal per the 2026-09-10 lesson: (1) with an empty `dca_reviewed_trust_pages_v1`, `/my` renders WITHOUT the card (`page.getByTestId('reviewed-trust-pages-card')` has `toHaveCount(0)`), (2) after `page.evaluate` seeds three entries with valid trust paths (seeded via `page.evaluate` AFTER the first navigation per the 2026-09-28 addInitScript lesson, NOT via `context.addInitScript`), `/my` renders exactly three `data-testid="reviewed-trust-page-row"` rows with the labels visible, (3) each row's "Reopen" anchor href matches a path present in the imported `TRUST_ROUTES` from `src/data/trustPageLabels.ts` (mirror-source assertion per the 2026-06-07 rule), (4) visiting `/security` then navigating to `/my` renders exactly one row whose label is the shared label constant imported from `src/data/trustPageLabels.ts` (write-through case; the trust-page mount signal is the H1 visible per the 2026-09-10 lesson because trust pages are all lazy-loaded per the 2026-09-05 lesson), (5) revisiting a page with an already-recorded path moves the row to the top and does NOT create a duplicate (dedup case), (6) when the store holds 6 entries and a seventh trust page is visited, the oldest entry is evicted (FIFO evict case, `toHaveCount(6)` before and after; the seed is written once via `page.evaluate` AFTER the first `/my` navigation per the 2026-09-28 addInitScript-re-runs lesson so it survives the intermediate `page.goto('/hallucination-safeguards')` without being overwritten), (7) a seeded entry whose `path` is not in `TRUST_ROUTES` is filtered at read time and does NOT render (validation-allow-list case), (8) the rendered card body contains zero `String.fromCharCode(8212)` code points per the 2026-05-07 em-dash Hard NO, (9) dark mode renders cleanly via `document.documentElement.classList.add('dark')` and the card is still visible.
- [ ] Standard box: no `/api/` change, no new hostname (the store is localStorage only, no network), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any trust page beyond the one additive `useRecordTrustPageVisit` line at the top of the component body, no edits to any trust page's JSON-LD blocks, no edits to the shipped `/my` dashboard cards above the new insertion point. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the existing `tests/e2e/my-dashboard.spec.ts`, `tests/e2e/recent-verticals-card.spec.ts`, `tests/e2e/recent-compares-recap.spec.ts`, and every shipped `tests/e2e/trust-*.spec.ts` plus `tests/e2e/subprocessors.spec.ts`, `tests/e2e/security-*.spec.ts`, `tests/e2e/model-card-page.spec.ts`, `tests/e2e/agent-fleet-page.spec.ts`, `tests/e2e/ai-risks-we-watch.spec.ts`, `tests/e2e/accessibility-statement.spec.ts`, `tests/e2e/hallucination-safeguards.spec.ts`, `tests/e2e/ethics-page.spec.ts` all stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem
related.

- Standard anti-goals: no `/api/` changes, no `package.json` changes, no em-dashes in copy, dark-mode required.
- Recording visits to non-trust pages (comparison pages 0021/0028/etc., blog posts, vertical pages 0017-0096, case studies, the homepage, or the demo hub). Those surfaces already have their own persistence stores (0074 compares, 0091 blog posts, 0100 verticals, 0026 recent demos); this store is scoped strictly to the twelve trust-family routes.
- Recording visits to `/questions-to-ask-an-ai-vendor` (ticket 0061) or `/questions-to-ask-an-ai-vendor/scorecard` (ticket 0067). Those are buyer-side artifacts, not vendor-posture trust artifacts, so they belong in a distinct "buyer artifacts" retention store if telemetry justifies one; scoping the MVP to the vendor-posture trust family keeps the label copy on `/my` unambiguous ("Compliance you've reviewed").
- Adding a "trust checklist progress" indicator on `/my` showing "you have reviewed 3 of 12 compliance artifacts, review the remaining 9." Gamified completion is a distinct retention pattern; the MVP is a passive recall card only, per the ticket 0091 / 0100 precedent.
- Editing the twelve trust pages' JSON-LD blocks or visible copy beyond the one additive `useRecordTrustPageVisit` hook call at the top of each component. Every trust page stays byte-identical otherwise.
- Cross-device sync of reviewed trust pages so a visitor sees the same list on desktop and phone. The store is browser-local per the privacy posture of the sibling stores; cross-device sync requires a backend account surface.
- Emitting a `Dataset` or `ItemList` JSON-LD block for the reviewed-trust-pages card on `/my`. `/my` is a retention surface, not an SEO surface (per the ticket 0045 precedent) and adding a public JSON-LD block for private client-side state would misrepresent the artifact.
- Emailing the reviewed-trust-pages list to the visitor. The ticket 0082 dossier JSON export already covers programmatic access and will transitively pick up the new store per the ticket 0082 everything-in-one-dossier pattern; the ticket 0101 mailto CTA will also transitively pick up the new store on the next groom of its composer.
- A "recommended next trust page" chip that suggests an unreviewed trust artifact. That "unreviewed suggestion" derivation is its own follow-up ticket (mirroring the ticket 0074 `suggestNextCompare` pattern) once telemetry justifies it.
- Persisting reviewed trust pages older than the 6-entry FIFO cap. A larger cap or an archive tab is a follow-up ticket once telemetry justifies it.
- Fabricated trust-page labels seeded from UTM, industry guess, or company name. Every label comes from the shared `src/data/trustPageLabels.ts` constant, one per shipped trust route.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev
doesn't have to re-discover the architecture.

- New `src/utils/reviewedTrustPagesStore.ts` (under 200 lines). Copy the shape of `src/utils/recentVerticalsStore.ts` (ticket 0100): parse-safe read via an `isReviewedTrustPage` type guard, dedup-by-path append that moves an existing entry to the front, quota-tolerant write. The `TRUST_ROUTES` allow-list import is `src/data/trustPageLabels.ts`. Per the 2026-09-10 raw-vs-sliced lesson keep a private `readAllReviewed()` helper; expose `getReviewedTrustPages()` as `readAllReviewed().slice(0, MAX_REVIEWED_TRUST_PAGES)`.
- New `src/data/trustPageLabels.ts` (under 60 lines). Export a `TRUST_PAGE_LABELS` const-record keyed by path (e.g. `'/security': 'Security'`, `'/subprocessors': 'Subprocessors'`, `'/accessibility-statement': 'Accessibility Statement'`, `'/hallucination-safeguards': 'Hallucination Safeguards'`) covering all twelve shipped trust routes. Also export `TRUST_ROUTES: readonly string[]` computed from `Object.keys(TRUST_PAGE_LABELS)` so the allow-list and the label map cannot drift. Per the 2026-05-25 mirror-source rule, this is the single source rendered on both the trust pages' `useRecordTrustPageVisit` call and the `ReviewedTrustPagesCard`. Per the 2026-09-12 code-beats-prose lesson, the implementer greps the actual `src/data/routes.ts` and the actual set of trust page files at branch head before locking the label map; if a trust page has been added since 2026-09-30 the new one is included, and if a trust page has been renamed the label mirrors the shipped H1.
- New `src/hooks/useRecordTrustPageVisit.ts` (under 60 lines). Signature: `useRecordTrustPageVisit({ path, label }: { path: string; label: string }): void`. Fires `recordTrustPageVisit(path, label)` exactly once on mount via `useEffect(() => { ... }, [])`. Per the 2026-09-10 mount-signal lesson the hook does NOT rely on any router-side signal.
- Additive edit to each of the twelve shipped trust page components (`Trust.tsx`, `Uptime.tsx`, `Subprocessors.tsx`, `Ethics.tsx`, `Security.tsx`, `HowWeShip.tsx`, `ModelCard.tsx`, `AgentFleet.tsx`, `AiRisksWeWatch.tsx`, `AccessibilityStatement.tsx`, `HallucinationSafeguards.tsx`, plus a twelfth if the branch-head grep reveals one). Add one `useRecordTrustPageVisit({ path: <route>, label: TRUST_PAGE_LABELS[<route>] })` call at the top of the component body. Grep the actual file list at branch head per the 2026-09-12 code-beats-prose lesson.
- New `src/components/ReviewedTrustPagesCard.tsx` (under 120 lines). Mirror the ticket 0100 `RecentVerticalsCard` shape verbatim; reads `getReviewedTrustPages()` once on mount into local state.
- `src/pages/MyDashboard.tsx` gains one new `ReviewedTrustPagesCard` render block placed directly BELOW the ticket 0100 `RecentVerticalsCard` render block. Grep the file at branch head to locate the ticket 0100 insertion point.
- `src/data/demoDisclosures.ts` gains one new entry describing the `dca_reviewed_trust_pages_v1` key per the ticket 0074 / 0091 / 0093 / 0100 disclosure convention. Append to the `NEW_PERSISTENT_STORES` constant so the `/trust` render loop picks it up automatically.
- Per the 2026-05-30 second-@type lesson, this ticket adds NO new JSON-LD blocks. The pre-code grep is a no-op; record "no new JSON-LD blocks added" in the Implementation log for auditability.
- Per the 2026-05-07 em-dash Hard NO, every string in the new util, the label map, the card, the disclosure additions, and the spec is hyphen-only. Self-Review greps the diff for `String.fromCharCode(8212)`.
- Per the 2026-09-06 VISIBLE_LIMIT lesson, the new spec's row-count assertion uses `toHaveCount(N)` over the seeded-then-read state, NOT `count > 0` over the live derived state.
- Per the 2026-09-28 Playwright `addInitScript` re-runs lesson, the FIFO evict case seeds `dca_reviewed_trust_pages_v1` via `page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, JSON.stringify(rows)])` AFTER the first `page.goto('/my')` (or equivalent same-origin URL), NOT via `context.addInitScript`. The 2026-09-28 lesson makes it explicit: `addInitScript` re-fires on every navigation and would overwrite the mount-effect write from the mid-test `page.goto('/hallucination-safeguards')`.
- Per the 2026-06-07 mirror-source-across-src-tests lesson, the spec imports `TRUST_PAGE_LABELS` and `TRUST_ROUTES` from `src/data/trustPageLabels.ts` directly; do NOT hand-roll copies in the test file.
- `tests/e2e/reviewed-trust-pages-card.spec.ts` (new), one assertion per acceptance box, modeled on `tests/e2e/recent-verticals-card.spec.ts` (ticket 0100).
- Per the 2026-05-22 two-PR ship lesson, ship needs a follow-up `chore/0104-ship-status` PR after the feat PR merges to flip the ticket frontmatter AND its `docs/backlog/README.md` index row to `shipped` together; run `node scripts/check-backlog.mjs` before pushing the second PR.
- New deps: NO. The store reuses `localStorage`; the card reuses `react-router-dom`, `lucide-react`, and Tailwind utilities already in use on `/my`. Schema migration: no. Privacy / security surface change: YES, the new `dca_reviewed_trust_pages_v1` key is added to `NEW_PERSISTENT_STORES` and rendered on `/trust` in the same PR per the honesty rule; no data leaves the browser.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0104-...` opened
- YYYY-MM-DD - failing test added in `tests/e2e/reviewed-trust-pages-card.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
