---
id: 0017
title: AI-for-plumbers long-tail landing page funneling into home-services demos
status: in-progress
priority: P1
area: content
created: 2026-05-26
owner: gtm-innovation
---

## User story

As a plumbing-company owner Googling "AI for plumbers" or "plumbing missed call
text back," I want a landing page that names my trade in the headline and
shows me the two AI tools that solve my actual pain (after-hours call capture
and on-site estimate quoting), so that the demo I try in the next 60 seconds
feels built for plumbers and I do not have to translate generic "home services"
copy into my world.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the home-services vertical already
ships two working demos (`/homeservices/demo/lead-responder` and
`/homeservices/demo/estimate`) and a copy spine on `/homeservices` that names
plumbing, HVAC, and electrical generically. A single new page at
`/ai-for-plumbers` repositions the same demos under a trade-specific headline,
schema, and CTA. No new demos, no new backend, no new pricing tier.

### Stakeholder

This deepens the long-tail SEO moat where the strongest acquisition leverage
lives. "AI for [trade]" is a low-competition, high-intent query class the
existing `/homeservices` hub does not rank for because its title and copy
target the umbrella term. A trade-specific landing page (modeled on the
`/locations/texas` pattern already in repo) carves out a query class the
product already serves end-to-end. The same pattern can be re-applied for
HVAC and electrical in follow-up tickets, but this ticket ships exactly one
page so it stays inside the 200-line diff budget.

### Visitor (in the real moment of use)

A plumbing owner on a phone reads a hero that says "AI for plumbers" and a
sub-line that lists their three real pains (after-hours calls, slow quotes,
review chasing), then sees two demo cards routing to the existing home-
services lead-responder and estimate demos pre-labeled for their trade. One
tap goes to a working demo; one tap goes to the existing pricing tiers on
`/homeservices`. No setup form blocks the demo.

### Growth

The "show me" moment is the search result for "AI for plumbers" pointing at a
page that names plumbers in the title, the H1, the meta description, and the
demo card labels, then routes the visitor to a real working tool in one tap.
Trade-owner forums and Reddit threads share links that are specific to the
trade; a generic home-services URL does not earn that share, a trade-named
URL does.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new `/ai-for-plumbers` route renders a page whose `<title>`, H1, and meta description all explicitly name "plumbers" or "plumbing," and whose body lists at least three plumbing-specific pain points (after-hours calls, on-site quoting, review chasing) using defensible language and no invented client names.
- [ ] The page surfaces two demo CTA cards that link to `/homeservices/demo/lead-responder` and `/homeservices/demo/estimate` (the existing home-services demos); both links resolve and `npm run check-links` stays green.
- [ ] The page emits one `BreadcrumbList` JSON-LD block (Home -> AI for Plumbers) matching the pattern in `src/pages/locations/Texas.tsx`, and one `Service` JSON-LD whose `serviceType` mentions plumbing; both parse as valid JSON.
- [ ] The page renders the shared `Navbar` + `Footer` (using `const { content } = useContent()` then `<Footer data={content.footer} />` per ticket 0006), uses `Helmet` for title/description/canonical/OG, and the `/ai-for-plumbers` URL appears in the generated sitemap because it is registered as a top-level `<Route path=...>` in `src/App.tsx`.
- [ ] The page renders in light and dark mode on a mobile viewport, contains no em-dash character in any copy, and `trackCTAClick` is fired on each demo CTA with a location label that includes "plumbers" so the page's funnel is measurable in GA.
- [ ] No new hostnames, no `/api/` change, no new demo built; the page is composition of existing components plus copy.

## Out of scope

- Building any new demo, prompt, or estimate logic. This page reuses the
  existing home-services demos verbatim; their behavior is unchanged.
- Sibling landing pages for HVAC, electrical, roofing, or landscaping. Each
  trade gets its own focused ticket if this one earns its traffic.
- Editing the `/homeservices` hub page itself or its schema; that page keeps
  its umbrella positioning.
- Inventing testimonials or client names; the page uses the same placeholder
  pattern as `/locations/texas` (industry-typed placeholders only).
- Adding plumbing-specific pricing; the page links to the existing
  `/homeservices` pricing tiers.
