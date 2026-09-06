---
id: 0065
title: Comparison page "Digital Craft vs Follow Up Boss" for real-estate CRM switchers
status: shipped
priority: P1
area: seo
created: 2026-09-06
owner: gtm-innovation
---

## User story

As a residential real-estate team lead (a broker-owner
running six agents on a $250-a-seat Follow Up Boss
subscription, a solo investor-agent who signed up for the
free trial last month and is unsure whether the drip
sequences justify the seat cost, an ops manager comparing
kvCORE and Follow Up Boss during a mid-year renewal
review), Googling "Follow Up Boss alternative," "AI for
real estate CRM," or "Follow Up Boss vs" on a laptop
between showings, I want one honest comparison page at
`/compare/followupboss` that names which job Follow Up
Boss does well (a lead-database CRM with action plans and
smart lists) and which job Digital Craft does instead
(answering, qualifying, and negotiating with the leads a
CRM already stores), so that I can decide in 90 seconds
whether the AI agent layer is a replacement, a complement,
or a pass without bouncing back to search.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the comparison-page
pattern is now proven across TWELVE shipped pages under
`src/pages/compare/*.tsx` (HubSpot, GoHighLevel, Zapier,
Make, Intercom, Jobber, ServiceTitan, Podium, Housecall
Pro, Buildertrend, Thumbtack, Angi) and the canonical
`/compare` hub (ticket 0048) reads from
`src/data/compareEntries.ts` and picks up any thirteenth
entry automatically. Adding this comparison is one new
page file, one new spec file, two two-line entries (route
in `src/App.tsx`, path in `src/data/routes.ts`), and one
new entry in `src/data/compareEntries.ts`. Follow Up Boss
is the first REAL-ESTATE CRM comparison the site ships:
every prior comparison targets marketing automation
(HubSpot/GHL), workflow (Zapier/Make), support (Intercom),
field service (Jobber/ServiceTitan/Housecall Pro),
construction PM (Buildertrend), or lead marketplaces
(Thumbtack, Angi). Follow Up Boss is neither software you
send crews out with nor a lead marketplace; it is the CRM
a real-estate team already uses to nurture leads, which
makes the positioning clean: Follow Up Boss STORES and
sequences the leads, Digital Craft ANSWERS them the moment
they arrive and negotiates the property deals a CRM
cannot. Zero new component, zero new data shape, zero new
JSON-LD `@type` first emission.

### Stakeholder

This widens the SEO moat in a query class the twelve
existing comparison pages structurally cannot capture: the
real-estate-CRM SERP (`Follow Up Boss alternative`,
`Follow Up Boss vs`, `AI for real estate CRM`,
`FUB alternative`). Follow Up Boss is one of the two
dominant residential real-estate CRMs (kvCORE and Follow
Up Boss control the vast majority of independent-agent
and small-team seats), and the two-page real-estate
funnel (`/realestate`, `/ai-for-property-managers`) plus
the property-negotiator and voice-negotiator demos have
no comparison anchor today. Per the 2026-05-30 second-
@type lesson, BEFORE writing code the implementer greps
every existing `tests/e2e/compare-*.spec.ts` AND every
existing `tests/e2e/*-jsonld.spec.ts` for
`=== 'BreadcrumbList'` AND `=== 'WebPage'` predicates;
the twelve predecessor compare specs are each URL-scoped
to their own `/compare/<tool>` route per the ticket 0049
Implementation log, so a thirteenth `/compare/followupboss`-
scoped pair cannot collide. The grep is mandatory and its
result is documented in the Implementation log. This is
also the first comparison page that names a real-estate-
specific incumbent, which structurally lifts the
credibility of the entire `/realestate` funnel: a broker
who taps "vs Follow Up Boss" from the `/compare` hub self-
selects as a paying CRM subscriber, the highest-intent
prospect the real-estate funnel can produce.

### Visitor (in the real moment of use)

