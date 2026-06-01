---
id: 0028
title: Comparison page "Digital Craft vs ServiceTitan" for high-intent field-service compares
status: groomed
priority: P1
area: seo
created: 2026-06-01
owner: gtm-innovation
---

## User story

As a home-services owner (HVAC contractor, plumber, electrician, roofer)
who already pays for ServiceTitan or is evaluating it against newer AI
options and is Googling "ServiceTitan AI," "ServiceTitan alternative,"
or "ServiceTitan vs Digital Craft AI," I want one side-by-side page
that compares the two products on the features I actually shop for
(AI voice calls, AI lead chat, setup speed, monthly cost), so that I
can decide in two minutes whether Digital Craft is worth a 60-second
demo without sitting through a ServiceTitan sales pitch.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the comparison page pattern is
already proven across six existing pages
(`src/pages/compare/{HubSpot,GoHighLevel,Zapier,Make,Intercom,Jobber}.tsx`),
all registered in `src/App.tsx` under the `/compare/*` block. A
seventh comparison page modeled on `Jobber.tsx` (ticket 0021, the
most recent and the closest peer in the field-service category) adds
one route, one file, and zero new components. ServiceTitan is the
highest-ARPU field-service CRM in the home-services bucket where
tickets 0017 (plumbers), 0020 (HVAC), and 0024 (roofers) are
funneling traffic; adding "vs ServiceTitan" closes a high-intent
compare query class those landing pages do not own.

### Stakeholder

This widens the SEO moat in a query class where the buyer is already
spending serious money (ServiceTitan deals start around the high
3-figure monthly range) and actively looking for a reason to switch
or supplement. Compare queries (`[competitor] vs [us]`) are the
highest-converting unpaid search type because the visitor is at the
bottom of the funnel by construction; they already know they want
the category. Ticket 0021 (vs Jobber) shipped the pattern; ticket
0028 carves out the next-highest-leverage gap before someone else
writes the comparison page for us.

### Visitor (in the real moment of use)

A 12-truck HVAC operator on a phone reads a clean side-by-side
table that honestly lists what ServiceTitan does that Digital Craft
does not (mature field-service CRM, dispatching, integrated payments,
deep accounting integrations) AND what Digital Craft does that
ServiceTitan does not at the same price point (live AI voice
negotiation that books, AI lead chat fully trained on the prospect's
own scraped website, 48-hour setup, no implementation fee). The
table is defensible (no inflated "we win every row," asterisked
source on any moving ServiceTitan claim), the differentiator cards
explain the four real wins, and the two CTAs route to `/homeservices`
pricing and `/homeservices/demo` so the visitor can test the claim
in one tap.

### Growth

