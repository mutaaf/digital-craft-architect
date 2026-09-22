---
id: 0089
title: AI-for-garage-door-companies long-tail landing page funneling into home-services demos
status: groomed
priority: P1
area: content
created: 2026-09-22
owner: gtm-innovation
---

## User story

As the owner, service manager, or lead
dispatcher of a residential garage-door
company (a single-truck local
overhead-door repair shop, a two-crew
opener-and-spring specialist, a full
sales-service-install regional operation
carrying LiftMaster and Chamberlain,
a hurricane-code coastal
garage-door dealer, a franchise
territory owner running four trucks
on emergency broken-spring calls)
Googling "AI for garage door companies,"
"garage door answering service AI,"
"AI receptionist for garage door
repair," "AI for overhead door
contractors," "AI dispatcher for broken
spring calls," or "AI for garage door
opener repair" on a phone between
service calls after a broken-spring
emergency inbound went to voicemail
because both trucks were mid-job, I
want one honest long-tail landing page
at `/ai-for-garage-door-companies`
that names the three specific pain
points that bleed garage-door margin
(after-hours broken-spring emergencies
that go to voicemail while the
homeowner cannot get their car out and
calls the next number on the SERP,
long-tail opener-model and torsion-
spring-size triage questions a
dispatcher cannot answer without the
door specs in hand, next-day
appointment-window confirmations and
technician-on-the-way follow-ups that
slip between booking and arrival),
and that funnels into the three live
home-services demos the page reuses
verbatim
(`/homeservices/demo/lead-responder`,
`/homeservices/demo/estimate`,
`/homeservices/demo/voice-followup`),
so that I can try the AI agent on my
own phone before deciding to book a
15-minute strategy call.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value:
the long-tail trade-landing pattern is
now proven across FOURTEEN shipped
pages
(`src/pages/AiForPlumbers.tsx` 0017,
`AiForHvac.tsx` 0020,
`AiForRoofers.tsx` 0024,
`AiForElectricians.tsx` 0034,
`AiForPainters.tsx` 0037,
`AiForLandscapers.tsx` 0041,
`AiForPropertyManagers.tsx` 0047,
`AiForCleaningServices.tsx` 0050,
`AiForPestControl.tsx` 0056,
`AiForPoolService.tsx` 0058,
`AiForRestorationServices.tsx` 0072,
`AiForMovingCompanies.tsx` 0080,
`AiForSolarInstallers.tsx` 0084,
`AiForWindowInstallers.tsx` 0087).
Each is a flat copy-replace of its
predecessor with vertical-specific
pain points and three demo cards
routing into the same
`/homeservices/demo/*` family. Garage-
door companies is the fifteenth
vertical and is structurally closest
to plumbers (ticket 0017) and HVAC
(ticket 0020) because all three are
after-hours-emergency residential
service trades where a broken-spring
or blown-opener inbound at 7pm
Saturday is priced in the customer's
inability to close or open the door
until Monday morning; the response
speed on the first ring materially
determines whether the caller books
this shop or the next number on the
SERP. Adding the fifteenth landing
page is exactly one new file
(`src/pages/AiForGarageDoorCompanies.tsx`,
modeled 1:1 on
`AiForWindowInstallers.tsx` from
ticket 0087), one new entry in
`src/data/routes.ts`, one new route
in `src/App.tsx`, one new entry in
the public sitemap, and one new spec
file. The three demo CTAs route into
the existing `/homeservices/demo/*`
demos with no new demo build, no new
backend, no new data, no new
component.

### Stakeholder

