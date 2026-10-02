---
id: 0106
title: AI-for-concrete-contractors long-tail landing page funneling into home-services demos
status: groomed
priority: P1
area: content
created: 2026-10-02
owner: gtm-innovation
---

## User story

As the owner, foreman, or estimator of a residential or light-commercial
concrete contractor (a single-crew flatwork outfit pouring driveways and
patios with a trailer-mounted mixer, a two-crew foundation-and-footing
operation running a boom truck and a laser-screed, a decorative-concrete
specialist selling stamped and stained patios plus pool decks, a repair-
and-leveling specialist doing mudjacking and polyjacking on settled slabs,
an HOA-and-property-manager sub pouring sidewalks and curb-and-gutter work),
Googling "AI for concrete contractors," "concrete company answering service
AI," "AI receptionist for concrete contractors," "AI estimator for concrete
pours," or "AI for concrete repair companies" on a phone in the truck after
a weather delay slipped the morning pour, I want one honest long-tail
landing page at `/ai-for-concrete-contractors` that names the three
specific pain points that bleed concrete-contractor margin (weather-dependent
pour reschedules and same-week booking inbounds that go to voicemail while
the crew is finishing a Friday patio, long-tail square-footage, pour-type,
and finish triage a dispatcher cannot answer without seeing the slab,
and crew-on-the-way and cure-cycle follow-up that slips between the pour
and the sealant visit), and that funnels into the three live home-services
demos the page reuses verbatim (`/homeservices/demo/lead-responder`,
`/homeservices/demo/estimate`, `/homeservices/demo/voice-followup`), so
that I can try the AI agent on my own phone before deciding to book a
15-minute strategy call.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the long-tail trade-landing pattern
is now proven across SEVENTEEN shipped pages (`AiForPlumbers.tsx` 0017,
`AiForHvac.tsx` 0020, `AiForRoofers.tsx` 0024, `AiForElectricians.tsx` 0034,
`AiForPainters.tsx` 0037, `AiForLandscapers.tsx` 0041,
`AiForPropertyManagers.tsx` 0047, `AiForCleaningServices.tsx` 0050,
`AiForPestControl.tsx` 0056, `AiForPoolService.tsx` 0058,
`AiForRestorationServices.tsx` 0072, `AiForMovingCompanies.tsx` 0080,
`AiForSolarInstallers.tsx` 0084, `AiForWindowInstallers.tsx` 0087,
`AiForGarageDoorCompanies.tsx` 0089, `AiForTreeServices.tsx` 0092,
`AiForFencingContractors.tsx` 0096). Each is a flat copy-replace of its
predecessor with vertical-specific pain points and three demo cards
routing into the same `/homeservices/demo/*` family. Concrete contractors
is the eighteenth vertical and is structurally closest to roofers (ticket
0024) and fencing contractors (ticket 0096) because all three are
weather-dependent outdoor trades whose inbound volume runs on seasonality
and whose first-response window is a paid-lead-vs-lost-lead decision made
in the homeowner's ten-minute research burst. Adding the eighteenth
landing page is exactly one new file (`src/pages/AiForConcreteContractors.tsx`,
modeled 1:1 on `AiForFencingContractors.tsx` from ticket 0096), one new
entry in `src/data/routes.ts`, one new entry in `src/data/verticalLabels.ts`
so the ticket 0100 recent-verticals card picks the page up automatically,
one new route in `src/App.tsx`, one new entry in the public sitemap
(auto-emitted by the ticket 0022 generator from the routes array), and
one new spec file. The three demo CTAs route into the existing
`/homeservices/demo/*` demos with no new demo build, no new backend, no
new data, no new component.

### Stakeholder

