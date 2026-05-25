---
id: 0009
title: Shareable branded estimate result link
status: shipped
priority: P1
area: demos
created: 2026-05-23
owner: gtm-innovation
---

## User story

As a contractor who just generated a branded ballpark estimate in the demo, I want
a "Copy share link" button that produces a URL anyone can open to see the same
finished estimate, so that I can send it to my own prospect and that prospect lands
on a Digital Craft demo for the first time.

## Why now (four lenses)

### Product Owner
The smallest meaningful unit of value: the estimate result already exists fully
client-side (`calculateEstimate` returns an `EstimateBreakdown` from a handful of
inputs). Encoding those inputs in the URL and rehydrating on load turns a
throwaway screen into a durable, sendable artifact. Nothing new is computed; the
estimate is just made addressable.

### Stakeholder
This is the single most under-exploited growth lever in the product. Today a
visitor runs a personalized demo and then nothing persists and nothing leaves the
tab. A shareable link is a structured artifact that widens the moat: every estimate
a contractor sends carries Digital Craft branding and a "Book Free Consultation"
CTA to a brand-new viewer, turning one demo run into a referral surface at zero
acquisition cost.

### Visitor (in the real moment of use)
One tap on mobile: "Copy share link" writes the URL to the clipboard and shows a
brief "Copied" confirmation. The recipient opens the link and the estimate renders
immediately from the URL, with no form to re-fill and no network round-trip, so it
works even on a flaky connection.

### Growth
The "show me" moment is the screenshot a contractor sends to a prospect: a clean,
branded estimate card with a real number and a booking button. That is exactly the
artifact a traditional-industry owner forwards to one specific lead, which is how
the demo reaches people who never visited the site.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] On the estimate result view, a "Copy share link" button writes a URL containing the encoded estimate inputs (project type, sqft, finish, selected extras) to the clipboard and shows a transient "Copied" confirmation.
- [ ] Opening that URL with the encoded params present rehydrates the estimate result view directly (skips the multi-step wizard) and renders the same `EstimateBreakdown` totals as the original run.
- [ ] When the URL has no estimate params (or malformed params), the page falls back to the normal step-1 wizard with no error thrown.
- [ ] The encoding is parse-safe: an unknown project-type or out-of-range sqft in the URL falls back to the wizard rather than rendering a broken card.
- [ ] Copy and confirmation work in light and dark mode; no em-dash in any added copy.
- [ ] No new hostnames, no `/api/` call, and no analytics removal; the share link points at the same route on the current origin.

## Out of scope

- Shareable links for other demos (lead-responder, deal analyzer, voice). This
  ticket covers the estimate generator only; the pattern can be reused later.
- Server-side persistence, short-link generation, or a database. The estimate
  state lives entirely in the URL query string.
- OG image generation or per-link social preview cards.
- Persisting the scraped company brand into the link. The shared estimate renders
  with the existing default branding when opened in a session that has no company
  profile; do not attempt to serialize the company profile into the URL here.

## Engineering notes

Files / patterns the dev should touch.

- `src/pages/construction/EstimateGenerator.tsx` - holds the wizard state
  (`selectedTypeId`, `sqft`, `selectedFinishId`, `selectedExtraIds`) and the
  `showEstimate` gate. Read estimate params from the URL on mount (use
  `useSearchParams` from react-router, already a dependency) to pre-populate state
  and jump straight to the result view. Add the "Copy share link" action that
  serializes current state into the query string.
- `src/components/construction/estimate/EstimateCard.tsx` - already has a print
  action and `print:hidden` action row; add the copy-link button alongside the
  existing Print button, matching its `dark:` and `print:hidden` treatment.
- `src/data/estimatePricing.ts` - `calculateEstimate`, `PROJECT_TYPES`,
  `FINISH_LEVELS`, `EXTRAS` are the source of truth used to validate decoded
  params and recompute the breakdown. Validate decoded ids against these lists.
- Keep a small typed encode/decode helper (params <-> wizard state) co-located
  with the page or in a sibling util; cover it with the parse-safe tests.
- `tests/e2e/` - add a spec that generates an estimate, reads the share link, and
  opens it in a fresh context asserting the same totals render.
- New deps: no. Schema migration: no. Privacy/security surface change: no (same
  origin, same route, no new hostnames, no PII serialized).

## Implementation log

- 2026-05-23 (implementation-dev): branch `feat/0009-shareable-estimate-link`.
  Status flipped to in-progress (ticket file + README index together). Plan:
  typed encode/decode helper `estimateShareParams.ts` co-located with the page,
  parse-safe against `PROJECT_TYPES`/`FINISH_LEVELS`/`EXTRAS`; `useSearchParams`
  rehydration in `EstimateGenerator.tsx`; "Copy share link" button in
  `EstimateCard.tsx` with `dark:` + `print:hidden` treatment and a transient
  "Copied" confirmation. Tests-first in `tests/e2e/`, one per acceptance box.
- 2026-05-25 (ship): feat PR #47 squash-merged to main (commit 596218f) with all
  six files landed (`estimateShareParams.ts`, `EstimateCard.tsx`,
  `EstimateGenerator.tsx`, e2e spec). Gating checks `build` + `smoke-required`
  were green at merge. Ship PR `chore/0009-ship-status` flips this ticket
  frontmatter and its README index row `in-progress -> shipped` together;
  `node scripts/check-backlog.mjs` green before push.
