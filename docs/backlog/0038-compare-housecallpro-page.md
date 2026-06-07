---
id: 0038
title: Comparison page "Digital Craft vs Housecall Pro" for high-intent field-service buyers
status: in-progress
priority: P1
area: seo
created: 2026-06-07
owner: gtm-innovation
---

## User story

As a home-services owner who already runs Housecall Pro for
dispatch and invoicing (or is evaluating Housecall Pro against
newer AI options) and is Googling "Housecall Pro AI,"
"Housecall Pro alternative," or "Housecall Pro vs Digital Craft
AI," I want one honest side-by-side page that compares the two
products on the features I actually shop for (AI lead chat, AI
voice calls, dispatch, monthly cost, setup speed), so that I can
decide in two minutes whether Digital Craft is worth a 60-second
demo without sitting through a Housecall Pro sales call or a
chargeable trial.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the comparison page pattern
is already proven across eight existing pages in
`src/pages/compare/{HubSpot,GoHighLevel,Zapier,Make,Intercom,Jobber,ServiceTitan,Podium}.tsx`.
The three most recent shipped comparison tickets (0021 vs Jobber,
0028 vs ServiceTitan, 0035 vs Podium) cover field-service CRMs and
the SMS-and-review category. Housecall Pro is the third major
field-service CRM in that bucket and the single highest-volume
brand search still uncovered (Housecall Pro publishes a $69/mo
entry tier and crosses 30,000 contractors, so the "alternative"
query volume is real and the buyer is mid-funnel by construction).
A ninth comparison page modeled on
`src/pages/compare/Jobber.tsx` adds one route, one file, and zero
new components.

### Stakeholder

This widens the SEO moat in a query class where the buyer is at
the bottom of the funnel and is already paying real money for an
incumbent that competes in the home-services demos we already
ship. The five trade landing pages (plumbers, HVAC, roofers,
electricians, and the painters page in ticket 0037) all funnel
into the home-services demos, so a "vs Housecall Pro" page
connects existing top-of-funnel traffic to a bottom-of-funnel
decision artifact. The pattern is intentionally repeatable; each
comparison page is one ticket and stays inside the 200-line diff
budget per page.

### Visitor (in the real moment of use)

