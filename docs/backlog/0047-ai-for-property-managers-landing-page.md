---
id: 0047
title: AI-for-property-managers long-tail landing page funneling into real-estate demos
status: shipped
priority: P1
area: content
created: 2026-06-11
owner: gtm-innovation
---

## User story

As a residential property-management-company principal or asset
manager (running 50 to 500 doors across single-family rentals,
small multifamily, or HOA buildings) Googling "AI for property
managers," "AI tenant chat," "AI maintenance triage," or
"property management AI assistant" on a phone between unit
turnovers, I want one honest landing page that shows me two
live demos already wired to property-management workflows
(tenant lead chat for vacancy inquiries and AI voice follow-up
for renewal conversations), without a signup, so that I can
decide in 60 seconds whether the product is worth a strategy
call instead of bouncing on the existing `/realestate` page that
centers on agent / investor deal analysis and does not name my
recurring-revenue workflow at all.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the long-tail trade-page
pattern is now proven across SIX shipped pages
(`src/pages/AiForPlumbers.tsx` ticket 0017,
`AiForHvac.tsx` ticket 0020, `AiForRoofers.tsx` ticket 0024,
`AiForElectricians.tsx` ticket 0034, `AiForPainters.tsx`
ticket 0037, `AiForLandscapers.tsx` ticket 0041). All six
funnel into `/homeservices/demo/*` because the buyer is a
trade. Property managers are a STRUCTURALLY different ICP: they
are not a trade, they have recurring revenue, their lead profile
is tenants and owners rather than residential homeowners, and
their existing route in `ROUTES` is `/realestate/demo/lead-responder`
and `/realestate/demo/voice-negotiator` (not the homeservices
demos). One new page, one new route, zero new demo, zero new
backend, ~280 lines of diff. The page intentionally funnels into
`/realestate/demo/*` to reuse the two existing real-estate-
calibrated demos rather than spawning a third demo family.

### Stakeholder

This widens the SEO moat in a query class no existing page
covers. The `/realestate` vertical page centers on agents and
investors (deal analysis, comps, seller outreach); property
managers Googling "AI for property management" today land
either on Buildium / AppFolio marketing (the incumbents) or on
generic SaaS articles, and bounce. Property management is also
the highest-LTV ICP the site has access to without a new demo
build: a 200-door manager who buys a service contract is worth
materially more in annual revenue than a 6-truck plumbing
contractor (per public-source operator margins), so the cost
per qualified call clears the bar comfortably with a fraction
of the volume. The page is also the first non-trade long-tail
landing page in the family, which makes it the test of whether
the pattern generalizes outside home services - a small
strategic moat-deepening move beyond just adding a seventh trade
page.

### Visitor (in the real moment of use)

A principal of a 120-door single-family rental management
company Googles "AI for property managers" between two unit
turnovers on a phone. The SERP listing surfaces `/ai-for-property-managers`
with a description that names the three property-management
pain points (after-hours leasing inquiries on weekends, slow
maintenance-request triage that drives one-star reviews,
renewal-conversation drop-off in the 30-day window). One tap on
the hero CTA opens the live `/realestate/demo/lead-responder`
already qualifying tenant inquiries against a property-manager-
flavored intent prompt. No signup, no credit card, the visitor
sees an AI agent triaging a "is the 3-bed at 1247 Maple still
available?" inbound in under 60 seconds. Light and dark mode
supported; the page reads cleanly on a 375px viewport.

### Growth

