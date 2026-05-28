---
id: 0021
title: Comparison page "Digital Craft vs Jobber" for high-intent home-services compares
status: in-progress
priority: P1
area: seo
created: 2026-05-28
owner: gtm-innovation
---

## User story

As a home-services owner (plumber, HVAC contractor, electrician) who already
uses Jobber and is Googling "Jobber AI" or "Jobber vs Digital Craft AI" to
see if there is a real AI alternative for after-hours call capture and
voice agents, I want one side-by-side page that compares the two products
on the features I actually shop for, so that I can decide in two minutes
whether Digital Craft is worth a 60-second demo without reading a sales
deck.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the comparison page pattern is
already proven across five existing pages
(`src/pages/compare/HubSpot.tsx`, `GoHighLevel.tsx`, `Zapier.tsx`,
`Make.tsx`, `Intercom.tsx`), each registered in `src/App.tsx` lines 261 to
265. A sixth comparison page modeled on `HubSpot.tsx` adds one route, one
file, and zero new components. Jobber is the dominant field-service CRM in
the home-services bucket where ticket 0017 (plumbers) and the proposed
0020 (HVAC) are funneling traffic; adding "vs Jobber" closes a high-intent
compare query class those landing pages do not own.

### Stakeholder

This widens the SEO moat in a query class where the buyer is already
spending money and looking for a reason to switch. Compare queries
("[competitor] vs [us]") are the highest-converting unpaid search type
because the visitor is at the bottom of the funnel by construction; they
already know they want the category. Each new compare page is a durable
moat asset (Google rewards a comparison page that exists over a Reddit
thread that doesn't). The shipped five compare pages prove the pattern
ranks; Jobber is the highest-leverage gap.

### Visitor (in the real moment of use)

A small-shop HVAC owner on a phone sees a clean feature table that
honestly lists what Jobber does that Digital Craft doesn't (built-in
field-service CRM, dispatching, invoicing in the same tool) AND what
Digital Craft does that Jobber doesn't (AI voice negotiation, AI lead
chat that books, 48-hour setup, industry-specific AI). The table is
defensible (no inflated "we win every row"), the differentiator cards
explain the four real wins, and the two CTAs route to `/homeservices`
pricing and `/homeservices/demo` so the visitor can test the claim in one
tap.

### Growth

The "show me" moment is the SERP listing for "Digital Craft vs Jobber"
displaying a real comparison page in the top results, where today there
is only Jobber's own marketing. Comparison pages get cited in trade-forum
threads ("anyone tried [vendor X] vs Jobber?") because they read as
neutral side-by-sides; that is the shareable artifact a generic
home-services landing page cannot earn.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new `/compare/jobber` route renders a comparison page whose Helmet-emitted `<title>` and meta description both explicitly name "Jobber" and "Digital Craft" (or "DigitalCraft AI"), and whose H1 names both products.
- [ ] The page renders a feature comparison table with at least 12 rows covering the categories already on `src/pages/compare/HubSpot.tsx` (AI Voice Calls, AI Lead Qualification, AI Estimate Generation, AI Review Management, industry specificity, setup time, pricing tiers, onboarding fee) with cell values that are defensible (no claim Jobber lacks a feature it ships, no inflated DCA claim like "500+"). At least three rows MUST honestly show Jobber winning where it actually wins (built-in field-service CRM, dispatching/scheduling, integrated invoicing).
- [ ] The page renders at least four differentiator cards mirroring the `DIFFERENTIATORS` array shape in `HubSpot.tsx` (icon + title + 2-3 sentence desc), each explaining one specific DCA advantage in defensible language with no em-dash character.
- [ ] The page renders the shared `Navbar` + `Footer` via `const { content } = useContent()` then `{content?.footer && <Footer data={content.footer} />}` (the ticket 0006 pattern), uses `Helmet` for title/description/canonical/OG, and is registered as a top-level `<Route path="/compare/jobber" element={<JobberComparison />} />` in `src/App.tsx` next to the other `/compare/*` routes so the sitemap generator picks it up automatically.
- [ ] The page emits one `BreadcrumbList` JSON-LD block (Home -> Compare -> Jobber) parsing as valid JSON with the same name appearing in the visible breadcrumb so the schema and visible labels share one source and cannot drift (per the 2026-05-25 mirror-source lesson in `docs/LESSONS.md`).
- [ ] The page renders in light and dark mode on a mobile viewport, the feature table is horizontally readable on a 375px viewport (existing `HubSpot.tsx` pattern uses an `overflow-x-auto` wrapper - mirror it), and `trackCTAClick` is fired on each visible CTA with a `compare_jobber_*` location label.
- [ ] No new hostnames, no `/api/` change, no new dependency, no new component file (page is single-file like the existing compare pages); the page is composition of existing components plus copy.

## Out of scope

