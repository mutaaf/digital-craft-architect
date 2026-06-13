---
id: 0050
title: AI-for-cleaning-services long-tail landing page funneling into home-services demos
status: groomed
priority: P1
area: content
created: 2026-06-13
owner: gtm-innovation
---

## User story

As a residential cleaning company owner (a 4-team house-cleaning
business, a move-out cleaning specialist, or a small
janitorial / commercial cleaning shop with 8 to 30 staff)
Googling "AI for cleaning business," "AI for house cleaners,"
"AI booking assistant for cleaning company," or "AI quote tool
maid service" on a phone between scheduled appointments, I
want one honest landing page that shows me two live demos
already wired to cleaning-service workflows (instant inquiry
qualification for residential and recurring-clean requests
plus on-site quote generation for move-out and deep-clean
jobs), without a signup, so that I can decide in 60 seconds
whether AI answering is worth a strategy call instead of
bouncing on the homepage that does not name my recurring-
revenue clean schedule, my crew dispatch reality, or my
weekend leasing-turn demand.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the long-tail trade-
page pattern is now proven across SEVEN shipped pages
(`src/pages/AiForPlumbers.tsx` ticket 0017, `AiForHvac.tsx`
ticket 0020, `AiForRoofers.tsx` ticket 0024,
`AiForElectricians.tsx` ticket 0034, `AiForPainters.tsx`
ticket 0037, `AiForLandscapers.tsx` ticket 0041, and
`AiForPropertyManagers.tsx` ticket 0047). Six of the seven
funnel into `/homeservices/demo/*` because the buyer is a
trade (the seventh, property managers, funnels into
`/realestate/demo/*` because the ICP is different). Cleaning
services are the next obvious trade in the family: they have
inbound phone-and-form lead flow, after-hours and weekend
booking demand, a quote-by-square-footage / room-count
pricing pattern, and a follow-up loop after the job that
matches the home-services lead-responder, estimate, and
voice-followup demos verbatim. One new page, one new route,
one new entry in `src/data/routes.ts` ROUTES, zero new demo,
zero new backend, ~280 lines of diff. The page intentionally
funnels into `/homeservices/demo/*` to reuse the three
existing home-services-calibrated demos rather than spawning
a cleaning-specific demo family.

### Stakeholder

This widens the SEO moat in a query class no existing page
covers. Today a residential cleaning owner Googling "AI for
cleaning business" or "AI quote tool maid service" lands on
ZenMaid / Jobber / Housecall Pro marketing (the field-
service software incumbents), generic cleaning-industry
SaaS articles, or Facebook ads, and bounces. Cleaning is also
one of the highest residential-services SMB densities in the
US: the segment includes house cleaning, move-out cleaning,
commercial janitorial, post-construction cleanup, and Airbnb
turnover - each with a different recurring-revenue shape and
each with the same "the phone rang while the crew was on a
job" leak the trade family already solves. The Airbnb-
turnover sub-niche in particular pairs naturally with the
property-managers page (ticket 0047) because both ICPs share
the same after-hours leasing-turn calendar; cross-linking
between the two surfaces is a future ticket once both rank.
The page is the EIGHTH long-tail landing page in the family
and the second non-traditional trade after property managers,
which makes it the consolidating proof that the pattern
generalizes across residential-services SMBs.

### Visitor (in the real moment of use)

A principal of a 4-team house-cleaning company Googles "AI
for cleaning business" between two scheduled cleans on a
phone. The SERP listing surfaces `/ai-for-cleaning-services`
with a description that names the three cleaning-service
pain points (weekend and after-hours booking requests that
go to voicemail and lose to the competitor who answered on
Sunday afternoon, slow quote turnaround for move-out and
deep-clean jobs where a homeowner is comparing three crews,
and review-request slippage after a finished clean that
stalls Google Business Profile ranking). One tap on the
hero CTA opens the live `/homeservices/demo/lead-responder`
already qualifying inquiries against a cleaning-flavored
intent prompt. No signup, no credit card, the visitor sees
an AI agent triaging a "is the team available for a
move-out clean next Saturday at 1247 Maple?" inbound in
under 60 seconds. Light and dark mode supported; the page
reads cleanly on a 375px viewport.

### Growth

