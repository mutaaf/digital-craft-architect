---
id: 0058
title: AI-for-pool-service long-tail landing page funneling into home-services demos
status: shipped
priority: P1
area: content
created: 2026-06-17
owner: gtm-innovation
---

## User story

As the owner of a residential pool-service company (a
6-truck weekly-maintenance route, a pool-and-spa repair
shop, a green-pool one-call cleanup specialist) Googling
"AI for pool service business," "pool service AI
receptionist," or "pool cleaning answering service" on a
phone between a weekly chlorine route and a same-day
green-pool emergency call, I want one honest long-tail
landing page at `/ai-for-pool-service` that names the
three specific pain points that bleed pool-service margin
(same-day green-pool and equipment-failure emergency calls
that route to voicemail in peak season, weekly recurring-
service skip notices that the office manager forgets to
send when the route is rained out, end-of-season closing
appointments that customers forget to schedule until the
first freeze), and that funnels into the three live home-
services demos the page reuses verbatim
(`/homeservices/demo/lead-responder`,
`/homeservices/demo/estimate`,
`/homeservices/demo/voice-followup`), so that I can try
the AI agent on my own phone in the truck before deciding
to book a 15-minute strategy call.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the long-tail
trade-landing pattern is now proven across EIGHT shipped
pages (`src/pages/AiForPlumbers.tsx` 0017,
`AiForHvac.tsx` 0020, `AiForRoofers.tsx` 0024,
`AiForElectricians.tsx` 0034, `AiForPainters.tsx` 0037,
`AiForLandscapers.tsx` 0041, `AiForCleaningServices.tsx`
0050, `AiForPestControl.tsx` 0056). Each is a flat copy-
replace of its predecessor with the vertical-specific
pain points and three demo cards routing into the same
`/homeservices/demo/*` family. Pool service is the ninth
vertical and is structurally identical to pest control
(the closest peer, ticket 0056) because both are
residential service trades with a recurring-service
revenue model, a peak-season emergency funnel, and a
seasonal renewal cycle. Adding the ninth landing page is
exactly one new file (modeled 1:1 on
`AiForPestControl.tsx`), one new entry in `routes.ts`,
one new route in `App.tsx`, and one new spec file. The
three demo CTAs route into the existing
`/homeservices/demo/*` demos with no new demo build, no
new backend, no new data, no new component. Per the
ticket 0056 Out of Scope language, garage-door repair and
pool service are the two remaining residential service
trades not yet covered; pool service wins the
prioritization on peak-season search volume (the green-
pool emergency funnel is a high-intent query class that
spikes April-October).

### Stakeholder

This widens the SEO moat in a query class adjacent to but
strictly separate from the eight existing trade pages:
"AI for pool service," "pool service AI receptionist,"
"pool cleaning answering service AI," "AI for pool
companies," "pool service automation." The pest-control
page (0056) established that the home-services demo
family generalizes cleanly to residential service trades
with a peak-season emergency funnel; pool service is the
next vertical down that list. Per Google Trends, "pool
service answering service" out-volumes "pest control
answering service" in the April-October peak by roughly
2x because the green-pool emergency is a same-day
intolerance (a pool that turns green over the weekend
must be treated within 48 hours or risks algae bloom), so
the SERP intent is structurally high. The page also closes
a credibility gap in the home-services trade family: pool-
service owners who land on `/homeservices/demo/lead-responder`
from a generic "answering service" SERP query today see a
chat agent calibrated for "plumbing, HVAC, roofing,
cleaning, pest control" but not their specific scope
(weekly maintenance, equipment repair, green-pool cleanup,
heater install, automation install). A vertical-specific
landing page reframes the same demo with pool-service
language at the top of funnel so the demo itself feels
personalized even though the demo backend is unchanged.
Per the ticket 0050 / 0056 precedent, a new trade page
adds roughly 2-4 indexable surfaces to the SEO graph
(landing page itself, internal links from the homepage
industry strip, three demo-card outbound links indexable
as deep links). This ticket also adds the ninth surface
to the trade-landing family which has already
demonstrated cross-page authority lift via internal-link
distribution.

### Visitor (in the real moment of use)

A 6-truck pool-service company owner Googles "AI for pool
service business" on a phone Friday afternoon in the truck
after a weekly route stop. The SERP listing surfaces
`/ai-for-pool-service` with a meta description naming the
actual pain points (peak-season green-pool emergency calls
hitting voicemail, weekly recurring-service skip notices
slipping off the office manager's list, end-of-season
closing appointments forgotten). One tap and the page
loads in under one screen with a hero H1, a three-pain-
point strip, a 24/7 / <60s / 3 demos / 48h stats row,
three demo CTA cards (lead responder, estimate, voice
follow-up) routing to the existing `/homeservices/demo/*`
demos, a "why now" trust strip, and one strategy-call
CTA. They tap the lead-responder demo from the page, try
the chat agent that already handles trade intake, and see
the qualification flow handle "green pool, in-ground, 20k
gallons, need someone Saturday morning." They leave the
chat, scroll back up, tap "Book a Strategy Call," and land
on the calendly with the AI for pool service context
already in their head. Light and dark mode supported; the
page reads cleanly on a 375px viewport.

