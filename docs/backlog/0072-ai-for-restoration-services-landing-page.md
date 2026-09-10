---
id: 0072
title: AI-for-restoration-services long-tail landing page funneling into home-services demos
status: shipped
priority: P1
area: content
created: 2026-09-10
owner: gtm-innovation
---

## User story

As the owner or dispatcher of a residential
restoration-and-remediation company (a 24/7
water-damage-mitigation shop, a fire and smoke-damage
restoration operator, a mold-remediation specialist,
a storm and flood-response crew) Googling
"AI for restoration companies," "restoration answering
service AI," "water damage AI receptionist," or
"AI for mold remediation" on a phone at 11pm after a
burst pipe call rolled to voicemail, I want one
honest long-tail landing page at
`/ai-for-restoration-services` that names the three
specific pain points that bleed restoration margin
(after-hours emergency calls that go to voicemail and
never call back, insurance-carrier scope-of-work
questions that a dispatcher cannot answer at 2am,
review-request timing that slips the day a crew
finishes a job), and that funnels into the three
live home-services demos the page reuses verbatim
(`/homeservices/demo/lead-responder`,
`/homeservices/demo/estimate`,
`/homeservices/demo/voice-followup`), so that I can
try the AI agent on my own phone before deciding to
book a 15-minute strategy call.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the long-tail
trade-landing pattern is now proven across TEN shipped
pages (`src/pages/AiForPlumbers.tsx` 0017,
`AiForHvac.tsx` 0020, `AiForRoofers.tsx` 0024,
`AiForElectricians.tsx` 0034, `AiForPainters.tsx`
0037, `AiForLandscapers.tsx` 0041,
`AiForPropertyManagers.tsx` 0047,
`AiForCleaningServices.tsx` 0050,
`AiForPestControl.tsx` 0056,
`AiForPoolService.tsx` 0058). Each is a flat
copy-replace of its predecessor with the
vertical-specific pain points and three demo cards
routing into the same `/homeservices/demo/*` family.
Restoration and remediation is the eleventh vertical
and is structurally closest to pool service (ticket
0058) because both are residential service trades
with a 24/7 emergency funnel where the after-hours
call IS the business. Adding the eleventh landing
page is exactly one new file
(`src/pages/AiForRestorationServices.tsx`, modeled 1:1
on `AiForPoolService.tsx`), one new entry in
`src/data/routes.ts`, one new route in `src/App.tsx`,
and one new spec file. The three demo CTAs route
into the existing `/homeservices/demo/*` demos with
no new demo build, no new backend, no new data, no
new component.

### Stakeholder

This widens the SEO moat in a query class adjacent to
but strictly separate from the ten existing trade
pages: "AI for restoration companies," "restoration
answering service AI," "water damage AI receptionist,"
"AI for mold remediation," "24/7 restoration answering
AI." Restoration is structurally the highest-intent
emergency-response trade in the residential-services
family because the calling homeowner is standing in
water at midnight; a voicemail loses the job to the
next shop listed in the SERP within minutes. Per the
ticket 0056 and 0058 precedent, a new trade page adds
roughly 2 to 4 indexable surfaces to the SEO graph
(landing page itself, internal links from the
homepage industry strip if any exist, three demo-card
outbound links indexable as deep links). Per the
2026-05-30 second-@type lesson, BEFORE writing code
the implementer greps every existing
`tests/e2e/ai-for-*.spec.ts` for `=== 'BreadcrumbList'`
predicates; the ten predecessor specs are each
URL-scoped to their own `/ai-for-<trade>` route per
the ticket 0058 Implementation log, so an eleventh
`/ai-for-restoration-services`-scoped
BreadcrumbList cannot collide. The grep is mandatory
regardless and its result is documented in the
Implementation log.

### Visitor (in the real moment of use)

A restoration-shop owner Googles "AI for water
damage restoration company" on a phone at 11pm right
after their answering service dropped a burst-pipe
call. The SERP surfaces
`/ai-for-restoration-services` with a meta
description naming the actual pain points (after
hours emergency calls to voicemail, insurance
scope-of-work questions at 2am, review timing
misses). One tap and the page loads in under one
screen with a hero H1, a three-pain-point strip, a
24/7 / under 60 seconds / 3 demos / 48h stats row,
three demo CTA cards (lead responder, estimate,
voice follow-up) routing to the existing
`/homeservices/demo/*` demos, a "why now" trust
strip, and one strategy-call CTA reusing the
existing Calendly URL. They tap the lead-responder
demo, see the chat agent qualify "kitchen flood, 20
gallons, need someone tonight" in under a minute,
scroll back, tap "Book a Strategy Call," and land on
the Calendly with the restoration context already in
their head. Light and dark mode supported; the page
reads cleanly on a 375px viewport.