The "show me" moment is the SERP listing for "AI for cleaning
business" or "AI booking assistant maid service" returning a
real ICP-specific landing page where today only ZenMaid /
Jobber / Housecall Pro marketing, the cleaning-industry
forums, and a handful of generic SaaS articles rank. Each
CTA click fires `trackCTAClick` with a `cleaningservices_*`
location label so the funnel is measurable in GA
independently of the seven other trade pages. A returning
cleaning-company owner who books a strategy call after
landing here is the cheapest qualified call the funnel can
produce in this ICP. The page is also shareable in a
cleaning-industry Slack or a Facebook group thread because
the pains read as an actual operator wrote them (no invented
testimonials, no efficacy percentages the page cannot back),
which is the canonical artifact a peer forwards when they
want to start the AI conversation.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/AiForCleaningServices.tsx` (new file, under 340 lines) renders at `/ai-for-cleaning-services`, modeled 1:1 on `src/pages/AiForLandscapers.tsx` (ticket 0041, the closest peer in the trade-quintet pattern; the property-managers page is the wrong template because it routes to `/realestate/demo/*`, not `/homeservices/demo/*`). The page has a hero with a cleaning-service-specific H1, three pain-point cards (weekend and after-hours booking requests that go to voicemail, slow quote turnaround for move-out and deep-clean jobs, review-request slippage after a finished clean), a STATS row, three demo cards routing to `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, and `/homeservices/demo/voice-followup`, and a single CTA section. Every claim is defensible: no invented client names, no fabricated efficacy percentages, no cleaning-industry margin or recurring-revenue figures the page cannot back from publicly-sourced industry medians named in an HTML comment per the 2026-05-25 mirror-source-fix rule.
- [ ] The page emits TWO JSON-LD blocks inside the existing `<Helmet>` head matching the seven-page convention: (1) a `BreadcrumbList` (Home -> AI for Cleaning Services) using the same shape as `AiForLandscapers.tsx` `BREADCRUMB_SCHEMA`, and (2) a sibling `Service` block with `@type: 'Service'`, `name: 'AI for Cleaning Services'`, `serviceType: 'AI Automation for Residential and Commercial Cleaning Businesses'`, `areaServed: { '@type': 'Country', name: 'United States' }`, `provider` pointing to the DigitalCraft Organization, and `description` mirroring the page's `META_DESCRIPTION` constant (per the 2026-05-25 mirror-source rule).
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/*-jsonld.spec.ts` AND every existing `tests/e2e/ai-for-*.spec.ts` for `=== 'BreadcrumbList'` AND `=== 'Service'` predicates to confirm no existing spec asserts "exactly one BreadcrumbList block site-wide" or "exactly one Service block site-wide." The seven existing trade-page specs each assert per-URL scoped BreadcrumbList and Service blocks per the ticket 0047 Implementation log, so the collision risk is structurally low, but the grep is mandatory and the result is documented in the Implementation log.
- [ ] The new route is registered in `src/App.tsx` next to the existing `/ai-for-property-managers` route. The implementer adds `/ai-for-cleaning-services` to the `ROUTES` array in `src/data/routes.ts` (the canonical allow-list per the 2026-06-07 src-imports-tests lesson). The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in any JSON-LD serialized string, and every CTA route resolves to a registered route in `src/data/routes.ts`. The three primary CTAs route to `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, and `/homeservices/demo/voice-followup` (the three home-services demos six of the seven existing trade pages already funnel into); the calendly CTA opens in a new tab with `rel="noopener noreferrer"` matching the existing trade-page convention.
- [ ] A new e2e spec at `tests/e2e/ai-for-cleaning-services.spec.ts` (modeled on `tests/e2e/ai-for-landscapers.spec.ts`) asserts: the page returns < 400 status, the H1 contains "Cleaning" (case-insensitive substring), the `meta[name="description"]` content names "cleaning" (asserted on the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson), the `BreadcrumbList` JSON-LD block names "AI for Cleaning Services" as the second item, the `Service` JSON-LD block carries `serviceType` containing "Cleaning," the three demo CTAs each resolve to a `/homeservices/demo/*` route registered in `ROUTES` (this is the structural similarity to the six pre-property-managers trade pages and the explicit regression check against accidentally pasting `/realestate/demo/*` from the property-managers template), the page text contains no `U+2014` code point, and dark mode renders cleanly.
- [ ] No `/api/` change, no new hostname (the only external link is the existing `calendly.com/mutaaf` URL already used on every trade page), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the existing seven trade pages or their specs, no edits to `src/pages/HomeServices.tsx` or to any `/homeservices/demo/*` page. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; every pre-existing `tests/e2e/ai-for-*.spec.ts` and the homeservices demo specs stay green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A cleaning-specific demo (e.g. a per-room square-footage
  estimator, a recurring-clean-schedule rebooker). The page
  reuses the three existing home-services demos verbatim;
  a cleaning-specific demo is a separate ticket and not
  justified before the page proves demand.
- Adding `/ai-for-cleaning-services` to the `index.html`
  SEO Pilot `pages` table. That is its own SEO-hygiene
  ticket and applies uniformly to all eight trade pages,
  none of which are in the table per the 2026-05-25 SEO
  Pilot lesson. Out of scope here.
- An Airbnb-turnover or post-construction-cleanup
  specialty variant. The page intentionally centers on
  residential house cleaning plus light commercial
  janitorial because that segment has the highest unpaid
  search volume; a specialty variant is a separate ticket
  if telemetry justifies it.
- A "Switch from ZenMaid" or "vs Housecall Pro for
  cleaning" callout on the page. Comparison pages own
  that funnel; the ticket-0042 precedent says each
  comparison page is its own ticket.
- Cross-linking the new page from `/homeservices` or
  from the seven existing trade pages or from the
  property-managers page. Internal-link clusters are
  their own small ticket once the page exists and ranks.
- Emitting a `FAQPage` JSON-LD on this page. None of the
  seven existing trade pages emit one and the page does
  not yet have a visible FAQ section to mirror; adding
  both at once would exceed the 200-line diff budget.
  Out of scope here.
- A cleaning-industry blog post. Blog content ships
  through the existing `src/data/blogPosts.ts` pipeline
  and is gated by `check-blog-dates`; a cleaning-themed
  post is its own content ticket.
- Internationalization (`inLanguage` fields on schema,
  locale switcher). The page is English-only; an i18n
  pass is a separate cross-cutting ticket.
- A testimonial from a real cleaning-company client.
  The AGENTS.md Hard NO on invented testimonials
  applies; a real testimonial ships through its own
  dated blog post via the existing pipeline once a real
  client agrees to attribution.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/AiForCleaningServices.tsx` (under 340
  lines). Copy `src/pages/AiForLandscapers.tsx` (ticket
  0041) end-to-end as the starting frame, then swap every
  "Landscap" string for the cleaning-service equivalent.
  Keep the same module-level mirror-source constants:
  `HERO_H1`, `META_DESCRIPTION`, `SERVICE_DESCRIPTION`
  (per the 2026-05-25 mirror-source rule the description
  used in the Helmet meta tag and the
  `SERVICE_SCHEMA.description` MUST be the same
  `META_DESCRIPTION` constant). Swap the three
  `PAIN_POINTS` entries to the three cleaning-specific
  pains named in the User story. Swap the three (NOT two:
  match landscapers which has three demo cards; property-
  managers has two because it routes to a smaller
  realestate-demo family) `DEMO_CARDS` entries copy to
  cleaning-service language and confirm the `to:` paths
  route to `/homeservices/demo/lead-responder`,
  `/homeservices/demo/estimate`, and
  `/homeservices/demo/voice-followup`. Swap `STATS`
  labels to cleaning-service context (after-hours and
  weekend booking-request capture, average AI reply
  time, demos calibrated for cleaning services, time-
  from-signup-to-go-live) but keep the four numeric
  values unchanged so the family stays self-consistent.
  Trade label for the icon chip reads exactly "Built for
  cleaning businesses."
- New route in `src/App.tsx`: import
  `AiForCleaningServices` and add
  `<Route path="/ai-for-cleaning-services" element={<AiForCleaningServices />} />`
  next to the `/ai-for-property-managers` route. Mirror
  the (non-)lazy-loading convention of the adjacent
  trade pages per the ticket 0047 precedent.
- Per the 2026-06-07 src-imports-tests lesson, add
  `/ai-for-cleaning-services` to the `ROUTES` array in
  `src/data/routes.ts` (the canonical allow-list); do
  NOT add it directly to `tests/e2e/routes.ts`. The
  re-export picks it up automatically.
- Per the 2026-05-30 second-@type lesson, grep
  `tests/e2e/*-jsonld.spec.ts` and
  `tests/e2e/ai-for-*.spec.ts` for both
  `=== 'BreadcrumbList'` and `=== 'Service'` predicates
  BEFORE writing code. Confirm no spec asserts "exactly
  one of either @type site-wide" (the existing patterns
  are per-URL scoped per the ticket 0047 Implementation
  log). Document the grep result in the Implementation
  log so the deviation, if any, is auditable.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e spec
  asserts the Helmet-managed `meta[name="description"]`
  content directly (LAST `meta[name="description"]`
  element per the 2026-05-25 Helmet-appends lesson), NOT
  `page.toHaveTitle()`. The route is not in the
  `index.html` SEO Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every string in
  the page module (the H1, the META_DESCRIPTION, the
  SERVICE_DESCRIPTION, the three pain-point titles and
  descs, the three demo-card titles and descs, the
  STATS labels, the JSON-LD strings, the CTA labels,
  the footer disclaimer) uses hyphens. Self-Review
  greps the diff for `String.fromCharCode(8212)` before
  pushing.
- `tests/e2e/ai-for-cleaning-services.spec.ts` (new) -
  one spec per acceptance box. Model end-to-end on
  `tests/e2e/ai-for-landscapers.spec.ts` (the closest
  three-demo-card peer). CTA case: locate the three
  demo-card CTAs via `data-testid="cleaningservices-demo-cta"`
  (added to the CTA anchors in the new page) and assert
  each `href` resolves to a `/homeservices/demo/*` path
  present in the `ROUTES` array imported from
  `tests/e2e/routes.ts`. This is the explicit regression
  check that prevents accidental copy-paste of the
  `/realestate/demo/*` routes from the property-managers
  template.
- Per the 2026-05-22 two-PR ship lesson, ship will need
  a follow-up `chore/0050-ship-status` PR after the feat
  PR merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to `shipped`
  together; run `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index never
  drift mid-flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, and the existing
  `useContent` hook plus `trackCTAClick` helper. Schema
  migration: no. Privacy/security surface change: no -
  the page is static marketing copy and emits no new
  network calls; the only external link is the existing
  calendly URL already disclosed on `/trust` per ticket
  0018.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0050-...` opened
- YYYY-MM-DD - failing test added in `tests/...`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
