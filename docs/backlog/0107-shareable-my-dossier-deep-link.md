---
id: 0107
title: Shareable /my dossier via deep-link URL fragment that hydrates every persisted artifact into a recipient's dashboard
status: shipped
priority: P1
area: demos
created: 2026-10-02
owner: gtm-innovation
---

## User story

As a returning buyer who has already built a thick evaluation dossier on
Digital Craft (a construction GC's procurement lead with a saved estimate,
a saved ROI result, a quiz persona, and three reviewed trust pages; a
franchise VP's assistant who has pinned four comparison pages and read
six blog posts; a real-estate acquisitions lead who has run two ROI
scenarios and three deal analyses) and now needs to loop in a counsel, a
CFO, a procurement peer, or an insurance underwriter without opening a
Zoom share or inviting them to a login flow Digital Craft does not have,
I want one "Copy a shareable dashboard link" button on `/my` that encodes
every persisted artifact into a compact URL fragment, so that when I
paste the resulting `digitalcraftai.com/my#dossier=...` URL into Slack or
email the recipient opens it in a fresh browser and sees the exact same
dashboard cards I was looking at (my saved estimate, my saved ROI, my
quiz persona, my recent demos, my reviewed trust pages) with a clear
banner naming that the dossier was imported from a shared link.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the dashboard composer at
`src/pages/MyDashboard.tsx` plus the ticket 0082 `buildEvaluationDossier()`
in `src/utils/evaluationDossier.ts` already produce a typed in-memory
JSON object that bundles every persisted artifact on the site (saved
estimate, saved ROI, quiz persona, quiz history, recent demos, recent
compares, visit streak); ticket 0082 also already ships the "Download
JSON" button that serializes that dossier to a file. What is missing is
the recipient-side half: a copy-link path that encodes the SAME dossier
into a URL fragment (not a query string, so it never reaches the
server) and a mount-time hydrator on `/my` that detects the fragment,
writes the artifacts back into their owning localStorage keys through
each store's existing public setter, and renders a clear "This dashboard
was imported from a shared link" banner the recipient can dismiss or
accept. Adding the share mechanic is exactly one new util
(`src/utils/shareableDossier.ts` wrapping encode/decode on top of the
existing `buildEvaluationDossier()`), one additive button on `/my`, one
additive mount-effect hydrator on `/my`, one additive import-confirmation
banner, one new entry in `NEW_PERSISTENT_STORES` disclosing that
localStorage can be re-populated by a shared link, and one new spec.
Zero new backend, zero new dependency, zero new store, zero new JSON
schema version bump (the share payload re-uses the ticket 0082
`DOSSIER_SCHEMA_VERSION`).

### Stakeholder

This widens the moat in the viral-share dimension that the ticket 0009
shareable estimate link and the ticket 0046 shareable ROI link opened
for individual artifacts. The site already ships four shareable-single-
artifact links (0009 estimate, 0029 voice summary, 0046 ROI, 0052 quiz
tier) but no shareable BUNDLE link that composes the whole evaluation.
The procurement workflow a real buyer runs is almost always a BUNDLE:
"here is my estimate PLUS my ROI PLUS the two compliance pages I
checked" is the real forward, and the current state forces four separate
link copies that the recipient must reassemble by eye. One compact share
link flipped from four is the shortest path from "I built a dossier" to
"my counsel is reading the same dossier two minutes later." Per the
2026-05-25 mirror-source rule the share URL is the EXACT same dossier
the ticket 0082 JSON download emits (both read `buildEvaluationDossier`
once), so a recipient opening the share link sees byte-identical data
to a recipient downloading the dossier file. Per the ticket 0082 /
0045 honesty rule the recipient-side hydration appears in
`NEW_PERSISTENT_STORES` on `/trust` disclosing that a shared link can
populate the recipient's localStorage with the sender's artifacts, so
the privacy posture stays transparent.

### User (in the real moment of use)

