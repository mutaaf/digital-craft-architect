---
id: 0004
title: Client logo marquee (placeholders)
status: in-progress
priority: P2
area: trust
created: 2026-05-22
owner: gtm-innovation
---

## User story

As a first-time visitor weighing credibility, I want a visible social-proof strip,
so that the site feels established and I'm more comfortable booking a call.

## Why now (four lenses)

### Product Owner
A self-contained trust component the owner can populate with real logos as clients
onboard — value now (structure) and later (real proof).

### Stakeholder
Trust signals lift conversion across every top-of-funnel page without new copy or
claims.

### Visitor
A subtle, grayscale scrolling strip of industry placeholders below the hero —
present but not loud.

### Growth
Once real logos land, the strip becomes durable proof that compounds; starting
with honest placeholders avoids fake-testimonial risk.

## Acceptance criteria

- [ ] `ClientLogoMarquee` renders a horizontal grayscale marquee of 8–12 placeholder logos.
- [ ] Placeholders are honest (e.g. "Construction Co", "RE Agency") — no invented real names.
- [ ] Placed below the hero on `Index`, `Construction`, `RealEstate`.
- [ ] Respects reduced-motion; light + dark mode; no em-dash.

## Out of scope

- Sourcing real client logos (owner swaps them in later).
- Linking the logos anywhere.

## Engineering notes

- New `src/components/ClientLogoMarquee.tsx`; SVG placeholder boxes; CSS marquee with `prefers-reduced-motion` guard.
- Include `dark:` variants. No `/api/`, no deps.

## Implementation log

### 2026-05-22 — implementation-dev (feat/0004-client-logo-marquee)
- Picked up ticket; flipped status groomed -> in-progress.
- Plan: new `src/components/ClientLogoMarquee.tsx` rendering 8 to 12 honest SVG
  placeholder logos in a grayscale CSS marquee with a `prefers-reduced-motion`
  guard and `dark:` variants. Placed below the hero on Index, Construction, and
  RealEstate.
- Test first: Playwright smoke assertion that the marquee renders below the hero
  on all three pages with placeholder labels and no em-dash in its copy.
