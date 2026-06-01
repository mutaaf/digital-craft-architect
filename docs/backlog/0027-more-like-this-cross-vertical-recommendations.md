---
id: 0027
title: "More like this" cross-vertical recommendations under each demo
status: in-progress
priority: P1
area: demos
created: 2026-06-01
owner: gtm-innovation
---

## User story

As a visitor who just finished a single AI demo (say the construction
Lead Responder) and is sitting on the result screen wondering "what
else can this thing do for me," I want a small "More like this" strip
that names two or three sibling demos I am most likely to want next
(the same tool in a different vertical I also work in, plus the next
logical demo in my own vertical), so that I can keep trying tools in
one tap instead of bouncing back to `/demos` and re-scrolling 12
verticals.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: ticket 0026 shipped the
`dca_recent_demos_v1` localStorage store and the catalog of
`KNOWN_PATHS` in `src/utils/recentDemosStore.ts` lines 35 to 91. That
store already knows which demos a visitor has touched and which
vertical each demo belongs to. Adding ONE pure-function recommender
on top of it (`getRelatedDemos(currentPath: string, limit: number):
RelatedDemo[]`) plus a thin `<RelatedDemos />` component rendered at
the bottom of each demo page turns the existing data into a
navigation surface. No new store, no new tracking, no API change, no
DEMO_GROUPS edit.

### Stakeholder

This deepens the retention moat in the dimension a single-purpose
competitor cannot copy: the multi-vertical catalog only earns its
breadth when one demo leads naturally to the next. A visitor who
tries Lead Responder for construction and discovers in one tap that
the same tool exists for home services has just doubled their
session depth and revealed an adjacent buyer profile to themselves
(many small-shop owners run more than one trade). The recommender is
a deterministic function over `DEMO_GROUPS` plus recent-visits, so it
is fully testable, has no cold-start failure mode, and degrades
gracefully (with zero history it still surfaces useful siblings by
tool-name match). It also leaves a clean seam for a future
GPT-powered "next best demo" ticket without commiting to one now.

### Visitor (in the real moment of use)

A roofing contractor on a phone finishes the home-services Estimate
demo. Below the result they see a heading "More like this" and three
cards: "Estimate Generator (Construction)," "Estimate Generator (Auto
Repair)," and "Voice Follow-Up (Home Services)." Each card is one
tap, opens in the same tab, and is pre-recorded into
`dca_recent_demos_v1` so the recap strip on `/demos` from ticket 0026
also reflects the visit. On a brand-new visitor with no history, the
strip still renders the two same-name siblings plus the next demo in
the current vertical, never an empty state.

### Growth