A construction GC's procurement lead opens `/my` on her laptop Thursday
afternoon. She sees her saved estimate ($180,000 school-remodel bid),
her saved ROI result (37-hour weekly reclamation), her Getting Smart
quiz persona card, and her three reviewed trust pages (Security,
Subprocessors, Accessibility Statement). She wants her CFO on the call
Monday morning to open the same cards without her re-walking him
through the demos. She clicks a new "Copy a shareable dashboard link"
chip inside the printable-recap toolbar (next to the ticket 0066 print
button and the ticket 0082 download-JSON button). A toast confirms
"Copied: dashboard link with 4 artifacts" and a copy of
`https://digitalcraftai.com/my#dossier=eyJz...` lands on her clipboard.
She pastes the URL into a Slack DM with the CFO. He opens the URL on
his phone Monday morning. The dashboard renders exactly her four cards
with a dismissible banner at the top: "This dashboard was imported from
a shared link (4 artifacts, imported 2026-10-05, from your clipboard).
Keep imported data or restore your own." He taps "Keep imported data."
The cards stay. He scrolls to the ticket 0101 strategy-call mailto CTA
at the bottom and books. Light and dark mode both read cleanly; the
share-link path works entirely in the browser with no network round
trip; the fragment is `#dossier=` not `?dossier=` so the payload never
leaves the browser's URL bar; the fragment is bounded (hard cap at
32KB to stay inside URL length constraints) so a visitor with an
oversized dossier sees a clear "dossier too large to share, download
JSON instead" message that routes to the ticket 0082 download button.

### Growth

The "show me" moment is a procurement lead pasting the share URL into a
peer-approval Slack with the one-line note "same dossier I built; open
on your phone, click Keep." That single peer forward is the exact
mechanic the ticket 0009 estimate link and the ticket 0046 ROI link
proved for single artifacts, lifted to the whole evaluation bundle;
each bundle share is worth two to four times the single-artifact share
because it skips the three-forward reassembly the recipient would
otherwise have to run manually. Clicks on the new "Copy a shareable
dashboard link" button fire as a distinct `trackCTAClick` event
(`my_dashboard_share_link`) and the mount-time hydrator fires its own
distinct event (`my_dashboard_shared_link_imported`) so share-receive
rate is measurable in GA. Per the ticket 0082 precedent the share
URL is the only "export" surface that can be forwarded without the
recipient downloading a file; most procurement workflows block
attachments, so a URL is strictly more deliverable than a JSON file.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests
against this list before writing code.

