---
id: 0084
title: AI-for-solar-installers long-tail landing page funneling into home-services demos
status: groomed
priority: P1
area: content
created: 2026-09-18
owner: gtm-innovation
---

## User story

As the owner or lead dispatcher of a residential
solar-installation business (a two-crew local
rooftop installer, a solar-plus-storage integrator
running four trucks, a regional solar-and-roofing
hybrid, a solar dealer partnering with a national
financing lender, an EPC operator handling
permit-through-inspection for third-party sales
teams) Googling "AI for solar installers," "solar
company answering service AI," "AI receptionist
for solar contractors," "AI quote assistant for
solar," or "solar sales AI" on a phone between
site visits after a $30k inbound went to voicemail,
I want one honest long-tail landing page at
`/ai-for-solar-installers` that names the three
specific pain points that bleed solar-installer
margin (walk-in rooftop assessment inbounds that
go to voicemail during a site visit, long-tail
system-sizing and financing questions that a
dispatcher cannot answer without the utility bill
in hand, permit-and-inspection follow-up cadence
that slips between contract signing and grid-
interconnection), and that funnels into the three
live home-services demos the page reuses verbatim
(`/homeservices/demo/lead-responder`,
`/homeservices/demo/estimate`,
`/homeservices/demo/voice-followup`), so that I can
try the AI agent on my own phone before deciding
to book a 15-minute strategy call.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the long-
tail trade-landing pattern is now proven across
TWELVE shipped pages (`src/pages/AiForPlumbers.tsx`
0017, `AiForHvac.tsx` 0020, `AiForRoofers.tsx`
0024, `AiForElectricians.tsx` 0034,
`AiForPainters.tsx` 0037, `AiForLandscapers.tsx`
0041, `AiForPropertyManagers.tsx` 0047,
`AiForCleaningServices.tsx` 0050,
`AiForPestControl.tsx` 0056, `AiForPoolService.tsx`
0058, `AiForRestorationServices.tsx` 0072,
`AiForMovingCompanies.tsx` 0080). Each is a flat
copy-replace of its predecessor with vertical-
specific pain points and three demo cards routing
into the same `/homeservices/demo/*` family. Solar
is the thirteenth vertical and is structurally
closest to roofing (ticket 0024) because both are
rooftop-work residential service trades with a
long-cycle sale (a solar contract commonly runs
$20k to $60k with a 60-90 day permit-and-install
window), where the inbound-response speed on the
first call materially determines close-rate against
competing installers who bid the same rooftop.
Adding the thirteenth landing page is exactly one
new file (`src/pages/AiForSolarInstallers.tsx`,
modeled 1:1 on `AiForMovingCompanies.tsx` from
ticket 0080), one new entry in `src/data/routes.ts`,
one new route in `src/App.tsx`, one new entry in
the public sitemap, and one new spec file. The
three demo CTAs route into the existing
`/homeservices/demo/*` demos with no new demo
build, no new backend, no new data, no new
component.

### Stakeholder

This widens the SEO moat in a query class adjacent
to but strictly separate from the twelve existing
trade pages: "AI for solar installers," "solar
company answering service AI," "AI receptionist
for solar contractors," "AI quote assistant for
solar," "AI for solar EPCs," "AI for solar
dealers." Solar-installer inbounds are structurally
among the highest ticket-value trades on the
home-services adjacent surface (a booked-and-
closed residential solar contract commonly clears
$20k to $60k in gross revenue vs. a moving-company
booked estimate around $500 to $3,000 or an HVAC
tune-up around $80 to $250), so a single captured
lead per week on the new page produces materially
higher expected pipeline value than a comparable
capture on the twelve predecessor pages, and the
audience is more likely to book a strategy call
because a missed $30k inbound is a materially
higher-priced loss than a missed $250 tune-up
inbound. Per the ticket 0080 precedent, a new
trade page adds one indexable long-tail head-term
surface AND one new internal-link node in the
home-services SEO graph. The home-services demo
family already exercises the exact three flows a
solar installer needs (inbound lead qualification
with rooftop-orientation, system-size, and utility-
company triage; ballpark quote generation from
system-size and battery-add-on inputs; permit-and-
inspection follow-up voice callback), so the new
page ships zero new demo surface. Per the
2026-05-30 second-@type lesson and the ticket
0080 implementer notes, the pre-code grep across
every `tests/e2e/*-jsonld.spec.ts` confirmed the
trade-page family emits Service plus BreadcrumbList
plus FAQPage JSON-LD with URL-scoped assertions,
so a sibling instance on `/ai-for-solar-installers`
does not collide with the twelve predecessor
instances.