- Sibling comparison pages for ServiceTitan, Housecall Pro, Workiz, or
  FieldEdge. Each is its own focused ticket if this one earns its traffic;
  shipping more than one compare page per ticket blows the 200-line diff
  budget.
- A dynamic data layer for compare-page rows (e.g. centralized JSON
  feeding every compare page). The five existing compare pages each
  inline their own `FEATURES` array; mirror that pattern rather than
  refactoring.
- Editing the existing five compare pages or their schema; this ticket
  adds one new page, it does not touch the others.
- Personalizing the page by UTM, scraped company, or vertical; UTM
  personalization is ticket 0001's lane and is out of scope here.
- Adding `/compare/jobber` to the `index.html` SEO Pilot `pages` table;
  that is its own SEO ticket. Helmet drives this page's head, and the
  e2e spec asserts that directly (see engineering notes).
- Naming any pricing number for Jobber that is not currently published on
  jobber.com or behind a sales gate; use defensible ranges and asterisk
  the source so the row stays accurate as Jobber's pricing moves.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/compare/Jobber.tsx` - model directly on
  `src/pages/compare/HubSpot.tsx` (the cleanest single-file compare page
  in the repo). Reuse its structure: imports + `FEATURES` array typed as
  `ComparisonRow[]` + `DIFFERENTIATORS` array + `CellIcon` helper + page
  body with Navbar + ScrollProgress + Helmet + hero + table + diff cards
  + CTA + Footer + StickyCTA. The `FEATURES` shape uses `dca` and
  competitor-name keys; rename the second key to `jobber` consistently.
- `src/App.tsx` - import `JobberComparison from "./pages/compare/Jobber"`
  next to the existing `import HubSpotComparison from "./pages/compare/HubSpot"`
  on line 53, then register `<Route path="/compare/jobber" element={<JobberComparison />} />`
  inside the `/compare/*` block at lines 261 to 265. The sitemap
  generator (`scripts/generate-sitemap.ts`) discovers routes from `path=`
  attributes, so the route picks up sitemap inclusion automatically. Note
  `getPriority()` already assigns `0.8` to `/compare/*` paths, no
  generator change is needed.
- Footer wiring follows the ticket 0006 pattern exactly:
  `const { content } = useContent()` then
  `{content?.footer && <Footer data={content.footer} />}`. Do NOT use
  `const { data } = useContent()`; that is the bug ticket 0006 fixed.
- BreadcrumbList JSON-LD: build a single typed `crumbs` array (visible
  markup and the JSON-LD block both read from it). This satisfies the
  2026-05-25 mirror-source lesson: if a future copy edit changes
  "Compare" to "Compare Products" in the visible crumb, the schema
  follows automatically and there is no drift. Use the inline
  `<script type="application/ld+json">` pattern from
  `src/pages/AiForPlumbers.tsx`.
- Per-route SEO Pilot table caveat: per the 2026-05-25 SEO Pilot lesson
  in `docs/LESSONS.md`, routes not in the `index.html` `pages` table do
  not have `document.title` driven by Helmet on SPA navigation. Assert
  the Helmet-managed head element directly (its `meta[name="description"]`
  content, its emitted JSON-LD strings, or the visible H1 text) in the
  e2e spec, NOT `expect(page).toHaveTitle(...)`. Adding `/compare/jobber`
  to the SEO Pilot table is its own SEO concern, out of scope here.
- Em-dash check (per the 2026-05-07 Hard NO and the 2026-05-25 mirror-
  source lesson): the existing `HubSpot.tsx` has em-dashes in its
  `DIFFERENTIATORS` desc strings and in the `Setup Time` row value
  ("2-6 weeks" rendered with em-dash). Self-Review must grep the new
  `Jobber.tsx` diff for the em-dash character before pushing, and use
  hyphens (`-`) or restructure. Do NOT carry an em-dash forward by
  copy-paste from `HubSpot.tsx`.
- `tests/e2e/compare-jobber.spec.ts` - one spec per acceptance box:
  Helmet-emitted meta description names Jobber and DCA, at least 12
  feature-table rows render, at least 3 rows show Jobber winning, at
  least 4 differentiator cards render, BreadcrumbList JSON-LD parses
  with the expected names, footer renders, dark-mode render check on a
  375px viewport, the rendered DOM contains no em-dash character, and
  `trackCTAClick` fires with the compare_jobber location label.
- Per the 2026-05-22 two-PR lesson, ship will need a follow-up
  `chore/0021-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter + README index row to `shipped` together. Do not
  skip the second PR.
- New deps: no. Schema migration: no. Privacy/security surface change: no
  (same origin, no new hostnames, no data collected).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-05-28 - branch `feat/0021-compare-jobber` opened, status flipped to in-progress
- 2026-05-28 - new compare page `src/pages/compare/Jobber.tsx`, route registered in `src/App.tsx`, e2e spec `tests/e2e/compare-jobber.spec.ts` added
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