A broker-owner running six agents Googles "Follow Up Boss
alternative for small teams" on a laptop between listing
appointments. The SERP surfaces `/compare/followupboss`
with a description that names the actual frustration
(paying six seats for a CRM the team barely uses because
nobody answers the leads it stores) instead of marketing
fluff. One click and the page loads in under one screen
with a positioning sentence at the top ("Follow Up Boss
stores your leads, Digital Craft answers them the moment
they arrive"), a four-row comparison table (Lead capture,
First response, Property analysis, Negotiation), a "Use
both" section acknowledging Follow Up Boss still owns the
long-cycle nurture and pipeline reporting a small team
depends on while AI handles the first-touch and after-
hours qualification, three demo CTAs routing to the
existing real-estate demos, and one strategy-call CTA
below. The broker leaves in 90 seconds knowing whether
the AI agent layer is a replacement, a complement, or a
pass. Light and dark mode supported; the page reads
cleanly on a 375px viewport.

### Growth

The "show me" moment is the SERP listing for "Follow Up
Boss alternative" surfacing a real, honest comparison page
that does NOT trash Follow Up Boss but reframes the spend
(their CRM plus our AI agent layer, not their CRM
replaced). A broker who Slack-shares the page to a peer
with "this is exactly the frame I was missing" is the
cheapest qualified strategy-call the real-estate funnel
can produce because the share is peer-to-peer between two
operators who already pay a real-estate CRM seat cost.
Each CTA click fires `trackCTAClick` with a
`comparefollowupboss_*` location label so the funnel is
measurable in GA independently of the twelve existing
comparison pages. The hub-level pickup (the page surfaces
automatically on `/compare` once appended to
`COMPARE_ENTRIES`) gives the page a second discovery path
with no extra ticket, and the thirteenth hub entry
strengthens the ItemList JSON-LD count that ticket 0048
emits.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/compare/FollowUpBoss.tsx` (new file, under 320 lines) renders at `/compare/followupboss`, modeled 1:1 on `src/pages/compare/Thumbtack.tsx` (ticket 0049, the most recent peer that also breadcrumbs through the `/compare` hub). The page has a hero with a Follow Up Boss-specific H1, a one-paragraph positioning summary, a four-row comparison table (Lead capture / First response / Property analysis / Negotiation), a "Use both" section that names the complementary stack (Follow Up Boss for storage and pipeline reporting, Digital Craft for first-touch answering and property negotiation), three demo CTAs routing to `/realestate/demo/lead-responder`, `/realestate/demo/property-negotiator`, and `/realestate/demo/voice-negotiator`, and one strategy-call CTA. Every claim is defensible: no invented client names, no fabricated efficacy percentages, no Follow Up Boss-specific pricing the page cannot cite from publicly available sources (Follow Up Boss's public pricing page names per-seat tiers; cite the source URL in an HTML comment per the 2026-05-25 mirror-source-fix rule so a future price change is auditable).
- [ ] The page emits TWO JSON-LD blocks inside the existing `<Helmet>` head matching the ticket 0049 (Thumbtack) three-item breadcrumb convention: (1) a `BreadcrumbList` (Home -> Compare -> Digital Craft vs Follow Up Boss) with `Compare` as the second item linking to `/compare` (the canonical hub from ticket 0048) and `Digital Craft vs Follow Up Boss` as the third item, and (2) a `WebPage` block carrying `name`, `description` (same string as the module-level `META_DESCRIPTION` constant per the 2026-05-25 mirror-source rule), and `isPartOf` pointing to the existing `WebSite` block from ticket 0016. The twelve predecessor compare pages are NOT edited in this ticket (their breadcrumb variants stay byte-identical per the AGENTS.md small-focused-PR rule).
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/compare-*.spec.ts` AND every existing `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'` AND `=== 'WebPage'` predicates. Every predecessor predicate is expected to be per-URL scoped to a different route per the ticket 0049 Implementation log, so the collision risk is structurally low, but the grep is mandatory and its result is documented in the Implementation log. Per the 2026-05-25 mirror-source-fix family rule, if any predecessor predicate IS site-wide, the implementer widens it in the SAME PR.
- [ ] The new route is registered in `src/App.tsx` next to the existing `/compare/angi` route. `/compare/followupboss` is added to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson (the canonical allow-list); `tests/e2e/routes.ts` re-exports it automatically and the smoke spec exercises the page. The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date.
- [ ] A new entry is appended to `COMPARE_ENTRIES` in `src/data/compareEntries.ts` with `id: 'followupboss'`, `tool: 'Follow Up Boss'`, `path: '/compare/followupboss'`, and a factual one-line tagline (no em-dashes) sourced from the visible H1 / intro of the new page so the hub copy and the page stay in sync (the 2026-05-25 mirror-source rule). The existing `/compare` hub render and the `ItemList` JSON-LD pick up the thirteenth entry automatically; the existing `tests/e2e/compare-hub.spec.ts` count assertion (which reads `COMPARE_ENTRIES.length` at runtime) continues to pass without edit because the count is dynamic, not a hardcoded 12.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in any JSON-LD serialized string, and every CTA route resolves to a registered route in `src/data/routes.ts`. The three primary demo CTAs route to `/realestate/demo/lead-responder`, `/realestate/demo/property-negotiator`, and `/realestate/demo/voice-negotiator` (the three real-estate demos the ticket 0047 property-managers landing page already funnels into); the strategy-call CTA opens calendly in a new tab with `rel="noopener noreferrer"` matching the compare-page convention.
- [ ] A new e2e spec at `tests/e2e/compare-followupboss.spec.ts` (modeled on `tests/e2e/compare-thumbtack.spec.ts`) asserts: the page returns < 400 status, the H1 contains "Follow Up Boss" (case-insensitive substring), the LAST `meta[name="description"]` names "Follow Up Boss" (per the 2026-05-25 Helmet-appends lesson), the `BreadcrumbList` JSON-LD has three items with the middle one named "Compare" and its `item` ending in `/compare`, the `WebPage` JSON-LD carries the expected `name`, the three demo CTAs each resolve to a `/realestate/demo/*` route present in `ROUTES`, the page text contains no `String.fromCharCode(8212)` code point, dark mode renders cleanly via `document.documentElement.classList.add('dark')`, and the imported `COMPARE_ENTRIES` array contains an entry with `id === 'followupboss'`.
- [ ] No `/api/` change, no new hostname (the only external link is the existing `calendly.com/mutaaf` URL already used on every compare page), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the twelve existing `src/pages/compare/*.tsx` pages or their specs, no edits to `src/pages/CompareHub.tsx` (the hub picks up the new entry automatically via the `COMPARE_ENTRIES` mirror-source). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; every pre-existing `tests/e2e/compare-*.spec.ts` and the `tests/e2e/compare-hub.spec.ts` stay green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A "kvCORE" or "Chime" or "BoomTown" comparison page in
  the same ticket. Each comparison page is structurally
  one ticket per the ticket 0021-0053 precedent. This
  ticket picks Follow Up Boss as the highest-search-volume
  independent-agent real-estate CRM; kvCORE, Chime,
  BoomTown, and Real Geeks are separate future tickets.
