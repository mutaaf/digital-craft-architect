---
id: 0069
title: Public /subprocessors data recipients page listing every third-party AI and infrastructure vendor with structured columns and CollectionPage JSON-LD
status: shipped
priority: P1
area: trust
created: 2026-09-08
owner: gtm-innovation
---

## User story

As a buyer-side procurement or security reviewer (a
compliance officer at a 200-person real-estate brokerage
completing an AI-vendor intake questionnaire, an IT
director at a general contractor whose insurance carrier
demands a sub-processor list before signing, a
fractional CTO advising an owner-operator on data
exposure before a pilot), Googling "digital craft
subprocessors," "AI vendor sub-processor list," or
arriving from the sibling `/trust` page's provider
narrative, I want one canonical page at `/subprocessors`
that lists every third-party service Digital Craft
routes customer or visitor data through (LLM, voice,
TTS, STT, scraping, analytics, error tracking, email
delivery) as a structured table with columns Vendor /
Category / Purpose / Where to read their trust page, so
that I can copy the table into my vendor intake
worksheet, hand it to my board or my insurance carrier,
and treat the URL itself as the audit artifact instead
of transcribing prose from the sibling `/trust` page.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: every provider we
route data through is already listed on `/trust` inside
a module-local `PROVIDERS: { name; purpose }[]` constant
in `src/pages/Trust.tsx` (ticket 0018, verified in the
2026-06-19 read: OpenAI, Vapi, ElevenLabs, Deepgram,
Firecrawl, Jina, Formspree, Sentry, Google Analytics).
The `/trust` page renders the list as narrative prose;
this ticket adds one new sibling page at
`/subprocessors` that renders the SAME list as a
structured, printable table with two enrichment columns
(category and public trust-page URL) that make it
directly usable in a vendor intake worksheet. Per the
2026-05-25 mirror-source rule the PROVIDERS constant is
EXTRACTED from `src/pages/Trust.tsx` into a new
`src/data/subprocessors.ts` (the same mechanical
extraction pattern ticket 0067 used for VENDOR_QUESTIONS
per the 2026-06-07 src-imports-tests lesson) so both
`/trust` and `/subprocessors` read from one source and
cannot drift. Enrichment fields (category, publicTrustUrl)
are additive on each entry; the visible rendering on
`/trust` stays byte-identical because the narrative
paragraph on `/trust` only reads `name` and `purpose`.
Zero new backend, zero new dependency, zero new
persistent state, zero new hostname (every publicTrustUrl
is the provider's already-public trust or privacy page
that a procurement reviewer would reach on their own
regardless).

### Stakeholder

This widens the moat in the procurement-artifact
dimension that `/trust` opened but did not fully close.
Every enterprise AI-services buyer eventually asks
"send me your sub-processors list" as a hard prerequisite;
publishing it as a canonical URL removes the friction
gate entirely and shifts the vendor conversation from
"prove you are not hiding anything" to "here is the
list, ask us about any row." The page emits a
`CollectionPage` + `ItemList` + `BreadcrumbList` JSON-LD
triple mirroring the ticket 0048 `/compare` hub and
ticket 0057 `/case-studies` hub patterns, so the page
also indexes as a structured artifact for the head-term
SERP query class ("AI vendor sub-processor list" is a
compliance-driven query that no shipped page targets).
Per the 2026-05-30 second-@type lesson, BEFORE writing
code the implementer greps every
`tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'`,
`=== 'ItemList'`, and `=== 'BreadcrumbList'` predicates;
the ticket 0048 `/compare`, ticket 0057 `/case-studies`,
and ticket 0011 `/demos` predicates for CollectionPage
and ItemList are URL-scoped per their Implementation
logs and cannot collide with a `/subprocessors`-scoped
sibling block. If any predecessor predicate is
site-wide, the implementer widens it in the SAME PR per
the 2026-05-25 mirror-source-fix family rule. The page
also indirectly extends the artifact set the buyer
encounters between SERP click and demo book: `/trust`
describes data flow, `/playbook` describes process,
`/questions-to-ask-an-ai-vendor` hands them the
questions to ask, `/subprocessors` hands them the vendor
list to audit. That structural posture (we publish the
sub-processor list BEFORE the security review) is what a
discerning procurement reviewer rewards.

