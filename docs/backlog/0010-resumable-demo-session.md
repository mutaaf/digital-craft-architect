---
id: 0010
title: Resumable demo session with "Continue your demo" prompt
status: in-progress
priority: P1
area: demos
created: 2026-05-23
owner: gtm-innovation
---

## User story

As a returning visitor who set up a personalized demo on an earlier visit, I want
the demo hub to recognize my company and offer to pick up where I left off, so that
I do not have to re-enter my website URL and re-run the scrape every time I come
back.

## Why now (four lenses)

### Product Owner
The smallest meaningful unit of value: the demo company profile is already
serialized to storage in `DemoContext`; it is just scoped to `sessionStorage`, so
it evaporates the moment the tab closes. Promoting that persistence to survive
across sessions, plus a single "Continue your [Company] demo" prompt, turns a
one-shot visit into a resumable one with almost no new surface.

### Stakeholder
This deepens retention, the weakest link in the funnel today. A visitor runs a
personalized demo and then nothing persists, so a second visit starts from zero.
Persisting the company profile across sessions is a durable behavioral asset: it
shortens the path back to the "wow" demo on every return and makes the demo hub
feel like a tool the prospect already owns, not a one-time toy.

### Visitor (in the real moment of use)
A traditional-industry owner returns days later on their phone. Instead of an empty
URL field, the hub shows a soft card: "Continue your demo for [Company]" with a
"Resume" button and a "Start fresh" link. One tap and they are back in their
branded demos. Dismissing it is also one tap and it stays dismissed.

### Growth
The "show me" moment is the return visit that feels personal: the prospect's own
company name greeting them by default. That recognition is what moves a lukewarm
second-visit browser toward booking, because the product already knows them and the
next step (book a call) feels like the natural continuation rather than a cold ask.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A demo company profile set in one session is still available after the tab is closed and reopened (persistence survives a new session for the same vertical).
- [ ] When a persisted profile exists for the current vertical, the demo hub shows a "Continue your [Company] demo" prompt with a Resume action and a Start-fresh action.
- [ ] "Resume" keeps the persisted profile active; "Start fresh" clears it (calls the existing `reset`) and shows the normal setup form.
- [ ] When no persisted profile exists, no prompt renders and the hub behaves exactly as it does today (regression check).
- [ ] Dismissing the prompt is remembered so it does not reappear in the same session; the prompt copy contains no em-dash and renders in light and dark mode.
- [ ] No new hostnames, no `/api/` call, and no analytics removal; persistence stays in browser storage only and stores no data not already collected by the scrape.

## Out of scope

- Persisting in-demo conversation transcripts, deal-analysis results, or chat
  history. This ticket persists the company profile and the resume prompt only.
- Cross-vertical resume (a profile set under `construction` should not surface on
  the `realestate` hub); keep the existing per-vertical storage key scoping.
- Any server-side account, login, or sync. Browser storage only.
- A global expiry / TTL policy redesign; a simple stored timestamp the prompt can
  read is fine, but do not build a generic cache-eviction layer here.

## Engineering notes

Files / patterns the dev should touch.

- `src/contexts/DemoContext.tsx` - `loadFromSession` / `saveToSession` /
  `sessionKey` currently use `sessionStorage` with key `dca_demo_company_${vertical}`.
  Promote the persistence to `localStorage` (keeping the per-vertical key scoping)
  so the profile survives across sessions; keep the same `reset` semantics for
  Start-fresh. Guard all storage access in try/catch as the existing code does.
- The demo hub components are the place to render the prompt:
  `src/pages/construction/DemoHub.tsx` and the sibling hubs (e.g.
  `src/pages/realestate/RealEstateDemoHub.tsx`). Read `isCustomized` / `company`
  from `useDemoContext()` to decide whether to show "Continue your [Company] demo".
  Prefer a single small reusable prompt component over duplicating markup per hub.
- Use a session-scoped dismissal key (follow the existing dismissal convention,
  e.g. `dca_*_dismissed`) so a dismissed prompt does not reappear that session.
- `tests/e2e/` - add a spec that sets a profile, reloads in a fresh session, and
  asserts the resume prompt renders with the company name, plus a regression spec
  that asserts no prompt when storage is empty.
- New deps: no. Schema migration: no (storage key shape unchanged, only the
  backing store moves from session to local). Privacy/security surface change: no
  (same data the scrape already stores, browser-only, no new hostnames).

## Implementation log

- 2026-05-25 (implementation-dev): Picked up. Branch `feat/0010-resumable-demo-session`.
  Promoting `DemoContext` persistence from `sessionStorage` to `localStorage`
  (same per-vertical key, same reset semantics, same try/catch guards). Adding a
  reusable `ResumeDemoPrompt` component rendered on the construction and real
  estate demo hubs, with a session-scoped dismissal key. e2e specs in
  `tests/e2e/resumable-demo-session.spec.ts` written first against the acceptance
  criteria.
