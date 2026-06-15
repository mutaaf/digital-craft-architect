---
id: 0053
title: Comparison page "Digital Craft vs Angi" for high-intent home-services lead-marketplace switchers
status: shipped
priority: P1
area: seo
created: 2026-06-15
owner: gtm-innovation
---

## User story

As a residential plumber, HVAC tech, roofer, or handyman who
has been paying Angi (formerly Angie's List) $40 to $100 per
shared lead for the last two years and is tired of watching the
same inquiry get fanned out to four other pros in the same ZIP
code, Googling "Angi alternative for contractors," "is Angi
worth it 2026," "stop paying for Angi leads," or "AI to replace
Angi" on a phone between jobs, I want one honest comparison
page at `/compare/angi` that names which job Angi does well
(a brand-recognized homeowner-facing acquisition marketplace)
and which job Digital Craft does instead (answering and
qualifying the leads I already have so the ones I pay Angi for
actually book), so that I can decide in 90 seconds whether the
AI agent layer is the move my margin needs without bouncing
back to search.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the comparison-page
pattern is now proven across ELEVEN shipped pages
(`src/pages/compare/{HubSpot,GoHighLevel,Zapier,Make,Intercom,Jobber,ServiceTitan,Podium,HousecallPro,Buildertrend,Thumbtack}.tsx`,
tickets 0021-0049) plus the canonical `/compare` hub (ticket
0048) that reads from `src/data/compareEntries.ts`. The hub
already surfaces a new comparison the instant it is appended
to `COMPARE_ENTRIES`. Adding the twelfth comparison is exactly
one new page file, one new spec file, two two-line entries
(`src/App.tsx` route, `src/data/routes.ts` ROUTES), and one new
entry in `src/data/compareEntries.ts`. The Thumbtack page
(ticket 0049) is the closest peer because Angi is the same
structural class of incumbent (a pay-per-lead acquisition
marketplace, not software a contractor operates), so the
positioning frame is already proven: Angi SELLS you leads,
Digital Craft HANDLES the leads you already have. The two are
complements with non-overlapping ICPs of the "which one to
spend my next $500 on" decision. No new component, no new
data shape, no new JSON-LD `@type` first emission - the page
emits the same `BreadcrumbList` + `WebPage` pair the eleven
predecessor compare pages emit per the ticket 0042 / 0049
Implementation logs.

### Stakeholder

This widens the SEO moat in a query class adjacent to but
strictly separate from the Thumbtack page (ticket 0049):
"Angi alternative," "Angi vs," "stop paying for Angi leads,"
"Angi worth it for contractors." Per Google Trends, "Angi"
out-volumes "Thumbtack" by roughly 2x in the contractor-side
SERP (Angi has the brand-recognition advantage from its
Angie's List heritage; Thumbtack has the cleaner UX and the
newer audience). Capturing both query trees with two distinct
pages is materially higher-leverage than one combined
"lead marketplaces" page, because the homeowner-frustration
language differs ("Angi takes a cut and emails the lead to
everyone" vs "Thumbtack credits expire and the price-per-lead
keeps creeping up"). Angi was explicitly named in ticket
0049's Out of Scope ("An 'Angi' or 'CallRail' comparison
page in the same ticket. Each comparison page is structurally
one ticket per the ticket 0021-0042 precedent. The ticket
0038 Out of Scope named 'Thumbtack / Angi / CallRail' as a
family; this ticket picks Thumbtack as the highest-search-
volume of the three. Angi and CallRail are separate future
tickets"), making this pre-authorized follow-up work per
the 2026-05-22 "bootstrap pre-authorized follow-ups" lesson,
not speculative grooming. The page also closes a credibility
gap on the seven trade landing pages (plumbers 0017, HVAC
0020, roofers 0024, electricians 0034, painters 0037,
landscapers 0041, cleaning-services 0050) that funnel into
the home-services demo family but never name Angi, the
single largest acquisition channel an Angie's-List-era trade
owner has on autopay. A landing-page visitor who taps "vs
Angi" from the `/compare` hub self-selects as an Angi
subscriber, which is the highest-intent prospect the trade-
page funnel can produce.

### Visitor (in the real moment of use)

A 10-year-old residential HVAC business owner Googles "Angi
alternative for HVAC contractors" on a phone Friday afternoon
between a service call and a tune-up appointment. The SERP
listing surfaces `/compare/angi` with a meta description that
names the actual frustration (paying per-shared-lead for
inquiries that three other pros in the same ZIP code also
receive) instead of marketing fluff. One tap and the page
loads in under one screen with a positioning sentence at the
top ("Angi sells you shared leads, Digital Craft helps you
book the leads you already have"), a four-row comparison
table (lead source, exclusivity, response speed, cost
model), a "Use both" section that acknowledges Angi still
makes sense as a homeowner-facing brand top-up while AI
answering does the qualification work, three demo CTAs
routing to the existing `/homeservices/demo/*` family, and
one strategy-call CTA. The visitor leaves knowing whether
the AI agent layer is the move or not. Light and dark mode
supported; the page reads cleanly on a 375px viewport.

### Growth

The "show me" moment is the SERP listing for "Angi
alternative" surfacing a real, honest comparison page that
does NOT trash Angi but reframes the spend. A trade owner who
Slack-shares the page to a peer with "this is exactly the
frame I was missing" is the cheapest qualified strategy-call
the funnel can produce, because the share is peer-to-peer
between two operators who already pay for the same lead
marketplace. Each CTA click fires `trackCTAClick` with a
`compareangi_*` location label so the funnel is measurable
in GA independently of the eleven existing comparison pages.
The hub-level pickup (the page surfaces automatically on
`/compare` once appended to `COMPARE_ENTRIES`) means a
single visit to the hub gives the page a second discovery
path with no extra ticket. With the Thumbtack page (0049)
already ranking, Angi is the second of the two highest-
search-volume lead marketplaces and structurally lifts the
hub from "one marketplace example" to "the marketplace
category covered."

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/compare/Angi.tsx` (new file, under 320 lines) renders at `/compare/angi`, modeled 1:1 on `src/pages/compare/Thumbtack.tsx` (ticket 0049, the closest structural peer because both are lead marketplaces, not field-service software). The page has a hero with an Angi-specific H1 ("Digital Craft vs Angi for Service Businesses Tired of Shared Leads"), a one-paragraph positioning summary, a four-row comparison table (Lead source / Exclusivity per lead / Response speed / Cost model), a "Use both" section that names the complementary stack (Angi for homeowner-facing brand acquisition, Digital Craft for qualification of the leads you already have), three demo CTAs routing to `/homeservices/demo/lead-responder`, `/homeservices/demo/voice-followup`, and `/homeservices/demo/estimate`, and one strategy-call CTA reusing the existing calendly URL. Every claim is defensible: no invented client names, no fabricated efficacy percentages, no Angi-specific pricing the page cannot cite from publicly available sources (Angi's public help docs and contractor-side reviews name shared-lead pricing in a $40-$100 range; cite the source in an HTML comment per the 2026-05-25 mirror-source-fix rule).
- [ ] The page emits TWO JSON-LD blocks inside the existing `<Helmet>` head matching the eleven-page convention: (1) a `BreadcrumbList` (Home -> Compare -> Digital Craft vs Angi) using the same shape as `src/pages/compare/Thumbtack.tsx` `BREADCRUMB_SCHEMA` with `Compare` as the second item linking to `/compare` (the canonical hub from ticket 0048) and `Digital Craft vs Angi` as the third item, and (2) a `WebPage` block carrying `name`, `description` (same string as `META_DESCRIPTION` per the 2026-05-25 mirror-source rule), and `isPartOf` pointing to the existing `WebSite` block from ticket 0016. The breadcrumb middle item mirrors the ticket 0049 shape (Thumbtack ships with the hub-aware breadcrumb); the ten pre-hub compare pages (0021-0042) are NOT edited in this ticket - their breadcrumb update is a separate cross-cutting ticket per the AGENTS.md small-focused-PR rule and is explicitly out of scope here.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/compare-*.spec.ts` AND every existing `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'` AND `=== 'WebPage'` predicates. The ticket 0049 Implementation log confirms all predecessor predicates are per-URL scoped (each spec navigates to its own `/compare/<tool>` route and asserts the BreadcrumbList / WebPage block on that URL only). The grep is mandatory regardless and the result is documented in this ticket's Implementation log; if any new "exactly one site-wide" predicate has shipped between 0049 and today, the implementer rewrites it in the same PR per the 2026-05-30 mirror-source-fix family rule.
- [ ] The new route is registered in `src/App.tsx` next to the existing `/compare/thumbtack` route. The implementer adds `/compare/angi` to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson (the canonical allow-list); `tests/e2e/routes.ts` re-exports it automatically and the smoke spec exercises the page. The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date.
- [ ] A new entry is appended to `COMPARE_ENTRIES` in `src/data/compareEntries.ts` with `id: 'angi'`, `tool: 'Angi'`, `path: '/compare/angi'`, and a factual one-line tagline (no em-dashes) sourced from the visible H1 / intro of the new page so the hub copy and the page stay in sync (the 2026-05-25 mirror-source rule). The suggested tagline: `'Angi sells you shared leads. Digital Craft is the AI agent layer that books the leads you already have.'` The existing `/compare` hub render and the `ItemList` JSON-LD pick up the twelfth entry automatically; the existing `tests/e2e/compare-hub.spec.ts` count assertion (which reads `COMPARE_ENTRIES.length` at runtime per the ticket 0048 spec design) continues to pass without edit because the count is dynamic, not a hardcoded 11.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in any JSON-LD serialized string, and every CTA route resolves to a registered route in `src/data/routes.ts`. The three primary CTAs route to `/homeservices/demo/lead-responder`, `/homeservices/demo/voice-followup`, and `/homeservices/demo/estimate` (the three home-services demos the trade family already funnels into); the strategy-call CTA opens calendly in a new tab with `rel="noopener noreferrer"` matching the existing compare-page convention.
- [ ] A new e2e spec at `tests/e2e/compare-angi.spec.ts` (modeled on `tests/e2e/compare-thumbtack.spec.ts`) asserts: the page returns < 400 status, the H1 contains "Angi" (case-insensitive substring), the `meta[name="description"]` content names "Angi" (asserted on the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson), the `BreadcrumbList` JSON-LD has three items with the middle one named "Compare" and linking to `/compare`, the `WebPage` JSON-LD block carries the expected `name`, the three demo CTAs each resolve to a `/homeservices/demo/*` route present in `ROUTES`, the page text contains no `String.fromCharCode(8212)` code point, and dark mode renders cleanly via `document.documentElement.classList.add('dark')`. Spec also asserts the new `COMPARE_ENTRIES` entry exists by importing the constant from `src/data/compareEntries.ts` and checking the `angi` id is present.
- [ ] No `/api/` change, no new hostname (the only external link is the existing `calendly.com/mutaaf` URL already used on every compare page), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the eleven existing `src/pages/compare/*.tsx` pages or their specs, no edits to `src/pages/CompareHub.tsx` (the hub picks up the new entry automatically via the `COMPARE_ENTRIES` mirror-source). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; every pre-existing `tests/e2e/compare-*.spec.ts` and the `tests/e2e/compare-hub.spec.ts` stay green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A "CallRail" comparison page in the same ticket. The
  ticket 0049 Out of Scope named "Thumbtack / Angi /
  CallRail" as a family; ticket 0049 picked Thumbtack as
  the highest-search-volume of the three, this ticket
  picks Angi as the second, and CallRail is a separate
  future ticket. CallRail is also structurally different
  (it is a call-tracking and analytics tool, not a lead
  marketplace) so the positioning frame differs and the
  combined ticket would dilute both pages.
- Updating the ten pre-hub compare pages (0021-0042) to
  include the new `/compare` middle breadcrumb item. That
  edit spans ten files and is a separate cross-cutting
  ticket. The Thumbtack page (0049) ships with the
  hub-aware breadcrumb; this page does the same; the ten
  predecessors stay as shipped.
- Editing the existing `src/data/compareEntries.ts`
  taglines for the eleven predecessor entries. The new
  entry is additive; the predecessors stay as shipped.
- Adding `/compare/angi` to the `index.html` SEO Pilot
  `pages` table. That is its own SEO-hygiene ticket and
  applies uniformly to all twelve compare-family routes,
  none of which are in the table per the 2026-05-25 SEO
  Pilot lesson. Out of scope here.
- An "Angi-credit-savings" or "Angi-spend" calculator on
  the page. The shareable ROI calculator (ticket 0046)
  is the canonical ROI surface; a per-comparison
  calculator would fragment the math. A future iteration
  of `/roi` could surface an "Angi shared-lead cost"
  preset, but that is its own ticket once telemetry
  shows demand.
- Adding a `Product` or `Service` JSON-LD block on the
  page. The eleven existing compare pages emit
  `BreadcrumbList` + `WebPage` only per the ticket 0042 /
  0049 Implementation logs; the twelfth page follows that
  convention. Adding a third `@type` would also trigger
  the 2026-05-30 second-@type collision audit on every
  compare-family spec, which is out of scope for this
  ticket.
- An "Angi switching guide" blog post. Blog content ships
  through the `src/data/blogPosts.ts` pipeline and is
  gated by `check-blog-dates`; a thematic post is its
  own content ticket.
- Internationalization (`inLanguage` fields on schema).
  The page is English-only, matching the eleven
  predecessor compare pages.
- A testimonial from a former Angi customer. The
  AGENTS.md Hard NO on invented testimonials applies; a
  real testimonial ships through its own dated blog
  post via the existing pipeline once a real client
  agrees to attribution.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/compare/Angi.tsx` (under 320 lines).
  Copy `src/pages/compare/Thumbtack.tsx` (ticket 0049)
  end-to-end as the starting frame, then swap every
  "Thumbtack" string for the Angi equivalent. Keep the
  same module-level mirror-source constants: `PAGE_H1`,
  `META_DESCRIPTION`, `PAGE_NAME` (per the 2026-05-25
  mirror-source rule the description used in the Helmet
  meta tag and the `WebPage` JSON-LD `description` MUST
  be the same `META_DESCRIPTION` constant). Swap the
  four `COMPARISON_ROWS` entries to the four Angi-
  specific dimensions named in the acceptance criteria
  (Lead source, Exclusivity per lead, Response speed,
  Cost model). The "Use both" section is rewritten
  copy reflecting Angi's homeowner-facing brand
  recognition (which is structurally different from
  Thumbtack's marketplace-discovery UX) so the
  reframing language is honest, not a copy-paste of
  the Thumbtack section. Keep it factual: no efficacy
  numbers, no client names.
- New route in `src/App.tsx`: import `Angi` from
  `./pages/compare/Angi` and add
  `<Route path="/compare/angi" element={<Angi />} />`
  next to the existing `/compare/thumbtack` route.
  Mirror the (non-)lazy-loading convention of the
  adjacent compare routes per the ticket 0049
  precedent.
- Per the 2026-06-07 src-imports-tests lesson, add
  `/compare/angi` to the `ROUTES` array in
  `src/data/routes.ts` (the canonical allow-list);
  `tests/e2e/routes.ts` re-exports it automatically
  and the smoke spec exercises the page.
- Append the twelfth entry to `COMPARE_ENTRIES` in
  `src/data/compareEntries.ts`:
  `{ id: 'angi', tool: 'Angi', path: '/compare/angi', tagline: 'Angi sells you shared leads. Digital Craft is the AI agent layer that books the leads you already have.' }`.
  The hub grid render and the `ItemList` JSON-LD on
  `/compare` pick this up automatically because both
  are built by mapping over the same constant (the
  2026-05-25 mirror-source rule).
- Per the 2026-05-30 second-@type lesson, BEFORE
  writing code grep `tests/e2e/compare-*.spec.ts` and
  `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'`
  AND `=== 'WebPage'` predicates. Confirm no spec
  asserts "exactly one of either @type site-wide" (the
  ticket 0049 Implementation log already established
  this baseline; this ticket revalidates it on today's
  main). Document the grep result in the Implementation
  log so the deviation, if any, is auditable.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e
  spec asserts the Helmet-managed `meta[name="description"]`
  content directly (LAST `meta[name="description"]`
  element per the 2026-05-25 Helmet-appends lesson),
  NOT `page.toHaveTitle()`. The route is not in the
  `index.html` SEO Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every string in
  the page module (the H1, the META_DESCRIPTION, the
  PAGE_NAME, the four comparison-row labels and values,
  the "Use both" section copy, the JSON-LD strings, the
  CTA labels, the footer disclaimer) uses hyphens.
  Self-Review greps the diff for
  `String.fromCharCode(8212)` before pushing.
- `tests/e2e/compare-angi.spec.ts` (new) - one
  assertion per acceptance box. Model end-to-end on
  `tests/e2e/compare-thumbtack.spec.ts` (the most
  recent peer). CTA case: locate the three demo-card
  CTAs via the existing per-page testid pattern (use
  `data-testid="compareangi-demo-cta"` and assert each
  `href` resolves to a `/homeservices/demo/*` path
  present in the `ROUTES` array imported from
  `tests/e2e/routes.ts`). The breadcrumb middle-item
  assertion (`itemListElement[1].name === 'Compare'`
  and `itemListElement[1].item.endsWith('/compare')`)
  is the spec-level regression check against a future
  copy edit that accidentally drops the hub item.
- Per the 2026-05-22 two-PR ship lesson, ship will
  need a follow-up `chore/0053-ship-status` PR after
  the feat PR merges to flip the ticket frontmatter
  AND its `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing
  the second PR so the file and index never drift
  mid-flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, the existing
  Navbar / Footer / ScrollProgress components, and the
  existing `trackCTAClick` helper. Schema migration:
  no. Privacy/security surface change: no - the page
  is static marketing copy and emits no new network
  calls; the only external link is the existing
  calendly URL already disclosed on `/trust` per
  ticket 0018.

## Implementation log

### 2026-06-15 - implementation-dev

Mandatory pre-code grep per the 2026-05-30 second-@type lesson:
`tests/e2e/compare-*.spec.ts` and `tests/e2e/*-jsonld.spec.ts` for
`=== 'BreadcrumbList'` AND `=== 'WebPage'` predicates. Result: every
`toHaveLength(1)` / "exactly one" predicate is URL-scoped to a
different route (`/compare/jobber`, `/compare/servicetitan`,
`/compare/podium`, `/compare/housecallpro`, `/compare/buildertrend`,
`/compare/thumbtack`, `/compare` hub, `/my`, plus the `/demos`,
`/changelog`, `/trust`, `/quiz`, `/roi`, `/ai-for-*` per-page
specs). NONE assert "exactly one of either @type site-wide", so a
new `/compare/angi`-scoped BreadcrumbList + WebPage pair does NOT
collide with any predecessor spec. No predecessor spec rewrite
needed; the 2026-05-30 mirror-source-fix family rule does not
apply on this ticket.

Files touched:
- `src/pages/compare/Angi.tsx` (new, 313 lines, under the 320 cap)
- `src/App.tsx` (one import, one Route, next to thumbtack)
- `src/data/routes.ts` (one entry `/compare/angi`, after thumbtack)
- `src/data/compareEntries.ts` (twelfth entry, id `angi`, tagline
  mirrored from the hero positioning sentence per the 2026-05-25
  mirror-source rule)
- `tests/e2e/compare-angi.spec.ts` (new, mirrored on
  `tests/e2e/compare-thumbtack.spec.ts`; nine boxes)
- `docs/backlog/0053-compare-angi-page.md` (this log + status flip)
- `docs/backlog/README.md` (index row status flip)

Self-Review grep before push:
- `grep -n "$(printf '—')" src/pages/compare/Angi.tsx
  src/data/compareEntries.ts tests/e2e/compare-angi.spec.ts`: zero
  matches (the em-dash Hard NO holds).
- `grep -nE "BreadcrumbList|WebPage" src/pages/compare/Angi.tsx`:
  exactly two `@type` declarations, both the canonical pair.
- No `/api/` change, no `package.json` change, no edits to the
  eleven predecessor compare pages or specs.