### User (in the real moment of use)

A two-crew solar installer on a phone at 8pm
Wednesday after the last panel is torqued down
finds the day's missed-call log shows two inbound
rooftop-assessment requests that never called back
(one utility-bill photo attached to a voicemail, one
"I'm ready to move on solar" text with no follow-
up). She Googles "AI for solar installers" on her
phone. The SERP surfaces `/ai-for-solar-installers`
with a meta description naming the three pain
points verbatim. One tap and the page loads on a
375px viewport with a hero H1 ("AI for Solar
Installers") and a subtitle naming the pain (walk-
in rooftop assessment inbounds that go to
voicemail during a site visit). She scrolls, reads
the three pain points in their own labeled cards,
taps the first "Try the AI receptionist demo" CTA,
and lands on `/homeservices/demo/lead-responder`
which is already seeded with a solar-installer
intake prompt. She chats with the demo for two
minutes, watches it triage her mock inbound
(south-facing shingle roof, 1,200-square-foot home,
$180-per-month electric bill, no shade, ready to
book a site visit next Friday) and hand back a
captured lead summary, taps back to the landing
page, scrolls to the "Book a 15-minute strategy
call" CTA at the bottom, and books. No mobile
scroll trap, no dead links, no non-defensible
claim. Light and dark mode both read cleanly.

### Growth

