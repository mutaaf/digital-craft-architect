---
id: 0031
title: "Try the next demo" pinned CTA on voice and estimate result screens
status: in-progress
priority: P1
area: demos
created: 2026-06-03
owner: gtm-innovation
---

## User story

As a visitor who just watched the AI voice negotiator finish a real
phone call (or who just hit "Generate" on the construction estimate)
and is sitting on the result screen with the strongest possible
"this thing actually works" reaction, I want a single prominent
"Try the next demo" card pinned ABOVE the existing "More like this"
strip from ticket 0027 that names ONE high-converting sibling demo
with a one-tap continue, so that I do not have to decide which of
three related cards to open or scroll back to `/demos` to keep going.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: ticket 0027 shipped the
`getRelatedDemos(currentPath, limit)` pure function in
`src/utils/relatedDemos.ts` and the `<RelatedDemos />` grid that
renders up to three related demos below every per-vertical demo
page. That recommender ALREADY ranks same-tool siblings first and
same-vertical unvisited demos second. What it does NOT do is pin
the top recommendation at the visual peak of attention (the result
screen, not the page footer) and frame it as ONE choice instead of
three. A thin `<NextDemoCTA />` wrapper that calls
`getRelatedDemos(currentPath, 1)` and renders one larger card with
a clear "Try [Demo Title] next" headline is under 60 lines of new
component code and zero new ranking logic. The result is a single
high-contrast choice at the moment a visitor is most likely to
say yes to one more tap.

### Stakeholder

This deepens the retention moat in the dimension the existing
`<RelatedDemos />` strip does not: visual hierarchy at the moment
of peak intent. A three-card strip below the fold competes with
itself; one pinned card above the fold of the result screen converts
the "I would try one more" reaction into a click. The same recommender
powers both surfaces, so the "More like this" strip stays unchanged
below as the secondary surface. This is the same lever ticket 0026
proved for the catalog hub (one recap strip at the top instead of
asking visitors to scroll); applied at the result screen it
compounds across every completed demo, not just returning visits to
`/demos`. The CTA is also a clean seam for a future per-demo
conversion experiment without committing to a ranking change today.

### Visitor (in the real moment of use)

A roofing contractor on a phone finishes the home-services Estimate
demo. The estimate-result card scrolls into view. Above the standard
result actions but below the headline number, ONE big card reads
"Try Voice Follow-Up for Home Services next" with a single arrow
button. One tap, no scroll, the next demo opens in the same tab.
On the voice-negotiator result, the same pattern: ONE big card
above the existing "Copy share link" row reads "Try the AI Lead
Responder for Real Estate next" (same tool family, different
vertical) so the contractor sees the cross-vertical sweep
immediately. On a brand-new visitor with no recent-demos history,
the recommender still returns a stable same-vertical pick (per the
ticket 0027 fallback), never an empty state, never an error.

### Growth