- Editing the twelve existing compare pages' breadcrumbs
  or comparison tables. The new entry is additive; the
  predecessors stay as shipped.
- Adding `/compare/followupboss` to the `index.html` SEO
  Pilot `pages` table. That is its own SEO-hygiene ticket
  and applies uniformly to all thirteen compare-family
  routes, none of which are in the table per the
  2026-05-25 SEO Pilot lesson. Out of scope here.
- A Follow Up Boss-seat-cost calculator. The shareable ROI
  calculator (ticket 0046) is the canonical ROI surface;
  a per-comparison calculator would fragment the math. A
  future iteration of `/roi` could surface a "CRM seat
  cost" preset, but that is its own ticket once telemetry
  shows demand.
- Adding a `Product`, `Service`, or `SoftwareApplication`
  JSON-LD block on the page. The existing twelve compare
  pages emit `BreadcrumbList` + `WebPage` only per the
  ticket 0049 Implementation log; the thirteenth page
  follows that convention to avoid a 2026-05-30 second-
  @type collision audit on the `/demos` SoftwareApplication
  spec.
- A "Follow Up Boss switching guide" blog post. Blog
  content ships through `src/data/blogPosts.ts` and is
  gated by `check-blog-dates`; a thematic post is its
  own content ticket.
- A testimonial from a former Follow Up Boss customer.
  The AGENTS.md Hard NO on invented testimonials applies;
  a real testimonial ships through its own dated blog
  post once a real client agrees to attribution.
