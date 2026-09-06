---
id: 0066
title: Printable "Your Digital Craft summary" recap on /my composing every persisted client-side artifact
status: in-progress
priority: P1
area: demos
created: 2026-09-06
owner: gtm-innovation
---

## User story

As a returning prospect (a construction-company owner who
tried the lead-responder demo two weeks ago, saved an
estimate on the phone last Tuesday, ran the ROI calculator
on Friday and saw a $54,000-per-year figure, completed
the AI Readiness Quiz on Saturday, and now wants to send
one clean page to their business partner before Monday's
strategy call), I want a printable "Your Digital Craft
summary" recap on the `/my` dashboard that composes every
persisted client-side artifact (saved estimate, saved ROI
result, quiz tier, recent demos, visit streak) into a
single well-formatted section I can print or save as a
PDF via the browser's own print dialog, so that I can
walk into the partner meeting with one printed page that
reflects the actual engagement history without me
re-typing anything, without an account, and without a
server-side export.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the `/my` dashboard
(ticket 0045) now surfaces five persisted client-side
artifacts (`recentDemosStore` from ticket 0026,
`lastEstimateStore` from ticket 0014, `quizPersonaStore`
from ticket 0045, `visitStreakStore` from ticket 0060,
`roiResultStore` from ticket 0062) but renders each one
as a separate card designed for on-screen browsing. Print
that page today and you get a stack of interactive card
components with buttons and hover states that make no
sense on paper. This ticket adds ONE new bounded section
at the bottom of `/my` (`data-testid="dashboard-summary-recap"`)
plus ONE print stylesheet block in the page module so the
existing cards visually collapse when printed and the new
recap section becomes the print-friendly canonical
artifact: a numbered summary listing "Estimate saved: $X"
/ "ROI computed: $Y per year" / "Quiz tier: Tier N" /
"Demos tried: N of M" / "Visits: N days in the last 14"
with a stable `Generated on YYYY-MM-DD at HH:MM local`
footer line. Zero new backend, zero new dependency, zero
new persistent store, no edit to any of the five existing
stores. This is the smallest possible surface that turns
a stack of retention cards into a single portable
artifact.

### Stakeholder

This widens the moat in the retention-artifact dimension
that the `/my` dashboard opened but did not close. Every
prior retention ticket added ONE persisted signal; this
ticket composes them all into a single printable summary
that only exists because we persist prior interactions.
The moat argument: a prospect who prints the summary and
walks into their partner meeting with a Digital Craft-
branded artifact reflecting their actual engagement is
structurally the most qualified strategy-call the funnel
can produce, because the printed page is evidence to the
partner that the prospect has already done real evaluation
work. Per the ticket 0045 Out of Scope language ("a
printable / PDF-export recap of the dashboard is a follow-
up ticket once the dashboard surfaces at least three
persisted stores"), this is pre-authorized follow-up work
- five stores are now persisted, well above the threshold.
The printable artifact is also structurally cheaper than
the sibling PDF-export tickets prior grooming discussed
because it uses the browser's native print dialog (no new
dependency like jsPDF, respecting the AGENTS.md /trust
data-handling story that no state ever leaves the
browser). Per the 2026-06-07 src-imports-tests lesson, if
the summary reads from a shared constants file, that file
lives in `src/utils/` (not `tests/e2e/`).

### Visitor (in the real moment of use)

A construction-company owner who has bookmarked `/my`
opens it Sunday night on a laptop before Monday's partner
meeting. The dashboard renders the existing five cards
(streak badge, saved estimate, recent demos, saved ROI,
quiz persona) as before, and one new bounded section at
the bottom titled "Your Digital Craft summary" reading:
"1. Estimate saved on 2026-09-01: $18,400", "2. ROI
computed on 2026-09-04: $54,672 per year", "3. AI
Readiness Quiz tier: Tier 2 (Ready to pilot)", "4. Demos
explored: 4 of 12 (lead-responder, estimate, property-
negotiator, voice-negotiator)", "5. Visits: 6 days in the
last 14", "Generated on 2026-09-06 at 20:14 local".
Below the summary: one small "Print this summary" button
that calls `window.print()`. The owner taps it; the
browser print preview opens with a clean single-column
layout where the interactive cards are hidden (via a
`@media print` block in the page) and the recap section
plus the site header identity fill the page. They save
as PDF, attach to Monday's calendar invite, and walk
into the meeting with an actual artifact. If the visitor
has never interacted with any of the five stores, the
recap section does NOT render (graceful degradation, the
existing dashboard empty-state from ticket 0045 handles
that case). Light and dark mode supported; print mode
uses dark-on-white regardless of screen theme.