### Visitor (in the real moment of use)

A compliance officer preparing a vendor intake packet on
a laptop at 4pm on a Thursday Googles "digital craft
subprocessors" and lands on `/subprocessors` from the
first SERP result. The page loads with a hero H1
("Sub-Processors and Data Recipients"), a one-paragraph
intro naming the scope (every third-party service we
route customer or visitor data through, plus a link back
to `/trust` for the full data-flow narrative), and a
single wide table: one row per sub-processor with
columns Vendor / Category / What we use them for / Their
public trust page. The Category column groups vendors
into six or seven buckets (LLM / Voice infrastructure /
Text-to-speech / Speech-to-text / Web scraping /
Analytics / Error tracking / Email delivery). The public
trust-page column links out with `rel="noopener
noreferrer"` to each provider's canonical trust or
privacy page (openai.com/policies, vapi.ai/privacy,
elevenlabs.io/privacy, deepgram.com/privacy,
firecrawl.dev/privacy, jina.ai/legal,
formspree.io/legal/privacy-policy, sentry.io/privacy,
policies.google.com/privacy). A "Print sub-processor
list" button below the table calls `window.print()`. A
`@media print` block hides the site nav and footer,
forces the table to render black-on-white with borders,
and lets the compliance officer walk away with a
printed audit artifact. Below the table, a small "Ask
about a specific vendor" strategy-call CTA. Light and
dark mode on-screen; print mode is theme-independent.

### Growth