The "show me" moment is the SERP listing for "AI for property
managers" or "AI tenant chat" returning a real ICP-specific
landing page where today only Buildium / AppFolio marketing,
the BiggerPockets forum, and a handful of generic SaaS articles
rank. Each CTA click fires `trackCTAClick` with a
`propertymanagers_*` location label so the funnel is measurable
in GA independently of the six trade pages. A returning
property-management principal who books a strategy call after
landing here is the cheapest qualified call the funnel can
produce in this ICP; the page itself is shareable in a property-
management Slack or a NARPM-adjacent forum thread because the
pains read as an actual operator wrote them (no invented
testimonials, no efficacy percentages the page cannot back).

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/AiForPropertyManagers.tsx` (new file, under 330 lines) renders at `/ai-for-property-managers`, modeled 1:1 on `src/pages/AiForLandscapers.tsx` (ticket 0041, the most recent peer). The page has a hero with a property-management-specific H1, three pain-point cards (after-hours leasing inquiries on weekends, slow maintenance-request triage that drives one-star reviews, renewal-conversation drop-off in the 30-day window), a STATS row, two demo cards routing to `/realestate/demo/lead-responder` and `/realestate/demo/voice-negotiator` (NOT the homeservices demos used by the six trade pages), and a single CTA section. Every claim is defensible: no invented client names, no fabricated efficacy percentages, no LTV / cap-rate figures the page cannot back from publicly-sourced industry medians named in an HTML comment per the 2026-05-25 mirror-source-fix rule.
- [ ] The page emits TWO JSON-LD blocks inside the existing `<Helmet>` head: (1) a `BreadcrumbList` (Home -> AI for Property Managers) using the same shape as `AiForLandscapers.tsx` `BREADCRUMB_SCHEMA`, and (2) a sibling `Service` block with `@type: 'Service'`, `name: 'AI for Property Managers'`, `serviceType: 'AI Automation for Property Management Companies'`, `areaServed: { '@type': 'Country', name: 'United States' }`, `provider` pointing to the DigitalCraft Organization, and `description` mirroring the page's `META_DESCRIPTION` constant (per the 2026-05-25 mirror-source rule).
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/*-jsonld.spec.ts` AND every existing `tests/e2e/ai-for-*.spec.ts` for `=== 'BreadcrumbList'` AND `=== 'Service'` predicates to confirm no existing spec asserts "exactly one BreadcrumbList block site-wide" or "exactly one Service block site-wide." The grep result is documented in the Implementation log. The six existing trade-page specs each assert per-URL scoped BreadcrumbList and Service blocks per the ticket 0041 Implementation log, so the collision risk is structurally low, but the grep is mandatory.
- [ ] The new route is registered in `src/App.tsx` next to the existing `/ai-for-landscapers` route. The implementer adds `/ai-for-property-managers` to the `ROUTES` array in `src/data/routes.ts` (the canonical allow-list per the 2026-06-07 src-imports-tests lesson). The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in any JSON-LD serialized string, and every CTA route resolves to a registered route in `src/data/routes.ts`. The two primary CTAs route to `/realestate/demo/lead-responder` and `/realestate/demo/voice-negotiator`; the calendly CTA opens in a new tab with `rel="noopener noreferrer"` matching the existing trade-page convention.
- [ ] A new e2e spec at `tests/e2e/ai-for-property-managers.spec.ts` (modeled on `tests/e2e/ai-for-landscapers.spec.ts`) asserts: the page returns < 400 status, the H1 contains "Property Manager" (case-insensitive substring), the `meta[name="description"]` content names "property manager" (asserted on the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson), the `BreadcrumbList` JSON-LD block names "AI for Property Managers" as the second item, the `Service` JSON-LD block carries `serviceType` containing "Property Management," both demo CTAs resolve to `/realestate/demo/*` routes registered in `ROUTES` (NOT `/homeservices/demo/*` - this is the structural difference from the six trade pages and the regression check), the page text contains no `U+2014` code point, and dark mode renders cleanly.
- [ ] No `/api/` change, no new hostname (the only external link is the existing `calendly.com/mutaaf` URL already used on every trade page), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the existing six trade pages or their specs, no edits to `src/pages/RealEstate.tsx` or to any `/realestate/demo/*` page. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; every pre-existing `tests/e2e/ai-for-*.spec.ts` and the realestate demo specs stay green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A property-management-specific demo (e.g. a maintenance-
  triage-only intake variant, a rent-collection reminder
  sequence). The page reuses the two existing real-estate
  demos verbatim; a property-management-specific demo is a
  separate ticket and not justified before the page proves
  demand.
- Adding `/ai-for-property-managers` to the `index.html` SEO
  Pilot `pages` table. That is its own SEO-hygiene ticket and
  applies uniformly to all six trade pages plus this one, none
  of which are in the table per the 2026-05-25 SEO Pilot
  lesson. Out of scope here.
- Emitting a `FAQPage` JSON-LD on this page. None of the six
  trade pages emit one and the page does not yet have a
  visible FAQ section to mirror; adding both at once would
  exceed the 200-line diff budget. Out of scope here.
- A "Switch from Buildium" or "vs AppFolio" callout on the
  page. Comparison pages own that funnel; the ticket-0042
  precedent says each comparison page is its own ticket.
- Internationalization (`inLanguage` fields on schema, locale
  switcher). The page is English-only; an i18n pass is a
  separate cross-cutting ticket.
- A property-management blog post. Blog content ships through
  the existing `src/data/blogPosts.ts` pipeline and is gated
  by `check-blog-dates`; a property-management-themed post is
  its own content ticket.
- Cross-linking the new page from `/realestate` or from the
  existing six trade pages. Internal-link clusters are their
  own small ticket once the page exists and ranks.
- An HOA-specific or commercial-property-specific variant. The
  page intentionally centers on residential single-family /
  small-multifamily managers because that segment has the
  highest unpaid search volume; an HOA or commercial variant
  is a separate ticket if telemetry justifies it.
