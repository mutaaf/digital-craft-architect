---
id: 0001
title: UTM-personalized hero copy
status: in-progress
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

### 2026-05-22 - implementation-dev
- Branched `feat/0001-utm-personalized-hero` off origin/main; ticket set to in-progress.
- Plan: pure typed map in `src/utils/heroPersonalization.ts` (campaign keyword to subheadline + default fallback constant); `src/pages/Index.tsx` reads `getUtmParams()` and overrides the hero subheadline; Playwright e2e covers the swap and the default.
- Implemented `src/utils/heroPersonalization.ts` with `getHeroSubheadlineForUtm()` and `resolveHeroSubheadline()`. Keyword map covers construction, realestate, restaurant, and events; case-insensitive `includes` so values like `construction_spring_2026` match. No match or absent `utm_campaign` returns the content.json default.
- `Index.tsx` builds `heroData` by spreading `content.hero` and overriding only `subheadline`; dark mode is unchanged because the existing Hero `<p>` keeps its `dark:text-gray-300` variant.
- Added `tests/e2e/utm-hero.spec.ts`: asserts default copy for no-UTM and non-matching UTM, and that each vertical swaps to distinct, keyword-matching, em-dash-free copy. All 6 specs green against the production build.
- Full local gate green: lint (0 errors), check-links, check-images, check-meta, check-blog-dates, build, plus check-backlog.
