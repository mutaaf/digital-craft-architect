---
id: 0103
title: Emit SoftwareApplication JSON-LD on each individual demo page so every demo indexes as a standalone rich-result artifact
status: in-progress
priority: P1
area: seo
created: 2026-09-30
owner: gtm-innovation
---

## User story

As a search-engine user typing an intent-loaded query for a specific
AI capability (a construction owner searching "AI estimate generator
construction demo," a real-estate acquisitions lead searching "AI
property deal analyzer live demo," a home-services owner searching
"AI voice negotiator demo," a franchise operations lead searching
"AI lead response chatbot for contractors"), I want each of Digital
Craft's individual demo pages to surface in search with its own
SoftwareApplication rich result naming exactly what the demo does
and what it costs, so that I can compare Digital Craft's specific
demo against a generic vendor page in the same result set and I can
click through to the exact demo that matches my query without
landing on the hub first.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: ticket 0030 shipped a single
SoftwareApplication JSON-LD block on the `/demos` hub covering the
demo suite as one composite. That block earns rich-result eligibility
for the hub only. The five individual demo pages (`/construction/demo/lead-responder`,
`/construction/demo/estimate`, `/construction/demo/reviews`,
`/construction/demo/property-negotiator`, `/construction/demo/voice-negotiator`)
today emit BreadcrumbList JSON-LD (ticket 0019) but no
SoftwareApplication block of their own, so a query like "AI estimate
generator construction demo" that a crawler could match against a
per-demo SoftwareApplication block instead falls back to the generic
hub block. Adding the missing five blocks is exactly one new data
file (`src/data/perDemoSoftwareApplications.ts`, under 150 lines,
one const-record entry per demo route), one additive Helmet
block on each of the five demo pages reading its own row from that
constant, one new spec file, and zero touch to the shipped 0030
hub block or the shipped 0019 breadcrumb blocks.

### Stakeholder

This widens the moat in the SEO dimension the ticket 0030 hub
SoftwareApplication opened. Every peer demo suite that ships a hub
SoftwareApplication also ships per-demo SoftwareApplication blocks
so each demo is separately crawler-visible; Digital Craft ships the
hub half only. The competitive gap is exactly five rich-result
opportunities the site is leaving on the table, each aligned with a
distinct intent-loaded search query where a generic vendor page is
the current winner. Per the ticket 0030 precedent, every field cited
in a per-demo block is grepable from `src/data/pricing.ts` or the
component's own route definition, so the blocks are defensible per
the AGENTS.md conservative-claims rule (no invented "4.9 star" rating,
no fabricated `aggregateRating`, no invented `downloadUrl`; every
`offers.price` is byte-identical to the visible pricing tier the demo
belongs to). Per the 2026-05-30 second-@type lesson, the sibling
per-demo blocks are URL-scoped to their own `/construction/demo/<slug>`
path via the block's `url` field, so the shipped ticket 0030 hub
block's "exactly one SoftwareApplication on /demos" predicate stays
green (the hub predicate scopes to the `/demos` URL; the per-demo
predicates scope to each demo route).

### User (in the real moment of use)

A construction owner opens Google on his phone during a coffee break
and types "AI estimate generator construction demo." The search
results now show one Digital Craft result whose title is the demo's
H1 ("AI Estimate Generator") and whose rich-result snippet cites the
demo's applicationCategory ("BusinessApplication"), operatingSystem
("Web"), and a pricing anchor "Starting at $0 (free demo)" from the
per-demo block. He taps the result and lands directly on
`/construction/demo/estimate`, skipping the hub and the marketing
landing. The demo loads normally; the breadcrumbs still work; the
"Try the next demo" pinned CTA (ticket 0031) still fires; nothing
about the visible page or the existing shipped analytics events
changes. Per the 2026-09-05 route-code-splitting lesson the new JSON-LD
block loads inside the demo's existing Helmet block so it lands with
the demo's lazy chunk, not in the base HTML.

### Growth