### Growth

The "show me" moment is the screenshot a restoration
owner sends to their operations partner over text: a
clean Digital Craft trade-landing page naming the
midnight-emergency pain point in plain language,
with a "Try the Demo" button below. That is exactly
the artifact a traditional-industry co-owner
forwards when they want their partner to take the
same step. Per the ticket 0017 to 0058 trade-landing
precedent, each new vertical page is the cheapest
qualified strategy-call the funnel can produce
because the SERP intent is structurally high
(someone Googling "AI for restoration companies" has
already self-selected as a buyer evaluating AI
automation for their specific trade). Each CTA
click fires `trackCTAClick` with a `restoration_*`
location label so the funnel is measurable in GA
independently of the ten existing trade pages.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/AiForRestorationServices.tsx` (new file, under 280 lines) renders at `/ai-for-restoration-services`, modeled 1:1 on `src/pages/AiForPoolService.tsx` (ticket 0058, the closest structural peer because both are residential service trades with a 24/7 emergency funnel; NOT `AiForPropertyManagers.tsx`, which routes to `/realestate/demo/*` and is the wrong demo family). The page has a hero with a restoration-specific H1 (suggested: "AI for Restoration Companies That Are Done Losing Midnight Emergency Calls to Voicemail"), a three-pain-point strip (after-hours water and fire emergency calls hitting voicemail; insurance-carrier scope questions a dispatcher cannot answer at 2am; review-request timing that slips the day a crew finishes a mitigation job), a stats row mirroring the 0058 pattern (24/7 / under 60 seconds / 3 demos / 48h), three demo CTA cards routing to `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, and `/homeservices/demo/voice-followup`, a "why now" trust strip, and one strategy-call CTA reusing the existing Calendly URL. Every claim is defensible: no invented client names, no fabricated efficacy percentages, no restoration efficacy data the page cannot cite from publicly available trade-association sources (RIA / Restoration Industry Association market context only; cite the source in an HTML comment per the 2026-05-25 mirror-source-fix rule). Industry-standard language only, not DCA client results.
- [ ] The page emits ONE JSON-LD block inside the existing `<Helmet>` head matching the ten-page convention: a `BreadcrumbList` (Home to AI for Restoration Services) using the same shape as the existing `BREADCRUMB_SCHEMA` constant in `src/pages/AiForPoolService.tsx`. The page does NOT emit a `Service` block (the ten existing trade pages emit `BreadcrumbList` only). Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/ai-for-*.spec.ts` for `=== 'BreadcrumbList'` predicates; the ten predecessor specs are all per-URL scoped per the ticket 0058 Implementation log, so a new `/ai-for-restoration-services`-scoped block does not collide. The grep is mandatory regardless and the result is documented in the Implementation log.
- [ ] The new route is registered in `src/App.tsx` next to the existing `/ai-for-pool-service` route. The implementer adds `/ai-for-restoration-services` to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson (the canonical allow-list); `tests/e2e/routes.ts` re-exports it automatically and the smoke spec exercises the page. The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date. Per the 2026-09-05 route-code-splitting lesson, if the route is `React.lazy`-wrapped mirroring adjacent AI-for-X routes, the new spec must NOT rely on `root.innerHTML.length > N` for readiness; auto-retrying `await expect(locator).toBeVisible()` is required and the spec's `gotoRoute` helper waits for the RouteFallback spinner detachment per the same lesson.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in any JSON-LD serialized string, and every CTA route resolves to a registered route in `src/data/routes.ts`. The three demo CTAs route to `/homeservices/demo/lead-responder`, `/homeservices/demo/voice-followup`, and `/homeservices/demo/estimate` (the three home-services demos the trade family already funnels into); the strategy-call CTA opens Calendly in a new tab with `rel="noopener noreferrer"` matching the existing trade-page convention from 0058.
- [ ] A new e2e spec at `tests/e2e/ai-for-restoration-services.spec.ts` (modeled on `tests/e2e/ai-for-pool-service.spec.ts`) asserts: (1) the page returns a status under 400 and the H1 contains "Restoration" (case-insensitive substring), (2) the `meta[name="description"]` content names "restoration" (asserted on the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson), (3) the `BreadcrumbList` JSON-LD has two items with the second one named matching the H1 substring and linking to `https://digitalcraftai.com/ai-for-restoration-services`, (4) the three demo CTAs each resolve to a `/homeservices/demo/*` route present in `ROUTES` (imported from `tests/e2e/routes.ts`), (5) the page text contains no `String.fromCharCode(8212)` code point, (6) dark mode renders cleanly via `document.documentElement.classList.add('dark')` and the hero heading is still visible. The CTA case locates the three demo-card CTAs via a per-page testid (use `data-testid="restoration-demo-cta"` on each card, matching the 0058 `poolservice-demo-cta` pattern).
- [ ] Standard box: no `/api/` change, no new hostname (the only external link is the existing `calendly.com/mutaaf` URL already used on every trade page), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the ten existing `src/pages/AiFor*.tsx` pages or their specs, no edits to `src/components/Industries.tsx` or any cross-vertical strip (cross-promotion from any homepage carousel is its own follow-up ticket). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; every pre-existing `tests/e2e/ai-for-*.spec.ts` stays green; the existing `tests/e2e/smoke.spec.ts` exercises the new route via the ROUTES re-export and stays green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- Standard anti-goals: no /api/ changes, no
  package.json changes, no em-dashes in copy,
  dark-mode required.
- A garage-door-repair, pressure-washing, or
  window-cleaning landing page in the same ticket.
  Each trade landing is structurally one ticket per
  the ticket 0017 to 0058 precedent; this ticket
  picks restoration and remediation as the next
  highest-intent residential service trade not yet
  covered. Garage-door repair, moving companies,
  and appliance repair are separate future tickets
  and were not pre-authorized by any predecessor
  ticket's Out of Scope list.
- Building a restoration-specific demo at
  `/homeservices/demo/water-damage-estimator` or
  similar. The page funnels into the three existing
  `/homeservices/demo/*` demos verbatim; a
  vertical-specific demo build is a separate
  cross-cutting ticket (it would touch the demo
  backend and is well outside the 200-line diff
  budget).
- Adding a `Service` JSON-LD block on the page.
  The ten existing trade pages emit
  `BreadcrumbList` only per the ticket 0058
  Implementation log; the eleventh page follows that
  convention. Adding a Service block would trigger
  the 2026-05-30 second-@type collision audit on
  every trade-page spec, which is out of scope.
- Cross-promoting the new page from the homepage
  industries carousel
  (`src/components/Industries.tsx`) or any
  vertical strip. Cross-surface promotion is its
  own follow-up ticket once telemetry shows the
  page earns organic traffic on its own.
- Adding `/ai-for-restoration-services` to the
  `index.html` SEO Pilot `pages` table. That is
  its own SEO-hygiene ticket and applies uniformly
  to all eleven `/ai-for-*` routes, none of which
  are in the table per the 2026-05-25 SEO Pilot
  lesson.
- A restoration-specific blog post pointing at
  `/ai-for-restoration-services`. Blog content
  ships through the `src/data/blogPosts.ts`
  pipeline and is gated by `check-blog-dates`;
  cross-promotion is its own content ticket.
- Internationalization (`inLanguage` fields on
  schema). The page is English-only, matching the
  ten predecessor trade pages.
- A testimonial from a named restoration client.
  The AGENTS.md Hard NO on invented testimonials
  applies; a real testimonial ships through its
  own dated blog post via the existing pipeline
  once a real client agrees to attribution.
- A "compare Digital Craft vs restoration-specific
  scheduling software" comparison page (e.g.
  Xactimate, DASH, encircle). Each comparison
  page is structurally its own ticket per the
  ticket 0021 to 0065 precedent and was not
  pre-authorized.
- Cross-vertical related-demos surfacing of the
  new page in the `RelatedDemos` component
  (ticket 0027). The component reads from a
  separate `relatedDemos` data structure and is
  its own follow-up ticket.
- Fabricated efficacy numbers or hospitality-industry
  statistics on the page ("restoration companies lose
  70% of after-hours calls"). Every claim MUST be
  defensible per the AGENTS.md rule; the page is a
  discovery surface, not a stats billboard.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/AiForRestorationServices.tsx`
  (under 280 lines). Copy
  `src/pages/AiForPoolService.tsx` (ticket 0058)
  end-to-end as the starting frame, then swap every
  "pool service" / "pool-service" / "pool cleaning"
  / "green-pool" string for the restoration
  equivalent. Keep the same module-level
  mirror-source constants: `HERO_H1`,
  `META_DESCRIPTION`, `PAIN_POINTS`, `STATS`,
  `DEMO_CARDS`, `BREADCRUMB_SCHEMA` (per the
  2026-05-25 mirror-source rule the description
  used in the Helmet meta tag AND the JSON-LD MUST
  read from the same `META_DESCRIPTION` constant).
  Swap the three PAIN_POINTS entries to the three
  restoration-specific dimensions named in the
  acceptance criteria (after-hours water and fire
  emergency calls, insurance scope questions at
  2am, review-request timing that slips). Keep it
  factual: no efficacy numbers, no client names.
- New route in `src/App.tsx`: import
  `AiForRestorationServices` from
  `./pages/AiForRestorationServices` and add
  `<Route path="/ai-for-restoration-services" element={<AiForRestorationServices />} />`
  next to the existing `/ai-for-pool-service`
  route. Mirror the (non-)lazy-loading convention
  of the adjacent `/ai-for-pool-service` route.
  Per the 2026-09-05 route-code-splitting lesson,
  if the route lazy-loads, the new spec must NOT
  rely on `root.innerHTML.length > N` for
  readiness.
- Per the 2026-06-07 src-imports-tests lesson,
  add `/ai-for-restoration-services` to the
  `ROUTES` array in `src/data/routes.ts` (the
  canonical allow-list); `tests/e2e/routes.ts`
  re-exports it automatically and the smoke spec
  exercises the page.
- Per the 2026-05-30 second-@type lesson, BEFORE
  writing code grep `tests/e2e/ai-for-*.spec.ts`
  for `=== 'BreadcrumbList'` predicates. Document
  the grep result in the Implementation log. The
  ten predecessor specs are each URL-scoped to
  their own `/ai-for-<trade>` route per the
  ticket 0058 Implementation log; a new
  `/ai-for-restoration-services`-scoped
  BreadcrumbList cannot collide.
- Per the 2026-05-25 SEO Pilot lesson, the new
  e2e spec asserts the Helmet-managed
  `meta[name="description"]` content directly
  (LAST `meta[name="description"]` per the
  2026-05-25 Helmet-appends lesson), NOT
  `page.toHaveTitle()`.
  `/ai-for-restoration-services` is NOT in the
  `index.html` SEO Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every string
  in the page module (the H1, the
  META_DESCRIPTION, PAIN_POINTS titles and
  descriptions, STATS labels, DEMO_CARDS titles
  and descriptions, JSON-LD strings, CTA labels)
  uses hyphens. Self-Review greps the diff for
  `String.fromCharCode(8212)` before pushing.
- `tests/e2e/ai-for-restoration-services.spec.ts`
  (new) - one assertion per acceptance box.
  Model the spec on
  `tests/e2e/ai-for-pool-service.spec.ts`
  (ticket 0058, the direct peer). The demo-CTA
  case imports `ROUTES` from
  `tests/e2e/routes.ts` (which re-exports
  `src/data/routes.ts`) and asserts each CTA
  href appears in ROUTES.
- Per the 2026-05-22 two-PR ship lesson, ship
  will need a follow-up
  `chore/0072-ship-status` PR after the feat PR
  merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing
  the second PR so the file and index never
  drift mid-flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, the
  existing Navbar / Footer / StickyCTA /
  ScrollProgress components, the existing
  `trackCTAClick` helper, and the existing
  `useContent` hook. Schema migration: no.
  Privacy / security surface change: no - the
  page is static marketing copy and emits no new
  network call.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-10 - branch `feat/0072-ai-for-restoration-services-landing-page` opened off fresh origin/main; ticket flipped groomed to in-progress with README index row flipped in lockstep so `node scripts/check-backlog.mjs` stays green.
- 2026-09-10 - grepped `tests/e2e/ai-for-*.spec.ts` for `=== 'BreadcrumbList'`: every predecessor predicate is per-URL scoped (each spec calls its local goto helper first before iterating JSON-LD blocks), so a new `/ai-for-restoration-services`-scoped BreadcrumbList block cannot collide with any existing spec. `demo-breadcrumbs.spec.ts` iterates a hard-coded STARTER_ROUTES list that does not include the new route, so it is unaffected.
- 2026-09-10 - failing spec added in `tests/e2e/ai-for-restoration-services.spec.ts` modeled 1:1 on `tests/e2e/ai-for-pool-service.spec.ts`; new page `src/pages/AiForRestorationServices.tsx` added (copy of `AiForPoolService.tsx` with restoration-specific strings, under 280 lines), route registered in `src/App.tsx` next to `/ai-for-pool-service` and in the `ROUTES` allow-list in `src/data/routes.ts`.
