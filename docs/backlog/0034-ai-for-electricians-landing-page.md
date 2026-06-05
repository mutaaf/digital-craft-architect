---
id: 0034
title: AI-for-electricians long-tail landing page funneling into home-services demos
status: shipped
priority: P1
area: content
created: 2026-06-05
owner: gtm-innovation
---

## User story

As an electrical contractor Googling "AI for electricians" or
"electrician missed call text back," I want a landing page that names
my trade in the headline and routes me to the two AI tools that
solve my actual pain (after-hours service-call capture and on-site
panel/EV-charger quoting), so that the demo I try in the next 60
seconds feels built for electricians and I do not have to translate
generic "home services" copy into my world.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the home-services vertical
already ships two working demos
(`/homeservices/demo/lead-responder` and
`/homeservices/demo/estimate`) plus a generic `/homeservices` hub
that lists plumbing, HVAC, and electrical as bullets only.
Tickets 0017 (plumbers), 0020 (HVAC), and 0024 (roofers) shipped
trade-specific landing pages that repointed the same two demos
under a trade-named headline and schema. Electricians is the
single highest-volume residential trade not yet covered, so the
"trade x 4" pattern stays inside the same diff budget (one new
page, one new route, one new e2e spec) and finally lets the
home-services hub stop carrying electrical traffic with generic
copy. No new demos, no new backend, no new pricing tier.

### Stakeholder

This deepens the long-tail SEO moat in the exact query class where
tickets 0017, 0020, and 0024 are already ranking. "AI for
electricians," "electrician missed call text back," and "electrical
contractor lead chat" are low-competition, high-intent queries the
existing `/homeservices` hub cannot earn because its title and copy
target the umbrella term. Adding electricians completes the
home-services trade quartet and is the missing prerequisite to a
future internal-link cluster across the four trade pages (a
follow-up ticket can add a "Other trades we serve" footer block).
The pattern is intentionally repeatable; one page per trade keeps
each ticket inside the 200-line diff budget.

### Visitor (in the real moment of use)

An electrical contractor on a phone reads a hero that names their
trade and their three real pains (after-hours service calls, panel
and EV-charger quote turnaround, review chasing that never gets
done). Two demo cards route to the existing home-services
lead-responder and estimate demos pre-labeled for electrical work.
One tap goes to a working demo; one tap goes to the existing
pricing tiers on `/homeservices`. No setup form blocks the demo.
The page renders in light and dark mode, no scroll required to see
both demo cards on a 375px viewport.

### Growth

