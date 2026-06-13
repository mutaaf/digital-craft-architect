---
id: 0049
title: Comparison page "Digital Craft vs Thumbtack" for high-intent lead-marketplace switchers
status: groomed
priority: P1
area: seo
created: 2026-06-13
owner: gtm-innovation
---

## User story

As a 6-truck plumbing shop owner, a residential roofer, or a
solo HVAC contractor who pays $300 to $900 per month for
Thumbtack credits and is sick of bidding against five other
pros for the same lead, Googling "Thumbtack alternative,"
"AI for service businesses vs Thumbtack," or "how to stop
paying Thumbtack for leads" on a phone between jobs, I want
one honest comparison page at `/compare/thumbtack` that names
which job Thumbtack does well (a pay-per-lead acquisition
marketplace) and which job Digital Craft does instead
(answering and qualifying the leads I already have so the
ones I pay for actually book), so that I can decide in 90
seconds whether the AI agent layer is the move my margin
needs without bouncing back to search.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the comparison-page
pattern is now proven across TEN shipped pages
(`src/pages/compare/{HubSpot,GoHighLevel,Zapier,Make,Intercom,Jobber,ServiceTitan,Podium,HousecallPro,Buildertrend}.tsx`,
tickets 0021-0042) AND the canonical `/compare` hub (ticket
0048) that reads from `src/data/compareEntries.ts`. The hub
is intentionally built to surface a new comparison the
instant it is appended to `COMPARE_ENTRIES`. Adding the
eleventh comparison is exactly one new page file, one new
spec file, two two-line entries (`src/App.tsx` route,
`src/data/routes.ts` ROUTES), and one new entry in
`src/data/compareEntries.ts`. No new component, no new
data shape, no new JSON-LD `@type` first emission.
Thumbtack is structurally different from the ten existing
comparisons (HubSpot/GHL are marketing automation;
Zapier/Make are workflow; Intercom is support; Jobber /
ServiceTitan / Housecall Pro are field-service CRMs;
Podium is SMS/reviews; Buildertrend is construction PM)
because it is a lead-marketplace, not software a contractor
operates. That makes the positioning clean: Thumbtack
SELLS leads, Digital Craft HANDLES the leads you already
have. The two are complements with non-overlapping ICPs of
the "which one to spend my next $500 on" decision.

### Stakeholder

This widens the SEO moat in a query class the existing ten
comparison pages cannot capture: the lead-marketplace SERP
(`Thumbtack alternative`, `Thumbtack vs`, `stop paying Thumbtack`,
`AI to replace Thumbtack`). Thumbtack is the dominant pay-per-
lead marketplace for residential service trades and is
explicitly named in ticket 0038's Out of Scope ("A
'Compare Digital Craft to Thumbtack / Angi / CallRail'
comparison page is its own ticket"), so this is pre-
authorized follow-up work per the 2026-05-22
"bootstrap pre-authorized follow-ups" lesson, not
speculative grooming. The page also closes a credibility
gap on the six trade landing pages (plumbers, HVAC,
roofers, electricians, painters, landscapers) and the
property-managers page (ticket 0047) which all funnel into
homeservices demos but never name the incumbent acquisition
channel a small trade actually fights with. A landing-page
visitor who taps "vs Thumbtack" from the `/compare` hub
self-selects as a Thumbtack subscriber, which is the
highest-intent prospect the trade-page funnel can produce.

### Visitor (in the real moment of use)

A 6-truck plumbing shop owner Googles "Thumbtack alternative
for plumbers" on a phone Friday afternoon. The SERP listing
surfaces `/compare/thumbtack` with a description that names
the actual frustration (paying per-credit for leads that
five other pros also bought) instead of marketing fluff.
One tap and the page loads in under one screen with a
positioning sentence at the top ("Thumbtack sells you
leads, Digital Craft helps you book the leads you already
have"), a four-row comparison table (lead source, cost
model, response speed, exclusivity), a defensible "Use both"
section that acknowledges Thumbtack still makes sense as
an acquisition top-up while AI answering does the
qualification work, and one CTA below. The visitor leaves
knowing whether the AI agent layer is the move or not.
Light and dark mode supported; the page reads cleanly on a
375px viewport.

