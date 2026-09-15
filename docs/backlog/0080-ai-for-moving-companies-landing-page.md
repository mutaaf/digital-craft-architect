---
id: 0080
title: AI-for-moving-companies long-tail landing page funneling into home-services demos
status: in-progress
priority: P1
area: content
created: 2026-09-15
owner: gtm-innovation
---

## User story

As the owner or dispatcher of a local moving company
(a two-truck residential mover, a small commercial-relocation
crew, a long-distance interstate operator, a
storage-and-move hybrid, a specialty piano or antique
mover) Googling "AI for moving companies," "moving
company answering service AI," "AI receptionist for
movers," or "AI quote assistant for moving" on a phone
between jobs after a booked estimate never called back
to confirm, I want one honest long-tail landing page at
`/ai-for-moving-companies` that names the three specific
pain points that bleed moving-company margin (walk-in
estimate requests that go to voicemail during a load,
long-tail inventory questions - stairs, pianos, elevator
reservations - that a dispatcher cannot answer without
the truck manifest in hand, review-request timing that
slips the day the last box lands on the new porch), and
that funnels into the three live home-services demos the
page reuses verbatim (`/homeservices/demo/lead-responder`,
`/homeservices/demo/estimate`, `/homeservices/demo/voice-followup`),
so that I can try the AI agent on my own phone before
deciding to book a 15-minute strategy call.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the long-tail
trade-landing pattern is now proven across ELEVEN shipped
pages (`src/pages/AiForPlumbers.tsx` 0017,
`AiForHvac.tsx` 0020, `AiForRoofers.tsx` 0024,
`AiForElectricians.tsx` 0034, `AiForPainters.tsx` 0037,
`AiForLandscapers.tsx` 0041, `AiForPropertyManagers.tsx`
0047, `AiForCleaningServices.tsx` 0050,
`AiForPestControl.tsx` 0056, `AiForPoolService.tsx` 0058,
`AiForRestorationServices.tsx` 0072). Each is a flat
copy-replace of its predecessor with vertical-specific
pain points and three demo cards routing into the same
`/homeservices/demo/*` family. Moving is the twelfth
vertical and is structurally closest to restoration
(ticket 0072) because both are residential service
trades with an unpredictable-arrival funnel where a
missed inbound call IS the business (a homeowner Googling
"movers near me" at 8pm on Sunday calls the first three
listings and books whichever one picks up first). Adding
the twelfth landing page is exactly one new file
(`src/pages/AiForMovingCompanies.tsx`, modeled 1:1 on
`AiForRestorationServices.tsx`), one new entry in
`src/data/routes.ts`, one new route in `src/App.tsx`, one
new entry in the public sitemap, and one new spec file.
The three demo CTAs route into the existing
`/homeservices/demo/*` demos with no new demo build, no
new backend, no new data, no new component.

### Stakeholder

This widens the SEO moat in a query class adjacent to
but strictly separate from the eleven existing trade
pages: "AI for moving companies," "moving company
answering service AI," "AI receptionist for movers," "AI
quote assistant for moving," "AI for interstate movers,"
"AI for local moving businesses." Moving is structurally
one of the highest-intent residential-service trades
because the calling homeowner has a hard deadline (a
lease end date, a closing date, a landlord ultimatum);
a voicemail loses the job to the next shop listed in the
SERP within minutes AND the caller has strong
switching-cost lock-in once they book with a competitor
(deposit paid, calendar set). Per the ticket 0072
precedent, a new trade page adds one indexable long-tail
head-term surface AND one new internal-link node in the
home-services SEO graph. The home-services demo family
already exercises the exact three flows a moving company
needs (inbound lead qualification with capacity and date
triage, ballpark quote generation from truck-hour and
mileage inputs, next-day review-request voice callback),
so the new page ships zero new demo surface. Per the
2026-05-30 second-@type lesson and the ticket 0072
implementer notes, the pre-code grep across every
`tests/e2e/*-jsonld.spec.ts` confirmed the trade-page
family emits Service plus BreadcrumbList plus FAQPage
JSON-LD with URL-scoped assertions, so a sibling instance
on `/ai-for-moving-companies` does not collide with the
eleven predecessor instances.