The "show me" moment is the screenshot a salesperson can paste into a
follow-up email: a demo result page with a clean "More like this"
strip showing the same tool also running for the prospect's
secondary vertical. That implicit "we cover your whole business"
signal is the single artifact that turns a one-vertical demo into a
multi-vertical evaluation. The strip also fires a distinct
`trackCTAClick('related_demo', '<currentPath>')` event so the
cross-vertical jump rate is measurable in GA independently of
`recent_demo` and `open_demo`.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new pure-function recommender at `src/utils/relatedDemos.ts` (new file) exports `getRelatedDemos(currentPath: string, limit?: number): RelatedDemo[]` and `RelatedDemo = { path: string; title: string; vertical: string; reason: 'same-tool' | 'same-vertical' }`. The function reads from a small `DEMO_CATALOG` constant (path, title, vertical) that mirrors `KNOWN_PATHS` in `src/utils/recentDemosStore.ts` 1:1, returns at most `limit` (default 3) entries, never includes `currentPath`, never includes an unknown `currentPath` (returns `[]`), and is deterministic (same input always yields same output, no `Date.now()`, no `Math.random()`).
- [ ] Ranking is: (1) any demo whose title matches the current demo's title in a DIFFERENT vertical (same-tool siblings, e.g. both titles equal "AI Lead Responder"), (2) any demo in the SAME vertical the visitor has not yet visited per `getRecentDemos()`, (3) any demo in the same vertical (fallback when history is empty). Ties broken by `DEMO_CATALOG` order so the output is stable across renders.
- [ ] A new `<RelatedDemos currentPath={...} />` component at `src/components/RelatedDemos.tsx` (new file, under 80 lines) renders a `data-testid="related-demos"` section with the heading "More like this" (no em-dash, no exclamation), a responsive `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` of related-demo cards (title, vertical in muted text, "Try it" arrow link), and a small muted caption per card describing the reason ("Same tool for [Vertical]" or "Next in [Vertical]"). When `getRelatedDemos()` returns an empty array, the component returns `null` and renders no chrome.
- [ ] Each card link records the visit via `recordDemoVisit(path, title, vertical)` AND fires `trackCTAClick('related_demo', currentPath)` in the same onClick (mirroring the dual side-effect pattern already in `src/pages/Demos.tsx` lines 263 to 266 per ticket 0026). The card navigates SPA-internally to the stored `path` (no full reload), asserted with the SPA-marker pattern in `tests/e2e/demo-breadcrumbs.spec.ts`.
- [ ] The component is mounted at the BOTTOM of every per-vertical demo page (construction, real estate, events, home services, healthcare, legal, restaurant, kids play, fitness, dental, salon, auto repair). To keep the diff under 200 lines, mount it ONCE in a shared layout or wrapper if one exists, otherwise add a single import + one-line JSX at the bottom of EACH demo page above the existing `<Footer />`. The implementer chooses the cheaper path and explains the choice in the Implementation log. The acceptance e2e spec verifies the section is present on at least 3 representative demo routes (construction lead-responder, home services estimate, real estate voice-negotiator).
- [ ] The strip renders in light AND dark mode on a 375px mobile viewport, contains no em-dash character in any rendered text, every recommended path is in `KNOWN_PATHS` (the recommender filters by `KNOWN_PATHS` at module load so a stale entry cannot strand a dead link), and `node scripts/check-backlog.mjs` plus `npm run check-links` stay green.
- [ ] No new hostnames, no `/api/` change, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the existing `dca_recent_demos_v1` schema (this ticket reads from it, does not extend it). No new JSON-LD block is emitted by this ticket (the recap is a personalization surface, not a crawlable list, same posture as ticket 0026's recap strip).

## Out of scope

- A GPT-powered "next best demo" ranker. The deterministic
  same-tool / same-vertical heuristic is enough to ship a useful
  strip; an AI recommender is a follow-up if this one earns its
  clicks.
- Mounting the recommendation strip on the `/demos` hub itself. The
  hub already has the ticket 0026 recap strip and the full catalog;
  adding a third surface there is noise.
- Cross-tool recommendations (e.g. "you tried Lead Responder, also
  try Voice Negotiator"). Ranking by tool affinity requires either
  a hand-maintained tool-similarity table or an AI signal; both
  belong in a future ticket. This one ships only same-tool /
  same-vertical / not-yet-visited.
- A "clear history" UI surface anywhere. `clearRecentDemos()`
  already exists per ticket 0026 and stays unbound to UI.
- Editing `DEMO_GROUPS` in `src/pages/Demos.tsx` or moving it out to
  a shared module. The recommender's `DEMO_CATALOG` may duplicate
  the path/title/vertical triplet rather than refactor the catalog;
  see the engineering notes on which path keeps the diff small.
- Documenting the recommender on `/trust`. Reads no new data,
  writes no new key, makes no new external call; the existing
  `dca_*` disclosure already covers it (per the 2026-05-30 ticket
  0026 posture).
- A new schema.org `ItemList` block for the related demos. The
  existing `ItemList` on `/demos` (ticket 0011) is the crawlable
  catalog; the related strip is a personalization surface.
- Editing any demo page's hero, copy, or existing functionality. The
  recommendation strip is appended below the existing content; no
  surface above it changes.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/utils/relatedDemos.ts` (under 100 lines). Export the
  `RelatedDemo` type and `getRelatedDemos(currentPath, limit = 3)`
  pure function. Per the 2026-05-25 mirror-source lesson, the
  in-file `DEMO_CATALOG` constant MUST be derived once and validated
  against `KNOWN_PATHS` from `src/utils/recentDemosStore.ts` at module
  load (throw a clear dev-time error if any catalog entry is not in
  `KNOWN_PATHS` and vice versa, so a future `DEMO_GROUPS` edit that
  forgets the catalog blows up locally in `npm run dev` instead of
  silently misranking). Two acceptable shapes for the catalog: (a) a
  literal array in this file mirroring `DEMO_GROUPS` from
  `src/pages/Demos.tsx` (cheaper, duplicates 40 lines of catalog
  data, validated by the assertion above), or (b) extract
  `DEMO_GROUPS` to a new `src/data/demoCatalog.ts` module that both
  `Demos.tsx` and `relatedDemos.ts` import (cleaner, costs one extra
  file edit). Pick (a) unless the assertion proves too brittle.
- New `src/components/RelatedDemos.tsx` (under 80 lines). Props:
  `{ currentPath: string }`. Implementation: call `getRelatedDemos`
  inside the component body (snapshot once per mount; no
  `useEffect`, no `useState`), short-circuit to `null` when empty,
  render the heading + grid. Each card is a react-router `Link`
  whose `onClick` calls BOTH `recordDemoVisit` AND `trackCTAClick`,
  exactly mirroring the dual side-effect pattern on
  `src/pages/Demos.tsx` lines 263 to 266 from ticket 0026. Apply
  `dark:` Tailwind variants everywhere (per the AGENTS.md Hard NO);
  reuse the card class string from `src/pages/Demos.tsx` line 226 so
  the recap strip and the related strip look identical.
- Mount the component at the BOTTOM of each per-vertical demo page.
  Grep `src/pages/*/` for the demo files (e.g.
  `src/pages/construction/LeadResponder.tsx`,
  `src/pages/homeservices/Estimate.tsx`, etc.). If a shared layout
  component already wraps every demo page (look for `DemoLayout`
  or equivalent in `src/components/`), mount the strip there ONCE
  and the diff is ~20 lines. If no shared layout exists, mount it
  individually with `<RelatedDemos currentPath={location.pathname} />`
  using `useLocation()` from react-router so the path is never
  hardcoded; one import + one JSX line per demo file. Whichever
  path you pick, document the choice in the Implementation log.
- The 2026-05-30 "second @type instance" lesson is not directly
  triggered here (this ticket emits no JSON-LD), but if the
  implementer decides to add a `SiteNavigationElement` or related
  schema for the strip, they MUST first grep
  `tests/e2e/*-jsonld.spec.ts` for `=== '<Type>'` predicates on the
  same `@type` and widen any "exactly one" assertion in the same
  PR. Default posture for this ticket: no new JSON-LD.
- Per the 2026-05-07 em-dash Hard NO, write the strip heading and
  every reason caption with hyphens. Self-Review must grep the
  diff for the em-dash character before pushing.
- `tests/e2e/related-demos.spec.ts` (new) - one spec per
  acceptance box. Empty-history case: navigate to
  `/construction/demo/lead-responder`, assert the strip renders
  with at least the same-tool siblings (Lead Responder in real
  estate, home services). With-history case: pre-seed
  `localStorage.setItem('dca_recent_demos_v1', JSON.stringify([...]))`
  via `addInitScript` so the visitor has already visited
  `/construction/demo/estimate`, navigate to
  `/construction/demo/lead-responder`, assert the same-vertical
  fallback skips Estimate (already visited) and picks a different
  unvisited construction demo. SPA-navigation case: click a card
  and assert URL changes without a full reload (mirror
  `tests/e2e/demo-breadcrumbs.spec.ts`). Dark-mode case: apply
  `document.documentElement.classList.add('dark')` and assert the
  strip renders. Unknown-path case: navigate to a hypothetical
  unknown demo path and assert the component renders nothing.
  Cross-route mount case: assert the strip is present on each of
  3 representative demo routes (construction/lead-responder,
  homeservices/estimate, realestate/voice-negotiator).
- Per the 2026-05-22 two-PR ship lesson, ship will need a follow-up
  `chore/0027-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter AND its `docs/backlog/README.md` index row to
  `shipped` together; run `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index never drift mid-flip.
- New deps: no. Schema migration: no (reads `dca_recent_demos_v1`
  as-is; writes go through the existing `recordDemoVisit` API, no
  new key). Privacy/security surface change: no - the recommender
  reads only public catalog metadata and already-recorded visits.
  Per the AGENTS.md Hard NO, this ticket does not touch `/api/`,
  `.env*`, `package.json`, or `package-lock.json`.

## Implementation log

### 2026-06-01 - implementation-dev kickoff

- Branched `feat/0027-related-demos` off `origin/main` and flipped this
  ticket's frontmatter to `in-progress` as the first commit.
- Mount choice: there is no shared `DemoLayout` wrapping demo pages
  (verified by reading `src/App.tsx`; every demo route renders its
  vertical-specific component directly). The 13 demo component files
  (LeadResponder, EstimateGenerator, InvoiceGenerator, SMSSequence,
  LeadScoring, ReviewSystem, PropertyNegotiator, VoiceNegotiator,
  ContractDrafter, MarketAnalyzer, InquiryQualifier, ProposalGenerator,
  VoiceBookingAgent) are reused across all 47 demo routes by
  composition in `App.tsx`, so mounting `<RelatedDemos
  currentPath={location.pathname} />` once per shared demo file (with
  `useLocation()`) covers every per-vertical demo page with one import
  + one JSX line per file. None of these files render a `<Footer />`
  today (the demo pages have no footer), so the strip mounts at the
  bottom of the component's outermost wrapper.
- Catalog shape: option (a) from the engineering notes - a literal
  `DEMO_CATALOG` array inside `src/utils/relatedDemos.ts` mirroring
  `DEMO_GROUPS` from `src/pages/Demos.tsx`, with a module-load
  assertion validating it against `KNOWN_PATHS` from
  `src/utils/recentDemosStore.ts` in both directions. The duplication
  is bounded (47 lines) and the assertion makes drift loud.
