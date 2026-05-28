---
id: 0020
title: AI-for-HVAC long-tail landing page funneling into home-services demos
status: in-progress
priority: P1
area: content
created: 2026-05-28
owner: gtm-innovation
---

## User story

As an HVAC company owner Googling "AI for HVAC contractors," "HVAC missed call
text back," or "AI dispatcher for HVAC," I want a landing page that names my
trade in the headline and shows me the two AI tools that solve my actual pain
(after-hours service calls and maintenance-plan quoting), so that the demo I
try in the next 60 seconds feels built for HVAC and I do not have to translate
generic "home services" copy into the realities of summer overflow weeks and
emergency no-heat calls.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: ticket 0017 proved the trade-specific
landing-page pattern for plumbers and shipped it on top of the existing
home-services demos. HVAC is the next-highest search-volume trade in the same
demo bucket (`/homeservices/demo/lead-responder` and
`/homeservices/demo/estimate` already serve HVAC workflows verbatim). Cloning
the `/ai-for-plumbers` pattern with HVAC-specific pains, schema, and CTAs
adds one route and zero new demos, prompts, or pricing.

### Stakeholder

This deepens the long-tail SEO moat where the strongest unpaid acquisition
leverage lives. "AI for HVAC" and "AI dispatcher HVAC" are low-competition,
high-intent query classes the umbrella `/homeservices` hub does not rank for
because its title targets the umbrella term. A trade-specific page carves
out an additional query class the product already serves end-to-end with
zero feature work. The pattern is repeatable for electrical, roofing, and
landscaping in future tickets, each as its own focused 200-line slice.

### Visitor (in the real moment of use)

A small-shop HVAC owner on a phone, mid-summer, reads a hero that says
"AI for HVAC contractors" and a sub-line that names their three real pains
(no-heat or no-AC emergency calls after hours, slow estimates on maintenance
plans and equipment swaps, missed review windows after a service call). They
see two demo cards that route to the existing home-services lead responder
and estimate demos pre-labeled for HVAC. One tap goes to a working demo;
one tap goes to existing pricing on `/homeservices`. No setup form blocks
the demo.

### Growth

The "show me" moment is the search result for "AI for HVAC" pointing at a
page that names HVAC in the title, H1, meta description, and demo card
labels, then routes the visitor to a real working tool in one tap. HVAC
contractor forums and trade subreddits share links specific to the trade;
a generic home-services URL does not earn that share. The same URL is
paste-friendly in a salesperson's follow-up to an HVAC prospect.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new `/ai-for-hvac` route renders a page whose Helmet-emitted `<title>`, H1, and meta description all explicitly name "HVAC" or "HVAC contractors," and whose body lists at least three HVAC-specific pain points (after-hours emergency calls, maintenance-plan and equipment-swap quoting, post-service review timing) using defensible language and no invented client names or numbers.
- [ ] The page surfaces two demo CTA cards that link to `/homeservices/demo/lead-responder` and `/homeservices/demo/estimate` (the existing home-services demos); both links resolve and `npm run check-links` stays green.
- [ ] The page emits one `BreadcrumbList` JSON-LD block (Home -> AI for HVAC) matching the pattern in `src/pages/AiForPlumbers.tsx`, and one `Service` JSON-LD whose `serviceType` mentions HVAC; both parse as valid JSON.
- [ ] The page renders the shared `Navbar` + `Footer` using `const { content } = useContent()` then `{content?.footer && <Footer data={content.footer} />}` (the ticket 0006 pattern), uses `Helmet` for title/description/canonical/OG, and the `/ai-for-hvac` URL appears in the generated sitemap because it is registered as a top-level `<Route path=...>` in `src/App.tsx`.
- [ ] The page renders in light and dark mode on a mobile viewport, contains no em-dash character in any copy, and `trackCTAClick` is fired on each demo CTA with a location label that includes "hvac" so the page's funnel is measurable in GA.
- [ ] No new hostnames, no `/api/` change, no new demo built; the page is composition of existing components plus copy.

## Out of scope

- Building any new demo, prompt, or estimate logic. This page reuses the
  existing home-services demos verbatim; their behavior is unchanged.
- Sibling landing pages for electrical, roofing, landscaping, or painters.
  Each trade gets its own focused ticket if this one earns its traffic.
- Editing the `/homeservices` hub page itself or its schema; that page
  keeps its umbrella positioning.
- Inventing testimonials, client names, or efficacy numbers; the page uses
  defensible market-context language only.
- Adding HVAC-specific pricing; the page links to the existing
  `/homeservices` pricing tiers.
- Personalizing the page by UTM or scraped company; UTM personalization is
  ticket 0001's lane and is out of scope here.
- Adding `/ai-for-hvac` to the `index.html` SEO Pilot `pages` table; that
  is its own SEO ticket. Helmet drives this page's head, and the e2e spec
  asserts that directly (see engineering notes).

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/AiForHvac.tsx` - model directly on
  `src/pages/AiForPlumbers.tsx` (shipped in ticket 0017). Reuse its
  structure: Helmet head + Navbar + ScrollProgress + hero + stats + three
  HVAC pain cards + two demo CTA cards routing to
  `/homeservices/demo/lead-responder` and `/homeservices/demo/estimate` +
  why-now block + final CTA + Footer + StickyCTA. Keep the BreadcrumbList
  JSON-LD pattern and a sibling `Service` schema with
  `serviceType: "AI Automation for HVAC Contractors"`.
- `src/App.tsx` - register `<Route path="/ai-for-hvac" element={<AiForHvac />} />`
  next to the existing `/ai-for-plumbers` route. The sitemap generator
  (`scripts/generate-sitemap.ts`) discovers routes from `path=` attributes
  in `App.tsx`, so the route picks up sitemap inclusion automatically.
- Footer wiring follows the ticket 0006 pattern exactly:
  `const { content } = useContent()` then
  `{content?.footer && <Footer data={content.footer} />}`. Do NOT use
  `const { data } = useContent()`; that is the bug ticket 0006 fixed.
- Per-route SEO Pilot table caveat: per the 2026-05-25 lesson in
  `docs/LESSONS.md`, routes not in the `index.html` SEO Pilot `pages`
  table do not have `document.title` driven by Helmet on SPA navigation.
  Assert the Helmet-managed head element directly (its
  `meta[name="description"]` content or its emitted JSON-LD strings) in
  the e2e spec, NOT `expect(page).toHaveTitle(...)`. Adding `/ai-for-hvac`
  to the SEO Pilot table is its own SEO concern, out of scope here.
- `tests/e2e/ai-for-hvac.spec.ts` - one spec per acceptance box: hero/H1
  naming check, Helmet-emitted meta description names HVAC, two demo CTA
  links resolve, BreadcrumbList + Service JSON-LD parse and contain the
  expected strings, footer renders, dark-mode render check, `trackCTAClick`
  fires with the hvac label. Mirror the assertion patterns in the existing
  `tests/e2e/ai-for-plumbers.spec.ts`.
- Per the 2026-05-22 two-PR lesson, ship will need a follow-up
  `chore/0020-ship-status` PR after the feat PR merges to flip the ticket
  frontmatter + README index row to `shipped` together. Do not skip the
  second PR; the ticket stays at `in-progress` until both land.
- New deps: no. Schema migration: no. Privacy/security surface change: no
  (same origin, no new hostnames, no data collected).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-05-28 - branch `feat/0020-ai-for-hvac-landing-page` opened
- YYYY-MM-DD - failing test added in `tests/e2e/ai-for-hvac.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