### User (in the real moment of use)

A two-truck-shop owner on a phone at 9pm Sunday after the
last load lands finds the day's missed-call log shows
four inbound walk-in estimate requests that never called
back. She Googles "AI for moving companies" on her phone.
The SERP surfaces `/ai-for-moving-companies` with a meta
description naming the three pain points verbatim. One
tap and the page loads on a 375px viewport with a hero
H1 ("AI for Moving Companies") and a subtitle naming
the pain (walk-in estimates that go to voicemail during
a load). She scrolls, reads the three pain points in
their own labeled cards, taps the first "Try the AI
receptionist demo" CTA, and lands on
`/homeservices/demo/lead-responder` which is already
seeded with a moving-company intake prompt. She chats
with the demo for two minutes, watches it triage her
mock inbound (studio apartment, second-floor walkup, next
Saturday, no piano) and hand back a captured lead
summary, taps back to the landing page, scrolls to the
"Book a 15-minute strategy call" CTA at the bottom, and
books. No mobile scroll trap, no dead links, no
non-defensible claim. Light and dark mode both read
cleanly.

### Growth

The "show me" moment is the SERP result: an owner Googling
"AI for moving companies" from a phone late Sunday
finds `/ai-for-moving-companies` at the top of the
long-tail SERP, taps in, and books a strategy call from
her thumb before the next inbound rings. That is the
single cheapest audience-acquisition signal the site can
produce for the moving-company vertical because the
audience is Googling at the exact moment their pain is
priced in the loss of a booked estimate. The generator
ships as one new page file plus one new route entry plus
one new spec plus one sitemap line; the growth value is
entirely in the SERP surface the long-tail head term
opens once Googlebot indexes the page.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page at `src/pages/AiForMovingCompanies.tsx` (new file, under 200 lines) modeled 1:1 on `src/pages/AiForRestorationServices.tsx` (ticket 0072, the freshest predecessor in the same home-services family). The page renders: (a) a hero H1 "AI for Moving Companies" with a supporting subtitle naming the pain (walk-in estimates that go to voicemail during a load), (b) three labeled pain-point cards - one for after-hours walk-in estimates, one for long-tail inventory triage (stairs, pianos, elevator reservations), one for review-request timing on move-out day, (c) three demo cards linking to `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, `/homeservices/demo/voice-followup` (identical hrefs to ticket 0072), each with a moving-company-specific one-line "why this matters" line under the CTA label, (d) a "Book a 15-minute strategy call" CTA at the bottom pointing at the existing homepage strategy-call anchor. Every string on the page is written in the defensible brand voice per AGENTS.md: no invented client names, no invented percentages, no invented dollar amounts, hyphens not em-dashes.
- [ ] A new route entry at `src/App.tsx` mapping `/ai-for-moving-companies` to the new page component, imported through the existing `React.lazy` pattern all other trade-landing pages use per the 2026-09-05 route-code-splitting lesson. Wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell.
- [ ] A new entry in `src/data/routes.ts` (the canonical route allow-list) exactly `'/ai-for-moving-companies'`, alphabetically placed with the other `/ai-for-*` routes per the file's existing ordering convention. Per the 2026-06-07 mirror-source-across-src-tests lesson, `tests/e2e/routes.ts` continues to re-export ROUTES verbatim and requires no separate edit.
- [ ] A new entry in `public/sitemap.xml` for `<url><loc>https://digitalcraftai.com/ai-for-moving-companies</loc><lastmod>2026-09-15</lastmod><priority>0.7</priority></url>` (mirroring the priority and lastmod pattern of ticket 0072's sitemap row per the 2026-05-28 sitemap-lastmod lesson). If the sitemap is auto-generated by `scripts/generate-sitemap.ts` (per ticket 0022), the entry is emitted via the generator's existing enumeration; no manual XML edit required and the implementer confirms auto-inclusion in the Implementation log.
- [ ] The page emits three JSON-LD blocks inside its `<Helmet>` block matching the trade-page family shape: (1) `Service` describing the AI-for-movers offering, (2) `BreadcrumbList` positioning the page under the homepage (two levels: Home, AI for Moving Companies), (3) `FAQPage` enumerating three vertical-specific FAQ items whose text mirrors the visible FAQ cards on the page byte-for-byte per the 2026-05-25 mirror-source rule. The exact shape mirrors ticket 0072's emission on `AiForRestorationServices.tsx`; the implementer greps that file first and copies the JSON-LD block structure verbatim, substituting the moving-company copy.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'Service'`, `=== 'BreadcrumbList'`, and `=== 'FAQPage'` predicates and any "exactly one" / `toHaveLength(1)` assertions over those `@type`s. Every predecessor trade-page assertion is URL-scoped (its poll navigates to its own trade path), so the sibling instance on `/ai-for-moving-companies` cannot collide. The grep result is documented in the Implementation log.
- [ ] Per the 2026-05-07 em-dash Hard NO, every string emitted on the page AND every string emitted into the three JSON-LD blocks AND every string in the new e2e spec is hyphen-only. Self-Review greps the diff for `String.fromCharCode(8212)` before pushing. No fake client testimonials, no invented percentages, no fabricated dollar savings, no invented crew names.
- [ ] The page ships full dark-mode support: every Tailwind color class carries its `dark:` variant, mirroring `AiForRestorationServices.tsx` verbatim. A viewport-width check on 375px, 768px, and 1280px shows the three pain-point cards stacking, then two-up, then three-up (matching the predecessor grid class pattern).
- [ ] A new e2e spec at `tests/e2e/ai-for-moving-companies.spec.ts` (modeled on `tests/e2e/ai-for-restoration-services.spec.ts` from ticket 0072) asserts, using a `gotoMovingCompanies(page)` helper that navigates to `/ai-for-moving-companies` and waits for RouteFallback detach per the 2026-09-05 lesson and mount signal per the 2026-09-10 lesson: (1) `GET /ai-for-moving-companies` returns 200, (2) the page renders an H1 containing the text "Moving Companies" (case-insensitive), (3) the page renders exactly three demo-card CTAs with hrefs `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, `/homeservices/demo/voice-followup`, (4) exactly one `Service` JSON-LD block on the page with a `name` field containing "Moving Companies", (5) exactly one `BreadcrumbList` block with two `itemListElement` entries whose names are "Home" and "AI for Moving Companies", (6) exactly one `FAQPage` block whose `mainEntity` array length equals the count of visible FAQ cards rendered on the page (byte-identical mirror-source assertion), (7) every string in the rendered page body contains zero `String.fromCharCode(8212)` code points, (8) the page renders cleanly in both light and dark mode (the `html.dark` class toggle test pattern from ticket 0072's spec), (9) the "Book a 15-minute strategy call" CTA at the bottom fires `trackCTAClick('moving_companies_book_call', 'moving_companies_footer')` on click.
- [ ] Standard box: no `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the eleven predecessor trade-page specs (0017 through 0072) all stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- No `/api/` changes, no `package.json`
  changes, no em-dashes in copy, dark-mode
  required (this ticket ships one new page
  plus one new route plus one new sitemap
  entry plus one new spec plus three
  JSON-LD blocks mirroring the ticket 0072
  pattern).