The "show me" moment is the SERP result: a solar
installer Googling "AI for solar installers" from
a phone late Wednesday finds
`/ai-for-solar-installers` at the top of the long-
tail SERP, taps in, and books a strategy call from
her thumb before the next inbound rings. That is
the single cheapest audience-acquisition signal
the site can produce for the solar vertical
because the audience is Googling at the exact
moment their pain is priced in the loss of a
$30k-ticket booked assessment. The generator
ships as one new page file plus one new route
entry plus one new spec plus one sitemap line;
the growth value is entirely in the SERP surface
the long-tail head term opens once Googlebot
indexes the page.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page at `src/pages/AiForSolarInstallers.tsx` (new file, under 200 lines) modeled 1:1 on `src/pages/AiForMovingCompanies.tsx` (ticket 0080, the freshest predecessor in the same home-services family). The page renders: (a) a hero H1 "AI for Solar Installers" with a supporting subtitle naming the pain (walk-in rooftop assessment inbounds that go to voicemail during a site visit), (b) three labeled pain-point cards - one for after-hours rooftop-assessment inbounds, one for long-tail system-sizing and financing triage (roof orientation, panel count, battery add-on, federal tax credit, utility interconnection queue), one for permit-and-inspection follow-up cadence between signing and grid-connection, (c) three demo cards linking to `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, `/homeservices/demo/voice-followup` (identical hrefs to ticket 0080), each with a solar-installer-specific one-line "why this matters" line under the CTA label, (d) a "Book a 15-minute strategy call" CTA at the bottom pointing at the existing homepage strategy-call anchor. Every string on the page is written in the defensible brand voice per AGENTS.md: no invented client names, no invented percentages, no invented dollar amounts above a defensible industry ballpark, hyphens not em-dashes.
- [ ] A new route entry at `src/App.tsx` mapping `/ai-for-solar-installers` to the new page component, imported through the existing `React.lazy` pattern all other trade-landing pages use per the 2026-09-05 route-code-splitting lesson. Wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell.
- [ ] A new entry in `src/data/routes.ts` (the canonical route allow-list) exactly `'/ai-for-solar-installers'`, alphabetically placed with the other `/ai-for-*` routes per the file's existing ordering convention. Per the 2026-06-07 mirror-source-across-src-tests lesson, `tests/e2e/routes.ts` continues to re-export ROUTES verbatim and requires no separate edit.
- [ ] A new entry in `public/sitemap.xml` for `<url><loc>https://digitalcraftai.com/ai-for-solar-installers</loc><lastmod>2026-09-18</lastmod><priority>0.7</priority></url>` (mirroring the priority and lastmod pattern of ticket 0080's sitemap row per the 2026-05-28 sitemap-lastmod lesson). If the sitemap is auto-generated by `scripts/generate-sitemap.ts` (per ticket 0022 and confirmed in the ticket 0081 implementer note that the generator reads routes from `src/App.tsx`), the entry is emitted via the generator's existing enumeration; no manual XML edit required and the implementer confirms auto-inclusion in the Implementation log by grepping `dist/sitemap.xml` for `/ai-for-solar-installers` after a local build.
- [ ] The page emits three JSON-LD blocks inside its `<Helmet>` block matching the trade-page family shape: (1) `Service` describing the AI-for-solar offering, (2) `BreadcrumbList` positioning the page under the homepage (two levels: Home, AI for Solar Installers), (3) `FAQPage` enumerating three vertical-specific FAQ items whose text mirrors the visible FAQ cards on the page byte-for-byte per the 2026-05-25 mirror-source rule. The exact shape mirrors ticket 0080's emission on `AiForMovingCompanies.tsx`; the implementer greps that file first and copies the JSON-LD block structure verbatim, substituting the solar-installer copy.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'Service'`, `=== 'BreadcrumbList'`, and `=== 'FAQPage'` predicates and any "exactly one" / `toHaveLength(1)` assertions over those `@type`s. Every predecessor trade-page assertion is URL-scoped (its poll navigates to its own trade path), so the sibling instance on `/ai-for-solar-installers` cannot collide. The grep result is documented in the Implementation log.
- [ ] Per the 2026-05-07 em-dash Hard NO, every string emitted on the page AND every string emitted into the three JSON-LD blocks AND every string in the new e2e spec is hyphen-only. Self-Review greps the diff for `String.fromCharCode(8212)` before pushing. No fake client testimonials, no invented percentages (no "increase close rate by 40%"), no fabricated dollar savings, no invented installer names, no invented average-system-size figures the ticket cannot cite to a defensible public industry source.
- [ ] The page ships full dark-mode support: every Tailwind color class carries its `dark:` variant, mirroring `AiForMovingCompanies.tsx` verbatim. A viewport-width check on 375px, 768px, and 1280px shows the three pain-point cards stacking, then two-up, then three-up (matching the predecessor grid class pattern).
- [ ] A new e2e spec at `tests/e2e/ai-for-solar-installers.spec.ts` (modeled on `tests/e2e/ai-for-moving-companies.spec.ts` from ticket 0080) asserts, using a `gotoSolarInstallers(page)` helper that navigates to `/ai-for-solar-installers` and waits for RouteFallback detach per the 2026-09-05 lesson and mount signal per the 2026-09-10 lesson: (1) `GET /ai-for-solar-installers` returns 200, (2) the page renders an H1 containing the text "Solar Installers" (case-insensitive), (3) the page renders exactly three demo-card CTAs with hrefs `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, `/homeservices/demo/voice-followup`, (4) exactly one `Service` JSON-LD block on the page with a `name` field containing "Solar Installers", (5) exactly one `BreadcrumbList` block with two `itemListElement` entries whose names are "Home" and "AI for Solar Installers", (6) exactly one `FAQPage` block whose `mainEntity` array length equals the count of visible FAQ cards rendered on the page (byte-identical mirror-source assertion), (7) per the 2026-09-08 em-dash-JSON-LD-block-filter lesson the em-dash check scopes ONLY to the three blocks THIS page emits (Service, BreadcrumbList, FAQPage) filtered by their `@type`, NOT to every `application/ld+json` block on the page (the homepage Organization block from `index.html` carries a legitimate em-dash and must not be flagged), (8) every string in the rendered page body contains zero `String.fromCharCode(8212)` code points, (9) the page renders cleanly in both light and dark mode (the `html.dark` class toggle test pattern from ticket 0080's spec), (10) the "Book a 15-minute strategy call" CTA at the bottom fires `trackCTAClick('solar_installers_book_call', 'solar_installers_footer')` on click.
- [ ] Standard box: no `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any of the twelve predecessor trade-page files. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the twelve predecessor trade-page specs (0017 through 0080) all stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- No `/api/` changes, no `package.json`
  changes, no em-dashes in copy, dark-
  mode required (this ticket ships one
  new page plus one new route plus one
  new sitemap entry plus one new spec
  plus three JSON-LD blocks mirroring
  the ticket 0080 pattern).