- Personalizing the page by UTM or scraped company; UTM personalization is
  ticket 0001's lane and is out of scope here.

## Engineering notes

Files / patterns the dev should touch.

- New `src/pages/AiForPlumbers.tsx` - model on `src/pages/locations/Texas.tsx`
  (which is the cleanest single-file long-tail landing page in the repo).
  Reuse its structure: Helmet head + Navbar + ScrollProgress + hero + stats +
  vertical cards + Footer + StickyCTA. Replace the two "vertical" cards with
  two demo CTA cards pointing at `/homeservices/demo/lead-responder` and
  `/homeservices/demo/estimate`. Keep the BreadcrumbList JSON-LD pattern from
  Texas.tsx and add a sibling `Service` schema (mirror the `Service` shape
  used in `src/pages/HomeServices.tsx` around line 251, but with `serviceType`
  naming plumbing).
- `src/App.tsx` - register `<Route path="/ai-for-plumbers" element={<AiForPlumbers />} />`
  next to the existing `/ai-for-small-business` route registration. The
  sitemap generator (`scripts/generate-sitemap.ts`) discovers routes from
  `path=` attributes in `App.tsx`, so the route picks up sitemap inclusion
  automatically.
- Footer wiring follows the ticket 0006 pattern exactly:
  `const { content } = useContent()` then `{content?.footer && <Footer data={content.footer} />}`.
  Do NOT use `const { data } = useContent()`; that is the bug 0006 fixed.
- Per-route SEO Pilot table: index.html's per-route title/description script
  controls `document.title` for routes in its `pages` table (see the 2026-05-25
  Glossary lesson in `docs/LESSONS.md`). Helmet alone will not own the title
  for this route, so the e2e title assertion should target the Helmet-emitted
  head element directly (assert the title via `page.locator('title')` text
  inside the Helmet-managed head, or assert the meta description Helmet
  appends), NOT `expect(page).toHaveTitle(...)`. Adding the route to the SEO
  Pilot table is its own SEO ticket, out of scope here.
- `tests/e2e/ai-for-plumbers.spec.ts` - one spec per acceptance box: hero/
  title naming check (via Helmet-managed head element, per the lesson above),
  two demo CTA links resolve, BreadcrumbList + Service JSON-LD parse and
  contain the expected strings, footer renders, dark-mode render check,
  trackCTAClick fires with the plumbers label (assert via a `window.dataLayer`
  spy following the `tests/e2e/utm-hero.spec.ts` analytics pattern if present,
  or assert the click handler's side effect against a route navigation).
- New deps: no. Schema migration: no. Privacy/security surface change: no
  (same origin, no new hostnames, no data collected).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-05-26 - branch `feat/0017-ai-for-plumbers-landing` opened by implementation-dev; ticket flipped to `in-progress` + README index row updated together (single commit, check-backlog green)
- 2026-05-26 - added `src/pages/AiForPlumbers.tsx` modeled on `src/pages/locations/Texas.tsx` (Helmet + Navbar + ScrollProgress + hero + stats + 3 plumbing-specific pain cards + 2 demo CTA cards routing to `/homeservices/demo/{lead-responder,estimate}` + why-now + final CTA + Footer + StickyCTA). Footer wired via `const { content } = useContent()` per ticket 0006. Emits BreadcrumbList (Home -> AI for Plumbers) and Service (`serviceType: "AI Automation for Plumbing Companies"`) JSON-LD. Route registered next to `/ai-for-small-business` in `src/App.tsx`; sitemap auto-picks via `path=` regex (verified `public/sitemap.xml` contains the URL). Added route to `tests/e2e/routes.ts` for smoke coverage.
- 2026-05-26 - added `tests/e2e/ai-for-plumbers.spec.ts` with 6 specs mapping 1:1 to acceptance boxes. Per the 2026-05-25 lesson, `/ai-for-plumbers` is NOT in the `index.html` SEO Pilot `pages` table (out of scope), so the title assertion is delegated to the Helmet-driven surfaces (meta description, canonical, og:title appended by Helmet). The /api/ test restricts to first-party calls only (Sentry's ingest hits `/api/...` on its own hostname). Full local gate green (lint 0 errors, typecheck, check-links, check-images, check-meta, check-blog-dates, check-backlog, build). New spec passes 6/6.