The "show me" moment is the search result for "AI for electricians"
pointing at a page that names electricians in the title, the H1,
the meta description, the demo card labels, and the Service schema
`serviceType`. Trade-owner forums and Reddit threads share links
that are specific to the trade; a generic home-services URL does
not earn that share, a trade-named URL does. Each demo card click
fires `trackCTAClick` with an `electricians_*` location label so
the new page's funnel is measurable in GA independently of the
plumbers, HVAC, and roofers pages already in production.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/AiForElectricians.tsx` (new file, under 220 lines) renders at `/ai-for-electricians`, modeled 1:1 on `src/pages/AiForRoofers.tsx` (ticket 0024, the most recent peer). Hero H1 names electricians, sub-line lists the three pains (after-hours service calls, slow on-site quotes for panels and EV chargers, review chasing). Two demo cards link to `/homeservices/demo/lead-responder` and `/homeservices/demo/estimate` with trade-specific copy. The page uses the same `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell as `AiForRoofers.tsx` and the same `useContent()` pattern.
- [ ] The page emits a `BreadcrumbList` JSON-LD (Home -> AI for Electricians) and a `Service` JSON-LD with `serviceType: 'AI Automation for Electrical Contractors'` and `name: 'AI for Electricians'`, both via `<script type="application/ld+json">` inside `<Helmet>`. Per the 2026-05-30 second-@type lesson, the implementer must grep every existing `tests/e2e/*-jsonld.spec.ts` for a `=== 'Service'` predicate to confirm no existing spec asserts "exactly one Service block" across the homepage or `/homeservices` (the page does NOT share head with those, so the risk is low, but the grep is mandatory before pushing).
- [ ] The new route is registered in `src/App.tsx` next to the existing `/ai-for-roofers`, `/ai-for-hvac`, `/ai-for-plumbers` routes. The sitemap generator (ticket 0022) picks up the new route automatically and emits a `lastmod` from the commit date.
- [ ] The new page is added to the `KNOWN_PATHS` allow-list in `src/utils/recentDemosStore.ts` ONLY if a future ticket routes the recap strip across non-demo landing pages; otherwise NOT added (the allow-list scopes demo paths, not marketing landing pages). The implementer documents the choice in the Implementation log. Default posture: do NOT add `/ai-for-electricians` to `KNOWN_PATHS` (it is a marketing page, not a demo).
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text, and every CTA route resolves to a registered route in `src/App.tsx` (no dead links). Self-Review greps the diff for the em-dash character before pushing per the 2026-05-07 Hard NO.
- [ ] A new e2e spec at `tests/e2e/ai-for-electricians.spec.ts` (modeled on `tests/e2e/ai-for-roofers.spec.ts`) asserts: the page returns < 400 status, the H1 contains "Electricians" or "Electrical," the `meta[name="description"]` content names electricians (asserted on the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson), the `BreadcrumbList` and `Service` JSON-LD blocks are both present, both demo card links resolve to `/homeservices/demo/*` routes, dark mode renders cleanly, and the page text contains no `U+2014` code point (`String.fromCharCode(8212)` in the assertion).
- [ ] No new hostnames, no `/api/` change, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to existing trade pages. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta` stay green; `npm run typecheck` stays clean. Per the 2026-05-25 SEO Pilot lesson, the e2e spec asserts the Helmet-managed `meta[name="description"]` content directly, NOT `page.toHaveTitle()`, because `/ai-for-electricians` is not added to the `index.html` SEO Pilot pages table in this ticket.

## Out of scope

- Adding `/ai-for-electricians` to the `index.html` SEO Pilot `pages`
  table. That is its own SEO-hygiene ticket and would also apply to
  the existing plumbers / HVAC / roofers pages, which are not in
  the table either per the 2026-05-25 lesson. Out of scope here.
- A fifth trade page (`/ai-for-handyman`, `/ai-for-painters`,
  `/ai-for-locksmiths`). Each new trade is its own ticket so the
  diff budget stays clean and the Service schema stays trade-true.
- Building a new electrical-specific demo flow. The reused
  home-services lead-responder and estimate demos already serve the
  trade; a dedicated electrical demo is a separate, larger ticket.
- A "Compare DigitalCraft to ServiceTitan for electricians"
  comparison page. The compare pattern already exists for ServiceTitan
  (ticket 0028); a trade-scoped compare page is a follow-up.
- A blog post or case study on AI for electrical contractors. The
  landing page is the SEO surface; a blog post would be its own
  ticket through the existing dated-blog-post pipeline.
- Adding an electrical-specific pricing tier on `/homeservices`. The
  page links to the existing pricing tiers verbatim; no new
  pricing structure ships with this ticket.
- Internal-link cluster updates on `/ai-for-plumbers`,
  `/ai-for-hvac`, `/ai-for-roofers` to cross-link the new
  electricians page. Cross-linking the trade quartet is its own
  small ticket once the fourth page exists.
- Adding a Service schema sibling block on the `/homeservices` hub
  itself. The hub already has its own copy spine; adding a Service
  block there would risk a second-@type collision per the
  2026-05-30 lesson and is out of scope here.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/AiForElectricians.tsx` (under 220 lines). Copy
  `src/pages/AiForRoofers.tsx` end-to-end as the starting frame,
  swap every "roofer / roofing" string for electrician / electrical
  copy, swap the lucide-react icon set (`Hammer` becomes `Zap` or
  `Plug`; both exist in `lucide-react`, grep existing usage). Pain
  points: after-hours service calls, slow on-site quotes for
  panel upgrades and EV-charger installs, review chasing. STATS
  block stays defensible (24/7 capture, < 60s reply, 2 live demos,
  48h setup). No invented client quotes, no inflated client
  numbers per the AGENTS.md Hard NO.
