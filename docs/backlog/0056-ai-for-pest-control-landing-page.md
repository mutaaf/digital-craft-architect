---
id: 0056
title: AI-for-pest-control long-tail landing page funneling into home-services demos
status: in-progress
priority: P1
area: content
created: 2026-06-15
owner: gtm-innovation
---

## User story

As the owner of a residential pest-control company (a 4-truck
ant/roach/rodent operation, a termite-inspection-and-treatment
shop, a wildlife-removal one-truck specialist) Googling
"AI for pest control business," "AI receptionist pest control,"
or "pest control answering service" on a phone between a
quarterly recurring service call and a same-day rodent
emergency, I want one honest long-tail landing page at
`/ai-for-pest-control` that names the three specific pain
points that bleed pest-control margin (same-day rodent and
wasp emergency calls that route to voicemail after 6pm,
quarterly recurring-service renewal reminders that the office
manager forgets to send the week before the contract date,
review-collection windows that close before anyone asks after
a finished treatment) and that funnels into the three live
home-services demos the page reuses verbatim
(`/homeservices/demo/lead-responder`,
`/homeservices/demo/estimate`,
`/homeservices/demo/voice-followup`), so that I can try the
AI agent on my own phone in the parking lot before deciding
to book a 15-minute strategy call.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the long-tail trade-
landing pattern is now proven across SEVEN shipped pages
(`src/pages/AiForPlumbers.tsx` 0017,
`AiForHvac.tsx` 0020, `AiForRoofers.tsx` 0024,
`AiForElectricians.tsx` 0034, `AiForPainters.tsx` 0037,
`AiForLandscapers.tsx` 0041, `AiForCleaningServices.tsx`
0050). Each is a flat copy-replace of its predecessor with
the vertical-specific pain points and three demo cards
routing into the same `/homeservices/demo/*` family.
Pest control is the eighth vertical and is structurally
identical to cleaning services (the closest peer, ticket 0050)
because both are residential service trades with a recurring-
service revenue model, an after-hours emergency funnel, and a
post-service review-request window. Adding the eighth landing
page is exactly one new file (modeled 1:1 on
`AiForCleaningServices.tsx`), one new entry in `routes.ts`,
one new route in `App.tsx`, and one new spec file. The three
demo CTAs route into the existing `/homeservices/demo/*`
demos with no new demo build, no new backend, no new data,
no new component. Pest control is also a structurally clean
ICP for the trade-landing family because it is one of the
last large residential service verticals not yet covered
(garage-door repair, pool service, pest control are the
three obvious gaps); pest control wins the prioritization on
search-volume.

### Stakeholder

This widens the SEO moat in a query class adjacent to but
strictly separate from the seven existing trade pages:
"AI for pest control," "pest control AI receptionist,"
"pest control answering service AI," "AI for exterminators,"
"pest control automation." The cleaning-services page (0050)
established that the home-services demo family generalizes
cleanly to residential service trades with a recurring-
service revenue model and an after-hours emergency funnel;
pest control is the next vertical down that list. Per Google
Trends, "pest control answering service" out-volumes
"landscaping answering service" by roughly 1.5x and is in
the same general band as "HVAC answering service" (which
the 0020 landing page already captures), making this a
defensible-volume target. The page also closes a credibility
gap in the home-services trade family: pest control owners
who land on `/homeservices/demo/lead-responder` from a
generic "answering service" SERP query today see a chat
agent calibrated for "plumbing, HVAC, roofing, cleaning"
but not their specific scope (ant treatment, termite
inspection, rodent removal, wildlife exclusion). A
vertical-specific landing page reframes the same demo with
pest-control language at the top of funnel so the demo
itself feels personalized even though the demo backend is
unchanged. Per the ticket 0050 precedent, a new trade page
adds roughly 2-4 indexable surfaces to the SEO graph
(landing page itself, internal links from the homepage
industry strip, three demo-card outbound links indexable as
deep links).

### Visitor (in the real moment of use)