The "show me" moment is the SERP listing for "ServiceTitan vs Digital
Craft AI" displaying a real comparison page in the top results, where
today there is only ServiceTitan's own marketing and a handful of
Reddit threads. Comparison pages get cited in trade-forum threads
("anyone tried [vendor X] vs ServiceTitan?") because they read as
neutral side-by-sides; that is the shareable artifact a generic
home-services landing page cannot earn. Each card click fires
`trackCTAClick` with a `compare_servicetitan_*` location label so
the funnel is measurable in GA independently of the Jobber page.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new `/compare/servicetitan` route renders a comparison page whose Helmet-emitted `<title>` and meta description both explicitly name "ServiceTitan" and "Digital Craft" (or "DigitalCraft AI"), and whose H1 names both products.
- [ ] The page renders a feature comparison table with at least 12 rows covering the same category set as `src/pages/compare/Jobber.tsx` (AI Voice Calls, AI Lead Qualification, AI Estimate Generation, AI Review Management, industry specificity, setup time, pricing tiers, onboarding fee) with cell values that are defensible (no claim ServiceTitan lacks a feature it ships, no inflated DCA claim like "500+"). At least three rows MUST honestly show ServiceTitan winning where it actually wins (built-in field-service CRM with dispatching, integrated payments, deep QuickBooks/accounting integrations).
- [ ] The page renders at least four differentiator cards mirroring the `DIFFERENTIATORS` array shape in `src/pages/compare/Jobber.tsx` (icon + title + 2-3 sentence desc), each explaining one specific DCA advantage in defensible language with no em-dash character.
- [ ] The page renders the shared `Navbar` + `Footer` via `const { content } = useContent()` then `{content?.footer && <Footer data={content.footer} />}` (the ticket 0006 pattern), uses `Helmet` for title/description/canonical/OG, and is registered as a top-level `<Route path="/compare/servicetitan" element={<ServiceTitanComparison />} />` in `src/App.tsx` next to the other `/compare/*` routes so the sitemap generator picks it up automatically.
- [ ] The page emits one `BreadcrumbList` JSON-LD block (Home -> Compare -> ServiceTitan) parsing as valid JSON with the same names appearing in the visible breadcrumb. Per the 2026-05-25 mirror-source lesson, the visible markup and the JSON-LD block both read from one typed `crumbs` array so a future copy edit cannot create drift.
- [ ] The page renders in light and dark mode on a 375px mobile viewport, the feature table is horizontally readable via the same `overflow-x-auto` wrapper as `Jobber.tsx`, and `trackCTAClick` is fired on each visible CTA with a `compare_servicetitan_*` location label.
- [ ] No new hostnames, no `/api/` change, no new dependency, no new component file (page is single-file like the existing compare pages); the page is composition of existing components plus copy. `node scripts/check-backlog.mjs` and `npm run check-links` stay green.

## Out of scope

- Sibling comparison pages for Housecall Pro, Workiz, FieldEdge, or
  BuilderTrend. Each is its own focused ticket if this one earns its
  traffic; shipping more than one compare page per ticket blows the
  200-line diff budget.
- A dynamic data layer for compare-page rows (e.g. centralized JSON
  feeding every compare page). The seven existing compare pages each
  inline their own `FEATURES` array; mirror that pattern rather than
  refactoring.
- Editing the existing six compare pages or their schema; this
  ticket adds one new page, it does not touch the others.
- Personalizing the page by UTM, scraped company, or vertical; UTM
  personalization is ticket 0001's lane and is out of scope here.
- Adding `/compare/servicetitan` to the `index.html` SEO Pilot
  `pages` table; that is its own SEO ticket. Helmet drives this
  page's head, and the e2e spec asserts that directly (see
  engineering notes).
- Naming any ServiceTitan pricing number that is not currently
  published on servicetitan.com or behind a sales gate; use
  defensible ranges and asterisk the source so the row stays
  accurate as ServiceTitan's pricing moves. Specifically, do NOT
  fabricate a per-seat monthly number; cite "starts in the high
  3-figure monthly range, custom-quoted" with an asterisked source
  note.
- Inventing testimonials or named ServiceTitan customers. The
  AGENTS.md Hard NO covers it; the row about "industry specificity"
  cites public ServiceTitan vertical pages, not testimonials.