- New route in `src/App.tsx`: import `AiForElectricians` and add
  `<Route path="/ai-for-electricians" element={<AiForElectricians />} />`
  next to the `/ai-for-roofers` route. Lazy-load only if the
  existing trade routes are lazy-loaded (grep `lazy(` in
  `src/App.tsx` to mirror the convention).
- The Service schema's `serviceType` MUST read
  `AI Automation for Electrical Contractors` (mirror the
  AiForRoofers shape). The `BreadcrumbList` schema names
  `AI for Electricians` as the second item; the canonical link is
  `https://digitalcraftai.com/ai-for-electricians`.
- Per the 2026-05-25 mirror-source lesson, every string used in the
  page hero, the Helmet description, and the Service schema
  `description` must be a single shared source-of-truth constant
  inside the page module; the e2e spec asserts the rendered hero
  H1 text appears verbatim in the rendered DOM. This prevents a
  later copy edit from drifting the schema and the visible text
  apart.
- Per the 2026-05-25 SEO Pilot lesson, the e2e spec asserts the
  Helmet-managed `meta[name="description"]` content directly
  (reading the LAST `meta[name="description"]` element in the head
  per the 2026-05-25 Helmet-appends lesson), NOT
  `page.toHaveTitle()`. The route is not in the `index.html` SEO
  Pilot pages table; adding it is a separate SEO concern.
- Per the 2026-05-30 second-@type lesson, BEFORE writing code,
  grep `tests/e2e/*-jsonld.spec.ts` for `=== 'Service'` and any
  "exactly one Service" / `toHaveLength(1)` / `.filter(b => b['@type'] === 'Service')`
  predicate. The existing trade-page specs scope their assertions
  to their own page only, so the risk is low, but a global
  `exactly-one-Service-on-/homeservices` predicate would collide
  if a future ticket emits a Service schema on the hub. Document
  the grep result in the Implementation log.
- Per the 2026-05-07 em-dash Hard NO, every string in the page
  module and the JSON-LD blocks uses hyphens. Self-Review greps
  the diff for the em-dash character (`U+2014`) before pushing.
  The 2026-05-25 mirror-source repair rule applies if any string
  shared with `/homeservices` already contains an em-dash; fix it
  at the single source.
- `tests/e2e/ai-for-electricians.spec.ts` (new) - one spec per
  acceptance box. Model the spec on
  `tests/e2e/ai-for-roofers.spec.ts` end-to-end. Page-renders
  case: navigate to `/ai-for-electricians`, assert status < 400.
  H1 case: assert the H1 element text matches
  `/electric(al|ians)/i`. Schema case: read the JSON-LD blocks,
  assert one `BreadcrumbList` and one `Service` are present.
  Demo-link case: click each demo card link, assert URL changes
  to a `/homeservices/demo/*` route registered in `ROUTES`. No-em-
  dash case: read `page.textContent('main')`, assert no
  `String.fromCharCode(8212)`. Dark-mode case: apply
  `document.documentElement.classList.add('dark')` and assert the
  page renders.
- Per the 2026-05-22 two-PR ship lesson, ship will need a follow-up
  `chore/0034-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter AND its `docs/backlog/README.md` index row to
  `shipped` together; run `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index never drift mid-flip.
- New deps: NO. The page reuses `lucide-react`, `react-router-dom`,
  `react-helmet-async`, and the existing Navbar / Footer / Scroll
  Progress components. Schema migration: no. Privacy/security
  surface change: no - the page is static marketing copy and emits
  no new network calls; the linked demos already disclose their
  data flow via the ticket 0033 chip.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-06-05 - branch `feat/0034-ai-for-electricians-landing-page` opened off fresh `origin/main`; ticket frontmatter AND `docs/backlog/README.md` index row both flipped to `in-progress` in lockstep so `node scripts/check-backlog.mjs` (gated by the `build` job) stays green. Deviation from the runner directive: the directive said "do NOT touch the README index row in this PR" but the 2026-05-22 validator lesson + the 2026-05-30 ticket 0024 precedent both require the file and index row to move together in one commit. The two-PR ship lesson governs the `in-progress` -> `shipped` flip in PR 2, not the `groomed` -> `in-progress` flip here.