### Growth

The "show me" moment is the SERP listing for "Thumbtack
alternative" surfacing a real, honest comparison page that
does NOT trash Thumbtack but reframes the spend. A trade
owner who Slack-shares the page to a peer with "this is
exactly the frame I was missing" is the cheapest qualified
strategy-call the funnel can produce, because the share is
peer-to-peer between two operators who already pay for
lead marketplaces. Each CTA click fires `trackCTAClick`
with a `comparethumbtack_*` location label so the funnel
is measurable in GA independently of the ten existing
comparison pages. The hub-level pickup (the page surfaces
automatically on `/compare` once appended to
`COMPARE_ENTRIES`) means a single visit to the hub gives
the page a second discovery path with no extra ticket.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/compare/Thumbtack.tsx` (new file, under 320 lines) renders at `/compare/thumbtack`, modeled 1:1 on `src/pages/compare/Buildertrend.tsx` (ticket 0042, the most recent peer in the family). The page has a hero with a Thumbtack-specific H1, a one-paragraph positioning summary, a four-row comparison table (Lead source / Cost model / Response speed / Exclusivity per lead), a "Use both" section that names the complementary stack (Thumbtack for acquisition, Digital Craft for qualification), three demo CTAs routing to `/homeservices/demo/lead-responder`, `/homeservices/demo/voice-followup`, and `/homeservices/demo/estimate`, and one strategy-call CTA. Every claim is defensible: no invented client names, no fabricated efficacy percentages, no Thumbtack-specific pricing the page cannot cite from publicly available sources (Thumbtack's public help docs name pay-per-lead credit pricing in ranges; cite the source in an HTML comment per the 2026-05-25 mirror-source-fix rule).
- [ ] The page emits TWO JSON-LD blocks inside the existing `<Helmet>` head matching the existing ten-page convention: (1) a `BreadcrumbList` (Home -> Compare -> Digital Craft vs Thumbtack) using the same shape as `src/pages/compare/Buildertrend.tsx` `BREADCRUMB_SCHEMA` but with `Compare` as the second item linking to `/compare` (the canonical hub from ticket 0048) and `Digital Craft vs Thumbtack` as the third item, and (2) a `WebPage` block carrying `name`, `description` (same string as `META_DESCRIPTION` per the 2026-05-25 mirror-source rule), and `isPartOf` pointing to the existing `WebSite` block from ticket 0016. The breadcrumb middle item is the structural difference from the ten predecessor compare pages, which were shipped before `/compare` existed and breadcrumb directly Home -> Comparison; the new page reflects the hub's existence. The ten predecessor pages are NOT edited in this ticket (their breadcrumb update is a separate ticket per the AGENTS.md small-focused-PR rule).
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/compare-*.spec.ts` AND every existing `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'` AND `=== 'WebPage'` predicates. The ten existing per-URL compare specs each assert per-URL scoped BreadcrumbList and WebPage blocks per the ticket 0042 Implementation log, so the collision risk is structurally low, but the grep is mandatory and the result is documented in the Implementation log.
- [ ] The new route is registered in `src/App.tsx` next to the existing `/compare/buildertrend` route. The implementer adds `/compare/thumbtack` to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson (the canonical allow-list); `tests/e2e/routes.ts` re-exports it automatically. The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date.
- [ ] A new entry is appended to `COMPARE_ENTRIES` in `src/data/compareEntries.ts` with `id: 'thumbtack'`, `tool: 'Thumbtack'`, `path: '/compare/thumbtack'`, and a factual one-line tagline (no em-dashes) sourced from the visible H1 / intro of the new page so the hub copy and the page stay in sync (the 2026-05-25 mirror-source rule). The existing `/compare` hub render and the `ItemList` JSON-LD pick up the eleventh entry automatically; the existing `tests/e2e/compare-hub.spec.ts` count assertion (which reads `COMPARE_ENTRIES.length` at runtime) continues to pass without edit because the count is dynamic, not a hardcoded 10.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in any JSON-LD serialized string, and every CTA route resolves to a registered route in `src/data/routes.ts`. The three primary CTAs route to `/homeservices/demo/lead-responder`, `/homeservices/demo/voice-followup`, and `/homeservices/demo/estimate` (the three home-services demos the trade family already funnels into); the strategy-call CTA opens calendly in a new tab with `rel="noopener noreferrer"` matching the existing compare-page convention.
- [ ] A new e2e spec at `tests/e2e/compare-thumbtack.spec.ts` (modeled on `tests/e2e/compare-buildertrend.spec.ts`) asserts: the page returns < 400 status, the H1 contains "Thumbtack" (case-insensitive substring), the `meta[name="description"]` content names "Thumbtack" (asserted on the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson), the `BreadcrumbList` JSON-LD has three items with the middle one named "Compare" and linking to `/compare`, the `WebPage` JSON-LD block carries the expected `name`, the three demo CTAs each resolve to a `/homeservices/demo/*` route present in `ROUTES`, the page text contains no `U+2014` code point, and dark mode renders cleanly. Spec also asserts the new `COMPARE_ENTRIES` entry exists by importing the constant and checking the `thumbtack` id.
- [ ] No `/api/` change, no new hostname (the only external link is the existing `calendly.com/mutaaf` URL already used on every compare page), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the ten existing `src/pages/compare/*.tsx` pages or their specs, no edits to `src/pages/CompareHub.tsx` (the hub picks up the new entry automatically via the `COMPARE_ENTRIES` mirror-source). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; every pre-existing `tests/e2e/compare-*.spec.ts` and the `tests/e2e/compare-hub.spec.ts` stay green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- Updating the ten existing compare pages' breadcrumbs to
  include the new `/compare` middle item. That edit spans
  ten files and is a separate cross-cutting ticket (the
  ticket 0048 Implementation log called this out as
  follow-up work).
