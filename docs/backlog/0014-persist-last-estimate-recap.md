---
id: 0014
title: Persist and re-offer the visitor's last completed estimate
status: in-progress
priority: P2
area: demos
created: 2026-05-25
owner: gtm-innovation
---

## User story

As a contractor who built a ballpark estimate in the demo on an earlier visit, I
want the estimate tool to remember my last finished estimate and offer to reopen
it, so that I can show it to my partner or revisit the number without rebuilding
it from the project-type step.

## Why now (four lenses)

### Product Owner
The smallest meaningful unit of value: a finished estimate is already a small,
serializable bundle of inputs (`selectedTypeId`, `sqft`, `selectedFinishId`,
`selectedExtraIds`) that the share-link helper from ticket 0009 already encodes.
Writing that same bundle to `localStorage` when an estimate completes, and showing
a one-line "Reopen your last estimate" card on the step-1 screen when one exists,
turns a throwaway result into a durable one the visitor can return to. No new
computation; the result is just made persistent.

### Stakeholder
This deepens retention at the demo level, going beyond ticket 0010 (which resumes
the scraped company profile) and ticket 0009 (which encodes one estimate into a
shareable URL). Persisting the visitor's own last completed result locally means a
return visit reopens a concrete artifact with a real number on it, not an empty
wizard. A demo the prospect can pick back up is one they treat as a tool they own,
which shortens the path back to the booking CTA on the result screen.

### Visitor (in the real moment of use)
A returning owner opens the estimate tool on their phone and, instead of an empty
project-type grid, sees a soft card: "Reopen your last estimate" with the project
type and rough total, plus a "Start a new estimate" link. One tap reopens the
finished result; one tap dismisses it. It works offline since the data is local.

### Growth
The "show me" moment is reopening a real, branded estimate instantly on a second
visit, which is exactly the screen a contractor would screenshot to a partner with
"this is the tool I was telling you about." That recognition on return is what
moves a lukewarm second visit toward the "Book Free Consultation" CTA already on
the result card.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] When a visitor reaches the estimate result view, the completed estimate inputs are written to `localStorage` under a versioned, vertical-scoped key.
- [ ] On a later visit (fresh session) with a stored estimate, the step-1 screen shows a "Reopen your last estimate" card naming the project type and ballpark total, with a Reopen action and a Start-new action.
- [ ] "Reopen" rehydrates straight to the result view with the same `EstimateBreakdown` totals; "Start new" clears the stored estimate and shows the normal step-1 wizard.
- [ ] When no stored estimate exists, no card renders and the wizard behaves exactly as it does today (regression check).
- [ ] A stored estimate whose ids no longer exist in `PROJECT_TYPES`/`FINISH_LEVELS`/`EXTRAS` is treated as absent (parse-safe), and dismissing the card is remembered for the session; the card contains no em-dash and renders in light and dark mode.
- [ ] No new hostnames, no `/api/` call, no analytics removal; persistence is browser-local only and stores no data beyond the estimate inputs the visitor already entered.

## Out of scope

- Persisting more than one estimate or building an estimate history list; store
  only the single most recent completed estimate per vertical.
- Persisting other demo results (lead chat, deal analyzer, voice). This ticket is
  the estimate tool only; the local-store pattern can be reused later.
- Capturing an email or any contact detail to unlock the recap; that is a separate
  conversion ticket (0015).
- Server-side persistence, accounts, or cross-device sync. Browser storage only.
- Re-implementing the share-link encoding; reuse the existing 0009 helper for the
  input shape rather than inventing a second serializer.

## Engineering notes

Files / patterns the dev should touch.

- `src/pages/construction/EstimateGenerator.tsx` - holds the wizard state and the
  `showEstimate`/result gate. On entering the result view, persist the current
  inputs to `localStorage`; on mount at step 1 (and with no share params present),
  read the stored estimate and conditionally render the recap card. Guard all
  storage access in try/catch as `DemoContext` does.
- Reuse the typed encode/decode helper shipped with ticket 0009 (the
  `estimateShareParams.ts` sibling util) for the `{ selectedTypeId, sqft,
  selectedFinishId, selectedExtraIds }` shape and its parse-safe validation against
  `src/data/estimatePricing.ts` (`PROJECT_TYPES`, `FINISH_LEVELS`, `EXTRAS`,
  `calculateEstimate`). Do not duplicate that serializer.
- Use a versioned, vertical-scoped key (the generator is reused across verticals
  via the route table, so scope the key like `dca_last_estimate_v1_${vertical}`) and
  a session-scoped dismissal flag following the existing `dca_*_dismissed` convention.
- Prefer a small reusable recap-card component over inline markup so it can be
  reused if other verticals adopt it.
- `tests/e2e/` - add a spec that completes an estimate, reloads in a fresh session,
  asserts the recap card shows the project type and total, reopens it to the same
  totals, plus a regression spec asserting no card when storage is empty.
- New deps: no. Schema migration: no (new local key is additive and versioned).
  Privacy/security surface change: no (browser-local, no new hostnames, no PII; same
  inputs the visitor already typed into the wizard).

## Implementation log

- 2026-05-25 - Picked up on branch `feat/0014-persist-last-estimate-recap`. Flipped
  status proposed -> in-progress (README index row in sync). Plan: write one e2e
  spec per acceptance box in `tests/e2e/last-estimate-recap.spec.ts` first, then a
  reusable `LastEstimateRecapCard` component plus a `lastEstimateStore.ts` util that
  reuses the 0009 `EstimateShareState` shape and `decodeEstimateParams`-style
  parse-safe validation, wired into `EstimateGenerator.tsx` (persist on result view,
  read on step 1).
- 2026-05-25 - Implemented. `lastEstimateStore.ts` persists/reads the single most
  recent estimate per vertical under `dca_last_estimate_v1_${vertical}`, delegating
  all validation to the 0009 encode/decode helper (no second serializer); a stale or
  malformed bundle decodes to null and is treated as absent. `LastEstimateRecapCard`
  (dark: variants, no em-dash) names the project type and ballpark range via the
  shared `calculateEstimate`, with Reopen / Start-a-new-estimate / dismiss actions.
  `EstimateGenerator` saves on entering the result view, renders the card on step 1
  when no share link is present, and uses a session-scoped
  `dca_last_estimate_dismissed_${vertical}` flag. Also repaired three pre-existing
  em-dashes in this file's intro/extras copy (punctuation repair, per the 2026-05-25
  lesson). Full local gate green; all 7 new e2e specs pass; full e2e suite green
  except a known-flaky 0012 pricing-FAQ accordion test (retries:1 in CI absorbs it).
