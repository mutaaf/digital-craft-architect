---
id: 0123
title: The app launcher shared with mutaafaziz.com, on both Digital Craft sites
status: in-progress
priority: P2
area: trust
created: 2026-10-20
owner: gtm-innovation
---

## User story

As a visitor on either Digital Craft site, I want the same app launcher the founder's site has (Digital Craft AI, the CTO practice, the founder, the games and apps he has shipped), so that I can see the whole body of work behind the company in one place and move between the three sites without hunting for links.

## Why now (four lenses)

### Product Owner
The owner asked for an app launcher on digitalcraftai.com and cto.digitalcraftai.com, with a Digital Craft AI icon, the same as mutaafaziz.com's, extracted into a shared component.

### Stakeholder
One source for the app list and icons: github.com/mutaaf/launcher (zero dependencies, ES5, shadow DOM, about 10 KB gzipped). Sites vendor it hash-locked like aurora-field, so no site depends on another at runtime. The tips are factual descriptions; no numbers or claims.

### User (in the real moment of use)
1. A grid button in the navbar (after Book a Call on desktop, beside the menu on phones), or ⌘K / Ctrl+K / `/`.
2. A palette: the site's own rows first (Book a discovery call; on the company site also "Watch it work on your company"), then Company, Apps, Games, Library, with recents on top. The site you're on is left out.
3. Phones get a bottom sheet you drag down to dismiss.

### Growth
"Book a discovery call" in the palette fires `book_a_call` (location `app_launcher_<site>`), the same conversion as the navbar's. New events: `app_launcher_open`, `app_launch` (`<site>:<app id>`).

## Acceptance criteria

- [x] `scripts/launcher.mjs` vendors `public/vendor/launcher@<version>/launcher.js` and pins it in `src/vendor/launcher.json`; CI verifies the lock.
- [x] `src/components/AppLauncher.tsx` loads it after first paint (a click before then loads it at once) and mounts one launcher per page with the site's skin (company site: light, sky accent; CTO: dark, copper accent).
- [x] One Apps button per navbar (`Navbar.tsx`, `NavbarV2.tsx`), so ⌘K is bound once.
- [x] `NavbarV2` reads the host at first render, so the launcher isn't remounted mid-click.
- [x] e2e `app-launcher` (5): the vendored file matches the lock; each site opens the palette without itself, with Book a discovery call; Escape returns focus; Ctrl+K toggles and search finds an app; phones get a bottom sheet with no sideways scroll.

## Out of scope

- Moving mutaafaziz.com's own dock (five era skins) onto the shared library; it gains the Digital Craft and CTO apps with the same icons in its own markup for now.

## Engineering notes

- Upstream: github.com/mutaaf/launcher (demo at mutaaf.github.io/launcher). Re-vendor with `node scripts/launcher.mjs --sync ../launcher`.
