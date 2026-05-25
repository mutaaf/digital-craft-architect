---
id: 0015
title: "Email me this estimate" lead capture on the estimate result
status: in-progress
priority: P2
area: conversion
created: 2026-05-25
owner: gtm-innovation
---

## User story

As a contractor who just generated a ballpark estimate in the demo, I want to
have a copy of it emailed to me, so that I keep the number for later and Digital
Craft gets a way to follow up with me about building the real thing.

## Why now (four lenses)

### Product Owner
The smallest meaningful unit of value: the estimate result already exists fully
client-side and is already addressable as a share link (ticket 0009). Adding a
small "Email me this estimate" field on the result card, which posts the email
plus the share link to the existing Formspree endpoint, converts an anonymous
demo run into a captured, attributable lead with no backend work and no new copy
on the result itself.

### Stakeholder
This is the single clearest acquisition lever left on the estimate demo. Today a
visitor can run the estimate, copy a share link (0009), or even reopen it later
(0014), but the business never learns who they are. A first-party email captured
at the exact moment of demonstrated intent (a finished, personalized estimate) is
a durable asset that feeds follow-up, and it reuses the same Formspree pattern and
UTM enrichment already shipped in the email-course optin, so no new hostname enters
the allow-list.

### Visitor (in the real moment of use)
One field and one tap on mobile, right under the estimate number: type an email,
tap "Email it to me," see a brief "Sent, check your inbox" confirmation. No account,
no multi-field form, no leaving the result. An invalid email shows an inline error
and nothing is sent.

### Growth
The "show me" moment is the visitor getting their own branded estimate in their
inbox seconds after building it, which doubles as a soft re-engagement: the email
carries the share link back to a Digital Craft demo with a booking CTA. That is how
a one-time demo run becomes a named lead the team can actually call.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] On the estimate result view, an "Email me this estimate" field accepts an email and, on submit, posts the email, the estimate share link, and the existing UTM params to the same Formspree endpoint the email-course optin already uses.
- [ ] A valid submission shows a transient success confirmation and clears the field; a network failure shows an inline error and does not clear the field.
- [ ] An invalid email shows an inline validation error and performs no network request (reuse the existing email regex pattern).
- [ ] The submit is attributed via the existing analytics `trackCTAClick` with a result-page location label, and no existing analytics call is removed (regression check).
- [ ] The field, button, and all states render correctly in light and dark mode and contain no em-dash; the control matches the result card's existing styling and is `print:hidden` alongside the existing action row.
- [ ] No new hostnames enter the allow-list (Formspree is already used), no `/api/` call, and no PII beyond the email the visitor typed is sent.

## Out of scope

- Email capture on other demos (lead chat, deal analyzer, voice). This ticket is
  the estimate result only; the pattern can be reused later.
- A new serverless endpoint, CRM integration, or database; reuse the existing
  Formspree submission pattern only.
- Rendering a server-generated PDF or building an email template; the email payload
  is the share link plus the entered email, not a designed document.
- Gating the estimate result behind the email (no paywall); the field is an
  optional add-on under an already-visible result.
- Changing the existing "Copy share link" or Print actions from ticket 0009.

## Engineering notes

Files / patterns the dev should touch.

- `src/components/construction/estimate/EstimateCard.tsx` - the result card with
  the existing `print:hidden` action row (Print + Copy share link from 0009). Add
  the "Email me this estimate" control in or beside that row with matching `dark:`
  and `print:hidden` treatment.
- Model the submit on `src/components/EmailCourseOptin.tsx`: same `EMAIL_RE`
  validation, same `fetch('https://formspree.io/f/xovekqqk', ...)` POST shape,
  same `getUtmParams()` enrichment from `src/utils/utmTracker.ts`, and a distinct
  `_subject` such as "[Estimate] Demo estimate email request". Set the message body
  to include the estimate share link built by the 0009 share helper.
- `src/pages/construction/EstimateGenerator.tsx` - source the current share link
  (the same value the Copy-share-link button uses) to include in the payload.
- `tests/` - add tests for valid submit (success state, correct endpoint/payload
  fields), invalid email (no request, inline error), and network failure (error
  state, field preserved). Mock the fetch.
- New deps: no. Schema migration: no. Privacy/security surface change: no new
  hostname (Formspree already in use); the only data sent is the visitor-entered
  email plus the existing UTM params and the same-origin share link.

## Implementation log

- 2026-05-25 - Picked up on branch `feat/0015-email-me-this-estimate-capture`.
  Flipped status proposed -> in-progress (README index row in sync). Plan: write
  one e2e spec per acceptance box first in
  `tests/e2e/email-me-this-estimate.spec.ts`, mocking the Formspree POST with
  `page.route('https://formspree.io/f/xovekqqk', ...)`, then add an
  `EmailEstimateCapture` control to `EstimateCard.tsx` inside the existing 0009
  `print:hidden` action area. The control reuses the `EmailCourseOptin` pattern
  (same `EMAIL_RE`, same Formspree endpoint, same `getUtmParams()`), posts the
  entered email plus the 0009 share link with a distinct `_subject`, fires
  `trackCTAClick` with a result-page location label, and ships `dark:` variants.
- 2026-05-25 - Implemented. New `EmailEstimateCapture` component (in
  `src/components/construction/estimate/`) reuses the `EmailCourseOptin` submit
  pattern: same `EMAIL_RE`, same `fetch('https://formspree.io/f/xovekqqk', ...)`
  POST, same `getUtmParams()` enrichment, a distinct `_subject` of
  "[Estimate] Demo estimate email request", and the 0009 share link carried in both
  `estimate_link` and the `message` body. Wired into `EstimateCard.tsx` directly
  under the existing 0009 action row, rendered only when `buildShareUrl` is present
  (same gate as Copy-share-link), wrapped in `print:hidden` with full `dark:`
  variants. Invalid email shows an inline error and makes no request; a network
  failure shows an inline error and preserves the field; a success clears the field
  and shows a transient "Sent. Check your inbox." Five e2e specs (one per
  acceptance box) added in `tests/e2e/email-me-this-estimate.spec.ts`, mocking the
  Formspree POST with `page.route`; all green. Full local gate green; no `/api/`,
  no dep, no new hostname change.