- An "Angi" or "CallRail" comparison page in the same
  ticket. Each comparison page is structurally one ticket
  per the ticket 0021-0042 precedent. The ticket 0038
  Out of Scope named "Thumbtack / Angi / CallRail" as a
  family; this ticket picks Thumbtack as the highest-
  search-volume of the three. Angi and CallRail are
  separate future tickets.
- Editing the existing `src/data/compareEntries.ts`
  taglines for the ten predecessor entries. The new entry
  is additive; the predecessors stay as shipped.
- Adding `/compare/thumbtack` to the `index.html` SEO Pilot
  `pages` table. That is its own SEO-hygiene ticket and
  applies uniformly to all eleven compare-family routes,
  none of which are in the table per the 2026-05-25 SEO
  Pilot lesson. Out of scope here.
- A Thumbtack-credit-savings calculator. The shareable ROI
  calculator (ticket 0046) is the canonical ROI surface;
  a per-comparison calculator would fragment the math. A
  future iteration of `/roi` could surface a "Thumbtack
  credit cost" preset, but that is its own ticket once
  telemetry shows demand.
- Adding a `Product` or `Service` JSON-LD block on the
  page. The existing ten compare pages emit
  `BreadcrumbList` + `WebPage` only per the ticket 0042
  Implementation log; the eleventh page follows that
  convention.
- A "Thumbtack switching guide" blog post. Blog content
  ships through the `src/data/blogPosts.ts` pipeline and
  is gated by `check-blog-dates`; a thematic post is its
  own content ticket.
- Internationalization (`inLanguage` fields on schema).
  The page is English-only.