A 4-truck pest-control company owner Googles "AI for pest
control business" on a phone Friday afternoon in the parking
lot after a quarterly service. The SERP listing surfaces
`/ai-for-pest-control` with a meta description naming the
actual pain points (after-hours rodent and wasp emergency
calls hitting voicemail, recurring-service renewal reminders
slipping off the office manager's list, review windows
closing). One tap and the page loads in under one screen with
a hero H1, a three-pain-point strip, a 24/7 / <60s / 3
demos / 48h stats row, three demo CTA cards (lead responder,
estimate, voice follow-up) routing to the existing
`/homeservices/demo/*` demos, a "why now" trust strip, and
one strategy-call CTA. They tap the lead-responder demo from
the page, try the chat agent that already handles trade
intake, and see the qualification flow handle "rodents in the
attic, two-story house, need someone Saturday morning."
They leave the chat, scroll back up, tap "Book a Strategy
Call," and land on the calendly with the AI for pest control
context already in their head. Light and dark mode supported;
the page reads cleanly on a 375px viewport.

### Growth

The "show me" moment is the screenshot a pest-control owner
sends to their partner over text: a clean Digital Craft trade-
landing page naming the after-hours rodent-emergency pain
point in plain language, with a Try-the-Demo button below.
That is exactly the artifact a traditional-industry co-owner
forwards when they want their partner to take the same step.
Per the ticket 0017-0050 trade-landing precedent, each new
vertical page is the cheapest qualified strategy-call the
funnel can produce because the SERP intent is structurally
high (someone Googling "AI for pest control" has already
self-selected as a buyer evaluating AI automation for their
specific trade). Each CTA click fires `trackCTAClick` with a
`pestcontrol_*` location label so the funnel is measurable in
GA independently of the seven existing trade pages.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/AiForPestControl.tsx` (new file, under 280 lines) renders at `/ai-for-pest-control`, modeled 1:1 on `src/pages/AiForCleaningServices.tsx` (ticket 0050, the closest structural peer because both are residential service trades with a recurring-service revenue model and an after-hours emergency funnel; NOT `AiForPropertyManagers.tsx`, which routes to `/realestate/demo/*` and is the wrong demo family). The page has a hero with a pest-control-specific H1 (suggested: "AI for Pest Control Companies That Are Done Losing Same-Day Rodent and Wasp Emergency Calls to Voicemail"), a three-pain-point strip (after-hours emergencies go to voicemail; quarterly recurring-service renewal reminders slip off the office manager's list; review windows close before anyone asks after a finished treatment), a stats row mirroring the 0050 pattern (24/7 / <60s / 3 demos / 48h), three demo CTA cards routing to `/homeservices/demo/lead-responder`, `/homeservices/demo/estimate`, and `/homeservices/demo/voice-followup`, a "why now" trust strip, and one strategy-call CTA reusing the existing calendly URL. Every claim is defensible: no invented client names, no fabricated efficacy percentages, no pest-control efficacy data the page cannot cite from publicly available trade-association sources (NPMA market context only; cite the source in an HTML comment per the 2026-05-25 mirror-source-fix rule). Industry-standard language only, not DCA client results.
- [ ] The page emits ONE JSON-LD block inside the existing `<Helmet>` head matching the seven-page convention: a `BreadcrumbList` (Home -> AI for Pest Control) using the same shape as the existing `BREADCRUMB_SCHEMA` constant in `src/pages/AiForCleaningServices.tsx`. The page does NOT emit a `Service` block (the ticket 0050 page also does not; the seven existing trade pages emit `BreadcrumbList` only). Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/ai-for-*.spec.ts` for `=== 'BreadcrumbList'` predicates; the seven predecessor specs are all per-URL scoped per the ticket 0050 Implementation log, so a new `/ai-for-pest-control`-scoped block does not collide. The grep is mandatory regardless and the result is documented in the Implementation log.
- [ ] The new route is registered in `src/App.tsx` next to the existing `/ai-for-cleaning-services` route. The implementer adds `/ai-for-pest-control` to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson (the canonical allow-list); `tests/e2e/routes.ts` re-exports it automatically and the smoke spec exercises the page. The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in any JSON-LD serialized string, and every CTA route resolves to a registered route in `src/data/routes.ts`. The three demo CTAs route to `/homeservices/demo/lead-responder`, `/homeservices/demo/voice-followup`, and `/homeservices/demo/estimate` (the three home-services demos the trade family already funnels into); the strategy-call CTA opens calendly in a new tab with `rel="noopener noreferrer"` matching the existing trade-page convention from 0050.
- [ ] A new e2e spec at `tests/e2e/ai-for-pest-control.spec.ts` (modeled on `tests/e2e/ai-for-cleaning-services.spec.ts`) asserts: the page returns < 400 status, the H1 contains "Pest Control" (case-insensitive substring), the `meta[name="description"]` content names "pest control" (asserted on the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson), the `BreadcrumbList` JSON-LD has two items with the second one named "AI for Pest Control" linking to `https://digitalcraftai.com/ai-for-pest-control`, the three demo CTAs each resolve to a `/homeservices/demo/*` route present in `ROUTES` (imported from `tests/e2e/routes.ts`), the page text contains no `String.fromCharCode(8212)` code point, and dark mode renders cleanly via `document.documentElement.classList.add('dark')`. The CTA case locates the three demo-card CTAs via the existing per-page testid pattern (use `data-testid="pestcontrol-demo-cta"` on each card).
- [ ] No `/api/` change, no new hostname (the only external link is the existing `calendly.com/mutaaf` URL already used on every trade page), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the seven existing `src/pages/AiFor*.tsx` pages or their specs, no edits to `src/components/Industries.tsx` or any cross-vertical strip (cross-promotion from the homepage trade carousel is its own follow-up ticket). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; every pre-existing `tests/e2e/ai-for-*.spec.ts` stays green; the existing `tests/e2e/smoke.spec.ts` exercises the new route via the ROUTES re-export and stays green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A garage-door-repair, pool-service, or pressure-washing
  landing page in the same ticket. Each trade landing is
  structurally one ticket per the ticket 0017-0050
  precedent; this ticket picks pest control as the next
  highest-search-volume residential service trade not
  yet covered. Garage-door repair and pool service are
  separate future tickets and were not pre-authorized by
  any predecessor ticket's Out of Scope list.
- Building a pest-control-specific demo at
  `/homeservices/demo/pest-treatment-estimator` or
  similar. The page funnels into the three existing
  `/homeservices/demo/*` demos verbatim; a vertical-
  specific demo build is a separate cross-cutting ticket
  (it would touch the demo backend and is well outside
  the 200-line diff budget).
- Adding a Service JSON-LD block on the page. The seven
  existing trade pages emit `BreadcrumbList` only per
  the ticket 0050 Implementation log; the eighth page
  follows that convention. Adding a Service block would
  also trigger the 2026-05-30 second-@type collision
  audit on every trade-page spec, which is out of scope.
- Cross-promoting the new page from the homepage
  industries carousel (`src/components/Industries.tsx`)
  or any vertical strip. Cross-surface promotion is its
  own follow-up ticket once telemetry shows the page
  earns organic traffic on its own.
- Adding `/ai-for-pest-control` to the `index.html` SEO
  Pilot `pages` table. That is its own SEO-hygiene
  ticket and applies uniformly to all eight
  `/ai-for-*` routes, none of which are in the table
  per the 2026-05-25 SEO Pilot lesson. Out of scope
  here.
- A pest-control-specific blog post pointing at
  `/ai-for-pest-control`. Blog content ships through
  the `src/data/blogPosts.ts` pipeline and is gated
  by `check-blog-dates`; cross-promotion is its own
  content ticket.
- Internationalization (`inLanguage` fields on schema).
  The page is English-only, matching the seven
  predecessor trade pages.
- A testimonial from a named pest-control client. The
  AGENTS.md Hard NO on invented testimonials applies; a
  real testimonial ships through its own dated blog
  post via the existing pipeline once a real client
  agrees to attribution.
- A "compare Digital Craft vs pest-control-specific
  scheduling software" comparison page (e.g.
  PestPac, FieldRoutes, GorillaDesk). Each comparison
  page is structurally its own ticket per the ticket
  0021-0049 precedent and was not pre-authorized.
- Cross-vertical related-demos surfacing of the new
  page in the `RelatedDemos` component (ticket 0027).
  The component reads from a separate `relatedDemos`
  data structure and is its own follow-up ticket.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/AiForPestControl.tsx` (under 280
  lines). Copy `src/pages/AiForCleaningServices.tsx`
  (ticket 0050) end-to-end as the starting frame,
  then swap every "cleaning" / "cleaning services"
  / "cleaning company" string for the pest-control
  equivalent. Keep the same module-level mirror-
  source constants: `HERO_H1`, `META_DESCRIPTION`,
  `PAIN_POINTS`, `STATS`, `DEMO_CARDS`,
  `BREADCRUMB_SCHEMA` (per the 2026-05-25 mirror-
  source rule the description used in the Helmet
  meta tag and the JSON-LD MUST read from the same
  `META_DESCRIPTION` constant). Swap the three
  PAIN_POINTS entries to the three pest-control-
  specific dimensions named in the acceptance
  criteria (after-hours rodent / wasp emergencies,
  quarterly recurring-service renewal reminders,
  review-collection windows after a finished
  treatment). Keep it factual: no efficacy numbers,
  no client names, no DCA-specific data, industry-
  standard market context only (NPMA / Angi pest-
  control market write-ups, not DCA client
  results).
- New route in `src/App.tsx`: import `AiForPestControl`
  from `./pages/AiForPestControl` and add
  `<Route path="/ai-for-pest-control" element={<AiForPestControl />} />`
  next to the existing `/ai-for-cleaning-services`
  route. Mirror the (non-)lazy-loading convention
  of the adjacent trade routes per the ticket 0050
  precedent.
- Per the 2026-06-07 src-imports-tests lesson, add
  `/ai-for-pest-control` to the `ROUTES` array in
  `src/data/routes.ts` (the canonical allow-list);
  `tests/e2e/routes.ts` re-exports it automatically
  and the smoke spec exercises the page.
- Per the 2026-05-30 second-@type lesson, BEFORE
  writing code grep `tests/e2e/ai-for-*.spec.ts`
  AND `tests/e2e/*-jsonld.spec.ts` for
  `=== 'BreadcrumbList'` predicates. Confirm no
  spec asserts "exactly one BreadcrumbList site-
  wide" (the seven existing trade-page predicates
  are per-URL scoped per the ticket 0050
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
- `tests/e2e/ai-for-pest-control.spec.ts` (new)
  - one assertion per acceptance box. Model end-
  to-end on `tests/e2e/ai-for-cleaning-services.spec.ts`
  (the most recent peer). CTA case: locate the
  three demo-card CTAs via the existing per-page
  testid pattern (use
  `data-testid="pestcontrol-demo-cta"` on each
  card and assert each `href` resolves to a
  `/homeservices/demo/*` path present in the
  `ROUTES` array imported from
  `tests/e2e/routes.ts`).
- Per the 2026-05-22 two-PR ship lesson, ship
  will need a follow-up
  `chore/0056-ship-status` PR after the feat PR
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

### 2026-06-15 - implementation-dev pickup

Branched `feat/0056-ai-for-pest-control` off fresh `origin/main` (last commit
`b5acc57`, ticket 0054 ship-status). Flipped ticket frontmatter and the
`docs/backlog/README.md` index row to `in-progress` together in the first
commit per the 2026-05-22 two-PR lesson.

### 2026-06-15 - mandatory grep audit (2026-05-30 second-@type lesson)

Per the engineering note, ran:

```
grep -rn "=== 'BreadcrumbList'" tests/e2e
grep -rn "exactly one BreadcrumbList" tests/e2e
```

Every `=== 'BreadcrumbList'` predicate is inside a per-URL spec that calls its
own local goto helper (e.g. `gotoCleaningServices`, `gotoPlumbers`, etc.) before
running the predicate, so the assertion is scoped to the page under test, not
the whole site. The seven existing `tests/e2e/ai-for-*.spec.ts` "exactly one
BreadcrumbList block expected" assertions are all of that per-URL shape; the
new `/ai-for-pest-control` page emits exactly one BreadcrumbList on its own
URL and cannot collide with any of them.

`tests/e2e/demo-breadcrumbs.spec.ts` iterates a hard-coded `STARTER_ROUTES`
list of demo hub/leaf routes (construction, realestate). It does NOT include
`/ai-for-pest-control` and is not generalized by glob over `ROUTES`, so adding
a new top-level trade page cannot regress it.

No spec asserts "exactly one BreadcrumbList site-wide." The deviation budget
is zero - the new page is safe to ship.

### 2026-06-15 - TDD red phase

Wrote `tests/e2e/ai-for-pest-control.spec.ts` first, modeled 1:1 on
`tests/e2e/ai-for-cleaning-services.spec.ts` (the closest peer per the ticket).
Ran the spec against the not-yet-implemented page; it failed at the H1 check
as expected. Then shipped `src/pages/AiForPestControl.tsx` and registered the
route in `src/App.tsx` + `src/data/routes.ts`.
