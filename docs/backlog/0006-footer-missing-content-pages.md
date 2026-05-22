---
id: 0006
title: Footer silently missing on Glossary, Industries, and comparison pages
status: in-progress
priority: P1
area: conversion
created: 2026-05-22
owner: gtm-innovation
---

## User story

As a visitor on `/glossary`, `/industries`, `/compare/hubspot`, or
`/compare/gohighlevel`, I want the site footer (navigation, contact, secondary
CTAs, the email-course opt-in) to render like it does on every other page, so that
I can keep exploring or convert instead of hitting a dead end at the bottom.

## Why now (four lenses)

### Product Owner
These are four live, SEO- and conversion-targeted pages (the Industries hub, the
glossary, and both competitor-comparison pages) that currently end abruptly with no
footer. The footer carries the secondary nav, contact links, and the `/industries`
email-course opt-in (ticket 0002), so its absence quietly caps conversion on
exactly the pages built to capture intent.

### Stakeholder
Pure defect repair, no new surface. Restores the owned-channel opt-in and internal
linking (SEO) on four pages for free.

### Visitor
The page just stops. No way back into the funnel without scrolling up.

### Growth
The comparison pages are bottom-of-funnel ("HubSpot alternative" searchers) and the
missing footer drops their CTA. Fixing it is a direct conversion recovery.

## Root cause (already diagnosed)

All four pages destructure the wrong field from `useContent()`:

```tsx
const { data } = useContent();          // BUG: hook returns { content, isLoading, error }
...
{data && <Footer data={data.footer} />} // data is always undefined -> Footer never renders
```

The correct pattern (see `src/pages/Construction.tsx:208,852`) is:

```tsx
const { content } = useContent();
...
{content?.footer && <Footer data={content.footer} />}
```

This was caught by the new `tsc` type-check gate (ticket 0005) as
`Property 'data' does not exist on type '{ content: ContentData; ... }'`. The four
files are currently grandfathered with `// @ts-nocheck` (see the
`// TODO(eng): typecheck baseline, see docs/backlog/0005` markers).

## Acceptance criteria

- [ ] `src/pages/Glossary.tsx`, `src/pages/Industries.tsx`,
      `src/pages/compare/HubSpot.tsx`, `src/pages/compare/GoHighLevel.tsx` use
      `const { content } = useContent()` and render `<Footer data={content.footer} />`
      with the same null-guard pattern as `Construction.tsx`.
- [ ] The footer renders on all four routes (light + dark).
- [ ] Remove the now-unnecessary `// @ts-nocheck` (and the paired
      `/* eslint-disable @typescript-eslint/ban-ts-comment */`) from each of the four
      files once they type-check clean.
- [ ] `npm run typecheck` stays green; smoke suite stays green.

## Out of scope

- The fifth grandfathered file, `src/pages/events/VoiceBookingAgent.tsx` (missing
  required `sellerMotivation` on its property stub) is a separate, lower-priority
  voice-prompt concern, not a footer bug. Track it on its own ticket; do not fold it
  in here.
- Any redesign of the footer itself.

## Engineering notes

- Reference implementation already in the repo: `src/pages/Construction.tsx`
  (lines 208 and 852) and `src/pages/Index.tsx` (line 229).
- `ContentData.footer` is typed in `src/hooks/useContent.ts:134` (`FooterSection`).
- Removing `// @ts-nocheck` re-enables full type-checking on these files, so fix any
  other latent type errors they surface (none expected beyond the `data`/`content`
  rename).
- New deps: no. `/api/`: no. This is the feature loop's lane (visible behavior change).

## Implementation log

- 2026-05-22: Picked up by the Ship runner on branch
  `feat/0006-footer-missing-content-pages`. Flipped status to in-progress.
  Plan: rename `data` -> `content` from `useContent()` in the four pages, render
  the footer with the `content?.footer` null-guard matching `Construction.tsx`,
  then remove the `// @ts-nocheck` + paired `eslint-disable` headers and run the
  full local gate.
