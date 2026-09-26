---
id: 0097
title: Public /accessibility-statement page with dated WCAG conformance level and remediation log as a defensible trust artifact
status: shipped
priority: P1
area: trust
created: 2026-09-26
owner: gtm-innovation
---

## User story

As an accessibility-aware buyer or their compliance counsel evaluating
Digital Craft (a public-sector construction GC whose contract requires
every vendor's site to publish a WCAG conformance statement, a real-estate
brokerage HR lead whose Section 508 procurement checklist asks for a dated
accessibility statement before a paid pilot, a franchise VP whose ADA
counsel reads every vendor's accessibility statement as part of vendor
onboarding, a home-services business owner using a screen reader who wants
to see whether Digital Craft has actually written down its posture on
keyboard navigation and color contrast), I want one public dated page at
`/accessibility-statement` listing Digital Craft's current WCAG conformance
target, the specific automated and manual audit cadence, the last-reviewed
date, and a short dated remediation log of accessibility fixes shipped in
the last 90 days, so that I can read a defensible audit trail before
booking a strategy call and I can cite it to my own compliance or ADA
counsel as part of the vendor onboarding packet.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the site already ships six defensible
trust artifacts (`/trust` ticket 0018, `/ethics` ticket 0077, `/security`
ticket 0081, `/model-card` ticket 0088, `/agent-fleet` ticket 0090,
`/ai-risks-we-watch` ticket 0094) plus three canonical structured artifacts
(`/subprocessors` ticket 0069, `/uptime` ticket 0036, `/how-we-ship` ticket
0083). None of the nine speaks to the buyer's specific question "what is
your WCAG conformance level, when did you last audit, and what have you
actually shipped to fix accessibility gaps." That question is the shortest
bridge between the AGENTS.md "dark mode is mandatory" rule and the site's
actual buyer-facing accessibility posture: it names the conformance target,
the audit cadence, and dated remediations. Adding the page is exactly one
new file (`src/pages/AccessibilityStatement.tsx`, modeled 1:1 on
`src/pages/AiRisksWeWatch.tsx` from ticket 0094 which renders a dated table
from a data-file constant), one new data file
(`src/data/accessibilityStatement.ts` mirroring the pattern of
`src/data/aiRisksWatchlist.ts` and `src/data/ethicsCommitments.ts`), one
new entry in `src/data/routes.ts`, one new route in `src/App.tsx`, one new
sitemap entry (auto-emitted by the ticket 0022 generator per the ticket
0094 implementer's note), one new footer trust-chip link next to the
existing `/trust` / `/ethics` / `/security` / `/ai-risks-we-watch` links,
and one new spec file. No new backend, no new dependency, no new demo
surface.

### Stakeholder

This widens the moat in the buyer-side-defensibility dimension that the
trust family opens. Every one of the ten shipped trust artifacts is a
dated document a buyer's compliance officer, insurer, procurement lead, or
ADA counsel can cite; none of them says "our WCAG target is 2.1 AA, we run
axe-core against the built site on every CI run, we manually keyboard-
walk every new page before shipping, and here is the dated log of
accessibility fixes we shipped in the last 90 days." The competitive
positioning is asymmetric: most AI-services vendors do NOT publish a
dated accessibility statement (the closest public analogues are large-
platform accessibility statements from a big-lab, which are broad, un-
dated, and not shipped-artifact-specific to a small-business site). A
dated accessibility statement becomes a cite-able artifact in Section 508
procurement reviews, in public-sector construction bid packets, and in
E&O insurance underwriting where the underwriter is checking whether the
vendor has documented an accessibility posture. Per the ticket 0094
ai-risks-we-watch precedent, the page emits CollectionPage plus
BreadcrumbList JSON-LD (NOT FAQPage; an accessibility statement is not a
question-answer pattern) so search engines index the page as a canonical
collection of dated conformance rows. Per the ticket 0088 model-card
precedent, the page's "last-reviewed" date on the top of the page and its
per-remediation dated log rows are dated artifacts the buyer can cite as
evidence of active monitoring, distinct from the /ethics page which is
about immutable stances. The moat is: a search for "digital craft
accessibility statement," "AI vendor WCAG conformance," "AI services
accessibility posture," or "small-business AI vendor Section 508" lands
on Digital Craft's dated statement, not on a generic responsible-AI
statement from a lab.

### User (in the real moment of use)

A public-sector construction GC's procurement lead sits down Tuesday
morning to run vendor onboarding on Digital Craft. Her checklist has a
Section 508 line and a WCAG 2.1 AA line, and she needs a dated URL for
each. She opens `digitalcraftai.com/accessibility-statement` from the
footer trust-chip cluster; the page loads in under one screen on her
laptop with a hero H1 ("Accessibility Statement"), a top-of-page
"Last reviewed: 2026-09-26" line, a conformance target line ("Target:
WCAG 2.1 AA"), a "How we audit" section naming the automated tools (axe-
core in CI, Lighthouse accessibility category, tab-order and screen-
reader spot checks) and the manual cadence (every new route hand-tested
with keyboard-only navigation and a screen reader before merge), a
"Known limitations" section naming the specific gaps still open with a
next-review date on each, and a "Recent remediations" dated log of the
last 90 days of shipped accessibility fixes (each row: date, route,
change summary). At the bottom, a "How to report a barrier" line pointing
to a mailto: link. She copies the URL into her vendor packet, saves the
last-reviewed date to her spreadsheet, and moves on. No dead links, no
non-defensible claim (the audit tools named are the ones the CI job
actually runs; the remediations named are dated and shippable to the
actual git log). Light and dark mode both read cleanly; the page itself
passes a keyboard-only walk end to end.

### Growth

The "show me" moment is a public-sector procurement lead pasting
`digitalcraftai.com/accessibility-statement` into a vendor onboarding
spreadsheet under the "WCAG conformance URL" column with a green
checkbox and moving to the next vendor row without a follow-up email.
That single ingest is the shortest path from "we are a small AI vendor
you have not heard of" to "we clear the Section 508 gate that a
material fraction of your competitors do not clear." The peer-share
signal is a second-order effect: procurement leads swap notes across
neighboring GC firms, and a vendor with a dated accessibility statement
becomes a reference vendor in the informal peer network of that
procurement cohort. It also creates a measurable SEO signal: the
statement is a canonical dated CollectionPage that Googlebot recrawls
on its lastmod cadence, widening the trust-artifact SEO cluster the
site has been building.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against
this list before writing code.

- [ ] A new page at `src/pages/AccessibilityStatement.tsx` (new file, under
  200 lines) modeled 1:1 on `src/pages/AiRisksWeWatch.tsx` (ticket 0094,
  the freshest predecessor in the same dated-trust-artifact family). The
  page renders: (a) a hero H1 "Accessibility Statement", (b) a top-of-page
  "Last reviewed: 2026-09-26" line, (c) a conformance target section
  ("Target: WCAG 2.1 AA") with a one-paragraph explanation of what that
  target means for the site, (d) an "How we audit" section naming the
  automated tooling (axe-core in CI, Lighthouse accessibility category,
  the existing `check-links` and `check-meta` gates) and the manual audit
  cadence (every new route walked with keyboard-only navigation and a
  screen reader spot check before merge), (e) a "Known limitations"
  section listing the currently-open accessibility gaps with a next-
  review date on each row (defensible only; do NOT list gaps the audit
  cannot cite), (f) a "Recent remediations" dated table listing the last
  90 days of shipped accessibility fixes with columns Date, Route, Change
  summary; each row is a real shipped change grepable from `git log`
  (defensible only), (g) a "How to report a barrier" section with a
  mailto: link. Every string is defensible per AGENTS.md: no invented
  conformance percentages, no invented pass/fail counts, no fabricated
  audit-firm names, no claim to have completed a full third-party WCAG
  audit the site cannot cite. Hyphens not em-dashes per the 2026-05-07
  em-dash Hard NO.
- [ ] A new data file at `src/data/accessibilityStatement.ts` (new file,
  under 100 lines) exports two constants: `CONFORMANCE_TARGET` (a
  const with `level: 'AA'`, `version: '2.1'`, `lastReviewed: '2026-09-26'`,
  and a short `summary` string), and `RECENT_REMEDIATIONS` (a readonly
  array of `{ date: string; route: string; summary: string }` objects,
  one per shipped fix over the last 90 days). The `RECENT_REMEDIATIONS`
  array is defensible: every row's `route` is a route present in
  `src/data/routes.ts` (imported and asserted at build time per the
  2026-05-28 sitemap-lastmod-encoded-invariant lesson pattern), and every
  row's `summary` is a real change grepable from the git log at branch
  head. Per the 2026-05-25 mirror-source rule, the constants are authored
  once in `accessibilityStatement.ts` and rendered on both
  `AccessibilityStatement.tsx` and (transitively via a new render loop
  entry on `/trust`) `src/pages/Trust.tsx` from the same source.
- [ ] A new route entry at `src/App.tsx` mapping `/accessibility-statement`
  to the new page component, lazy-imported through the existing
  `React.lazy` pattern all other trust pages use per the 2026-09-05
  route-code-splitting lesson. Wrapped in the existing
  `<Suspense fallback={<RouteFallback />}>` shell. A new entry in
  `src/data/routes.ts` for `/accessibility-statement` placed next to the
  existing `/ai-risks-we-watch` entry per the ticket 0094 convention
  (shipping order, not alphabetical, per the 2026-09-12 code-beats-prose
  lesson and the ticket 0092 implementer's note).
- [ ] A new sitemap entry for `/accessibility-statement` is emitted at
  build time. Per the ticket 0094 implementer's note that
  `scripts/generate-sitemap.ts` (ticket 0022) reads the routes array
  automatically, no manual XML edit is required and the implementer
  confirms auto-inclusion in the Implementation log by grepping
  `dist/sitemap.xml` for `/accessibility-statement` after a local build.
  If a manual `public/sitemap.xml` addition IS required, the implementer
  adds one new `<url>` entry with `<lastmod>2026-09-26</lastmod>` and
  `<priority>0.4</priority>` mirroring the ticket 0094 sitemap row per
  the 2026-05-28 sitemap-lastmod-encoded-invariant lesson.
- [ ] The page emits two JSON-LD blocks inside its `<Helmet>` block
  matching the trust-artifact family shape: (1) `CollectionPage`
  describing the accessibility statement as a canonical dated collection
  of conformance and remediation rows, with `name` "Digital Craft AI
  Accessibility Statement", `url`
  "https://digitalcraftai.com/accessibility-statement", `description`
  byte-identically matching the page's `meta[name="description"]` per
  the 2026-05-25 mirror-source rule, `dateModified` equal to
  `CONFORMANCE_TARGET.lastReviewed` from the data file (mirror-source
  again); (2) `BreadcrumbList` positioning the page under the homepage
  (two levels: Home, Accessibility Statement). Per the 2026-05-30
  second-@type lesson, BEFORE writing code the implementer greps every
  `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'` and
  `=== 'BreadcrumbList'` predicates. Predecessors as of 2026-09-26:
  ticket 0048 `/compare` CompareHub, ticket 0057 `/case-studies` hub,
  ticket 0069 `/subprocessors`, ticket 0071 `/ai-for-hospitality` hub,
  ticket 0077 `/ethics`, ticket 0079 `/blog`, ticket 0088 `/model-card`,
  ticket 0090 `/agent-fleet`, ticket 0094 `/ai-risks-we-watch`. Each is
  URL-scoped so the sibling on `/accessibility-statement` cannot
  collide. The grep result is documented in the Implementation log.
- [ ] The `/trust` page (`src/pages/Trust.tsx`) gains one new inline
  cross-link chip inside the existing trust-cluster section pointing at
  `/accessibility-statement` with label "Accessibility Statement". This
  is one additive line inside the shipped ticket 0018 trust page; the
  ticket 0018 AboutPage JSON-LD and BreadcrumbList JSON-LD stay byte-
  identical. Per the 2026-05-25 mirror-source rule, the chip label is
  authored once in `Trust.tsx` and rendered from that single source; no
  hand-rolled second copy.
- [ ] The site footer (`src/components/Footer.tsx`) gains one new trust-
  chip link to `/accessibility-statement` next to the existing `/trust`,
  `/ethics`, `/security`, `/model-card`, `/agent-fleet`,
  `/ai-risks-we-watch` links, matching the ticket 0023 footer chip
  pattern. This is one additive line; the ticket 0023 footer copy stays
  byte-identical.
- [ ] Per the 2026-05-07 em-dash Hard NO, every string on the page, in
  the data file, in the trust cross-link, in the footer chip, and in the
  new e2e spec is hyphen-only. Self-Review greps the diff for
  `String.fromCharCode(8212)` before pushing. Per the 2026-09-08 em-dash-
  JSON-LD-block-filter lesson, the em-dash assertion in the spec scopes
  ONLY to the two blocks THIS page emits (`CollectionPage`,
  `BreadcrumbList`) filtered by `@type`, NOT to every
  `application/ld+json` block on the page (the homepage Organization
  block from `index.html` carries a legitimate em-dash and must not be
  flagged).
- [ ] The page ships full dark-mode support: every Tailwind color class
  carries its `dark:` variant, mirroring `AiRisksWeWatch.tsx` verbatim.
  Viewport-width checks on 375px, 768px, and 1280px render the
  remediation table with legible column widths (mobile stacks the
  columns per the ticket 0094 pattern). The page itself passes a
  keyboard-only walk end to end: every interactive element (footer
  chip, mailto: link, external links) is reachable and focus-visible.
- [ ] A new e2e spec at `tests/e2e/accessibility-statement.spec.ts`
  (modeled on `tests/e2e/ai-risks-we-watch.spec.ts` from ticket 0094)
  asserts, using a `gotoAccessibilityStatement(page)` helper that
  navigates to `/accessibility-statement` and waits for RouteFallback
  detach per the 2026-09-05 lesson and the H1 mount signal per the
  2026-09-10 lesson: (1) `GET /accessibility-statement` returns 200,
  (2) the page renders an H1 containing "Accessibility Statement",
  (3) the page renders a "Last reviewed: 2026-09-26" line matching the
  `CONFORMANCE_TARGET.lastReviewed` field imported from
  `src/data/accessibilityStatement.ts` (mirror-source assertion per
  the 2026-05-25 rule and per the 2026-06-07 src-imports-tests lesson),
  (4) the page renders a "Target: WCAG 2.1 AA" line, (5) the
  remediation table renders exactly `RECENT_REMEDIATIONS.length` rows
  with `data-testid="accessibility-remediation-row"` per the 2026-09-06
  VISIBLE_LIMIT lesson (use `toHaveCount(N)` over the seeded state,
  not `count > 0`), (6) every row's `route` cell text matches a route
  present in `src/data/routes.ts` (`ROUTES` imported per the
  2026-06-07 lesson), (7) exactly one `CollectionPage` JSON-LD block
  with `name` byte-matching the page's H1 substring and `dateModified`
  byte-matching `CONFORMANCE_TARGET.lastReviewed`, (8) exactly one
  `BreadcrumbList` block with two itemListElement entries named "Home"
  and "Accessibility Statement", (9) the em-dash check scopes only to
  the two owned blocks per the 2026-09-08 filter lesson; the rendered
  page body contains zero `String.fromCharCode(8212)` code points, (10)
  the page renders cleanly in both light and dark mode
  (`html.dark` toggle), (11) a keyboard-only tab walk from the page's
  H1 through every interactive element on the page succeeds with each
  element receiving a visible focus ring (Playwright `.focus()` chain
  plus `page.evaluate` reading `document.activeElement.tagName` at each
  step), (12) the `/trust` page (ticket 0018) shows the new "Accessibility
  Statement" cross-link chip and its href is `/accessibility-statement`,
  and (13) the footer on the homepage (ticket 0023) shows the new
  trust-chip link to `/accessibility-statement`. Per the 2026-06-15
  attribute-list regex lesson, any regex in the spec that matches
  self-closing tags in stringified JSON-LD output uses `[^>]*`, not
  `[^/>]*`.
- [ ] Per the 2026-05-28 sitemap-lastmod encoded-invariant lesson, the
  data file `accessibilityStatement.ts` includes a build-time assertion
  block (either inside the file's module-load path or inside
  `scripts/generate-sitemap.ts` if it imports the file) that (a) every
  `RECENT_REMEDIATIONS[i].route` string is present in the `ROUTES`
  array of `src/data/routes.ts` (throw with `NOT_IN_ROUTES` in the
  message if not), (b) every `RECENT_REMEDIATIONS[i].date` is a valid
  ISO date string (`YYYY-MM-DD`) and represents a date on or before
  today, (c) `CONFORMANCE_TARGET.lastReviewed` is a valid ISO date. If
  a route referenced in the remediation log is not in `ROUTES`, the
  build fails locally and in CI's `build` gating job. Per the ticket
  0092 implementer's convention, the assertion is inlined in the data
  file's module load (throws on import) rather than in a new script,
  because the GTM Hard NO forbids `package.json` edits and the data
  file is already imported by the built page.
- [ ] Standard box: no `/api/` change, no new hostname (the mailto: link
  is not a network endpoint), no new npm dependency (no axe-core install,
  no eslint-plugin-jsx-a11y install; the acceptance criteria describe the
  documented posture, not a code addition), no edits to
  `package.json` / `package-lock.json`, no edits to any of the ten
  predecessor trust-artifact files beyond the one additive line in
  `Trust.tsx` and the one additive line in `Footer.tsx`.
  `node scripts/check-backlog.mjs`, `npm run check-links`,
  `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`,
  `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The
  new spec passes; every shipped `tests/e2e/trust-*.spec.ts`, the ten
  predecessor trust-page specs (0018, 0036, 0069, 0077, 0081, 0083, 0088,
  0090, 0094 where present) all stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem
related.

- Standard anti-goals: no `/api/` changes, no `package.json` changes, no
  em-dashes in copy, dark-mode required.
- Installing axe-core, eslint-plugin-jsx-a11y, or any other accessibility
  test-runner dependency. Adding a dependency requires a `package.json`
  edit and is a GTM Hard NO. The statement describes Digital Craft's
  current audit posture (which uses browser dev tools plus the existing
  `check-links` / `check-meta` gates plus manual keyboard walks). Wiring
  automated axe-core in CI is a separate eng-queue ticket.
- Claiming a completed third-party WCAG audit. Digital Craft has not
  purchased a third-party WCAG audit; the statement is defensible and
  says so. A future ticket can update the page when a real audit
  finishes.
- Publishing a per-page conformance matrix (every route rated Pass /
  Partial / Fail). The MVP names the site-wide target and the last-
  reviewed date; a per-route rating is a distinct follow-up ticket
  because it requires per-route audit data the current cadence does not
  produce.
- Adding a live accessibility widget (an overlay tool that promises to
  fix accessibility issues on the fly). Overlay tools are a known
  antipattern in accessibility practice and their claims are indefensible
  per the AGENTS.md no-inflated-claims rule.
- Emitting a `Product` or `Offer` JSON-LD block for an accessibility
  service. Digital Craft does not sell accessibility consulting;
  emitting such a block would misrepresent the artifact per the
  AGENTS.md conservative-claims rule.
- Adding city-specific or state-specific accessibility law references
  (an ADA-Title-III paragraph, a California Unruh Act paragraph, an EU
  European Accessibility Act paragraph). Legal-jurisdiction claims are
  their own privacy/legal ticket and require counsel review before
  publication; the MVP names WCAG 2.1 AA as the technical target only.
- Editing the ten predecessor trust-artifact pages beyond the two
  additive cross-link insertions (`Trust.tsx` chip and `Footer.tsx`
  link). Every predecessor stays byte-identical otherwise.
- Adding a "report a barrier" web form with a `POST /api/*` endpoint.
  The mailto: link is the MVP contact surface; a real form requires a
  new `/api/*` route and is a GTM Hard NO.
- Cross-linking `/accessibility-statement` from every landing page,
  every AI-for-* page, or the homepage hero. The MVP wires the trust-
  cluster chip on `/trust` plus the footer link plus the sitemap;
  cross-surface promotion is its own follow-up ticket.
- Emitting an `AboutPage` JSON-LD block on `/accessibility-statement`.
  Per the 2026-05-30 second-@type lesson, the ticket 0044 `/trust`
  AboutPage block is the canonical AboutPage on the site and a second
  AboutPage instance risks collision; a CollectionPage block is the
  correct fit for a dated collection of rows.
- Persisting a per-visitor accessibility preference (e.g. a "high
  contrast mode" toggle) to localStorage. Client-side preference toggles
  are their own retention ticket and are unrelated to the statement's
  purpose (describing site posture, not adjusting per-visitor state).

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't
have to re-discover the architecture.

- New `src/pages/AccessibilityStatement.tsx` (under 200 lines). Mirror
  the file structure of `src/pages/AiRisksWeWatch.tsx` (ticket 0094)
  verbatim: same imports, same section layout, same top-of-page dated
  header, same table rendering `RECENT_REMEDIATIONS`, same footer
  contact section. Every Tailwind color class carries its `dark:`
  variant.
- New `src/data/accessibilityStatement.ts` (under 100 lines). Mirror
  the shape of `src/data/aiRisksWatchlist.ts` (ticket 0094): exported
  `CONFORMANCE_TARGET` object plus `RECENT_REMEDIATIONS` readonly
  array. Include an inlined `assertAccessibilityStatement()` call at
  module load that (a) validates every `RECENT_REMEDIATIONS[i].route`
  is in the imported `ROUTES` allow-list (throw with a clear message
  naming the offending row), (b) validates every date is a valid ISO
  date on or before today, (c) validates
  `CONFORMANCE_TARGET.lastReviewed` is a valid ISO date. Per the
  2026-05-28 sitemap-lastmod encoded-invariant lesson, the assertion
  fires at module load so any downstream import triggers the check;
  since the built page imports the module, a violation fails
  `npm run build` without any `package.json` edit.
- `src/App.tsx` - add
  `<Route path="/accessibility-statement" element={<AccessibilityStatement />} />`
  after the existing `/ai-risks-we-watch` route. Wrap in the existing
  `<Suspense fallback={<RouteFallback />}>` shell and lazy-import via
  `React.lazy(() => import('./pages/AccessibilityStatement'))` per the
  2026-09-05 route-code-splitting lesson.
- `src/data/routes.ts` - add `/accessibility-statement` after the
  existing `/ai-risks-we-watch` entry per the ticket 0094 convention.
  Per the 2026-09-12 code-beats-prose lesson, the implementer greps
  the actual order at branch head before inserting.
- `src/pages/Trust.tsx` - add one additive cross-link chip inside the
  existing trust-cluster section pointing at `/accessibility-statement`
  with label "Accessibility Statement". Grep the file first for the
  existing chip cluster; place the new chip in the same section. The
  chip is additive and does not touch the shipped ticket 0018 AboutPage
  JSON-LD and BreadcrumbList JSON-LD.
- `src/components/Footer.tsx` - add one additive trust-chip link to
  `/accessibility-statement` next to the existing `/trust`, `/ethics`,
  `/security`, `/model-card`, `/agent-fleet`, `/ai-risks-we-watch`
  links per the ticket 0023 footer chip pattern.
- Per the 2026-05-25 mirror-source rule, the `CONFORMANCE_TARGET.summary`
  string in the data file is the same string rendered in the visible
  page body's "Target: WCAG 2.1 AA" paragraph AND emitted into the
  CollectionPage JSON-LD `description` field AND set as the
  `meta[name="description"]` content. Do NOT hand-roll a second copy.
- Per the 2026-05-30 second-@type lesson, BEFORE writing code grep
  every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'` and
  `=== 'BreadcrumbList'` predicates. Every predecessor CollectionPage
  spec is URL-scoped to its own hub path per the ticket 0094
  Implementation log, so the sibling on `/accessibility-statement`
  cannot collide. Document the grep result in the Implementation log.
- Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the spec's
  em-dash assertion filters the block list to the two `@type`s THIS
  page emits before iterating; it does NOT loop over every
  `application/ld+json` script on the page.
- Per the 2026-09-05 route-code-splitting lesson, the new page's e2e
  helper waits for the RouteFallback to detach AND for the hero H1 to
  be visible before probing the DOM. Do NOT rely on
  `root.innerHTML.length > 500` alone.
- Per the 2026-09-06 VISIBLE_LIMIT lesson, the row-count assertion in
  the spec uses `toHaveCount(RECENT_REMEDIATIONS.length)` over the
  imported constant, NOT `count > 0` over a live derived state.
- Per the 2026-06-07 mirror-source-across-src-tests lesson, the spec
  imports `CONFORMANCE_TARGET` and `RECENT_REMEDIATIONS` from
  `src/data/accessibilityStatement.ts` directly, and `ROUTES` from
  `src/data/routes.ts` directly; do NOT hand-roll copies in the test
  file.
- Per the 2026-06-15 attribute-list regex lesson, any regex in the
  spec that matches an XML/HTML attribute list uses `[^>]*`, not
  `[^/>]*`.
- `tests/e2e/accessibility-statement.spec.ts` (new) - one assertion
  per acceptance box. Model the spec on
  `tests/e2e/ai-risks-we-watch.spec.ts` (ticket 0094), the freshest
  predecessor spec for a dated-trust-artifact page.
- Per the 2026-05-22 two-PR ship lesson, ship will need a follow-up
  `chore/0097-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter AND its `docs/backlog/README.md` index row to
  `shipped` together; run `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index never drift mid-flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, and Tailwind utility classes
  already in use across the trust-artifact family. Schema migration: no.
  Privacy / security surface change: no (the page renders static content
  with no new localStorage key and no new outbound network call; the
  mailto: link opens the visitor's own mail client and is not a network
  request).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-26 - branch `feat/0097-accessibility-statement-page` opened; ticket
  flipped to `in-progress` in the ticket file frontmatter AND the
  `docs/backlog/README.md` index row in the same commit
  (`node scripts/check-backlog.mjs` green).
- 2026-09-26 - grepped every `tests/e2e/*-jsonld.spec.ts` and
  `tests/e2e/*.spec.ts` for `=== 'CollectionPage'`, `=== 'BreadcrumbList'`,
  `toHaveLength(1)` predicates over CollectionPage / BreadcrumbList per the
  2026-05-30 second-@type lesson. Every predecessor is URL-scoped to its own
  page path (`/compare` ticket 0048, `/case-studies` ticket 0057,
  `/subprocessors` ticket 0069, `/ai-for-hospitality` ticket 0071,
  `/ethics` ticket 0077, `/blog` ticket 0079, `/model-card` ticket 0088,
  `/agent-fleet` ticket 0090, `/ai-risks-we-watch` ticket 0094), so the
  sibling `/accessibility-statement`-scoped blocks cannot collide.
- 2026-09-26 - failing test added in
  `tests/e2e/accessibility-statement.spec.ts` per the 2026-05-30 write-tests-
  before-code convention.
- 2026-09-26 - page + data file + route + Trust chip + Footer chip shipped;
  dark-mode variants mirror `AiRisksWeWatch.tsx` verbatim; every remediation
  row cites a real dated shipped change in the last 90 days grepable from
  `git log --since="2026-06-28"`.
- 2026-09-26 - `dist/sitemap.xml` confirmed to include `/accessibility-statement`
  after a local `npm run build` (auto-emitted by `scripts/generate-sitemap.ts`
  from the `<Route path=".../>` scan; no manual XML edit).