This widens the SEO moat in a query class adjacent to but strictly separate
from the seventeen existing trade pages: "AI for concrete contractors,"
"concrete company answering service AI," "AI receptionist for concrete
contractors," "AI estimator for concrete pours," "AI for concrete repair
companies," "concrete contractor AI voice agent." Concrete sits alongside
roofing, fencing, and foundation repair as the highest-ticket residential
weather-dependent trades with a measure-plus-pour cadence (a single
captured after-hours quote for a 400-square-foot stamped patio commonly
clears a mid four-figure job, with foundation footings and large driveways
running higher), so a single captured after-hours lead per week on the
new page produces materially higher expected pipeline value than a
comparable capture on a same-day-service trade page. Per the ticket 0096
and 0092 precedent, a new trade page adds one indexable long-tail head-
term surface AND one new internal-link node in the home-services SEO
graph. Per the 2026-05-30 second-@type lesson and the ticket 0096
implementer notes, every predecessor trade-page assertion is URL-scoped
so a sibling instance on `/ai-for-concrete-contractors` does not collide
with the seventeen predecessor instances. Per the ticket 0100 recent-
verticals precedent, adding the new vertical to `VERTICAL_LABELS` makes
the eighteenth row available to the `/my` dashboard's recent-verticals
card the moment a visitor opens the page, no second ticket required.

### User (in the real moment of use)

A two-crew residential-flatwork concrete contractor sitting in the truck at
7:40am on a Monday, having lost Friday's patio pour to a thunderstorm and
spent Saturday rescheduling the three homeowners who called in while his
voicemail was full, sees the missed-call log shows five after-hours
inbounds (one homeowner asking about a 20x30 stamped patio, one asking
about a cracked driveway tear-out and replace, one asking about a 400-foot
property-line sidewalk, one asking about mudjacking a settled garage
slab, one property manager asking about a Tuesday walk of a townhome
sidewalk-repair punch-list). He Googles "AI for concrete contractors" on
his phone. The SERP surfaces `/ai-for-concrete-contractors` with a meta
description naming the three pain points verbatim. One tap and the page
loads on a 375px viewport with a hero H1 ("AI for Concrete Contractors")
and a subtitle naming the pain (weather-dependent pour reschedules and
same-week booking inbounds that go to voicemail while the crew is
finishing a Friday patio). He scrolls, reads the three pain-point cards,
taps the first "Try the AI receptionist demo" CTA, and lands on
`/homeservices/demo/lead-responder`. He chats with the demo for two
minutes, watches it triage his mock inbound (400 square feet, 4-inch
flatwork, broom finish, two-week lead time, ready to book a Thursday
measure), and hand back a captured lead summary. He taps back to the
landing page, scrolls to the "Book a 15-minute strategy call" CTA at the
bottom, and books. No mobile scroll trap, no dead links, no non-defensible
claim. Light and dark mode both read cleanly.

### Growth

The "show me" moment is the SERP result: a concrete-contractor owner
Googling "AI for concrete contractors" from a phone at 7:40am after a
weekend rain-out finds `/ai-for-concrete-contractors` at the top of the
long-tail SERP, taps in, and books a strategy call from his thumb before
the next weekday inbound rings. That is the single cheapest audience-
acquisition signal the site can produce for the concrete vertical because
the audience is Googling at the exact moment their pain is priced in the
loss of a same-week pour booked by a competitor who answered first. The
generator ships as one new page file plus one new route entry plus one
new vertical-label entry plus one new spec plus a sitemap auto-inclusion;
the growth value is entirely in the SERP surface the long-tail head term
opens once Googlebot indexes the page.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests
against this list before writing code.

