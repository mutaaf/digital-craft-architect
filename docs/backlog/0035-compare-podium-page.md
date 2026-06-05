---
id: 0035
title: Comparison page "Digital Craft vs Podium" for high-intent SMS and review compares
status: groomed
priority: P1
area: seo
created: 2026-06-05
owner: gtm-innovation
---

## User story

As a home-services or local-business owner who already pays Podium
for SMS messaging and review collection (or is evaluating Podium
against newer AI options) and is Googling "Podium AI,"
"Podium alternative," or "Podium vs Digital Craft AI," I want one
honest side-by-side page that compares the two products on the
features I actually shop for (AI lead chat, AI voice calls, review
automation, monthly cost, setup speed), so that I can decide in two
minutes whether Digital Craft is worth a 60-second demo without
sitting through a Podium sales pitch or a chargeable trial.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the comparison page pattern
is already proven across nine existing pages
(`src/pages/compare/{HubSpot,GoHighLevel,Zapier,Make,Intercom,Jobber,ServiceTitan}.tsx`
plus the two pre-backlog routes). The two most recent shipped
comparison tickets (0021 vs Jobber and 0028 vs ServiceTitan) cover
field-service CRMs; Podium is the highest-volume brand search in
the adjacent SMS-and-review category for home-services and
multi-location small business, and it is the next-highest-leverage
gap before someone else writes the comparison page for us. A tenth
comparison page modeled on `src/pages/compare/Jobber.tsx` (the
most recent peer with the closest target buyer) adds one route,
one file, and zero new components.

### Stakeholder

This widens the SEO moat in a query class where the buyer is at the
bottom of the funnel by construction (compare queries are the
highest-converting unpaid search type) and is already paying real
money for the incumbent. Podium's pricing starts around the
mid-3-figure monthly range and scales fast; a buyer Googling
"Podium alternative" is signalling either churn intent or
contract-renewal evaluation. The four landing pages funneling
home-services traffic today (plumbers, HVAC, roofers, plus the
electricians page in ticket 0034) all overlap with Podium's buyer
profile, so a "vs Podium" page connects existing top-of-funnel
traffic to a bottom-of-funnel decision artifact. The pattern is
intentionally repeatable; each comparison page is one ticket and
stays inside the 200-line diff budget.

### Visitor (in the real moment of use)

A 20-truck plumbing operator on a phone reads a clean side-by-side
table that honestly lists what Podium does that Digital Craft does
not (mature multi-location dashboard, deep integrations with
Service Titan and Housecall Pro, payments) AND what Digital Craft
does that Podium does not at the same price point (live AI voice
negotiation that books, AI lead chat trained on the prospect's own
scraped website, 48-hour setup, no implementation fee). The table
is defensible (no "we win every row," asterisked source on any
moving Podium claim), the differentiator cards explain the four
real wins, and the two CTAs route to `/homeservices` pricing and
`/homeservices/demo` so the visitor can test the claim in one tap.

### Growth

