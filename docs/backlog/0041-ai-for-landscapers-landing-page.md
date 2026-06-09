---
id: 0041
title: AI-for-landscapers long-tail landing page funneling into home-services demos
status: shipped
priority: P1
area: content
created: 2026-06-09
owner: gtm-innovation
---

## User story

As a landscape-contractor or lawn-care-company owner Googling
"AI for landscapers," "landscaping lead chat," "lawn care
estimate AI," or "automated review chasing for landscapers" on a
phone between job sites, I want one honest landing page that
shows me two live demos already wired to landscaping workflows
(spring-cleanup lead chat and instant maintenance-quote follow-up)
without a signup, so that I can decide in 60 seconds whether the
product is worth a strategy call instead of bouncing on a generic
home-services pitch that names every trade except mine.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the trade-page pattern
is now proven across five shipped pages
(`src/pages/AiForPlumbers.tsx` ticket 0017,
`AiForHvac.tsx` ticket 0020, `AiForRoofers.tsx` ticket 0024,
`AiForElectricians.tsx` ticket 0034, `AiForPainters.tsx`
ticket 0037). Landscaping is the next-highest-volume trade
query in the home-services bucket where the existing
`src/data/homeservicesPricing.ts` `LANDSCAPING_SERVICES` array
ALREADY carries five priced landscaping line items
(landscape design and install, gutter install, plus three more
adjacent line items), and the existing demos at
`/homeservices/demo/lead-responder` and
`/homeservices/demo/estimate` already accept a landscaping
trade selection by construction. One new page, one new route,
one new spec, zero new demo, zero new pricing tier, zero new
backend.

### Stakeholder

This widens the SEO moat in a query class the five existing
trade pages do not cover (landscapers Googling "AI for
landscaping" today land on the generic `/homeservices` page
which names six trades and centers none). Per the 2026-06-07
shipped-velocity note in `docs/CHANGELOG.md`, every trade page
in the family has compounded sitemap coverage and added a
distinct internal-link surface from `/homeservices` and from
`/changelog`. Landscaping is also the only trade in the
`homeservicesPricing.ts` `TRADE_GROUPS` array whose own
trade-page is missing, so the family becomes structurally
complete after this ship: every priced trade group has its
own long-tail page. The pattern stays inside the 200-line
diff budget; the page is intentionally small.

### Visitor (in the real moment of use)

A 4-truck landscape-contractor owner Googles "AI for landscaping
business" on a phone at lunch. The SERP listing surfaces
`/ai-for-landscapers` with a description that names the three
landscaping pain points (no-shows on spring-cleanup quotes,
slow follow-up on maintenance-contract bids, missed Google
reviews after a finished install). One tap on the hero CTA
opens the live `/homeservices/demo/lead-responder` already
qualifying as landscaping. No signup, no credit card, the
visitor sees an AI agent triaging a lawn-renovation lead in
under 60 seconds. Light and dark mode supported; the page
reads cleanly on a 375px viewport between irrigation calls.

### Growth