- A new home-services demo scoped to
  solar installers. The three existing
  `/homeservices/demo/*` demos already
  cover the flows the page needs
  (lead-responder, estimate, voice-
  followup); adding a fourth demo is
  a separate ticket.
- A blog post about AI for solar
  installers. A blog post is its own
  content ticket and a separate PR per
  the AGENTS.md blog-date rule.
- A comparison page like "Digital Craft
  vs Aurora Solar" or "vs Enerflo."
  Comparison pages are a distinct area
  (SEO) with a different template.
- A case study for a solar-installer
  client. Case studies must be real
  per the no-fake Hard NO; a case
  study only ships when a real
  client's data is available.
- Adding solar-specific data files
  (`src/data/solarPricing.ts`, a
  `src/data/solarUtilities.ts`
  utility-interconnection allow-list,
  or a federal-tax-credit rate table).
  The `/homeservices/demo/estimate`
  demo already ships home-services
  pricing data that generalizes to
  solar; a solar-specific pricing
  file is premature and would risk
  fabricating utility-interconnection
  data.
- Editing the twelve predecessor
  trade-page files (`AiForPlumbers.tsx`
  through `AiForMovingCompanies.tsx`).
  Every predecessor stays byte-
  identical.
- Adding a "solar installers" filter
  chip on `/homeservices` or `/demos`.
  Filter UI on the demo hubs is a
  distinct ticket.
- Cross-linking `/ai-for-solar-installers`
  from `/subprocessors`, `/uptime`,
  `/ethics`, `/security`, or
  `/case-studies`. Cross-surface
  promotion is its own follow-up
  ticket.
- Adding a Service Area JSON-LD field
  enumerating specific cities or
  states. The page is a national
  landing page; city-specific SEO is
  a distinct location-page ticket
  (per the ticket 0051
  `/locations/texas` LocalBusiness
  precedent).
- Adding federal-tax-credit or state-
  incentive claims to the pain-point
  copy. Incentive-rate copy risks
  becoming stale between ship and
  the next tax cycle; the page names
  the pain (financing triage)
  without asserting specific
  incentive percentages.
- Emitting a FinancialProduct or
  Loan JSON-LD block for a solar-
  financing offer. Digital Craft
  does not itself offer financing;
  emitting such a block would
  misrepresent the artifact per the
  AGENTS.md conservative-claims
  rule.