- Internationalization (`inLanguage` fields on the
  schema). The page is English-only matching every prior
  compare-family page.
- A live "import my Follow Up Boss leads" widget. The
  page is static marketing copy; threading an API integration
  in would violate the /api/ no-touch rule and is out of
  scope even for a follow-up ticket without a real API
  partnership.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/compare/FollowUpBoss.tsx` (under 320
  lines). Copy `src/pages/compare/Thumbtack.tsx` (ticket
  0049, the most recent peer that already carries the
  three-item breadcrumb through the `/compare` hub) end-
  to-end as the starting frame, then swap every
  "Thumbtack" string for the Follow Up Boss equivalent.
  Keep the same module-level mirror-source constants:
  `PAGE_H1`, `META_DESCRIPTION`, `PAGE_NAME` (per the
  2026-05-25 mirror-source rule the description used in
  the Helmet meta tag and the `WebPage` JSON-LD
  `description` MUST be the same `META_DESCRIPTION`
  constant). Swap the four `COMPARISON_ROWS` entries to
  the four Follow Up Boss-specific dimensions named in
  the acceptance criteria (Lead capture, First response,
  Property analysis, Negotiation). The "Use both" section
  reflects that Follow Up Boss is a nurture CRM the team
  already operates (not a marketplace like Thumbtack), so
  the framing is complement-not-replace: Follow Up Boss
  owns storage and pipeline reporting, Digital Craft owns
  first-touch and property analysis. Keep it factual: no
  efficacy numbers, no client names.
- New route in `src/App.tsx`: import `FollowUpBoss` from
  `./pages/compare/FollowUpBoss` and add
  `<Route path="/compare/followupboss" element={<FollowUpBoss />} />`
  next to the existing `/compare/angi` route. Mirror the
  (non-)lazy-loading convention of the adjacent compare
  routes per the ticket 0049 precedent (post-2026-09-05
  route-code-splitting lesson: if the compare-family
  routes are lazy-loaded, the new spec must not rely on
  `root.innerHTML.length > N` for readiness).
- Per the 2026-06-07 src-imports-tests lesson, add
  `/compare/followupboss` to the `ROUTES` array in
  `src/data/routes.ts` (the canonical allow-list);
  `tests/e2e/routes.ts` re-exports it automatically and
  the smoke spec exercises the page.
- Append the thirteenth entry to `COMPARE_ENTRIES` in
  `src/data/compareEntries.ts`:
  `{ id: 'followupboss', tool: 'Follow Up Boss', path: '/compare/followupboss', tagline: 'Follow Up Boss stores your leads. Digital Craft is the AI agent layer that answers them the moment they arrive.' }`.
  The hub grid render and the `ItemList` JSON-LD on
  `/compare` pick this up automatically because both are
  built by mapping over the same constant (the 2026-05-25
  mirror-source rule).
- Per the 2026-05-30 second-@type lesson, BEFORE writing
  code grep `tests/e2e/compare-*.spec.ts` and
  `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'`
  AND `=== 'WebPage'` predicates. Confirm no spec asserts
  "exactly one of either @type site-wide" (the existing
  twelve compare patterns are per-URL scoped per the
  ticket 0049 Implementation log). Document the grep
  result in the Implementation log so the deviation, if
  any, is auditable.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e spec
  asserts the Helmet-managed `meta[name="description"]`
  content directly (LAST `meta[name="description"]`
  element per the 2026-05-25 Helmet-appends lesson), NOT
  `page.toHaveTitle()`. The route is not in the
  `index.html` SEO Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every string in the
  page module (the H1, the META_DESCRIPTION, the
  PAGE_NAME, the four comparison-row labels and values,
  the "Use both" section copy, the JSON-LD strings, the
  CTA labels, the tagline in `COMPARE_ENTRIES`) uses
  hyphens. Self-Review greps the diff for
  `String.fromCharCode(8212)` before pushing.
