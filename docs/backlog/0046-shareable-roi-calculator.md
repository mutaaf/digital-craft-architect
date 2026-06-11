---
id: 0046
title: Shareable AI ROI calculator producing a branded annual savings result link
status: in-progress
priority: P1
area: conversion
created: 2026-06-11
owner: gtm-innovation
---

## User story

As a small-business owner (a 6-truck plumbing shop, a 20-agent
real-estate brokerage, a 12-employee construction company) who
has finished the AI Readiness Quiz or read the homepage and is
trying to decide whether AI automation is worth a 30-minute
strategy call, I want a small calculator at `/roi` that asks me
four plain-language inputs (weekly inbound leads, average minutes
my team spends per lead, fully-loaded hourly rate, after-hours
lead percentage), shows me a defensible annual savings range with
the math visible, and gives me a shareable URL I can paste into
my partner's Slack with a Copy button, so that I can have the
"is this worth a call" conversation with my co-owner using a
real number on a real screen instead of forwarding another
marketing PDF.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the calculator computes
annual savings client-side from four inputs using a single
documented formula (`savedHoursPerWeek = leadsPerWeek * (minutesPerLead / 60) * afterHoursPercent`
and `annualSavings = savedHoursPerWeek * hourlyRate * 52`). No
AI call, no scrape, no demo, no backend. The share-link encoder
pattern from ticket 0009 (`src/pages/construction/estimateShareParams.ts`)
already proves the URL-rehydration model is reliable; this
ticket applies the same pattern to a different four-input
shape and a different output card. One new page, one new
sibling util, one new spec, zero new endpoint. The math is
intentionally conservative (after-hours-only savings, not total
lead-handling time) so the visible number is defensible against
any owner who challenges it.

### Stakeholder

This widens the moat by producing a structurally new shareable
artifact the prospect can paste into a peer conversation: a
dollar-denominated annual savings figure with the math visible,
not a marketing claim. Ticket 0009 (shareable estimate) and
ticket 0029 (shareable voice summary) own demo-output artifacts;
this ticket owns the pre-demo decision artifact (ROI math).
Comparison pages (tickets 0021-0042) own the side-by-side
artifact; the ROI calculator owns the inside-my-own-business
artifact. The three together cover the three canonical buyer-
conversation surfaces (build vs. buy via comparison, "what does
the demo look like" via estimate, "what does it earn me" via
ROI). Per the AGENTS.md defensible-claims rule the math is
documented IN the rendered card (every input value and the
formula appear in plain English under the result) so the page
cannot be accused of inflated efficacy. The page is also a
natural top-of-funnel target for "AI ROI calculator" and
"AI cost savings" SERP queries with low existing competition
from defensible neutral surfaces.

### Visitor (in the real moment of use)

A 6-truck plumbing owner taps a "Calculate your ROI" link from
the quiz result panel on a phone after work. The calculator
loads in one screen: four sliders/number inputs with sensible
defaults pre-filled (50 leads/week, 8 minutes/lead, $85/hour,
35% after-hours - all defensible against published industry
medians named in the on-page footnote). The result card updates
live as the visitor drags: "$X annual savings (conservative
estimate)" with the four input echoes and the formula plainly
listed underneath. Below the result a "Copy share link" button
writes the encoded URL to clipboard with a "Copied" toast
(reusing the ticket 0009 pattern). One CTA below: "Book a
strategy call." Light and dark mode supported; the page works
on a 375px viewport with one-thumb input.

### Growth

