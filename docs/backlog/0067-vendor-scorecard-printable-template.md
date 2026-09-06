---
id: 0067
title: Printable AI vendor scorecard template at /questions-to-ask-an-ai-vendor/scorecard
status: groomed
priority: P1
area: trust
created: 2026-09-06
owner: gtm-innovation
---

## User story

As a buyer-side evaluator (a VP of operations weighing
three AI vendors before a board update, an in-house IT
lead running a Friday shortlist review, an owner-operator
who read the vendor-questions checklist last week and now
needs a blank scoring sheet to fill in during three back-
to-back sales calls next Tuesday), Googling "AI vendor
scorecard," "AI services vendor scoring template," or
"how to compare AI automation vendors" or arriving from
the sibling `/questions-to-ask-an-ai-vendor` page, I want
one honest printable page at
`/questions-to-ask-an-ai-vendor/scorecard` that renders
the 10-12 buyer-side questions from ticket 0061 as a
BLANK scoring grid (one row per question, three vendor
columns to fill in, a 1-to-5 score box next to each cell,
a notes field at the bottom of each row), so that I can
print the sheet once, walk into three vendor calls with
one clipboard, mark scores in real time, and leave the
week with a real side-by-side artifact instead of a
scattered notes app.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: ticket 0061
shipped `/questions-to-ask-an-ai-vendor` with a
`VENDOR_QUESTIONS: readonly VendorQuestion[]` module-
level constant of 10-12 buyer-side questions and a
FAQPage JSON-LD block deriving from the same array. The
checklist page hands the buyer a list to ASK; it does not
hand them a grid to SCORE. This ticket adds one new
sibling page at `/questions-to-ask-an-ai-vendor/scorecard`
that imports the SAME `VENDOR_QUESTIONS` constant from
the sibling page module (single source of truth per the
2026-05-25 mirror-source rule) and renders each question
as one row of a printable scoring grid with three blank
vendor columns, a 1-to-5 score cell per column, and a
notes field. The page is print-first: a `@media print`
stylesheet hides the site nav, footer, and any decorative
chrome, and the grid renders full-width across the
printed page. Zero new backend, zero new dependency, zero
new persistent state (the grid is deliberately blank on
every load; there is no "save my scores" flow because the
whole point of the artifact is the printed sheet the buyer
scribbles on). One new page file, one new spec file, one
new entry in `ROUTES`, one new route in `src/App.tsx`,
one new link from the sibling page's hero to this page,
and per the ticket 0061 mirror-source constraint the
`VENDOR_QUESTIONS` constant is EXPORTED from the sibling
page module (currently module-local) so this page can
import it.

### Stakeholder

