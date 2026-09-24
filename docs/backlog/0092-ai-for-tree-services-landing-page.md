---
id: 0092
title: AI-for-tree-services long-tail landing page funneling into home-services demos
status: shipped
priority: P1
area: content
created: 2026-09-24
owner: gtm-innovation
---

## User story

As the owner, arborist, or dispatcher of a
residential tree-service company (a single-
crew climber-and-groundman shop taking
storm-damage callouts, a two-crew removal-
and-pruning operation running a bucket truck
and a chipper, a full-service arboriculture
firm carrying ISA-certified arborists on
staff, a stump-grinding subcontractor
running one grinder off a trailer, an
emergency storm-response tree crew answering
utility-corridor callouts) Googling
"AI for tree services," "tree service
answering service AI," "AI receptionist for
arborists," "AI for tree removal companies,"
"AI dispatcher for storm damage calls," or
"AI for stump grinding companies" on a
phone in the truck between jobs after a
storm-response inbound went to voicemail
because both crews were mid-removal, I
want one honest long-tail landing page at
`/ai-for-tree-services` that names the three
specific pain points that bleed tree-service
margin (after-hours storm-damage emergency
inbounds that go to voicemail while a fallen
limb is on a customer's roof or driveway,
long-tail species-triage and access-triage
questions a dispatcher cannot answer without
seeing the tree in person, next-day
appointment-window confirmations and
technician-on-the-way follow-ups that slip
between the walk-through and the crew
arrival), and that funnels into the three
live home-services demos the page reuses
verbatim (`/homeservices/demo/lead-responder`,
`/homeservices/demo/estimate`,
`/homeservices/demo/voice-followup`), so
that I can try the AI agent on my own phone
before deciding to book a 15-minute strategy
call.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the
long-tail trade-landing pattern is now
proven across FIFTEEN shipped pages
(`AiForPlumbers.tsx` 0017,
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
`AiForWindowInstallers.tsx` 0087,
`AiForGarageDoorCompanies.tsx` 0089). Each
is a flat copy-replace of its predecessor
with vertical-specific pain points and three
demo cards routing into the same
`/homeservices/demo/*` family. Tree services
is the sixteenth vertical and is
structurally closest to landscapers (ticket
0041) and restoration services (ticket 0072)
because all three are outdoor-work service
trades whose inbound volume spikes after
weather events (a fallen limb after a
Thursday overnight thunderstorm is priced in
the homeowner's inability to leave the
driveway until the tree is cleared) and
whose triage requires species, size, and
access questions a dispatcher cannot resolve
without a photo or a site visit. Adding the
sixteenth landing page is exactly one new
file (`src/pages/AiForTreeServices.tsx`,
modeled 1:1 on `AiForGarageDoorCompanies.tsx`
from ticket 0089), one new entry in
`src/data/routes.ts`, one new route in
`src/App.tsx`, one new entry in the public
sitemap, and one new spec file. The three
demo CTAs route into the existing
`/homeservices/demo/*` demos with no new
demo build, no new backend, no new data,
no new component.

### Stakeholder

This widens the SEO moat in a query class
adjacent to but strictly separate from the
fifteen existing trade pages: "AI for tree
services," "tree service answering service
AI," "AI receptionist for arborists," "AI
dispatcher for storm damage calls," "AI for
tree removal companies," "AI for stump
grinding companies," "tree service AI voice
agent." Tree services sits alongside
restoration services and roofing as the
highest storm-response residential
service trades (a fallen-limb emergency
call is one of the most common weekend-
and-evening residential service inbounds
after a storm and commonly clears $400 to
$2,000 for a limb removal, with full-tree
removal running $600 to $3,500 and
emergency crane-assist removal running
$2,000 to $8,000 for high-risk near-
structure jobs), so a single captured
after-storm lead per week on the new
page produces materially higher expected
pipeline value than a comparable capture
on a next-day-schedule trade page, and
the audience is more likely to book a
strategy call because a missed storm-
response inbound is a materially higher-
priced loss than a next-day-schedule
miss. Per the ticket 0089 precedent, a
new trade page adds one indexable long-
tail head-term surface AND one new
internal-link node in the home-services
SEO graph. The home-services demo family
already exercises the exact three flows
a tree-service shop needs (inbound lead
qualification with species, size,
access, and hazard triage; ballpark
removal or pruning quote generation from
size and access inputs; on-the-way and
appointment-window voice callback), so
the new page ships zero new demo
surface. Per the 2026-05-30 second-@type
lesson and the ticket 0089 implementer
notes, the pre-code grep across every
`tests/e2e/*-jsonld.spec.ts` confirmed
the trade-page family emits Service plus
BreadcrumbList plus FAQPage JSON-LD with
URL-scoped assertions, so a sibling
instance on `/ai-for-tree-services` does
not collide with the fifteen predecessor
instances.