A 12-truck plumbing operator on a phone reads a clean side-by-side
table that honestly lists what Housecall Pro does that Digital
Craft does not (mature dispatch with drag-drop scheduling, deep
QuickBooks integration, in-app payments, mobile field-tech app)
AND what Digital Craft does that Housecall Pro does not at the
same entry price point (live AI voice negotiation that books, AI
lead chat trained on the prospect's own scraped website, 48-hour
setup, no implementation fee). The table is defensible (no "we win
every row," asterisked source on any moving Housecall Pro claim),
the differentiator cards explain the four real wins, and the two
CTAs route to `/homeservices` pricing and `/homeservices/demo` so
the visitor can test the claim in one tap.

### Growth

The "show me" moment is the SERP listing for "Housecall Pro vs
Digital Craft AI" or "Housecall Pro AI alternative" displaying a
real comparison page in the top results, where today there is
only Housecall Pro's own marketing and a few Reddit and Capterra
threads. Comparison pages get cited in trade-forum threads
("anyone switched off Housecall Pro?") because they read as
neutral side-by-sides; that is the shareable artifact a generic
home-services landing page cannot earn. Each card click fires
`trackCTAClick` with a `compare_housecallpro_*` location label so
the funnel is measurable in GA independently of the Jobber,
ServiceTitan, and Podium pages already in production.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/compare/HousecallPro.tsx` (new file, under 330 lines, matching the actual peer pattern of the Jobber / ServiceTitan / Podium files) renders at `/compare/housecallpro`, modeled 1:1 on `src/pages/compare/Podium.tsx` (ticket 0035, the most recent peer) and `src/pages/compare/Jobber.tsx` (ticket 0021, the closest peer in target buyer profile). The page has a hero, a side-by-side comparison table (rows for AI lead chat, AI voice negotiation, dispatch and scheduling, in-app payments, QuickBooks integration, mobile field-tech app, monthly entry price, implementation fee, setup time), a "What Housecall Pro does better" honest-acknowledgment block, a "What Digital Craft does better" four-card differentiator block, and two CTA blocks (pricing + demo). Every "DigitalCraft wins" claim is sourced from existing copy in the repo; every "Housecall Pro wins" claim is defensible and acknowledges where Housecall Pro is genuinely stronger. No inflated client numbers per the AGENTS.md Hard NO.
- [ ] The page emits a `BreadcrumbList` JSON-LD (Home -> Compare -> Digital Craft vs Housecall Pro) and uses the same `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell as `Podium.tsx`. Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/*-jsonld.spec.ts` AND `tests/e2e/compare-*.spec.ts` for a `=== 'BreadcrumbList'` predicate to confirm no existing spec asserts "exactly one BreadcrumbList block site-wide" (the per-page assertions are scoped to their own path per the 0035 grep, so the risk is low, but the grep is mandatory). The grep result is documented in the Implementation log.
- [ ] The new route is registered in `src/App.tsx` next to the existing `/compare/podium`, `/compare/servicetitan`, and `/compare/jobber` routes. The sitemap generator (ticket 0022) picks up the new route automatically and emits a `lastmod` from the commit date. The implementer adds `/compare/housecallpro` to the `ROUTES` array in `tests/e2e/routes.ts` so the existing smoke spec exercises the new page.
- [ ] Every claim in the comparison table that names a Housecall Pro feature, price, or limit cites a publicly-verifiable source via an asterisk footnote at the bottom of the table (e.g. "* Housecall Pro pricing as listed on housecallpro.com/pricing, 2026-06-07"). The implementer adds an HTML comment above each footnoted row naming the source URL, so a future editor can re-verify per the 2026-05-25 mirror-source rule. No invented Housecall Pro numbers.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text, and every CTA route resolves to a registered route in `src/App.tsx`. The two CTAs route to `/homeservices` (pricing) and `/homeservices/demo` (demo); the table footnotes link to no external pages other than the asterisk-sourced Housecall Pro pages, which open in a new tab with `rel="noopener noreferrer"`.
- [ ] A new e2e spec at `tests/e2e/compare-housecallpro.spec.ts` (modeled on `tests/e2e/compare-podium.spec.ts`) asserts: the page returns < 400 status, the H1 contains "Housecall Pro" (case-insensitive substring), the `meta[name="description"]` content names Housecall Pro (asserted on the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson), the `BreadcrumbList` JSON-LD block is present and names "Compare" and "Housecall Pro," both CTAs resolve to `/homeservices*` routes registered in `ROUTES`, the comparison table renders at least 8 rows (one per feature, asserted via `data-testid="compare-row"`), dark mode renders cleanly, and the page text contains no `U+2014` code point (`String.fromCharCode(8212)` in the assertion).
- [ ] No new hostnames in the page's own network surface (the footnoted external links are click-through only and not fetched), no `/api/` change, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to existing compare pages other than the `data-testid="compare-row"` attribute additions noted under Engineering notes. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta` stay green; `npm run typecheck` stays clean. Per the 2026-05-25 SEO Pilot lesson, the e2e spec asserts the Helmet-managed `meta[name="description"]` content directly, NOT `page.toHaveTitle()`, because `/compare/housecallpro` is not added to the `index.html` SEO Pilot pages table in this ticket.

## Out of scope

- Adding `/compare/housecallpro` to the `index.html` SEO Pilot
  `pages` table. That is its own SEO-hygiene ticket and would also
  apply to the existing compare pages, which are not in the table
  either per the 2026-05-25 lesson. Out of scope here.
- Emitting a `Product` or `SoftwareApplication` JSON-LD comparing
  the two products as Offers. The existing compare pages emit
  `BreadcrumbList` only; adding richer product schema is its own
  SEO ticket (the 2026-05-30 second-@type collision risk against
  the `/demos` hub SoftwareApplication block per ticket 0030
  needs its own analysis). Out of scope here.
- A "Switch from Housecall Pro in 7 days" migration guide or
  import tool. The page is a top-of-funnel artifact; a migration
  tool is a product feature behind a sales conversation.
- A blog post or case study about a customer who switched from
  Housecall Pro. No invented client names, no fake testimonials
  per the AGENTS.md Hard NO; a real testimonial would ship its
  own dated blog post through the existing pipeline.
- Adding a Housecall-Pro-specific demo flow. The two CTAs route
  to the existing home-services demos; no new demo ships with
  this ticket.
- A "Compare Digital Craft to Thumbtack / Angi / CallRail"
  follow-up page in adjacent lead-generation or call-tracking
  categories. Each comparison page is its own ticket so the
  table claims stay defensible and the diff budget stays clean.
- Cross-linking the new compare page from the five trade
  landing pages (plumbers, HVAC, roofers, electricians, the
  painters page in ticket 0037). Internal-link clusters are
  their own small ticket once the compare page exists.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/compare/HousecallPro.tsx` (under 330 lines).
  Copy `src/pages/compare/Podium.tsx` (ticket 0035) end-to-end
  as the starting frame; swap every "Podium" string for
  "Housecall Pro," swap the comparison-table row set to the
  Housecall Pro feature set (AI lead chat, AI voice
  negotiation, dispatch and scheduling, mobile field-tech app,
  in-app payments, QuickBooks integration, monthly entry price,
  implementation fee, setup time). Keep the
  honest-acknowledgment block: Housecall Pro genuinely wins on
  mature dispatch, the field-tech mobile app, in-app payments,
  and the QuickBooks integration; acknowledge that honestly so
  the page does not read as a hit piece.
- New route in `src/App.tsx`: import `HousecallProComparison`
  (matching the existing `PodiumComparison` import naming
  convention - the page module names its default export
  `HousecallPro` but the App import aliases per the existing
  pattern) and add
  `<Route path="/compare/housecallpro" element={<HousecallProComparison />} />`
  next to the `/compare/podium` route. Lazy-load only if the
  existing compare routes are lazy-loaded (grep `lazy(` in
  `src/App.tsx` to mirror the convention - they are NOT lazy
  today, so the new route follows suit).
- Add `/compare/housecallpro` to the `ROUTES` array in
  `tests/e2e/routes.ts`. The existing smoke spec
  (`tests/e2e/smoke.spec.ts`) iterates that array and asserts a
  status < 400 on every entry, so the new route gets free smoke
  coverage with one array edit.
- The `BreadcrumbList` schema names "Home -> Compare -> Digital
  Craft vs Housecall Pro"; the canonical link is
  `https://digitalcraftai.com/compare/housecallpro`. Per the
  2026-05-30 second-@type lesson, this ticket emits a NINTH
  `BreadcrumbList` on the site. The demo-breadcrumbs spec
  (ticket 0019) and every compare-page spec scope their
  assertions to specific URLs, so the collision risk is low, but
  the grep is mandatory.
- Per the 2026-05-25 mirror-source lesson, every "Housecall Pro
  does X / costs Y" claim in the comparison table MUST be sourced
  from a publicly-verifiable URL named in an HTML comment above
  the row. The asterisk footnote in the rendered DOM names the
  URL; the HTML comment names it for the next editor. The
  mirror-source repair rule applies: if the claim drifts
  (Housecall Pro changes a price), fix it at the single shared
  source (the row's asterisk footnote text and the HTML comment
  URL) in one edit.
- Per the 2026-05-25 SEO Pilot lesson, the e2e spec asserts the
  Helmet-managed `meta[name="description"]` content directly
  (reading the LAST `meta[name="description"]` element in the
  head per the 2026-05-25 Helmet-appends lesson), NOT
  `page.toHaveTitle()`. The route is not in the `index.html` SEO
  Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every string in the page
  module, the comparison table, and the JSON-LD blocks uses
  hyphens. Self-Review greps the diff for the em-dash character
  (`U+2014`) before pushing.
- `tests/e2e/compare-housecallpro.spec.ts` (new) - one spec per
  acceptance box. Model the spec on
  `tests/e2e/compare-podium.spec.ts` (ticket 0035, the most
  recent peer) end-to-end. Page-renders, H1, schema, CTAs,
  table-row count, dark mode, no-em-dash, all cases mirror the
  precedent. Use `data-testid="compare-row"` on every comparison
  table row so the row-count assertion is stable; the Podium
  page already added this attribute per ticket 0035's
  Engineering notes, so the pattern is consistent. If the
  existing Jobber / ServiceTitan rows still do not have this
  attribute, ADD it to those rows in the same PR per the
  cross-fleet data-testid-scoping pattern (a page-wide
  `getByText` would collide with the differentiator card titles
  that repeat row labels).
- Per the 2026-05-22 two-PR ship lesson, ship will need a
  follow-up `chore/0038-ship-status` PR after the feat PR merges
  to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing the second PR
  so the file and index never drift mid-flip.
- New deps: NO. The page reuses `lucide-react`,
  `react-router-dom`, `react-helmet-async`, and the existing
  Navbar / Footer / ScrollProgress components. Schema migration:
  no. Privacy/security surface change: no - the page is static
  marketing copy and emits no new network calls.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-06-07 - branch `feat/0038-compare-housecallpro-page` opened; ticket flipped to in-progress with README index row in the same commit.
- 2026-06-07 - grep over `tests/e2e/*-jsonld.spec.ts` and `tests/e2e/compare-*.spec.ts` for `=== 'BreadcrumbList'` predicates: every match is scoped to its own URL (compare-jobber, compare-servicetitan, compare-podium, ai-for-{plumbers,hvac,roofers,electricians,painters}, demo-breadcrumbs). No "exactly one BreadcrumbList site-wide" assertion exists, so a ninth BreadcrumbList block does not collide. Safe to land.
- 2026-06-07 - failing test added in `tests/e2e/compare-housecallpro.spec.ts`, then `src/pages/compare/HousecallPro.tsx` + `src/App.tsx` route + `tests/e2e/routes.ts` entry shipped to satisfy it.
