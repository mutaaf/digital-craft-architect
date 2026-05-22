---
id: 0003
title: Route-aware dynamic pricing CTA
status: shipped
priority: P2
area: conversion
created: 2026-05-22
owner: gtm-innovation
---

## User story

As a visitor deep in a vertical page, I want the sticky CTA to reference my
industry's pricing, so that the next step feels specific to me rather than generic.

## Why now (four lenses)

### Product Owner
Reuses the existing sticky CTA; only the label changes by route. Tiny diff, broad
surface (every vertical page).

### Stakeholder
Reinforces the per-vertical positioning the whole site is built on — consistency
from hero to CTA.

### Visitor
On `/construction`, the button reads "See Construction Pricing"; on `/realestate`,
"See Real Estate Pricing". The CTA matches the page they're reading.

### Growth
Specific CTAs convert better than generic ones; a clean A/B candidate against the
current static label.

## Acceptance criteria

- [ ] `StickyCTA` reads the current route via `useLocation()` and maps it to vertical-specific button copy.
- [ ] On `/construction`, `/realestate`, and other known verticals, the label is industry-specific.
- [ ] On unknown/non-vertical routes, the default label renders.
- [ ] Light + dark mode; no em-dash.

## Out of scope

- Changing where the CTA links (label only).
- New pricing pages.

## Engineering notes

- `src/components/StickyCTA.tsx` — `useLocation()` from react-router; route → label map with default fallback.
- No `/api/`, no deps.

## Implementation log

### 2026-05-22 — implementation-dev
Started on branch `feat/0003-dynamic-pricing-cta`. Plan: `StickyCTA` reads
`useLocation()`, maps the leading route segment to a vertical-specific CTA label
with a default fallback for unknown routes. Label-only change, light + dark mode,
no link or pricing-page changes.

### 2026-05-22 — shipped
Feat PR #37 merged to main (build + smoke-required green). Vertical CTA copy is
live for all twelve verticals with a default fallback. Marking shipped.