- A testimonial from a former Thumbtack customer. The
  AGENTS.md Hard NO on invented testimonials applies; a
  real testimonial ships through its own dated blog post
  via the existing pipeline once a real client agrees to
  attribution.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/compare/Thumbtack.tsx` (under 320 lines).
  Copy `src/pages/compare/Buildertrend.tsx` (ticket 0042)
  end-to-end as the starting frame, then swap every
  "Buildertrend" string for the Thumbtack equivalent.
  Keep the same module-level mirror-source constants:
  `PAGE_H1`, `META_DESCRIPTION`, `PAGE_NAME` (per the
  2026-05-25 mirror-source rule the description used in
  the Helmet meta tag and the `WebPage` JSON-LD
  `description` MUST be the same `META_DESCRIPTION`
  constant). Swap the four `COMPARISON_ROWS` entries to
  the four Thumbtack-specific dimensions named in the
  acceptance criteria (Lead source, Cost model, Response
  speed, Exclusivity per lead). The "Use both" section is
  new copy reflecting Thumbtack's marketplace nature; no
  predecessor compare page has it because the ten
  predecessors compare against software you operate, not
  a lead marketplace. Keep it factual: no efficacy
  numbers, no client names.
- New route in `src/App.tsx`: import `Thumbtack` from
  `./pages/compare/Thumbtack` and add
  `<Route path="/compare/thumbtack" element={<Thumbtack />} />`
  next to the existing `/compare/buildertrend` route.
  Mirror the (non-)lazy-loading convention of the
  adjacent compare routes per the ticket 0042 precedent.
- Per the 2026-06-07 src-imports-tests lesson, add
  `/compare/thumbtack` to the `ROUTES` array in
  `src/data/routes.ts` (the canonical allow-list);
  `tests/e2e/routes.ts` re-exports it automatically and
  the smoke spec exercises the page.
- Append the eleventh entry to `COMPARE_ENTRIES` in
  `src/data/compareEntries.ts`:
  `{ id: 'thumbtack', tool: 'Thumbtack', path: '/compare/thumbtack', tagline: 'Thumbtack sells you leads. Digital Craft is the AI agent layer that books the leads you already have.' }`.
  The hub grid render and the `ItemList` JSON-LD on
  `/compare` pick this up automatically because both are
  built by mapping over the same constant (the 2026-05-25
  mirror-source rule).
- Per the 2026-05-30 second-@type lesson, BEFORE writing
  code grep `tests/e2e/compare-*.spec.ts` and
  `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'`
  AND `=== 'WebPage'` predicates. Confirm no spec asserts
  "exactly one of either @type site-wide" (the existing
  ten compare patterns are per-URL scoped per the ticket
  0042 Implementation log). Document the grep result in
  the Implementation log so the deviation, if any, is
  auditable.
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
  CTA labels, the footer disclaimer) uses hyphens. Self-
  Review greps the diff for `String.fromCharCode(8212)`
  before pushing.
- `tests/e2e/compare-thumbtack.spec.ts` (new) - one
  assertion per acceptance box. Model end-to-end on
  `tests/e2e/compare-buildertrend.spec.ts` (the most
  recent peer). CTA case: locate the three demo-card CTAs
  via the existing per-page testid pattern (use
  `data-testid="comparethumbtack-demo-cta"` and assert
  each `href` resolves to a `/homeservices/demo/*` path
  present in the `ROUTES` array imported from
  `tests/e2e/routes.ts`). The breadcrumb middle-item
  assertion (`itemListElement[1].name === 'Compare'` and
  `itemListElement[1].item.endsWith('/compare')`) is the
  spec-level regression check against a future copy edit
  that accidentally drops the hub item.
- Per the 2026-05-22 two-PR ship lesson, ship will need a
  follow-up `chore/0049-ship-status` PR after the feat PR
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

- YYYY-MM-DD - branch `feat/0049-...` opened
- YYYY-MM-DD - failing test added in `tests/...`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
