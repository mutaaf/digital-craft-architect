---
id: 0052
title: Shareable AI Readiness Quiz result deep-link rendering the tier card from a /quiz?tier= URL
status: groomed
priority: P1
area: conversion
created: 2026-06-13
owner: gtm-innovation
---

## User story

As a small-business owner who just finished the AI Readiness
Quiz and got a "Ready for AI" tier card I want my co-owner to
see before our Friday planning meeting, I want a "Copy share
link" button on the result panel that copies a `/quiz?tier=ready`
URL to my clipboard, and I want my co-owner who opens that URL
on a different device to see the same tier card (the same
icon, the same color, the same description, the same CTA to
book a strategy call) without having to retake the eight-
question quiz themselves, so that the result becomes a real
artifact I can paste into a Slack DM or a text thread instead
of telling my co-owner "I scored ready, you should take it
too."

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the AI Readiness Quiz
result panel (`src/pages/AIReadinessQuiz.tsx` `ResultsPanel`
at line 352+) already renders a `tierInfo` card from a `Tier`
discriminated union (`'getting_started' | 'ready' | 'advanced'`,
line 127), and the `TIERS` constant maps each tier to a label,
icon, color, and description. The persona is already persisted
to localStorage via `src/utils/quizPersonaStore.ts` (ticket
0045). What is missing is the URL surface: today the tier card
is reachable ONLY by completing eight quiz questions in the
same session, so the result is structurally not shareable in
the way the shareable estimate (ticket 0009), the shareable
voice summary (ticket 0029), and the shareable ROI calculator
(ticket 0046) are. Adding a `?tier=` query-string deep-link
plus a Copy share link button on the result panel completes
the shareable-artifact moat family with the same pattern the
three predecessor tickets shipped: encode/decode params, copy
the URL to clipboard, render the relevant card from the
decoded params. The deep-link path renders the tier card
ONLY (no score, no dimensions, no AI analysis, no full result
panel) because the URL only encodes one piece of information;
that intentional minimalism is what makes the share artifact
small enough to fit a phone screenshot.

### Stakeholder

This widens the moat by producing the fourth structurally
shareable artifact in the canonical buyer-conversation
surfaces: the persona card joins the estimate (ticket 0009),
the voice summary (ticket 0029), and the ROI dollar figure
(ticket 0046) as the four artifacts a prospect can paste
into a peer conversation. Each represents a different stage
of the funnel - persona is the "where am I" pre-demo
artifact, estimate / voice summary are the post-demo
artifacts, and ROI is the decision artifact. The persona
artifact in particular is the one a co-owner / partner /
operations lead is most likely to receive first, because
the quiz is the lowest-friction entry point on the site
(no URL scrape required, two minutes to complete). The
share-link URL also becomes a measurable acquisition lever:
each `trackCTAClick('quiz_share_copy', 'quiz')` fire is the
moment a prospect commits to telling a peer; each
`trackCTAClick('quiz_share_open', 'quiz')` fire (detected by
a `?tier=` param on a non-form mount) is the recipient
opening it. The K-factor is the cheapest acquisition signal
the funnel can produce because the recipient is a target the
marketing team does not know.

### Visitor (in the real moment of use)

A 6-truck plumbing shop owner finishes the quiz on their
phone over coffee and lands on "Ready for AI." Below the
tier card is a new "Copy share link" button (mirroring the
ticket 0046 ROI calculator pattern) that, on tap, writes
`https://digitalcraftai.com/quiz?tier=ready` to the
clipboard with a transient "Copied" confirmation. They paste
it into a Slack DM to their co-owner with "this is what we
talked about." The co-owner taps it from Slack on a
different device an hour later, lands on `/quiz`, and sees
the same Ready for AI tier card (icon, color, label,
description) rendered at the top of the page above the
question 1 stem, with a header note that reads "Shared
result. Take the quiz yourself to see your own tier." The
visitor can scroll past the shared card into the quiz
question 1 or tap the strategy-call CTA directly from the
shared card. Light and dark mode supported; the page works
on a 375px viewport with one-thumb interaction.

### Growth