- [ ] A new page at `src/pages/AiForConcreteContractors.tsx` (new file, under 200 lines) modeled 1:1 on `src/pages/AiForFencingContractors.tsx` (ticket 0096, the freshest predecessor in the same home-services family). The page renders: (a) a hero H1 "AI for Concrete Contractors" with a supporting subtitle naming the pain (weather-dependent pour reschedules and same-week booking inbounds that go to voicemail while the crew is finishing a Friday patio), (b) three labeled pain-point cards covering (1) weather-dependent reschedules and after-hours same-week booking inbounds, (2) long-tail square-footage, pour-type, and finish triage (flatwork vs structural; broom vs stamped vs stained vs polished; thickness in inches; rebar vs mesh; patio vs driveway vs sidewalk vs curb-and-gutter vs foundation footing), (3) crew-on-the-way and cure-cycle follow-up between the pour and the sealant or control-joint visit, (c) three demo cards linking to `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, `/homeservices/demo/voice-followup` (identical hrefs to ticket 0096), each with a concrete-specific one-line "why this matters" line under the CTA label, (d) a "Book a 15-minute strategy call" CTA at the bottom pointing at the existing homepage strategy-call anchor. Every string on the page is written in the defensible brand voice per AGENTS.md: no invented client names, no invented percentages, no invented dollar amounts above a defensible industry ballpark, hyphens not em-dashes per the 2026-05-07 em-dash Hard NO.
- [ ] A new route entry at `src/App.tsx` mapping `/ai-for-concrete-contractors` to the new page component, imported through the existing `React.lazy` pattern all other trade-landing pages use per the 2026-09-05 route-code-splitting lesson. Wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell.
- [ ] A new entry in `src/data/routes.ts` (the canonical route allow-list) exactly `'/ai-for-concrete-contractors'`. Per the 2026-09-12 code-beats-prose lesson and the ticket 0096 convention of shipping order (not strict alphabetical), the implementer greps the ACTUAL ordering at branch head before inserting and appends after the newest predecessor in the ai-for-* run (currently `/ai-for-fencing-contractors`). Per the 2026-06-07 mirror-source-across-src-tests lesson, `tests/e2e/routes.ts` continues to re-export `ROUTES` verbatim and requires no separate edit.
- [ ] A new entry in `src/data/verticalLabels.ts` adding `'/ai-for-concrete-contractors': 'Concrete Contractors'` to `VERTICAL_LABELS`. Per the 2026-05-25 mirror-source rule this label is the single string rendered by both the page's `useRecordVerticalVisit` mount hook AND the ticket 0100 `RecentVerticalsCard` on `/my`; the implementer does NOT hand-roll a second copy of the label inside the page component.
- [ ] A new sitemap entry for `/ai-for-concrete-contractors` is emitted at build time. Per the ticket 0096 implementer's note that `scripts/generate-sitemap.ts` (ticket 0022) reads the routes array automatically, no manual XML edit is required and the implementer confirms auto-inclusion in the Implementation log by grepping `dist/sitemap.xml` for `/ai-for-concrete-contractors` after a local build. If a manual `public/sitemap.xml` addition IS required (the generator does not auto-include a new route), the implementer adds one new `<url>` entry with `<lastmod>2026-10-02</lastmod>` and `<priority>0.7</priority>` mirroring the ticket 0096 sitemap row per the 2026-05-28 sitemap-lastmod-encoded-invariant lesson.
- [ ] The page emits three JSON-LD blocks inside its `<Helmet>` block matching the trade-page family shape: (1) `Service` describing the AI-for-concrete-contractors offering, (2) `BreadcrumbList` positioning the page under the homepage (two levels: Home, AI for Concrete Contractors), (3) `FAQPage` enumerating three vertical-specific FAQ items whose question and answer strings mirror the visible FAQ cards on the page byte-for-byte per the 2026-05-25 mirror-source rule. The exact shape mirrors ticket 0096's emission on `AiForFencingContractors.tsx`; the implementer greps that file first and copies the JSON-LD block structure verbatim, substituting the concrete copy. Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'Service'`, `=== 'BreadcrumbList'`, and `=== 'FAQPage'` predicates. Every predecessor trade-page assertion is URL-scoped so a sibling on `/ai-for-concrete-contractors` cannot collide. The grep result is documented in the Implementation log.
- [ ] The page's hero component calls `useRecordVerticalVisit({ path: '/ai-for-concrete-contractors', label: VERTICAL_LABELS['/ai-for-concrete-contractors'] })` once on mount so the ticket 0100 recent-verticals card picks the page up automatically. Per the 2026-09-10 mount-signal lesson the hook fires inside a `useEffect(..., [])` and does NOT depend on any router-side signal.
- [ ] A new e2e spec at `tests/e2e/ai-for-concrete-contractors.spec.ts` (modeled on `tests/e2e/ai-for-fencing-contractors.spec.ts` from ticket 0096) asserts, using a `gotoConcreteContractors(page)` helper that navigates to `/ai-for-concrete-contractors` and waits for RouteFallback detach per the 2026-09-05 lesson and the H1 mount signal per the 2026-09-10 lesson: (1) `GET /ai-for-concrete-contractors` returns 200, (2) the page renders an H1 containing the text "Concrete Contractors" (case-insensitive), (3) the page renders exactly three demo-card CTAs with hrefs `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, `/homeservices/demo/voice-followup`, (4) exactly one `Service` JSON-LD block on the page with a `name` field containing "Concrete Contractors", (5) exactly one `BreadcrumbList` block with two `itemListElement` entries whose names are "Home" and "AI for Concrete Contractors", (6) exactly one `FAQPage` block whose `mainEntity` array length equals the count of visible FAQ cards rendered on the page (byte-identical mirror-source assertion per the 2026-05-25 rule), (7) per the 2026-09-08 em-dash-JSON-LD-block-filter lesson the em-dash check scopes ONLY to the three blocks THIS page emits (Service, BreadcrumbList, FAQPage) filtered by their `@type`, NOT to every `application/ld+json` block on the page (the homepage Organization block from `index.html` carries a legitimate em-dash and must not be flagged), (8) every string in the rendered page body contains zero `String.fromCharCode(8212)` code points, (9) the page renders cleanly in both light and dark mode (the `html.dark` class toggle test pattern from ticket 0096's spec), (10) the "Book a 15-minute strategy call" CTA at the bottom fires `trackCTAClick('concrete_contractors_book_call', 'concrete_contractors_footer')` on click, (11) after `page.evaluate` clears `dca_recent_verticals_v1` and the test visits `/ai-for-concrete-contractors` then navigates to `/my`, the ticket 0100 recent-verticals card renders one row whose label is `VERTICAL_LABELS['/ai-for-concrete-contractors']` imported from `src/data/verticalLabels.ts` (mirror-source cross-store assertion per the 2026-06-07 rule). Per the 2026-06-15 attribute-list regex lesson, if the spec matches self-closing tags in stringified JSON-LD output, it uses `[^>]*` not `[^/>]*`.
- [ ] Standard box: no `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any of the seventeen predecessor trade-page files beyond the required `VERTICAL_LABELS` entry (which is a data-file addition, not a predecessor-page edit). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the seventeen predecessor trade-page specs (0017 through 0096) all stay green; the ticket 0100 recent-verticals spec stays green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem
related.