- `tests/e2e/compare-followupboss.spec.ts` (new) - one
  assertion per acceptance box. Model end-to-end on
  `tests/e2e/compare-thumbtack.spec.ts` (the most recent
  peer). CTA case: locate the three demo-card CTAs via
  the existing per-page testid pattern (use
  `data-testid="comparefollowupboss-demo-cta"` and assert
  each `href` resolves to a `/realestate/demo/*` path
  present in the `ROUTES` array imported from
  `tests/e2e/routes.ts`). Per the 2026-09-05 route-code-
  splitting lesson, prefer auto-retrying assertions
  (`await expect(locator).toHaveCount(N)`) over one-shot
  `.allTextContents()` for counts on lazy-loaded DOM.
- Per the 2026-05-22 two-PR ship lesson, ship will need a
  follow-up `chore/0065-ship-status` PR after the feat PR
  merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to `shipped`
  together; run `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index never
  drift mid-flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, the existing
  Navbar / Footer / ScrollProgress components, and the
  existing `trackCTAClick` helper. Schema migration: no.
  Privacy/security surface change: no - the page is
  static marketing copy and emits no new network calls;
  the only external link is the existing calendly URL
  already disclosed on `/trust` per ticket 0018.

## Implementation log

(Appended by the implementation-dev agent during execution.)

### 2026-09-06 - implementation-dev

Executed the 2026-05-30 second-`@type` grep BEFORE writing code. Ran
`grep -n "=== 'BreadcrumbList'"` and `grep -n "=== 'WebPage'"` across
every `tests/e2e/compare-*.spec.ts` and `tests/e2e/*-jsonld.spec.ts`.
Every `toHaveLength(1)` / "exactly one" predicate over `BreadcrumbList`
and `WebPage` is URL-scoped to its own route
(`/compare/{jobber,servicetitan,podium,housecallpro,buildertrend,thumbtack,angi}`,
`/compare`, `/changelog`, `/trust`, `/glossary`, `/case-studies/*`,
`/quiz`, `/locations/texas`, `/`). None asserts "exactly one of either
@type site-wide", so the new `/compare/followupboss`-scoped
BreadcrumbList + WebPage pair cannot collide with any predecessor. No
predecessor widening was needed.

Compare routes are lazy-loaded via `React.lazy(() =>
import("./pages/compare/*"))` in `src/App.tsx` behind the single
`<Suspense fallback={<RouteFallback />}>` boundary. Per the 2026-09-05
route-code-splitting lesson the new spec avoids `root.innerHTML.length >
N` as the ready signal (that would satisfy on the RouteFallback spinner)
and instead waits for the H1 to be visible; every count assertion uses
`await expect(locator).toHaveCount(N)` rather than one-shot
`.count()` / `.allTextContents()`. The pre-existing
`compare-thumbtack.spec.ts` uses the older one-shot `.count()` pattern
and flaked once during the local peer run (0 CTAs visible on the first
attempt, 3 on isolated re-run); documented per the 2026-05-25 flakiness
lesson, not a regression from this diff, and CI `retries: 1` covers it.

Local gate: `npm run lint` (0 errors, 23 pre-existing warnings),
`npm run typecheck`, `npm run check-links`, `npm run check-images`,
`npm run check-meta`, `npm run check-blog-dates`,
`node scripts/check-backlog.mjs`, `npm run build` all green. The 9-test
`tests/e2e/compare-followupboss.spec.ts` passes locally against the
preview build; peer specs (`compare-hub`, `compare-angi`) also green.

Nuance for the ship runner: the file is 313 lines, under the ticket's
320-line cap (achieved by mirroring the Angi.tsx compressed layout, not
the longer Thumbtack.tsx frame). No `/api/` edits, no `package.json` /
`package-lock.json` edits, no em-dash characters in diff (the only
`String.fromCharCode(8212)` reference is the EM_DASH sentinel in the
new spec file used to assert absence). Route added to `ROUTES` and to
`COMPARE_ENTRIES` (thirteenth entry). Per the 2026-05-22 two-PR ship
lesson, a `chore/0065-ship-status` PR is required after this feat PR
merges to flip the ticket + README index to `shipped`.