This widens the moat in the buyer-artifact dimension the
sibling `/questions-to-ask-an-ai-vendor` opened but did
not close. Ticket 0061's Out of Scope explicitly named
"A downloadable PDF or printable share-link version of
the checklist" as a follow-up, and the browser's native
print dialog is the printing mechanism (no new dep, no
new /api/ route, respects the /trust "nothing leaves your
device" story). Per the 2026-05-30 second-@type lesson,
BEFORE writing code the implementer greps every
`tests/e2e/*-jsonld.spec.ts` AND the ticket 0061 spec
`tests/e2e/questions-to-ask-an-ai-vendor.spec.ts` for
`=== 'FAQPage'`, `=== 'BreadcrumbList'`, and
`=== 'CreativeWork'` predicates. The sibling FAQPage
predicate is URL-scoped to `/questions-to-ask-an-ai-vendor`
per the ticket 0061 Implementation log; a
`/questions-to-ask-an-ai-vendor/scorecard`-scoped
BreadcrumbList block cannot collide (every prior
BreadcrumbList is per-URL scoped per the ticket 0063
Implementation log). This ticket deliberately does NOT
emit a second FAQPage block on the scorecard page: the
same 10-12 questions rendered as a scoring grid are
structurally not the same content as the sibling page's
"why this matters" answer paragraphs, and a duplicate
FAQPage would risk a Google structured-data "duplicate
content" flag on the vendor-questions site graph. The
scorecard page emits a `BreadcrumbList` (Home ->
Questions to Ask an AI Vendor -> Scorecard) only. The
sibling page's FAQPage stays byte-identical.

### Visitor (in the real moment of use)

A VP of operations preparing for three vendor calls
Tuesday morning opens `/questions-to-ask-an-ai-vendor`
Monday night from a bookmark. The existing page ends
with a small "Print the scoring sheet" link near the
bottom that navigates to
`/questions-to-ask-an-ai-vendor/scorecard`. The scorecard
page loads with a hero H1 ("AI Vendor Scoring Sheet"), a
one-paragraph "how to use this" intro (fill in the three
vendor names at the top, score each question 1-to-5 as
the vendor answers, tally the totals per column at the
end), a printable grid rendered as an HTML `<table>` with
one header row (question text plus three blank vendor
columns) and 10-12 data rows, each row carrying an empty
score cell (`<div class="score-box">` with printed "1 2 3
4 5" or three checkbox-style bullets the buyer circles),
and a notes cell spanning the row bottom. Below the
table: a Print button that calls `window.print()`. The
buyer taps Print, the browser print preview opens with a
clean single-column landscape-friendly layout, and the
buyer prints three copies for Tuesday's meetings. No
sign-up, no email capture, no account. Light and dark
mode supported on-screen; print mode renders black-on-
white regardless of screen theme so ink usage is
predictable.

### Growth

The "show me" moment is the printed scoring sheet on a
buyer's desk during a vendor call: the vendor sees the
Digital Craft logo on the sheet header, reads the
question they are being asked ("what happens to my data
when I churn"), and realizes the buyer is running a
structured evaluation they have already prepared for.
That is the single artifact most likely to convert the
buyer to a strategy call because the buyer will finish
the week with a Digital Craft-branded scoring sheet
their team has already annotated, and the "how Digital
Craft answers this" small-print references on the
scorecard match the sibling page's references to
`/trust`, `/playbook`, `/uptime`, `/changelog`. Per the
ticket 0061 telemetry rule, the print button fires
`trackCTAClick('vendor_scorecard_print', 'vendor_scorecard')`
BEFORE calling `window.print()` (the analytics fire
order is critical because the print dialog blocks the
event loop), and the hero H1 fires
`trackCTAClick('vendor_scorecard_view', 'vendor_scorecard')`
once per mount (debounced via a `useRef<boolean>` guard).

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/VendorScorecard.tsx` (new file, under 260 lines) renders at `/questions-to-ask-an-ai-vendor/scorecard`. The page uses the existing `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell mirrored from `src/pages/QuestionsToAskAnAiVendor.tsx` (ticket 0061, the closest structural peer). The page renders a hero (H1 contains "Scoring Sheet" or "Scorecard" case-insensitive substring), a one-paragraph "how to use this" intro (fill in the vendor names, score 1-to-5, add notes, tally totals), an HTML `<table data-testid="vendor-scorecard-table">` with one header row and 10-12 data rows, and one strategy-call CTA at the bottom. Every claim on the page is defensible per the AGENTS.md rule: no invented efficacy numbers, no client names, no "9 out of 10 vendors fail question 3" style fabrications.
- [ ] The scorecard `<table>` reads its 10-12 rows from the SAME `VENDOR_QUESTIONS` constant currently module-local in `src/pages/QuestionsToAskAnAiVendor.tsx`. To satisfy the 2026-05-25 mirror-source rule (single source of truth) and the 2026-06-07 src-imports-tests lesson (canonical constants live in `src/data/`), the implementer moves `VENDOR_QUESTIONS` and its `VendorQuestion` type OUT of the sibling page module and INTO a new `src/data/vendorQuestions.ts` constants file, then re-imports it from BOTH pages (sibling and scorecard). The sibling page's rendered output stays byte-identical (the constant is moved, not edited); the sibling ticket-0061 spec continues to pass because the export shape (the array length and every field on every entry) is unchanged. The move is the smallest possible change to enable dual-consumption per the ticket 0040 (`src/data/routes.ts` extraction) precedent.
- [ ] The scorecard `<table>` renders one header row with cells `Question / Vendor A / Vendor B / Vendor C / Notes` and one data row per `VENDOR_QUESTIONS` entry. Each data row's Question cell shows the `question` text from the entry; each Vendor cell renders a printable score control (a `<div data-testid="score-cell">` containing the digits "1 2 3 4 5" separated by non-breaking spaces so the buyer can circle one with a pen on the printed sheet); the Notes cell renders an empty area with a printed underline. Each data row has `data-testid="scorecard-row"` for spec counting. Below the table, a small "How Digital Craft answers question N" strip mirrors the sibling page's `ourAnswerHref` / `ourAnswerLabel` links per entry (one link per entry that carries them, routing to the same route in `ROUTES` per the 2026-06-07 rule).
- [ ] The page emits ONE JSON-LD block inside the existing `<Helmet>` head: a `BreadcrumbList` (Home -> Questions to Ask an AI Vendor -> Scorecard) mirroring the shape used in `src/pages/QuestionsToAskAnAiVendor.tsx` but with the three-item structure (position 1 Home / position 2 Questions / position 3 Scorecard). The page deliberately does NOT emit a FAQPage block; the sibling page already owns the FAQPage schema for the same underlying questions and duplicating it would risk a Google structured-data duplicate-content flag.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` AND the ticket 0061 spec `tests/e2e/questions-to-ask-an-ai-vendor.spec.ts` for `=== 'FAQPage'` AND `=== 'BreadcrumbList'` predicates and documents the result in the Implementation log. The FAQPage grep is expected to surface the ticket 0061 predicate scoped to `/questions-to-ask-an-ai-vendor`; the scorecard page is at a DIFFERENT URL and emits NO FAQPage, so there is no collision. The BreadcrumbList grep is expected to surface many matches all URL-scoped per the ticket 0063 Implementation log. Per the 2026-05-25 mirror-source-fix family rule, if any predecessor predicate IS site-wide, the implementer widens it in the SAME PR.
- [ ] A new module-level `@media print` block is added to the scorecard page module. The block hides the site Navbar, the site Footer, the ScrollProgress bar, and the strategy-call CTA at print time via `display: none !important;`, forces the scorecard `<table>` to render `width: 100% !important; color: #000 !important; background: #fff !important;` regardless of on-screen theme, and adds thin printed borders to every table cell so the sheet reads as a grid on paper. The print stylesheet is inlined as a `<style media="print">` element inside the existing `<Helmet>` block so the print rules do not leak into the on-screen layout.
- [ ] A "Print scoring sheet" button (`data-testid="scorecard-print"`) is rendered above the table. On click, the handler fires `trackCTAClick('vendor_scorecard_print', 'vendor_scorecard')` FIRST (synchronously) and then calls `window.print()`. The page also fires `trackCTAClick('vendor_scorecard_view', 'vendor_scorecard')` exactly ONCE per page mount (debounced via a `useRef<boolean>(false)` guard mirroring the ticket 0060 / 0062 pattern).
- [ ] The route is registered in `src/App.tsx` next to the existing `/questions-to-ask-an-ai-vendor` route. `/questions-to-ask-an-ai-vendor/scorecard` is added to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson; `tests/e2e/routes.ts` re-exports it automatically and the smoke spec exercises the page. The sibling page (`src/pages/QuestionsToAskAnAiVendor.tsx`) gets ONE additive edit: a small "Print the scoring sheet" link in its hero or CTA area routing to `/questions-to-ask-an-ai-vendor/scorecard` (under 6 added lines; no existing copy is edited).
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in any JSON-LD serialized string, and the printed output (asserted via Playwright's `page.emulateMedia({ media: 'print' })` mode in the spec) has the on-screen chrome hidden and the scorecard table visible.
- [ ] A new e2e spec at `tests/e2e/vendor-scorecard.spec.ts` asserts: (1) `GET /questions-to-ask-an-ai-vendor/scorecard` returns 200 and the H1 contains "Scoring Sheet" or "Scorecard" (case-insensitive substring), (2) the table renders 10-12 data rows (asserted by counting `data-testid="scorecard-row"` locators against the imported `VENDOR_QUESTIONS.length` with `.toBeGreaterThanOrEqual(10)` and `.toBeLessThanOrEqual(12)`), (3) the header row cells contain "Question", "Vendor A", "Vendor B", "Vendor C", "Notes" (case-insensitive substring per cell), (4) each data row contains at least three `data-testid="score-cell"` elements (one per vendor column), (5) the BreadcrumbList JSON-LD has three items with the last one named matching the page H1 substring and linking to `https://digitalcraftai.com/questions-to-ask-an-ai-vendor/scorecard`, (6) NO FAQPage JSON-LD block is emitted on this page (asserted by parsing every `<script type="application/ld+json">` and confirming zero blocks have `@type === 'FAQPage'`), (7) print-view case calls `await page.emulateMedia({ media: 'print' })` and asserts (a) the scorecard table is visible, (b) the site `nav` element is hidden, (c) the site `footer` element is hidden, (8) print-button case overrides `window.print` via `page.addInitScript` BEFORE navigation and asserts the print call fires exactly once after the click, (9) analytics-fire-order case asserts the `vendor_scorecard_print` beacon fires BEFORE the print call, (10) sibling-page-still-passes-ticket-0061-spec regression: navigate to `/questions-to-ask-an-ai-vendor` and re-run the key assertions from `tests/e2e/questions-to-ask-an-ai-vendor.spec.ts` (H1 substring, FAQPage block present with correct mainEntity length) to prove the `VENDOR_QUESTIONS` extraction did not break the sibling, (11) dark-mode case applies `document.documentElement.classList.add('dark')` and asserts the table renders, (12) no-em-dash case reads `page.textContent('body')` and asserts no `String.fromCharCode(8212)`.
- [ ] No `/api/` change, no new hostname (the only external link is the existing `calendly.com/mutaaf` URL already used across the site), no new npm dependency, no edits to `package.json` / `package-lock.json`, no NEW persistent-storage key (the scorecard is stateless), no edits to `/trust`, `/playbook`, `/changelog`, `/uptime`, `/compare`, `/my`, or `src/components/PricingFAQ.tsx`. The sibling page (`src/pages/QuestionsToAskAnAiVendor.tsx`) gets exactly ONE additive change (the small print link) plus the `VENDOR_QUESTIONS` import rewrite (was module-local, now imports from `src/data/vendorQuestions.ts`); the visible rendering and the emitted FAQPage block on the sibling page stay byte-identical. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; the existing `tests/e2e/questions-to-ask-an-ai-vendor.spec.ts` (ticket 0061) stays green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A JavaScript scoring engine that computes the vendor
  totals live on-screen. The scorecard is print-first;
  scoring computation happens on paper with a pen. An
  on-screen scoring UI is its own conversion ticket if
  telemetry shows print usage justifies it.
- A "save my scored sheet" localStorage flow. The
  scorecard is deliberately stateless; persisting a
  scored sheet would require a new /trust disclosure
  row and change the artifact from "printable template"
  to "browser-local record."
- A jsPDF export path. The browser's native print-to-PDF
  dialog is the shipping mechanism; adding a heavy PDF
  library violates the Hard NO on GTM-queue
  `package.json` edits.
- A per-vendor "which vendor scored highest" leaderboard.
  The page is one buyer's scoring template, not a
  vendor-comparison surface. `/compare` is the canonical
  vendor comparison hub.
- Editing the sibling page's 10-12 `VENDOR_QUESTIONS`
  entries. The constant is moved from module-local to
  `src/data/vendorQuestions.ts` (a mechanical extraction)
  with byte-identical field values; content edits are
  their own content ticket.
- Emitting a second FAQPage JSON-LD block on the
  scorecard page. The sibling page already owns the
  FAQPage schema for these questions; duplicating it
  risks a duplicate-content flag on the site graph.
- Emitting a `Table` schema.org type. `Table` is not a
  common structured-data type Google renders as rich
  results, and the artifact's SEO value is captured by
  the sibling FAQPage plus the scorecard BreadcrumbList.
- An email-capture "email me a filled-in scorecard"
  flow. The page is passive; email capture violates
  the ticket 0036 "no fourth capture form" principle.
- Adding the scorecard route to the `index.html` SEO
  Pilot pages table. That is its own SEO-hygiene ticket
  per the 2026-05-25 SEO Pilot lesson; the new e2e
  spec asserts the Helmet-managed
  `meta[name="description"]` directly, not
  `page.toHaveTitle()`.
- Cross-promoting the scorecard from the navbar or the
  footer. Cross-surface promotion is its own conversion
  ticket once telemetry shows the page earns organic
  traffic; the sibling page's small print link is the
  ONLY cross-link this ticket ships.
- Internationalization (`inLanguage` on the schema).
  The page is English-only matching every existing
  buyer-class surface.
- A row-level score-cell selection UI (click 3 to
  highlight a 3). The score cells are printed digits
  the buyer circles on paper; on-screen interactive
  selection is out of scope.
- Auto-populating any vendor column with a competitor
  name ("Vendor A: Podium"). The three vendor columns
  are deliberately blank; naming vendors in the printed
  template would require the AGENTS.md defensible-
  claims rule to apply to every named vendor and is
  its own trust-review process.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/VendorScorecard.tsx` (under 260 lines).
  Mirror the page-shell pattern of
  `src/pages/QuestionsToAskAnAiVendor.tsx` (ticket 0061,
  the closest structural peer). Define module-level
  constants `META_DESCRIPTION`, `PAGE_H1`,
  `BREADCRUMB_SCHEMA` per the 2026-05-25 mirror-source
  rule (the description used in the Helmet meta tag and
  the H1 used in the BreadcrumbList third item MUST
  each be a single constant).
- New `src/data/vendorQuestions.ts` (mechanical
  extraction). Move the `VENDOR_QUESTIONS` constant and
  its `VendorQuestion` type from
  `src/pages/QuestionsToAskAnAiVendor.tsx` into this
  new file with byte-identical field values. The
  sibling page changes ONE line (the local declaration
  becomes an `import { VENDOR_QUESTIONS } from '@/data/vendorQuestions';`
  at the top of the file). The new scorecard page
  imports the same constant. This is the smallest
  possible change to enable dual-consumption per the
  ticket 0040 (`src/data/routes.ts` extraction)
  precedent. The move is exactly one file added and
  one file (sibling) edited by exactly one line beyond
  the print-link addition; the visible rendering and
  the emitted FAQPage block on the sibling page stay
  byte-identical.
- New route in `src/App.tsx`: import `VendorScorecard`
  from `./pages/VendorScorecard` and add
  `<Route path="/questions-to-ask-an-ai-vendor/scorecard" element={<VendorScorecard />} />`
  next to the existing `/questions-to-ask-an-ai-vendor`
  route. Mirror the (non-)lazy-loading convention of
  the adjacent buyer-class route per the ticket 0061
  precedent (post-2026-09-05 route-code-splitting
  lesson: if the route is lazy-loaded, the new spec
  must not rely on `root.innerHTML.length > N` for
  readiness).
- Per the 2026-06-07 src-imports-tests lesson, add
  `/questions-to-ask-an-ai-vendor/scorecard` to the
  `ROUTES` array in `src/data/routes.ts` (the canonical
  allow-list); `tests/e2e/routes.ts` re-exports it
  automatically and the smoke spec exercises the page.
- `src/pages/QuestionsToAskAnAiVendor.tsx` - TWO
  additive edits: (1) replace the module-local
  `VENDOR_QUESTIONS` declaration with an import from
  `@/data/vendorQuestions` (mechanical extraction,
  no value change), and (2) add ONE small link in the
  hero or CTA area routing to
  `/questions-to-ask-an-ai-vendor/scorecard` with the
  label "Print the scoring sheet" (under 6 added lines;
  no existing copy is edited). Per the 2026-05-25
  mirror-source rule, if the sibling page or its spec
  hardcodes the array length anywhere, that hardcoded
  value stays untouched; the count is dynamic in the
  spec (`.toBeGreaterThanOrEqual(10)` per ticket 0061
  acceptance box 2).
- Per the 2026-05-30 second-@type lesson, BEFORE
  writing code grep `tests/e2e/questions-to-ask-an-ai-vendor.spec.ts`
  and `tests/e2e/*-jsonld.spec.ts` for
  `=== 'FAQPage'` AND `=== 'BreadcrumbList'`
  predicates. Document the grep result in the
  Implementation log. The scorecard page emits NO
  FAQPage block, so the sibling FAQPage predicate is
  unaffected regardless of scoping. Every predecessor
  BreadcrumbList predicate is URL-scoped per the
  ticket 0063 Implementation log; the scorecard's
  own BreadcrumbList block does not collide.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e
  spec asserts the Helmet-managed
  `meta[name="description"]` content directly (LAST
  `meta[name="description"]` per the 2026-05-25
  Helmet-appends lesson), NOT `page.toHaveTitle()`.
  `/questions-to-ask-an-ai-vendor/scorecard` is NOT
  in the `index.html` SEO Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every string in
  the new page module (the H1, the META_DESCRIPTION,
  the header cell labels, the how-to-use paragraph,
  the CTA label, the JSON-LD strings, the print-
  stylesheet) uses hyphens. Self-Review greps the
  diff for `String.fromCharCode(8212)` before
  pushing. The `VENDOR_QUESTIONS` extraction is a
  mechanical move; if any existing entry contains an
  em-dash, fix it in the moved file per the
  2026-05-25 mirror-source-fix rule (a hyphen swap
  is punctuation repair, not rewording) and note the
  fix in the Implementation log.
- Print stylesheet: inline it inside the existing
  `<Helmet>` block on the scorecard page as a
  `<style type="text/css" media="print">` element.
  Hide the site Navbar, Footer, ScrollProgress bar,
  and strategy-call CTA at print-time via
  `display: none !important;`. Force the scorecard
  `<table>` and its rows to render
  `width: 100% !important; color: #000 !important; background: #fff !important;`
  and add thin printed borders (`border: 1px solid #000 !important;`)
  to every cell. Every hidden selector uses
  `display: none !important;` because Tailwind's
  utility classes carry higher specificity.
- Anchor-link deep-linking is NOT needed on this
  page (the scorecard is one contiguous artifact,
  not sectioned anchors like the sibling page).
- `tests/e2e/vendor-scorecard.spec.ts` (new) - one
  assertion per acceptance box. Model the spec on
  `tests/e2e/questions-to-ask-an-ai-vendor.spec.ts`
  (ticket 0061, the closest peer) and on
  `tests/e2e/roi-card-on-dashboard.spec.ts` (ticket
  0062, for the print-button spy pattern). The
  print-view case uses
  `await page.emulateMedia({ media: 'print' })`
  BEFORE the visibility assertions - Playwright
  ships this API natively (no new dependency). Per
  the 2026-09-05 route-code-splitting lesson,
  prefer auto-retrying `await expect(locator).toBeHidden()`
  / `.toBeVisible()` over one-shot `.isVisible()`
  for print-mode assertions. The print-button case
  overrides `window.print` via `page.addInitScript`
  BEFORE the navigation (init scripts run before
  every document load); the analytics-fire-order
  case uses the same init-script approach to record
  beacons in a window-level array in call order.
  The sibling-page-regression case navigates to
  `/questions-to-ask-an-ai-vendor` and re-runs the
  key ticket 0061 assertions (H1 substring, FAQPage
  block present with `mainEntity.length === VENDOR_QUESTIONS.length`)
  to prove the mechanical extraction did not break
  the sibling.
- Per the 2026-05-22 two-PR ship lesson, ship will
  need a follow-up `chore/0067-ship-status` PR after
  the feat PR merges to flip the ticket frontmatter
  AND its `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing
  the second PR so the file and index never drift
  mid-flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, the existing
  Navbar / Footer / ScrollProgress components, the
  existing `trackCTAClick` helper, and
  `window.print()` (native browser API). Schema
  migration: no. Privacy / security surface change:
  NO - the page is static content that emits no new
  network calls, adds no new persistent-storage key,
  and hands print control to the browser's native
  print dialog. The `VENDOR_QUESTIONS` mechanical
  move does not change any observable behavior on
  the sibling page.

## Implementation log

(Appended by the implementation-dev agent during execution.)
