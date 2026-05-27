---
id: 0019
title: Visible breadcrumbs and BreadcrumbList JSON-LD on every demo page
status: in-progress
priority: P2
area: conversion
created: 2026-05-26
owner: gtm-innovation
---

## User story

As a visitor who deep-linked into `/construction/demo/voice-negotiator` from a
shared link, social card, or Google result, I want a small breadcrumb at the
top of the demo page that names where I am (Construction > Demos > Voice
Negotiator) and lets me jump back one level with one tap, so that I do not
feel dropped in mid-app and I can explore the other demos in this vertical
without hunting the navbar.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the demo route tree is uniform and
already three levels deep
(`/{vertical}/demo/{slug}`) across 12 verticals and ~40 demo pages. A single
reusable `DemoBreadcrumbs` component derived from `useLocation()` can label
itself from the route segments and emit a `BreadcrumbList` JSON-LD block,
applied once per demo page. No new copy, no per-demo bespoke wiring, no
route changes.

### Stakeholder

This widens both the conversion and SEO moats off one component. On the SEO
side, every demo route gains the structured breadcrumb that Google uses to
render the path in search results (replacing the bare URL slug with named
crumbs), which lifts CTR on the long tail of demo-named queries. On the
conversion side, the visible breadcrumb is a one-tap path back to the demo
hub, where ticket 0010's resume prompt and the full set of sibling demos
live; today a deep-link visitor has no in-page lateral mobility and either
uses the navbar or bounces.

### Visitor (in the real moment of use)

A contractor opens a shared link to the voice-negotiator demo on their phone.
At the top of the page, under the navbar, they see "Construction / Demos /
Voice Negotiator" with the first two segments tappable. One tap takes them
to the demo hub for their vertical; one tap from there takes them to any
sibling demo. The breadcrumb is small, quiet, and stays out of the way of
the demo itself.

### Growth

The "show me" moment is the SERP listing for a demo deep-link that displays
"Construction > Demos > Voice Negotiator" instead of the raw URL slug, plus
the sibling-demo discovery a deep-link visitor gets in the live page that
they did not get before. Both are durable: every new demo route added in
the future inherits the breadcrumb and the schema for free.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new reusable `DemoBreadcrumbs` component renders, on every `/{vertical}/demo/{slug}` route, a visible breadcrumb whose three crumbs are: the vertical hub (e.g. "Construction" -> `/construction`), the demo hub (e.g. "Demos" -> `/construction/demo`), and the current demo named in title case derived from the slug (e.g. "voice-negotiator" -> "Voice Negotiator").
- [ ] The same component emits one `BreadcrumbList` JSON-LD block per page whose `itemListElement` array exactly mirrors the visible crumbs (same names, absolute URLs on `digitalcraftai.com`), parsing as valid JSON with no em-dash; the schema and visible labels share one source so they cannot drift.
- [ ] Tapping the first crumb navigates to the vertical hub and the second crumb to the demo hub; both navigations are SPA-internal `<Link>` clicks (no full reload) and `npm run check-links` stays green for every emitted URL.
- [ ] The component is mounted on at least the four highest-traffic demos as a starter set (`/construction/demo/lead-responder`, `/construction/demo/estimate`, `/construction/demo/voice-negotiator`, `/realestate/demo/property-negotiator`) and on the demo hubs for those two verticals; on routes where it is not yet mounted (other demos), no regression in their existing render (this is a placement, not a rewrite, ticket).
- [ ] The breadcrumb renders in light and dark mode on a mobile viewport, sits above the existing first content block without overlapping the navbar, and does not appear on non-demo routes (regression check: `/`, `/construction`, `/glossary`, `/demos` show no breadcrumb from this component).
- [ ] No new hostnames, no `/api/` change, no analytics removal; `npm run check-meta` and `node scripts/check-backlog.mjs` stay green.

## Out of scope

- Mounting the component on every demo route in the same PR. The starter
  set above (six routes) proves the pattern; a follow-up ticket fans it out
  across the remaining ~35 demo pages once the placement is validated. This
  keeps the diff inside the 200-line budget.
- A site-wide breadcrumb component for non-demo routes (Glossary, Industries,
  Compare pages, location pages). Those pages already emit their own
  BreadcrumbList JSON-LD via inline blocks (see `src/pages/locations/Texas.tsx`
  and `src/pages/case-studies/CaseStudy.tsx`); unifying them is its own
  refactor ticket.
- Changing the demo hub or any demo's existing content, behavior, or layout.
- Adding the breadcrumb to the SEO Pilot `pages` table in `index.html`; this
  ticket adds Helmet/inline JSON-LD, not per-route title overrides.
- Personalizing breadcrumb labels by the scraped company name; the crumbs
  use the static vertical and demo names so they match the URL exactly.

## Engineering notes

Files / patterns the dev should touch.

- New `src/components/DemoBreadcrumbs.tsx` - reads `useLocation()` from
  react-router, splits the pathname on `/`, and asserts the shape is
  `['', vertical, 'demo', slug?]`; if not, renders nothing (regression
  safety for non-demo routes). Build a typed map of `vertical -> Display Name`
  for the 12 known verticals (construction, realestate, events, homeservices,
  healthcare, legal, restaurant, kidsplay, fitness, dental, salon, autorepair)
  so the first crumb is correctly named; the demo title comes from a small
  slug-to-title helper (split on hyphens, title-case each segment) so any
  future demo gets a sane label for free without per-demo wiring.
- Emit the JSON-LD as an inline `<script type="application/ld+json">` built
  from the same crumb array used for the visible markup (one source, no
  drift). Follow the pattern in `src/pages/locations/Texas.tsx` lines 80 to 92.
- Mount the component near the top of the page body (below `Navbar`, above
  the first content section) in:
  - `src/pages/construction/LeadResponder.tsx` (or the shared
    `src/pages/.../LeadResponder.tsx` component if the route table reuses
    one - check `src/App.tsx` imports before editing)
  - `src/pages/construction/EstimateGenerator.tsx`
  - `src/pages/construction/VoiceNegotiator.tsx`
  - `src/pages/realestate/PropertyNegotiator.tsx`
  - `src/pages/construction/DemoHub.tsx`
  - `src/pages/realestate/RealEstateDemoHub.tsx`
- Verify the route table in `src/App.tsx` lines 189 to 254 to confirm each
  mounted route resolves to the file you edited (several demos in `App.tsx`
  reuse `LeadResponder` / `EstimateGenerator` / `VoiceNegotiator` across
  multiple verticals; mounting in the shared component automatically covers
  more verticals than the starter set lists, which is fine and is the point).
- Use `<Link>` from react-router (not raw `<a>`) for the tappable crumbs to
  keep SPA navigation; style crumbs with the project's standard muted-text
  Tailwind tokens (`text-gray-500 dark:text-gray-400`) and a chevron or `/`
  separator that matches existing breadcrumbs (see Texas.tsx visible
  breadcrumb markup for the styling reference).
- `tests/e2e/demo-breadcrumbs.spec.ts` - one spec per acceptance box: visible
  crumb text on each of the four starter demos, BreadcrumbList JSON-LD parses
  with the expected names and absolute URLs, SPA navigation on click, no
  breadcrumb on `/`, `/glossary`, `/demos`, dark-mode render check.
- New deps: no. Schema migration: no. Privacy/security surface change: no
  (same origin, head-level JSON only, no data collected).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-05-27 - branch `feat/0019-demo-breadcrumbs-jsonld` opened off origin/main; ticket flipped to in-progress with README index in sync.