The "show me" moment is the SERP listing for "Podium vs Digital
Craft AI" or "Podium AI alternative" displaying a real comparison
page in the top results, where today there is only Podium's own
marketing and a few Reddit / Capterra threads. Comparison pages
get cited in trade-forum threads ("anyone switched off Podium?")
because they read as neutral side-by-sides; that is the shareable
artifact a generic home-services landing page cannot earn. Each
card click fires `trackCTAClick` with a `compare_podium_*`
location label so the funnel is measurable in GA independently of
the Jobber and ServiceTitan pages already in production.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/compare/Podium.tsx` (new file, under 220 lines) renders at `/compare/podium`, modeled 1:1 on `src/pages/compare/Jobber.tsx` (ticket 0021, the closest peer in target buyer profile). The page has a hero, a side-by-side comparison table (rows for AI lead chat, AI voice negotiation, review automation, setup time, monthly entry price, implementation fee, 48-hour go-live, dashboard depth, integrations), a "What Podium does better" honest-acknowledgment block, a "What Digital Craft does better" four-card differentiator block, and two CTA blocks (pricing + demo). Every "DigitalCraft wins" claim is sourced from existing copy in the repo; every "Podium wins" claim is defensible and acknowledges where Podium is genuinely stronger. No inflated client numbers per the AGENTS.md Hard NO.
- [ ] The page emits a `BreadcrumbList` JSON-LD (Home -> Compare -> Digital Craft vs Podium) and uses the same `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell as `Jobber.tsx`. Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/*-jsonld.spec.ts` for a `=== 'BreadcrumbList'` predicate to confirm no existing spec asserts "exactly one BreadcrumbList block site-wide" (the per-page assertions are scoped to their own path, so the risk is low, but the grep is mandatory).
- [ ] The new route is registered in `src/App.tsx` next to the existing `/compare/jobber` and `/compare/servicetitan` routes. The sitemap generator (ticket 0022) picks up the new route automatically and emits a `lastmod` from the commit date. The implementer adds `/compare/podium` to the `ROUTES` array in `tests/e2e/routes.ts` (the smoke spec's static route list) so the existing smoke spec exercises the new page.
- [ ] Every claim in the comparison table that names a Podium feature, price, or limit cites a publicly-verifiable source via an asterisk footnote at the bottom of the table (e.g. "* Podium pricing as listed on podium.com / pricing, 2026-06-05"). The implementer adds an HTML comment above each footnoted row naming the source URL, so a future editor can re-verify. No invented Podium numbers.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text, and every CTA route resolves to a registered route in `src/App.tsx`. The two CTAs route to `/homeservices` (pricing) and `/homeservices/demo` (demo); the table footnotes link to no external pages other than the asterisk-sourced Podium pages, which open in a new tab with `rel="noopener noreferrer"`.
- [ ] A new e2e spec at `tests/e2e/compare-podium.spec.ts` (modeled on `tests/e2e/compare-jobber.spec.ts` and `tests/e2e/compare-servicetitan.spec.ts`) asserts: the page returns < 400 status, the H1 contains "Podium" (case-insensitive substring), the `meta[name="description"]` content names Podium (asserted on the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson), the `BreadcrumbList` JSON-LD block is present and names "Compare" and "Podium," both CTAs resolve to `/homeservices*` routes registered in `ROUTES`, the comparison table renders at least 8 rows (one per feature), dark mode renders cleanly, and the page text contains no `U+2014` code point (`String.fromCharCode(8212)` in the assertion).
- [ ] No new hostnames in the page's own network surface (the footnoted external links are click-through only and not fetched), no `/api/` change, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to existing compare pages. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta` stay green; `npm run typecheck` stays clean. Per the 2026-05-25 SEO Pilot lesson, the e2e spec asserts the Helmet-managed `meta[name="description"]` content directly, NOT `page.toHaveTitle()`, because `/compare/podium` is not added to the `index.html` SEO Pilot pages table in this ticket.

## Out of scope

- Adding `/compare/podium` to the `index.html` SEO Pilot `pages`
  table. That is its own SEO-hygiene ticket and would also apply
  to the existing compare pages, which are not in the table either
  per the 2026-05-25 lesson. Out of scope here.
- Emitting a `Product` or `SoftwareApplication` JSON-LD comparing
  the two products as Offers. The existing compare pages emit
  `BreadcrumbList` only; adding richer product schema is its own
  SEO ticket (the 2026-05-30 second-@type collision risk against
  the `/demos` hub SoftwareApplication block per ticket 0030
  needs its own analysis). Out of scope here.
- A "Switch from Podium in 7 days" migration guide or import tool.
  The page is a top-of-funnel artifact; a migration tool is a
  product feature behind a sales conversation.
- A blog post or case study about a customer who switched from
  Podium to Digital Craft. No invented client names, no fake
  testimonials per the AGENTS.md Hard NO; a real testimonial would
  ship its own dated blog post through the existing pipeline.
- Adding a Podium-specific demo flow. The two CTAs route to the
  existing home-services demos; no new demo ships with this
  ticket.
- A "Compare Digital Craft to Birdeye / Swell / Thryv" follow-up
  page in the same review-and-SMS category. Each comparison page
  is its own ticket so the table claims stay defensible and the
  diff budget stays clean.
- Cross-linking the new compare page from the four trade landing
  pages (plumbers, HVAC, roofers, the electricians page in ticket
  0034). Internal-link clusters are their own small ticket once
  the compare page exists.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/compare/Podium.tsx` (under 220 lines). Copy
  `src/pages/compare/Jobber.tsx` (ticket 0021) end-to-end as the
  starting frame; swap every "Jobber" string for "Podium," swap
  the comparison-table row set to the Podium-specific feature set
  (AI lead chat, AI voice negotiation, review automation, SMS
  messaging, multi-location dashboard, integrations, monthly
  entry price, implementation fee, setup time). Keep the
  honest-acknowledgment block: Podium genuinely wins on
  multi-location dashboard depth and on integrations with
  ServiceTitan / Housecall Pro / Jobber; acknowledge that
  honestly so the page does not read as a hit piece.
- New route in `src/App.tsx`: import `Podium` and add
  `<Route path="/compare/podium" element={<Podium />} />` next to
  the `/compare/servicetitan` and `/compare/jobber` routes. Lazy-
  load only if the existing compare routes are lazy-loaded (grep
  `lazy(` in `src/App.tsx` to mirror the convention).
- Add `/compare/podium` to the `ROUTES` array in
  `tests/e2e/routes.ts`. The existing smoke spec
  (`tests/e2e/smoke.spec.ts`) iterates that array and asserts a
  status < 400 on every entry, so the new route gets free smoke
  coverage with one array edit.
- The `BreadcrumbList` schema names "Home -> Compare -> Digital
  Craft vs Podium"; the canonical link is
  `https://digitalcraftai.com/compare/podium`. Per the 2026-05-30
  second-@type lesson, this ticket emits a SECOND
  `BreadcrumbList` on the site (the demo-page breadcrumbs ticket
  0019 already emits per-demo BreadcrumbList blocks; the existing
  compare pages also emit them). Grep
  `tests/e2e/*-jsonld.spec.ts` and the demo-breadcrumbs spec for
  any "exactly one BreadcrumbList" predicate over the whole site;
  the existing assertions are scoped to specific URLs so the
  collision risk is low, but the grep is mandatory.
- Per the 2026-05-25 mirror-source lesson, every "Podium does X /
  costs Y" claim in the comparison table MUST be sourced from a
  publicly-verifiable URL named in an HTML comment above the row.
  The asterisk footnote in the rendered DOM names the URL; the
  HTML comment names it for the next editor. The 2026-05-25
  mirror-source-repair rule applies: if the claim drifts (Podium
  changes a price), fix it at the single shared source (the row's
  asterisk footnote text and the HTML comment URL) in one edit.
- Per the 2026-05-25 SEO Pilot lesson, the e2e spec asserts the
  Helmet-managed `meta[name="description"]` content directly
  (reading the LAST `meta[name="description"]` element in the head
  per the 2026-05-25 Helmet-appends lesson), NOT
  `page.toHaveTitle()`. The route is not in the `index.html` SEO
  Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every string in the page
  module, the comparison table, and the JSON-LD blocks uses
  hyphens. Self-Review greps the diff for the em-dash character
  (`U+2014`) before pushing.
- `tests/e2e/compare-podium.spec.ts` (new) - one spec per
  acceptance box. Model the spec on
  `tests/e2e/compare-servicetitan.spec.ts` (ticket 0028, the most
  recent peer) end-to-end. Page-renders, H1, schema, CTAs,
  table-row count, dark mode, no-em-dash, all cases mirror the
  precedent. Use `data-testid="compare-row"` on every comparison
  table row so the row-count assertion is stable; if the existing
  Jobber / ServiceTitan rows do not already have this attribute,
  ADD it to those rows in the same PR per the cross-fleet
  data-testid-scoping pattern (a page-wide `getByText` would
  collide with the differentiator card titles that repeat row
  labels).
- Per the 2026-05-22 two-PR ship lesson, ship will need a follow-up
  `chore/0035-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter AND its `docs/backlog/README.md` index row to
  `shipped` together; run `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index never drift mid-flip.
- New deps: NO. The page reuses `lucide-react`, `react-router-dom`,
  `react-helmet-async`, and the existing Navbar / Footer / Scroll
  Progress components. Schema migration: no. Privacy/security
  surface change: no - the page is static marketing copy and emits
  no new network calls.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0035-compare-podium-page` opened
- YYYY-MM-DD - failing test added in `tests/e2e/compare-podium.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