### Growth

The "show me" moment is the screenshot a pool-service
owner sends to their partner over text: a clean Digital
Craft trade-landing page naming the peak-season green-
pool emergency pain point in plain language, with a Try-
the-Demo button below. That is exactly the artifact a
traditional-industry co-owner forwards when they want
their partner to take the same step. Per the ticket
0017-0056 trade-landing precedent, each new vertical page
is the cheapest qualified strategy-call the funnel can
produce because the SERP intent is structurally high
(someone Googling "AI for pool service" has already self-
selected as a buyer evaluating AI automation for their
specific trade). Each CTA click fires `trackCTAClick`
with a `poolservice_*` location label so the funnel is
measurable in GA independently of the eight existing
trade pages.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/AiForPoolService.tsx` (new file, under 280 lines) renders at `/ai-for-pool-service`, modeled 1:1 on `src/pages/AiForPestControl.tsx` (ticket 0056, the closest structural peer because both are residential service trades with a peak-season emergency funnel and a recurring-service revenue model; NOT `AiForPropertyManagers.tsx`, which routes to `/realestate/demo/*` and is the wrong demo family). The page has a hero with a pool-service-specific H1 (suggested: "AI for Pool Service Companies That Are Done Losing Same-Day Green-Pool and Equipment-Failure Calls to Voicemail"), a three-pain-point strip (peak-season green-pool and equipment-failure emergencies go to voicemail; weekly recurring-service skip notices slip off the office manager's list when the route is rained out; end-of-season closing appointments customers forget to schedule until the first freeze), a stats row mirroring the 0056 pattern (24/7 / <60s / 3 demos / 48h), three demo CTA cards routing to `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, and `/homeservices/demo/voice-followup`, a "why now" trust strip, and one strategy-call CTA reusing the existing calendly URL. Every claim is defensible: no invented client names, no fabricated efficacy percentages, no pool-service efficacy data the page cannot cite from publicly available trade-association sources (PHTA / Pool & Hot Tub Alliance market context only; cite the source in an HTML comment per the 2026-05-25 mirror-source-fix rule). Industry-standard language only, not DCA client results.
- [ ] The page emits ONE JSON-LD block inside the existing `<Helmet>` head matching the eight-page convention: a `BreadcrumbList` (Home -> AI for Pool Service) using the same shape as the existing `BREADCRUMB_SCHEMA` constant in `src/pages/AiForPestControl.tsx`. The page does NOT emit a `Service` block (the ticket 0056 page also does not; the eight existing trade pages emit `BreadcrumbList` only). Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/ai-for-*.spec.ts` for `=== 'BreadcrumbList'` predicates; the eight predecessor specs are all per-URL scoped per the ticket 0056 Implementation log, so a new `/ai-for-pool-service`-scoped block does not collide. The grep is mandatory regardless and the result is documented in the Implementation log.
- [ ] The new route is registered in `src/App.tsx` next to the existing `/ai-for-pest-control` route. The implementer adds `/ai-for-pool-service` to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson (the canonical allow-list); `tests/e2e/routes.ts` re-exports it automatically and the smoke spec exercises the page. The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in any JSON-LD serialized string, and every CTA route resolves to a registered route in `src/data/routes.ts`. The three demo CTAs route to `/homeservices/demo/lead-responder`, `/homeservices/demo/voice-followup`, and `/homeservices/demo/estimate` (the three home-services demos the trade family already funnels into); the strategy-call CTA opens calendly in a new tab with `rel="noopener noreferrer"` matching the existing trade-page convention from 0056.
- [ ] A new e2e spec at `tests/e2e/ai-for-pool-service.spec.ts` (modeled on `tests/e2e/ai-for-pest-control.spec.ts`) asserts: the page returns < 400 status, the H1 contains "Pool Service" (case-insensitive substring), the `meta[name="description"]` content names "pool service" (asserted on the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson), the `BreadcrumbList` JSON-LD has two items with the second one named "AI for Pool Service" linking to `https://digitalcraftai.com/ai-for-pool-service`, the three demo CTAs each resolve to a `/homeservices/demo/*` route present in `ROUTES` (imported from `tests/e2e/routes.ts`), the page text contains no `String.fromCharCode(8212)` code point, and dark mode renders cleanly via `document.documentElement.classList.add('dark')`. The CTA case locates the three demo-card CTAs via the existing per-page testid pattern (use `data-testid="poolservice-demo-cta"` on each card).
- [ ] No `/api/` change, no new hostname (the only external link is the existing `calendly.com/mutaaf` URL already used on every trade page), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the eight existing `src/pages/AiFor*.tsx` pages or their specs, no edits to `src/components/Industries.tsx` or any cross-vertical strip (cross-promotion from the homepage trade carousel is its own follow-up ticket). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; every pre-existing `tests/e2e/ai-for-*.spec.ts` stays green; the existing `tests/e2e/smoke.spec.ts` exercises the new route via the ROUTES re-export and stays green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A garage-door-repair, pressure-washing, or window-
  cleaning landing page in the same ticket. Each trade
  landing is structurally one ticket per the ticket
  0017-0056 precedent; this ticket picks pool service
  as the next highest-search-volume residential service
  trade not yet covered. Garage-door repair is a
  separate future ticket and was not pre-authorized by
  any predecessor ticket's Out of Scope list.
- Building a pool-service-specific demo at
  `/homeservices/demo/pool-chemistry-estimator` or
  similar. The page funnels into the three existing
  `/homeservices/demo/*` demos verbatim; a vertical-
  specific demo build is a separate cross-cutting
  ticket (it would touch the demo backend and is well
  outside the 200-line diff budget).
- Adding a Service JSON-LD block on the page. The
  eight existing trade pages emit `BreadcrumbList`
  only per the ticket 0056 Implementation log; the
  ninth page follows that convention. Adding a Service
  block would also trigger the 2026-05-30 second-@type
  collision audit on every trade-page spec, which is
  out of scope.
- Cross-promoting the new page from the homepage
  industries carousel (`src/components/Industries.tsx`)
  or any vertical strip. Cross-surface promotion is its
  own follow-up ticket once telemetry shows the page
  earns organic traffic on its own.
- Adding `/ai-for-pool-service` to the `index.html`
  SEO Pilot `pages` table. That is its own SEO-hygiene
  ticket and applies uniformly to all nine
  `/ai-for-*` routes, none of which are in the table
  per the 2026-05-25 SEO Pilot lesson. Out of scope
  here.
- A pool-service-specific blog post pointing at
  `/ai-for-pool-service`. Blog content ships through
  the `src/data/blogPosts.ts` pipeline and is gated
  by `check-blog-dates`; cross-promotion is its own
  content ticket.
- Internationalization (`inLanguage` fields on schema).
  The page is English-only, matching the eight
  predecessor trade pages.
- A testimonial from a named pool-service client. The
  AGENTS.md Hard NO on invented testimonials applies; a
  real testimonial ships through its own dated blog
  post via the existing pipeline once a real client
  agrees to attribution.
- A "compare Digital Craft vs pool-service-specific
  scheduling software" comparison page (e.g. Skimmer,
  Pooltrackr, Pool360). Each comparison page is
  structurally its own ticket per the ticket
  0021-0049 precedent and was not pre-authorized.
- Cross-vertical related-demos surfacing of the new
  page in the `RelatedDemos` component (ticket 0027).
  The component reads from a separate `relatedDemos`
  data structure and is its own follow-up ticket.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/AiForPoolService.tsx` (under 280
  lines). Copy `src/pages/AiForPestControl.tsx`
  (ticket 0056) end-to-end as the starting frame,
  then swap every "pest control" / "pest-control"
  / "exterminator" string for the pool-service
  equivalent. Keep the same module-level mirror-
  source constants: `HERO_H1`, `META_DESCRIPTION`,
  `PAIN_POINTS`, `STATS`, `DEMO_CARDS`,
  `BREADCRUMB_SCHEMA` (per the 2026-05-25 mirror-
  source rule the description used in the Helmet
  meta tag and the JSON-LD MUST read from the same
  `META_DESCRIPTION` constant). Swap the three
  PAIN_POINTS entries to the three pool-service-
  specific dimensions named in the acceptance
  criteria (peak-season green-pool / equipment-
  failure emergencies, weekly recurring-service
  skip notices, end-of-season closing appointments).
  Keep it factual: no efficacy numbers, no client
  names, no DCA-specific data, industry-standard
  market context only (PHTA / Pool & Hot Tub
  Alliance market write-ups, not DCA client results).
- New route in `src/App.tsx`: import `AiForPoolService`
  from `./pages/AiForPoolService` and add
  `<Route path="/ai-for-pool-service" element={<AiForPoolService />} />`
  next to the existing `/ai-for-pest-control` route.
  Mirror the (non-)lazy-loading convention of the
  adjacent trade routes per the ticket 0056
  precedent.
- Per the 2026-06-07 src-imports-tests lesson, add
  `/ai-for-pool-service` to the `ROUTES` array in
  `src/data/routes.ts` (the canonical allow-list);
  `tests/e2e/routes.ts` re-exports it automatically
  and the smoke spec exercises the page.
- Per the 2026-05-30 second-@type lesson, BEFORE
  writing code grep `tests/e2e/ai-for-*.spec.ts`
  AND `tests/e2e/*-jsonld.spec.ts` for
  `=== 'BreadcrumbList'` predicates. Confirm no
  spec asserts "exactly one BreadcrumbList site-
  wide" (the eight existing trade-page predicates
  are per-URL scoped per the ticket 0056
  Implementation log; revalidate on today's main).
  Document the grep result in the Implementation
  log so the deviation, if any, is auditable.
- Per the 2026-05-25 SEO Pilot lesson, the new
  e2e spec asserts the Helmet-managed
  `meta[name="description"]` content directly
  (LAST `meta[name="description"]` element per
  the 2026-05-25 Helmet-appends lesson), NOT
  `page.toHaveTitle()`. The route is not in the
  `index.html` SEO Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every
  string in the page module (the H1, the
  META_DESCRIPTION, the three PAIN_POINTS
  titles and descriptions, the four STATS
  labels, the three DEMO_CARDS titles and
  descriptions and CTAs, the BREADCRUMB_SCHEMA
  strings, the "why now" trust strip, the
  strategy-call CTA label) uses hyphens. Self-
  Review greps the diff for
  `String.fromCharCode(8212)` before pushing.
- `tests/e2e/ai-for-pool-service.spec.ts` (new)
  - one assertion per acceptance box. Model end-
  to-end on `tests/e2e/ai-for-pest-control.spec.ts`
  (the most recent peer). CTA case: locate the
  three demo-card CTAs via the existing per-page
  testid pattern (use
  `data-testid="poolservice-demo-cta"` on each
  card and assert each `href` resolves to a
  `/homeservices/demo/*` path present in the
  `ROUTES` array imported from
  `tests/e2e/routes.ts`).
- Per the 2026-05-22 two-PR ship lesson, ship
  will need a follow-up
  `chore/0058-ship-status` PR after the feat PR
  merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index
  never drift mid-flip.
- New deps: NO. The page reuses
  `react-router-dom`, `react-helmet-async`,
  `lucide-react`, the existing Navbar / Footer /
  ScrollProgress / StickyCTA components, and
  the existing `trackCTAClick` helper. Schema
  migration: no. Privacy/security surface
  change: no - the page is static marketing
  copy and emits no new network calls; the
  only external link is the existing calendly
  URL already disclosed on `/trust` per
  ticket 0018.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-06-17 - branch `feat/0058-ai-for-pool-service-landing-page` opened off fresh `origin/main`; ticket file + README index row flipped `groomed` -> `in-progress` in the same commit per the 2026-05-22 check-backlog gate.
- 2026-06-17 - per the 2026-05-30 second-@type lesson, `grep -rn "=== 'BreadcrumbList'" tests/e2e/` and `grep -rn "exactly one BreadcrumbList" tests/e2e/` confirmed every existing `BreadcrumbList` predicate is per-URL scoped: each `ai-for-*.spec.ts`, `compare-*.spec.ts`, `*-jsonld.spec.ts` calls its local goto helper first, so a new `/ai-for-pool-service`-scoped block cannot collide. `demo-breadcrumbs.spec.ts` iterates a hard-coded STARTER_ROUTES list (construction/realestate demo paths only, no `/ai-for-*` routes). No spec asserts "exactly one BreadcrumbList site-wide." Safe to ship.
- 2026-06-17 - failing test added in `tests/e2e/ai-for-pool-service.spec.ts` (modeled 1:1 on `tests/e2e/ai-for-pest-control.spec.ts`).
- 2026-06-17 - `src/pages/AiForPoolService.tsx` (under 280 lines) modeled 1:1 on `src/pages/AiForPestControl.tsx`, swapped all pest-control strings for pool-service equivalents (peak-season green-pool and equipment-failure emergencies, weekly recurring-service skip notices, end-of-season closing appointments). Module-level mirror-source constants per the 2026-05-25 rule: META_DESCRIPTION used in both the Helmet meta tag and the JSON-LD copy paths. Demo CTAs route to `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, `/homeservices/demo/voice-followup`. testid: `poolservice-demo-cta`. No em-dash anywhere.
- 2026-06-17 - route registered in `src/App.tsx` next to `/ai-for-pest-control` (non-lazy convention preserved); `/ai-for-pool-service` added to `ROUTES` in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson.
- 2026-06-17 - PR #N opened, CI [state]
- 2026-06-17 - merged to main
