---
id: 0001
title: UTM-personalized hero copy
status: groomed
priority: P1
area: conversion
created: 2026-05-22
owner: gtm-innovation
---

## User story

As a prospect who clicked a vertical-specific ad, I want the homepage hero to
speak to my industry immediately, so that I feel the demo is built for me and keep
scrolling instead of bouncing.

## Why now (four lenses)

### Product Owner
Smallest unit of conversion value: one swapped subheadline keyed off an existing
UTM param. No new pages, no new data.

### Stakeholder
Deepens the top of the funnel (ad click → engaged landing) by matching ad intent
to landing copy — the single biggest lever on bounce for paid traffic.

### Visitor
A construction owner who clicked a "AI for construction" ad lands and sees
construction words in the hero within the first second. Mobile, above the fold.

### Growth
Makes the paid funnel measurably tighter; a clean before/after on bounce rate is
the "show me" for scaling ad spend.

## Acceptance criteria

- [ ] When `utm_campaign` contains "construction", the hero subheadline swaps to construction-specific copy.
- [ ] Same mapping for "realestate" and "restaurant"/"events".
- [ ] With no matching UTM (or none present), the default hero copy renders unchanged.
- [ ] Copy contains no em-dash; claims stay defensible.
- [ ] Works in light and dark mode.

## Out of scope

- Personalizing anything beyond the hero subheadline.
- Server-side rendering of the variant (client swap is fine).

## Engineering notes

- `src/pages/Index.tsx` — read `getUtmParams()` from `src/utils/utmTracker.ts`, map campaign → copy.
- Keep a typed map of campaign keyword → subheadline; default fallback constant.
- No `/api/`, no deps, no analytics removal.

## Implementation log

(Appended by implementation-dev during execution.)
