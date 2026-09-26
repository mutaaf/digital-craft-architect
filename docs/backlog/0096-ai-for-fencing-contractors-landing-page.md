---
id: 0096
title: AI-for-fencing-contractors long-tail landing page funneling into home-services demos
status: shipped
priority: P1
area: content
created: 2026-09-26
owner: gtm-innovation
---

## User story

As the owner, foreman, or estimator of a residential or light-commercial
fencing contractor (a single-crew wood-privacy-fence installer running one
skid steer and a post-hole auger, a two-crew chain-link-and-vinyl operation
running a truck plus a trailer, a full-service outfit selling ornamental
aluminum, cedar privacy, chain link, PVC, and welded wire, a repair-and-gate-
service specialist replacing storm-damaged panels on turnaround work, an
HOA-and-property-manager sub carrying insurance and a warranty), Googling
"AI for fencing contractors," "fence installer answering service AI," "AI
receptionist for fence company," "AI estimator for fence installers," "AI
for fence repair companies," or "AI dispatcher for fence contractors" on a
phone in the truck between measures after a callback slipped through the
inbox, I want one honest long-tail landing page at
`/ai-for-fencing-contractors` that names the three specific pain points that
bleed fencing-contractor margin (after-hours inbound quote requests from
homeowners who want a same-week measure that go to voicemail while a crew
is on a Saturday install, long-tail linear-footage and material-choice
triage a dispatcher cannot answer without seeing the yard, and next-morning
measure-appointment and crew-on-the-way confirmations that slip between the
site visit and the arrival), and that funnels into the three live home-
services demos the page reuses verbatim (`/homeservices/demo/lead-responder`,
`/homeservices/demo/estimate`, `/homeservices/demo/voice-followup`), so
that I can try the AI agent on my own phone before deciding to book a
15-minute strategy call.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the long-tail trade-landing pattern
is now proven across SIXTEEN shipped pages (`AiForPlumbers.tsx` 0017,
`AiForHvac.tsx` 0020, `AiForRoofers.tsx` 0024, `AiForElectricians.tsx` 0034,
`AiForPainters.tsx` 0037, `AiForLandscapers.tsx` 0041,
`AiForPropertyManagers.tsx` 0047, `AiForCleaningServices.tsx` 0050,
`AiForPestControl.tsx` 0056, `AiForPoolService.tsx` 0058,
`AiForRestorationServices.tsx` 0072, `AiForMovingCompanies.tsx` 0080,
`AiForSolarInstallers.tsx` 0084, `AiForWindowInstallers.tsx` 0087,
`AiForGarageDoorCompanies.tsx` 0089, `AiForTreeServices.tsx` 0092). Each
is a flat copy-replace of its predecessor with vertical-specific pain
points and three demo cards routing into the same `/homeservices/demo/*`
family. Fencing contractors is the seventeenth vertical and is structurally
closest to landscapers (ticket 0041) and window installers (ticket 0087)
because all three are outdoor-work trades with a measure-then-install
workflow whose inbound volume runs on lawn-and-yard seasonality and whose
first-response window is a paid-lead-vs-lost-lead decision made in the
homeowner's ten-minute research burst. Adding the seventeenth landing page
is exactly one new file (`src/pages/AiForFencingContractors.tsx`, modeled
1:1 on `AiForTreeServices.tsx` from ticket 0092), one new entry in
`src/data/routes.ts`, one new route in `src/App.tsx`, one new entry in the
public sitemap (auto-emitted by the ticket 0022 generator from the routes
array per the ticket 0092 implementer's note), and one new spec file. The
three demo CTAs route into the existing `/homeservices/demo/*` demos with
no new demo build, no new backend, no new data, no new component.

### Stakeholder

This widens the SEO moat in a query class adjacent to but strictly separate
from the sixteen existing trade pages: "AI for fencing contractors," "fence
installer answering service AI," "AI receptionist for fence company," "AI
estimator for fence installers," "AI for fence repair companies," "fence
company AI voice agent." Fencing sits alongside landscaping, window
installation, and garage-door installation as the highest-volume
residential outdoor-improvement trades with a measure-then-install cadence
(a single missed after-hours quote request commonly clears $2,500 to
$9,000 for a residential wood-privacy install, with vinyl and ornamental
aluminum running higher and chain-link running lower depending on linear
footage and gate count), so a single captured after-hours lead per week on
the new page produces materially higher expected pipeline value than a
comparable capture on a same-day-service trade page, and the audience is
more likely to book a strategy call because a missed inbound is priced in
the loss of a $5,000 install to the competitor whose voicemail answered
first. Per the ticket 0089 and 0092 precedent, a new trade page adds one
indexable long-tail head-term surface AND one new internal-link node in
the home-services SEO graph. Per the 2026-05-30 second-@type lesson and
the ticket 0092 implementer notes, the pre-code grep across every
`tests/e2e/*-jsonld.spec.ts` confirmed the trade-page family emits Service
plus BreadcrumbList plus FAQPage JSON-LD with URL-scoped assertions, so a
sibling instance on `/ai-for-fencing-contractors` does not collide with the
sixteen predecessor instances.

### User (in the real moment of use)

A two-crew fencing-contractor owner sitting in the truck at 7:20am on a
Monday, having spent the weekend running two Saturday installs and letting
the office voicemail pile up, sees the missed-call log shows four
after-hours inbounds that never called back (one homeowner asking for a
measure on 180 linear feet of cedar privacy, one asking about a
storm-damaged panel replacement on chain link, one asking about vinyl
picket gate widths for a pool code sign-off, one property manager asking
about a Monday afternoon walk of a rental-property fence line). He Googles
"AI for fencing contractors" on his phone. The SERP surfaces
`/ai-for-fencing-contractors` with a meta description naming the three
pain points verbatim. One tap and the page loads on a 375px viewport with
a hero H1 ("AI for Fencing Contractors") and a subtitle naming the pain
(after-hours inbound quote requests from homeowners who want a same-week
measure that go to voicemail while the crew is on a Saturday install). He
scrolls, reads the three pain-point cards, taps the first "Try the AI
receptionist demo" CTA, and lands on `/homeservices/demo/lead-responder`.
He chats with the demo for two minutes, watches it triage his mock inbound
(180 linear feet, 6ft cedar privacy, one gate, no HOA restrictions, ready
to book a Wednesday measure), and hand back a captured lead summary. He
taps back to the landing page, scrolls to the "Book a 15-minute strategy
call" CTA at the bottom, and books. No mobile scroll trap, no dead links,
no non-defensible claim. Light and dark mode both read cleanly.

### Growth

The "show me" moment is the SERP result: a fencing-contractor owner
Googling "AI for fencing contractors" from a phone at 7:20am after a
Saturday install finds `/ai-for-fencing-contractors` at the top of the
long-tail SERP, taps in, and books a strategy call from his thumb before
the next weekday inbound rings. That is the single cheapest audience-
acquisition signal the site can produce for the fencing vertical because
the audience is Googling at the exact moment their pain is priced in the
loss of a same-week install booked by a competitor. The generator ships as
one new page file plus one new route entry plus one new spec plus a
sitemap auto-inclusion; the growth value is entirely in the SERP surface
the long-tail head term opens once Googlebot indexes the page.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against
this list before writing code.

- [ ] A new page at `src/pages/AiForFencingContractors.tsx` (new file, under
  200 lines) modeled 1:1 on `src/pages/AiForTreeServices.tsx` (ticket 0092,
  the freshest predecessor in the same home-services family). The page
  renders: (a) a hero H1 "AI for Fencing Contractors" with a supporting
  subtitle naming the pain (after-hours inbound quote requests from
  homeowners who want a same-week measure that go to voicemail while the
  crew is on a Saturday install), (b) three labeled pain-point cards - one
  for after-hours inbound quote requests and same-week-measure booking, one
  for long-tail linear-footage and material-choice triage (wood privacy,
  vinyl, ornamental aluminum, chain link, PVC picket, welded wire; 4ft,
  5ft, 6ft, 8ft heights; gate count, gate widths, post-spacing, HOA setback
  rules, pool-code sign-off), one for next-morning measure-appointment and
  crew-on-the-way confirmations between the site visit and the arrival,
  (c) three demo cards linking to `/homeservices/demo/lead-responder`,
  `/homeservices/demo/estimate`, `/homeservices/demo/voice-followup`
  (identical hrefs to ticket 0092), each with a fencing-specific one-line
  "why this matters" line under the CTA label, (d) a "Book a 15-minute
  strategy call" CTA at the bottom pointing at the existing homepage
  strategy-call anchor. Every string on the page is written in the
  defensible brand voice per AGENTS.md: no invented client names, no
  invented percentages, no invented dollar amounts above a defensible
  industry ballpark, hyphens not em-dashes per the 2026-05-07 em-dash
  Hard NO.
- [ ] A new route entry at `src/App.tsx` mapping `/ai-for-fencing-contractors`
  to the new page component, imported through the existing `React.lazy`
  pattern all other trade-landing pages use per the 2026-09-05 route-code-
  splitting lesson. Wrapped in the existing
  `<Suspense fallback={<RouteFallback />}>` shell.
- [ ] A new entry in `src/data/routes.ts` (the canonical route allow-list)
  exactly `'/ai-for-fencing-contractors'`. Per the 2026-09-12 code-beats-
  prose lesson AND the ticket 0092 implementer's note that the actual
  convention in `src/App.tsx` and `src/data/routes.ts` is shipping order
  (not strict alphabetical), the implementer greps the ACTUAL ordering at
  branch head before inserting and appends after the newest predecessor in
  the ai-for-* run (currently `/ai-for-tree-services`) rather than
  alphabetizing. Per the 2026-06-07 mirror-source-across-src-tests lesson,
  `tests/e2e/routes.ts` continues to re-export `ROUTES` verbatim and
  requires no separate edit.
- [ ] A new sitemap entry for `/ai-for-fencing-contractors` is emitted at
  build time. Per the ticket 0092 implementer's note that
  `scripts/generate-sitemap.ts` (ticket 0022) reads the routes array
  automatically, no manual XML edit is required and the implementer
  confirms auto-inclusion in the Implementation log by grepping
  `dist/sitemap.xml` for `/ai-for-fencing-contractors` after a local
  build. If a manual `public/sitemap.xml` addition IS required (i.e. the
  generator does not auto-include a new route), the implementer adds one
  new `<url>` entry with `<lastmod>2026-09-26</lastmod>` and
  `<priority>0.7</priority>` mirroring the ticket 0092 sitemap row per
  the 2026-05-28 sitemap-lastmod-encoded-invariant lesson.
- [ ] The page emits three JSON-LD blocks inside its `<Helmet>` block
  matching the trade-page family shape: (1) `Service` describing the
  AI-for-fencing-contractors offering, (2) `BreadcrumbList` positioning
  the page under the homepage (two levels: Home, AI for Fencing
  Contractors), (3) `FAQPage` enumerating three vertical-specific FAQ
  items whose question and answer strings mirror the visible FAQ cards on
  the page byte-for-byte per the 2026-05-25 mirror-source rule. The exact
  shape mirrors ticket 0092's emission on `AiForTreeServices.tsx`; the
  implementer greps that file first and copies the JSON-LD block structure
  verbatim, substituting the fencing copy.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the
  implementer greps every `tests/e2e/*-jsonld.spec.ts` for
  `=== 'Service'`, `=== 'BreadcrumbList'`, and `=== 'FAQPage'` predicates
  and any "exactly one" / `toHaveLength(1)` assertions over those
  `@type`s. Every predecessor trade-page assertion is URL-scoped (its poll
  navigates to its own trade path per the ticket 0089 and 0092
  Implementation logs), so the sibling instance on
  `/ai-for-fencing-contractors` cannot collide. The grep result is
  documented in the Implementation log.
- [ ] Per the 2026-05-07 em-dash Hard NO, every string emitted on the page
  AND every string emitted into the three JSON-LD blocks AND every string
  in the new e2e spec is hyphen-only. Self-Review greps the diff for
  `String.fromCharCode(8212)` before pushing. No fake client testimonials,
  no invented percentages (no "increase close rate by 40%"), no fabricated
  dollar savings, no invented shop names, no manufacturer or brand
  endorsements (no Trex, no Behr, no Master Halco, no Simtek) the page
  cannot cite to a defensible public source.
- [ ] The page ships full dark-mode support: every Tailwind color class
  carries its `dark:` variant, mirroring `AiForTreeServices.tsx` verbatim.
  A viewport-width check on 375px, 768px, and 1280px shows the three
  pain-point cards stacking, then two-up, then three-up (matching the
  predecessor grid class pattern).
- [ ] A new e2e spec at `tests/e2e/ai-for-fencing-contractors.spec.ts`
  (modeled on `tests/e2e/ai-for-tree-services.spec.ts` from ticket 0092)
  asserts, using a `gotoFencingContractors(page)` helper that navigates
  to `/ai-for-fencing-contractors` and waits for RouteFallback detach per
  the 2026-09-05 lesson and the H1 mount signal per the 2026-09-10
  lesson: (1) `GET /ai-for-fencing-contractors` returns 200, (2) the page
  renders an H1 containing the text "Fencing Contractors" (case-
  insensitive), (3) the page renders exactly three demo-card CTAs with
  hrefs `/homeservices/demo/lead-responder`,
  `/homeservices/demo/estimate`, `/homeservices/demo/voice-followup`,
  (4) exactly one `Service` JSON-LD block on the page with a `name` field
  containing "Fencing Contractors", (5) exactly one `BreadcrumbList` block
  with two `itemListElement` entries whose names are "Home" and "AI for
  Fencing Contractors", (6) exactly one `FAQPage` block whose `mainEntity`
  array length equals the count of visible FAQ cards rendered on the page
  (byte-identical mirror-source assertion per the 2026-05-25 rule), (7)
  per the 2026-09-08 em-dash-JSON-LD-block-filter lesson the em-dash check
  scopes ONLY to the three blocks THIS page emits (Service, BreadcrumbList,
  FAQPage) filtered by their `@type`, NOT to every `application/ld+json`
  block on the page (the homepage Organization block from `index.html`
  carries a legitimate em-dash and must not be flagged), (8) every string
  in the rendered page body contains zero `String.fromCharCode(8212)`
  code points, (9) the page renders cleanly in both light and dark mode
  (the `html.dark` class toggle test pattern from ticket 0092's spec),
  (10) the "Book a 15-minute strategy call" CTA at the bottom fires
  `trackCTAClick('fencing_contractors_book_call', 'fencing_contractors_footer')`
  on click. Per the 2026-06-15 attribute-list regex lesson, if the spec
  matches self-closing tags in stringified JSON-LD output, it uses
  `[^>]*` not `[^/>]*`.
- [ ] Standard box: no `/api/` change, no new hostname, no new npm
  dependency, no edits to `package.json` / `package-lock.json`, no edits to
  any of the sixteen predecessor trade-page files.
  `node scripts/check-backlog.mjs`, `npm run check-links`,
  `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`,
  `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The
  new spec passes; the sixteen predecessor trade-page specs (0017 through
  0092) all stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem
related.

- No `/api/` changes, no `package.json` changes, no em-dashes in copy,
  dark-mode required. This ticket ships one new page plus one new route
  plus a sitemap auto-inclusion plus one new spec plus three JSON-LD
  blocks mirroring the ticket 0092 pattern.
- A new home-services demo scoped to fence installation. The three
  existing `/homeservices/demo/*` demos already cover the flows the page
  needs (lead-responder, estimate, voice-followup); adding a fourth demo
  is a separate ticket.
- A blog post about AI for fencing contractors. A blog post is its own
  content ticket and a separate PR per the AGENTS.md blog-date rule.
- A comparison page like "Digital Craft vs Arcsite" or "Digital Craft vs
  ServiceFusion" scoped to fencing-contractor estimating software.
  Comparison pages are a distinct area (SEO) with a different template.
- A case study for a fencing-contractor client. Case studies must be real
  per the no-fake Hard NO; a case study only ships when a real client's
  data is available.
- Adding fencing-specific data files (`src/data/fenceMaterials.ts`, a
  `src/data/postSpacing.ts` allow-list, or a linear-footage-pricing table).
  The `/homeservices/demo/estimate` demo already ships home-services
  pricing data that generalizes to fence work; a fencing-specific pricing
  file is premature and would risk fabricating material-cost tables.
- Editing the sixteen predecessor trade-page files. Every predecessor
  stays byte-identical.
- Adding a "fencing" filter chip on `/homeservices` or `/demos`. Filter
  UI on the demo hubs is a distinct ticket.
- Cross-linking `/ai-for-fencing-contractors` from `/subprocessors`,
  `/uptime`, `/ethics`, `/security`, `/model-card`, `/agent-fleet`, or
  `/case-studies`. Cross-surface promotion is its own follow-up ticket.
- Adding a Service Area JSON-LD field enumerating specific cities or
  states. The page is a national landing page; city-specific SEO is a
  distinct location-page ticket per the ticket 0051 `/locations/texas`
  LocalBusiness precedent.
- Adding manufacturer or material-brand endorsements (Trex, Simtek,
  Master Halco, Behr) or fence-contractor-association claims (AFA
  membership, IFA member) to the copy. Brand and membership claims risk
  becoming stale between ship and the next credentialing cycle; the page
  names the pain (linear-footage-and-material triage) without asserting
  Digital Craft is endorsed by any specific manufacturer or
  credentialing body.
- Emitting a `Product` or `Offer` JSON-LD block for a specific fence
  material or install package. Digital Craft does not itself sell fence
  labor or materials; emitting such a block would misrepresent the
  artifact per the AGENTS.md conservative-claims rule.
- Adding a lead-capture form scoped to fencing (an email input above the
  demo cards). Every trade-page predecessor uses the same strategy-call
  CTA pattern; a fencing-specific capture form would fragment the funnel.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't
have to re-discover the architecture.

- New `src/pages/AiForFencingContractors.tsx` (under 200 lines). Mirror the
  file structure of `src/pages/AiForTreeServices.tsx` (ticket 0092)
  verbatim: same imports, same section layout, same three-card pain-point
  grid, same three-card demo grid, same footer CTA. Every Tailwind color
  class carries its `dark:` variant. Substitute the fencing-contractor
  copy in every string slot; leave every href identical. Substitute a
  fencing-relevant `lucide-react` icon in the hero (e.g. `Fence` or
  `Grid3x3`) mirroring the ticket 0092 `TreePine` substitution pattern.
- Copy for the pain-point cards is defensible per AGENTS.md: name the pain
  without inventing percentages, dollar figures, or client attributions.
  Draw the pain language from public fencing-industry knowledge (linear
  footage, cedar privacy vs vinyl vs ornamental aluminum vs chain link,
  4ft-vs-6ft heights, gate count, post-spacing, HOA setback rules, pool-
  code sign-off, storm-damaged panel replacement, measure appointment,
  crew on the way) without citing specific cost-per-linear-foot figures
  or manufacturer brand endorsements.
- `src/App.tsx` - add
  `<Route path="/ai-for-fencing-contractors" element={<AiForFencingContractors />} />`
  after the existing `/ai-for-tree-services` route (per the ticket 0092
  implementer's note that shipping order, not alphabetical order, is the
  actual convention). Wrap in the existing
  `<Suspense fallback={<RouteFallback />}>` shell and lazy-import via
  `React.lazy(() => import('./pages/AiForFencingContractors'))` per the
  2026-09-05 route-code-splitting lesson.
- `src/data/routes.ts` - add `/ai-for-fencing-contractors` to the `ROUTES`
  array after the existing `/ai-for-tree-services` entry per the ticket
  0092 convention. Per the 2026-09-12 code-beats-prose lesson, the
  implementer greps the ACTUAL order at branch head before inserting so
  the position matches the file's real convention.
- Per the 2026-05-25 mirror-source rule, every FAQ question and answer
  string in the visible page body is the same string emitted into the
  FAQPage JSON-LD block. Do NOT hand-roll a second copy of the FAQ
  strings. Import the visible FAQ array into the Helmet JSON-LD block per
  the ticket 0092 pattern.
- Per the 2026-05-30 second-@type lesson, BEFORE writing code grep every
  `tests/e2e/*-jsonld.spec.ts` for `=== 'Service'`,
  `=== 'BreadcrumbList'`, and `=== 'FAQPage'` predicates. Predecessor
  candidates as of 2026-09-26: every `tests/e2e/ai-for-*.spec.ts` (0017
  through 0092), plus the ticket 0079 `/blog` CollectionPage spec
  (BreadcrumbList only), plus every compare-page spec for BreadcrumbList,
  plus the ticket 0012 pricing-FAQ spec for FAQPage. Each predecessor is
  URL-scoped so the sibling on `/ai-for-fencing-contractors` cannot
  collide. The grep result is documented in the Implementation log.
- Per the 2026-09-05 route-code-splitting lesson, the new page's e2e
  helper waits for the RouteFallback to detach AND for the hero H1 to be
  visible before probing the DOM. Do NOT rely on
  `root.innerHTML.length > 500` alone; the fallback trips that heuristic
  before the lazy chunk mounts.
- Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the spec's
  em-dash assertion filters the block list to the three `@type`s THIS
  page emits before iterating; it does NOT loop over every
  `application/ld+json` script on the page (the homepage Organization
  block from `index.html` ships site-wide and carries a legitimate
  em-dash).
- Per the 2026-06-15 attribute-list regex lesson, any regex in the new
  spec that matches an XML/HTML attribute list uses `[^>]*`, not
  `[^/>]*`, so slashes inside MIME types or paths do not break the match.
- Per the 2026-09-10 raw-vs-sliced / mount-signal lesson, the spec
  asserts the page's rendered content via auto-retrying assertions
  (`await expect(locator).toHaveCount(N)`) rather than one-shot
  `.allTextContents()` or `.$$eval` counts.
- `tests/e2e/ai-for-fencing-contractors.spec.ts` (new) - one assertion
  per acceptance box. Model the spec on
  `tests/e2e/ai-for-tree-services.spec.ts` (ticket 0092), the freshest
  predecessor spec.
- Per the 2026-05-22 two-PR ship lesson, ship will need a follow-up
  `chore/0096-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter AND its `docs/backlog/README.md` index row to
  `shipped` together; run `node scripts/check-backlog.mjs` before pushing
  the second PR so the file and index never drift mid-flip.
- New deps: NO. The page reuses `react-router-dom`, `react-helmet-async`,
  `lucide-react`, and Tailwind utility classes already in use on the
  sixteen predecessor trade pages. Schema migration: no. Privacy /
  security surface change: no (the page renders server-side-safe static
  content; no new localStorage key, no new hostname, no new outbound
  network call).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-26 - branch `feat/0096-ai-for-fencing-contractors-landing-page` opened off origin/main; ticket status flipped to `in-progress` alongside its README index row in the same commit per the 2026-05-22 check-backlog rule.
- 2026-09-26 - Grepped every `tests/e2e/*-jsonld.spec.ts` and every `tests/e2e/ai-for-*.spec.ts` for `=== 'Service'`, `=== 'BreadcrumbList'`, and `=== 'FAQPage'` predicates plus `toHaveLength(1)` assertions over those `@type`s. Every predecessor trade-page assertion is URL-scoped (each spec calls its own `goto*` helper first navigating to its own `/ai-for-*` path), so a sibling instance on `/ai-for-fencing-contractors` cannot collide with any predecessor's `.toHaveLength(1)` filter over `Service`, `BreadcrumbList`, or `FAQPage`.
- 2026-09-26 - Wrote failing e2e spec `tests/e2e/ai-for-fencing-contractors.spec.ts` FIRST (modeled 1:1 on `tests/e2e/ai-for-tree-services.spec.ts`), then shipped the minimum page code at `src/pages/AiForFencingContractors.tsx` (mirrors `AiForTreeServices.tsx`), lazy-imported into `src/App.tsx` after the tree-services route, appended `/ai-for-fencing-contractors` to `src/data/routes.ts` after `/ai-for-tree-services` per the 2026-09-12 code-beats-prose convention. Confirmed `scripts/generate-sitemap.ts` auto-emits the new URL by grepping `dist/sitemap.xml` after `npm run build`.