This widens the SEO moat in a query
class adjacent to but strictly
separate from the fourteen existing
trade pages: "AI for garage door
companies," "garage door answering
service AI," "AI receptionist for
garage door repair," "AI for
overhead door contractors," "AI
dispatcher for broken spring calls,"
"AI for garage door opener repair,"
"garage door AI voice agent." Garage-
door repair sits alongside plumbing
and HVAC as the highest after-hours-
volume home-service trades (a
broken-spring emergency call is one
of the most common weekend-and-
evening residential service inbounds
and commonly clears $250 to $650
for a single spring replacement,
with opener replacement running
$500 to $1,200 and full door
replacement running $1,500 to
$4,500), so a single captured
after-hours lead per week on the new
page produces materially higher
expected pipeline value than a
comparable capture on a next-day-
schedule trade page, and the
audience is more likely to book a
strategy call because a missed
after-hours spring inbound is a
materially higher-priced loss than
a next-day-schedule miss. Per the
ticket 0087 precedent, a new trade
page adds one indexable long-tail
head-term surface AND one new
internal-link node in the home-
services SEO graph. The home-
services demo family already
exercises the exact three flows a
garage-door shop needs (inbound
lead qualification with door-type,
opener-brand, and spring-condition
triage; ballpark repair-quote
generation from door-size and
part-type inputs; on-the-way and
appointment-window voice callback),
so the new page ships zero new demo
surface. Per the 2026-05-30 second-
@type lesson and the ticket 0087
implementer notes, the pre-code
grep across every
`tests/e2e/*-jsonld.spec.ts`
confirmed the trade-page family
emits Service plus BreadcrumbList
plus FAQPage JSON-LD with URL-
scoped assertions, so a sibling
instance on
`/ai-for-garage-door-companies`
does not collide with the fourteen
predecessor instances.

### User (in the real moment of use)