The "show me" moment is the URL a compliance officer
forwards to their CIO with one sentence ("this is their
sub-processor list, one URL"). That is the single
artifact most likely to convert a stalled compliance
review because it collapses the "we need to know who
processes our data" objection from a 2-week email thread
into a 30-second scan. Per the ticket 0018 `/trust`
precedent, the ticket 0061 `/questions-to-ask-an-ai-vendor`
precedent, and the ticket 0067 `/questions-to-ask-an-ai-vendor/scorecard`
precedent, a public buyer-artifact that the reviewer can
audit without a login is the cheapest acquisition lever
the site has. Per the ticket 0067 telemetry order rule,
the print button fires
`trackCTAClick('subprocessors_print', 'subprocessors')`
FIRST (synchronously, because the print dialog blocks
the event loop) and then calls `window.print()`; the
hero H1 fires
`trackCTAClick('subprocessors_view', 'subprocessors')`
once per mount (debounced via a `useRef<boolean>` guard
mirroring the ticket 0060 / 0062 / 0067 pattern).

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/Subprocessors.tsx` (new file, under 260 lines) renders at `/subprocessors`. The page uses the existing `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell mirrored from `src/pages/VendorScorecard.tsx` (ticket 0067, the closest structural peer because both are buyer-artifact tables that render a printable grid from a `src/data/` constant and emit BreadcrumbList JSON-LD). The page renders a hero (H1 contains "Sub-Processors" or "Sub-processors" case-insensitive substring), a one-paragraph intro that references `/trust` by a `<Link to="/trust">` for the narrative data-flow context, a single HTML `<table data-testid="subprocessors-table">` with one header row and one row per sub-processor entry, and one strategy-call CTA at the bottom. Every claim on the page is defensible per the AGENTS.md rule: no fabricated retention windows, no invented data-residency regions, no vendor names beyond the ones already declared on `/trust`.
- [ ] A new module `src/data/subprocessors.ts` (new file) exports `SUBPROCESSORS: readonly Subprocessor[]` where `interface Subprocessor { name: string; category: string; purpose: string; publicTrustUrl: string }`. The array is a MECHANICAL EXTRACTION of the `PROVIDERS` constant currently module-local in `src/pages/Trust.tsx` with two additive columns (`category` and `publicTrustUrl`); the `name` and `purpose` field values are BYTE-IDENTICAL to the values on `/trust` today so the sibling page's visible rendering stays unchanged. The `category` values are drawn from a small closed set: "Large language model", "Voice infrastructure", "Text-to-speech", "Speech-to-text", "Web scraping", "Analytics", "Error tracking", "Email delivery" (one category per row; the dev picks the correct one per vendor from the existing `/trust` purpose text). The `publicTrustUrl` values MUST each be the vendor's canonical publicly-reachable trust, privacy, or legal policy page - not a marketing URL, not a login-gated page.
- [ ] The `/trust` page (`src/pages/Trust.tsx`) is edited to REPLACE its module-local `PROVIDERS` declaration with `import { SUBPROCESSORS } from '@/data/subprocessors'` and to render its existing provider narrative from `SUBPROCESSORS` (reading only `name` and `purpose` fields; the extraction leaves the visible narrative and every existing on-page card BYTE-IDENTICAL). The `/trust` page ALSO gets ONE small additive link somewhere in its provider section reading "See the full sub-processor list" that routes to `/subprocessors` (under 6 added lines; no existing copy is rewritten). The ticket 0018 spec (`tests/e2e/trust-page.spec.ts`) and the ticket 0044 spec (`tests/e2e/trust-aboutpage-jsonld.spec.ts`) stay green after the extraction; the acceptance box below covers this regression check explicitly.
- [ ] The scrivened `<table>` renders one header row with cells `Vendor / Category / What we use them for / Trust page` and one data row per `SUBPROCESSORS` entry. Each data row has `data-testid="subprocessor-row"` for spec counting. Each row's Trust page cell renders an anchor `<a href={publicTrustUrl} target="_blank" rel="noopener noreferrer" data-testid="subprocessor-trust-link">` whose href value is the entry's `publicTrustUrl`. Each anchor label is a short humanized hostname (e.g. "openai.com policies") NOT the full URL, to keep the printed page scannable.
- [ ] The page emits TWO JSON-LD blocks inside the existing `<Helmet>` head: (1) a `BreadcrumbList` (Home -> Sub-Processors) mirroring the shape used in `src/pages/VendorScorecard.tsx` per ticket 0067, and (2) a `CollectionPage` block with `@type: 'CollectionPage'`, `name: 'Digital Craft AI Sub-Processors and Data Recipients'`, `description` (same string as the `META_DESCRIPTION` module constant per the 2026-05-25 mirror-source rule), `url: 'https://digitalcraftai.com/subprocessors'`, and a `hasPart` (or `mainEntity`) `ItemList` inline whose `itemListElement` array is derived from `SUBPROCESSORS.map(...)` where each element is `{ '@type': 'ListItem', position: N, name: <entry.name>, description: <entry.purpose>, url: <entry.publicTrustUrl> }`. The `numberOfItems` value on the ItemList equals `SUBPROCESSORS.length`. The page does NOT emit a second `Organization` JSON-LD block for any sub-processor (that would collide with the ticket 0025 homepage Organization block per the 2026-05-30 second-@type lesson) and does NOT emit a `SoftwareApplication` block (owned by the `/demos` hub per ticket 0030).
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'`, `=== 'ItemList'`, AND `=== 'BreadcrumbList'` predicates and documents the result in the Implementation log. The ticket 0048 `/compare` hub spec and the ticket 0057 `/case-studies` hub spec both emit CollectionPage + ItemList blocks; both are URL-scoped per their Implementation logs, so a sibling instance on `/subprocessors` cannot collide. If any predecessor predicate IS site-wide, the implementer widens it in the SAME PR by identifying the original block by a unique field (e.g. the `/compare` CollectionPage `name: 'AI Software Comparisons'`) rather than by "the only CollectionPage block." The BreadcrumbList grep is expected to return many matches all URL-scoped per the ticket 0063 Implementation log.
- [ ] A new module-level `@media print` block is inlined inside the existing `<Helmet>` on the page as a `<style type="text/css" media="print">` element mirroring the ticket 0067 pattern. The block hides the site Navbar, Footer, ScrollProgress bar, and strategy-call CTA at print time via `display: none !important;`, forces the sub-processor `<table>` to render `width: 100% !important; color: #000 !important; background: #fff !important;` regardless of on-screen theme, and adds thin printed borders (`border: 1px solid #000 !important;`) to every table cell. Every hidden selector uses `display: none !important;` to beat Tailwind's utility-class specificity per the ticket 0067 precedent.
- [ ] A "Print sub-processor list" button (`data-testid="subprocessors-print"`) is rendered above the table. On click, the handler fires `trackCTAClick('subprocessors_print', 'subprocessors')` FIRST (synchronously) and then calls `window.print()` per the ticket 0067 analytics-fire-order pattern (the print dialog blocks the event loop, so post-print beacons are unreliable). The page fires `trackCTAClick('subprocessors_view', 'subprocessors')` exactly ONCE per page mount (debounced via a `useRef<boolean>(false)` guard).
- [ ] The route is registered in `src/App.tsx` next to the existing `/trust` route. `/subprocessors` is added to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson; `tests/e2e/routes.ts` re-exports it automatically and the smoke spec exercises the page. The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date. Per the 2026-09-05 route-code-splitting lesson, if the route is added under `React.lazy` mirroring adjacent trust-class routes, the new spec must not rely on `root.innerHTML.length > N` for readiness; auto-retrying `await expect(locator).toBeVisible()` is required.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text, in the `SUBPROCESSORS` constant strings, or in any JSON-LD serialized string. Every `publicTrustUrl` value uses `https://`. Every `<a>` from the trust-link cells carries `rel="noopener noreferrer"` and `target="_blank"`. The printed output (asserted via Playwright's `page.emulateMedia({ media: 'print' })` mode) has the on-screen chrome hidden and the sub-processor table visible.
- [ ] A new e2e spec at `tests/e2e/subprocessors.spec.ts` asserts: (1) `GET /subprocessors` returns 200 and the H1 contains "Sub-Processors" or "Sub-processors" (case-insensitive substring), (2) the table renders one row per `SUBPROCESSORS` entry (asserted by counting `data-testid="subprocessor-row"` locators against the imported `SUBPROCESSORS.length` with `toHaveCount`), (3) the header row cells contain "Vendor", "Category", "What we use them for", "Trust page" (case-insensitive substring per cell), (4) every trust-link anchor's href starts with `https://` and matches the entry's `publicTrustUrl`, and every anchor has `rel="noopener noreferrer"` and `target="_blank"`, (5) the `CollectionPage` JSON-LD block carries `name: 'Digital Craft AI Sub-Processors and Data Recipients'` and `url: 'https://digitalcraftai.com/subprocessors'`, and the embedded `ItemList` `itemListElement` length equals `SUBPROCESSORS.length`, (6) the `BreadcrumbList` JSON-LD has two items with the second one named matching the page H1 substring and linking to `https://digitalcraftai.com/subprocessors`, (7) print-view case calls `await page.emulateMedia({ media: 'print' })` and asserts the sub-processor table is visible while the site `nav` and `footer` elements are hidden, (8) print-button case overrides `window.print` via `page.addInitScript` BEFORE navigation and asserts the print call fires exactly once after the click AND that the `subprocessors_print` beacon fires BEFORE the print call, (9) sibling-page-regression case navigates to `/trust` and re-runs the key assertions from `tests/e2e/trust-page.spec.ts` (H1 substring, every `PROVIDERS` name rendered in the DOM) to prove the extraction to `src/data/subprocessors.ts` did not break the `/trust` narrative, (10) dark-mode case applies `document.documentElement.classList.add('dark')` and asserts the table renders, (11) no-em-dash case reads `page.textContent('body')` and asserts no `String.fromCharCode(8212)`.
- [ ] Standard box: no em-dash in any copy or JSON-LD, dark-mode variants required on every new element, no `/api/` change, no `package.json` / `package-lock.json` edit, no new hostname beyond the vendors' already-public trust pages (each domain is already reachable from the visitor's browser regardless of this page). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint` stay green. The new spec passes; the existing `tests/e2e/trust-page.spec.ts` (ticket 0018), `tests/e2e/trust-aboutpage-jsonld.spec.ts` (ticket 0044), `tests/e2e/vendor-scorecard.spec.ts` (ticket 0067), `tests/e2e/compare-hub.spec.ts` (ticket 0048), and `tests/e2e/case-studies-hub.spec.ts` (ticket 0057) all stay green.

## Out of scope

- Standard anti-goals: no /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- Publishing a data-residency region or a retention
  window per sub-processor. Both fields are contract-
  and-configuration dependent and neither is currently
  documented in the repo; publishing speculative values
  would violate the AGENTS.md defensible-claims rule.
  A region / retention column can be added later once a
  contract-review pass has produced sourced values,
  under its own ticket.

## Implementation log

### 2026-09-08 - kickoff

Pre-code grep results (per acceptance box 6, following the 2026-05-30
second-@type lesson):

- `=== 'CollectionPage'` predicates in `tests/e2e/`:
  - `tests/e2e/compare-hub.spec.ts:106` (ticket 0048) - `isCollectionPage`
    filter only invoked after `gotoCompareHub` navigates to `/compare`;
    URL-scoped, no collision with the new `/subprocessors`-scoped block.
  - `tests/e2e/case-studies-hub.spec.ts:111` (ticket 0057) - `isCollectionPage`
    filter only invoked after `gotoCaseStudiesHub` navigates to `/case-studies`;
    URL-scoped, no collision.
- `=== 'ItemList'` predicates in `tests/e2e/`:
  - `tests/e2e/compare-hub.spec.ts:101` (ticket 0048), URL-scoped to `/compare`.
  - `tests/e2e/case-studies-hub.spec.ts:106` (ticket 0057), URL-scoped to `/case-studies`.
  - `tests/e2e/website-sitelinks-jsonld.spec.ts:91` (ticket 0016), URL-scoped to `/`.
  - `tests/e2e/demos-index-hub.spec.ts:60` (ticket 0011), URL-scoped to `/demos`.
  - `tests/e2e/demos-softwareapplication-jsonld.spec.ts:73` (ticket 0030), URL-scoped to `/demos`.
  - `tests/e2e/changelog-itemlist-jsonld.spec.ts:107` (ticket 0043), URL-scoped to `/changelog`.
  - All five predecessor predicates run only after their spec navigates to a
    URL other than `/subprocessors`, so a new `/subprocessors`-scoped ItemList
    embedded inside the CollectionPage cannot collide.
- `=== 'BreadcrumbList'` predicates in `tests/e2e/` - 30+ matches; every match
  runs only after its spec's `goto<X>` helper navigates to a single URL other
  than `/subprocessors`. Per the ticket 0063 Implementation log every existing
  BreadcrumbList predicate is URL-scoped; confirmed here.
- Em-dash audit on the current `PROVIDERS` `purpose` values in
  `src/pages/Trust.tsx`: `chr(8212)` count = 0. The mechanical extraction to
  `src/data/subprocessors.ts` preserves `name` + `purpose` byte-identically
  (no hyphen swap needed).
- Zero predecessor predicates need widening in this PR.

### 2026-09-08 - implementation

Files touched (matches the ticket engineering notes):

1. NEW `src/data/subprocessors.ts` - mechanical extraction of the `PROVIDERS`
   constant plus additive `category` + `publicTrustUrl` columns. Exports
   `SUBPROCESSORS: readonly Subprocessor[]` and the `Subprocessor` type.
2. NEW `src/pages/Subprocessors.tsx` - mirrors the `VendorScorecard.tsx` shell
   (Navbar + Footer + ScrollProgress + Helmet). Emits TWO JSON-LD blocks:
   BreadcrumbList (Home -> Sub-Processors) and CollectionPage with an embedded
   ItemList (`hasPart`) derived from `SUBPROCESSORS`. Inline print stylesheet
   inside Helmet hides site chrome via `display: none !important;`. Print button
   fires `subprocessors_print` beacon FIRST, then `window.print()`. View beacon
   fires once per mount via `useRef<boolean>` guard.
3. EDIT `src/pages/Trust.tsx` - replaces the module-local `PROVIDERS` decl with
   `import { SUBPROCESSORS } from '@/data/subprocessors'` and rebinds the
   narrative-render loop to `SUBPROCESSORS.map(({ name, purpose }) => ...)`
   (visible DOM byte-identical because it reads only `name` and `purpose`).
   Adds ONE small "See the full sub-processor list" link routing to
   `/subprocessors`.
4. EDIT `src/App.tsx` - adds `<Route path="/subprocessors" element={<Subprocessors />} />`
   next to `/trust`, lazy-loaded via `React.lazy` (mirrors the `/trust`
   convention per the 2026-09-05 route code-splitting lesson).
5. EDIT `src/data/routes.ts` - allow-lists `/subprocessors` so the smoke spec
   exercises it (2026-06-07 src-imports-tests lesson).
6. NEW `tests/e2e/subprocessors.spec.ts` - 11 cases per AC box 10.
- A downloadable PDF export of the table. The browser's
  native print-to-PDF dialog is the shipping mechanism;
  adding a heavy PDF library (jsPDF or similar) violates
  the Hard NO on GTM-queue `package.json` edits.
- An interactive "which sub-processor handles which
  demo" filter or search widget. Ten rows is too few to
  justify filter UI; revisit if the list exceeds 20
  entries.
- Editing the ticket 0018 `/trust` page's narrative
  copy or the AboutPage JSON-LD (ticket 0044). This
  ticket only performs the mechanical `PROVIDERS`
  extraction and adds ONE small link to the new page;
  the narrative sections, the disclosure paragraphs,
  and the AboutPage block on `/trust` stay byte-
  identical.
- Adding a new sub-processor to the list. The eleven-
  or-so vendors on `/trust` today are the canonical set
  per CLAUDE.md and the existing PROVIDERS array;
  inventing a new vendor would violate the AGENTS.md
  defensible-claims rule. A new sub-processor lands
  when the tech stack changes, under its own ticket.
- A subscribe / RSS / JSON-feed endpoint at
  `/subprocessors/rss.xml`. Sub-processor changes are
  infrequent and audit-driven; a feed is not the right
  distribution channel. Procurement reviewers subscribe
  to the page URL directly (browser watchers, RSS-of-
  URL tools).
- A cross-link from the site navbar or the footer. Per
  the ticket 0023 footer-chip precedent, cross-surface
  promotion ships on its own ticket only after the page
  is shown to earn clicks; the ONLY cross-link in this
  ticket is the small "See the full sub-processor list"
  from `/trust`.
- Adding the page to the `index.html` SEO Pilot pages
  table. That is its own SEO-hygiene ticket per the
  2026-05-25 SEO Pilot lesson; the new e2e spec
  asserts the Helmet-managed `meta[name="description"]`
  directly, not `page.toHaveTitle()`.
- Emitting an `Organization` JSON-LD block for each
  sub-processor. That would collide with the ticket
  0025 homepage Organization block per the 2026-05-30
  second-@type lesson and would misrepresent this page
  as owning identity for third-party vendors.
- Emitting a `Dataset` JSON-LD block. The page is a
  vendor list, not a dataset; `CollectionPage` plus an
  embedded `ItemList` is the correct schema shape.
- Internationalization (`inLanguage` fields on schema).
  The page is English-only matching every existing
  trust-class surface.
- A live "which sub-processor last received data from
  my session" telemetry chip. That would require new
  client-side instrumentation and a new persistent
  store; the artifact is deliberately static.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/Subprocessors.tsx` (under 260 lines).
  Mirror the page-shell pattern of
  `src/pages/VendorScorecard.tsx` (ticket 0067, the
  closest structural peer because both render a
  printable table from a `src/data/` constant and emit
  BreadcrumbList JSON-LD). Define module-level
  constants `META_DESCRIPTION`, `PAGE_H1`,
  `COLLECTION_PAGE_SCHEMA`, `BREADCRUMB_SCHEMA` per
  the 2026-05-25 mirror-source rule (the description
  used in the Helmet meta tag AND in the
  `COLLECTION_PAGE_SCHEMA.description` MUST be a
  single `META_DESCRIPTION` constant; the H1 string
  used in the render AND in the BreadcrumbList second
  item MUST be a single `PAGE_H1` constant).
- New `src/data/subprocessors.ts` (mechanical
  extraction plus additive columns). Move the
  `PROVIDERS` constant from
  `src/pages/Trust.tsx:PROVIDERS` into this file,
  rename the exported symbol to `SUBPROCESSORS`, add
  two new fields per entry (`category`, `publicTrustUrl`),
  and preserve `name` and `purpose` byte-identically.
  Per the 2026-06-07 src-imports-tests lesson the
  canonical location for cross-page-shared constants
  is `src/data/`. The `Subprocessor` type is exported
  from the same file. Nine entries today; the extraction
  is one file added.
- `src/pages/Trust.tsx` - THREE additive edits: (1)
  replace the module-local `PROVIDERS` declaration
  with `import { SUBPROCESSORS } from '@/data/subprocessors'`
  and rebind the narrative-render loop from `PROVIDERS`
  to `SUBPROCESSORS.map(({ name, purpose }) => ...)`
  (the render reads only `name` and `purpose`, so the
  visible DOM is byte-identical), (2) add ONE small
  link in the provider section labeled "See the full
  sub-processor list" routing to `/subprocessors`
  (under 6 added lines; no existing copy is
  rewritten), (3) confirm the ticket 0018 spec and
  ticket 0044 AboutPage spec stay green. Per the
  2026-05-25 mirror-source rule, if any existing
  `PROVIDERS` `purpose` value contains an em-dash,
  fix it in the moved file (a hyphen swap is
  punctuation repair per the 2026-05-25 mirror-
  source-fix rule).
- New route in `src/App.tsx`: import `Subprocessors`
  from `./pages/Subprocessors` and add
  `<Route path="/subprocessors" element={<Subprocessors />} />`
  next to the existing `/trust` route. Mirror the
  (non-)lazy-loading convention of the adjacent
  `/trust` route per the 2026-09-05 route-code-
  splitting lesson (if lazy-wrapped, the new spec
  must not rely on `root.innerHTML.length > N` for
  readiness; use auto-retrying `await expect(locator).toBeVisible()`).
- Per the 2026-06-07 src-imports-tests lesson, add
  `/subprocessors` to the `ROUTES` array in
  `src/data/routes.ts`; `tests/e2e/routes.ts`
  re-exports it automatically.
- Per the 2026-05-30 second-@type lesson, BEFORE
  writing code grep `tests/e2e/*-jsonld.spec.ts` for
  `=== 'CollectionPage'`, `=== 'ItemList'`, and
  `=== 'BreadcrumbList'` predicates. Document the
  grep result in the Implementation log. The ticket
  0048 `/compare` and ticket 0057 `/case-studies`
  hub predicates for CollectionPage and ItemList are
  URL-scoped per their Implementation logs; the
  ticket 0011 `/demos` hub predicate is also
  URL-scoped. If any predecessor predicate IS site-
  wide, widen it in the SAME PR by identifying its
  block by a unique field (e.g. `/compare`
  CollectionPage `name: 'AI Software Comparisons'`,
  `/case-studies` `name: 'Digital Craft AI Case Studies'`).
  The BreadcrumbList grep is expected to return many
  URL-scoped matches per ticket 0063.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e
  spec asserts the Helmet-managed
  `meta[name="description"]` content directly (LAST
  `meta[name="description"]` per the 2026-05-25
  Helmet-appends lesson), NOT `page.toHaveTitle()`.
  `/subprocessors` is NOT in the `index.html` SEO
  Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every string
  in the new page module (the H1, the
  META_DESCRIPTION, the header cell labels, the
  intro paragraph, the print-button label, the CTA
  label, the JSON-LD strings, the print-stylesheet
  content) uses hyphens. Every string in
  `src/data/subprocessors.ts` (`name`, `category`,
  `purpose`, `publicTrustUrl`) uses hyphens. Self-
  Review greps the diff for
  `String.fromCharCode(8212)` before pushing.
- Print stylesheet: inline it inside the existing
  `<Helmet>` block on the sub-processors page as a
  `<style type="text/css" media="print">` element per
  the ticket 0067 precedent. Hide the site Navbar,
  Footer, ScrollProgress bar, and strategy-call CTA
  at print-time via `display: none !important;`.
  Force the table to render
  `width: 100% !important; color: #000 !important; background: #fff !important;`
  and add thin printed borders
  (`border: 1px solid #000 !important;`) to every
  cell. Every hidden selector uses
  `display: none !important;` because Tailwind's
  utility classes carry higher specificity.
- Vendor trust-page URL list to use (all currently
  publicly reachable; the dev confirms each URL is
  200 at implementation time; if a vendor's canonical
  trust URL changes, the dev uses the current one):
  OpenAI - `https://openai.com/policies/privacy-policy`,
  Vapi - `https://vapi.ai/privacy`, ElevenLabs -
  `https://elevenlabs.io/privacy`, Deepgram -
  `https://deepgram.com/privacy`, Firecrawl -
  `https://www.firecrawl.dev/privacy`, Jina -
  `https://jina.ai/legal`, Formspree -
  `https://formspree.io/legal/privacy-policy`,
  Sentry - `https://sentry.io/privacy`, Google
  Analytics - `https://policies.google.com/privacy`.
  Each URL is a THIRD-PARTY hostname already
  reachable from the browser regardless of this page;
  no new first-party hostname is added.
- `tests/e2e/subprocessors.spec.ts` (new) - one
  assertion per acceptance box. Model the spec on
  `tests/e2e/vendor-scorecard.spec.ts` (ticket 0067,
  the closest peer for "printable table backed by a
  `src/data/` constant with print-button spy"). The
  print-view case uses
  `await page.emulateMedia({ media: 'print' })`
  BEFORE the visibility assertions - Playwright ships
  this API natively (no new dependency). Per the
  2026-09-05 route-code-splitting lesson, prefer
  auto-retrying `await expect(locator).toBeHidden()`
  / `.toBeVisible()` over one-shot `.isVisible()`
  for print-mode assertions. The print-button case
  overrides `window.print` via `page.addInitScript`
  BEFORE the navigation; the analytics-fire-order
  case uses the same init-script approach to record
  beacons in a window-level array in call order per
  the ticket 0067 pattern. The sibling-page-
  regression case navigates to `/trust` and re-runs
  the key ticket 0018 assertions (H1 substring, every
  `SUBPROCESSORS` name string rendered in the DOM,
  provider-narrative section still present) to prove
  the mechanical extraction did not break the
  narrative. The `SUBPROCESSORS.length` count import
  in the spec follows the ticket 0067 precedent
  (`.toHaveCount(SUBPROCESSORS.length)`).
- Per the 2026-05-22 two-PR ship lesson, ship will
  need a follow-up `chore/0069-ship-status` PR after
  the feat PR merges to flip the ticket frontmatter
  AND its `docs/backlog/README.md` index row to
  `shipped` together; run `node scripts/check-backlog.mjs`
  before pushing the second PR so the file and index
  never drift mid-flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, the existing
  Navbar / Footer / ScrollProgress components, the
  existing `trackCTAClick` helper, and
  `window.print()` (native browser API). Schema
  migration: no. Privacy / security surface change:
  NO - the page emits no new first-party network
  call, adds no new persistent-storage key, and only
  links out to publicly reachable third-party trust
  pages. The `/trust` page's disclosure list stays
  byte-identical (the extraction is mechanical).
