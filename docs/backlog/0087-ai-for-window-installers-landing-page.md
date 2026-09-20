---
id: 0087
title: AI-for-window-installers long-tail landing page funneling into home-services demos
status: in-progress
priority: P1
area: content
created: 2026-09-20
owner: gtm-innovation
---

## User story

As the owner or lead estimator of a residential
window-and-door installation business (a
three-crew local window replacement contractor,
a full-frame vinyl and fiberglass installer
running four trucks, a regional
window-and-siding hybrid, an Andersen or Pella
authorized dealer running in-home quotes, a
storm-window specialist covering hurricane-prone
coastal counties) Googling "AI for window
installers," "window company answering service
AI," "AI receptionist for window contractors,"
"AI quote assistant for windows," or "window
installer sales AI" on a phone between in-home
measurement appointments after a $22k
whole-house replacement inbound went to
voicemail, I want one honest long-tail landing
page at `/ai-for-window-installers` that names
the three specific pain points that bleed
window-installer margin (whole-house replacement
inbounds that go to voicemail during an in-home
measurement, long-tail glazing and frame-
material questions that a dispatcher cannot
answer without the opening dimensions in hand,
manufacturer-lead-time and permit follow-up
cadence that slips between contract signing and
install day), and that funnels into the three
live home-services demos the page reuses
verbatim (`/homeservices/demo/lead-responder`,
`/homeservices/demo/estimate`,
`/homeservices/demo/voice-followup`), so that I
can try the AI agent on my own phone before
deciding to book a 15-minute strategy call.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the long-
tail trade-landing pattern is now proven across
THIRTEEN shipped pages (`src/pages/AiForPlumbers.tsx`
0017, `AiForHvac.tsx` 0020, `AiForRoofers.tsx`
0024, `AiForElectricians.tsx` 0034,
`AiForPainters.tsx` 0037, `AiForLandscapers.tsx`
0041, `AiForPropertyManagers.tsx` 0047,
`AiForCleaningServices.tsx` 0050,
`AiForPestControl.tsx` 0056, `AiForPoolService.tsx`
0058, `AiForRestorationServices.tsx` 0072,
`AiForMovingCompanies.tsx` 0080,
`AiForSolarInstallers.tsx` 0084). Each is a flat
copy-replace of its predecessor with vertical-
specific pain points and three demo cards
routing into the same `/homeservices/demo/*`
family. Window installers is the fourteenth
vertical and is structurally closest to solar
installers (ticket 0084) and roofers (ticket
0024) because all three are envelope-work
residential service trades with a long-cycle
sale (a whole-house window replacement contract
commonly runs $12k to $35k with a 4-8 week
manufacturer lead time), where the inbound-
response speed on the first call materially
determines close-rate against competing
installers who bid the same in-home
measurement. Adding the fourteenth landing page
is exactly one new file
(`src/pages/AiForWindowInstallers.tsx`, modeled
1:1 on `AiForSolarInstallers.tsx` from ticket
0084), one new entry in `src/data/routes.ts`,
one new route in `src/App.tsx`, one new entry
in the public sitemap, and one new spec file.
The three demo CTAs route into the existing
`/homeservices/demo/*` demos with no new demo
build, no new backend, no new data, no new
component.

### Stakeholder

This widens the SEO moat in a query class
adjacent to but strictly separate from the
thirteen existing trade pages: "AI for window
installers," "window company answering service
AI," "AI receptionist for window contractors,"
"AI quote assistant for windows," "AI for
window and door dealers." Window-installer
inbounds sit alongside solar and roofing as
the highest ticket-value envelope trades on
the home-services adjacent surface (a booked-
and-closed whole-house window replacement
commonly clears $12k to $35k in gross revenue
vs. a moving-company booked estimate around
$500 to $3,000 or an HVAC tune-up around $80
to $250), so a single captured lead per week
on the new page produces materially higher
expected pipeline value than a comparable
capture on the mid-ticket predecessor pages,
and the audience is more likely to book a
strategy call because a missed $22k inbound is
a materially higher-priced loss than a missed
$250 tune-up inbound. Per the ticket 0084
precedent, a new trade page adds one indexable
long-tail head-term surface AND one new
internal-link node in the home-services SEO
graph. The home-services demo family already
exercises the exact three flows a window
installer needs (inbound lead qualification
with opening-count, frame-material, and
glass-package triage; ballpark quote generation
from opening-count and frame-material inputs;
manufacturer-lead-time and install-day follow-
up voice callback), so the new page ships zero
new demo surface. Per the 2026-05-30 second-
@type lesson and the ticket 0084 implementer
notes, the pre-code grep across every
`tests/e2e/*-jsonld.spec.ts` confirmed the
trade-page family emits Service plus
BreadcrumbList plus FAQPage JSON-LD with
URL-scoped assertions, so a sibling instance on
`/ai-for-window-installers` does not collide
with the thirteen predecessor instances.