### Growth

The "show me" moment is the PDF attached to the Monday
calendar invite: a printed summary of the prospect's own
engagement, generated locally, forwarded to the partner.
That is the single artifact most likely to convert a
stalled deal because it removes the "have you actually
looked at this" objection from the partner conversation
without requiring the prospect to re-narrate. Per the
ticket 0045 dashboard precedent, every retention signal
we add to `/my` is measured: the new section fires
`trackCTAClick('summary_recap_view', 'mydashboard')` once
per page mount (debounced via a `useRef<boolean>` guard
mirroring the `streakViewTracked` / `roiCardViewTracked`
pattern), and the Print button fires
`trackCTAClick('summary_recap_print', 'mydashboard_summary_print')`
on click BEFORE `window.print()` fires so the analytics
call is not swallowed by the print-dialog blur. The
printable summary structurally lifts the bottom-of-page
strategy-call CTA conversion because a visitor who has
just printed their own history is the most qualified
prospect the funnel can produce.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] The `/my` dashboard page (`src/pages/MyDashboard.tsx`) gets ONE additive section at the BOTTOM of the page (BELOW the existing four cards, ABOVE the existing strategy-call CTA and empty-state block), rendered inside a new `<section data-testid="dashboard-summary-recap">` element. The section renders conditionally when at least ONE of the five source stores has data (`estimate || roiResult || persona || recent.length > 0 || (streak && streak.daysInLast14 >= 1)`); when all five are null, the section does NOT render (the existing empty-state block from MyDashboard.tsx line 233-247 still handles the zero-artifact case unchanged). The section title is `<h2>Your Digital Craft summary</h2>` (case-sensitive) and the section renders a numbered ordered list where each `<li>` reflects one of the five stores in the fixed order (estimate, roi, persona, demos, streak), skipping any store whose value is null. A footer line reads `Generated on <YYYY-MM-DD> at <HH:MM> local` computed from `new Date()` at render time.
- [ ] The section reads all five stores using the EXISTING mount `useEffect` state hooks already on the page (`estimate`, `roiResult`, `persona`, `recent`, `streak`); no new store read, no new util, no new persistent key. The five per-line copy templates are defined as a single module-level constant `SUMMARY_LINES` in `src/pages/MyDashboard.tsx` (mirroring the existing pattern of module-level card constants) with entries typed as `{ key: 'estimate' | 'roi' | 'persona' | 'demos' | 'streak'; label: (value: T) => string }`. Each template returns a hyphen-separated string that carries the dollar figure, tier number, or count from the actual persisted value (e.g. `Estimate saved on <savedAt>: $<total>`); no placeholder copy, no fabricated numbers.
- [ ] A new module-level `@media print` block is added to the page module. The block hides every existing on-screen dashboard card (`[data-testid="dashboard-estimate-card"]`, `[data-testid="dashboard-recent-demos-card"]`, `[data-testid="dashboard-roi-card"]`, `[data-testid="dashboard-quiz-persona-card"]`, `[data-testid="dashboard-streak-badge"]`, the existing empty-state block, the existing strategy-call CTA, the site Navbar, the site Footer, and the ScrollProgress bar) via `display: none !important;`, and forces the new `dashboard-summary-recap` section to render `display: block !important; color: #000 !important; background: #fff !important;` regardless of the light/dark theme active on-screen. The print stylesheet is inlined as a `<style>` tag inside the existing `<Helmet>` block (mirror the shape used elsewhere on the site for print stylesheets, or inline a single-file `<style>` element if no existing pattern exists) so the print rules do not leak into the on-screen layout.
- [ ] A "Print this summary" button is rendered at the bottom of the new section (`data-testid="dashboard-summary-print"`). On click, the handler fires `trackCTAClick('summary_recap_print', 'mydashboard_summary_print')` FIRST and then calls `window.print()` (the analytics fire order is critical because the print dialog blocks the event loop and would swallow a subsequent GA beacon). The section also fires `trackCTAClick('summary_recap_view', 'mydashboard')` exactly ONCE per page mount when the section renders (debounced via a new `useRef<boolean>(false)` guard `summaryViewTracked` mirroring the `streakViewTracked` and `roiCardViewTracked` patterns already on the page).
- [ ] The page contains zero em-dash characters (`U+2014`) in the new section, in the `SUMMARY_LINES` constant, in the print stylesheet, or in any new label. The section renders in light AND dark mode on a 375px mobile viewport, and the printed output (asserted via Playwright's `page.emulateMedia({ media: 'print' })` mode in the spec) has the on-screen cards hidden and the recap section visible.
- [ ] A new e2e spec at `tests/e2e/summary-recap.spec.ts` asserts: (1) empty-state case clears localStorage, navigates to `/my`, and asserts `[data-testid="dashboard-summary-recap"]` is NOT visible (the existing empty-state block still renders per ticket 0045 spec unchanged), (2) single-store case seeds ONLY `dca_last_roi_result_v1` with a known bundle via `page.addInitScript`, navigates to `/my`, asserts the recap section IS visible, asserts the ordered list contains exactly ONE `<li>` matching the ROI template pattern `/ROI computed on \d{4}-\d{2}-\d{2}: \$[\d,]+ per year/`, and asserts the four other list positions are absent, (3) all-stores case seeds all five stores (recentDemos, lastEstimate, quizPersona, visitDays, roiResult) with known values, navigates to `/my`, asserts the ordered list contains exactly FIVE `<li>` elements in the fixed order (estimate, roi, persona, demos, streak) each matching its template pattern, (4) generated-timestamp case asserts the footer line matches `/Generated on \d{4}-\d{2}-\d{2} at \d{2}:\d{2} local/`, (5) print-view case calls `await page.emulateMedia({ media: 'print' })` on the all-stores seed and asserts (a) the recap section is visible, (b) `[data-testid="dashboard-estimate-card"]` is hidden via `expect(locator).toBeHidden()`, (c) `[data-testid="dashboard-roi-card"]` is hidden, (d) the site `nav` element is hidden, (e) the site `footer` element is hidden, (6) print-button case clicks the Print button, spies on `window.print` via `page.exposeFunction` or `page.evaluate(() => { window.__printCalled = false; const orig = window.print; window.print = () => { window.__printCalled = true; }; })` seeded BEFORE navigation, and asserts `await page.evaluate(() => window.__printCalled) === true`, (7) analytics-fire-order case similarly spies on `window.dataLayer` or the `trackCTAClick` shim and asserts the `summary_recap_print` beacon fires BEFORE the print call, (8) dark-mode case applies `document.documentElement.classList.add('dark')` and asserts the recap section renders, (9) no-em-dash case reads `page.textContent('body')` on the all-stores seed and asserts no `String.fromCharCode(8212)`.
- [ ] No `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/utils/recentDemosStore.ts`, `src/utils/quizPersonaStore.ts`, `src/utils/visitStreakStore.ts`, `src/utils/roiResultStore.ts`, `src/pages/construction/lastEstimateStore.ts` (the five existing retention stores stay byte-identical), no new persistent-storage key (the /trust disclosure list does NOT need an edit because the recap is a pure composition of already-disclosed stores). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; the existing `tests/e2e/my-dashboard.spec.ts` (ticket 0045), `tests/e2e/visit-streak-badge.spec.ts` (ticket 0060), `tests/e2e/roi-card-on-dashboard.spec.ts` (ticket 0062), and `tests/e2e/last-estimate-recap.spec.ts` (ticket 0014) stay green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A jsPDF-generated downloadable PDF file. Adding a heavy
  PDF library is a Hard NO on the GTM queue (touches
  `package.json`). The browser's native print-to-PDF
  dialog is the shipping mechanism; visitors on every
  major browser already have print-to-PDF support without
  a new dependency.
- A server-side PDF render or email-me-the-summary flow.
  The summary is a client-side artifact composed of
  client-side stores; introducing a server-side render
  would violate the /trust data-handling story (nothing
  ever leaves the browser) and require an /api/ edit.
- A "share this summary" URL that encodes the five store
  bundles into query params. The share-link pattern is
  already established for single artifacts (0009 estimate,
  0029 voice, 0046 ROI, 0052 quiz); composing a five-store
  bundle into a URL would exceed reasonable URL length
  limits and would require a new decode path on `/my`.
  Out of scope; a separate follow-up ticket can explore a
  compact hash-based share bundle once telemetry shows
  print usage.
- An email-capture form asking the visitor to email the
  summary to themselves. Per the ticket 0036 "no fourth
  capture form" principle, the summary is a passive
  artifact, not an outbound capture channel.
- Editing any of the five existing card renders. The
  cards stay byte-identical on-screen; the print
  stylesheet only HIDES them at print-time, it does not
  modify them.
- Editing the /trust page persistent-store disclosure
  list. No new persistent key is added; the recap
  composes existing stores whose disclosures were
  written by tickets 0014 / 0026 / 0045 / 0060 / 0062.
- A new JSON-LD block tied to the summary. There is no
  schema.org type that fits a "browser-local composed
  session summary" artifact and emitting one would
  misrepresent the surface. The `/my` page already
  emits its own JSON-LD from ticket 0045.
- Auto-printing on load (calling `window.print()` inside
  a mount effect). Auto-print is a visitor-hostile
  pattern; the Print button is explicit.
- A "clear my history" button on the summary. The five
  stores each have their own clearance semantics (the
  visitor can clear localStorage via browser dev tools
  or per the ticket 0033 disclosure chip); a visible
  clear control is its own UX ticket.
- A per-vertical filter (e.g. "show only my construction
  demos"). The recap is one flat composition across all
  five stores; per-vertical filtering is its own follow-
  up ticket if telemetry shows demand.
- A history log of prior generated summaries. The recap
  is stateless; every render reflects the current stored
  values. A saved-summaries history would require a new
  persistent store and its own /trust disclosure edit.
- Adding the summary section to any other page (footer,
  homepage, /demos). The recap is a `/my` surface only;
  cross-promotion is its own ticket once telemetry shows
  the section earns print clicks.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- `src/pages/MyDashboard.tsx` - the ONLY source file
  edited in this ticket. Add a new module-level constant
  `SUMMARY_LINES` (a `readonly SummaryLine[]` typed
  array) next to the existing per-card class constants
  (`CARD`, `ICON`, `PRIMARY_BTN` at MyDashboard.tsx line
  54-56). Each entry has shape
  `{ key: 'estimate' | 'roi' | 'persona' | 'demos' | 'streak'; render: (data: T) => string | null }`.
  The render function returns the visible line for that
  store or `null` when the store's value is null (the
  outer render filters null lines before assigning
  ordered-list positions).
- Add ONE new `useRef<boolean>(false)` guard
  `summaryViewTracked` adjacent to the existing
  `streakViewTracked` and `roiCardViewTracked` guards
  (mirror the 0060 / 0062 pattern). Add ONE new
  `useEffect` mirroring the streak-view-tracking effect
  that fires `trackCTAClick('summary_recap_view',
  'mydashboard')` exactly once when at least one store
  has data.
- Render the new `<section data-testid="dashboard-summary-recap">`
  at the BOTTOM of the page, BELOW the existing four
  cards (roi card at line ~211-229 per the ticket 0062
  Implementation log, quiz-persona card at line ~211-231)
  and ABOVE the strategy-call CTA block and the existing
  empty-state block. Render conditionally when at least
  one of the five sources has data. Inside the section
  render an `<ol>` mapping the surviving `SUMMARY_LINES`
  entries to `<li>` elements, and a footer `<p>` with
  the `Generated on <date> at <time> local` line.
- Add a "Print this summary" `<button data-testid="dashboard-summary-print">`
  at the bottom of the section. The onClick handler
  fires `trackCTAClick('summary_recap_print',
  'mydashboard_summary_print')` FIRST (synchronously)
  and then calls `window.print()`. The order is
  critical because the print dialog blocks the event
  loop.
- Add the print stylesheet. Inline it inside the
  existing `<Helmet>` block on the page as a
  `<style type="text/css" media="print">` element
  containing the CSS rules to hide every existing
  card, the site nav, the site footer, the ScrollProgress
  bar, and the existing strategy-call CTA at print-time,
  and to force the recap section to render with
  `display: block !important; color: #000 !important; background: #fff !important;`.
  Every hidden selector uses `display: none !important;`
  because Tailwind's utility classes carry higher
  specificity than a plain rule. Inside `@media print`,
  target selectors by `[data-testid="..."]` (the same
  testids the spec asserts against) so the print rules
  cannot silently drift from the assertion targets.
- Per the 2026-05-07 em-dash Hard NO, every string in
  the new `SUMMARY_LINES` templates, the new section
  copy, the button label, and the footer line uses
  hyphens. Self-Review greps the diff for
  `String.fromCharCode(8212)` before pushing.
- Per the 2026-05-25 SEO Pilot lesson, no
  `meta[name="description"]` change is needed (the
  dashboard already emits its own; the recap is a
  content addition, not a meta change). `/my` is in
  the SEO Pilot pages table per the ticket 0045 spec.
- Per the 2026-06-07 src-imports-tests lesson, if the
  spec needs to import the `SUMMARY_LINES` key set to
  assert against (recommended for the all-stores case),
  export the keys as a named constant
  `SUMMARY_LINE_KEYS: readonly (typeof SUMMARY_LINES[number]['key'])[]`
  from `src/pages/MyDashboard.tsx` so the spec can
  `import { SUMMARY_LINE_KEYS } from '@/pages/MyDashboard';`
  without a tests/ path.
- `tests/e2e/summary-recap.spec.ts` (new) - one
  assertion per acceptance box. Model the spec on
  `tests/e2e/my-dashboard.spec.ts` (ticket 0045, the
  closest peer for "seeded via `page.addInitScript`
  reads") and on `tests/e2e/roi-card-on-dashboard.spec.ts`
  (ticket 0062, for the multi-store seeding pattern).
  The print-view case uses
  `await page.emulateMedia({ media: 'print' })` BEFORE
  the visibility assertions - Playwright ships this
  API natively (no new dependency). Per the 2026-09-05
  route-code-splitting lesson, prefer auto-retrying
  `await expect(locator).toBeHidden()` /
  `.toBeVisible()` over one-shot `.isVisible()` for
  print-mode assertions. The print-button case
  overrides `window.print` via `page.addInitScript`
  BEFORE the navigation (init scripts run before every
  document load); the analytics-fire-order case uses
  the same init-script approach to record beacons in a
  window-level array in call order.
- Per the 2026-05-22 two-PR ship lesson, ship will need
  a follow-up `chore/0066-ship-status` PR after the
  feat PR merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to `shipped`
  together; run `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index never
  drift mid-flip.
- New deps: NO. The section uses only React, the
  existing `trackCTAClick` helper, and `window.print()`
  (native browser API). Schema migration: no. Privacy /
  security surface change: NO - the recap composes the
  five existing persisted stores that are already
  disclosed on /trust (per tickets 0014 / 0026 / 0045 /
  0060 / 0062), adds no new persistent key, makes no
  new network call, exports nothing to any server or
  third party. The Print button hands control to the
  browser's native print dialog, which is a first-party
  browser API that never leaves the visitor's device.

## Implementation log

### 2026-09-06 - implementation-dev flipped to in-progress

Branched `feat/0066-my-dashboard-printable-summary` off fresh
`origin/main` and flipped the ticket frontmatter AND the README index
row to `in-progress` together as the first commit (the validator
requires them to match, per scripts/check-backlog.mjs step 3). The
follow-up `chore/0066-ship-status` PR (per the 2026-05-22 two-PR ship
lesson) will flip both file and index to `shipped` together.