- Standard anti-goals: no `/api/` changes, no `package.json` changes, no em-dashes in copy, dark-mode required. This ticket ships one new page plus one new route plus one new vertical-label entry plus a sitemap auto-inclusion plus one new spec plus three JSON-LD blocks mirroring the ticket 0096 pattern.
- A new home-services demo scoped to concrete flatwork or foundation work. The three existing `/homeservices/demo/*` demos already cover the flows the page needs (lead-responder, estimate, voice-followup); adding a fourth demo is a separate ticket.
- A blog post about AI for concrete contractors. A blog post is its own content ticket and a separate PR per the AGENTS.md blog-date rule.
- A comparison page like "Digital Craft vs Buildxact" or "Digital Craft vs ConcreteCost Estimator." Comparison pages are a distinct area (SEO) with a different template.
- A case study for a concrete-contractor client. Case studies must be real per the no-fake Hard NO; a case study only ships when a real client's data is available.
- Adding concrete-specific data files (`src/data/concreteFinishes.ts`, a `src/data/pourTypes.ts` allow-list, or a square-footage-pricing table). The `/homeservices/demo/estimate` demo already ships home-services pricing data that generalizes to concrete work; a concrete-specific pricing file is premature and would risk fabricating slab-cost tables.
- Editing the seventeen predecessor trade-page files. Every predecessor stays byte-identical; the only data-file edit is the one additive `VERTICAL_LABELS` entry.
- Adding a "concrete" filter chip on `/homeservices` or `/demos`. Filter UI on the demo hubs is a distinct ticket.
- Cross-linking `/ai-for-concrete-contractors` from `/subprocessors`, `/uptime`, `/ethics`, `/security`, `/model-card`, `/agent-fleet`, or `/case-studies`. Cross-surface promotion is its own follow-up ticket.
- Adding a Service Area JSON-LD field enumerating specific cities or states. The page is a national landing page; city-specific SEO is a distinct location-page ticket per the ticket 0051 `/locations/texas` LocalBusiness precedent.
- Adding manufacturer or material-brand endorsements (Quikrete, Sakrete, Lafarge, Butterfield Color, Scofield, Davis Colors) or concrete-contractor-association claims (ACI membership, ASCC member, DCC member) to the copy. Brand and membership claims risk becoming stale between ship and the next credentialing cycle; the page names the pain (square-footage-and-finish triage, weather-dependent reschedules, cure-cycle follow-up) without asserting Digital Craft is endorsed by any specific manufacturer or credentialing body.
- Emitting a `Product` or `Offer` JSON-LD block for a specific pour package or stamped-patio bundle. Digital Craft does not itself sell concrete labor or materials; emitting such a block would misrepresent the artifact per the AGENTS.md conservative-claims rule.
- Adding a lead-capture form scoped to concrete (an email input above the demo cards). Every trade-page predecessor uses the same strategy-call CTA pattern; a concrete-specific capture form would fragment the funnel.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't
have to re-discover the architecture.

