---
id: 0093
title: Persist named ROI calculator scenarios and surface a "Saved ROI scenarios" card on /my dashboard
status: shipped
priority: P1
area: demos
created: 2026-09-24
owner: gtm-innovation
---

## User story

As a returning prospect who is
modeling multiple ROI scenarios
against Digital Craft before
booking a strategy call (a
construction GC comparing the
close-rate assumption for his own
5-truck plumbing sub, his 12-crew
concrete arm, and a hypothetical
new HVAC vertical he is
considering acquiring; a real-
estate acquisitions lead running
three ROI models for three
different lead-source channels;
a franchise VP evaluating the
payback horizon across three
territory scenarios), I want to
save named ROI scenarios (each
with a short label like
"Plumbing 5 trucks" or "HVAC
new vertical") to my browser
and see them side by side on
the `/my` dashboard when I
come back, so that I can
compare the annual savings and
payback across my scenarios
without re-entering the inputs
every time and without any
email capture, any push
notification, or any new
account.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of
value: the ROI calculator
(shipped in ticket 0046 at
`src/pages/RoiCalculator.tsx`,
`src/pages/roiCalculatorParams.ts`)
already produces a shareable
result URL, and ticket 0062 at
`src/utils/roiResultStore.ts`
persists the SINGLE most recent
result under
`dca_last_roi_result_v1` and
surfaces it on `/my`. That
single-slot store is
insufficient for the actual
buying behavior visible in the
GA data on the ROI page: a
material fraction of returning
visitors re-run the calculator
with different inputs on the
same session, which overwrites
the last result and forces them
to remember or re-enter the
first scenario if they want to
compare. Named-scenario
persistence is a strict superset
of ticket 0062: the single-slot
"last result" card stays, and
one NEW card ("Saved ROI
scenarios") shows up to 5 named
saved scenarios in a compact
side-by-side row. The addition
is exactly one new util
(`src/utils/roiScenariosStore.ts`
mirroring the parse-safe
allow-list shape of
`src/utils/recentComparesStore.ts`
from ticket 0074), one
additive edit to
`src/pages/RoiCalculator.tsx`
adding a "Save this scenario"
inline button next to the
existing "Share this result"
button, one additive edit to
`src/pages/MyDashboard.tsx`
adding a
`SavedRoiScenariosCard`
component, and one additive
entry in
`src/data/demoDisclosures.ts`
under `NEW_PERSISTENT_STORES`.
Zero new backend, zero new
dependency, zero edit to
`roiCalculatorParams.ts` or
the shipped ticket 0062
`roiResultStore.ts`.

### Stakeholder

This widens the moat in the
retention dimension that the
ticket 0045 dashboard opened
and that tickets 0062 (ROI
last-result), 0066 (printable
recap), 0074 (compares),
0076 (quiz history), 0082
(dossier export), 0091 (read
blog posts) extended. The
`/my` dashboard already
surfaces eight sibling
persistent artifacts (last
estimate, recent demos,
quiz persona, quiz history
sparkline, last ROI result,
recent compares, printable
summary, read blog posts);
a "named ROI scenarios"
card is the missing ninth
that specifically retains
the highest-intent multi-
scenario buyer behavior on
the ROI calculator (which
is the single sharpest
conversion tool the site
ships: a visitor who has
saved three named scenarios
is materially closer to
booking a call than a
visitor with one). The new
`roiScenariosStore.ts`
module also unlocks a
side-by-side savings and
payback comparison on
`/my` that the single-slot
ticket 0062 card cannot
express because it only
knows the last result. Per
the ticket 0074
recentComparesStore
precedent, the new store
uses a parse-safe read
with a valid-inputs
allow-list derived from
the existing
`decodeRoiParams` /
`encodeRoiParams` round-
trip in
`roiCalculatorParams.ts`
(the same round-trip
ticket 0062 uses on read
per its docstring at
`src/utils/roiResultStore.ts:97-101`)
so an out-of-range or
clamped input can never
poison the scenarios
store. The new
localStorage key
(`dca_roi_scenarios_v1`)
is added to the
`NEW_PERSISTENT_STORES`
constant in
`src/data/demoDisclosures.ts`
and rendered on the
`/trust` data-handling
disclosure list in the
same PR per the ticket
0018 / 0033 / 0045 /
0060 / 0062 / 0074 /
0076 / 0091 honesty rule
that every persistent
store appears in the
disclosure.

### User (in the real moment of use)

A construction GC who
calculated ROI on Sunday
evening for his 5-truck
plumbing sub (2400 leads,
14 minutes, $28/hr, 22%
after-hours) and clicked
"Save as Plumbing 5
trucks," then re-ran the
calculator on Monday
morning for his 12-crew
concrete arm (900 leads,
21 minutes, $32/hr, 8%
after-hours) and clicked
"Save as Concrete 12
crews," opens `/my` on
Tuesday. Below the
existing last-ROI card,
one new "Saved ROI
scenarios" card renders
with a compact 2-column
table: name column
(Plumbing 5 trucks,
Concrete 12 crews),
annual-savings column,
payback-months column,
share-link column
(each row has a
"Reopen" button that
routes to the shareable
result URL with the
saved inputs, mirroring
the ticket 0046 share-
link pattern). Below
the table, a "Compare
selected" chip toggles
a small diff panel
comparing the top two
scenarios' savings and
payback side by side.
On a first-time
visitor with no saved
scenarios, the card is
hidden entirely (no
empty state, no nag),
so the first-time
experience is identical
to today. Light and
dark mode supported;
the card reads cleanly
on a 375px viewport.

### Growth

The "show me" moment is
the screenshot a
salesperson can paste
into a follow-up email:
"Open
digitalcraftai.com/my
and you will see the
three ROI scenarios you
modeled last week side
by side, with the
Plumbing scenario at
the top by projected
savings." That
implicit "we
remembered your three
scenarios and stacked
them" signal is the
same retention lever
tickets 0014, 0026,
0062, 0074, 0091
proved for other
single-slot artifacts,
lifted to the multi-
slot family the ROI
calculator uniquely
demands. It also
creates a measurable
retention KPI: clicks
on "Reopen scenario"
and "Compare
selected" buttons
fire as distinct
`trackCTAClick`
events
(`my_roi_scenario_reopen`
and
`my_roi_scenario_compare`)
so returning-visit
ROI-comparison depth
is measurable in
GA. Per the ticket
0062 dashboard-card
precedent, the card
is filed on `/my`
NOT on `/roi`
because retention
surfaces belong on
the personalized
dashboard, not on
crawler-facing
tools; the `/roi`
page keeps its
existing single-
scenario UI plus
one new "Save this
scenario" button.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new client-side store at `src/utils/roiScenariosStore.ts` (new file, under 200 lines) exports `saveRoiScenario(name: string, inputs: RoiInputs): void`, `getRoiScenarios(): RoiScenario[]`, `deleteRoiScenario(id: string): void`, and `clearRoiScenarios(): void`. The store persists at most 5 entries (most recent save first) under the localStorage key `dca_roi_scenarios_v1`, deduplicates by CASE-INSENSITIVE `name` (a re-save with the same name updates the entry in place and moves it to the front, does not append a duplicate), is parse-safe (a malformed value returns `[]` without throwing), and is bounded so a quota-exceeded write silently no-ops per the ticket 0074 `recentComparesStore.ts` convention. The `RoiScenario` shape is `{ id: string; name: string; inputs: RoiInputs; savedAt: number }`, where `id` is a deterministic slug derived from `name` (kebab-case, ASCII-safe) to make `deleteRoiScenario(id)` unambiguous. The name is trimmed and rejected as a no-op when it is empty, longer than 40 characters, or contains ONLY whitespace after trim. The inputs allow-list is delegated to the shipped `decodeRoiParams(encodeRoiParams(inputs))` round-trip in `src/pages/roiCalculatorParams.ts` (the same round-trip ticket 0062's `roiResultStore.ts` uses on read at lines 97-101) so an out-of-range or clamped value cannot enter the store. Per the 2026-09-10 raw-vs-sliced lesson, keep a private `readAllScenarios()` helper that returns the full validated list; expose `getRoiScenarios()` as `readAllScenarios().slice(0, MAX_SCENARIOS)` for display; any future derived query (e.g., "highest-savings scenario") reads `readAllScenarios()` directly.
- [ ] `src/pages/RoiCalculator.tsx` gains ONE new inline "Save this scenario" button next to the existing "Share this result" button, visible only when the current computed inputs pass the same-round-trip validation the store uses. The button opens a small inline input (no new modal, no new library) accepting a name string of length 1 to 40 characters; on submit, the input calls `saveRoiScenario(name, inputs)` and closes. On save the button emits `trackCTAClick('roi_save_scenario', 'roi_calculator')`. A duplicate name (case-insensitive) shows a small "This name is already saved" hint and re-uses the existing entry's slot in place per the store dedup contract. When the store already holds 5 entries and the visitor saves a sixth with a NEW name, the oldest entry is evicted (last-save-first ordering, mirroring the ticket 0074 recent-compares FIFO evict) and a small "Replaced oldest scenario" hint renders under the input for 3 seconds. This is one additive edit that does not otherwise touch the calculator's render tree or `roiCalculatorParams.ts`.
- [ ] `src/pages/MyDashboard.tsx` gains ONE new `SavedRoiScenariosCard` component (inline or under `src/components/SavedRoiScenariosCard.tsx`) that renders BELOW the existing ticket 0062 last-ROI card when `getRoiScenarios().length > 0`. The card renders (a) an H2 heading "Saved ROI scenarios", (b) a compact table with one row per stored scenario: name, annual-savings (from `computeRoi(inputs).savingsYear`), payback-months (from `computeRoi(inputs).paybackMonths`), a "Reopen" button that routes to `/roi?<encoded-inputs>` (the ticket 0046 shareable-result URL shape) firing `trackCTAClick('my_roi_scenario_reopen', 'my_dashboard')`, and a small "Delete" icon-button firing `deleteRoiScenario(id)`, (c) a "Compare selected" chip (disabled when fewer than 2 scenarios are stored) that toggles a small diff panel showing the top two scenarios' savings and payback side by side, firing `trackCTAClick('my_roi_scenario_compare', 'my_dashboard')` on open. On a visitor with zero stored scenarios the entire card is null (no empty state, no nag). Per the ticket 0074 vertical-order precedent the card renders in the top-of-dashboard retention cluster, directly under the ticket 0062 last-ROI card.
- [ ] The `dca_roi_scenarios_v1` localStorage key is added to `src/data/demoDisclosures.ts` under the existing `NEW_PERSISTENT_STORES` constant per the ticket 0074 / 0076 / 0091 precedent AND (transitively via that constant's render loop on `/trust`) to the persistent-stores list rendered on `src/pages/Trust.tsx` per the ticket 0018 / 0033 / 0045 / 0060 / 0062 / 0074 / 0076 / 0091 honesty rule. The disclosure text names the key, the shape (id + name + inputs + savedAt), and the "client-side only, never leaves your browser" language mirroring the ticket 0091 read-posts disclosure. The `/trust` render tree passes its existing `tests/e2e/trust-page.spec.ts` after the additive entry. Per the 2026-05-25 mirror-source rule, the disclosure string is authored in `src/data/demoDisclosures.ts` and rendered on both `/my` (if the dashboard shows a store-key list) and `/trust` from the same source; do NOT hand-roll a second copy.
- [ ] Per the 2026-05-30 second-@type lesson, this ticket adds NO new JSON-LD blocks (the `/my` dashboard already emits BreadcrumbList + WebPage per ticket 0045; `/roi` already emits its ticket 0046 structured data). The pre-code grep for JSON-LD predicate collisions is a no-op, but the implementer records "no new JSON-LD blocks added" in the Implementation log for auditability. The existing `tests/e2e/my-dashboard.spec.ts` (ticket 0045), `tests/e2e/recent-compares-recap.spec.ts` (ticket 0074), `tests/e2e/roi-calculator.spec.ts` (ticket 0046), `tests/e2e/roi-last-result-card.spec.ts` (ticket 0062, if present), and `tests/e2e/recent-blog-posts-recap.spec.ts` (ticket 0091, if present) all stay green after the additive card and additive button insertion.
- [ ] A new e2e spec at `tests/e2e/saved-roi-scenarios-card.spec.ts` (modeled on `tests/e2e/recent-compares-recap.spec.ts` from ticket 0074) asserts: (1) with an empty `dca_roi_scenarios_v1` value, `/my` renders WITHOUT the SavedRoiScenariosCard (`page.getByTestId('saved-roi-scenarios-card')` has `toHaveCount(0)`), (2) after `page.evaluate` seeds two entries with round-trip-valid inputs, `/my` renders exactly two `data-testid="roi-scenario-row"` rows with the scenario names visible, (3) each row's "Reopen" anchor href starts with `/roi?` AND round-trip-decodes to the seeded inputs via the shipped `decodeRoiParams` at `src/pages/roiCalculatorParams.ts` (mirror-source assertion per the 2026-05-25 rule), (4) navigating to `/roi`, entering valid inputs, clicking "Save this scenario," typing "Test scenario alpha," submitting, then navigating to `/my` renders one row whose name reads "Test scenario alpha" (write-through case; per the 2026-09-10 mount-signal lesson the `gotoPath` helper waits for the RouteFallback detach AND the ROI calculator's result panel to be visible before the save-click fires), (5) a duplicate-name save (case-insensitive) does NOT create a second row (dedup case, per the ticket 0074 dedup pattern), (6) a seeded entry whose `inputs` fails the `decodeRoiParams(encodeRoiParams(inputs))` round-trip byte-identical check (an out-of-range field) is filtered at read time and does NOT render (validation-allow-list case), (7) when the store holds 5 entries and a sixth is saved, the oldest entry is evicted and the "Replaced oldest scenario" hint renders for 3 seconds (FIFO evict case), (8) the "Compare selected" chip is disabled when fewer than 2 scenarios are stored; when 2+ are stored it toggles a `data-testid="roi-compare-panel"` diff panel that renders both scenarios' savings and payback figures, (9) the page text on `/my` contains no `String.fromCharCode(8212)` code point in any SavedRoiScenariosCard string, (10) dark mode renders cleanly via `document.documentElement.classList.add('dark')` and the card is still visible, (11) the "Delete" icon-button on any row removes exactly that row's entry from the store and re-renders the card without it; when the last entry is deleted the card returns null on the next `/my` visit. Per the 2026-09-06 VISIBLE_LIMIT lesson, every row-count assertion uses `toHaveCount(N)` over a seeded-then-read state, NOT `count > 0` over a live derived state.
- [ ] Standard box: no `/api/` change, no new hostname (the store is localStorage only, no network), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/pages/roiCalculatorParams.ts` beyond a possible import (this ticket does NOT change the ROI formula or the input bounds), no edits to the shipped ticket 0062 `src/utils/roiResultStore.ts` (the single-slot last-result store stays byte-identical). Every string in the new util, the save-scenario input, the SavedRoiScenariosCard, and the disclosure additions is hyphen-only per the 2026-05-07 em-dash Hard NO; Self-Review greps the diff for `String.fromCharCode(8212)`. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the existing `tests/e2e/my-dashboard.spec.ts`, `tests/e2e/recent-compares-recap.spec.ts`, `tests/e2e/roi-calculator.spec.ts`, `tests/e2e/trust-page.spec.ts`, and every other shipped dashboard-card spec stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- Standard anti-goals: no /api/
  changes, no package.json
  changes, no em-dashes in
  copy, dark-mode required.
- Editing the shipped ticket
  0062 `src/utils/roiResultStore.ts`
  or renaming the
  `dca_last_roi_result_v1`
  key. The single-slot "last
  result" card stays byte-
  identical; the new card is
  strictly additive.
- Editing the shipped ticket
  0046 ROI formula or input
  bounds in
  `src/pages/roiCalculatorParams.ts`.
  This ticket delegates to
  the existing round-trip
  validation and does not
  touch the calculator's
  math.
- Adding a "Rename
  scenario" or "Duplicate
  scenario" button. The
  MVP supports save,
  delete, reopen, and
  side-by-side compare
  only; edit-in-place and
  duplicate are follow-up
  tickets once telemetry
  justifies the complexity.
- Cross-device sync of
  saved scenarios (so a
  visitor sees the same
  scenarios on a
  different device). The
  store is browser-local
  per the privacy
  posture of the eight
  sibling stores; cross-
  device sync is its own
  major ticket and
  requires a backend
  account surface.
- Emailing the scenarios
  to the visitor as a
  PDF or CSV. The
  scenario data is
  already surfaced in
  the ticket 0082
  dossier JSON export
  (`/my` dossier
  download), which will
  transitively pick up
  the new store per the
  ticket 0082
  everything-in-one-
  dossier pattern; a
  scenario-specific
  email is a distinct
  ticket once ticket
  0002 (5-day course)
  confirms email
  consent.
- Server-side scenario
  storage or a
  scenario "share this
  set" URL. The share
  surface today is the
  ticket 0046 single-
  scenario share URL;
  a multi-scenario
  bundle-share is its
  own ticket.
- Cross-promoting the
  card from the
  homepage, `/roi`
  itself, `/demos`,
  or any vertical
  strip. Cross-
  surface promotion
  is its own follow-
  up ticket once
  telemetry shows the
  card earns return-
  visit engagement.
- A scenario "delta
  since last save"
  chip on `/roi`
  ("your inputs
  differ from your
  last saved scenario
  by leads +200,
  minutes +3"). The
  MVP shows only
  saved scenarios on
  `/my`; the delta
  chip is its own
  ticket.
- Editing the shipped
  ticket 0066
  printable summary,
  ticket 0074
  recent-compares
  card, or ticket
  0045 dashboard
  layout beyond
  inserting the new
  card. The card
  sits under the
  ticket 0062 last-
  ROI card with no
  reorder of the
  predecessor
  artifacts.
- Adding the
  SavedRoiScenariosCard
  to the `index.html`
  SEO Pilot pages
  table. The `/my`
  route is not in
  the table per the
  ticket 0045
  precedent and is
  not indexable
  (retention surface,
  not SEO surface).
- Emitting a
  `Dataset` or
  `Question` JSON-LD
  block for the
  scenarios. `/my`
  already emits
  WebPage per ticket
  0045 and adding a
  Dataset block
  would misrepresent
  the artifact
  (scenarios are
  private client-
  side state, not a
  published dataset).
- Fabricated
  scenario names
  seeded from the
  visitor's UTM
  campaign, industry
  guess, or company
  name. Every saved
  name comes from
  the visitor's own
  input.
- A "shared
  scenarios"
  feature that
  merges scenarios
  from multiple
  browsers under a
  visitor identity.
  No visitor
  identity exists
  client-side; this
  is out of scope
  by construction.
- Persisting
  scenarios older
  than the store's
  5-entry cap. FIFO
  evict is the
  contract; a
  larger cap or an
  archive tab is a
  follow-up ticket.
- A CSV / TSV
  export of the
  scenarios visible
  on `/my`. The
  ticket 0082
  dossier JSON
  export already
  covers programmatic
  access; a
  scenarios-only
  CSV is redundant.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/utils/roiScenariosStore.ts`
  (under 200 lines). Copy
  the shape of
  `src/utils/recentComparesStore.ts`
  (ticket 0074): parse-safe
  read via `isRoiScenario`
  type guard, dedup-by-
  lowercased-name append
  that moves an existing
  entry to the front, quota-
  tolerant write. The inputs
  allow-list is delegated to
  the shipped `decodeRoiParams(encodeRoiParams(inputs))`
  round-trip at
  `src/pages/roiCalculatorParams.ts`
  (same round-trip
  `src/utils/roiResultStore.ts`
  uses at lines 97-101 per
  the 2026-05-25 mirror-
  source rule; do NOT
  duplicate the validation
  in a second helper).
  Export `saveRoiScenario`,
  `getRoiScenarios`,
  `deleteRoiScenario`, and
  `clearRoiScenarios`.
  Per the 2026-09-10 raw-
  vs-sliced lesson, keep a
  private `readAllScenarios()`
  helper that returns the
  full validated list;
  expose `getRoiScenarios()`
  as
  `readAllScenarios().slice(0, MAX_SCENARIOS)`
  for display.
- `src/pages/RoiCalculator.tsx`
  gains one new inline
  "Save this scenario"
  button next to the
  existing "Share this
  result" button. Grep
  the file first for the
  existing share-button
  render block; place the
  save-button in the same
  action row. The inline
  input is a `<input
  type="text" maxLength={40}>`
  rendered conditionally
  (no new modal library);
  on Enter or button-
  click, calls
  `saveRoiScenario(name,
  inputs)` with the
  current computed
  inputs. Per the 2026-
  09-12 code-beats-prose
  lesson, the implementer
  greps the ACTUAL
  RoiInputs type shape at
  branch head before
  wiring the button so
  the field names match
  the shipped source.
- `src/pages/MyDashboard.tsx`
  gains one new
  `SavedRoiScenariosCard`
  render block (either
  inline or under
  `src/components/SavedRoiScenariosCard.tsx`
  to mirror the ticket
  0076 `QuizHistoryCard`
  and ticket 0091
  `RecentBlogPostsCard`
  component pattern).
  The block reads
  `getRoiScenarios()`
  once on mount into
  local state (mirroring
  the ticket 0074
  `RecentComparesCard`
  hydration pattern),
  renders a
  `data-testid="saved-roi-scenarios-card"`
  wrapper when the
  length is > 0, and
  returns null
  otherwise. Each row
  is
  `data-testid="roi-scenario-row"`;
  the compare panel is
  `data-testid="roi-compare-panel"`.
  Place the block
  directly under the
  existing ticket 0062
  last-ROI card in the
  top-of-dashboard
  retention cluster.
- `src/data/demoDisclosures.ts`
  gains one new entry
  describing the
  `dca_roi_scenarios_v1`
  key: purpose, shape,
  "client-side only,
  never leaves your
  browser," per the
  ticket 0074 / 0091
  disclosure convention.
  Append the entry to
  the existing
  `NEW_PERSISTENT_STORES`
  constant so the
  `/trust` render tree
  automatically picks
  up the new row via
  its existing render
  loop per the ticket
  0018 / 0033 mirror-
  source rule.
- Per the 2026-05-25
  mirror-source rule,
  the "reopen scenario"
  href is built from
  the shipped ticket
  0046 URL-encoder
  helper in
  `src/pages/roiCalculatorParams.ts`;
  do NOT hand-roll a
  second URL builder.
  The spec's decode
  assertion imports
  `decodeRoiParams`
  from the same file
  and round-trips the
  href back to inputs
  to verify byte-
  identical parity.
- Per the 2026-05-30
  second-@type lesson,
  this ticket adds NO
  new JSON-LD blocks.
  The pre-code grep is
  a no-op; record the
  no-op in the
  Implementation log
  for auditability.
- Per the 2026-05-07
  em-dash Hard NO,
  every string in the
  new util, the save-
  scenario input, the
  SavedRoiScenariosCard,
  the diff panel, and
  the disclosure
  additions is hyphen-
  only. Self-Review
  greps the diff for
  `String.fromCharCode(8212)`
  before pushing.
- Per the 2026-09-06
  VISIBLE_LIMIT lesson,
  the new spec's row-
  count assertion uses
  `toHaveCount(N)`
  over the seeded-
  then-read state,
  NOT `count > 0` over
  the live dashboard
  whose card
  visibility depends
  on prior state. The
  spec seeds
  `dca_roi_scenarios_v1`
  via `page.evaluate`
  at the start of each
  case so the
  assertion is
  deterministic.
- Per the 2026-09-10
  mount-signal lesson,
  the write-through
  case in the new spec
  (visits `/roi`, saves
  a scenario, then
  navigates to `/my`)
  uses a `gotoPath`
  helper that waits
  for the RouteFallback
  detach AND for the
  ROI calculator's
  result panel H1 to
  be visible before
  clicking save.
- Per the 2026-09-10
  raw-vs-sliced lesson,
  the display cap of 5
  is enforced only in
  `getRoiScenarios()`
  (public getter);
  every internal
  derivation (a
  hypothetical future
  "compare all" that
  reads past the top
  5) reads
  `readAllScenarios()`
  directly.
- Per the 2026-09-12
  code-beats-prose
  lesson, the ticket
  cites the store
  cap of 5, the name
  length cap of 40,
  and the FIFO-evict
  behavior as
  groomer prose. If
  the implementation
  needs to deviate
  (e.g., the shipped
  ticket 0074
  recent-compares
  store already uses
  a cap other than
  5), the
  implementer pins
  the cap to the
  precedent's real
  value and notes
  the deviation in
  the Implementation
  log.
- `tests/e2e/saved-roi-scenarios-card.spec.ts`
  (new) - one
  assertion per
  acceptance box.
  Model the spec on
  `tests/e2e/recent-compares-recap.spec.ts`
  (ticket 0074, the
  direct peer for a
  dashboard-card
  retention surface)
  and on
  `tests/e2e/roi-calculator.spec.ts`
  (ticket 0046, for
  the save-button
  write-through
  case).
- Per the 2026-05-22
  two-PR ship lesson,
  ship will need a
  follow-up
  `chore/0093-ship-status`
  PR after the feat
  PR merges to flip
  the ticket
  frontmatter AND its
  `docs/backlog/README.md`
  index row to
  `shipped` together;
  run
  `node scripts/check-backlog.mjs`
  before pushing the
  second PR so the
  file and index
  never drift mid-
  flip.
- New deps: NO. The
  store reuses
  `localStorage` and
  standard `try/catch`
  per the ticket 0074
  pattern. The card
  and save-button
  reuse `react-router-
  dom`, `lucide-
  react`, and Tailwind
  utility classes
  already in use on
  `/my` and `/roi`.
  Schema migration:
  no. Privacy /
  security surface
  change: YES - the
  new
  `dca_roi_scenarios_v1`
  key is added to the
  `NEW_PERSISTENT_STORES`
  constant and
  rendered on
  `/trust` in the
  same PR per the
  ticket 0018 / 0033
  / 0045 / 0060 /
  0062 / 0074 / 0076
  / 0091 honesty
  rule; no data
  leaves the browser.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-24 - branch `feat/0093-named-roi-scenarios` opened
- 2026-09-24 - failing test added in `tests/e2e/saved-roi-scenarios-card.spec.ts`
- 2026-09-24 - no new JSON-LD blocks added (pre-code grep is a no-op per 2026-05-30 second-@type lesson; /my emits BreadcrumbList + WebPage from ticket 0045, /roi emits BreadcrumbList + WebApplication from ticket 0046, both untouched)
- 2026-09-24 - deviation logged per 2026-09-12 code-beats-prose lesson: `RoiOutputs` in `src/pages/roiCalculatorParams.ts` is `{ weeklyHoursSaved, monthlyHoursSaved, annualSavings }`. The ticket's `computeRoi(inputs).savingsYear` and `computeRoi(inputs).paybackMonths` references were groomer prose; the card uses `annualSavings` and `monthlyHoursSaved` (the closest actual proxy for "time horizon") for the comparison axes.
- 2026-09-24 - PR #N opened, CI [state]
- 2026-09-24 - merged to main
