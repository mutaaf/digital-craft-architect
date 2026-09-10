---
id: 0073
title: Comparison page "Digital Craft vs JobTread" for high-intent construction-management switchers
status: in-progress
priority: P1
area: seo
created: 2026-09-10
owner: gtm-innovation
---

## User story

As a residential or light-commercial general
contractor (a 12-crew remodeler two years into a
JobTread subscription evaluating whether the CRM
answers the leads it stores, a design-build owner
comparing JobTread and Buildertrend at renewal, an
ops manager for a 30-employee GC weighing the AI
agent stack against the JobTread action-plan drip
sequences), Googling "JobTread alternative,"
"JobTread vs," "AI for construction CRM," or
"JobTread AI integration" on a laptop between
site walks, I want one honest comparison page at
`/compare/jobtread` that names which job JobTread
does well (a construction project-management CRM
with estimating, scheduling, financials, and
customer portals) and which job Digital Craft does
instead (answering, qualifying, and following up
with the leads a CRM already stores plus running
live AI voice negotiations), so that I can decide
in 90 seconds whether the AI agent layer is a
replacement, a complement, or a pass without
bouncing back to search.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the
comparison-page pattern is now proven across
THIRTEEN shipped pages under
`src/pages/compare/*.tsx` (HubSpot, GoHighLevel,
Zapier, Make, Intercom, Jobber, ServiceTitan,
Podium, Housecall Pro, Buildertrend, Thumbtack,
Angi, Follow Up Boss) and the canonical
`/compare` hub (ticket 0048) reads from
`src/data/compareEntries.ts` and picks up any
fourteenth entry automatically. Adding this
comparison is one new page file, one new spec
file, two two-line entries (route in
`src/App.tsx`, path in `src/data/routes.ts`),
and one new entry in
`src/data/compareEntries.ts`. JobTread is the
closest ADJACENT residential-construction PM
platform to Buildertrend (ticket 0042) but the
positioning is distinct: JobTread bundles
estimating, scheduling, and financials for
residential remodelers and light-commercial GCs
around a single job-record view, competing head
to head with Buildertrend and CoConstruct.
Digital Craft is the AI conversation layer that
answers the leads a PM platform stores.
Structurally identical to Follow Up Boss (ticket
0065) in the compare-page shape and to
Buildertrend (ticket 0042) in the construction
vertical positioning, but capturing a JobTread-
specific SERP niche no shipped page addresses.
Zero new component, zero new data shape, zero
new JSON-LD `@type` first emission.

### Stakeholder

This widens the SEO moat in a query class the
thirteen existing comparison pages structurally
cannot capture: the construction-PM SERP niche
around JobTread ("JobTread alternative,"
"JobTread vs," "JobTread AI integration,"
"AI for construction CRM"). JobTread is one of
the fastest-growing construction PM platforms
for the residential-remodeler and
light-commercial-GC segment, competing head to
head with Buildertrend, CoConstruct, and
Contractor Foreman, and the construction funnel
(`/construction`, `/construction/demo`,
`/case-studies/construction`) has a Buildertrend
comparison anchor (ticket 0042) but no JobTread
anchor. Per the 2026-05-30 second-@type lesson,
BEFORE writing code the implementer greps every
existing `tests/e2e/compare-*.spec.ts` AND every
existing `tests/e2e/*-jsonld.spec.ts` for
`=== 'BreadcrumbList'` AND `=== 'WebPage'`
predicates; the thirteen predecessor compare
specs are each URL-scoped to their own
`/compare/<tool>` route per the ticket 0065
Implementation log, so a fourteenth
`/compare/jobtread`-scoped pair cannot collide.
The grep is mandatory and its result is
documented in the Implementation log. This is
also the SECOND construction-vertical-specific
comparison page (Buildertrend was the first),
which structurally lifts the credibility of the
entire `/construction` funnel: a GC who taps
"vs JobTread" from the `/compare` hub
self-selects as a paying PM-platform
subscriber, the highest-intent prospect the
construction funnel can produce.

### Visitor (in the real moment of use)

