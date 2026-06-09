---
id: 0042
title: Comparison page "Digital Craft vs Buildertrend" for high-intent construction-software switchers
status: shipped
priority: P1
area: seo
created: 2026-06-09
owner: gtm-innovation
---

## User story

As a residential or light-commercial construction-company owner
who already pays Buildertrend for project management and is
Googling "Buildertrend AI," "Buildertrend alternative,"
"Buildertrend vs AI tools," or "Buildertrend AI add-on" because
my office manager spends two hours a day pasting customer
messages between Buildertrend, my CRM, and SMS, I want one
honest side-by-side page that compares the two products on the
features I actually shop for (project management depth, AI lead
chat, AI voice negotiation, instant estimate generation, review
automation, monthly cost, setup speed), so that I can decide in
two minutes whether Digital Craft is the AI layer next to
Buildertrend or a partial replacement, without sitting through a
Buildertrend renewal call.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the comparison-page
pattern is now proven across nine shipped pages
(`src/pages/compare/{HubSpot,GoHighLevel,Zapier,Make,Intercom,Jobber,ServiceTitan,Podium,HousecallPro}.tsx`)
plus two pre-backlog routes. Buildertrend is the highest-volume
brand search in the residential-construction project-management
category and the next-highest-leverage gap before someone else
writes the comparison page for us. The two most recent shipped
comparison tickets (0035 Podium, 0038 Housecall Pro) cover the
SMS-and-review and field-service-CRM adjacent categories;
construction project management is the third major lane the
existing nine pages do not center and where the
`src/pages/Construction.tsx` vertical traffic naturally
converts. A tenth comparison page modeled on
`src/pages/compare/HousecallPro.tsx` (the most recent peer)
adds one route, one file, one spec, and zero new components.

### Stakeholder

This widens the SEO moat in a query class where the buyer is
at the bottom of the funnel by construction (compare queries
are the highest-converting unpaid search type) and is already
paying real money for the incumbent. Buildertrend pricing
starts in the mid-3-figure monthly range and scales fast; a
buyer Googling "Buildertrend alternative" or "Buildertrend AI
add-on" is signalling either churn intent or budget-pressure
evaluation. The construction vertical page
(`src/pages/Construction.tsx`), the AI-for-painters page
(ticket 0037), the AI-for-roofers page (ticket 0024), and the
AI-for-electricians page (ticket 0034) all overlap with the
Buildertrend buyer profile, so a "vs Buildertrend" page
connects existing top-of-funnel traffic to a bottom-of-funnel
decision artifact. The pattern is intentionally repeatable;
each comparison page is one ticket and stays inside the
200-line diff budget per ticket 0035's measured precedent.

### Visitor (in the real moment of use)

A 12-employee residential contractor on a phone reads a clean
side-by-side table that honestly lists what Buildertrend does
that Digital Craft does not (mature project management,
client portal with daily logs, schedule and Gantt, change
orders, file storage, subcontractor management, integrations
with QuickBooks and Xero) AND what Digital Craft does that
Buildertrend does not at the same price point (live AI voice
negotiation that books, AI lead chat trained on the contractor's
own scraped website, instant estimate generation, 48-hour
setup, no implementation fee). The page does not pretend
Digital Craft replaces project management; it positions
honestly as the AI lead-capture and estimate layer that sits
in FRONT of Buildertrend, with a cleanly-labeled "Best when
paired with Buildertrend" callout. Two CTAs route to
`/construction` pricing and `/construction/demo` so the
visitor can test the claim in one tap.

### Growth