The "show me" moment is the screenshot a plumbing-shop owner
sends to their partner over text: a clean Digital Craft card
naming a four-figure annual savings number with the math
visible, and a "Book a strategy call" button. That is exactly
the artifact a traditional-industry co-owner forwards when they
want to start the AI conversation with a peer. Each share-link
copy fires `trackCTAClick('roi_share_copy', 'roi')` and each
recipient open fires `trackCTAClick('roi_share_open', 'roi')`
(detectable by the presence of encoded query params on a
non-form mount), so the K-factor of the artifact is measurable.
Per the ticket 0009 precedent the share-link is the cheapest
acquisition lever the site has because the share is initiated
by the prospect to a target the marketing team does not know.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/RoiCalculator.tsx` (new file, under 280 lines) renders at `/roi`. The page uses the existing `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell mirrored from `src/pages/AIReadinessQuiz.tsx`. The page renders one hero (H1 contains "ROI"), four number inputs (weekly inbound leads default 50, average minutes per lead default 8, fully-loaded hourly rate default 85, after-hours lead percentage default 35), a live result card (annual savings dollars, weekly hours saved, monthly hours saved), an on-page math block listing the formula in plain English, a Copy share link button, and one strategy-call CTA. Every default value is sourced from a publicly-cited industry median named in an HTML comment above the constant per the 2026-05-25 mirror-source-fix rule; the rendered footnote names the same source.
- [ ] A new sibling util `src/pages/roiCalculatorParams.ts` (under 80 lines, co-located with the page mirroring the ticket 0009 `estimateShareParams.ts` convention) exports `encodeRoiParams(inputs)` and `decodeRoiParams(searchParams)` with parse-safe validation. Each input has documented sensible bounds (leads: 1-1000, minutes: 1-120, hourly: 10-500, after-hours-percent: 0-100); a value outside bounds in a decoded URL falls back to the default for that input and the page does NOT throw. A computeRoi helper exported from the same file returns `{ weeklyHoursSaved, monthlyHoursSaved, annualSavings }` from a validated input bundle. The compute helper is pure (no React, no DOM, no Date) so a unit-style assertion can call it directly from the e2e spec via `page.evaluate(() => import('/src/pages/roiCalculatorParams.ts'))`.
- [ ] Opening `/roi` with no query params renders the calculator with the four defaults and an initial result card showing the default-input computation. Opening `/roi?leads=120&minutes=10&hourly=95&afterhours=45` rehydrates the four inputs to those values and renders the matching result without the visitor touching a control (the same rehydration pattern shipped in ticket 0009 for `/construction/demo/estimate`). A malformed `?leads=foo` falls back to the default for that input only and does NOT reset the other three.
- [ ] The "Copy share link" button writes the current `/roi?leads=<n>&minutes=<n>&hourly=<n>&afterhours=<n>` URL to clipboard (reusing the existing `navigator.clipboard.writeText` flow from `src/components/construction/estimate/EstimateCard.tsx` per ticket 0009) and shows a transient "Copied" confirmation. The clipboard write is guarded in try/catch; a denied clipboard permission shows a fallback "Press to select the link" UI with a pre-selected `<input>` so a visitor on iOS Safari without clipboard permission can still share. Both copy paths fire `trackCTAClick('roi_share_copy', 'roi')`.
- [ ] The page emits TWO JSON-LD blocks inside the existing `<Helmet>` head: (1) a `BreadcrumbList` (Home -> ROI Calculator) mirroring the shape from `src/pages/AiForLandscapers.tsx`, and (2) a `WebApplication` block with `@type: 'WebApplication'`, `name: 'AI ROI Calculator'`, `applicationCategory: 'BusinessApplication'`, `description` (same string as `META_DESCRIPTION` per the 2026-05-25 mirror-source rule), `offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }`, and `operatingSystem: 'Web'`. Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'WebApplication'` AND `=== 'SoftwareApplication'` predicates. The /demos hub already emits a `SoftwareApplication` block per ticket 0030; a sibling `WebApplication` block on `/roi` does NOT collide because `WebApplication` is a strict subtype of `SoftwareApplication` and the spec-level "exactly one" assertions in ticket 0030 are URL-scoped. The grep result is documented in the Implementation log.
- [ ] The route is registered in `src/App.tsx` next to the existing `/quiz` route. `/roi` is added to `ROUTES` in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson; `tests/e2e/routes.ts` re-exports it automatically and the smoke spec exercises the page. The sitemap generator (ticket 0022) picks up the new route and emits a `lastmod` from the commit date. The AI Readiness Quiz result panel (`src/pages/AIReadinessQuiz.tsx`, the `tier`-rendered block around line 800+) gets ONE new outbound link to `/roi` labelled "Calculate your ROI" so quiz-takers reach the calculator naturally; this is the only edit to the quiz file.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in any JSON-LD serialized string, and every input is keyboard-accessible (the four `<input type="number">` controls carry visible labels via `<label for=>` association and respond to ArrowUp / ArrowDown). The result card updates within one render of any input change.
- [ ] A new e2e spec at `tests/e2e/roi-calculator.spec.ts` asserts: (1) defaults case navigates to `/roi`, asserts the result card shows the expected default computation (compute it inline in the spec via the same formula), (2) input case fills the four inputs to specific values and asserts the result card matches the formula-computed value, (3) URL-rehydration case navigates to `/roi?leads=120&minutes=10&hourly=95&afterhours=45` and asserts the four inputs and the result card all match, (4) parse-safe case navigates to `/roi?leads=foo&minutes=10&hourly=95&afterhours=45` and asserts the leads input shows the default and the other three are honored, (5) copy case clicks "Copy share link" and asserts the clipboard contains a URL with the four encoded params (use `page.evaluate(() => navigator.clipboard.readText())` with the `'clipboard-read'` permission granted in the test context), (6) JSON-LD case asserts exactly one BreadcrumbList block names "ROI Calculator" and exactly one WebApplication block carries `applicationCategory: 'BusinessApplication'`, (7) dark-mode case applies `document.documentElement.classList.add('dark')` and asserts the page renders, (8) no-em-dash case reads `page.textContent('body')` and asserts no `String.fromCharCode(8212)`.
- [ ] No `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/pages/construction/estimateShareParams.ts` (the ticket 0009 encoder is a different shape and stays untouched), no edits to `src/components/construction/estimate/EstimateCard.tsx` (the copy pattern is read for inspiration, then re-implemented inline at `/roi` to keep coupling low). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. Every pre-existing JSON-LD spec (tickets 0012, 0013, 0016, 0025, 0030, 0039, 0043, 0044) stays green; the new spec passes.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A multi-vertical ROI variant (construction-specific math vs.
  real-estate-specific math vs. home-services-specific math).
  The page ships ONE conservative formula that holds across all
  three verticals because all three suffer the same after-hours
  lead-leakage problem; vertical-specific tuning is a follow-up
  ticket once telemetry shows which vertical clicks share-copy
  the most.
- A PDF or PNG export of the result card. The share-link URL
  is the canonical share artifact; PNG/PDF generation requires
  a heavy client-side library (html2canvas or jsPDF) and is
  out of the 200-line diff budget. A future ticket can wrap
  the share-link in an OG-image endpoint if telemetry justifies
  it (which would touch /api/ and require its own ticket).
- A "compare ROI across three scenarios" multi-column view.
  The page is one calculator, one result; multi-scenario is a
  product feature behind a sales conversation.
- Persisting the inputs to localStorage. The share-link URL is
  the persistence model; localStorage would silently shadow the
  URL and is a UX trap (per the ticket 0009 / 0014 precedent
  the share link is the source of truth, not the local cache).
- An email-capture form to "send me my ROI." Three capture
  surfaces exist already (tickets 0002, 0015, 0033) and ticket
  0036 explicitly closed the door on a fourth as noise. The
  Copy share link button is the conversion mechanism.
- Server-side rendering or pre-rendering. The page is dynamic
  by input and parse-safe by URL; crawlers see the default
  state which is correct.
- A multi-language ROI calculator. The page is English-only;
  `inLanguage` is omitted from the JSON-LD by design.
- Including testimonials or efficacy percentages from named
  clients on the page. Per the AGENTS.md Hard NO on invented
  testimonials and the defensible-claims rule the only
  efficacy claim on the page is the visible formula.
- An "AI ROI calculator" blog post pointing at `/roi`. Blog
  content ships through its own pipeline gated by
  `check-blog-dates`; cross-promotion is its own ticket.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/RoiCalculator.tsx` (under 280 lines). Mirror
  the page-shell pattern of `src/pages/AIReadinessQuiz.tsx`
  (Navbar, Footer, ScrollProgress, Helmet). Define module-level
  constants `META_DESCRIPTION`, `DEFAULT_INPUTS`,
  `BREADCRUMB_SCHEMA`, `WEBAPP_SCHEMA` per the 2026-05-25
  mirror-source rule. The four inputs are React state via
  `useState<RoiInputs>` initialized from `decodeRoiParams(searchParams)`
  with `DEFAULT_INPUTS` as the fallback. The result card reads
  `computeRoi(inputs)` on every render (the compute helper is
  fast and pure; no memo needed unless TypeScript-strict
  ratchet from ticket 0007 flags it).
