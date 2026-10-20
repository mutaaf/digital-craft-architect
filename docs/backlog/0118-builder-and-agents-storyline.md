---
id: 0118
title: Hero storyline opens with the builder at his desk, prompting AI agents that go to work
status: in-progress
priority: P1
area: conversion
created: 2026-10-20
owner: gtm-innovation
---

## User story

As an owner of a trade business landing on the CTO page, I want to see who builds the system and how it works (a person writes it, briefs AI agents, and the agents catch my missed calls), so that "AI on retainer" reads as real work by a real builder, not a black box.

## Why now (four lenses)

### Product Owner
The owner asked for a better storyline: a person at a computer coding, then prompting AI, then agents doing the work, with the person directing them. aurora-field 3.1 adds builder beats, and the hero's default board now opens with them.

### Stakeholder
It tells DigitalCraft's actual operating model (one builder, a fleet of agents, published on the agent-fleet page) in the hero, in the same light-drawing language as the trades.

### User (in the real moment of use)
1. A man is drawn at his desk, and code types out on his screen.
2. His prompt reads "answer every missed call and book the job", and an AI agent leaves the screen.
3. Three agents step out, labelled with their jobs.
4. Then the visitor's trade, its missed moment caught by "Agent · answering".
5. The finale puts him at his desk in front of the whole crew.

### Growth
The "that's how it works" screenshot: a builder with three agents fanned out from his screen.

## Acceptance criteria

- [x] aurora-field 3.1.2 is vendored (browser and API), pinned and verified in CI.
- [x] `DEFAULT_STORYBOARD` opens with builder typing, prompting and agents beats, then trades, then the crew with `builder: true`.
- [x] Builder captions are approved claims (`builder-writes`, `builder-prompts`, `agents-work`), and on-screen prompts come only from `PROMPTS` (Edge Config may extend both).
- [x] The visitor's trade comes first after the intro, and director boards use the same shape (agents chosen from the claims they caption).
- [x] Lineups use a group radius so the agents and the crew fit the stage.
- [x] Tests: `scripts/test-scene.ts` (8), e2e `crew-of-light-hero` (6; reduced motion shows the builder).
- [ ] After deploy, Edge Config `scenes.cto` is republished with the new default.

## Out of scope

- A real likeness of the founder (the builder stays a generic figure).

## Engineering notes

- `api/_scene/board.ts` (claims, prompts, intro, personalize), `api/_scene/lib.ts` (prompt rules, director), `api/scene.ts`, `src/components/v2/CrewOfLight.tsx` (groupRadius).
- Upstream: mutaaf/aurora-field 3.1.0–3.1.2 (published to npm automatically from tags).

## Implementation log

- 2026-10-20: storyline built and checked in headless Chromium on the CTO page.
