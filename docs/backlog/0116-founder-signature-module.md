---
id: 0116
title: Founder signature module shared visually with mutaafaziz.com
status: groomed
priority: P2
area: trust
created: 2026-10-19
owner: gtm-innovation
---

## User story

As a buyer who has seen mutaafaziz.com, I want the founder section here to be
recognizably the same person's work, so that the company and the founder feel
like one operation and not a front.

## Why now (four lenses)

### Product Owner
The owner chose a shared founder module over a rebrand (2026-10-19). Each site
keeps its brand. The founder block is the one place they visibly match.

### Stakeholder
It gives both sites a consistent signature: a HUD status line and a terminal
card, which are the personal site's Mission Control motifs.

### User (in the real moment of use)
A compact, dark terminal card in the founder section with four facts and one
link. It reads in about two seconds on a phone.

### Growth
The "same person built both" moment is a screenshot-worthy detail that
supports the Fortune 100 positioning.

## Acceptance criteria

- [ ] `src/components/FounderSignature.tsx` renders:
      - a mono uppercase HUD line `MUTAAF AZIZ / FOUNDER, DIGITALCRAFT AI / DFW`
        with a pulsing status dot
      - a terminal card titled `mutaaf@digitalcraft:~` with `▸ key  value` rows
        for role, Disney & ESPN, years, and book (all from `founder.ts`)
      - a link chip to https://mutaafaziz.com
- [ ] Tokens are scoped in `src/index.css` beside the V2 tokens:
      `--mc-night #0F1316`, `--mc-night2 #161B1F`, `--mc-line #252C31`,
      `--mc-aurora #7BE3C3`, `--mc-aurora2 #3E8F7A`, plus a `mcbeat` keyframe.
      Aurora is not added to the global Tailwind palette.
- [ ] Uses the existing `font-mono` (JetBrains Mono). No new font loads.
- [ ] The IndexV2 ChampionV2 chip row is replaced by the card. The root
      `Founder.tsx` shows the HUD line above the heading and the card below
      the timeline.
- [ ] Clicking the link fires `trackEvent('founder_site_click', ...)`.
- [ ] `prefers-reduced-motion` stops the pulse.
- [ ] Verified at 375px and desktop, in both themes on `/`, and on
      `/?force=cto`.
- [ ] e2e: the card is visible on both landings and the link href is correct.

## Out of scope

- Re-theming any other section.
- The aurora particle sky. It is too heavy for a landing page.

## Engineering notes

- Depends on 0113.
- `src/pages/IndexV2.tsx` ChampionV2 ~L855, `src/components/Founder.tsx`,
  `src/index.css` ~L134.
- Reference look: `mutaafaziz-site/public/index.html` L1428-1463 (terminal)
  and L1334-1350 (HUD and `mcbeat`).
- New deps: no.

## Implementation log