A remodeler running twelve crews Googles
"JobTread alternative for small GC" on a laptop
between morning site walks. The SERP surfaces
`/compare/jobtread` with a description that
names the actual frustration (paying for a PM
platform that stores leads and schedules jobs
but never answers a lead who called after 6pm)
instead of marketing fluff. One click and the
page loads in under one screen with a
positioning sentence at the top ("JobTread runs
your job records, Digital Craft answers the
leads that never become jobs"), a four-row
comparison table (Lead capture, First response,
Estimating, Negotiation), a "Use both" section
acknowledging JobTread still owns the job-record
and financial-tracking work a GC depends on
while AI handles the first-touch and after-hours
qualification, three demo CTAs routing to the
existing construction demos (`/construction/demo/lead-responder`,
`/construction/demo/estimate`,
`/construction/demo/voice-negotiator`), and one
strategy-call CTA below. The GC leaves in 90
seconds knowing whether the AI agent layer is a
replacement, a complement, or a pass. Light and
dark mode supported; the page reads cleanly on
a 375px viewport.

### Growth

The "show me" moment is the SERP listing for
"JobTread alternative" surfacing a real, honest
comparison page that does NOT trash JobTread but
reframes the spend (their PM platform plus our
AI agent layer, not their platform replaced). A
GC who Slack-shares the page to a peer with
"this is exactly the frame I was missing" is
the cheapest qualified strategy-call the
construction funnel can produce because the
share is peer-to-peer between two paying
JobTread subscribers, both of whom are
already spending on construction PM software.
The comparison hub (`/compare`) picks up the
new entry via `COMPARE_ENTRIES.length` mapping
automatically per the ticket 0048 mirror-source
pattern.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/compare/JobTread.tsx` (new file, under 260 lines) renders at `/compare/jobtread`, modeled 1:1 on `src/pages/compare/FollowUpBoss.tsx` (ticket 0065, the closest recent structural peer at similar file size AND hub-aware breadcrumb shape) with construction-vertical positioning cross-referenced against `src/pages/compare/Buildertrend.tsx` (ticket 0042). The page has a hero H1 ("Digital Craft AI vs JobTread"), a positioning paragraph naming JobTread's real strength (a construction PM platform that bundles estimating, scheduling, financials, and customer portals for residential remodelers and light-commercial GCs) and Digital Craft's complementary strength (AI answering, qualifying, and voice-negotiating the leads a PM platform stores), a four-row comparison table (Lead capture, First response, Estimating, Negotiation) with short text cells (NOT check/x icons, matching the ticket 0065 rationale that the two tools solve different jobs), a "Use both" or three-differentiator strip, three demo CTAs routing to `/construction/demo/lead-responder`, `/construction/demo/estimate`, `/construction/demo/voice-negotiator`, and one strategy-call CTA reusing the existing Calendly URL. Every claim is defensible: no invented client names, no fabricated efficacy percentages, no JobTread pricing figure the page cannot cite from `jobtread.com/pricing` in an HTML source comment per the 2026-05-25 mirror-source-fix rule. Positioning is complement-not-replace per the ticket 0065 precedent.
- [ ] The page emits TWO JSON-LD blocks inside the existing `<Helmet>` head matching the thirteen-page convention: a `BreadcrumbList` (Home to Compare to Digital Craft vs JobTread) using the hub-aware three-item shape from `src/pages/compare/FollowUpBoss.tsx` (with the middle item named "Compare" linking to `/compare`), and a `WebPage` block with `name`, `description` (equal to `META_DESCRIPTION` per the 2026-05-25 mirror-source rule), `url: 'https://digitalcraftai.com/compare/jobtread'`, and `isPartOf: { '@type': 'WebSite', url: 'https://digitalcraftai.com' }`. Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/compare-*.spec.ts` AND every existing `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'` AND `=== 'WebPage'` predicates; the thirteen predecessor compare specs are each URL-scoped to their own `/compare/<tool>` route per the ticket 0065 Implementation log, so a fourteenth `/compare/jobtread`-scoped pair cannot collide. The grep is mandatory regardless.
- [ ] A new entry is appended to `src/data/compareEntries.ts` for JobTread: `{ id: 'jobtread', tool: 'JobTread', path: '/compare/jobtread', tagline: 'JobTread runs your job records, financials, and schedules. Digital Craft is the AI agent layer that answers the leads a PM platform never gets around to.' }`. The tagline is hyphen-only per the 2026-05-07 em-dash Hard NO. The `/compare` hub (ticket 0048 `src/pages/CompareHub.tsx`) reads `COMPARE_ENTRIES.length` and renders one card per entry automatically, so appending here surfaces the JobTread card on the hub without a hub edit. The hub's `ItemList` JSON-LD `numberOfItems` and `itemListElement` both derive from `COMPARE_ENTRIES` so both widen automatically.
- [ ] The new route is registered in `src/App.tsx` next to the existing `/compare/followupboss` route. The implementer adds `/compare/jobtread` to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson; `tests/e2e/routes.ts` re-exports it automatically and the smoke spec exercises the page. The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date. Per the 2026-09-05 route-code-splitting lesson, if the route is `React.lazy`-wrapped mirroring adjacent `/compare/*` routes, the new spec must NOT rely on `root.innerHTML.length > N` for readiness.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text, in the `compareEntries.ts` addition, or in any JSON-LD serialized string. Every CTA route resolves to a registered route in `src/data/routes.ts`. The three demo CTAs route to `/construction/demo/lead-responder`, `/construction/demo/estimate`, and `/construction/demo/voice-negotiator` (the three construction demos that map to the four comparison dimensions); the strategy-call CTA opens Calendly in a new tab with `rel="noopener noreferrer"` matching the existing compare-page convention from 0065.
- [ ] A new e2e spec at `tests/e2e/compare-jobtread.spec.ts` (modeled on `tests/e2e/compare-followupboss.spec.ts`) asserts: (1) the page returns a status under 400 and the H1 contains "JobTread" (case-insensitive substring), (2) the `meta[name="description"]` content names "JobTread" (asserted on the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson), (3) the `BreadcrumbList` JSON-LD has three items, the middle one named "Compare" and linking to `https://digitalcraftai.com/compare`, the third named matching the H1 substring and linking to `https://digitalcraftai.com/compare/jobtread`, (4) the `WebPage` JSON-LD's `description` byte-matches the `meta[name="description"]` content per the 2026-05-25 mirror-source rule, (5) the four comparison-table rows exist (Lead capture, First response, Estimating, Negotiation) via `data-testid="jobtread-comparison-row"` count of 4, (6) the three demo CTAs each resolve to a `/construction/demo/*` route present in `ROUTES` (imported from `tests/e2e/routes.ts`), (7) the page text contains no `String.fromCharCode(8212)` code point, (8) dark mode renders cleanly via `document.documentElement.classList.add('dark')`, (9) sibling-hub-regression case navigates to `/compare` and asserts (a) the hub card count equals `COMPARE_ENTRIES.length` (imported from `src/data/compareEntries.ts`), (b) a card with tool text "JobTread" is present, (c) the hub's `ItemList` JSON-LD `numberOfItems` equals `COMPARE_ENTRIES.length` to prove the additive `compareEntries.ts` edit widened both the render and the schema per the ticket 0048 mirror-source rule.
- [ ] Standard box: no `/api/` change, no new hostname (the only external link is the existing Calendly URL already used on every compare page), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the thirteen existing `src/pages/compare/*.tsx` pages or their specs beyond the additive `compareEntries.ts` entry. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; every pre-existing `tests/e2e/compare-*.spec.ts` (thirteen of them) stays green; the existing `tests/e2e/compare-hub.spec.ts` (ticket 0048) stays green because its assertion reads `COMPARE_ENTRIES.length` and widens automatically.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- Standard anti-goals: no /api/ changes, no
  package.json changes, no em-dashes in copy,
  dark-mode required.
- A second comparison page in the same ticket
  (WorkWave, FieldEdge, ServiceFusion, Kickserv,
  mHelpDesk, Contractor Foreman, JobNimbus,
  CompanyCam). Each comparison is one ticket per
  the ticket 0021 to 0065 precedent; this ticket
  picks JobTread as the next construction-vertical
  incumbent not yet covered. The other names above
  are separate future tickets and were not
  pre-authorized by any predecessor Out of Scope
  list.
- Editing the ticket 0042 Buildertrend page or
  the ticket 0065 Follow Up Boss page. This
  ticket is purely additive; both peers stay
  byte-identical.
- Cross-promoting the new page from the homepage
  hero, the `/construction` marketing page, or
  any vertical strip. Cross-surface promotion is
  its own follow-up ticket once telemetry shows
  the page earns organic traffic on its own.
- Adding `/compare/jobtread` to the `index.html`
  SEO Pilot `pages` table. That is its own
  SEO-hygiene ticket and applies uniformly to
  every `/compare/*` route per the 2026-05-25
  SEO Pilot lesson.
- A "JobTread alternative" blog post pointing at
  `/compare/jobtread`. Blog content ships
  through the `src/data/blogPosts.ts` pipeline
  and is gated by `check-blog-dates`;
  cross-promotion is its own content ticket.
- Adding a `Product` or `SoftwareApplication`
  JSON-LD block on the page (JobTread's schema).
  The compare-page family emits
  `BreadcrumbList` and `WebPage` only per the
  ticket 0065 Implementation log; adding a new
  `@type` would trigger the 2026-05-30
  second-@type collision audit on every compare
  spec, out of scope here.
- Adding a rating or review card citing a
  specific JobTread G2 or Capterra rating.
  Reviews are third-party attributed and cannot
  be defensibly repeated on this page per the
  AGENTS.md conservative-claims rule.
- Fabricated pricing comparisons ("JobTread
  costs 3x more"). Every price citation MUST
  link to the JobTread pricing page in an HTML
  source comment per the 2026-05-25
  mirror-source-fix rule; no invented figures.
- Cross-vertical related-demos surfacing of the
  new page in the `RelatedDemos` component
  (ticket 0027). The component reads from a
  separate `relatedDemos` data structure and is
  its own follow-up ticket.
- Internationalization (`inLanguage` fields on
  schema). The page is English-only, matching
  every existing compare page.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/compare/JobTread.tsx` (under
  260 lines). Copy
  `src/pages/compare/FollowUpBoss.tsx` (ticket
  0065, the direct peer for hub-aware breadcrumb
  shape at similar file size) end-to-end as the
  starting frame, then swap every "Follow Up
  Boss" / "FUB" / "real estate CRM" string for
  the JobTread equivalent. Cross-reference the
  four-dimension table wording against
  `src/pages/compare/Buildertrend.tsx` (ticket
  0042) since JobTread is a construction PM
  incumbent and Buildertrend is the closest
  construction-vertical peer. Keep the same
  module-level mirror-source constants:
  `PAGE_H1`, `PAGE_NAME`, `META_DESCRIPTION`,
  `COMPARISON_ROWS`, `DIFFERENTIATORS`,
  `CRUMBS`, `BREADCRUMB_SCHEMA`, `WEBPAGE_SCHEMA`
  (per the 2026-05-25 mirror-source rule the
  description used in the Helmet meta tag AND the
  `WebPage` JSON-LD description MUST read from
  the same `META_DESCRIPTION` constant). Swap
  the four COMPARISON_ROWS dimensions to Lead
  capture, First response, Estimating,
  Negotiation. Keep it factual: no efficacy
  numbers, no client names, cite JobTread
  pricing via an HTML source comment linking to
  `https://www.jobtread.com/pricing`.
- Append one new entry to
  `src/data/compareEntries.ts`:
  `{ id: 'jobtread', tool: 'JobTread', path: '/compare/jobtread', tagline: '...' }`
  with a hyphen-only tagline. The
  `COMPARE_ENTRIES` array is the single
  mirror-source for both the `/compare` hub
  card grid AND the hub's `ItemList` JSON-LD
  `itemListElement` array per ticket 0048, so
  appending here automatically widens both.
- New route in `src/App.tsx`: import
  `JobTread` from `./pages/compare/JobTread`
  and add
  `<Route path="/compare/jobtread" element={<JobTread />} />`
  next to the existing `/compare/followupboss`
  route. Mirror the (non-)lazy-loading
  convention of the adjacent compare route.
  Per the 2026-09-05 route-code-splitting
  lesson, if the route lazy-loads, the new spec
  must NOT rely on `root.innerHTML.length > N`
  for readiness.
- Per the 2026-06-07 src-imports-tests lesson,
  add `/compare/jobtread` to the `ROUTES` array
  in `src/data/routes.ts`; `tests/e2e/routes.ts`
  re-exports it automatically.
- Per the 2026-05-30 second-@type lesson,
  BEFORE writing code grep
  `tests/e2e/compare-*.spec.ts` AND
  `tests/e2e/*-jsonld.spec.ts` for
  `=== 'BreadcrumbList'` AND `=== 'WebPage'`
  predicates. Document the grep result in the
  Implementation log. The thirteen predecessor
  compare specs are each URL-scoped to their
  own `/compare/<tool>` route per the ticket
  0065 Implementation log.
- Per the 2026-05-25 SEO Pilot lesson, the new
  e2e spec asserts the Helmet-managed
  `meta[name="description"]` content directly
  (LAST `meta[name="description"]` per the
  2026-05-25 Helmet-appends lesson), NOT
  `page.toHaveTitle()`. `/compare/jobtread` is
  NOT in the `index.html` SEO Pilot pages
  table.
- Per the 2026-05-07 em-dash Hard NO, every
  string in the page module and in the
  `compareEntries.ts` tagline uses hyphens.
  Self-Review greps the diff for
  `String.fromCharCode(8212)` before pushing.
- `tests/e2e/compare-jobtread.spec.ts` (new) -
  one assertion per acceptance box. Model the
  spec on `tests/e2e/compare-followupboss.spec.ts`
  (ticket 0065, the direct peer). The
  sibling-hub-regression case navigates to
  `/compare` and re-runs one key hub
  assertion (`COMPARE_ENTRIES.length`, card
  count, ItemList numberOfItems) to prove the
  additive edit widened both the render and
  the schema.
- Per the 2026-05-22 two-PR ship lesson, ship
  will need a follow-up
  `chore/0073-ship-status` PR after the feat
  PR merges to flip the ticket frontmatter AND
  its `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index
  never drift mid-flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, the
  existing Navbar / Footer / StickyCTA /
  ScrollProgress components, the existing
  `trackCTAClick` helper, and the existing
  `useContent` hook. Schema migration: no.
  Privacy / security surface change: no - the
  page is static marketing copy and emits no
  new network call.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-10 - branch `feat/0073-compare-jobtread` opened; status flipped groomed -> in-progress.
- 2026-09-10 - mandatory 2026-05-30 second-@type grep run:
  - `grep -n "=== 'BreadcrumbList'" tests/e2e/*.spec.ts`: matches in ai-for-*.spec.ts, case-*.spec.ts, changelog-*.spec.ts, compare-*.spec.ts (jobber, servicetitan, podium, housecallpro, buildertrend, thumbtack, angi, followupboss, hub), glossary-*, my-dashboard, playbook, quiz-*, questions-to-ask, subprocessors, texas-*, vendor-scorecard, trust-*, roi-*. Every predicate is URL-scoped to its own route.
  - `grep -n "=== 'WebPage'" tests/e2e/*.spec.ts`: matches only in tests/e2e/compare-*.spec.ts (angi, followupboss, thumbtack; buildertrend/jobber/podium/housecallpro/servicetitan via the `t === 'BreadcrumbList' || t === 'WebPage'` count-guard) and my-dashboard.spec.ts (URL-scoped to /my). Every compare predicate is URL-scoped to its own /compare/<tool> route.
  - Conclusion: a fourteenth `/compare/jobtread`-scoped BreadcrumbList + WebPage pair cannot collide with any predecessor URL-scoped "exactly one" assertion.
- 2026-09-10 - failing test added in `tests/e2e/compare-jobtread.spec.ts` (modeled 1:1 on compare-followupboss.spec.ts).
