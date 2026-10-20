---
id: 0121
title: Phones - the hero story plays in its own panel, nothing scrolls sideways, nothing covers the story
status: in-progress
priority: P1
area: conversion
created: 2026-10-20
owner: gtm-innovation
---

## User story

As an owner of a trade business opening either DigitalCraft site on my phone, I want to read the headline without lines drawn across it, watch the story with its labels, and use the page without it sliding sideways or a button covering what I'm reading, so that the site feels built for the phone in my hand.

## Why now (four lenses)

### Product Owner
The owner asked to "fix everything for phone" after 0120. A 390 px audit of both landing pages found: the CTO hero drew its figure faintly behind the headline (lines across the text, no labels), the CTO page scrolled sideways so the menu button sat off screen, the footer link row was clipped on both sites, the chat bubble covered the company hero's narrator and rail, and smaller layout faults.

### Stakeholder
No copy or claims change (one typo fixed: "Monlthly"). Desktop layouts are unchanged.

### User (in the real moment of use)
1. CTO site: headline, copy and buttons read clean; the story plays below them in its own panel with the moment, captions, narrator, chapters, pause and trade picker.
2. The menu button is on screen; the page never moves sideways.
3. Company site: the chat bubble steps aside while the story is on screen and comes back after.
4. Footer links wrap; partner names read as wordmarks; case-study arrows sit by the dots, not over a card.

### Growth
The CTO hero's story (and its CTAs above it) was effectively invisible on phones; now the whole four-act story plays there too, with the same `story_*` events.

## Acceptance criteria

- [x] CTO hero on phones: the stage sits under the CTAs at full strength with its full chrome (HUD labels, narrator, rail, picker); nothing is drawn behind the copy. The phone-only narrator and the `chrome`/`paused` props of `CrewOfLight` are gone.
- [x] No horizontal scroll at 390 px on `/?force=cto` or `/?force=root` (the footer link row wraps).
- [x] Chat launcher hides on phones while a hero story is at least 15% on screen (IntersectionObserver), and is not focusable while hidden.
- [x] Chapter labels don't touch at 390 px; outcome-card tags don't run into each other; the CTO eyebrow row wraps cleanly.
- [x] "Tools We Trust" renders wordmarks (the hotlinked OpenAI logo was broken, AWS's was a grey share card).
- [x] Case-study carousel arrows sit beside the dots on phones.
- [x] e2e: `crew-of-light-hero` phone test asserts the stage is below the copy, the HUD shows, pause works, and `scrollWidth <= 390`.

## Engineering notes

- `src/pages/IndexV2.tsx`, `src/components/v2/CrewOfLight.tsx`, `src/components/LiveChatBubble.tsx`, `src/components/Footer.tsx`, `src/components/AffiliateSection.tsx`, `src/components/CaseStudies.tsx`, `public/content.json`.
