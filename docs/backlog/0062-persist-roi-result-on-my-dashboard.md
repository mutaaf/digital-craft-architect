---
id: 0062
title: Persist the visitor's last ROI calculator result and surface it as a saved card on /my dashboard
status: in-progress
priority: P1
area: demos
created: 2026-06-19
owner: gtm-innovation
---

## User story

As a returning prospect (a construction-company owner who
opened the ROI calculator last Friday on a phone while
waiting at a job-site, dialed in 60 leads a week and 12
minutes per lead, saw an annual savings figure that made
them pause, then closed the tab and forgot the URL by
Monday morning), I want my last ROI calculator inputs and
the computed annual savings figure to persist
automatically in my browser and surface as one saved card
on the `/my` dashboard when I come back Monday, so that I
can reopen the saved result with one tap, see the same
dollar figure I saw Friday, share the reconstructed URL
with my partner, and pick up the strategy-call decision
without re-entering the four inputs from memory.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the ROI calculator
(ticket 0046) already has a shareable URL-based
encode/decode pipeline (`src/pages/roiCalculatorParams.ts`
exports `RoiInputs`, `encodeRoiParams`, `decodeRoiParams`,
`computeRoi`) but writes ZERO bytes to localStorage. Every
sibling retention surface DOES persist: the estimate
calculator persists to `dca_last_estimate_v1_<vertical>`
(ticket 0014's `lastEstimateStore`), the quiz tier
persona persists to `dca_quiz_persona_v1` (ticket 0045's
`quizPersonaStore`), demo visits persist to
`dca_recent_demos_v1` (ticket 0026's `recentDemosStore`).
The `/my` dashboard (ticket 0045) surfaces ALL THREE
sibling stores as cards but cannot surface the ROI result
because there is nothing to read. This ticket adds the
smallest possible store
(`src/utils/roiResultStore.ts`, mirroring the shape of
`quizPersonaStore.ts`), wires a one-line
`saveLastRoiResult(inputs)` call into the existing
`RoiCalculator` component at a debounced cadence so a
visitor who types four inputs and walks away has their
last bundle persisted, and renders one new card on `/my`
that shows the saved annual-savings dollar figure with a
"Reopen result" button that reconstructs the share URL
via the existing `encodeRoiParams` helper. One new util,
one additive edit each to `RoiCalculator.tsx` and
`MyDashboard.tsx`, one additive edit to `Trust.tsx`'s
persistent-store disclosure list and to
`src/data/demoDisclosures.ts` if the chip applies, zero
new backend, zero new dependency, no edit to `/api/`, no
edit to the existing dashboard data flows beyond the new
card.

### Stakeholder

This widens the moat in the retention dimension that the
ticket 0045 dashboard opened but did not fully close.
Ticket 0045 made `/my` a canonical retention URL the
visitor can bookmark, surfacing the saved estimate, the
recent demos, and the quiz persona; ticket 0060 added
the visit-streak badge as a calm engagement signal.
Neither surface today reflects the ROI calculator
result, which is structurally the highest-intent
conversion artifact the site produces (a visitor who
typed in four real business inputs has self-qualified
as a serious prospect, harder than someone who just
tried a chat demo). Surfacing the saved ROI result on
`/my` is the single highest-leverage cross-artifact
recap the dashboard can carry, because the saved
dollar figure is the artifact most likely to convert
the visitor on a return visit (a saved $42,000-per-
year figure is the kind of number a CFO actually
recalls). Per the ticket 0045 Out of Scope language
("a saved-ROI card on the visitor dashboard is a
follow-up ticket once the ROI calculator persists its
last submission"), this is pre-authorized follow-up
work. The 14-day rolling window of the visit-streak
badge (ticket 0060) and the cross-vertical recap of
`recentDemosStore` already prove that surfacing
multiple retention signals on one URL is the moat
strategy; this ticket completes the saved-artifact
quartet on `/my` (estimate, demos, quiz, ROI). The new
localStorage key (`dca_last_roi_result_v1`) is added
to the `/trust` data-handling disclosure list in the
same PR per the ticket 0018 / 0033 / 0045 / 0060
honesty rule that every persistent store appears in
the disclosure.

### Visitor (in the real moment of use)

A construction-company owner who typed `60 / 8 / 75 /
35` into the ROI calculator last Friday on a phone and
saw `$54,672 per year` opens `/my` from a bookmark on
Monday morning. The dashboard renders the existing
streak badge ("Visiting 3 days in the last 14") and a
NEW saved-ROI card at the top of the saved-artifact
list: "Your last ROI estimate: $54,672 per year" with
a one-line summary of the four inputs (60 leads/week,
8 min/lead, $75/hr fully-loaded, 35% after-hours) and
a "Reopen result" button. They tap it; the page
navigates to
`/roi?leads=60&minutes=8&hourly=75&afterhours=35` (the
existing URL-encode path) and the ROI page rehydrates
the result identically, with no re-typing. They copy
the share URL via the existing copy-link button (from
ticket 0046) and text it to their partner. Total
time: 5 seconds. If the visitor has never used the
ROI calculator, the card simply does not render
(graceful degradation, no empty state needed; the
existing empty-state of `/my` from ticket 0045
already handles "no saved artifacts at all"). Light
and dark mode supported; the card reads cleanly on a
375px viewport.

### Growth

The "show me" moment is the SMS thread: a returning
visitor opens `/my`, taps the saved-ROI card, and
texts a partner the share URL ("look, this is what I
ran on Friday"). That is the artifact a real
construction owner forwards because it carries a real
dollar number their own business actually generates,
not a marketing demo. Per the ticket 0046 share-URL
precedent and the ticket 0045 dashboard precedent,
every retention signal we add to `/my` is measured:
the new card fires
`trackCTAClick('roi_card_view', 'mydashboard')` once
per page mount (debounced via the existing
`useRef<boolean>` guard the streak badge already
uses for `streak_badge_view`), and the Reopen button
fires `trackCTAClick('roi_card_reopen', 'mydashboard_roi_reopen')`
on click. The saved-ROI card structurally lifts the
bottom-of-page strategy-call CTA conversion because
a visitor reminded of their own annual-savings dollar
figure is the most qualified prospect the funnel can
produce.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new util `src/utils/roiResultStore.ts` (under 90 lines) exports `saveLastRoiResult(inputs: RoiInputs): void` and `getLastRoiResult(): { inputs: RoiInputs; outputs: RoiOutputs; savedAt: number } | null`. The store reads and writes a versioned localStorage entry under key `dca_last_roi_result_v1` whose value is a JSON-stringified `{ inputs: RoiInputs, savedAt: number }` payload (the outputs are recomputed on read via the existing `computeRoi` helper so a future formula tweak in `roiCalculatorParams.ts` does not strand stored data with a stale dollar figure). On `saveLastRoiResult(inputs)`, the store validates the inputs by round-tripping through `encodeRoiParams` and `decodeRoiParams` (the existing parse-safe helpers) and only persists a validated bundle so an out-of-range value can never poison the store. On `getLastRoiResult()`, the store reads, re-validates via the same round-trip, and returns `{ inputs, outputs: computeRoi(inputs), savedAt }` or `null`. All reads and writes are guarded in try/catch the same way `src/utils/quizPersonaStore.ts` does; a corrupted entry returns `null` and silently overwrites on the next save.
- [ ] The `saveLastRoiResult` call is wired into `src/pages/RoiCalculator.tsx` inside a debounced `useEffect` that watches `inputs` and writes 800ms after the visitor stops typing, so a visitor scrubbing the number inputs does not write 40 localStorage entries in five seconds. The debounce uses a `useRef<ReturnType<typeof setTimeout> | null>` cleanup pattern (no new dependency). The implementer documents the debounce choice in a comment next to the new `useEffect`. The save fires only when the inputs differ from the DEFAULT_INPUTS bundle, so a visitor who lands on the bare `/roi` URL and immediately closes the tab does NOT write a saved bundle (the dashboard would otherwise show the placeholder defaults as a fake saved result).
- [ ] The `/my` dashboard page (`src/pages/MyDashboard.tsx`) reads the saved ROI result via `getLastRoiResult()` on mount inside the existing `safeRead` try/catch wrapper (line 73, 85-99 of the current file), stores it in a new `useState` hook adjacent to the existing `estimate`/`recent`/`persona`/`streak` hooks, and renders one new article card (mirroring the existing `dashboard-estimate-card`, `dashboard-recent-demos-card`, `dashboard-quiz-persona-card` cards) placed between the recent-demos card and the quiz-persona card in the existing render order. The card's `data-testid` is `dashboard-roi-card`; it shows a Calculator or DollarSign icon (already imported into the dashboard from `lucide-react` per the current import list at line 4), an H2 "Your last ROI estimate", a primary dollar figure formatted as `$<n>` with US locale grouping (matching the `fmtDollars` helper at `RoiCalculator.tsx` line 53), a one-line summary of the four inputs in plain language, a "Reopen result" button whose href is `/roi?${encodeRoiParams(inputs).toString()}` (mirroring the existing `dashboard-estimate-reopen` pattern at line 168-176 of MyDashboard.tsx), and fires `trackCTAClick('roi_card_reopen', 'mydashboard_roi_reopen')` on click. The card fires `trackCTAClick('roi_card_view', 'mydashboard')` exactly once per page mount (debounced via a new `useRef<boolean>` guard mirroring the `streakViewTracked` ref pattern at MyDashboard.tsx line 83). When `getLastRoiResult()` returns `null` the card does NOT render (graceful degradation, no empty state); the existing `dashboard-empty-state` block at MyDashboard.tsx line 233-247 stays unchanged, so the empty-state predicate `anyData` is widened to include `roiResult !== null` so a visitor whose only saved artifact is the ROI result does not see the empty state.
- [ ] The `/trust` page (`src/pages/Trust.tsx`) gets ONE additive edit to its existing persistent-store disclosure list to add a new row naming the `dca_last_roi_result_v1` localStorage key, what it stores (the visitor's four ROI inputs and a saved-at timestamp), and that it lives client-side only with no server-side write. The row mirrors the shape of the existing `dca_quiz_persona_v1` and `dca_visit_days_v1` rows (ticket 0045 and 0060 added their rows to the same block); the edit is under 8 added lines and changes no existing copy. This satisfies the ticket 0018 / 0033 / 0045 / 0060 honesty rule that every persistent store appears in the disclosure.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, the new card is visible above the existing quiz-persona card without pushing the existing cards out of the viewport on a 375x667 device, and the card degrades gracefully on a localStorage-disabled browser (the `safeRead` wrapper returns null and the card simply does not render). The new util emits no console warnings on a corrupted localStorage entry; it silently resets. Zero em-dash characters in any rendered text on the new card, in the new util's exported types or constants, or in the new trust-disclosure row.
- [ ] A new e2e spec at `tests/e2e/roi-card-on-dashboard.spec.ts` asserts: (1) empty-state case clears localStorage, navigates to `/my`, and asserts the `dashboard-roi-card` testid is NOT visible (existing dashboard cards still render per the ticket 0045 / 0060 specs which stay green), (2) seeded case uses `page.addInitScript` to seed `dca_last_roi_result_v1` with a known input bundle (e.g. `{ leads: 60, minutes: 8, hourly: 75, afterhours: 35, savedAt: <recent timestamp> }`) BEFORE mount, navigates to `/my`, asserts the `dashboard-roi-card` is visible, asserts the displayed dollar figure matches the result of `computeRoi({ leads: 60, minutes: 8, hourly: 75, afterhours: 35 })` rounded and US-formatted, and asserts the "Reopen result" href equals `/roi?leads=60&minutes=8&hourly=75&afterhours=35`, (3) reopen case clicks the Reopen button from the seeded card and asserts the destination `/roi?...` page renders the same dollar figure (asserting the `data-testid="roi-annual-savings"` element from `RoiCalculator.tsx` line 173-179), (4) corrupted-entry case seeds `dca_last_roi_result_v1` to a non-JSON string, navigates to `/my`, and asserts the card does NOT render and no console error fires (the corrupted read silently reset), (5) out-of-range case seeds the store with `{ leads: 99999, minutes: 8, hourly: 75, afterhours: 35 }` (leads exceeds the BOUNDS.leads max of 1000 at `roiCalculatorParams.ts` line 21), navigates to `/my`, and asserts the card does NOT render (the validation round-trip rejects the bundle), (6) save-debounce case navigates to `/roi`, types `90` into the leads input via `data-testid="roi-input-leads"`, waits 1200ms, reads localStorage, and asserts `dca_last_roi_result_v1` contains `leads: 90` (the debounce fired), (7) default-inputs case clears localStorage, navigates to `/roi`, waits 1500ms WITHOUT typing anything, reads localStorage, and asserts `dca_last_roi_result_v1` is null (the no-difference-from-defaults guard prevents the placeholder write), (8) dark-mode case applies `document.documentElement.classList.add('dark')` and asserts the card renders, (9) no-em-dash case reads `page.textContent('body')` on `/my` (seeded) and asserts no `String.fromCharCode(8212)`.
- [ ] No `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/utils/quizPersonaStore.ts`, `src/utils/visitStreakStore.ts`, `src/utils/recentDemosStore.ts`, `src/pages/construction/lastEstimateStore.ts`, `src/components/WhatsNewSinceVisit.tsx` (the existing retention surfaces stay byte-identical). The `src/pages/roiCalculatorParams.ts` file is read-only in this ticket; the new util imports `RoiInputs`, `RoiOutputs`, `encodeRoiParams`, `decodeRoiParams`, `computeRoi`, `DEFAULT_INPUTS` from there but does not edit it. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; the existing `tests/e2e/my-dashboard.spec.ts` (ticket 0045), `tests/e2e/visit-streak-badge.spec.ts` (ticket 0060), `tests/e2e/roi-calculator.spec.ts` (ticket 0046), and `tests/e2e/whats-new-since-visit.spec.ts` (ticket 0040) stay green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A multi-result history of the visitor's last N ROI
  submissions. The store keeps the SINGLE most recent
  bundle (mirroring the lastEstimateStore single-entry
  shape from ticket 0014); a multi-entry history is its
  own follow-up ticket only if telemetry shows the
  single-entry card earns reopens. Mixing single-entry
  and multi-entry semantics in one ticket would inflate
  the diff past the 200-line budget.
- A "compare two ROI bundles side-by-side" view on `/my`
  or on `/roi`. Comparison is its own conversion
  ticket; the saved card here is a single artifact, not
  a comparison surface.
- A celebratory animation or confetti when a new ROI
  bundle is saved. Per the ticket 0060 streak-badge
  precedent, retention surfaces on `/my` are calm by
  design; reward animations undermine the artifact
  posture.
- An email "save my ROI result" capture form. The page
  already ships a copy-share-URL flow (ticket 0046);
  adding an email capture form on top of the saved-
  client-side artifact would be a duplicate capture
  surface and violate the ticket 0036 "no fourth
  capture form" principle.
- Cross-device sync of the saved ROI result. The store
  is localStorage only; cross-device persistence
  requires an account system and is out of scope per
  the ticket 0045 rationale.
- Surfacing the saved ROI on the homepage hero or the
  navbar. The card is a `/my` surface only; cross-
  promotion is its own ticket once telemetry shows the
  card earns repeat visits to the dashboard.
- A new JSON-LD block tied to the saved ROI result.
  There is no schema.org type that fits a "browser-
  local saved calculation" artifact and emitting one
  would misrepresent the surface.
- Auto-saving the ROI result on every keystroke (no
  debounce). The 800ms debounce is intentional;
  every-keystroke writes would burn quota in 5
  seconds of scrubbing.
- Saving the ROI result without the
  `differs-from-defaults` guard. Persisting the
  placeholder DEFAULT_INPUTS bundle on every bare
  `/roi` visit would surface a fake saved card on
  `/my` for visitors who never actually typed an
  input.
- A new "clear my saved ROI" UI button on the card.
  The store exports no `clearLastRoiResult` helper in
  this ticket; the visitor can clear localStorage
  via browser dev tools the same way every other
  `dca_*` store can be cleared. A visible clear
  control is its own UX ticket.
- Surfacing the saved ROI result inside the existing
  `WhatsNewSinceVisit` strip (ticket 0040). That
  component renders a CHANGELOG delta, not a
  visitor-state delta; conflating the two would
  break the component's contract.
- Adding the saved ROI artifact to the per-demo data
  disclosure chip (`src/components/DataDisclosureChip.tsx`,
  ticket 0033). The chip surfaces per-DEMO disclosures
  via `src/data/demoDisclosures.ts`; the ROI
  calculator is not a demo and `/roi` is not in the
  KNOWN_PATHS allow-list. The `/trust` page disclosure
  list edit is the canonical disclosure surface for
  this store.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/utils/roiResultStore.ts` (under 90 lines).
  Mirror the shape of `src/utils/quizPersonaStore.ts`
  (the closest peer because both are small versioned
  localStorage utils with a typed payload). Export
  `saveLastRoiResult(inputs: RoiInputs): void` and
  `getLastRoiResult(): { inputs: RoiInputs; outputs: RoiOutputs; savedAt: number } | null`.
  Use the existing `safeRead` / try-catch idiom the
  other stores use. Key: `dca_last_roi_result_v1`.
  Import `RoiInputs`, `RoiOutputs`, `encodeRoiParams`,
  `decodeRoiParams`, `computeRoi`, `DEFAULT_INPUTS`
  from `@/pages/roiCalculatorParams` and validate via
  the encode-then-decode round trip the same way
  `lastEstimateStore.ts` (ticket 0014) does at
  src/pages/construction/lastEstimateStore.ts line
  84-86 - this delegates validation to the existing
  parse-safe helpers so a future BOUNDS change in
  `roiCalculatorParams.ts` flows through automatically.
- `src/pages/RoiCalculator.tsx` - one additive edit:
  add the import
  `import { saveLastRoiResult } from '@/utils/roiResultStore';`
  next to the existing imports (at line 10-16 the
  module already imports from `./roiCalculatorParams`).
  Add a new debounced `useEffect` that watches
  `inputs` and writes 800ms after the last change.
  Skeleton:
  `useEffect(() => { const t = setTimeout(() => { if (JSON.stringify(inputs) !== JSON.stringify(DEFAULT_INPUTS)) saveLastRoiResult(inputs); }, 800); return () => clearTimeout(t); }, [inputs]);`
  Document the debounce-and-guard choice in a comment
  citing this ticket. Do NOT relocate the existing
  `roi_share_open` effect (RoiCalculator.tsx line
  111-117).
- `src/pages/MyDashboard.tsx` - one additive edit to
  add the new card. Add the imports
  `import { getLastRoiResult } from '@/utils/roiResultStore';`
  and `import { encodeRoiParams } from '@/pages/roiCalculatorParams';`
  next to the existing imports at lines 14-16. Add a
  new state hook
  `const [roiResult, setRoiResult] = useState<ReturnType<typeof getLastRoiResult>>(null);`
  adjacent to the existing `streak` hook at line 79
  and a new `useRef<boolean>(false)` guard
  `roiCardViewTracked` adjacent to `streakViewTracked`
  at line 83. Read the saved bundle in the existing
  mount effect at line 85-99 using the `safeRead`
  wrapper next to `setStreak`. Add a second
  `useEffect` mirroring the streak-view-tracking
  effect at line 101-106 that fires
  `trackCTAClick('roi_card_view', 'mydashboard')`
  exactly once when `roiResult !== null`. Render the
  new `<article data-testid="dashboard-roi-card">`
  block conditionally when `hydrated && roiResult`
  between the `dashboard-recent-demos-card` block
  (line 182-209) and the `dashboard-quiz-persona-card`
  block (line 211-231). Widen the `anyData` predicate
  (line 108) to include `roiResult !== null` so the
  empty state at line 233-247 does not appear for a
  visitor whose only saved artifact is the ROI
  result. Mirror the existing card class constants
  (`CARD`, `ICON`, `PRIMARY_BTN` at MyDashboard.tsx
  lines 54-56) and use the `DollarSign` icon already
  importable from `lucide-react`.
- `src/pages/Trust.tsx` - one additive edit to the
  existing persistent-store disclosure list (search
  the file for `dca_visit_days_v1` from ticket 0060
  to find the disclosure block; add a sibling row
  for `dca_last_roi_result_v1` with the same shape).
  The new row names the key, what it stores (the
  four ROI inputs and a saved-at timestamp), and the
  client-side-only scope. Under 8 added lines; no
  existing copy is edited.
- Per the 2026-05-07 em-dash Hard NO, every string
  in the new util, the new dashboard card, the new
  trust disclosure row, and the new spec uses
  hyphens. Self-Review greps the diff for
  `String.fromCharCode(8212)` before pushing.
- Per the 2026-05-25 SEO Pilot lesson, no
  `meta[name="description"]` change is needed (the
  `/my` dashboard already emits its own; the new
  card is a content addition, not a meta change).
- `tests/e2e/roi-card-on-dashboard.spec.ts` (new) -
  one assertion per acceptance box. Model the spec
  on `tests/e2e/my-dashboard.spec.ts` (ticket 0045,
  the closest peer for "client-side personalization
  page seeded via `page.addInitScript`") and on
  `tests/e2e/roi-calculator.spec.ts` (ticket 0046,
  for the existing roi-input testids and the
  `data-testid="roi-annual-savings"` assertion
  target). Use `page.addInitScript` to seed
  `dca_last_roi_result_v1` before navigation in each
  seeded test; use `page.evaluate(() => localStorage.clear())`
  in the empty test. The save-debounce case uses
  `await page.waitForTimeout(1200)` (the debounce is
  800ms plus a 400ms tolerance). The default-inputs
  case uses `await page.waitForTimeout(1500)` and
  asserts the store is null - this proves the no-
  difference-from-defaults guard.
- Per the 2026-05-22 two-PR ship lesson, ship will
  need a follow-up `chore/0062-ship-status` PR
  after the feat PR merges to flip the ticket
  frontmatter AND its `docs/backlog/README.md`
  index row to `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing
  the second PR so the file and index never drift
  mid-flip.
- New deps: NO. The util uses only `localStorage`
  and `Date`. The dashboard card uses the existing
  `Calculator` / `DollarSign` icons from
  `lucide-react` already importable in
  MyDashboard.tsx. Schema migration: no (the new
  key is additive and versioned per the existing
  store convention). Privacy/security surface
  change: yes, minor - one new localStorage key
  (`dca_last_roi_result_v1`) captures the
  visitor's four ROI inputs and a saved-at
  timestamp. The /trust page disclosure list MUST
  list the new key in the same PR so the
  disclosure stays honest per ticket 0018 /
  0033 / 0045 / 0060.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-06-19 - branch `feat/0062-roi-card-my-dashboard` opened, ticket flipped to in-progress
- 2026-06-19 - failing spec added at `tests/e2e/roi-card-on-dashboard.spec.ts`
- 2026-06-19 - new util `src/utils/roiResultStore.ts`; additive edits to `src/pages/RoiCalculator.tsx`, `src/pages/MyDashboard.tsx`, `src/pages/Trust.tsx`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