The "show me" moment is the SERP listing for "AI for
landscapers" or "landscaping lead chat" returning a real
trade-specific page where today only Jobber's marketing and a
handful of generic SaaS articles rank. Each CTA click fires
`trackCTAClick` with a `landscapers_*` location label so the
funnel is measurable in GA independently of the five existing
trade pages. A returning landscaping owner who books a
strategy call after landing here is the cheapest qualified
demo-call this funnel can produce; the page itself is
shareable on a landscaping subreddit or a trade Facebook group
because the table-of-pains reads as an actual landscaper
wrote it (no invented client quotes, no efficacy percentages
the page cannot back).

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/AiForLandscapers.tsx` (new file, under 330 lines) renders at `/ai-for-landscapers`, modeled 1:1 on `src/pages/AiForElectricians.tsx` (ticket 0034, the closest peer in code shape). The page has a hero with a landscaping-specific H1, three pain-point cards (no-shows on spring-cleanup quotes, slow maintenance-contract bid turnaround, missed review windows after a finished install), a STATS row, two demo cards both routing to the existing `/homeservices/demo/lead-responder` and `/homeservices/demo/estimate` routes, and a single CTA section. Every claim is defensible: no invented client names, no fabricated efficacy percentages, no dollar figures the page cannot back from `src/data/homeservicesPricing.ts`.
- [ ] The page emits TWO JSON-LD blocks inside the existing `<Helmet>` head: (1) a `BreadcrumbList` (Home -> AI for Landscapers) using the same shape as `AiForElectricians.tsx` `BREADCRUMB_SCHEMA`, and (2) a sibling `Service` block with `@type: 'Service'`, `name: 'AI for Landscapers'`, `serviceType: 'AI Automation for Landscape Contractors'`, `areaServed: { '@type': 'Country', name: 'United States' }`, `provider` pointing to the DigitalCraft Organization, and `description` mirroring the page's `META_DESCRIPTION` constant (per the 2026-05-25 mirror-source rule).
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/*-jsonld.spec.ts` AND every existing `tests/e2e/ai-for-*.spec.ts` for a `=== 'BreadcrumbList'` predicate AND a `=== 'Service'` predicate to confirm no existing spec asserts "exactly one BreadcrumbList block site-wide" or "exactly one Service block site-wide." The grep result is documented in the Implementation log. The five existing trade-page specs each assert per-URL scoped BreadcrumbList and Service blocks, so the collision risk is structurally low, but the grep is mandatory.
- [ ] The new route is registered in `src/App.tsx` next to the existing `/ai-for-painters` and `/ai-for-electricians` routes. The implementer adds `/ai-for-landscapers` to the `ROUTES` array in `src/data/routes.ts` (the canonical allow-list per the 2026-06-07 src-imports-tests lesson; `tests/e2e/routes.ts` re-exports it so the smoke spec exercises the new page automatically with one line of edit). The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) discovers the new App route automatically and emits a `lastmod` from the commit date.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in any JSON-LD serialized string, and every CTA route resolves to a registered route in `src/data/routes.ts`. The two primary CTAs route to `/homeservices/demo/lead-responder` and `/homeservices/demo/estimate`; the calendly CTA opens in a new tab with `rel="noopener noreferrer"` matching the existing trade-page convention.
- [ ] A new e2e spec at `tests/e2e/ai-for-landscapers.spec.ts` (modeled on `tests/e2e/ai-for-electricians.spec.ts` and `tests/e2e/ai-for-painters.spec.ts`) asserts: the page returns < 400 status, the H1 contains "Landscap" (case-insensitive substring covering "Landscaper" and "Landscaping"), the `meta[name="description"]` content names landscaping (asserted on the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson), the `BreadcrumbList` JSON-LD block is present and names "AI for Landscapers" as the second item, the `Service` JSON-LD block is present with `serviceType` containing "Landscape," both demo CTAs resolve to `/homeservices/demo/*` routes registered in `ROUTES`, the page text contains no `U+2014` code point (asserted via `String.fromCharCode(8212)`), and dark mode renders cleanly.
- [ ] No `/api/` change, no new hostname (the only external link is the existing `calendly.com/mutaaf` URL already used on every trade page), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/data/homeservicesPricing.ts` (the existing `LANDSCAPING_SERVICES` array is reused verbatim by the existing demos). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta` stay green; `npm run typecheck` stays clean. The new spec passes; every pre-existing `tests/e2e/ai-for-*.spec.ts` stays green.

## Out of scope

- A landscaping-specific demo (e.g. an irrigation-system-only
  lead-responder variant). The page reuses the two existing
  home-services demos verbatim; a landscaping-specific demo is
  a separate ticket and not justified before the page proves
  demand.
- Adding `/ai-for-landscapers` to the `index.html` SEO Pilot
  `pages` table. That is its own SEO-hygiene ticket and applies
  uniformly to all five existing trade pages, none of which are
  in the table either per the 2026-05-25 SEO Pilot lesson. Out
  of scope here.
- Emitting a `FAQPage` JSON-LD on this page. None of the five
  existing trade pages emit one and the page does not yet have
  a visible FAQ section to mirror; adding both at once would
  exceed the 200-line diff budget. Out of scope here (a
  separate ticket could mirror the 0012 pattern to a chosen
  trade page later).
- Adding a "switch from Jobber" or "switch from ServiceTitan"
  callout on the page. The two existing compare pages (tickets
  0021 / 0028) own that funnel; cross-linking is its own small
  ticket once both surfaces exist.
- Internationalization (`inLanguage` fields on schema, locale
  switcher). The page is English-only; an i18n pass is a
  separate cross-cutting ticket.
- A landscaping-specific blog post. Blog content ships through
  the existing `src/data/blogPosts.ts` pipeline and is gated
  by `check-blog-dates`; a trade-themed post is its own
  content ticket.
- A landscaping-specific testimonial or case study. The
  AGENTS.md Hard NO on invented testimonials applies; a real
  testimonial ships through its own dated blog post via the
  existing pipeline once a real landscaping client agrees to
  attribution.