- New `src/pages/roiCalculatorParams.ts` (under 80 lines).
  Mirror the shape of `src/pages/construction/estimateShareParams.ts`
  from ticket 0009. Export typed `RoiInputs` interface,
  `DEFAULT_INPUTS` constant, `encodeRoiParams(inputs): string`,
  `decodeRoiParams(searchParams: URLSearchParams): RoiInputs`,
  and `computeRoi(inputs): RoiOutputs`. Every decoded input is
  validated against documented bounds and falls back to the
  default for that input only.
- `src/App.tsx` - import `RoiCalculator` and add
  `<Route path="/roi" element={<RoiCalculator />} />` next to
  the existing `/quiz` route. Mirror the (non-)lazy-loading
  convention of the adjacent route.
- `src/data/routes.ts` - add `/roi` to the `ROUTES` array per
  the 2026-06-07 src-imports-tests lesson. `tests/e2e/routes.ts`
  re-exports automatically.
- `src/pages/AIReadinessQuiz.tsx` - add ONE new outbound `<Link to="/roi">Calculate your ROI</Link>`
  inside the existing `tier`-rendered result panel (find the
  closest peer link inside `isQuizDone` rendering, around line
  800+, and add the new link alongside). This is the only edit
  to the quiz file and stays inside the 200-line diff budget.
  Do NOT touch the QUESTIONS array, the scoring weights, the
  Quiz JSON-LD from ticket 0039, the persona names, or the
  email capture; the link addition is structurally additive.
