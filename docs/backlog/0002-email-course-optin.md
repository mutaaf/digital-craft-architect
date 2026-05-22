---
id: 0002
title: 5-day AI implementation email course opt-in
status: shipped
priority: P1
area: conversion
created: 2026-05-22
owner: gtm-innovation
---

## User story

As a visitor who isn't ready to book a call, I want a low-commitment way to get
useful AI-implementation guidance by email, so that I stay in the funnel and the
business captures a lead it can nurture.

## Why now (four lenses)

### Product Owner
A compact lead magnet captures the "not yet, but interested" segment that the
"book a call" CTA loses today.

### Stakeholder
Builds the owned email channel — a durable acquisition asset independent of ad
spend and SEO.

### Visitor
One field (email), one click, a clear promise: "Get our 5-day AI Implementation
Email Course." No friction.

### Growth
A second opt-in surface multiplies capture without new traffic; email nurture is
the cheapest path from interest to booked call.

## Acceptance criteria

- [x] `EmailCourseOptin` component renders a compact form with email validation.
- [x] Submits to Formspree with subject `[Email Course]`.
- [x] Placed below the hero on `/industries` and in the footer as a second opt-in.
- [x] Success and error states are shown; invalid email is rejected client-side.
- [x] Light + dark mode; no em-dash in copy.

## Out of scope

- Building the actual email sequence (this captures the opt-in only).
- Any backend/API route — Formspree only.

## Engineering notes

- New `src/components/EmailCourseOptin.tsx`; reuse existing Formspree POST pattern (`https://formspree.io/f/xovekqqk` style) and `trackCTAClick`.
- Place in `src/pages/Industries.tsx` + the footer component.
- No `/api/`, no deps.

## Implementation log

### 2026-05-22 — implementation-dev
- Picked up ticket; branched `feat/0002-email-course-optin` off `origin/main`.
- New `src/components/EmailCourseOptin.tsx`: compact one-field opt-in, client-side
  email validation, Formspree POST with `_subject: [Email Course]`, success and
  error states, light + dark variants, reuses `trackCTAClick` and `getUtmParams`.
- Placed below the hero on `/industries` (`src/pages/Industries.tsx`) and added a
  compact `footer` variant as a second opt-in in `src/components/Footer.tsx`.
- Full local gate green (lint, check-links, check-images, check-meta,
  check-blog-dates, check-backlog, build); shipped in PR #31 (`build` +
  `smoke-required` green, squash-merged). Status flipped to shipped.