The "show me" moment is the SERP listing for "Buildertrend vs
Digital Craft AI" or "Buildertrend AI alternative" displaying
a real comparison page in the top results, where today there
is only Buildertrend's own marketing, a few Capterra threads,
and the same generic "best construction software" listicles.
Comparison pages get cited in trade-forum threads ("anyone
adding AI on top of Buildertrend?") because they read as
neutral side-by-sides; that is the shareable artifact a
generic construction landing page cannot earn. Each card
click fires `trackCTAClick` with a `compare_buildertrend_*`
location label so the funnel is measurable in GA
independently of the nine existing compare pages.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/compare/Buildertrend.tsx` (new file, under 220 lines) renders at `/compare/buildertrend`, modeled 1:1 on `src/pages/compare/HousecallPro.tsx` (ticket 0038, the most recent peer). The page has a hero, a side-by-side comparison table (rows for AI lead chat, AI voice negotiation, instant estimate generation, review automation, project management depth, client portal, change orders, scheduling, monthly entry price, implementation fee, 48-hour go-live, integrations), a "What Buildertrend does better" honest-acknowledgment block (project management depth, client portal, schedule and Gantt, change orders), a "What Digital Craft does better" four-card differentiator block (AI lead capture, voice negotiation, instant estimate, 48-hour setup), and a "Best when paired with Buildertrend" callout positioning Digital Craft as the AI front-of-funnel layer. Every "DigitalCraft wins" claim is sourced from existing copy in the repo; every "Buildertrend wins" claim is defensible and acknowledges where Buildertrend is genuinely stronger. No inflated client numbers per the AGENTS.md Hard NO.
- [ ] The page emits a `BreadcrumbList` JSON-LD (Home -> Compare -> Digital Craft vs Buildertrend) and uses the same `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell as `HousecallPro.tsx`. Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/*-jsonld.spec.ts` AND every existing `tests/e2e/compare-*.spec.ts` for a `=== 'BreadcrumbList'` predicate to confirm no existing spec asserts "exactly one BreadcrumbList block site-wide" (per-URL scoped assertions are the existing convention, so the risk is structurally low, but the grep is mandatory). The grep result is documented in the Implementation log.
- [ ] The new route is registered in `src/App.tsx` next to the existing `/compare/housecallpro` and `/compare/podium` routes. The implementer adds `/compare/buildertrend` to the `ROUTES` array in `src/data/routes.ts` (the canonical allow-list per the 2026-06-07 src-imports-tests lesson; `tests/e2e/routes.ts` re-exports it, so the smoke spec exercises the new page with one line of edit). The sitemap generator (ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date.
- [ ] Every claim in the comparison table that names a Buildertrend feature, price, or limit cites a publicly-verifiable source via an asterisk footnote at the bottom of the table (e.g. "* Buildertrend pricing as listed on buildertrend.com / pricing, 2026-06-09"). The implementer adds an HTML comment above each footnoted row naming the source URL, so a future editor can re-verify. No invented Buildertrend numbers; per the 2026-05-25 mirror-source-fix rule, if a Buildertrend claim drifts in the future, the asterisk footnote text and the HTML comment URL get fixed together at the single shared source.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or JSON-LD string, and every CTA route resolves to a registered route in `src/data/routes.ts`. The two primary CTAs route to `/construction` (pricing) and `/construction/demo` (demo hub); the table footnotes link to no external pages other than the asterisk-sourced Buildertrend pages, which open in a new tab with `rel="noopener noreferrer"`.
- [ ] A new e2e spec at `tests/e2e/compare-buildertrend.spec.ts` (modeled on `tests/e2e/compare-housecallpro.spec.ts` and `tests/e2e/compare-podium.spec.ts`) asserts: the page returns < 400 status, the H1 contains "Buildertrend" (case-insensitive substring), the `meta[name="description"]` content names Buildertrend (asserted on the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson), the `BreadcrumbList` JSON-LD block is present and names "Compare" and "Buildertrend," both CTAs resolve to `/construction*` routes registered in `ROUTES`, the comparison table renders at least 10 rows (one per feature, each carrying `data-testid="compare-row"` for stable selection), dark mode renders cleanly, and the page text contains no `U+2014` code point (`String.fromCharCode(8212)` in the assertion).
- [ ] No new hostnames in the page's own network surface (the footnoted external links are click-through only and not fetched), no `/api/` change, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to existing compare pages or their specs. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta` stay green; `npm run typecheck` stays clean. Per the 2026-05-25 SEO Pilot lesson, the e2e spec asserts the Helmet-managed `meta[name="description"]` content directly, NOT `page.toHaveTitle()`, because `/compare/buildertrend` is not added to the `index.html` SEO Pilot pages table in this ticket.

## Out of scope

- Adding `/compare/buildertrend` to the `index.html` SEO Pilot
  `pages` table. That is its own SEO-hygiene ticket and applies
  uniformly to all nine existing compare pages, none of which
  are in the table either per the 2026-05-25 lesson. Out of
  scope here.
- Emitting a `Product` or `SoftwareApplication` JSON-LD
  comparing the two products as Offers. The existing nine
  compare pages emit `BreadcrumbList` only; adding richer
  product schema is its own SEO ticket (the 2026-05-30
  second-@type collision risk against the `/demos` hub
  `SoftwareApplication` block per ticket 0030 needs its own
  analysis). Out of scope here.
- A "Switch from Buildertrend in 7 days" migration guide or
  import tool. The page is a top-of-funnel artifact; a
  migration tool is a product feature behind a sales
  conversation.
- A blog post or case study about a customer who switched from
  Buildertrend to Digital Craft. No invented client names, no
  fake testimonials per the AGENTS.md Hard NO; a real
  testimonial ships its own dated blog post through the
  existing pipeline.
- Adding a Buildertrend-specific demo flow. The two CTAs route
  to the existing construction demos; no new demo ships with
  this ticket.
- "Compare Digital Craft to CoConstruct / Procore / Houzz Pro"
  follow-up pages in the same construction-software category.
  Each comparison page is its own ticket so the table claims
  stay defensible and the diff budget stays clean.
- Cross-linking the new compare page from the construction
  vertical page (`src/pages/Construction.tsx`) or from the
  three trade landing pages (painters, roofers, electricians)
  that overlap with the Buildertrend buyer profile. Internal-
  link clusters are their own small ticket once the compare
  page exists and ranks.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/compare/Buildertrend.tsx` (under 220 lines).
  Copy `src/pages/compare/HousecallPro.tsx` (ticket 0038) end-
  to-end as the starting frame; swap every "Housecall Pro" /
  "HousecallPro" string for "Buildertrend," swap the
  comparison-table row set to the Buildertrend-specific
  feature set (AI lead chat, AI voice negotiation, instant
  estimate generation, review automation, project management
  depth, client portal, change orders, scheduling, monthly
  entry price, implementation fee, 48-hour setup, integrations).
  Keep the honest-acknowledgment block: Buildertrend genuinely
  wins on project management depth, client portal, change
  orders, and schedule depth; acknowledge that honestly so
  the page does not read as a hit piece. Add the "Best when
  paired with Buildertrend" callout positioning Digital Craft
  as the AI front-of-funnel layer (the honest position; this
  is the comparison page's distinct angle vs. the existing
  field-service-CRM compares).
- New route in `src/App.tsx`: import `Buildertrend` and add
  `<Route path="/compare/buildertrend" element={<Buildertrend />} />`
  next to the `/compare/housecallpro` and `/compare/podium`
  routes. Mirror the lazy-loading convention of the adjacent
  compare routes (grep `lazy(` in `src/App.tsx` first; the
  existing compare routes are not lazy-loaded today, so the
  new route should match).
- Per the 2026-06-07 src-imports-tests lesson, add
  `/compare/buildertrend` to the `ROUTES` array in
  `src/data/routes.ts` (the canonical allow-list); do NOT
  add it directly to `tests/e2e/routes.ts`. The re-export at
  `tests/e2e/routes.ts` picks it up automatically. The smoke
  spec at `tests/e2e/smoke.spec.ts` iterates `ROUTES` and
  asserts each renders without error.
- Per the 2026-05-30 second-@type lesson, this ticket emits a
  TENTH `BreadcrumbList` on the site (the demo-page breadcrumbs
  ticket 0019 already emits per-demo blocks, and the nine
  existing compare pages each emit one). Grep
  `tests/e2e/*-jsonld.spec.ts` AND `tests/e2e/compare-*.spec.ts`
  for any "exactly one BreadcrumbList" predicate over the
  whole site; the existing assertions are scoped to specific
  URLs so the collision risk is structurally low, but the
  grep is mandatory and the grep result is logged in the
  Implementation log.
- Per the 2026-05-25 mirror-source lesson, every "Buildertrend
  does X / costs Y" claim in the comparison table MUST be
  sourced from a publicly-verifiable URL named in an HTML
  comment above the row. The asterisk footnote in the rendered
  DOM names the URL; the HTML comment names it for the next
  editor. The 2026-05-25 mirror-source-repair rule applies:
  if the claim drifts (Buildertrend changes a price), fix it
  at the single shared source (the row's asterisk footnote
  text and the HTML comment URL) in one edit.
- Per the 2026-05-25 SEO Pilot lesson, the e2e spec asserts
  the Helmet-managed `meta[name="description"]` content
  directly (reading the LAST `meta[name="description"]`
  element in the head per the 2026-05-25 Helmet-appends
  lesson), NOT `page.toHaveTitle()`. The route is not in the
  `index.html` SEO Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every string in the
  page module, the comparison table, the differentiator
  cards, the honest-acknowledgment block, the "Best when
  paired with" callout, and the JSON-LD strings uses hyphens.
  Self-Review greps the diff for `String.fromCharCode(8212)`
  before pushing.
- `tests/e2e/compare-buildertrend.spec.ts` (new) - one spec
  per acceptance box. Model end-to-end on
  `tests/e2e/compare-housecallpro.spec.ts` (the most recent
  peer). Page-renders, H1, schema, CTAs, table-row count
  (>= 10 via `data-testid="compare-row"`), dark mode,
  no-em-dash; all cases mirror the precedent. If the
  existing `data-testid="compare-row"` convention is not
  already on the HousecallPro or Podium rows, add it to
  those rows in the SAME PR per the cross-fleet
  data-testid-scoping pattern established in ticket 0035's
  Engineering notes (a page-wide `getByText` would collide
  with the differentiator card titles that repeat row
  labels).
- Per the 2026-05-22 two-PR ship lesson, ship will need a
  follow-up `chore/0042-ship-status` PR after the feat PR
  merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to `shipped` together;
  run `node scripts/check-backlog.mjs` before pushing the
  second PR so the file and index never drift mid-flip.
- New deps: NO. The page reuses `lucide-react`,
  `react-router-dom`, `react-helmet-async`, and the existing
  Navbar / Footer / ScrollProgress components. Schema
  migration: no. Privacy/security surface change: no - the
  page is static marketing copy and emits no new network
  calls; the only external links are the asterisk-sourced
  Buildertrend documentation pages (click-through only, not
  fetched at render time).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-06-09 - branch `feat/0042-compare-buildertrend` opened off `origin/main` (97a380f); ticket flipped groomed -> in-progress as the bootstrap commit (main is protected). README index row flipped in the same commit per the 2026-05-22 check-backlog rule.
- 2026-06-09 - per the 2026-05-30 second-@type lesson, greppped every `tests/e2e/*-jsonld.spec.ts` AND every `tests/e2e/compare-*.spec.ts` for `=== 'BreadcrumbList'` and "exactly one BreadcrumbList" predicates. Every existing "exactly one BreadcrumbList" assertion is URL-scoped (e.g. `'exactly one BreadcrumbList block expected on /compare/housecallpro'`, `/compare/podium`, `/compare/jobber`, `/compare/servicetitan`, `/quiz`); no site-wide "only one BreadcrumbList anywhere" assertion exists. Adding a tenth BreadcrumbList on `/compare/buildertrend` is structurally safe.
- 2026-06-09 - grepped `lazy(` in `src/App.tsx`: zero matches. Adjacent compare routes are not lazy-loaded; new route matches that convention.
- 2026-06-09 - failing test added at `tests/e2e/compare-buildertrend.spec.ts` (one test per acceptance box, modeled on `compare-housecallpro.spec.ts`).
- 2026-06-09 - implemented `src/pages/compare/Buildertrend.tsx` (under 220 lines), wired the route in `src/App.tsx`, added `/compare/buildertrend` to ROUTES in `src/data/routes.ts` (the canonical allow-list per the 2026-06-07 src-imports-tests lesson). The existing HousecallPro / Podium / Jobber / ServiceTitan rows already carry `data-testid="compare-row"`; no edit needed to those pages.
- 2026-06-09 - PR #N opened, CI [pending].