- A new home-services demo scoped to moving
  companies. The three existing
  `/homeservices/demo/*` demos already cover
  the flows the page needs (lead-responder,
  estimate, voice-followup); adding a
  fourth demo is a separate ticket.
- A blog post about AI for moving companies.
  A blog post is its own content ticket and
  a separate PR per the AGENTS.md blog-date
  rule.
- A comparison page like "Digital Craft vs
  Move4U" or "vs SmartMoving." Comparison
  pages are a distinct area (SEO) with a
  different template.
- A case study for a moving-company client.
  Case studies must be real per the no-fake
  Hard NO; a case study only ships when a
  real client's data is available.
- Adding moving-specific data files
  (`src/data/movingPricing.ts` or similar).
  The `/homeservices/demo/estimate` demo
  already ships home-services pricing data
  that generalizes to moving companies;
  a moving-specific pricing file is
  premature.
- Editing the eleven predecessor trade-page
  files (`AiForPlumbers.tsx` through
  `AiForRestorationServices.tsx`). Every
  predecessor stays byte-identical.
- Adding a "moving companies" filter chip
  on `/homeservices` or `/demos`. Filter UI
  on the demo hubs is a distinct ticket.
- Cross-linking `/ai-for-moving-companies`
  from `/subprocessors`, `/uptime`,
  `/ethics`, or `/case-studies`.
  Cross-surface promotion is its own
  follow-up ticket.