- A property-management-specific testimonial or case study.
  The AGENTS.md Hard NO on invented testimonials applies; a
  real testimonial ships through its own dated blog post via
  the existing pipeline once a real property-management client
  agrees to attribution.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/AiForPropertyManagers.tsx` (under 330 lines).
  Copy `src/pages/AiForLandscapers.tsx` (ticket 0041) end-to-
  end as the starting frame, then swap every "Landscap" string
  for the property-management equivalent. Keep the same module-
  level mirror-source constants: `HERO_H1`, `META_DESCRIPTION`,
  `SERVICE_DESCRIPTION` (per the 2026-05-25 mirror-source rule
  the description used in the Helmet meta tag and the
  `SERVICE_SCHEMA.description` MUST be the same
  `META_DESCRIPTION` constant). Swap the three `PAIN_POINTS`
  entries to the three property-management-specific pains
  named in the User story. Swap the two `DEMO_CARDS` entries
  copy to property-management language but route the `to:`
  paths to `/realestate/demo/lead-responder` and
  `/realestate/demo/voice-negotiator` - this is the structural
  difference from the six trade pages (which route to
  `/homeservices/demo/*`). Swap `STATS` labels to property-
  management context (after-hours and weekend leasing inquiry
  capture, average AI reply time, demos calibrated for
  property management, time-from-signup-to-go-live) but keep
  the four numeric values unchanged so the family stays self-
  consistent. Trade label for the icon chip reads exactly
  "Built for property management companies."
- New route in `src/App.tsx`: import `AiForPropertyManagers`
  and add
  `<Route path="/ai-for-property-managers" element={<AiForPropertyManagers />} />`
  next to the `/ai-for-landscapers` route. Mirror the lazy-
  loading convention of the adjacent trade pages (per ticket
  0041 the existing trade pages are not lazy-loaded, so the
  new page should match).
- Per the 2026-06-07 src-imports-tests lesson, add
  `/ai-for-property-managers` to the `ROUTES` array in
  `src/data/routes.ts` (the canonical allow-list); do NOT add
  it directly to `tests/e2e/routes.ts`. The re-export picks it
  up automatically.
- Per the 2026-05-30 second-@type lesson, grep
  `tests/e2e/*-jsonld.spec.ts` and `tests/e2e/ai-for-*.spec.ts`
  for both `=== 'BreadcrumbList'` and `=== 'Service'`
  predicates BEFORE writing code. Confirm no spec asserts
  "exactly one of either @type site-wide" (the existing
  patterns are per-URL scoped per the ticket 0041
  Implementation log). Document the grep result in the
  Implementation log so the deviation, if any, is auditable.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e spec
  asserts the Helmet-managed `meta[name="description"]`
  content directly (LAST `meta[name="description"]` element
  per the 2026-05-25 Helmet-appends lesson), NOT
  `page.toHaveTitle()`. The route is not in the `index.html`
  SEO Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every string in the page
  module (the H1, the META_DESCRIPTION, the SERVICE_DESCRIPTION,
  the three pain-point titles and descs, the two demo-card
  titles and descs, the STATS labels, the JSON-LD strings, the
  CTA labels, the footer disclaimer) uses hyphens. Self-Review
  greps the diff for `String.fromCharCode(8212)` before
  pushing.
- `tests/e2e/ai-for-property-managers.spec.ts` (new) - one
  spec per acceptance box. Model end-to-end on
  `tests/e2e/ai-for-landscapers.spec.ts` (the most recent peer).
  CTA case: locate the two demo-card CTAs via
  `data-testid="propertymanagers-demo-cta"` (added to the CTA
  anchors in the new page) and assert each `href` resolves to
  a `/realestate/demo/*` path present in the `ROUTES` array
  imported from `tests/e2e/routes.ts`. This is the explicit
  regression check that prevents accidental copy-paste of the
  homeservices route from the six trade pages.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, and the existing
  `useContent` hook plus `trackCTAClick` helper. Schema
  migration: no. Privacy/security surface change: no - the
  page is static marketing copy and emits no new network
  calls; the only external link is the existing calendly URL
  already disclosed on `/trust` per ticket 0018.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-06-11 - branch `feat/0047-ai-for-property-managers` opened off `origin/main`; ticket flipped from `groomed` to `in-progress` (frontmatter + README index row in the same commit per the 2026-05-22 two-PR lesson).
- 2026-06-11 - 2026-05-30 second-@type grep (mandatory): ran `Grep === 'BreadcrumbList'` and `Grep === 'Service'` across `tests/e2e/*-jsonld.spec.ts` and `tests/e2e/ai-for-*.spec.ts`. Result: every "exactly one BreadcrumbList" predicate is scoped per-URL (e.g., `'exactly one BreadcrumbList block expected on /quiz'`, `on /trust`, `on /changelog`, `on /compare/*`) or lives inside a per-URL `goto`-scoped file (`ai-for-plumbers`, `ai-for-hvac`, `ai-for-roofers`, `ai-for-electricians`, `ai-for-painters`, `ai-for-landscapers`). No spec asserts "exactly one BreadcrumbList block site-wide" and NO spec contains any "exactly one Service" predicate at all. Collision risk for adding a 7th per-URL `BreadcrumbList` + `Service` pair on `/ai-for-property-managers` is structurally zero.
- 2026-06-11 - failing tests added in `tests/e2e/ai-for-property-managers.spec.ts`
- 2026-06-11 - PR #N opened, CI [state]
- 2026-06-11 - merged to main