The "show me" moment is the screenshot a plumbing-shop
owner sends to their partner over text: a clean Digital
Craft tier card naming "Ready for AI" with a Book-a-call
button below. That is exactly the artifact a traditional-
industry co-owner forwards when they want their partner to
take the same step. Per the ticket 0009 / 0046 precedent the
share-link is the cheapest acquisition lever the site has
because the share is initiated by the prospect to a target
the marketing team does not know. The deep-link recipient
is a brand-new visitor whose first interaction with the site
is a real, personalized artifact - structurally a higher-
intent first-touch than a generic landing page.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new sibling util `src/pages/quizTierShareParams.ts` (under 60 lines, co-located with the quiz page mirroring the ticket 0046 `roiCalculatorParams.ts` convention) exports `encodeQuizTierParam(tier: Tier): string`, `decodeQuizTierParam(searchParams: URLSearchParams): Tier | null`, and re-exports the `Tier` type from a new module-level export in the quiz page (extracted from the inline `type Tier = 'getting_started' | 'ready' | 'advanced'` at line 127 into a named export so both files share one definition; the 2026-05-25 mirror-source rule). Parse-safe: a value outside the three valid tier strings (or a missing param) returns `null` and the page does NOT throw. The util has no React, no DOM, no Date import so a Playwright `page.evaluate` can call it directly.
- [ ] `src/pages/AIReadinessQuiz.tsx` gets ONE new "Copy share link" button rendered INSIDE the existing `ResultsPanel` component just below the tier hero card (the existing `tier + score gauge` block, lines 381-430), wired to write `https://digitalcraftai.com/quiz?tier=<encoded>` to the clipboard via `navigator.clipboard.writeText` with a try/catch fallback to a pre-selected `<input>` per the ticket 0046 iOS-Safari fallback pattern. Both copy paths fire `trackCTAClick('quiz_share_copy', 'quiz')`. The button is visible ONLY when `tier !== null` (i.e. after the quiz is done) so a mid-quiz visitor never sees a share button for a tier they have not earned.
- [ ] `src/pages/AIReadinessQuiz.tsx` gets ONE new "shared tier banner" rendered ABOVE the existing question 1 stem (inside the `!isQuizDone` rendering branch, before the existing first question card), conditioned on a non-null `decodeQuizTierParam(new URLSearchParams(window.location.search))` AND `!isQuizDone`. The banner renders the corresponding `TIERS[sharedTier]` card (icon, color, label, description) inside a calm container with a one-line header reading exactly "Shared result. Take the quiz yourself to see your own tier." plus the existing "Book a Strategy Call" CTA reusing the existing calendly URL. The banner fires `trackCTAClick('quiz_share_open', 'quiz')` exactly once per mount (guarded by a `useRef` flag so a re-render does not double-fire). When the visitor starts answering questions, the banner stays visible until step 1 begins; once `step > 0` the banner is hidden so it does not race the quiz-answer UI.
- [ ] Opening `/quiz` with no query params (default behavior) shows the existing quiz intro and question 1 with NO shared-tier banner; the existing behavior is byte-identical to today. Opening `/quiz?tier=ready` shows the Ready tier card in the shared banner above question 1. Opening `/quiz?tier=foo` (malformed) treats the param as absent: no banner renders, no console error, no exception. Opening `/quiz?tier=` (empty value) is also treated as absent. Once the visitor completes the quiz themselves, `tier` from `computeTier(answers)` overrides any shared `?tier=` param (the visitor's own tier is the source of truth post-completion).
- [ ] The shared banner renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in the new util, and the new banner mounts under the existing Navbar with the existing layout spacing (the existing pt-32 container) so the shared card is never hidden under the navbar. The Copy share link button on the result panel matches the existing button-style convention (`Button` from `@/components/ui/button` per the existing import at line 6).
- [ ] A new e2e spec at `tests/e2e/quiz-share-link.spec.ts` asserts: (1) baseline case navigates to `/quiz`, asserts no shared-tier banner exists (locator `data-testid="quiz-shared-tier-banner"` returns count 0) and question 1 stem renders, (2) ready-tier case navigates to `/quiz?tier=ready`, asserts the shared banner renders with the Ready tier label visible, (3) advanced-tier case navigates to `/quiz?tier=advanced`, asserts the Advanced tier label visible, (4) getting-started-tier case navigates to `/quiz?tier=getting_started`, asserts the Getting Started tier label visible, (5) malformed-tier case navigates to `/quiz?tier=foo` and asserts the banner is absent and no `pageerror` event fires, (6) copy case completes one synthetic quiz path (via a deterministic answer-clicking flow already proven in any existing quiz-touching spec - reuse the pattern), reaches the result panel, clicks "Copy share link" and asserts the clipboard contains a URL with `?tier=` matching the computed tier (use `permissions: ['clipboard-read', 'clipboard-write']` in the spec's `test.use({})` block per the ticket 0046 pattern), (7) no-em-dash case reads `page.textContent('body')` on `/quiz?tier=ready` and asserts no `String.fromCharCode(8212)`, (8) dark-mode case applies `document.documentElement.classList.add('dark')` and asserts the shared banner renders.
- [ ] No JSON-LD changes (the existing Quiz JSON-LD from ticket 0039 is NOT edited; the deep-link does not change the structured data the page emits). No `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the QUESTIONS array, the scoring weights (`computeTier` function), the persona names, the ROI calculation, the AI analysis flow, the email capture, or the existing `/roi` outbound link from ticket 0046. The quiz file edit stays under 80 lines added (well below the 200-line budget; most of the new logic lives in the new params util). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; the pre-existing `tests/e2e/quiz-jsonld.spec.ts` (ticket 0039) stays green; every other pre-existing spec stays green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- Encoding the FULL quiz answers in the URL (a `?answers=`
  base64 blob, the eight per-question values, the score
  total, the dimensions). The deep-link encodes the TIER
  only; the full quiz result is a derived computation that
  requires the answers (a recipient with the deep-link
  cannot see the same score, the same dimension breakdown,
  or the same AI analysis - only the tier label, icon, and
  description). This is the intentional design: the share
  artifact is the persona, not the full report. A future
  ticket can extend the encoder if telemetry justifies the
  larger payload.
- A PDF or PNG export of the tier card. The share-link URL
  is the canonical share artifact; PNG/PDF generation
  requires a heavy client-side library (html2canvas or
  jsPDF) and is out of the 200-line diff budget. A future
  ticket can wrap the share-link in an OG-image endpoint
  if telemetry justifies it (which would touch /api/ and
  require its own ticket).
- A new JSON-LD `@type` on the deep-link variant. The
  existing Quiz JSON-LD from ticket 0039 stays as shipped;
  the deep-link does not change the structured data.
  Adding a `?tier=`-scoped second JSON-LD block would
  collide with the ticket 0039 spec per the 2026-05-30
  second-@type lesson and is explicitly out of scope.
- Rehydrating the quiz answers from the URL. The deep-link
  shows the shared tier banner; if the recipient wants to
  see their own answers, they take the quiz fresh. The URL
  does NOT pre-fill the question 1-N controls.
- An email-capture form on the shared banner. The four
  capture surfaces already shipped (tickets 0002, 0015,
  0033) plus the existing quiz email capture cover this
  funnel; a fifth would be noise per the ticket 0036
  closure rule.
- Server-side rendering or pre-rendering the shared
  banner. The deep-link is dynamic by query param and
  parse-safe; crawlers see the default (no-banner) state
  which is correct.
- A multi-language tier card. The page is English-only;
  `inLanguage` is omitted by design.
- Persisting the shared `?tier=` param to localStorage on
  the recipient device. The URL is the persistence model;
  shadowing it in localStorage is the same UX trap the
  ticket 0046 Out of Scope already named.
- Cross-promoting the share button on `/roi` or
  `/my` or any other surface. Cross-surface promotion is
  its own follow-up ticket once telemetry shows the
  share button gets clicked.
- Adding `/quiz?tier=...` URLs to `sitemap.xml`. The
  sitemap (ticket 0022) emits canonical app routes
  only; query-string variants are not separate
  canonical URLs by design.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/quizTierShareParams.ts` (under 60
  lines). Mirror the shape of
  `src/pages/roiCalculatorParams.ts` (ticket 0046). Export
  the `Tier` type (re-exported from the quiz page so both
  files share one definition per the 2026-05-25 mirror-
  source rule), `encodeQuizTierParam(tier: Tier): string`
  (returns the tier string verbatim because it is already
  URL-safe), `decodeQuizTierParam(searchParams: URLSearchParams): Tier | null`
  (validates against a frozen `Set<Tier>` and returns
  `null` for any value outside the set). Pure - no React,
  no DOM, no Date.
- `src/pages/AIReadinessQuiz.tsx` - small additive
  edits only (target: under 80 added lines):
  - At the existing `type Tier = ...` line 127, add
    `export` to the type declaration so the new params
    util can `import type { Tier } from './AIReadinessQuiz'`
    without circular dependency (the quiz page does not
    import from the util at module load time; only at
    render time inside the component body).
  - Inside the `ResultsPanel` component (line 352+),
    after the existing tier-hero block (lines 381-430),
    add ONE new "Copy share link" button mirroring the
    ticket 0046 ROI calculator button. The button writes
    `https://digitalcraftai.com/quiz?tier=<encodeQuizTierParam(tier)>`
    to the clipboard with a try/catch fallback to a
    pre-selected `<input>` per the ticket 0046 iOS-
    Safari fallback. Both paths fire
    `trackCTAClick('quiz_share_copy', 'quiz')`.
  - Inside the top-level `AIReadinessQuiz` component
    body (the existing one at the bottom of the file),
    add `const [sharedTier] = useState<Tier | null>(() => decodeQuizTierParam(new URLSearchParams(window.location.search)))`
    just after the existing `useState` declarations. Use
    a lazy initializer so the URL is read once on mount.
  - Add a `useRef<boolean>(false)` guard plus a
    `useEffect` that fires
    `trackCTAClick('quiz_share_open', 'quiz')` exactly
    once per mount when `sharedTier !== null` and the
    guard ref is false; the ref is set to true after
    firing.
  - Render a new `<aside data-testid="quiz-shared-tier-banner">`
    above the existing question 1 stem inside the
    `!isQuizDone` branch, conditioned on
    `sharedTier !== null && step === 0`. The banner
    reads from `TIERS[sharedTier]` for icon / color /
    label / description and carries the calendly CTA
    plus the line "Shared result. Take the quiz
    yourself to see your own tier."
- Per the 2026-05-30 second-@type lesson, the ticket
  does NOT add any new JSON-LD `@type`. The existing
  Quiz JSON-LD from ticket 0039 stays untouched and
  unsited; the new spec does not assert any JSON-LD
  contract. This avoids the second-@type collision
  entirely (no new `@type` means no new collision risk).
  Document this in the Implementation log so the
  decision is auditable.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e spec
  asserts the shared-banner DOM directly via
  `page.locator('[data-testid="quiz-shared-tier-banner"]')`,
  NOT `page.toHaveTitle()`. `/quiz` is in the SEO Pilot
  pages table per the existing ticket 0013 lesson, but
  the deep-link does not change the title; the SEO
  Pilot table is not edited.
- Per the 2026-05-07 em-dash Hard NO, every string in
  the new util, the new banner copy ("Shared result.
  Take the quiz yourself to see your own tier."), and
  the new button label ("Copy share link") uses
  hyphens. Self-Review greps the diff for
  `String.fromCharCode(8212)` before pushing.
- Per the 2026-06-07 src-imports-tests lesson, the
  spec imports the `Tier` type from
  `src/pages/AIReadinessQuiz.tsx` (the exported type)
  through the same `from '../../src/...'` pattern the
  existing `tests/e2e/shareable-estimate-link.spec.ts`
  uses. No new file in `tests/e2e/` other than the
  spec.
- `tests/e2e/quiz-share-link.spec.ts` (new) - one
  assertion per acceptance box. Model the spec on
  `tests/e2e/shareable-estimate-link.spec.ts` (ticket
  0009, the closest peer for "encode/decode URL params,
  copy share-link to clipboard") and on
  `tests/e2e/roi-calculator.spec.ts` (ticket 0046, the
  closest peer for "the share-link clicker AND the
  recipient deep-link are both tested in one spec").
  The clipboard-read assertion requires
  `permissions: ['clipboard-read', 'clipboard-write']`
  in the spec's `test.use({})` block per the existing
  pattern.
- Per the 2026-05-22 two-PR ship lesson, ship will
  need a follow-up `chore/0052-ship-status` PR after
  the feat PR merges to flip the ticket frontmatter
  AND its `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing the
  second PR so the file and index never drift mid-flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, the existing
  Navbar / Footer / Button components, and the
  existing `trackCTAClick` helper. Schema migration:
  no. Privacy/security surface change: no - the tier
  value already lives in the visitor's localStorage via
  ticket 0045's `quizPersonaStore`; the URL is a
  different surface for the same already-disclosed
  value, not a new field. The /trust page disclosure
  list does NOT need an edit because no new persistent
  store is added and the existing quiz persona
  disclosure (added in ticket 0045) already covers
  the tier value.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0052-...` opened
- YYYY-MM-DD - failing test added in `tests/...`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
