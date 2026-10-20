---
id: 0117
title: Crew of Light hero on the CTO landing, with live storyboards and an AI director
status: shipped
priority: P1
area: conversion
created: 2026-10-19
owner: gtm-innovation
---

## User story

As a contractor, plumber or pool-service owner landing on cto.digitalcraftai.com, I want to see someone in my trade miss a call at 9:47 PM and the AI catch it, so that I know in the first seconds that this is built for my kind of work.

## Why now (four lenses)

### Product Owner
The hero was type on dark ink. A stage beside the copy now tells the story the business sells, as data: a pen of light draws the trade, the moment slips (a missed call, a voicemail), an AI orb catches it, light fills the drawing from the chest, and a caption states an approved outcome. Then the whole crew.

### Stakeholder
The story is a storyboard served by `/api/scene` from Vercel Edge Config. Changing it is a JSON edit (or a publish from the aurora-field studio) that reaches open pages within a minute, with no deploy. The AI director writes boards from a prompt or for a vertical with no figure yet. It is constrained to the vocabulary and to approved claims, so it cannot invent outcomes.

### User (in the real moment of use)
Text paints first, and the stage arrives after first paint. A visitor from a trade's ad (or who has read a vertical page) sees their own trade first. Hovering a headline line shows that trade. Under reduced motion the first trade stands lit with its caption.

### Growth
The "that's me" screenshot: a pool tech drawn in light with "Sun 8:02 AM · new lead" pulsing at the skimmer.

## Acceptance criteria

- [x] aurora-field 3.0.0 is vendored for the browser (`public/vendor/aurora-field@3.0.0/aurora-field.min.js`) and for the API (`api/_scene/aurora-field.cjs`). Both are pinned in `src/vendor/aurora-field.json` and verified in CI.
- [x] The library is not in the initial HTML. It loads after first paint.
- [x] `GET /api/scene?host=&vertical=` serves Edge Config "scenes" (cto, default, byVertical) or the bundled default. The visitor's trade goes first. Boards are validated against aurora-field, the house rules (no em-dash) and the approved claims. It sends an ETag, returns 304, and caches with `s-maxage=60`.
- [x] `POST /api/scene` (Bearer `DIRECTOR_TOKEN`) directs a board from a prompt and/or publishes a board to Edge Config, after validation. CORS covers the aurora-field studio. GET and POST are one Edge function, because the Hobby plan caps serverless functions at 12 per deployment and Edge functions don't count.
- [x] Captions come only from the claims library (`api/_scene/board.ts`), and numbers come only from a claim.
- [x] The client polls `/api/scene` every 60 s while visible, and a changed board takes over at the next beat.
- [x] `npx tsx scripts/test-scene.ts`: board rules, director output, both handlers (7 pass).
- [x] e2e: `tests/e2e/crew-of-light-hero.spec.ts` (6 pass).
- [ ] The owner sets `EDGE_CONFIG`, `EDGE_CONFIG_ID`, `VERCEL_API_TOKEN` (+ `VERCEL_TEAM_ID`), `DIRECTOR_TOKEN`, and optionally `SCENE_DIRECTOR=on`.

## Out of scope

- The root `/` hero (follow-up, behind an A/B flag once CTA clicks hold here).

## Engineering notes

- **Files:**
  - `api/_scene/board.ts` (shared rules; also imported by the client)
  - `api/_scene/lib.ts` (Edge Config, validation, director)
  - `api/scene.ts` (one Edge function)
  - `src/components/v2/CrewOfLight.tsx`, `src/utils/visitorVertical.ts`
  - `src/pages/IndexV2.tsx` (hero grid)
- **New dependency:** `@vercel/global-config` (the renamed `@vercel/edge-config`).
- **AGENTS.md:** `/api` and env changes are human-authored; the owner approved this in session on 2026-10-19.
- **Supersedes:** PR #322.

## Implementation log

- 2026-10-19: aurora-field 3.0.0 (stage, validate, schema, 21 trades) merged upstream; vendored here.