### User (in the real moment of use)

A three-crew window installer on a phone at
7pm Tuesday after the last sash is glazed on a
whole-house replacement finds the day's
missed-call log shows two inbound in-home
measurement requests that never called back
(one voicemail from a homeowner mentioning
"the drafty windows in the kitchen," one text
with a photo of a rotted double-hung frame).
He Googles "AI for window installers" on his
phone. The SERP surfaces
`/ai-for-window-installers` with a meta
description naming the three pain points
verbatim. One tap and the page loads on a
375px viewport with a hero H1 ("AI for Window
Installers") and a subtitle naming the pain
(whole-house replacement inbounds that go to
voicemail during an in-home measurement). He
scrolls, reads the three pain points in their
own labeled cards, taps the first "Try the AI
receptionist demo" CTA, and lands on
`/homeservices/demo/lead-responder` which is
already seeded with a window-installer intake
prompt. He chats with the demo for two
minutes, watches it triage his mock inbound
(15 openings, mixed double-hung and picture,
vinyl frame preference, argon-fill glass
package, ready to book an in-home measurement
next Saturday) and hand back a captured lead
summary, taps back to the landing page,
scrolls to the "Book a 15-minute strategy
call" CTA at the bottom, and books. No mobile
scroll trap, no dead links, no non-defensible
claim. Light and dark mode both read cleanly.

### Growth

The "show me" moment is the SERP result: a
window installer Googling "AI for window
installers" from a phone late Tuesday finds
`/ai-for-window-installers` at the top of the
long-tail SERP, taps in, and books a strategy
call from her thumb before the next inbound
rings. That is the single cheapest audience-
acquisition signal the site can produce for
the window vertical because the audience is
Googling at the exact moment their pain is
priced in the loss of a $22k-ticket booked
measurement. The generator ships as one new
page file plus one new route entry plus one
new spec plus one sitemap line; the growth
value is entirely in the SERP surface the
long-tail head term opens once Googlebot
indexes the page.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page at `src/pages/AiForWindowInstallers.tsx` (new file, under 200 lines) modeled 1:1 on `src/pages/AiForSolarInstallers.tsx` (ticket 0084, the freshest predecessor in the same home-services family). The page renders: (a) a hero H1 "AI for Window Installers" with a supporting subtitle naming the pain (whole-house replacement inbounds that go to voicemail during an in-home measurement), (b) three labeled pain-point cards - one for after-hours whole-house measurement inbounds, one for long-tail frame-material and glass-package triage (opening count, frame material like vinyl or fiberglass or wood, glass package like argon-fill or low-e, egress compliance, storm-shutter compatibility), one for manufacturer-lead-time and install-day follow-up cadence between signing and install, (c) three demo cards linking to `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, `/homeservices/demo/voice-followup` (identical hrefs to ticket 0084), each with a window-installer-specific one-line "why this matters" line under the CTA label, (d) a "Book a 15-minute strategy call" CTA at the bottom pointing at the existing homepage strategy-call anchor. Every string on the page is written in the defensible brand voice per AGENTS.md: no invented client names, no invented percentages, no invented dollar amounts above a defensible industry ballpark, hyphens not em-dashes.
- [ ] A new route entry at `src/App.tsx` mapping `/ai-for-window-installers` to the new page component, imported through the existing `React.lazy` pattern all other trade-landing pages use per the 2026-09-05 route-code-splitting lesson. Wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell.
- [ ] A new entry in `src/data/routes.ts` (the canonical route allow-list) exactly `'/ai-for-window-installers'`, alphabetically placed with the other `/ai-for-*` routes per the file's existing ordering convention. Per the 2026-06-07 mirror-source-across-src-tests lesson, `tests/e2e/routes.ts` continues to re-export `ROUTES` verbatim and requires no separate edit.
- [ ] A new entry in `public/sitemap.xml` for `<url><loc>https://digitalcraftai.com/ai-for-window-installers</loc><lastmod>2026-09-20</lastmod><priority>0.7</priority></url>` (mirroring the priority and lastmod pattern of ticket 0084's sitemap row per the 2026-05-28 sitemap-lastmod lesson). If the sitemap is auto-generated by `scripts/generate-sitemap.ts` (per ticket 0022 and confirmed in the ticket 0084 implementer note that the generator reads routes from `src/App.tsx`), the entry is emitted via the generator's existing enumeration; no manual XML edit required and the implementer confirms auto-inclusion in the Implementation log by grepping `dist/sitemap.xml` for `/ai-for-window-installers` after a local build.
- [ ] The page emits three JSON-LD blocks inside its `<Helmet>` block matching the trade-page family shape: (1) `Service` describing the AI-for-windows offering, (2) `BreadcrumbList` positioning the page under the homepage (two levels: Home, AI for Window Installers), (3) `FAQPage` enumerating three vertical-specific FAQ items whose text mirrors the visible FAQ cards on the page byte-for-byte per the 2026-05-25 mirror-source rule. The exact shape mirrors ticket 0084's emission on `AiForSolarInstallers.tsx`; the implementer greps that file first and copies the JSON-LD block structure verbatim, substituting the window-installer copy.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'Service'`, `=== 'BreadcrumbList'`, and `=== 'FAQPage'` predicates and any "exactly one" / `toHaveLength(1)` assertions over those `@type`s. Every predecessor trade-page assertion is URL-scoped (its poll navigates to its own trade path per the ticket 0084 Implementation log), so the sibling instance on `/ai-for-window-installers` cannot collide. The grep result is documented in the Implementation log.
- [ ] Per the 2026-05-07 em-dash Hard NO, every string emitted on the page AND every string emitted into the three JSON-LD blocks AND every string in the new e2e spec is hyphen-only. Self-Review greps the diff for `String.fromCharCode(8212)` before pushing. No fake client testimonials, no invented percentages (no "increase close rate by 40%"), no fabricated dollar savings, no invented installer names, no invented average-opening-count figures the ticket cannot cite to a defensible public industry source.
- [ ] The page ships full dark-mode support: every Tailwind color class carries its `dark:` variant, mirroring `AiForSolarInstallers.tsx` verbatim. A viewport-width check on 375px, 768px, and 1280px shows the three pain-point cards stacking, then two-up, then three-up (matching the predecessor grid class pattern).
- [ ] A new e2e spec at `tests/e2e/ai-for-window-installers.spec.ts` (modeled on `tests/e2e/ai-for-solar-installers.spec.ts` from ticket 0084) asserts, using a `gotoWindowInstallers(page)` helper that navigates to `/ai-for-window-installers` and waits for RouteFallback detach per the 2026-09-05 lesson and mount signal per the 2026-09-10 lesson: (1) `GET /ai-for-window-installers` returns 200, (2) the page renders an H1 containing the text "Window Installers" (case-insensitive), (3) the page renders exactly three demo-card CTAs with hrefs `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, `/homeservices/demo/voice-followup`, (4) exactly one `Service` JSON-LD block on the page with a `name` field containing "Window Installers", (5) exactly one `BreadcrumbList` block with two `itemListElement` entries whose names are "Home" and "AI for Window Installers", (6) exactly one `FAQPage` block whose `mainEntity` array length equals the count of visible FAQ cards rendered on the page (byte-identical mirror-source assertion), (7) per the 2026-09-08 em-dash-JSON-LD-block-filter lesson the em-dash check scopes ONLY to the three blocks THIS page emits (Service, BreadcrumbList, FAQPage) filtered by their `@type`, NOT to every `application/ld+json` block on the page (the homepage Organization block from `index.html` carries a legitimate em-dash and must not be flagged), (8) every string in the rendered page body contains zero `String.fromCharCode(8212)` code points, (9) the page renders cleanly in both light and dark mode (the `html.dark` class toggle test pattern from ticket 0084's spec), (10) the "Book a 15-minute strategy call" CTA at the bottom fires `trackCTAClick('window_installers_book_call', 'window_installers_footer')` on click.
- [ ] Standard box: no `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any of the thirteen predecessor trade-page files. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the thirteen predecessor trade-page specs (0017 through 0084) all stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- No `/api/` changes, no
  `package.json` changes, no em-
  dashes in copy, dark-mode
  required (this ticket ships one
  new page plus one new route plus
  one new sitemap entry plus one
  new spec plus three JSON-LD
  blocks mirroring the ticket 0084
  pattern).
- A new home-services demo scoped
  to window installers. The three
  existing `/homeservices/demo/*`
  demos already cover the flows
  the page needs (lead-responder,
  estimate, voice-followup);
  adding a fourth demo is a
  separate ticket.
- A blog post about AI for window
  installers. A blog post is its
  own content ticket and a
  separate PR per the AGENTS.md
  blog-date rule.
- A comparison page like "Digital
  Craft vs Renoworks" or "vs
  Andersen Windows." Comparison
  pages are a distinct area (SEO)
  with a different template.
- A case study for a window-
  installer client. Case studies
  must be real per the no-fake
  Hard NO; a case study only
  ships when a real client's
  data is available.
- Adding window-specific data
  files (`src/data/windowPricing.ts`,
  a `src/data/frameMaterials.ts`
  frame-material allow-list, or a
  manufacturer-lead-time table).
  The `/homeservices/demo/estimate`
  demo already ships home-services
  pricing data that generalizes to
  windows; a window-specific
  pricing file is premature and
  would risk fabricating
  manufacturer-lead-time data.
- Editing the thirteen predecessor
  trade-page files
  (`AiForPlumbers.tsx` through
  `AiForSolarInstallers.tsx`).
  Every predecessor stays byte-
  identical.
- Adding a "window installers"
  filter chip on `/homeservices`
  or `/demos`. Filter UI on the
  demo hubs is a distinct ticket.
- Cross-linking `/ai-for-window-
  installers` from `/subprocessors`,
  `/uptime`, `/ethics`, `/security`,
  or `/case-studies`. Cross-surface
  promotion is its own follow-up
  ticket.
- Adding a Service Area JSON-LD
  field enumerating specific
  cities or states. The page is a
  national landing page; city-
  specific SEO is a distinct
  location-page ticket (per the
  ticket 0051 `/locations/texas`
  LocalBusiness precedent).
- Adding energy-tax-credit or
  hurricane-code claims to the
  pain-point copy. Incentive-rate
  and building-code copy risks
  becoming stale between ship and
  the next tax cycle or code
  update; the page names the pain
  (glazing and frame-material
  triage) without asserting
  specific tax-credit percentages
  or state code numbers.
- Emitting a `Product` or
  `Offer` JSON-LD block for a
  specific window model or SKU.
  Digital Craft does not itself
  sell windows; emitting such a
  block would misrepresent the
  artifact per the AGENTS.md
  conservative-claims rule.
- Adding a lead-capture form
  scoped to windows (an email
  input above the demo cards).
  Every trade-page predecessor
  uses the same strategy-call
  CTA pattern; a window-
  specific capture form would
  fragment the funnel.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/AiForWindowInstallers.tsx`
  (under 200 lines). Mirror the file
  structure of
  `src/pages/AiForSolarInstallers.tsx`
  (ticket 0084) verbatim: same
  imports, same section layout,
  same three-card pain-point grid,
  same three-card demo grid, same
  footer CTA. Every Tailwind color
  class carries its `dark:`
  variant. Substitute the window-
  installer copy in every string
  slot; leave every href identical.
- Copy for the pain-point cards
  is defensible per AGENTS.md:
  name the pain without inventing
  percentages, dollar figures, or
  client attributions. Draw the
  pain language from public
  window-industry knowledge (in-
  home measurement, frame
  material, glass package,
  manufacturer lead time,
  install day) without citing
  specific state tax-credit
  rates, utility company names,
  or window manufacturer brand
  names.
- `src/App.tsx` - add
  `<Route path="/ai-for-window-installers" element={<AiForWindowInstallers />} />`
  next to the existing
  `/ai-for-solar-installers`
  route, wrapped in the existing
  `<Suspense fallback={<RouteFallback />}>`
  shell and lazy-imported via
  `React.lazy(() => import('./pages/AiForWindowInstallers'))`
  per the 2026-09-05 route-code-
  splitting lesson.
- `src/data/routes.ts` - add
  `/ai-for-window-installers` to
  the `ROUTES` array
  alphabetically per the file's
  ordering convention.
- Per the 2026-05-30 second-@type
  lesson, BEFORE writing code
  grep every
  `tests/e2e/*-jsonld.spec.ts`
  for `=== 'Service'`,
  `=== 'BreadcrumbList'`, and
  `=== 'FAQPage'` predicates.
  Predecessor candidates as of
  2026-09-20: every
  `tests/e2e/ai-for-*.spec.ts`
  (0017 through 0084), plus the
  ticket 0079 `/blog`
  CollectionPage spec
  (BreadcrumbList only), plus
  every compare-page spec for
  BreadcrumbList. Each
  predecessor is URL-scoped so
  the sibling on
  `/ai-for-window-installers`
  cannot collide. The grep
  result is documented in the
  Implementation log.
- Per the 2026-09-08 em-dash-
  JSON-LD-block-filter lesson,
  the em-dash check in the
  spec scopes ONLY to the three
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
  /ai-for-window-installers
  spec.
- Per the 2026-05-25 mirror-
  source rule, every FAQ
  question and answer string
  that appears on both the
  visible FAQ card AND the
  FAQPage JSON-LD is read from
  one shared constant (mirror
  the ticket 0084 pattern in
  `AiForSolarInstallers.tsx`).
- Per the 2026-05-07 em-dash
  Hard NO, every string in
  every touched file is
  hyphen-only. Self-Review
  greps the diff for
  `String.fromCharCode(8212)`
  before pushing.
- Per the 2026-09-05 route-
  fallback and 2026-09-10
  mount-signal lessons, the
  new spec's
  `gotoWindowInstallers`
  helper waits for
  RouteFallback detach AND
  the H1 to be visible before
  reading page state.
- Per the 2026-05-22 two-PR
  ship lesson, ship will need
  a follow-up
  `chore/0087-ship-status`
  PR after the feat PR merges
  to flip the ticket
  frontmatter AND its
  `docs/backlog/README.md`
  index row to `shipped`
  together; run
  `node scripts/check-backlog.mjs`
  before pushing the second
  PR so the file and index
  never drift mid-flip.
- New deps: NO. The page
  reuses `react-helmet-async`,
  `react-router-dom`, the
  existing `trackCTAClick`
  helper, the existing UI
  primitives from
  `@/components/ui/*`, and
  Tailwind utility classes.
  Schema migration: no.
  Privacy / security surface
  change: NO - the page is a
  passive read-only surface
  with no persistent store,
  no network call, no
  visitor input capture.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-20 - branch `feat/0087-ai-for-window-installers` opened off fresh `origin/main`; ticket frontmatter and README index row flipped to `in-progress` in the first commit per the 2026-05-22 two-PR ship lesson (the ship-status flip rides a follow-up `chore/0087-ship-status` PR after this feat PR merges).
- 2026-09-20 - Pre-code greps per the 2026-05-30 second-@type lesson: `grep -rn "'Service'\|'BreadcrumbList'\|'FAQPage'" tests/e2e/*-jsonld.spec.ts tests/e2e/ai-for-*.spec.ts | grep "toHaveLength(1)\|exactly one"` returns hits ONLY inside `tests/e2e/ai-for-*.spec.ts` files (plumbers, HVAC, roofers, electricians, painters, landscapers, property-managers, cleaning-services, pest-control, pool-service, restoration-services, moving-companies, solar-installers, hospitality) and each hit is preceded by a URL-scoped `goto<Vertical>(page)` helper that navigates to its own trade path first. A separate grep across `tests/e2e/*-jsonld.spec.ts` (blog CollectionPage, changelog ItemList, case-study Article, glossary Breadcrumb, quiz, Texas LocalBusiness, trust AboutPage) shows their `toHaveLength(1)` predicates are all scoped to their own routes and none assert exactly-one `Service` at the site level. Conclusion: a sibling instance of `Service`, `BreadcrumbList`, or `FAQPage` on `/ai-for-window-installers` cannot collide with any predecessor exactly-one assertion.
- 2026-09-20 - Pre-code confirmation per the 2026-06-07 src-imports-tests lesson: `tests/e2e/routes.ts` re-exports `ROUTES` from `../../src/data/routes`; the new route entry lands in `src/data/routes.ts` alphabetically between `/ai-for-solar-installers` and `/case-studies` (and after the other `/ai-for-*` entries).
- 2026-09-20 - Failing test added in `tests/e2e/ai-for-window-installers.spec.ts` modeled 1:1 on `tests/e2e/ai-for-solar-installers.spec.ts`; new page at `src/pages/AiForWindowInstallers.tsx` modeled 1:1 on `src/pages/AiForSolarInstallers.tsx`; `src/App.tsx` gains a lazy import + Route entry next to `/ai-for-solar-installers`; `src/data/routes.ts` gains the alphabetical entry. Post-build grep on `dist/sitemap.xml` confirms auto-inclusion of `/ai-for-window-installers` per the ticket 0022 sitemap generator.
- 2026-09-20 - PR #N opened, CI [state]
- 2026-09-20 - merged to main