- [ ] A new util at `src/utils/shareableDossier.ts` (new file, under 160 lines) exports `encodeDossierToFragment(dossier: EvaluationDossier): string` (returns a base64url-encoded, UTF-8-safe payload of `JSON.stringify(dossier)`), `decodeDossierFromFragment(fragment: string): EvaluationDossier | null` (parse-safe, returns null on malformed or stale-schema input), and `MAX_FRAGMENT_BYTES = 32_768`. Both functions use the browser-native `TextEncoder` / `TextDecoder` + `btoa` / `atob` pair with the standard base64url alias (`+` -> `-`, `/` -> `_`, strip `=`); no new dependency. On decode, a `schemaVersion` mismatch against the ticket 0082 `DOSSIER_SCHEMA_VERSION` returns null (never throws). Per the 2026-05-25 mirror-source rule, the encode function reads `buildEvaluationDossier()` from `src/utils/evaluationDossier.ts` and does NOT hand-roll a second composition path.
- [ ] A new util at `src/utils/importShareableDossier.ts` (new file, under 180 lines) exports `importDossierToLocalStorage(dossier: EvaluationDossier): { importedKeys: string[] }` which writes each non-null artifact in the dossier back through each owning store's existing public setter (`saveLastEstimate` for estimate, `saveLastRoiResult` for roi, `saveQuizPersona` for quizPersona, `saveQuizHistoryEntry` for each quiz history entry, `recordDemoVisit` for each recent demo, `recordCompareVisit` for each recent compare, `recordVisit` for visit streak). Per the 2026-09-10 raw-vs-sliced lesson the hydrator does NOT bypass each store's validation and allow-list guards; a dossier entry whose path is not in the owning store's allow-list is dropped at import time and NOT persisted. Each store's own quota-tolerant and parse-safe write is reused; this util is purely a composer of existing setters. The `importedKeys` return array lists the localStorage keys actually written so the banner can render "4 artifacts imported" using the real count.
- [ ] A new "Copy a shareable dashboard link" button on `/my` (`src/pages/MyDashboard.tsx`) placed in the toolbar next to the ticket 0066 print button and the ticket 0082 download-JSON button, carrying `data-testid="dashboard-share-link-copy"`. On click: the button calls `encodeDossierToFragment(buildEvaluationDossier())`, builds a URL of the form `${location.origin}/my#dossier=${fragment}`, writes it to the clipboard via `navigator.clipboard.writeText()`, fires `trackCTAClick('my_dashboard_share_link', 'my_dashboard_recap')`, and renders a dismissible toast "Copied: dashboard link with N artifacts" where N is the count of non-null artifact slots. If the fragment length exceeds `MAX_FRAGMENT_BYTES`, the button renders a dismissible warning banner "Dossier too large to share as a link - download JSON instead" that links to the ticket 0082 download-JSON button, and does NOT write a truncated URL to the clipboard.
- [ ] A mount-time hydrator in `/my` reads `window.location.hash` on first mount. If the hash matches `/^#dossier=/`, the hydrator (a) decodes the fragment via `decodeDossierFromFragment`, (b) if the decode succeeds, calls `importDossierToLocalStorage(dossier)` BEFORE the dashboard's own `useState` initial-render reads the stores, so the imported artifacts are visible on the first paint, (c) fires `trackCTAClick('my_dashboard_shared_link_imported', 'my_dashboard_recap')`, (d) renders a dismissible banner at the top of the dashboard: "This dashboard was imported from a shared link (N artifacts, imported YYYY-MM-DD). Keep imported data or restore your own." with `data-testid="dashboard-shared-link-import-banner"`. The banner's "Keep imported data" button is a no-op dismiss; the "Restore your own" button clears every imported key via the owning store's `clear*` setter and refreshes the dashboard. If decode fails, the hydrator is a no-op (no banner, no clear, no toast) so a malformed link cannot clobber the recipient's existing dashboard.
- [ ] A new entry in `NEW_PERSISTENT_STORES` under `src/data/demoDisclosures.ts` disclosing that opening a `/my#dossier=...` URL can populate the recipient's localStorage with the sender's persisted artifacts. The disclosure names (a) the per-key list the import touches (every key the ticket 0082 dossier covers), (b) the "import never writes any key the owning store would reject" guard, (c) the "Restore your own" button that clears every imported key. Per the ticket 0018 / 0033 / 0100 honesty rule, every new write-path that the site exposes appears in `NEW_PERSISTENT_STORES` and is rendered on `/trust` in the same PR.
- [ ] The share-link path is end-to-end offline: no new hostname, no new API endpoint, no new serverless function. The fragment lives in the URL hash (`#`), which is NEVER sent to the server by any browser's HTTP request. Per the AGENTS.md Hard NO this change does not touch `/api/`, `.env*`, or any dependency manifest. The clipboard write is browser-native; the share-URL hydrate is browser-native; the banner is a React component.
- [ ] A new e2e spec at `tests/e2e/shareable-my-dossier.spec.ts` (modeled on `tests/e2e/shareable-estimate.spec.ts` from ticket 0009 and `tests/e2e/recent-verticals-card.spec.ts` from ticket 0100 for the seed-then-navigate shape) asserts, using a `gotoMy(page)` helper that waits for RouteFallback detach per the 2026-09-05 lesson and the dashboard H2 mount signal per the 2026-09-10 lesson: (1) with an empty `/my` (every store cleared), the "Copy a shareable dashboard link" button renders but opening its toast says "Copied: dashboard link with 0 artifacts" and the URL hash on the clipboard decodes to a dossier whose every artifact slot is null or empty-array, (2) after seeding one estimate, one roi, and one quiz persona via each store's public setter (via `page.evaluate` AFTER the first navigation per the 2026-09-28 addInitScript-re-runs lesson, NOT via `context.addInitScript`), clicking the button writes a URL to the clipboard whose fragment decodes to a dossier containing exactly those three non-null artifacts, (3) pasting the resulting URL into a FRESH browser context (a second Playwright context with empty localStorage) and navigating to it renders the dashboard with the three seeded artifact cards AND renders the import banner with text "3 artifacts" (`toHaveCount(1)` per the 2026-09-06 VISIBLE_LIMIT lesson, NOT `count > 0`), (4) clicking "Restore your own" on the banner clears the three imported keys and renders the empty-state dashboard, (5) a fragment whose payload is not valid base64url (`#dossier=!!!bad!!!`) is a silent no-op (no banner, no clear, no toast), (6) a fragment whose decoded JSON has a `schemaVersion` that does not match `DOSSIER_SCHEMA_VERSION` is a silent no-op, (7) a dossier whose encoded fragment exceeds `MAX_FRAGMENT_BYTES` (seeded via a bulk-insert of recent-compares entries) does NOT write a URL to the clipboard; the oversized-warning banner renders with `data-testid="dashboard-share-link-oversized"` and `toHaveCount(1)`, (8) the imported-dossier banner renders zero `String.fromCharCode(8212)` em-dashes per the 2026-05-07 em-dash Hard NO, (9) the share-link copy button and the import banner render cleanly in both light and dark mode (`html.dark` toggle), (10) per the 2026-06-07 mirror-source-across-src-tests lesson the spec imports `DOSSIER_SCHEMA_VERSION` from `src/utils/evaluationDossier.ts` and `MAX_FRAGMENT_BYTES` from `src/utils/shareableDossier.ts` directly rather than hand-rolling copies, (11) the ticket 0082 download-JSON button on `/my` stays byte-identical in label, position, and emitted JSON shape (regression check), (12) per the 2026-05-30 second-@type lesson, this ticket adds no new JSON-LD block; the pre-code grep is a no-op and the Implementation log records "no new JSON-LD blocks added."
- [ ] Standard box: no `/api/` change, no new hostname (the fragment lives in the URL hash and is never sent over HTTP), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any shipped store's internal shape (the import composer is a pure consumer of each store's existing public setter), no edits to the ticket 0082 JSON download logic beyond the one new sibling button in the same toolbar. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; `tests/e2e/my-dashboard.spec.ts`, `tests/e2e/shareable-estimate.spec.ts`, `tests/e2e/shareable-roi.spec.ts`, and every shipped `tests/e2e/recent-*.spec.ts` stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem
related.