- Adding a lead-capture form scoped
  to solar (an email input above
  the demo cards). Every trade-page
  predecessor uses the same
  strategy-call CTA pattern; a
  solar-specific capture form
  would fragment the funnel.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/AiForSolarInstallers.tsx`
  (under 200 lines). Mirror the file
  structure of
  `src/pages/AiForMovingCompanies.tsx`
  (ticket 0080) verbatim: same imports,
  same section layout, same three-card
  pain-point grid, same three-card
  demo grid, same footer CTA. Every
  Tailwind color class carries its
  `dark:` variant. Substitute the
  solar-installer copy in every string
  slot; leave every href identical.
- Copy for the pain-point cards is
  defensible per AGENTS.md: name the
  pain without inventing percentages,
  dollar figures, or client
  attributions. Draw the pain
  language from public solar-
  industry knowledge (rooftop
  assessment, system sizing, permit-
  and-inspection, utility
  interconnection) without citing
  specific state incentive rates,
  utility company names, or panel
  manufacturer brands.
- `src/App.tsx` - add
  `<Route path="/ai-for-solar-installers" element={<AiForSolarInstallers />} />`
  next to the existing
  `/ai-for-moving-companies` route,
  wrapped in the existing
  `<Suspense fallback={<RouteFallback />}>`
  shell and lazy-imported via
  `React.lazy(() => import('./pages/AiForSolarInstallers'))`
  per the 2026-09-05 route-code-
  splitting lesson.
- `src/data/routes.ts` - add
  `/ai-for-solar-installers` to
  the `ROUTES` array
  alphabetically per the file's
  ordering convention.
- Per the 2026-05-30 second-@type
  lesson, BEFORE writing code grep
  every `tests/e2e/*-jsonld.spec.ts`
  for `=== 'Service'`,
  `=== 'BreadcrumbList'`, and
  `=== 'FAQPage'` predicates.
  Predecessor candidates as of
  2026-09-18: every
  `tests/e2e/ai-for-*.spec.ts`
  (0017 through 0080), plus the
  ticket 0079 `/blog`
  CollectionPage spec (BreadcrumbList
  only), plus every compare-page
  spec for BreadcrumbList. Each
  predecessor is URL-scoped so the
  sibling on
  `/ai-for-solar-installers`
  cannot collide. The grep result
  is documented in the
  Implementation log.
- Per the 2026-09-08 em-dash-
  JSON-LD-block-filter lesson,
  the em-dash check in the spec
  scopes ONLY to the three
  blocks THIS page emits
  (Service, BreadcrumbList,
  FAQPage) filtered by their
  `@type`, NOT to every
  `application/ld+json` block
  on the page. The homepage
  Organization block from
  `index.html` carries a
  legitimate em-dash and must
  not be flagged by the
  /ai-for-solar-installers
  spec.
- Per the 2026-05-25 mirror-
  source rule, every FAQ
  question and answer string
  that appears on both the
  visible FAQ card AND the
  FAQPage JSON-LD is read from
  one shared constant (mirror
  the ticket 0080 pattern in
  `AiForMovingCompanies.tsx`).
- Per the 2026-05-07 em-dash
  Hard NO, every string in
  every touched file is hyphen-
  only. Self-Review greps the
  diff for
  `String.fromCharCode(8212)`
  before pushing.
- Per the 2026-09-05 route-
  fallback and 2026-09-10
  mount-signal lessons, the new
  spec's `gotoSolarInstallers`
  helper waits for RouteFallback
  detach AND the H1 to be
  visible before reading page
  state.
- Per the 2026-05-22 two-PR
  ship lesson, ship will need a
  follow-up
  `chore/0084-ship-status` PR
  after the feat PR merges to
  flip the ticket frontmatter
  AND its `docs/backlog/README.md`
  index row to `shipped`
  together; run
  `node scripts/check-backlog.mjs`
  before pushing the second PR
  so the file and index never
  drift mid-flip.
- New deps: NO. The page reuses
  `react-helmet-async`,
  `react-router-dom`, the
  existing `trackCTAClick`
  helper, the existing UI
  primitives from
  `@/components/ui/*`, and
  Tailwind utility classes.
  Schema migration: no. Privacy
  / security surface change:
  NO - the page is a passive
  read-only surface with no
  persistent store, no network
  call, no visitor input
  capture.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0084-...` opened
- YYYY-MM-DD - failing test added in `tests/e2e/ai-for-solar-installers.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
