---
id: 0037
title: AI-for-painters long-tail landing page funneling into home-services demos
status: in-progress
priority: P1
area: content
created: 2026-06-07
owner: gtm-innovation
---

## User story

As a residential or commercial painting-contractor owner Googling
"AI for painters," "painting estimator AI," or "painter missed call
text back," I want a landing page that names my trade in the
headline and routes me to the two AI tools that solve my actual
pain (after-hours estimate-request capture and on-site interior or
exterior quoting), so that the demo I try in the next 60 seconds
feels built for painters and I do not have to translate generic
"home services" copy into my world.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the home-services vertical
already ships two working demos
(`/homeservices/demo/lead-responder` and
`/homeservices/demo/estimate`) plus a generic `/homeservices` hub.
Tickets 0017 (plumbers), 0020 (HVAC), 0024 (roofers), and 0034
(electricians) shipped trade-specific landing pages that repointed
the same two demos under a trade-named headline and schema. The
trade quartet template is proven; painters is the next-highest
residential-trade gap with high seasonal query volume (interior in
winter, exterior in spring and summer), so the same one-new-page
diff slot adds a fifth landing page that finally captures the
"AI for painters" query class without inventing a new demo, a new
backend, or a new pricing tier.

### Stakeholder

This deepens the long-tail SEO moat in the exact query class where
tickets 0017, 0020, 0024, and 0034 already rank. "AI for painters,"
"painting contractor lead chat," and "painter estimating software AI"
are low-competition, high-intent queries the existing
`/homeservices` hub cannot earn because its title and copy target
the umbrella term. Adding painters as the fifth trade landing page
also unblocks a future "Other trades we serve" internal-link
cluster across the five pages (out of scope here, pre-authorized
as a follow-up). The pattern stays inside the 200-line diff budget
per page.

### Visitor (in the real moment of use)

A painting-contractor owner on a phone reads a hero that names
their trade and their three real pains (after-hours estimate
requests during peak seasonal demand, slow on-site interior or
exterior quote turnaround when the homeowner is still standing
there, post-job review chasing that never gets done). Two demo
cards route to the existing home-services lead-responder and
estimate demos pre-labeled for painting work. One tap goes to a
working demo; one tap goes to the existing pricing tiers on
`/homeservices`. No setup form blocks the demo. The page renders
in light and dark mode, no scroll required to see both demo cards
on a 375px viewport.

### Growth