- Standard anti-goals: no `/api/` changes, no `package.json` changes, no em-dashes in copy, dark-mode required.
- A server-side share-URL mint (e.g. a `/api/share-dossier` endpoint that returns a short URL). The share link is fragment-only by design so no server ever sees the payload; a short-URL service is a distinct ticket requiring a URL-mint backend.
- A cross-device dossier sync. The share link is a one-shot forward, not a continuous sync; the recipient's imported dossier is their own copy, not a mirror of the sender's live dashboard. True sync requires an account surface.
- An "import without confirming" auto-accept path. Every imported dossier renders the dismissible banner so a recipient knows the state was imported from a link; a silent-import mode risks confusing a recipient who thinks the dashboard is their own.
- A password-gated share link. The URL fragment is public to anyone who holds the URL; sender-side control is the "don't paste the link to the wrong channel" discipline, not a password gate.
- An expiring share link. Fragment-only payloads carry no expiration metadata that the client could trust (any `expiresAt` field inside the dossier is trivially editable before the paste); real expiration requires a server-side mint. A sender who wants to invalidate a share link must regenerate their artifacts.
- A share-link that imports only a subset of artifacts (e.g. "share only estimate and roi"). The MVP ships whole-dossier share; per-slot share is a follow-up ticket.
- A share-link QR code. QR-code imaging is a distinct retention surface and can be added later as a thin wrapper around the same URL.
- A compare-page share link or a changelog share link. The dossier is scoped to `/my` artifacts only; a shareable compare-page URL is covered by the existing route; a shareable changelog URL is covered by ticket 0032.
- Editing any of the seven artifact stores' internal shape, serialization format, or schemaVersion. The import composer is a pure consumer of each store's existing public setter.
- Emitting a JSON-LD block describing the share-link capability. Share mechanics are a UI surface, not a canonical artifact; a JSON-LD block would misrepresent the artifact per the AGENTS.md conservative-claims rule.
- Rendering the banner on any page besides `/my`. The import-detection runs only on the `/my` route per the ticket 0045 dashboard scope.
- Persisting an "I imported a dossier from a share link" audit trail inside `dca_*` localStorage. Audit logging is its own ticket and risks a recursion with the retention policy ticket 0105.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't
have to re-discover the architecture.