- Adding a Service Area JSON-LD field
  enumerating specific cities or states.
  The page is a national landing page;
  city-specific SEO is a distinct
  location-page ticket (per the ticket
  0051 `/locations/texas` LocalBusiness
  precedent).

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/AiForMovingCompanies.tsx`
  (under 200 lines). Mirror the file
  structure of
  `src/pages/AiForRestorationServices.tsx`
  (ticket 0072) verbatim: same imports,
  same section layout, same three-card
  demo grid, same FAQ accordion pattern,
  same footer strategy-call CTA. Substitute
  every vertical-specific string with
  moving-company copy. Every color class
  carries its `dark:` variant.
- New `src/App.tsx` route entry mapping
  `/ai-for-moving-companies` to the new
  component, wrapped in the existing
  `<Suspense fallback={<RouteFallback />}>`
  shell and lazy-imported via
  `React.lazy(() => import('./pages/AiForMovingCompanies'))`
  per the 2026-09-05 route-code-splitting
  lesson.
- New entry in `src/data/routes.ts` at the
  alphabetically-correct slot for
  `/ai-for-moving-companies` between
  `/ai-for-landscapers` (0041) and
  `/ai-for-painters` (0037), or wherever
  the file's existing ordering convention
  places it. Per the 2026-06-07
  mirror-source-across-src-tests lesson,
  `tests/e2e/routes.ts` re-exports ROUTES
  verbatim and no test-file edit is needed.
- The sitemap is auto-generated by
  `scripts/generate-sitemap.ts`. The
  generator reads `src/data/routes.ts`
  and emits one `<url>` per entry, so
  adding the route to routes.ts
  auto-emits the sitemap row on the next
  `npm run build`. The implementer
  confirms auto-inclusion by grepping
  the built `dist/sitemap.xml` for the
  new URL after a local build.
- Three JSON-LD blocks inside the
  `<Helmet>` block matching the exact
  shape of ticket 0072's emission:
  Service (with the moving-company name,
  description, `provider` linked to the
  homepage Organization block by url,
  and `areaServed: 'US'`),
  BreadcrumbList (two levels), FAQPage
  (three items minimum, mirror-source
  to the visible FAQ cards).
- Per the 2026-05-30 second-@type
  lesson, BEFORE writing code grep
  every `tests/e2e/*-jsonld.spec.ts`
  for Service, BreadcrumbList, and
  FAQPage predicates. Documented
  candidates as of 2026-09-15:
  the eleven predecessor trade-page
  specs. Each predecessor "exactly one
  Service" assertion is URL-scoped to
  its own trade path, so the sibling
  instance on `/ai-for-moving-companies`
  cannot collide. Document the grep
  result in the Implementation log.
- Per the 2026-05-25 mirror-source
  rule, the FAQPage JSON-LD's question
  and answer strings match the visible
  FAQ card copy byte-for-byte. The new
  spec asserts the FAQPage mainEntity
  count equals the visible FAQ card
  count.
- Per the 2026-05-07 em-dash Hard NO,
  every string on the page AND every
  JSON-LD block AND the new spec's
  assertions are hyphen-only.
  Self-Review greps the diff for
  `String.fromCharCode(8212)` before
  pushing.
- Per the 2026-09-05 route-fallback
  and 2026-09-10 mount-signal lessons,
  the new spec's `gotoMovingCompanies`
  helper waits for RouteFallback
  detach AND the H1 to be visible
  before reading page state.
- Per the 2026-05-22 two-PR ship
  lesson, ship will need a follow-up
  `chore/0080-ship-status` PR after
  the feat PR merges to flip the
  ticket frontmatter AND its
  `docs/backlog/README.md` index row
  to `shipped` together; run
  `node scripts/check-backlog.mjs`
  before pushing the second PR so the
  file and index never drift mid-flip.
- New deps: NO. The page reuses
  `react-router-dom`, `react-helmet-async`,
  the existing `trackCTAClick` helper,
  the existing UI primitives from
  `@/components/ui/*`, and Tailwind
  utility classes. Schema migration: no.
  Privacy / security surface change: NO -
  the page contains only static marketing
  copy plus deep-links to existing demos.

## Implementation log

(Appended by the implementation-dev agent during execution.)

### 2026-09-15 - implementation-dev

Pre-code grep for the 2026-05-30 second-@type collision lesson.
Ran `grep -rn "=== 'Service'\|=== 'BreadcrumbList'\|=== 'FAQPage'\|toHaveLength(1)\|exactly one" tests/e2e/*.spec.ts`
across every file. Every predecessor trade-page `toHaveLength(1)` assertion
over Service or BreadcrumbList sits inside a spec whose first action is its
own local `gotoX` helper navigating to its own trade path
(`ai-for-plumbers.spec.ts`, `ai-for-hvac.spec.ts`, `ai-for-roofers.spec.ts`,
`ai-for-electricians.spec.ts`, `ai-for-painters.spec.ts`,
`ai-for-landscapers.spec.ts`, `ai-for-property-managers.spec.ts`,
`ai-for-cleaning-services.spec.ts`, `ai-for-pest-control.spec.ts`,
`ai-for-pool-service.spec.ts`, `ai-for-restoration-services.spec.ts`).
No existing spec asserts `toHaveLength(1)` on any @type after visiting
`/ai-for-moving-companies`, so the sibling instance on the new page cannot
collide. No existing spec asserts anything at all about a FAQPage on the
trade-page family (the eleven predecessors emit BreadcrumbList and Service
only; ticket 0080 is the first trade-page to add a FAQPage block per its
acceptance criteria box for three JSON-LD blocks).

Structural deviation from ticket 0072 noted per the 2026-09-12 "code beats
prose" lesson: `AiForRestorationServices.tsx` only emits BreadcrumbList
(no Service, no FAQPage), yet ticket 0080's acceptance criteria explicitly
require three JSON-LD blocks (Service, BreadcrumbList, FAQPage) with a
visible FAQ card section mirroring the FAQPage byte-for-byte per the
2026-05-25 mirror-source rule. Following the explicit acceptance criteria,
the new page adds a Service block (mirroring the ticket 0034 electricians
Service shape), a BreadcrumbList block (mirroring the 0072 shape), and a
new FAQPage block whose `mainEntity` questions and answers read from the
same module-level `FAQ_ITEMS` array the visible cards render from
(single source of truth).

Alphabetical vs chronological placement in `src/data/routes.ts`: the file's
existing convention for the `/ai-for-*` cluster is chronological
(ticket-order, matching the App.tsx lazy import order), not alphabetical -
new route appended to the end of that cluster in line with the eleven
predecessors.

The sitemap auto-generates from `src/data/routes.ts` via
`scripts/generate-sitemap.ts`, so adding the route entry auto-emits the
sitemap row on the next `npm run build`. Confirmed via `grep` of
`dist/sitemap.xml` after `npm run build`.