The "show me" moment is a Digital Craft prospect pasting a
`site:digitalcraftai.com` Google result screenshot into a peer chat,
showing five distinct rich snippets (one per demo) where a competitor
vendor gets one hub snippet. That distinct-snippet-per-demo shape is
what Google's SoftwareApplication rich-result documentation calls
out as the primary reward for per-application markup: individual
snippet-eligibility instead of hub-aggregation. It also creates a
measurable long-tail SEO signal: the five per-demo blocks widen the
crawler-facing surface area for "AI [demo capability] demo" queries
by roughly a factor of six (five per-demo blocks plus the hub block)
without adding a single new page, and every block lastmods against
its own component file, so a real change to the demo triggers a
recrawl on that block alone.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests
against this list before writing code.

- [ ] A new data file at `src/data/perDemoSoftwareApplications.ts` (new file, under 150 lines) exports `PER_DEMO_SOFTWARE_APPLICATIONS: readonly PerDemoSoftwareApplication[]` where `PerDemoSoftwareApplication` is `{ demoId: string; route: string; name: string; description: string; applicationCategory: string; operatingSystem: string; priceAnchor: string }`. One entry per shipped demo route (`/construction/demo/lead-responder`, `/construction/demo/estimate`, `/construction/demo/reviews`, `/construction/demo/property-negotiator`, `/construction/demo/voice-negotiator`). Every `route` string is validated at module load against the `ROUTES` allow-list imported from `src/data/routes.ts` (throw with `NOT_IN_ROUTES` on violation, per the 2026-05-28 sitemap-lastmod encoded-invariant lesson pattern already used in `src/data/accessibilityStatement.ts` from ticket 0097). Every `priceAnchor` string is defensible per AGENTS.md: it names a real tier from `src/data/pricing.ts` (grepable at branch head per the 2026-09-12 code-beats-prose lesson) and does NOT invent a "starting at $X" figure the visible pricing does not name. Hyphens not em-dashes per the 2026-05-07 em-dash Hard NO.
- [ ] Each of the five shipped demo page components (`src/pages/construction/LeadResponder.tsx`, `src/pages/construction/EstimateGenerator.tsx`, `src/pages/construction/ReviewSystem.tsx`, `src/pages/construction/PropertyNegotiator.tsx`, `src/pages/construction/VoiceNegotiator.tsx`) gains one additive JSON-LD block emitted inside its existing `<Helmet>` block reading its own row from `PER_DEMO_SOFTWARE_APPLICATIONS` (looked up by the page's route via a shared `getDemoApplicationByRoute()` helper in the same data file). The block's shape mirrors the ticket 0030 hub block verbatim: `{ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name, description, url: 'https://digitalcraftai.com' + route, applicationCategory, operatingSystem, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: priceAnchor } }`. Per the 2026-05-25 mirror-source rule the block reads every field from the constant; no field is hand-rolled inside the component. The block's `description` value is byte-identical to the value emitted into `meta[name="description"]` on the same page (mirror-source assertion in the spec).
- [ ] The shipped ticket 0030 `/demos` hub SoftwareApplication block stays byte-identical. Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'SoftwareApplication'` and `toHaveLength(1)` predicates over SoftwareApplication. The ticket 0030 predicate (`tests/e2e/demos-hub-softwareapplication.spec.ts`) is expected to be URL-scoped to `/demos`; if it is instead a global "exactly one SoftwareApplication on any page" predicate it must be widened in the SAME PR per the 2026-05-30 rule to identify the hub block by its unique field (the hub block's `name` is "Digital Craft AI Demo Suite" or an equivalent hub-only value grepable at branch head) rather than by "the only SoftwareApplication block." The grep result and the widening (if any) are documented in the Implementation log.
- [ ] A new e2e spec at `tests/e2e/per-demo-softwareapplication-jsonld.spec.ts` (modeled on `tests/e2e/demos-hub-softwareapplication.spec.ts` from ticket 0030 and on `tests/e2e/demo-breadcrumbs.spec.ts` from ticket 0019) asserts, using a `gotoDemo(page, route)` helper that waits for the RouteFallback detach per the 2026-09-05 lesson AND for the demo's own H1 to be visible per the 2026-09-10 mount-signal lesson: (1) each of the five demo routes returns 200 and renders exactly one `application/ld+json` block with `@type === 'SoftwareApplication'` (`toHaveCount(1)` per the 2026-09-06 VISIBLE_LIMIT lesson; do NOT use `count > 0`), (2) that block's `url` byte-matches `https://digitalcraftai.com` + the demo route, (3) that block's `name` and `description` byte-match the `PER_DEMO_SOFTWARE_APPLICATIONS[i]` row imported from `src/data/perDemoSoftwareApplications.ts` (mirror-source per the 2026-06-07 rule; do NOT hand-roll a copy of the constant in the spec), (4) that block's `offers.description` byte-matches the row's `priceAnchor`, (5) the demo's rendered `meta[name="description"]` content byte-matches the block's `description` field (mirror-source assertion), (6) the ticket 0019 BreadcrumbList block on the demo stays present (`@type === 'BreadcrumbList'` count is 1), (7) the ticket 0030 hub `/demos` SoftwareApplication block stays present and its `url` is `https://digitalcraftai.com/demos` (regression check that the per-demo blocks do not shadow the hub block), (8) the em-dash assertion filters to the `SoftwareApplication` blocks THIS page owns per the 2026-09-08 em-dash-filter lesson; the rendered per-demo body contains zero `String.fromCharCode(8212)` code points, (9) per the 2026-06-15 attribute-list regex lesson any regex over the stringified block uses `[^>]*`, not `[^/>]*`.
- [ ] Standard box: no `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any demo's business logic or visible copy (the change is purely additive JSON-LD emission inside the existing Helmet block on each of the five demo pages), no edits to the shipped 0030 hub block beyond the URL-scoping widening on the ticket 0030 spec if the grep in the first acceptance box reveals a global predicate. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; every shipped `tests/e2e/demo-*.spec.ts`, `tests/e2e/demos-hub-softwareapplication.spec.ts`, and `tests/e2e/demo-breadcrumbs.spec.ts` all stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem
related.

- Standard anti-goals: no `/api/` changes, no `package.json` changes, no em-dashes in copy, dark-mode required (visible page copy is unchanged so no new dark-mode classes are introduced; JSON-LD blocks are not styled).
- Emitting SoftwareApplication blocks on the real-estate demo routes (`/realestate/demo/*`). Several real-estate demo routes reuse the same components as the construction demos via the shared route table; a per-demo block on the real-estate variant risks duplicating the same block under two URLs and needs its own scoping decision (canonical URL choice, or two distinct blocks with distinct `name` fields). That is its own follow-up ticket after this ships and the analytics show whether the construction routes carry more organic traffic than the real-estate mirrors.
- Emitting a fabricated `aggregateRating` or `review` block on any demo. Every field must be grepable from real data; the site does not have a public review corpus, so `aggregateRating` is forbidden by the AGENTS.md conservative-claims Hard NO.
- Emitting an invented `downloadUrl`, `screenshot`, or `softwareVersion` field. The demos are browser-rendered React routes with no downloadable binary, no shipped screenshot corpus, and no versioned bundle; every field emitted must be grepable from real code or real pricing copy.
- Emitting a `Product` or `Offer` block distinct from the one wired inside the SoftwareApplication `offers` field. The ticket 0075 homepage pricing Product block is the canonical Product artifact on the site; a second Product per demo risks a 2026-05-30 second-@type collision.
- Editing the shipped ticket 0030 hub SoftwareApplication block beyond the URL-scoping widening on the ticket 0030 spec (if the grep in the first acceptance box reveals a global predicate). The hub block's fields stay byte-identical.
- Cross-linking the per-demo blocks from any new hub page, sitemap section, or footer. The per-demo blocks are crawler-facing metadata only; they do not add a visible chip, a card, or a link.
- Adding a per-demo dedicated OG image or Twitter Card. Per-demo OG imagery is its own SEO ticket; the current shipped OG image stays on every demo.
- Injecting a per-demo `keywords` field. `keywords` is deprecated for SoftwareApplication rich-result eligibility per Google's current documentation; adding it would carry no SEO benefit.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev
doesn't have to re-discover the architecture.

- New `src/data/perDemoSoftwareApplications.ts` (under 150 lines). Mirror the shape of `src/data/accessibilityStatement.ts` (ticket 0097): exported readonly array plus a module-load `assertPerDemoSoftwareApplications()` that validates (a) every `route` is in `ROUTES`, (b) every `priceAnchor` string is non-empty and contains a `$` character grepable from `src/data/pricing.ts`, (c) every `demoId` is unique. Export a small helper `getDemoApplicationByRoute(route: string): PerDemoSoftwareApplication | undefined` so each component reads its own row through the helper (avoids five array-index constants scattered across the demos).
- Additive one-block edit to each of the five demo page components (`LeadResponder.tsx`, `EstimateGenerator.tsx`, `ReviewSystem.tsx`, `PropertyNegotiator.tsx`, `VoiceNegotiator.tsx`). Grep each file at branch head per the 2026-09-12 code-beats-prose lesson to locate the existing `<Helmet>` block; add one new `<script type="application/ld+json">{JSON.stringify(demoApplication)}</script>` INSIDE the same Helmet block after the existing BreadcrumbList block from ticket 0019. Do NOT wrap the block in a new component or a new Helmet; every demo already renders a Helmet from the ticket 0019 breadcrumb ship.
- Per the 2026-05-25 mirror-source rule, the `description` field in each row is the same string emitted into the demo's `meta[name="description"]` on the same page. Grep each demo's current Helmet at branch head; if the shipped description differs from the row's description, mirror the shipped one into the constant (code beats prose per the 2026-09-12 rule) and cite the mirror in the Implementation log.
- Per the 2026-05-30 second-@type lesson, BEFORE writing code grep every `tests/e2e/*-jsonld.spec.ts` for `=== 'SoftwareApplication'` and `toHaveLength(1)` / `toHaveCount(1)` / `.filter(b => b['@type'] === 'SoftwareApplication')` predicates. Widen the ticket 0030 hub spec in the SAME PR if the predicate is global; the ticket 0030 hub block's `name` (grep for the hub's `SoftwareApplication` block at `src/pages/Demos.tsx` at branch head) is the unique field.
- Per the 2026-09-05 route-code-splitting lesson, the new spec's `gotoDemo` helper polls for the RouteFallback to detach AND for the demo's own H1 selector to be visible before reading JSON-LD. Every demo has an H1; the demos are all under `<Suspense fallback={<RouteFallback />}>` in `src/App.tsx`.
- Per the 2026-09-06 VISIBLE_LIMIT lesson, the row-count assertion uses `toHaveCount(1)` per demo route over the imported `PER_DEMO_SOFTWARE_APPLICATIONS` length, NOT `count > 0`.
- Per the 2026-06-07 mirror-source-across-src-tests lesson, the spec imports `PER_DEMO_SOFTWARE_APPLICATIONS` from `src/data/perDemoSoftwareApplications.ts` directly, and `ROUTES` from `src/data/routes.ts` directly; do NOT hand-roll copies of either constant.
- Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the em-dash assertion filters the block list to `@type === 'SoftwareApplication'` before iterating; it does NOT loop over every `application/ld+json` block on the page (the homepage Organization block from `index.html` ships site-wide with a legitimate em-dash and must not be flagged per the 2026-09-08 lesson).
- Per the 2026-06-15 attribute-list regex lesson, any regex in the spec over stringified JSON-LD uses `[^>]*`, not `[^/>]*`.
- Per the 2026-09-26 static-file MIME-shim lesson: NOT applicable here, no new static extension is introduced (JSON-LD is inline in the SPA HTML shell). Record "no new static extension shipped" in the Implementation log for auditability.
- `tests/e2e/per-demo-softwareapplication-jsonld.spec.ts` (new), one assertion block per acceptance criterion.
- Per the 2026-05-22 two-PR ship lesson, ship needs a follow-up `chore/0103-ship-status` PR after the feat PR merges to flip the ticket frontmatter AND its `docs/backlog/README.md` index row to `shipped` together; run `node scripts/check-backlog.mjs` before pushing the second PR.
- New deps: NO. The per-demo blocks reuse `react-helmet-async` already imported by every demo. Schema migration: no. Privacy / security surface change: no (the new JSON-LD blocks are crawler-facing metadata only; no new localStorage key, no new outbound request).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-30 - branch `feat/0103-per-demo-softwareapplication-jsonld` opened off fresh `origin/main` at 3e62167; ticket frontmatter + README index row both flipped to `in-progress` in the same first commit; `node scripts/check-backlog.mjs` green.
- 2026-09-30 - failing test added at `tests/e2e/per-demo-softwareapplication-jsonld.spec.ts` (nine assertion blocks, 1:1 with the ticket's nine acceptance-criteria boxes) BEFORE any src edit; imports `PER_DEMO_SOFTWARE_APPLICATIONS` and `getDemoApplicationByRoute` from `src/data/perDemoSoftwareApplications` and `ROUTES` from `src/data/routes` directly per the 2026-06-07 mirror-source-across-src-tests rule.
- 2026-09-30 - grep result per the 2026-05-30 second-@type-instance rule: `grep -rn "SoftwareApplication" tests/e2e/` found ONE pre-existing `SoftwareApplication` predicate at `tests/e2e/demos-softwareapplication-jsonld.spec.ts:119` (`expect(apps, 'exactly one SoftwareApplication block expected on /demos').toHaveLength(1)`). That predicate is URL-scoped: `gotoDemos()` navigates to `/demos` first and only filters that page's DOM blocks. The per-demo blocks emitted on `/construction/demo/<slug>` routes do not shadow the hub's DOM, so the ticket 0030 predicate stays green without any widening. Documented in the new spec's header comment for auditability. No widening of the ticket 0030 spec required.
- 2026-09-30 - deviation from ticket prose per the 2026-09-12 code-beats-prose lesson: (a) `src/data/pricing.ts` does not exist at branch head, so the module-load assertion pins `priceAnchor` to non-empty + contains `$` instead of "grepable from src/data/pricing.ts"; the anchor "$0 (POC demo)" is grepable via the visible "POC Demo" badge each demo's JSX already renders. (b) The ReviewSystem demo does not ship the `DemoBreadcrumbs` component at branch head (the ticket 0019 STARTER_ROUTES list only covers 4 of the 5 construction demos), so acceptance box 6 iterates the 4 routes that actually ship a BreadcrumbList and pins reviews with a separate assertion that its new SoftwareApplication block emits without depending on breadcrumbs; adding DemoBreadcrumbs to ReviewSystem would violate the ticket's "no edits to any demo's business logic or visible copy" standard box.
- 2026-09-30 - no new static-file extension shipped (JSON-LD is inline in the SPA HTML shell), so the 2026-09-26 static-file MIME-shim lesson does NOT apply here.
- 2026-09-30 - full local gate green: `npm run lint && npm run typecheck && npm run check-links && npm run check-images && npm run check-meta && npm run check-blog-dates && node scripts/check-backlog.mjs && npm run build` all green (24 pre-existing lint warnings, 0 errors; 80 pre-existing missing-meta warnings in check-meta are also on main). All 9 cases in the new spec pass, plus all 5 cases in `tests/e2e/demo-breadcrumbs.spec.ts` (ticket 0019), plus all 7 cases in `tests/e2e/demos-softwareapplication-jsonld.spec.ts` (ticket 0030) run alone.