The "show me" moment is the search result for "AI for painters"
pointing at a page that names painters in the title, the H1, the
meta description, the demo card labels, and the Service schema
`serviceType`. Painting-contractor forums and Reddit threads
(`r/paintingbusiness`, `PaintTalk`) share links that are specific
to the trade; a generic home-services URL does not earn that
share, a trade-named URL does. Each demo card click fires
`trackCTAClick` with a `painters_*` location label so the new
page's funnel is measurable in GA independently of the four trade
pages already in production.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/AiForPainters.tsx` (new file, under 330 lines, matching the actual peer pattern of 318-325 lines documented in ticket 0034's Implementation log deviation note) renders at `/ai-for-painters`, modeled 1:1 on `src/pages/AiForElectricians.tsx` (ticket 0034, the most recent peer). Hero H1 names painters, sub-line lists the three pains (after-hours estimate-request capture during peak season, slow on-site interior and exterior quotes, post-job review chasing). Two demo cards link to `/homeservices/demo/lead-responder` and `/homeservices/demo/estimate` with trade-specific copy. The page uses the same `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell as `AiForElectricians.tsx` and the same `useContent()` pattern.
- [ ] The page emits a `BreadcrumbList` JSON-LD (Home -> AI for Painters) and a `Service` JSON-LD with `serviceType: 'AI Automation for Painting Contractors'` and `name: 'AI for Painters'`, both via `<script type="application/ld+json">` inside `<Helmet>`. Per the 2026-05-30 second-@type lesson, the implementer must grep every existing `tests/e2e/*-jsonld.spec.ts` AND `tests/e2e/ai-for-*.spec.ts` for a `=== 'Service'` predicate to confirm no existing spec asserts "exactly one Service block" across the homepage, `/homeservices`, or any sibling trade page (the trade-quartet specs scope assertions to their own URL per the 0034 grep result, so the risk is low, but the grep is mandatory and the result is documented in the Implementation log).
- [ ] The new route is registered in `src/App.tsx` next to the existing `/ai-for-electricians`, `/ai-for-roofers`, `/ai-for-hvac`, `/ai-for-plumbers` routes. The sitemap generator (ticket 0022) picks up the new route automatically and emits a `lastmod` from the commit date. The implementer adds `/ai-for-painters` to the `ROUTES` array in `tests/e2e/routes.ts` (the smoke spec's static route list) so the existing smoke spec exercises the new page.
- [ ] The new page is NOT added to the `KNOWN_PATHS` allow-list in `src/utils/recentDemosStore.ts`. Per the 0034 Implementation log precedent, the allow-list scopes demo paths (visits recorded for the recent-demos recap strip on `/demos`), not marketing landing pages; the new page is a marketing surface and does not record visits. The implementer documents the choice in the Implementation log.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text, and every CTA route resolves to a registered route in `src/App.tsx` (no dead links). Self-Review greps the diff for the em-dash character before pushing per the 2026-05-07 Hard NO.
- [ ] A new e2e spec at `tests/e2e/ai-for-painters.spec.ts` (modeled on `tests/e2e/ai-for-electricians.spec.ts`) asserts: the page returns < 400 status, the H1 contains "Painters" or "Painting" (case-insensitive substring), the `meta[name="description"]` content names painters (asserted on the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson), the `BreadcrumbList` AND `Service` JSON-LD blocks are both present, both demo card links resolve to `/homeservices/demo/*` routes registered in `ROUTES`, dark mode renders cleanly, and the page text contains no `U+2014` code point (`String.fromCharCode(8212)` in the assertion).
- [ ] No new hostnames, no `/api/` change, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to existing trade pages, no cross-linking inside the four sibling pages. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta` stay green; `npm run typecheck` stays clean. Per the 2026-05-25 SEO Pilot lesson, the e2e spec asserts the Helmet-managed `meta[name="description"]` content directly, NOT `page.toHaveTitle()`, because `/ai-for-painters` is not added to the `index.html` SEO Pilot pages table in this ticket.

## Out of scope

- Adding `/ai-for-painters` to the `index.html` SEO Pilot `pages`
  table. That is its own SEO-hygiene ticket and would also apply
  to the existing trade pages, which are not in the table either
  per the 2026-05-25 lesson. Out of scope here.
- A sixth trade page (`/ai-for-landscapers`, `/ai-for-handyman`,
  `/ai-for-locksmiths`). Each new trade is its own ticket so the
  diff budget stays clean and the Service schema stays
  trade-true.
- Building a new painting-specific demo flow (interior color
  picker, square-footage scanner, etc.). The reused home-services
  lead-responder and estimate demos already serve the trade; a
  dedicated painting demo is a separate, larger ticket.
- A blog post or case study about a real painting contractor. No
  invented client names, no fake testimonials per the AGENTS.md
  Hard NO; a real testimonial would ship its own dated blog post
  through the existing pipeline.
- Adding a painting-specific pricing tier on `/homeservices`. The
  page links to the existing pricing tiers verbatim; no new
  pricing structure ships with this ticket.
- Internal-link cluster updates on `/ai-for-plumbers`,
  `/ai-for-hvac`, `/ai-for-roofers`, and `/ai-for-electricians`
  to cross-link the new painters page. Cross-linking the trade
  quintet is its own small ticket once the fifth page exists.
- Adding a Service schema sibling block on the `/homeservices`
  hub itself. The hub already has its own copy spine; adding a
  Service block there would risk a second-@type collision per the
  2026-05-30 lesson and is out of scope here.
- A "Compare DigitalCraft to Jobber for painters" trade-scoped
  comparison page. The compare pattern already exists for Jobber
  (ticket 0021); a trade-scoped variant is a follow-up.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/AiForPainters.tsx` (under 330 lines per the peer
  pattern). Copy `src/pages/AiForElectricians.tsx` end-to-end as
  the starting frame, swap every "electrician / electrical"
  string for painter / painting copy, swap the lucide-react icon
  set (`Zap`/`Plug` become `Brush` or `Paintbrush` and
  `PaintBucket`; both `Brush` and `PaintBucket` exist in
  `lucide-react`, grep existing usage). Pain points: after-hours
  estimate-request capture during peak season, slow on-site
  interior and exterior quote turnaround, post-job review
  chasing. STATS block stays defensible (24/7 capture, < 60s
  reply, 2 live demos, 48h setup). No invented client quotes, no
  inflated client numbers per the AGENTS.md Hard NO.
- New route in `src/App.tsx`: import `AiForPainters` and add
  `<Route path="/ai-for-painters" element={<AiForPainters />} />`
  next to the `/ai-for-electricians` route. Lazy-load only if
  the existing trade routes are lazy-loaded (grep `lazy(` in
  `src/App.tsx` to mirror the convention - they are NOT lazy
  today, so the new route follows suit).
- The Service schema's `serviceType` MUST read
  `AI Automation for Painting Contractors` (mirror the
  AiForElectricians shape). The `BreadcrumbList` schema names
  `AI for Painters` as the second item; the canonical link is
  `https://digitalcraftai.com/ai-for-painters`.
- Per the 2026-05-25 mirror-source lesson, every string used in
  the page hero, the Helmet description, and the Service schema
  `description` must be a single shared source-of-truth constant
  inside the page module (HERO_H1, META_DESCRIPTION,
  SERVICE_DESCRIPTION); the e2e spec asserts the rendered hero
  H1 text appears verbatim in the rendered DOM. This prevents a
  later copy edit from drifting the schema and the visible text
  apart.
- Per the 2026-05-25 SEO Pilot lesson, the e2e spec asserts the
  Helmet-managed `meta[name="description"]` content directly
  (reading the LAST `meta[name="description"]` element in the
  head per the 2026-05-25 Helmet-appends lesson), NOT
  `page.toHaveTitle()`. The route is not in the `index.html` SEO
  Pilot pages table; adding it is a separate SEO concern.
- Per the 2026-05-30 second-@type lesson, BEFORE writing code,
  grep `tests/e2e/*-jsonld.spec.ts` AND
  `tests/e2e/ai-for-*.spec.ts` for `=== 'Service'` and any
  "exactly one Service" / `toHaveLength(1)` /
  `.filter(b => b['@type'] === 'Service')` predicate. The
  existing trade-quartet specs scope their assertions to their
  own URL via `/ai-for-<trade>` per the 0034 Implementation log,
  so the risk is low, but a global
  `exactly-one-Service-on-/homeservices` predicate would collide
  if a future ticket emits a Service schema on the hub. Document
  the grep result in the Implementation log.
- Per the 2026-05-07 em-dash Hard NO, every string in the page
  module and the JSON-LD blocks uses hyphens. Self-Review greps
  the diff for the em-dash character (`U+2014`) before pushing.
  The 2026-05-25 mirror-source repair rule applies if any string
  shared with `/homeservices` already contains an em-dash; fix
  it at the single source.
- `tests/e2e/ai-for-painters.spec.ts` (new) - one spec per
  acceptance box. Model the spec on
  `tests/e2e/ai-for-electricians.spec.ts` end-to-end.
  Page-renders case: navigate to `/ai-for-painters`, assert
  status < 400. H1 case: assert the H1 element text matches
  `/paint(ers|ing)/i`. Schema case: read the JSON-LD blocks,
  assert one `BreadcrumbList` and one `Service` are present and
  the Service `serviceType` contains "Painting Contractors."
  Demo-link case: click each demo card link, assert URL changes
  to a `/homeservices/demo/*` route registered in `ROUTES`.
  No-em-dash case: read `page.textContent('main')`, assert no
  `String.fromCharCode(8212)`. Dark-mode case: apply
  `document.documentElement.classList.add('dark')` and assert
  the page renders.
- Per the 2026-05-22 two-PR ship lesson, ship will need a
  follow-up `chore/0037-ship-status` PR after the feat PR merges
  to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing the second PR
  so the file and index never drift mid-flip.
- New deps: NO. The page reuses `lucide-react`,
  `react-router-dom`, `react-helmet-async`, and the existing
  Navbar / Footer / ScrollProgress components. Schema migration:
  no. Privacy/security surface change: no - the page is static
  marketing copy and emits no new network calls; the linked
  demos already disclose their data flow via the ticket 0033
  chip.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-06-07 - branch `feat/0037-ai-for-painters` opened off main (commit 42c9b2a). Status flipped groomed -> in-progress in this commit alongside the README index row.
- 2026-06-07 - Per the 2026-05-30 second-@type lesson, grepped `tests/e2e/*-jsonld.spec.ts` and `tests/e2e/ai-for-*.spec.ts` for `=== 'Service'` and any `toHaveLength(1)` / "exactly one Service" predicate. Result: the four trade-quartet specs (`ai-for-plumbers`, `ai-for-hvac`, `ai-for-roofers`, `ai-for-electricians`) each filter Service blocks to their OWN URL via `(s.data.url ?? '').includes('/ai-for-<trade>')` OR a `serviceType` naming their own trade, so a new Service block on `/ai-for-painters` cannot reach those scoped assertions (each spec only navigates to its own URL). No spec asserts "exactly one Service" globally, on `/homeservices`, or on `/`. No predecessor spec edit required.
- 2026-06-07 - Per the 2026-05-25 mirror-source lesson, HERO_H1, META_DESCRIPTION, SERVICE_DESCRIPTION declared as shared constants inside `src/pages/AiForPainters.tsx` so the visible hero text and the Service schema description cannot drift on a future copy edit.
- 2026-06-07 - Per the 2026-05-25 SEO Pilot lesson, the e2e spec asserts the LAST `meta[name="description"]` content (the Helmet-appended one), NOT `page.toHaveTitle()`, because `/ai-for-painters` is intentionally NOT being added to the `index.html` SEO Pilot pages table in this ticket (a separate SEO-hygiene concern per Out of scope).
- 2026-06-07 - Per the 0034 Implementation log precedent, `/ai-for-painters` is NOT added to `KNOWN_PATHS` in `src/utils/recentDemosStore.ts` - the allow-list scopes recap-strip demo paths under `/demos`, not marketing landing pages.
- 2026-06-07 - lucide-react icons confirmed: `Brush` (brush.js) and `PaintBucket` (paint-bucket.js) both ship in the existing `lucide-react` package version, no new dep.
- 2026-06-07 - PR #N opened, CI [pending]