- New `src/utils/shareableDossier.ts` (under 160 lines). Pure encode/decode plus `MAX_FRAGMENT_BYTES` constant. Use `TextEncoder`/`TextDecoder` + base64url manual char-swap (`+`->`-`, `/`->`_`, strip `=`) to avoid a dependency. Per the 2026-05-25 mirror-source rule, the module imports `DOSSIER_SCHEMA_VERSION` from `src/utils/evaluationDossier.ts` and never re-declares it.
- New `src/utils/importShareableDossier.ts` (under 180 lines). One function `importDossierToLocalStorage(dossier)` that composes each store's existing public setter. Per the 2026-09-12 code-beats-prose lesson, the implementer greps each store file at branch head for its public setter signature BEFORE wiring (`src/pages/construction/lastEstimateStore.ts`, `src/utils/roiResultStore.ts`, `src/utils/quizPersonaStore.ts`, `src/utils/quizHistoryStore.ts`, `src/utils/recentDemosStore.ts`, `src/utils/recentComparesStore.ts`, `src/utils/visitStreakStore.ts`); the setter names in the acceptance criteria are placeholders and MUST be pinned to real exports.
- `src/pages/MyDashboard.tsx` - add one new toolbar button next to the existing ticket 0066 print button and ticket 0082 download-JSON button. The button's handler reads `buildEvaluationDossier()`, encodes to a fragment, writes to clipboard, fires the tracker, and shows a toast. If the fragment length exceeds `MAX_FRAGMENT_BYTES`, render the oversized-warning banner INSTEAD of writing a truncated URL to the clipboard.
- `src/pages/MyDashboard.tsx` - add a mount-time hydrator inside the top-level dashboard component that reads `window.location.hash` BEFORE the dashboard's own `useState` initial-render reads the stores, so the imported artifacts are already on disk when the dashboard composes its cards. Per the 2026-09-05 route-code-splitting lesson, the hydrator runs inside a `useLayoutEffect` so it fires on first paint of the lazy-loaded dashboard chunk. The hydrator imports `decodeDossierFromFragment` and `importDossierToLocalStorage` from the new utils.
- New `src/components/SharedDossierImportBanner.tsx` (under 100 lines). A dismissible banner matching the ticket 0045 banner styling. Exports `data-testid="dashboard-shared-link-import-banner"` and renders the two action buttons ("Keep imported data" dismiss, "Restore your own" clear-and-refresh).
- `src/data/demoDisclosures.ts` - add one new entry to `NEW_PERSISTENT_STORES` disclosing the share-link write-path. Per the ticket 0100 / 0104 honesty rule the disclosure is additive and does not touch any existing entry.
- Per the 2026-05-25 mirror-source rule, the encode and the ticket 0082 JSON download read from the SAME `buildEvaluationDossier()` call. The share URL and the downloaded JSON are byte-identical for the same dashboard state.
- Per the 2026-05-30 second-@type lesson, this ticket adds no new JSON-LD block; the pre-code grep is a no-op. Record "no new JSON-LD blocks added" in the Implementation log for auditability.
- Per the 2026-09-05 route-code-splitting lesson, the new spec's `gotoMy` helper waits for the RouteFallback to detach AND for the dashboard H2 to be visible before reading. The mount-time hydrator fires BEFORE the dashboard's own `useEffect` reads the stores, so the import-time ordering is deterministic.
- Per the 2026-09-28 addInitScript-re-runs lesson, every seeded localStorage state in the new spec is written via `page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, VALUE])` AFTER the first same-origin navigation, NOT via `context.addInitScript`. The box-3 cross-context test uses a second Playwright context (via `browser.newContext`) and seeds nothing on that context so the import-from-URL path is the only mutation.
- Per the 2026-09-06 VISIBLE_LIMIT lesson, every count assertion in the new spec uses `toHaveCount(N)` over the import composer's return value or the dossier's artifact slot count, NOT `count > 0`.
- Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson: not directly applicable (no new JSON-LD block), but the em-dash check in box 8 scopes to the two new components (import banner + oversized banner), not to every DOM text node, so the homepage Organization block's legitimate em-dash is not flagged.
- Per the 2026-06-15 attribute-list regex lesson, any regex in the new spec that matches an XML/HTML attribute list uses `[^>]*`, not `[^/>]*`.
- Per the 2026-09-26 static-file MIME-shim lesson: NOT applicable here, no new static extension is introduced (the share URL is a client-side fragment, not a served file). Record "no new static extension shipped" in the Implementation log for auditability.
- Per the 2026-06-07 mirror-source-across-src-tests lesson, the spec imports `DOSSIER_SCHEMA_VERSION`, `MAX_FRAGMENT_BYTES`, `encodeDossierToFragment`, and `decodeDossierFromFragment` from the real util files directly; do NOT hand-roll copies in the test file.
- `tests/e2e/shareable-my-dossier.spec.ts` (new), one assertion per acceptance box, modeled on `tests/e2e/shareable-estimate.spec.ts` (ticket 0009) for the clipboard-copy shape and `tests/e2e/recent-verticals-card.spec.ts` (ticket 0100) for the seed-then-navigate shape.
- Per the 2026-05-22 two-PR ship lesson, ship needs a follow-up `chore/0107-ship-status` PR after the feat PR merges to flip the ticket frontmatter AND its `docs/backlog/README.md` index row to `shipped` together; run `node scripts/check-backlog.mjs` before pushing the second PR.
- New deps: NO. The share path uses `TextEncoder`, `TextDecoder`, `btoa`, `atob`, `navigator.clipboard.writeText`, and `window.location.hash`, all browser-native. Schema migration: no (the share payload reuses the ticket 0082 `DOSSIER_SCHEMA_VERSION`). Privacy / security surface change: YES, a new write-path into localStorage is exposed via URL fragment; the `NEW_PERSISTENT_STORES` entry disclosing this surface ships in the same PR per the honesty rule; no data leaves the browser.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-10-02 - branch `feat/0107-shareable-my-dossier-deep-link` opened; ticket frontmatter + README index row flipped to `in-progress` in one commit (2026-05-22 check-backlog rule); `node scripts/check-backlog.mjs` green.
- 2026-10-02 - failing test added FIRST at `tests/e2e/shareable-my-dossier.spec.ts` (12 cases, one per acceptance box). Spec imports `DOSSIER_SCHEMA_VERSION` from `src/utils/evaluationDossier.ts` and `MAX_FRAGMENT_BYTES` + `encodeDossierToFragment` + `decodeDossierFromFragment` from `src/utils/shareableDossier.ts` directly (2026-05-25 mirror-source + 2026-06-07 src-imports-tests lessons). Em-dash U+2014 spelled via `String.fromCharCode(8212)` (2026-05-07 Hard NO). Seed strategy writes localStorage via `page.evaluate` AFTER the first same-origin navigation (2026-09-28 addInitScript-re-runs lesson). `gotoMy` waits for the dashboard H1 to be visible (2026-09-10 mount-signal lesson) rather than relying on `root.innerHTML.length > 500` alone (which trips on the RouteFallback shell per the 2026-09-05 lesson).
- 2026-10-02 - code shipped. New files: `src/utils/shareableDossier.ts` (pure encode/decode + `MAX_FRAGMENT_BYTES = 32_768`), `src/utils/importShareableDossier.ts` (pure composer calling each store's existing public setter), `src/components/SharedDossierImportBanner.tsx` (dismissible banner with "Keep imported data" + "Restore your own" actions). Edited `src/pages/MyDashboard.tsx` (new always-visible toolbar with "Copy a shareable dashboard link" button + mount-time `useLayoutEffect` hydrator reading `window.location.hash` BEFORE the dashboard's own `useEffect` reads the stores) and `src/data/demoDisclosures.ts` (one new entry in `NEW_PERSISTENT_STORES` disclosing the shared-link write-path). No `/api/`, `.env*`, `package.json`, or `package-lock.json` edits.
- 2026-10-02 - setter-name deviations recorded per the 2026-09-12 code-beats-prose rule. The ticket's acceptance criteria named placeholder setters; the composer pins to the REAL exports grepped at branch head:
   - `saveQuizPersona` -> actual: `setQuizPersona(persona, completedAt)` at `src/utils/quizPersonaStore.ts:36`.
   - `saveQuizHistoryEntry` -> actual: `appendQuizHistory(entry)` at `src/utils/quizHistoryStore.ts:109`.
   - `recordVisit` -> actual: `recordVisitToday()` (0-ary, records only today's UTC date) at `src/utils/visitStreakStore.ts:81`. Historical sender visit days cannot be restored losslessly through this 0-ary setter, AND the recipient's own dashboard-mount effect already calls `recordVisitToday()` on mount, so the import composer SKIPS the visitStreak slot entirely to avoid double-counting the recipient's own visit. `countPopulatedArtifacts` likewise excludes the visitStreak slot so an empty `/my` reports "0 artifacts" (matching acceptance box 1) and a sender with exactly estimate+roi+quizPersona reports "3 artifacts" (matching acceptance box 3).
- 2026-10-02 - the quizPersona, roiResult, and (unused) visitStreak stores do not export a `clear*` setter. The `clearImportedDossier` function in `src/utils/importShareableDossier.ts` falls back to `localStorage.removeItem` on each owning key for the two stores without a `clear*` export; stores with a `clear*` export use it (`clearLastEstimate`, `clearQuizHistory`, `clearRecentDemos`, `clearRecentCompares`). The ticket said "clears every imported key via the owning store's `clear*` setter"; the deviation is noted here. Byte-reversibility against the import write path is preserved: every key the import wrote is cleared by the restore button.
- 2026-10-02 - "no new JSON-LD blocks added" for auditability (2026-05-30 second-@type lesson); the pre-code grep over existing `tests/e2e/*-jsonld.spec.ts` cases returned the two blocks that already run on `/my` (BreadcrumbList + WebPage from ticket 0045), both of which stay byte-identical. Box 12 of the new spec asserts the exact set.
- 2026-10-02 - "no new static extension shipped" for auditability (2026-09-26 static-file MIME-shim lesson); the share URL is a client-side `#dossier=` fragment, not a served file, so no `vite.config.ts` MIME shim and no `vercel.json` headers edit are needed.
- 2026-10-02 - full local gate green: `npm run lint && npm run typecheck && npm run check-links && npm run check-images && npm run check-meta && npm run check-blog-dates && node scripts/check-backlog.mjs && npm run build`. New e2e spec passes (12/12). Pre-existing flake on `tests/e2e/my-dashboard.spec.ts:379` (empty-state em-dash test) is reproducible on `main` with `git stash && npx playwright test ... -g "empty state"`, outside this diff, and per the 2026-05-25 flake lesson is not blocking.
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