- New `src/pages/AiForConcreteContractors.tsx` (under 200 lines). Mirror the file structure of `src/pages/AiForFencingContractors.tsx` (ticket 0096) verbatim: same imports, same section layout, same three-card pain-point grid, same three-card demo grid, same footer CTA. Every Tailwind color class carries its `dark:` variant. Substitute the concrete-contractor copy in every string slot; leave every demo href identical. Substitute a concrete-relevant `lucide-react` icon in the hero (e.g. `Construction`, `HardHat`, or `Square`) mirroring the ticket 0096 `Fence` substitution pattern. Add the one `useRecordVerticalVisit` call in the page body per the ticket 0100 convention; import `VERTICAL_LABELS` from `src/data/verticalLabels.ts`.
- Copy for the pain-point cards is defensible per AGENTS.md: name the pain without inventing percentages, dollar figures, or client attributions. Draw the pain language from public concrete-industry knowledge (square footage, flatwork vs structural, broom-vs-stamped-vs-stained-vs-polished finishes, 4-inch-vs-6-inch thickness, rebar vs mesh, patio vs driveway vs sidewalk vs foundation, weather-dependent pour reschedules, cure cycle, control-joint saw cuts, sealant visit) without citing specific cost-per-square-foot figures or manufacturer brand endorsements.
- `src/App.tsx` - add `<Route path="/ai-for-concrete-contractors" element={<AiForConcreteContractors />} />` after the existing `/ai-for-fencing-contractors` route (per the ticket 0096 implementer's note that shipping order, not alphabetical order, is the actual convention). Wrap in the existing `<Suspense fallback={<RouteFallback />}>` shell and lazy-import via `React.lazy(() => import('./pages/AiForConcreteContractors'))` per the 2026-09-05 route-code-splitting lesson.
- `src/data/routes.ts` - add `/ai-for-concrete-contractors` to the `ROUTES` array after the existing `/ai-for-fencing-contractors` entry per the ticket 0096 convention. Per the 2026-09-12 code-beats-prose lesson, the implementer greps the ACTUAL order at branch head before inserting so the position matches the file's real convention.
- `src/data/verticalLabels.ts` - add `'/ai-for-concrete-contractors': 'Concrete Contractors'` to `VERTICAL_LABELS`. Per the 2026-05-25 mirror-source rule, this is the single source read by both the page's `useRecordVerticalVisit` call AND the ticket 0100 recent-verticals card on `/my`.
- Per the 2026-05-25 mirror-source rule, every FAQ question and answer string in the visible page body is the same string emitted into the FAQPage JSON-LD block. Do NOT hand-roll a second copy of the FAQ strings. Import the visible FAQ array into the Helmet JSON-LD block per the ticket 0096 pattern.
- Per the 2026-05-30 second-@type lesson, BEFORE writing code grep every `tests/e2e/*-jsonld.spec.ts` for `=== 'Service'`, `=== 'BreadcrumbList'`, and `=== 'FAQPage'` predicates. Predecessor candidates as of 2026-10-02: every `tests/e2e/ai-for-*.spec.ts` (0017 through 0096), plus the ticket 0079 `/blog` CollectionPage spec (BreadcrumbList only), plus every compare-page spec for BreadcrumbList, plus the ticket 0012 pricing-FAQ spec for FAQPage. Each predecessor is URL-scoped so the sibling on `/ai-for-concrete-contractors` cannot collide. The grep result is documented in the Implementation log.
- Per the 2026-09-05 route-code-splitting lesson, the new page's e2e helper waits for the RouteFallback to detach AND for the hero H1 to be visible before probing the DOM. Do NOT rely on `root.innerHTML.length > 500` alone; the fallback trips that heuristic before the lazy chunk mounts.
- Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the spec's em-dash assertion filters the block list to the three `@type`s THIS page emits before iterating; it does NOT loop over every `application/ld+json` script on the page (the homepage Organization block from `index.html` ships site-wide and carries a legitimate em-dash).
- Per the 2026-09-28 addInitScript-re-runs lesson, the recent-verticals cross-store assertion (box 11) seeds `dca_recent_verticals_v1` via `page.evaluate(([k, v]) => localStorage.removeItem(k), ['dca_recent_verticals_v1'])` BEFORE the first navigation, so the mount-effect write survives the subsequent `page.goto('/my')` navigation and the card renders one row.
- Per the 2026-06-15 attribute-list regex lesson, any regex in the new spec that matches an XML/HTML attribute list uses `[^>]*`, not `[^/>]*`, so slashes inside MIME types or paths do not break the match.
- Per the 2026-09-10 raw-vs-sliced / mount-signal lesson, the spec asserts the page's rendered content via auto-retrying assertions (`await expect(locator).toHaveCount(N)`) rather than one-shot `.allTextContents()` or `.$$eval` counts.
- Per the 2026-09-26 static-file MIME-shim lesson: NOT applicable here, no new static extension is introduced. Record "no new static extension shipped" in the Implementation log for auditability.
- `tests/e2e/ai-for-concrete-contractors.spec.ts` (new) - one assertion per acceptance box. Model the spec on `tests/e2e/ai-for-fencing-contractors.spec.ts` (ticket 0096), the freshest predecessor spec.
- Per the 2026-05-22 two-PR ship lesson, ship will need a follow-up `chore/0106-ship-status` PR after the feat PR merges to flip the ticket frontmatter AND its `docs/backlog/README.md` index row to `shipped` together; run `node scripts/check-backlog.mjs` before pushing the second PR so the file and index never drift mid-flip.
- New deps: NO. The page reuses `react-router-dom`, `react-helmet-async`, `lucide-react`, and Tailwind utility classes already in use on the seventeen predecessor trade pages. Schema migration: no. Privacy / security surface change: no (the page renders static content; no new localStorage key, no new hostname, no new outbound network call; the one `useRecordVerticalVisit` call writes to the already-disclosed `dca_recent_verticals_v1` key from ticket 0100).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0106-...` opened
- YYYY-MM-DD - failing test added in `tests/...`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
