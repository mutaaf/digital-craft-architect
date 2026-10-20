---
id: 0119
title: The hero story in four acts (the miss, the build, the catch, the crew), and on digitalcraftai.com
status: in-progress
priority: P1
area: conversion
created: 2026-10-20
owner: gtm-innovation
---

## User story

As an owner of a trade business landing on either DigitalCraft site, I want the hero to show me the moment I lose a job, who builds the fix, and that same moment caught, in words I can follow without decoding an animation, so that "AI on retainer" reads as a before and after I recognize, about my own trade.

## Why now (four lenses)

### Product Owner
The owner asked to enhance the storyline across all aspects and bring it to the main digitalcraftai.com hero. 0118 opened on the builder, but the story had no stakes: every trade was already caught, so there was no "before". Story structure puts the customer's problem first and the guide (the builder) second.

### Stakeholder
One story, two voices: first person on the CTO site ("So I build the system"), the company on digitalcraftai.com ("So we build"). Both stay on the curated claims, and the narrator's lines are written in code, so no board (Edge Config, the AI director) can make the site say something new.

### User (in the real moment of use)
1. 9:47 PM, a roofer's phone rings. Nobody picks up; the pen erases him, and the loss is captioned.
2. The builder writes the system, briefs the agents in plain English, and they step out.
3. Same roofer, same night: the phone rings again, an agent picks up, and he fills with light.
4. A plumber and a realtor follow; the crew stands lit with the builder in front.
Subtitles narrate each step; a chapter rail shows where you are and lets you jump; the story pauses; "Your trade" recasts the hero as your own trade (and remembers it).

### Growth
A recognizable before/after in the first ten seconds, personalized to the visitor's trade (ads, picker) and, on the company site, to a company they already ran a demo on. New events: `story_chapter`, `story_complete`, `story_pause`, `story_jump`, `story_trade_pick`; `story_try_demo` CTA on the company hero.

## Acceptance criteria

- [x] aurora-field 3.2.0 (missed beats, `untrace`, a story clock that pauses) vendored for browser and API, pinned in CI.
- [x] Boards have four acts: a missed beat, the builder intro, the same moment caught, more trades, the crew. `compose()` builds them; the director's boards and `personalize()` keep the shape.
- [x] Loss captions are approved claims (`missed-*`); the builder's prompt answers the miss.
- [x] Narrator lines come from `api/_scene/story.ts`, keyed by beat; no em-dash, no numbers outside claims (tested for every trade, both voices).
- [x] Chapter rail (jumpable), pause/play (WCAG 2.2.2), trade picker that recasts the story, a screen-reader transcript; reduced motion never holds the loss.
- [x] CTO headline lines light up with the outcome being acted out; on phones the narrator speaks under the CTAs.
- [x] digitalcraftai.com hero plays `ROOT_STORYBOARD` (`/api/scene?host=root`, Edge Config `scenes.root`) in an "after hours" window, with a "Watch it work on your company" CTA.
- [x] Tests: `scripts/test-scene.ts` (11), e2e `crew-of-light-hero` (8).
- [ ] After deploy, Edge Config `scenes.cto` and `scenes.root` are republished with the new defaults.

## Out of scope

- A real likeness of the founder; voice-over audio.

## Engineering notes

- `api/_scene/board.ts` (claims, `compose`, `missOf`, `personalize`, `ROOT_STORYBOARD`), `api/_scene/story.ts` (chapters, narrator, transcript, timing), `api/_scene/lib.ts` (director), `api/scene.ts` (`host=root`, key `root`).
- `src/components/v2/CrewOfLight.tsx` (host, chrome, onStory), `src/pages/IndexV2.tsx` (headline sync), `src/components/Hero.tsx` (company hero).
- Upstream: mutaaf/aurora-field 3.2.0.