A single-truck garage-door repair
owner sitting in the truck at
7:45pm Saturday, having just
finished a torsion-spring
replacement on the last call of
the day, sees the day's missed-call
log shows two after-hours inbound
requests that never called back
(one voicemail from a homeowner
saying "my garage door is stuck
open, my car is out and I can't
get it back in," one text with a
photo of a snapped extension
spring). He Googles "AI for garage
door companies" on his phone. The
SERP surfaces
`/ai-for-garage-door-companies`
with a meta description naming the
three pain points verbatim. One
tap and the page loads on a 375px
viewport with a hero H1 ("AI for
Garage Door Companies") and a
subtitle naming the pain (after-
hours broken-spring emergencies
that go to voicemail while the
homeowner cannot use their car).
He scrolls, reads the three pain
points in their own labeled cards,
taps the first "Try the AI
receptionist demo" CTA, and lands
on `/homeservices/demo/lead-
responder` which is already seeded
with a garage-door intake prompt.
He chats with the demo for two
minutes, watches it triage his
mock inbound (16x7 double-car
door, snapped left torsion spring,
LiftMaster opener still working,
ready to book the earliest
Saturday-evening slot) and hand
back a captured lead summary,
taps back to the landing page,
scrolls to the "Book a 15-minute
strategy call" CTA at the bottom,
and books. No mobile scroll trap,
no dead links, no non-defensible
claim. Light and dark mode both
read cleanly.

### Growth

The "show me" moment is the SERP
result: a garage-door owner
Googling "AI for garage door
companies" from a phone at 7:45pm
Saturday finds
`/ai-for-garage-door-companies`
at the top of the long-tail SERP,
taps in, and books a strategy
call from his thumb before the
next broken-spring call rings.
That is the single cheapest
audience-acquisition signal the
site can produce for the garage-
door vertical because the
audience is Googling at the exact
moment their pain is priced in
the loss of an after-hours
emergency repair booked by a
competitor. The generator ships
as one new page file plus one new
route entry plus one new spec
plus one sitemap line; the growth
value is entirely in the SERP
surface the long-tail head term
opens once Googlebot indexes the
page.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page at `src/pages/AiForGarageDoorCompanies.tsx` (new file, under 200 lines) modeled 1:1 on `src/pages/AiForWindowInstallers.tsx` (ticket 0087, the freshest predecessor in the same home-services family). The page renders: (a) a hero H1 "AI for Garage Door Companies" with a supporting subtitle naming the pain (after-hours broken-spring emergencies that go to voicemail while the homeowner cannot use their car), (b) three labeled pain-point cards - one for after-hours broken-spring and stuck-door emergencies, one for long-tail opener-brand and spring-size triage (door dimensions, opener brand like LiftMaster or Chamberlain or Genie, spring type torsion vs extension, insulated vs single-panel, section replacement vs full-door), one for next-day appointment-window confirmations and technician-on-the-way follow-ups between booking and arrival, (c) three demo cards linking to `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, `/homeservices/demo/voice-followup` (identical hrefs to ticket 0087), each with a garage-door-specific one-line "why this matters" line under the CTA label, (d) a "Book a 15-minute strategy call" CTA at the bottom pointing at the existing homepage strategy-call anchor. Every string on the page is written in the defensible brand voice per AGENTS.md: no invented client names, no invented percentages, no invented dollar amounts above a defensible industry ballpark, hyphens not em-dashes per the 2026-05-07 em-dash Hard NO.
- [ ] A new route entry at `src/App.tsx` mapping `/ai-for-garage-door-companies` to the new page component, imported through the existing `React.lazy` pattern all other trade-landing pages use per the 2026-09-05 route-code-splitting lesson. Wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell.
- [ ] A new entry in `src/data/routes.ts` (the canonical route allow-list) exactly `'/ai-for-garage-door-companies'`, placed alphabetically with the other `/ai-for-*` routes per the file's existing ordering convention (between `/ai-for-electricians` and `/ai-for-hospitality`). Per the 2026-06-07 mirror-source-across-src-tests lesson, `tests/e2e/routes.ts` continues to re-export `ROUTES` verbatim and requires no separate edit.
- [ ] A new entry in `public/sitemap.xml` for `<url><loc>https://digitalcraftai.com/ai-for-garage-door-companies</loc><lastmod>2026-09-22</lastmod><priority>0.7</priority></url>` (mirroring the priority and lastmod pattern of ticket 0087's sitemap row per the 2026-05-28 sitemap-lastmod lesson). If the sitemap is auto-generated by `scripts/generate-sitemap.ts` (per ticket 0022 and confirmed in the ticket 0087 implementer note that the generator reads routes from `src/App.tsx`), the entry is emitted via the generator's existing enumeration; no manual XML edit required and the implementer confirms auto-inclusion in the Implementation log by grepping `dist/sitemap.xml` for `/ai-for-garage-door-companies` after a local build.
- [ ] The page emits three JSON-LD blocks inside its `<Helmet>` block matching the trade-page family shape: (1) `Service` describing the AI-for-garage-doors offering, (2) `BreadcrumbList` positioning the page under the homepage (two levels: Home, AI for Garage Door Companies), (3) `FAQPage` enumerating three vertical-specific FAQ items whose question and answer strings mirror the visible FAQ cards on the page byte-for-byte per the 2026-05-25 mirror-source rule. The exact shape mirrors ticket 0087's emission on `AiForWindowInstallers.tsx`; the implementer greps that file first and copies the JSON-LD block structure verbatim, substituting the garage-door copy.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'Service'`, `=== 'BreadcrumbList'`, and `=== 'FAQPage'` predicates and any "exactly one" / `toHaveLength(1)` assertions over those `@type`s. Every predecessor trade-page assertion is URL-scoped (its poll navigates to its own trade path per the ticket 0087 Implementation log), so the sibling instance on `/ai-for-garage-door-companies` cannot collide. The grep result is documented in the Implementation log.
- [ ] Per the 2026-05-07 em-dash Hard NO, every string emitted on the page AND every string emitted into the three JSON-LD blocks AND every string in the new e2e spec is hyphen-only. Self-Review greps the diff for `String.fromCharCode(8212)` before pushing. No fake client testimonials, no invented percentages (no "increase close rate by 40%"), no fabricated dollar savings, no invented shop names, no invented average-spring-lifetime figures the ticket cannot cite to a defensible public industry source.
- [ ] The page ships full dark-mode support: every Tailwind color class carries its `dark:` variant, mirroring `AiForWindowInstallers.tsx` verbatim. A viewport-width check on 375px, 768px, and 1280px shows the three pain-point cards stacking, then two-up, then three-up (matching the predecessor grid class pattern).
- [ ] A new e2e spec at `tests/e2e/ai-for-garage-door-companies.spec.ts` (modeled on `tests/e2e/ai-for-window-installers.spec.ts` from ticket 0087) asserts, using a `gotoGarageDoorCompanies(page)` helper that navigates to `/ai-for-garage-door-companies` and waits for RouteFallback detach per the 2026-09-05 lesson and the H1 mount signal per the 2026-09-10 lesson: (1) `GET /ai-for-garage-door-companies` returns 200, (2) the page renders an H1 containing the text "Garage Door Companies" (case-insensitive), (3) the page renders exactly three demo-card CTAs with hrefs `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, `/homeservices/demo/voice-followup`, (4) exactly one `Service` JSON-LD block on the page with a `name` field containing "Garage Door Companies", (5) exactly one `BreadcrumbList` block with two `itemListElement` entries whose names are "Home" and "AI for Garage Door Companies", (6) exactly one `FAQPage` block whose `mainEntity` array length equals the count of visible FAQ cards rendered on the page (byte-identical mirror-source assertion per the 2026-05-25 rule), (7) per the 2026-09-08 em-dash-JSON-LD-block-filter lesson the em-dash check scopes ONLY to the three blocks THIS page emits (Service, BreadcrumbList, FAQPage) filtered by their `@type`, NOT to every `application/ld+json` block on the page (the homepage Organization block from `index.html` carries a legitimate em-dash and must not be flagged), (8) every string in the rendered page body contains zero `String.fromCharCode(8212)` code points, (9) the page renders cleanly in both light and dark mode (the `html.dark` class toggle test pattern from ticket 0087's spec), (10) the "Book a 15-minute strategy call" CTA at the bottom fires `trackCTAClick('garage_door_companies_book_call', 'garage_door_companies_footer')` on click.
- [ ] Standard box: no `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any of the fourteen predecessor trade-page files. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the fourteen predecessor trade-page specs (0017 through 0087) all stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- No `/api/` changes, no
  `package.json` changes, no
  em-dashes in copy, dark-
  mode required (this ticket
  ships one new page plus one
  new route plus one new
  sitemap entry plus one new
  spec plus three JSON-LD
  blocks mirroring the ticket
  0087 pattern).
- A new home-services demo
  scoped to garage-door
  repair. The three existing
  `/homeservices/demo/*`
  demos already cover the
  flows the page needs
  (lead-responder, estimate,
  voice-followup); adding a
  fourth demo is a separate
  ticket.
- A blog post about AI for
  garage door companies. A
  blog post is its own
  content ticket and a
  separate PR per the
  AGENTS.md blog-date rule.
- A comparison page like
  "Digital Craft vs
  ServiceTitan" scoped to
  garage-door dispatch.
  Comparison pages are a
  distinct area (SEO) with
  a different template and
  ServiceTitan already
  ships at
  `/compare/servicetitan`
  (ticket 0028).
- A case study for a
  garage-door client. Case
  studies must be real per
  the no-fake Hard NO; a
  case study only ships
  when a real client's data
  is available.
- Adding garage-door-
  specific data files
  (`src/data/garageDoorPricing.ts`,
  a `src/data/springSizes.ts`
  torsion-vs-extension
  allow-list, or an
  opener-brand table). The
  `/homeservices/demo/estimate`
  demo already ships home-
  services pricing data
  that generalizes to
  garage-door repair; a
  garage-door-specific
  pricing file is
  premature and would
  risk fabricating
  spring-lifetime or
  opener-brand data.
- Editing the fourteen
  predecessor trade-page
  files (`AiForPlumbers.tsx`
  through
  `AiForWindowInstallers.tsx`).
  Every predecessor stays
  byte-identical.
- Adding a "garage door
  companies" filter chip on
  `/homeservices` or
  `/demos`. Filter UI on
  the demo hubs is a
  distinct ticket.
- Cross-linking
  `/ai-for-garage-door-companies`
  from `/subprocessors`,
  `/uptime`, `/ethics`,
  `/security`, or
  `/case-studies`. Cross-
  surface promotion is its
  own follow-up ticket.
- Adding a Service Area
  JSON-LD field
  enumerating specific
  cities or states. The
  page is a national
  landing page; city-
  specific SEO is a
  distinct location-page
  ticket (per the ticket
  0051 `/locations/texas`
  LocalBusiness precedent).
- Adding manufacturer
  brand-name endorsements
  or "authorized dealer"
  claims to the copy.
  Manufacturer partnership
  claims risk becoming
  stale between ship and
  the next dealer-program
  cycle; the page names
  the pain (opener-brand
  triage) without
  asserting Digital Craft
  is endorsed by any
  specific manufacturer.
- Emitting a `Product` or
  `Offer` JSON-LD block
  for a specific
  garage-door model or
  opener SKU. Digital
  Craft does not itself
  sell garage-door
  hardware; emitting
  such a block would
  misrepresent the
  artifact per the
  AGENTS.md conservative-
  claims rule.
- Adding a lead-capture
  form scoped to garage-
  door companies (an
  email input above the
  demo cards). Every
  trade-page predecessor
  uses the same strategy-
  call CTA pattern; a
  garage-door-specific
  capture form would
  fragment the funnel.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New
  `src/pages/AiForGarageDoorCompanies.tsx`
  (under 200 lines). Mirror
  the file structure of
  `src/pages/AiForWindowInstallers.tsx`
  (ticket 0087) verbatim:
  same imports, same
  section layout, same
  three-card pain-point
  grid, same three-card
  demo grid, same footer
  CTA. Every Tailwind color
  class carries its `dark:`
  variant. Substitute the
  garage-door copy in every
  string slot; leave every
  href identical.
- Copy for the pain-point
  cards is defensible per
  AGENTS.md: name the pain
  without inventing
  percentages, dollar
  figures, or client
  attributions. Draw the
  pain language from public
  garage-door-industry
  knowledge (broken spring,
  stuck door, opener brand,
  spring type, appointment
  window, technician on
  the way) without citing
  specific spring-lifetime
  cycle counts, opener
  wattage claims, or
  manufacturer brand
  endorsements.
- `src/App.tsx` - add
  `<Route path="/ai-for-garage-door-companies" element={<AiForGarageDoorCompanies />} />`
  next to the existing
  `/ai-for-electricians`
  route (alphabetical
  position), wrapped in
  the existing
  `<Suspense fallback={<RouteFallback />}>`
  shell and lazy-imported
  via
  `React.lazy(() => import('./pages/AiForGarageDoorCompanies'))`
  per the 2026-09-05 route-
  code-splitting lesson.
- `src/data/routes.ts` -
  add
  `/ai-for-garage-door-companies`
  to the `ROUTES` array
  alphabetically per the
  file's ordering
  convention (between
  `/ai-for-electricians`
  and `/ai-for-hospitality`).
- Per the 2026-05-30
  second-@type lesson,
  BEFORE writing code grep
  every
  `tests/e2e/*-jsonld.spec.ts`
  for `=== 'Service'`,
  `=== 'BreadcrumbList'`,
  and `=== 'FAQPage'`
  predicates. Predecessor
  candidates as of
  2026-09-22: every
  `tests/e2e/ai-for-*.spec.ts`
  (0017 through 0087),
  plus the ticket 0079
  `/blog` CollectionPage
  spec (BreadcrumbList
  only), plus every
  compare-page spec for
  BreadcrumbList, plus
  the ticket 0012
  pricing-FAQ spec for
  FAQPage. Each
  predecessor is URL-
  scoped so the sibling on
  `/ai-for-garage-door-companies`
  cannot collide. The
  grep result is
  documented in the
  Implementation log.
- Per the 2026-09-08 em-
  dash-JSON-LD-block-
  filter lesson, the em-
  dash check in the spec
  scopes ONLY to the
  three blocks THIS page
  emits (Service,
  BreadcrumbList,
  FAQPage) filtered by
  their `@type`, NOT to
  every `application/ld+json`
  block on the page. The
  homepage Organization
  block from `index.html`
  carries a legitimate
  em-dash and must not
  be flagged by the
  /ai-for-garage-door-
  companies spec.
- Per the 2026-05-25
  mirror-source rule,
  every FAQ question and
  answer string that
  appears on both the
  visible FAQ card AND
  the FAQPage JSON-LD is
  read from one shared
  constant (mirror the
  ticket 0087 pattern in
  `AiForWindowInstallers.tsx`).
- Per the 2026-05-07
  em-dash Hard NO, every
  string in every touched
  file is hyphen-only.
  Self-Review greps the
  diff for
  `String.fromCharCode(8212)`
  before pushing.
- Per the 2026-09-05
  route-fallback and
  2026-09-10 mount-signal
  lessons, the new spec's
  `gotoGarageDoorCompanies`
  helper waits for
  RouteFallback detach
  AND the H1 to be
  visible before reading
  page state.
- Per the 2026-05-22
  two-PR ship lesson,
  ship will need a
  follow-up
  `chore/0089-ship-status`
  PR after the feat PR
  merges to flip the
  ticket frontmatter AND
  its `docs/backlog/README.md`
  index row to `shipped`
  together; run
  `node scripts/check-backlog.mjs`
  before pushing the
  second PR so the file
  and index never drift
  mid-flip.
- New deps: NO. The page
  reuses `react-helmet-async`,
  `react-router-dom`, the
  existing `trackCTAClick`
  helper, the existing UI
  primitives from
  `@/components/ui/*`, and
  Tailwind utility classes.
  Schema migration: no.
  Privacy / security
  surface change: NO - the
  page is a passive read-
  only surface with no
  persistent store, no
  network call, no
  visitor input capture.

## Implementation log

(Appended by the implementation-dev agent during execution.)