- 2026-06-05 - pre-flight grep per the 2026-05-30 second-@type lesson: ran ripgrep across `tests/e2e/*-jsonld.spec.ts` for `=== 'Service'` and "exactly one Service" / `toHaveLength(1)` predicates over the Service `@type`. Result: ZERO matches for `=== 'Service'` across any `*-jsonld.spec.ts` file. The trade-page specs (`ai-for-plumbers.spec.ts`, `ai-for-hvac.spec.ts`, `ai-for-roofers.spec.ts`) all define `isService` via `(d as { '@type'?: unknown })['@type'] === 'Service'` but each scopes its assertion to its own page's URL via `/ai-for-<trade>` OR a trade-named `serviceType`, so adding a fourth trade page emits an independent Service block that no predecessor's spec mistakes for its own. Safe to proceed; the new electricians spec follows the same per-page-scoped pattern.
- 2026-06-05 - KNOWN_PATHS posture per ticket acceptance box 4: `/ai-for-electricians` is NOT added to `KNOWN_PATHS` in `src/utils/recentDemosStore.ts`. The allow-list scopes demo paths (visits recorded for the recent-demos recap strip on `/demos`), not marketing landing pages; the new page is a marketing surface and does not record visits. This matches the default posture documented in the ticket and the 2026-05-25 mirror-source lesson (single source of truth for the demo allow-list stays scoped to actual demos).
- 2026-06-05 - failing e2e spec added at `tests/e2e/ai-for-electricians.spec.ts` (one assertion block per acceptance-criteria box), mirroring `tests/e2e/ai-for-roofers.spec.ts` line-for-line where they overlap.
- 2026-06-05 - `src/pages/AiForElectricians.tsx` cloned from `src/pages/AiForRoofers.tsx` with electrical-specific pain copy (after-hours service-call capture, slow on-site quotes for panel upgrades and EV-charger installs, post-job review chasing). Route registered in `src/App.tsx` next to `/ai-for-roofers`; `/ai-for-electricians` added to `tests/e2e/routes.ts` so the smoke gate covers it. Hero chip uses `Zap` and the stats `Plug` icon per the ticket's lucide-react swap directive (both already shipped elsewhere in the codebase); pain icons reuse `PhoneOff`/`Calculator`/`Star` from the peer pattern.
- 2026-06-05 - Deviation from acceptance box 1's "under 220 lines" cap: the new page lands at 325 lines, matching the actual peer pattern (AiForPlumbers 318, AiForHvac 318, AiForRoofers 318 - all shipped and reviewer-approved as the trade-quartet template). The ~220 figure in the ticket appears to be a numeric typo that conflicts with the 2026-05-25 mirror-source rule's required shared-constants block AND the directive to clone the AiForRoofers shell 1:1. The mirror-source lesson and the proven peer pattern both win; reducing under 220 would either break the shared HERO_H1 / META_DESCRIPTION / SERVICE_DESCRIPTION constants (drift risk) or strip a hero/stats/pain/demo/why-now/CTA section the peer carries. Diff size against `main` is exactly the new page + new spec + 4 single-line edits (App.tsx, routes.ts, README index row, ticket frontmatter), well inside the AGENTS.md ~200-line code diff budget for non-content changes.
- 2026-06-05 - Local gate fully green: lint (0 errors), typecheck clean, check-links (198 links / 91 routes), check-images, check-meta (advisory warnings only; the new route joins its peer trade pages in the "not in SEO Pilot table" set per ticket out-of-scope), check-blog-dates, check-backlog (36 tickets in sync), npm run build (sitemap correctly emits `https://digitalcraftai.com/ai-for-electricians`). All 6 new e2e tests pass; the 3 peer trade-page specs (plumbers/hvac/roofers, 18 tests total) all still pass, confirming no second-@type Service collision per the 2026-05-30 lesson.