### User (in the real moment of use)

A single-crew tree-service owner sitting
in the truck at 8:15pm the evening after
a Thursday thunderstorm, having just
finished clearing a fallen limb off a
homeowner's driveway on the last call of
the day, sees the day's missed-call log
shows three after-hours inbound requests
that never called back (one voicemail
from a homeowner saying "there is a
huge oak branch hanging over my roof and
I am worried it is going to come down,"
one text with a photo of a snapped pine
across a fence, one voicemail from an
insurance adjuster asking about a same-
day emergency removal quote). He
Googles "AI for tree services" on his
phone. The SERP surfaces
`/ai-for-tree-services` with a meta
description naming the three pain
points verbatim. One tap and the page
loads on a 375px viewport with a hero
H1 ("AI for Tree Services") and a
subtitle naming the pain (after-hours
storm-damage inbounds that go to
voicemail while a limb is on a
homeowner's roof). He scrolls, reads
the three pain points in their own
labeled cards, taps the first "Try
the AI receptionist demo" CTA, and
lands on `/homeservices/demo/lead-
responder`. He chats with the demo
for two minutes, watches it triage
his mock inbound (60ft oak, limb
across roof, homeowner is home and
worried, ready to book earliest
next-morning slot) and hand back a
captured lead summary, taps back to
the landing page, scrolls to the
"Book a 15-minute strategy call"
CTA at the bottom, and books. No
mobile scroll trap, no dead links,
no non-defensible claim. Light and
dark mode both read cleanly.

### Growth

The "show me" moment is the SERP
result: a tree-service owner Googling
"AI for tree services" from a phone at
8:15pm after a storm finds
`/ai-for-tree-services` at the top of
the long-tail SERP, taps in, and
books a strategy call from his thumb
before the next storm-response call
rings. That is the single cheapest
audience-acquisition signal the site
can produce for the tree-service
vertical because the audience is
Googling at the exact moment their
pain is priced in the loss of an
after-storm emergency removal
booked by a competitor. The
generator ships as one new page
file plus one new route entry plus
one new spec plus one sitemap line;
the growth value is entirely in the
SERP surface the long-tail head
term opens once Googlebot indexes
the page.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page at `src/pages/AiForTreeServices.tsx` (new file, under 200 lines) modeled 1:1 on `src/pages/AiForGarageDoorCompanies.tsx` (ticket 0089, the freshest predecessor in the same home-services family). The page renders: (a) a hero H1 "AI for Tree Services" with a supporting subtitle naming the pain (after-hours storm-damage emergency inbounds that go to voicemail while a limb is on the homeowner's roof or driveway), (b) three labeled pain-point cards - one for after-hours storm-damage inbounds and fallen-limb emergencies, one for long-tail species-and-access triage (tree species like oak or pine or maple, trunk diameter and canopy height, drop-zone hazards including nearby structures or power lines, bucket-truck-vs-climber access, chipper-truck backup path, whether the job is pruning, full removal, or stump grinding), one for next-day appointment-window confirmations and crew-on-the-way follow-ups between the walk-through and the arrival, (c) three demo cards linking to `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, `/homeservices/demo/voice-followup` (identical hrefs to ticket 0089), each with a tree-service-specific one-line "why this matters" line under the CTA label, (d) a "Book a 15-minute strategy call" CTA at the bottom pointing at the existing homepage strategy-call anchor. Every string on the page is written in the defensible brand voice per AGENTS.md: no invented client names, no invented percentages, no invented dollar amounts above a defensible industry ballpark, hyphens not em-dashes per the 2026-05-07 em-dash Hard NO.
- [ ] A new route entry at `src/App.tsx` mapping `/ai-for-tree-services` to the new page component, imported through the existing `React.lazy` pattern all other trade-landing pages use per the 2026-09-05 route-code-splitting lesson. Wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell.
- [ ] A new entry in `src/data/routes.ts` (the canonical route allow-list) exactly `'/ai-for-tree-services'`, placed alphabetically with the other `/ai-for-*` routes per the file's existing ordering convention (between `/ai-for-solar-installers` and `/ai-for-window-installers` in the alphabetical run). Per the 2026-06-07 mirror-source-across-src-tests lesson, `tests/e2e/routes.ts` continues to re-export `ROUTES` verbatim and requires no separate edit.
- [ ] A new entry in `public/sitemap.xml` for `<url><loc>https://digitalcraftai.com/ai-for-tree-services</loc><lastmod>2026-09-24</lastmod><priority>0.7</priority></url>` (mirroring the priority and lastmod pattern of ticket 0089's sitemap row per the 2026-05-28 sitemap-lastmod lesson). If the sitemap is auto-generated by `scripts/generate-sitemap.ts` (per ticket 0022 and confirmed in ticket 0087 / 0089 implementer notes that the generator reads routes from `src/App.tsx`), the entry is emitted via the generator's existing enumeration; no manual XML edit required and the implementer confirms auto-inclusion in the Implementation log by grepping `dist/sitemap.xml` for `/ai-for-tree-services` after a local build.
- [ ] The page emits three JSON-LD blocks inside its `<Helmet>` block matching the trade-page family shape: (1) `Service` describing the AI-for-tree-services offering, (2) `BreadcrumbList` positioning the page under the homepage (two levels: Home, AI for Tree Services), (3) `FAQPage` enumerating three vertical-specific FAQ items whose question and answer strings mirror the visible FAQ cards on the page byte-for-byte per the 2026-05-25 mirror-source rule. The exact shape mirrors ticket 0089's emission on `AiForGarageDoorCompanies.tsx`; the implementer greps that file first and copies the JSON-LD block structure verbatim, substituting the tree-service copy.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'Service'`, `=== 'BreadcrumbList'`, and `=== 'FAQPage'` predicates and any "exactly one" / `toHaveLength(1)` assertions over those `@type`s. Every predecessor trade-page assertion is URL-scoped (its poll navigates to its own trade path per the ticket 0089 Implementation log), so the sibling instance on `/ai-for-tree-services` cannot collide. The grep result is documented in the Implementation log.
- [ ] Per the 2026-05-07 em-dash Hard NO, every string emitted on the page AND every string emitted into the three JSON-LD blocks AND every string in the new e2e spec is hyphen-only. Self-Review greps the diff for `String.fromCharCode(8212)` before pushing. No fake client testimonials, no invented percentages (no "increase close rate by 40%"), no fabricated dollar savings, no invented shop names, no invented average-tree-lifetime figures, and no ISA-certification endorsements the page cannot cite to a defensible public source.
- [ ] The page ships full dark-mode support: every Tailwind color class carries its `dark:` variant, mirroring `AiForGarageDoorCompanies.tsx` verbatim. A viewport-width check on 375px, 768px, and 1280px shows the three pain-point cards stacking, then two-up, then three-up (matching the predecessor grid class pattern).
- [ ] A new e2e spec at `tests/e2e/ai-for-tree-services.spec.ts` (modeled on `tests/e2e/ai-for-garage-door-companies.spec.ts` from ticket 0089) asserts, using a `gotoTreeServices(page)` helper that navigates to `/ai-for-tree-services` and waits for RouteFallback detach per the 2026-09-05 lesson and the H1 mount signal per the 2026-09-10 lesson: (1) `GET /ai-for-tree-services` returns 200, (2) the page renders an H1 containing the text "Tree Services" (case-insensitive), (3) the page renders exactly three demo-card CTAs with hrefs `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, `/homeservices/demo/voice-followup`, (4) exactly one `Service` JSON-LD block on the page with a `name` field containing "Tree Services", (5) exactly one `BreadcrumbList` block with two `itemListElement` entries whose names are "Home" and "AI for Tree Services", (6) exactly one `FAQPage` block whose `mainEntity` array length equals the count of visible FAQ cards rendered on the page (byte-identical mirror-source assertion per the 2026-05-25 rule), (7) per the 2026-09-08 em-dash-JSON-LD-block-filter lesson the em-dash check scopes ONLY to the three blocks THIS page emits (Service, BreadcrumbList, FAQPage) filtered by their `@type`, NOT to every `application/ld+json` block on the page (the homepage Organization block from `index.html` carries a legitimate em-dash and must not be flagged), (8) every string in the rendered page body contains zero `String.fromCharCode(8212)` code points, (9) the page renders cleanly in both light and dark mode (the `html.dark` class toggle test pattern from ticket 0089's spec), (10) the "Book a 15-minute strategy call" CTA at the bottom fires `trackCTAClick('tree_services_book_call', 'tree_services_footer')` on click. Per the 2026-06-15 attribute-list regex lesson, if the spec matches self-closing tags in JSON-LD stringified output, it uses `[^>]*` not `[^/>]*` so MIME-type attribute values do not break the match.
- [ ] Standard box: no `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any of the fifteen predecessor trade-page files. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the fifteen predecessor trade-page specs (0017 through 0089) all stay green.

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
  0089 pattern).
- A new home-services demo
  scoped to tree removal.
  The three existing
  `/homeservices/demo/*`
  demos already cover the
  flows the page needs
  (lead-responder, estimate,
  voice-followup); adding a
  fourth demo is a separate
  ticket.
- A blog post about AI for
  tree services. A blog
  post is its own content
  ticket and a separate PR
  per the AGENTS.md blog-
  date rule.
- A comparison page like
  "Digital Craft vs
  ArboStar" or "Digital
  Craft vs SingleOps"
  scoped to tree-service
  dispatch software.
  Comparison pages are a
  distinct area (SEO) with
  a different template.
- A case study for a
  tree-service client.
  Case studies must be
  real per the no-fake
  Hard NO; a case study
  only ships when a real
  client's data is
  available.
- Adding tree-service-
  specific data files
  (`src/data/treeSpecies.ts`,
  a `src/data/craneAccess.ts`
  allow-list, or a
  removal-pricing table).
  The `/homeservices/demo/estimate`
  demo already ships home-
  services pricing data
  that generalizes to
  tree work; a tree-
  service-specific pricing
  file is premature and
  would risk fabricating
  species-and-size
  removal-cost tables.
- Editing the fifteen
  predecessor trade-page
  files (`AiForPlumbers.tsx`
  through
  `AiForGarageDoorCompanies.tsx`).
  Every predecessor stays
  byte-identical.
- Adding a "tree services"
  filter chip on
  `/homeservices` or
  `/demos`. Filter UI on
  the demo hubs is a
  distinct ticket.
- Cross-linking
  `/ai-for-tree-services`
  from `/subprocessors`,
  `/uptime`, `/ethics`,
  `/security`, or
  `/case-studies`. Cross-
  surface promotion is
  its own follow-up
  ticket.
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
- Adding manufacturer or
  chainsaw-brand
  endorsements (Stihl,
  Husqvarna) or ISA-
  authorized-arborist
  claims to the copy.
  Brand partnership
  claims risk becoming
  stale between ship and
  the next credentialing
  cycle; the page names
  the pain (species-and-
  size triage) without
  asserting Digital Craft
  is endorsed by any
  specific manufacturer
  or credentialing body.
- Emitting a `Product`
  or `Offer` JSON-LD
  block for a specific
  removal or pruning
  package. Digital Craft
  does not itself sell
  tree-service labor;
  emitting such a block
  would misrepresent the
  artifact per the
  AGENTS.md conservative-
  claims rule.
- Adding a lead-capture
  form scoped to tree
  services (an email
  input above the demo
  cards). Every trade-
  page predecessor uses
  the same strategy-
  call CTA pattern; a
  tree-service-specific
  capture form would
  fragment the funnel.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New
  `src/pages/AiForTreeServices.tsx`
  (under 200 lines). Mirror
  the file structure of
  `src/pages/AiForGarageDoorCompanies.tsx`
  (ticket 0089) verbatim:
  same imports, same
  section layout, same
  three-card pain-point
  grid, same three-card
  demo grid, same footer
  CTA. Every Tailwind color
  class carries its `dark:`
  variant. Substitute the
  tree-service copy in
  every string slot; leave
  every href identical.
- Copy for the pain-point
  cards is defensible per
  AGENTS.md: name the pain
  without inventing
  percentages, dollar
  figures, or client
  attributions. Draw the
  pain language from
  public tree-service-
  industry knowledge
  (storm damage, fallen
  limb, drop zone,
  bucket-truck access,
  chipper backup path,
  species, canopy height,
  trunk diameter,
  appointment window,
  crew on the way)
  without citing specific
  cost-per-cubic-yard
  chipper figures, ISA-
  member certification
  counts, or manufacturer
  brand endorsements.
- `src/App.tsx` - add
  `<Route path="/ai-for-tree-services" element={<AiForTreeServices />} />`
  next to the existing
  `/ai-for-solar-installers`
  route (alphabetical
  position, between
  `/ai-for-solar-installers`
  and `/ai-for-window-installers`),
  wrapped in the existing
  `<Suspense fallback={<RouteFallback />}>`
  shell and lazy-imported
  via
  `React.lazy(() => import('./pages/AiForTreeServices'))`
  per the 2026-09-05
  route-code-splitting
  lesson.
- `src/data/routes.ts` -
  add
  `/ai-for-tree-services`
  to the `ROUTES` array
  alphabetically per the
  file's ordering
  convention (between
  `/ai-for-solar-installers`
  and `/ai-for-window-installers`).
  Per the 2026-09-12
  code-beats-prose lesson,
  the implementer greps
  the ACTUAL alphabetical
  order at branch head
  before inserting so the
  position matches the
  file's real convention
  even if the ticket's
  prose drifts.
- Per the 2026-05-25
  mirror-source rule,
  every FAQ question and
  answer string in the
  visible page body is
  the same string emitted
  into the FAQPage JSON-
  LD block. Do NOT hand-
  roll a second copy of
  the FAQ strings. Import
  the visible FAQ array
  into the Helmet JSON-LD
  block per the ticket
  0089 pattern.
- Per the 2026-05-30
  second-@type lesson,
  BEFORE writing code
  grep every
  `tests/e2e/*-jsonld.spec.ts`
  for `=== 'Service'`,
  `=== 'BreadcrumbList'`,
  and `=== 'FAQPage'`
  predicates. Predecessor
  candidates as of
  2026-09-24: every
  `tests/e2e/ai-for-*.spec.ts`
  (0017 through 0089),
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
  scoped so the sibling
  on `/ai-for-tree-services`
  cannot collide. The
  grep result is
  documented in the
  Implementation log.
- Per the 2026-09-05
  route-code-splitting
  lesson, the new
  page's e2e helper
  waits for the
  RouteFallback to
  detach and for the
  hero H1 to be visible
  before probing the
  DOM. Do NOT rely on
  `root.innerHTML.length > 500`
  alone; the fallback
  trips that heuristic
  before the lazy chunk
  mounts.
- Per the 2026-09-08
  em-dash-JSON-LD-
  block-filter lesson,
  the spec's em-dash
  assertion filters the
  block list to the
  three `@type`s THIS
  page emits before
  iterating; it does
  NOT loop over every
  `application/ld+json`
  script on the page
  (the homepage
  Organization block
  from `index.html`
  ships site-wide and
  carries a legitimate
  em-dash).
- Per the 2026-06-15
  attribute-list regex
  lesson, any regex in
  the new spec that
  matches an XML/HTML
  attribute list uses
  `[^>]*`, not
  `[^/>]*`, so slashes
  inside MIME types or
  paths do not break
  the match.
- Per the 2026-09-10
  raw-vs-sliced /
  mount-signal lesson,
  the spec asserts the
  page's rendered
  content via auto-
  retrying assertions
  (`await expect(locator).toHaveCount(N)`)
  rather than one-shot
  `.allTextContents()`
  / `.$$eval` counts.
- `tests/e2e/ai-for-tree-services.spec.ts`
  (new) - one assertion
  per acceptance box.
  Model the spec on
  `tests/e2e/ai-for-garage-door-companies.spec.ts`
  (ticket 0089), the
  freshest predecessor
  spec.
- Per the 2026-05-22
  two-PR ship lesson,
  ship will need a
  follow-up
  `chore/0092-ship-status`
  PR after the feat PR
  merges to flip the
  ticket frontmatter
  AND its
  `docs/backlog/README.md`
  index row to
  `shipped` together;
  run
  `node scripts/check-backlog.mjs`
  before pushing the
  second PR so the
  file and index never
  drift mid-flip.
- New deps: NO. The
  page reuses `react-
  router-dom`,
  `react-helmet-async`,
  `lucide-react`, and
  Tailwind utility
  classes already in
  use on the fifteen
  predecessor trade
  pages. Schema
  migration: no.
  Privacy / security
  surface change: no
  (the page renders
  server-side-safe
  static content; no
  new localStorage
  key, no new
  hostname, no new
  outbound network
  call).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-24 - branch `feat/0092-ai-for-tree-services-landing-page` opened; flipped ticket + README row to in-progress in the same first commit.
- 2026-09-24 - grep of every `tests/e2e/*-jsonld.spec.ts` and every `tests/e2e/ai-for-*.spec.ts` confirmed every `=== 'Service'` / `=== 'BreadcrumbList'` / `=== 'FAQPage'` predicate is URL-scoped via its own local goto helper. A sibling `/ai-for-tree-services`-scoped instance of each block cannot collide with any predecessor's exactly-one assertion.
- 2026-09-24 - Route placement in `src/App.tsx` and `src/data/routes.ts`: the file's actual convention on branch head is shipping order (garage-door-companies at the end of the ai-for-* run after solar and window), NOT strict alphabetical. Per the 2026-09-12 code-beats-prose lesson I mirrored the real convention and appended `/ai-for-tree-services` after `/ai-for-garage-door-companies` instead of inserting between solar and window as the ticket prose suggested.
- 2026-09-24 - failing test added in `tests/e2e/ai-for-tree-services.spec.ts` (modeled 1:1 on ticket 0089's `tests/e2e/ai-for-garage-door-companies.spec.ts`).
- 2026-09-24 - `src/pages/AiForTreeServices.tsx` implemented as a flat copy-replace of ticket 0089's `AiForGarageDoorCompanies.tsx`, dark: variants preserved throughout, TreePine lucide icon substituted for DoorOpen, tree-service copy (species, canopy, drop-zone, bucket-truck, chipper backup path, storm-damage) substituted in every string slot.
- 2026-09-24 - Sitemap auto-inclusion confirmed: after `npm run build`, `grep 'ai-for-tree-services' dist/sitemap.xml` returns `<loc>https://digitalcraftai.com/ai-for-tree-services</loc>` per the generator's routes.ts enumeration - no manual XML edit required.
- 2026-09-24 - Full local gate green: lint (0 errors), typecheck, check-links, check-images, check-meta, check-blog-dates, check-backlog, build all pass.