- Cross-linking the new page from the existing five trade
  pages or from the `/homeservices` vertical page. Internal-
  link clusters are their own small ticket once the page
  exists and ranks.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/AiForLandscapers.tsx` (under 330 lines). Copy
  `src/pages/AiForElectricians.tsx` (ticket 0034) end-to-end as
  the starting frame, then swap every "Electrical" / "Electrician"
  string for the landscaping equivalent. Keep the same module-
  level mirror-source constants: `HERO_H1`, `META_DESCRIPTION`,
  `SERVICE_DESCRIPTION` (per the 2026-05-25 mirror-source rule
  the description used in the Helmet meta tag and the
  `SERVICE_SCHEMA.description` MUST be the same `META_DESCRIPTION`
  constant). Swap the three `PAIN_POINTS` entries to the three
  landscaping-specific pains named in the User story. Swap the
  two `DEMO_CARDS` entries' copy to landscaping language but
  keep both `to:` paths pointing at the existing
  `/homeservices/demo/lead-responder` and
  `/homeservices/demo/estimate` routes; do not invent new demo
  routes. Swap `STATS` labels to landscaping context (after-
  hours and weekend lead capture, average AI reply time, demos
  built for landscaping workflows, time-from-signup-to-go-live)
  but keep the four numeric values unchanged so the trade
  family stays self-consistent. Trade label for the icon chip
  reads exactly "Built for landscape contractors."
- New route in `src/App.tsx`: import `AiForLandscapers` and
  add `<Route path="/ai-for-landscapers" element={<AiForLandscapers />} />`
  next to the `/ai-for-painters` and `/ai-for-electricians`
  routes. Mirror the lazy-loading convention of the adjacent
  trade pages (grep `lazy(` in `src/App.tsx` first; the
  existing five trade pages are not lazy-loaded, so the new
  page should match).
- Per the 2026-06-07 src-imports-tests lesson, add
  `/ai-for-landscapers` to the `ROUTES` array in
  `src/data/routes.ts` (the canonical allow-list); do NOT add
  it directly to `tests/e2e/routes.ts`. The re-export at
  `tests/e2e/routes.ts` line 8 picks it up automatically. The
  smoke spec at `tests/e2e/smoke.spec.ts` iterates `ROUTES`
  and asserts each renders without error.
- Per the 2026-05-30 second-@type lesson, grep
  `tests/e2e/*-jsonld.spec.ts` and `tests/e2e/ai-for-*.spec.ts`
  for both `=== 'BreadcrumbList'` and `=== 'Service'`
  predicates BEFORE writing code. Confirm no spec asserts
  "exactly one of either @type site-wide" (the existing
  patterns are per-URL scoped). Document the grep result in
  the Implementation log so the deviation, if any, is
  auditable.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e spec
  asserts the Helmet-managed `meta[name="description"]`
  content directly (reading the LAST `meta[name="description"]`
  element per the 2026-05-25 Helmet-appends lesson), NOT
  `page.toHaveTitle()`. The route is not in the
  `index.html` SEO Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every string in the page
  module (the H1, the META_DESCRIPTION, the SERVICE_DESCRIPTION,
  the three pain-point titles and descs, the two demo-card
  titles and descs, the STATS labels, the JSON-LD strings, the
  CTA labels, the footer disclaimer) uses hyphens.
  Self-Review greps the diff for `String.fromCharCode(8212)`
  before pushing.
- `tests/e2e/ai-for-landscapers.spec.ts` (new) - one spec per
  acceptance box. Model end-to-end on
  `tests/e2e/ai-for-electricians.spec.ts` (the closest peer).
  JSON-LD case: read all `script[type="application/ld+json"]`
  blocks, filter to `@type === 'BreadcrumbList'`, assert
  exactly one block on this URL names "AI for Landscapers"
  in the second `ListItem`; filter to `@type === 'Service'`,
  assert exactly one block on this URL has
  `serviceType` containing "Landscape." No-em-dash case:
  read both the rendered text and the JSON-LD serialized
  strings; assert neither contains `String.fromCharCode(8212)`.
  Dark-mode case: apply
  `document.documentElement.classList.add('dark')` and assert
  the H1 renders. CTA case: locate the two demo-card CTAs
  via `data-testid="landscapers-demo-cta"` (added to the
  CTA anchors in the new page) and assert each `href`
  resolves to a `/homeservices/demo/*` path present in the
  `ROUTES` array imported from `tests/e2e/routes.ts`.
- Per the 2026-05-22 two-PR ship lesson, ship will need a
  follow-up `chore/0041-ship-status` PR after the feat PR
  merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to `shipped` together;
  run `node scripts/check-backlog.mjs` before pushing the
  second PR so the file and index never drift mid-flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, and the existing
  `useContent` hook plus `trackCTAClick` helper. Schema
  migration: no. Privacy/security surface change: no - the
  page is static marketing copy and emits no new network
  calls; the only external link is the existing calendly
  URL already disclosed on `/trust` per ticket 0018.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-06-09 - branch `feat/0041-ai-for-landscapers-landing-page` opened off fresh `origin/main`; status flipped to `in-progress` in the ticket and the README index together (`node scripts/check-backlog.mjs` green).
- 2026-06-09 - per the 2026-05-30 second-@type lesson, greped every existing `tests/e2e/*-jsonld.spec.ts` AND `tests/e2e/ai-for-*.spec.ts` for `=== 'BreadcrumbList'` and `=== 'Service'` predicates. All "exactly one" assertions over both @types are per-URL scoped (each spec navigates to its own URL first, then asserts one matching block in that page's DOM); none assert "exactly one of either @type site-wide." Adding new BreadcrumbList and Service blocks on `/ai-for-landscapers` will not collide with any existing spec.
- 2026-06-09 - failing test added in `tests/e2e/ai-for-landscapers.spec.ts`, modeled on `tests/e2e/ai-for-electricians.spec.ts`.
- 2026-06-09 - implemented `src/pages/AiForLandscapers.tsx` plus route in `src/App.tsx` and `/ai-for-landscapers` in `src/data/routes.ts` (re-exported automatically by `tests/e2e/routes.ts`).
- 2026-06-09 - full local gate green: lint, typecheck, check-links, check-images, check-meta, check-blog-dates, check-backlog, build.
