---
id: 0117
title: Crew of Light hero on the CTO landing (aurora-field people, drawn then lit)
status: in-progress
priority: P1
area: conversion
created: 2026-10-19
owner: gtm-innovation
---

## User story

As a contractor, plumber, or realtor landing on cto.digitalcraftai.com, I want
to see someone in my trade get picked up by AI in the first seconds, so that I
know straight away this is built for my kind of work, not for a SaaS company.

## Why now (four lenses)

### Product Owner
The hero is type on dark ink. One stage beside the copy now shows the trades we
serve: each is drawn on a blank canvas by a pen of light, an AI signal runs
through the drawing, it fills into a lit body, and a caption says what the AI
did for that trade.

### Stakeholder
It is built on aurora-field, the owner's own WebGL library (the same one behind
the mutaafaziz.com sky). It is vendored and pinned by hash, and the founder
site's aurora accent carries the founder-parity thread (0113 to 0116).

### User (in the real moment of use)
The text paints first. The stage arrives after first paint and never blocks the
CTA. Hovering a line of the headline puts that trade on stage, and the trade
names under the stage are buttons. On phones it sits quietly behind the
headline. Under reduced motion it shows the whole crew, standing still.

### Growth
The "that's me" screenshot: a roofer drawn in light, swinging a hammer, with
"Review request · sent after the job" beside him.

## Acceptance criteria

- [x] aurora-field 2.1.0 is vendored at `public/vendor/aurora-field@2.1.0/`
      and pinned by `src/vendor/aurora-field.json`. CI runs
      `node scripts/aurora-field.mjs` to verify the hash. No npm dependency.
- [x] The library is not in the initial HTML. It loads after first paint
      (requestIdleCallback), so the headline stays the LCP element.
- [x] The stage draws six trades in a loop (contractor, plumber, electrician,
      roofer, property manager, realtor), each pen-drawn then lit with a
      caption, then the whole crew.
- [x] Hovering a headline line pins a trade, and the trade buttons pick one
      (aria-pressed).
- [x] Reduced motion: no pen, the whole crew lit and still.
- [x] Captions use only claims already on the page or in the demos, with no
      client names and no em-dashes.
- [x] e2e: `tests/e2e/crew-of-light-hero.spec.ts` (served and hash-matched,
      not in the initial HTML, mounts and picks, reduced motion).
- [ ] CWV unchanged within noise on `/?force=cto` (`scripts/validate-pr.sh`).

## Out of scope

- The root `/` hero (follow-up ticket, behind an A/B flag once CWV and CTA
  clicks hold here).
- Worker offload. Caption anchors need the main-thread field, and the cost is
  about 0.3 ms a frame.

## Engineering notes

- `src/components/v2/CrewOfLight.tsx` (the stage and orchestration),
  `src/pages/IndexV2.tsx` (HeroV2 grid: copy 7 cols, stage 5 cols),
  `scripts/aurora-field.mjs` (sync and verify), `vercel.json` (immutable
  cache for the versioned vendor path), `.github/workflows/ci.yml` (one
  step).
- Upstream: mutaaf/aurora-field#2 (figure(), registerCrew(), trace, blank,
  signal). Re-vendor from aurora-field main once that merges:
  `node scripts/aurora-field.mjs --sync ../aurora-field`.
- The V2 page is always dark, so the stage has no light-mode variant.
- New deps: no.

## Implementation log

- 2026-10-19: branch `feat/crew-of-light-hero` opened, vendored 2.1.0 from
  the aurora-field PR branch.
- 2026-10-19: e2e spec passes against the production build (4/4).