The "show me" moment is the screenshot a salesperson can paste into
a follow-up email: a real estate investor's voice-negotiator result
screen with the agreed price at the top AND a single "Try the AI
Lead Responder for Real Estate next" card right below it. The
implicit "the journey keeps going" signal is a single, clean
artifact. Each card click fires
`trackCTAClick('try_next_demo', currentPath)` so the cold-CTA-click
rate is measurable in GA independently of the secondary "More like
this" strip's `related_demo` event, which lets us see whether
pinning the top recommendation actually beats the three-card grid
on first-tap conversion.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new component at `src/components/NextDemoCTA.tsx` (new file, under 80 lines) exports `NextDemoCTA` with the prop shape `{ currentPath: string; surface: 'voice_result' | 'estimate_result' }`. The component calls `getRelatedDemos(currentPath, 1)` from `src/utils/relatedDemos.ts` (ticket 0027's pure function, no re-implementation), short-circuits to `null` when the array is empty, and otherwise renders ONE prominent card with a `data-testid="next-demo-cta"` attribute, a heading reading exactly `Try ${title} for ${vertical} next` (no em-dash, no exclamation), the recommender's reason caption in muted text, and one primary button labeled `Try it now` with a right-arrow icon.
- [ ] The button is a react-router `Link` to the recommended demo's `path`. Its `onClick` fires BOTH `recordDemoVisit(path, title, vertical)` (mirroring the dual side-effect pattern from ticket 0027's `<RelatedDemos />` component) AND `trackCTAClick('try_next_demo', currentPath)`. The component snapshots `getRelatedDemos` once per mount (no `useEffect`, no `useState`); a fresh mount on the next demo page rebuilds the snapshot.
- [ ] On `src/components/construction/negotiator/VoiceCallSummary.tsx`, the `<NextDemoCTA currentPath={location.pathname} surface="voice_result" />` mount appears DIRECTLY below the agreed-price summary heading and ABOVE the existing "Copy share link" row (from ticket 0029). The mount is wrapped in a `useLocation()` hook so the path is never hardcoded; the existing `<RelatedDemos />` strip from ticket 0027 stays at the bottom of the page unchanged.
- [ ] On `src/components/construction/estimate/EstimateCard.tsx` (or the closest existing estimate-result component - grep `src/pages/construction/Estimate*.tsx` for the result-screen mount point), the `<NextDemoCTA currentPath={location.pathname} surface="estimate_result" />` mount appears DIRECTLY below the estimate total and ABOVE the existing "Email me this estimate" capture row (from ticket 0015). The existing `<RelatedDemos />` strip stays at the bottom of the page unchanged.
- [ ] When `getRelatedDemos(currentPath, 1)` returns an empty array (e.g. the recommender's `KNOWN_PATHS` allow-list does not include the current path), the `<NextDemoCTA />` returns `null` and renders no chrome. The result-screen layout is byte-identical to today in this case (regression case in the spec).
- [ ] The pinned CTA renders in light AND dark mode on a 375px mobile viewport, contains no em-dash character in any rendered text, and the SPA-marker pattern from `tests/e2e/demo-breadcrumbs.spec.ts` confirms the click navigates SPA-internally (no full reload). A new e2e spec at `tests/e2e/next-demo-cta.spec.ts` asserts the CTA is present on at least 2 representative result-screen routes (one voice-negotiator route, one estimate route).
- [ ] No new hostnames, no `/api/` change, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `getRelatedDemos`, `DEMO_CATALOG`, or the existing `<RelatedDemos />` component. `node scripts/check-backlog.mjs` and `npm run check-links` stay green; `npm run typecheck` stays clean.

## Out of scope

- Editing the existing `<RelatedDemos />` component from ticket 0027.
  The pinned CTA reuses `getRelatedDemos()` but renders its own
  card; the three-card strip stays at the bottom of every demo page
  exactly as it is today.
- Mounting the pinned CTA on demo pages other than the voice-call
  result and the estimate result. The hypothesis under test is
  "high-contrast single CTA at the visual peak of intent"; expanding
  to every demo's result screen dilutes the signal. If this ticket
  earns its clicks, a follow-up can extend to lead-responder,
  property-negotiator, and reviews result screens.
- A GPT-powered "next best demo" ranker (already out of scope per
  ticket 0027). The deterministic `getRelatedDemos(currentPath, 1)`
  is enough.
- A "Skip" or "Dismiss" control on the pinned CTA. Visitors can
  scroll past it; adding chrome to dismiss it is noise on a 60-line
  card.
- Personalizing the CTA copy by UTM, scraped vertical, or
  `DemoContext` company profile. The recommender already encodes
  the right cross-vertical bias by ranking same-tool siblings first.
- Editing any per-vertical demo page's hero, copy, or above-the-fold
  layout. The CTA mounts on the RESULT screen of two specific demos,
  not the entry screen.
- Adding a new schema.org block (`Recommendation`, `Action`, etc.)
  for the CTA. The pinned card is a personalization surface, not a
  crawlable list, same posture as ticket 0026 and 0027.
- Documenting the new component on `/trust`. The component reads no
  new data, writes no new storage key, and makes no new external
  call; the existing `dca_*` disclosure already covers
  `recordDemoVisit`.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/components/NextDemoCTA.tsx` (under 80 lines). Props:
  `{ currentPath: string; surface: 'voice_result' | 'estimate_result' }`.
  Implementation pattern mirrors `src/components/RelatedDemos.tsx`
  (ticket 0027) but renders ONE card instead of a grid. Read
  `getRelatedDemos(currentPath, 1)` inside the component body
  (snapshot once per mount; no `useEffect`, no `useState`), short-
  circuit to `null` on empty, otherwise render the prominent card.
  Apply `dark:` Tailwind variants on every new class per the
  AGENTS.md Hard NO. The card class string should reuse the same
  base tokens as `src/pages/Demos.tsx` line 226 so the surfaces
  stay visually consistent. The card is intentionally LARGER than
  a `<RelatedDemos />` grid card (full-width on mobile, larger
  heading text, primary-color border) so it reads as the top
  recommendation.
- `src/components/construction/negotiator/VoiceCallSummary.tsx` -
  add one import and one JSX mount right after the agreed-price
  summary heading and before the "Copy share link" row from ticket
  0029. Use `useLocation()` from react-router (already imported in
  several sibling files; grep for the import shape) to source
  `currentPath`. The mount conditionally renders inside the same
  `isSharedView` guard so the pinned CTA appears on freshly-finished
  calls but NOT on cold-opened shared-summary URLs (the shared
  visitor already has a `Book Free Consultation` CTA from ticket
  0029; adding a third surface is noise).
- Estimate-result mount: grep `src/components/construction/estimate/`
  for the result-render component that already mounts the ticket
  0015 `<EmailEstimateCapture />` and the ticket 0009 share-link
  button. Mount `<NextDemoCTA />` directly above the email capture
  row. If the result-render lives in a page file rather than a
  component, mount it there with the same pattern.
- The 2026-05-25 mirror-source lesson is the load-bearing rule
  here: `getRelatedDemos`, `KNOWN_PATHS`, and `DEMO_CATALOG` are
  the SINGLE source of truth for cross-vertical recommendations.
  The new CTA MUST NOT re-implement the ranking, re-list the
  catalog, or hardcode any recommended path. If the implementer
  notices a future demo route exists but is missing from
  `DEMO_CATALOG` (the recommender returns nothing for it), the
  fix is in `src/utils/relatedDemos.ts`, not in this component.
- The 2026-05-30 "second @type instance" lesson does NOT bite here
  (this ticket emits no JSON-LD). Confirm by greying
  `tests/e2e/*-jsonld.spec.ts` for any predicate over the two
  modified component files; the default posture for this ticket is
  no new structured data.
- The 2026-05-25 SEO Pilot lesson does NOT bite here either (no
  `document.title` change). Standard react-helmet-async head
  management remains as-is in the parent demo pages.
- Per the 2026-05-07 em-dash Hard NO, the CTA heading copy
  (`Try ${title} for ${vertical} next`) and the button label
  (`Try it now`) MUST use hyphens or restructured punctuation, not
  the em-dash character. Self-Review greps the diff for the
  em-dash character before pushing.
- `tests/e2e/next-demo-cta.spec.ts` (new) - one spec per
  acceptance box. Mount-presence case: navigate to a finished
  voice-negotiator result (use the same sessionStorage pre-seed
  pattern from `tests/e2e/voice-summary-share-link.spec.ts`,
  ticket 0029, to fast-path to the summary view), assert the
  pinned CTA renders. Mount-presence case 2: navigate to a
  finished estimate result (mirror the pre-seed pattern in the
  ticket 0009 estimate-share spec), assert the pinned CTA
  renders above the email-capture row. SPA-navigation case: click
  the CTA, assert URL changes without a full reload AND
  `recordDemoVisit` writes to localStorage. Empty-recommender
  case: simulate the empty-array return (either by navigating to
  a non-KNOWN_PATHS path or by mocking the recommender via a
  `addInitScript` that overrides `window.localStorage` for the
  test session), assert no CTA chrome renders. Dark-mode case:
  apply `document.documentElement.classList.add('dark')`, assert
  the CTA renders. Analytics case: assert
  `trackCTAClick('try_next_demo', currentPath)` fires exactly
  once on click by listening on the same `window` event the
  existing ticket 0027 spec listens on.
- The component snapshots its recommendation at MOUNT time, not
  at render time. React 18 strict-mode double-mount risks
  double-firing `trackCTAClick` if the analytics call is inside a
  `useEffect`; guard it with the same `useRef` pattern documented
  in `src/pages/construction/VoiceNegotiator.tsx` per ticket 0029's
  cold-open analytics-once guard.
- Per the 2026-05-22 two-PR ship lesson, ship will need a follow-up
  `chore/0031-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter AND its `docs/backlog/README.md` index row to
  `shipped` together; run `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index never drift mid-flip.
- New deps: no. Schema migration: no (reads `dca_recent_demos_v1`
  via `recordDemoVisit` as-is; no new storage key). Privacy/security
  surface change: no - the CTA reads only public catalog metadata
  via `getRelatedDemos()` and writes through the existing
  `recordDemoVisit` API. Per the AGENTS.md Hard NO, this ticket
  does not touch `/api/`, `.env*`, `package.json`, or
  `package-lock.json`.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-06-03 - branch `feat/0031-try-next-demo-pinned-cta` opened
- 2026-06-03 - failing test added in `tests/e2e/next-demo-cta.spec.ts` (8 boxes)
- 2026-06-03 - NextDemoCTA component (62 lines) mounted on EstimateCard and VoiceCallSummary; all 8 boxes pass locally
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