- Per the 2026-05-30 second-@type lesson, BEFORE writing code
  grep `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'`,
  `=== 'WebApplication'`, AND `=== 'SoftwareApplication'`
  predicates. Document the grep result in the Implementation
  log. The /demos hub `SoftwareApplication` block (ticket 0030)
  is URL-scoped per the existing spec convention, so adding a
  sibling `WebApplication` on `/roi` is structurally safe;
  the grep is mandatory regardless.
- Per the 2026-05-07 em-dash Hard NO, every string in the
  page module, the new util, the four input labels, the
  formula prose, the JSON-LD strings, the CTA labels, and the
  defaults footnote uses hyphens. Self-Review greps the diff
  for `String.fromCharCode(8212)` before pushing.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e spec asserts
  the Helmet-managed `meta[name="description"]` content
  directly (LAST `meta[name="description"]` per the
  2026-05-25 Helmet-appends lesson), NOT `page.toHaveTitle()`.
  `/roi` is not added to the `index.html` SEO Pilot pages
  table in this ticket.
- `tests/e2e/roi-calculator.spec.ts` (new) - one assertion per
  acceptance box. Model the spec on
  `tests/e2e/shareable-estimate-link.spec.ts` (ticket 0009,
  the closest peer for "encode/decode URL params, copy
  share-link to clipboard"). The clipboard-read assertion
  requires `permissions: ['clipboard-read', 'clipboard-write']`
  in the spec's `test.use({})` block per the existing pattern
  in `voice-summary-share-link.spec.ts` (ticket 0029).
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, the existing Navbar /
  Footer / ScrollProgress components, and the existing
  `trackCTAClick` helper. Schema migration: no. Privacy/
  security surface change: no - inputs live in the URL query
  string only, no localStorage write, no new external network
  call, no PII. The /trust page disclosure list does NOT need
  an edit because no new persistent store is added.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-06-11 - branch `feat/0046-shareable-roi-calculator` opened off fresh `origin/main` (HEAD 58c7804); ticket and README index flipped to `in-progress` in the same commit per the 2026-05-22 backlog-validator rule. PR 2 (chore/0046-ship-status flipping to shipped) is opened separately by the ship runner per the 2026-05-22 two-PR lesson.
- 2026-06-11 - per the 2026-05-30 second-@type lesson, grepped every `tests/e2e/*-jsonld.spec.ts` for the three predicates BEFORE writing JSON-LD code:
  - `=== 'BreadcrumbList'` - matches in `changelog-itemlist-jsonld.spec.ts:103`, `trust-aboutpage-jsonld.spec.ts:111`, `quiz-jsonld.spec.ts:98`. Every match is URL-scoped (each spec's `goto<Route>` helper navigates to its own route); none asserts "exactly one BreadcrumbList block site-wide", so adding a new BreadcrumbList block on `/roi` is safe.
  - `=== 'WebApplication'` - zero matches across `tests/e2e/*-jsonld.spec.ts`. No predecessor predicate exists to collide with.
  - `=== 'SoftwareApplication'` - one match in `demos-softwareapplication-jsonld.spec.ts:68`, asserted via `gotoDemos(page)` which navigates to `/demos` only. The "exactly one SoftwareApplication block expected on /demos" predicate (line 119) is strictly URL-scoped, so emitting a sibling `WebApplication` block on `/roi` does not collide (the spec never visits `/roi` and `WebApplication` is a subtype of `SoftwareApplication` only at the schema.org type-hierarchy level, not at the runtime `@type` string-equality level the spec uses).
- 2026-06-11 - failing tests added in `tests/e2e/roi-calculator.spec.ts`
- 2026-06-11 - PR #N opened, CI [state]
- 2026-06-11 - merged to main