- Adding a `Service` or `Product` JSON-LD block. The existing
  `BreadcrumbList` is enough; adding more structured data invites
  the 2026-05-30 "second @type instance" risk and is out of scope.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/compare/ServiceTitan.tsx` - model directly on
  `src/pages/compare/Jobber.tsx` (the cleanest and most recent
  single-file compare page in the repo). Reuse its structure:
  imports + `FEATURES` array typed as `ComparisonRow[]` +
  `DIFFERENTIATORS` array + `CellIcon` helper + page body with
  Navbar + ScrollProgress + Helmet + hero + table + diff cards +
  CTA + Footer + StickyCTA. The `FEATURES` shape uses `dca` and
  competitor-name keys; rename the second key to `servicetitan`
  consistently.
- `src/App.tsx` - import `ServiceTitanComparison from "./pages/compare/ServiceTitan"`
  next to the existing `import JobberComparison from "./pages/compare/Jobber"`,
  then register `<Route path="/compare/servicetitan" element={<ServiceTitanComparison />} />`
  inside the `/compare/*` block. The sitemap generator
  (`scripts/generate-sitemap.ts`) discovers routes from `path=`
  attributes, so the route picks up sitemap inclusion automatically
  and `getPriority()` already assigns `0.8` to `/compare/*`.
- Footer wiring follows the ticket 0006 pattern exactly:
  `const { content } = useContent()` then
  `{content?.footer && <Footer data={content.footer} />}`. Do NOT
  use `const { data } = useContent()`; that is the bug ticket 0006
  fixed.
- BreadcrumbList JSON-LD: build a single typed `crumbs` array
  (visible markup and the JSON-LD block both read from it). This
  satisfies the 2026-05-25 mirror-source lesson: if a future copy
  edit changes "Compare" to "Compare Products" in the visible crumb,
  the schema follows automatically and there is no drift. Use the
  inline `<script type="application/ld+json">` pattern from
  `src/pages/compare/Jobber.tsx`.
- Per-route SEO Pilot table caveat: per the 2026-05-25 SEO Pilot
  lesson in `docs/LESSONS.md`, routes not in the `index.html`
  `pages` table do not have `document.title` driven by Helmet on
  SPA navigation. Assert the Helmet-managed head element directly
  (its `meta[name="description"]` content, its emitted JSON-LD
  strings, or the visible H1 text) in the e2e spec, NOT
  `expect(page).toHaveTitle(...)`. Adding `/compare/servicetitan`
  to the SEO Pilot table is its own SEO concern, out of scope here.
- Em-dash check (per the 2026-05-07 Hard NO and the 2026-05-25
  mirror-source lesson): grep the new `ServiceTitan.tsx` diff for
  the em-dash character before pushing, and use hyphens (`-`) or
  restructure. Do NOT carry an em-dash forward by copy-paste from
  any neighbor file; the Jobber page was already cleaned, but any
  earlier compare page (e.g. `HubSpot.tsx`) may still carry em-
  dashes in its `DIFFERENTIATORS` desc strings.
- Per the 2026-05-30 "second @type instance" lesson: this ticket
  emits only `BreadcrumbList`, the same `@type` already on six
  other `/compare/*` pages. Before writing code, grep
  `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'` and any
  "exactly one" / `toHaveLength(1)` predicate that scopes to the
  set of `/compare/*` pages. If a predecessor spec hardcodes the
  list of compare routes (e.g. ticket 0019's breadcrumb spec),
  add `/compare/servicetitan` to that list in the same PR so the
  predecessor test does not red on the new sibling. Do NOT ship a
  knowingly-red sibling test.
- `tests/e2e/compare-servicetitan.spec.ts` - one spec per
  acceptance box: Helmet-emitted meta description names
  ServiceTitan and DCA, at least 12 feature-table rows render,
  at least 3 rows show ServiceTitan winning, at least 4
  differentiator cards render, BreadcrumbList JSON-LD parses with
  the expected names, footer renders, dark-mode render check on
  a 375px viewport, the rendered DOM contains no em-dash
  character, and `trackCTAClick` fires with the
  compare_servicetitan location label.
- Per the 2026-05-22 two-PR ship lesson, ship will need a
  follow-up `chore/0028-ship-status` PR after the feat PR merges
  to flip the ticket frontmatter AND its `docs/backlog/README.md`
  index row to `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing the second PR
  so the file and index never drift mid-flip.
- New deps: no. Schema migration: no. Privacy/security surface
  change: no (same origin, no new hostnames, no data collected).
  Per the AGENTS.md Hard NO, this ticket does not touch `/api/`,
  `.env*`, `package.json`, or `package-lock.json`.

## Implementation log

(Appended by the implementation-dev agent during execution.)
