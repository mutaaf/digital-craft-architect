---
id: 0120
title: Hero story labels never sit under the drawing; the catch turns the moment to handled; studio makes stories with your own key
status: shipped
priority: P1
area: conversion
created: 2026-10-19
owner: gtm-innovation
---

## User story

As an owner watching either hero, I want every word on the stage to be readable at a glance, never crossed by the lines of the drawing, and I want the catch to visibly answer the miss, so that the before and after lands in one look. As the owner of the site, I want to make a new story by describing it, with my own AI key, without touching JSON.

## Why now (four lenses)

### Product Owner
The owner asked for finer refinement of the storyline and the animations, and specifically that text can never be overlapped by lines. Captures of 0119 showed the caption sitting on the figure's chest and arm, the moment's label and the orb's label running over the outline, and on phones the orb's label running off the stage.

### Stakeholder
The fix lives in aurora-field (3.3.0), so every stage gets it: both heroes, the studio, mutaafaziz.com. The new `moment.then` text comes from a fixed map in `board.ts` (the time, then what the agent did), so no board can make the site say something new. The studio's bring-your-own-key flow sends the key only to Anthropic or OpenAI, from the browser.

### User (in the real moment of use)
1. 9:47 PM, the roofer's phone rings: a ring on his hand, the label clear above his head, a thin leader line between them.
2. Nobody answers: the label turns grey and struck through, and he is erased.
3. Later, the same call: the agent reaches it and the label turns to "9:47 PM · answered" in the accent colour before he fills with light.
Every label sits on a plate beside the figure, never on it.

### Growth
The before and after is now three states of one label (ringing, lost, handled), which reads even with the sound off and the subtitles skipped. The studio lets the owner try new stories for ads and verticals in a sentence, then publish the good ones to `/api/scene`.

## Acceptance criteria

- [x] aurora-field 3.3.0 vendored: `field.bounds()`, labels laid out around the figure (caption, moment, prompt, chips), plates on every label (`--af-plate`), the moment as ring, label and leader line, the orb's label on the side with room (or under it).
- [x] `moment.then` on every caught beat (`handled()` in `board.ts`, the director's boards too); never on a missed beat. Tested for every trade.
- [x] The figure leaves headroom for labels (`radius` h × 0.39).
- [x] Studio: "make a story" (top bar, `M`, `?make=1`): describe it, paste a Claude or OpenAI key (detected from the key), Make it; validated, repaired by the model if needed, then playable, changeable in words, publishable.
- [x] Tests: aurora-field `npm test` (49), `scripts/test-scene.ts` (12), e2e `crew-of-light-hero`.
- [x] After deploy, Edge Config `scenes.cto` and `scenes.root` are republished (one at a time) so live boards carry `moment.then`.

## Out of scope

- A server-side director in the studio (the key never leaves the browser except to the provider).

## Engineering notes

- Upstream: mutaaf/aurora-field 3.3.0 (`src/aurora-field.js` stage layout, `index.html` studio).
- `api/_scene/board.ts` (`handled`, `beatFor`, `missOf`), `api/_scene/lib.ts` (`toBoard`), `src/components/v2/CrewOfLight.tsx` (radius).
