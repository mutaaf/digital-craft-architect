---
id: 0059
title: Public /playbook methodology page describing how Digital Craft designs an AI deployment with HowTo JSON-LD
status: shipped
priority: P1
area: trust
created: 2026-06-17
owner: gtm-innovation
---

## User story

As a buyer-side technical evaluator (a VP of operations
researching how an AI-services vendor actually structures
a deployment before booking a strategy call, a competing
agency benchmarking methodology depth, an in-house
engineering lead at a 50-person construction firm asked
by the owner "do they have a real process or are they
just selling demos") visiting the site after a long-tail
SERP query like "how do AI services deployments work" or
"AI receptionist deployment process," I want one
canonical page at `/playbook` that lays out the four-step
deployment process Digital Craft uses (discovery and pain
mapping, demo personalization with the visitor's own
website data, pilot deployment scoped to one funnel,
review and expansion) in honest plain language with no
sales fluff and no fabricated case-study numbers, so that
I can decide whether the methodology is rigorous enough
to warrant a 30-minute strategy call before I commit
calendar time.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the methodology
already exists, it just is not rendered as a canonical
public artifact. Today the deployment process is
described in fragments across the homepage hero, the
demo-hub copy, the `/trust` data-handling page, and the
case-study detail pages, but no single URL carries the
process as a stepped artifact a researcher can bookmark
or forward. The `/trust` page (ticket 0018) owns data
handling; the `/uptime` page (ticket 0036) owns demo
health; the `/changelog` page (ticket 0032) owns ship
velocity; the `/case-studies` hub (ticket 0057 if shipped,
otherwise individual case-studies pages) owns proof. None
of those four surfaces describes HOW a deployment
actually unfolds step-by-step. This ticket adds exactly
one new page that fills that gap. The page is static
marketing copy modeled on the `/trust` page-shell
pattern (Navbar, Footer, ScrollProgress, Helmet,
sectioned content with anchor links), reads its four-
step content from a single module-level constant
(`PLAYBOOK_STEPS`), and emits a `HowTo` JSON-LD block so
search engines can index the methodology as a structured
artifact. No new backend, no new data, no new dependency,
no edit to any existing page.

### Stakeholder

This widens the moat in a structurally durable way: a
public methodology page is the single artifact most often
requested in late-stage buyer conversations ("show me your
process before I sign anything") and producing it as a
canonical URL the prospect can read before the call shifts
the conversation from "convince me your process exists"
to "let us go deeper on step three." The HowTo JSON-LD
also opens a new SERP rich-result eligibility (HowTo
results with stepped previews) that none of the existing
shipped pages target. Per the 2026-05-30 second-@type
lesson, BEFORE writing code the implementer greps every
`tests/e2e/*-jsonld.spec.ts` for `=== 'HowTo'` predicates;
no existing page emits HowTo today, so the grep is
expected to return zero matches and the new page sets
the precedent (the grep result is recorded so a future
sibling HowTo on a different surface knows how to widen).
The page also closes a credibility gap surfaced by the
ticket 0048 `/compare` hub: a researcher who clicks
through to a comparison page sees side-by-side feature
tables but no description of HOW DCA actually delivers,
which is the gap a methodology page closes. Pre-authorized
follow-up work is NOT strictly required for new trust
surfaces (per the 2026-05-22 bootstrap lesson the rule
covers eng-queue only; the GTM queue may originate net-
new trust surfaces when they fill a structural gap in the
existing artifact set), so this ticket originates on its
own merit.

### Visitor (in the real moment of use)

A VP of operations doing late-stage vendor research on a
laptop opens `/playbook` from a colleague's Slack message:
"read this before our call Tuesday." The page loads with
a hero H1 ("How We Deploy AI in Your Business"), a one-
paragraph intro naming the four steps in order, then four
sectioned blocks (each with its own anchor link so the
URL can deep-link to a step): (1) Discovery and pain
mapping (a 30-minute strategy call where DCA listens for
the specific funnel leakage to target), (2) Demo
personalization with the visitor's own website data (the
existing scrape-and-customize demos at
`/construction/demo` etc.), (3) Pilot deployment scoped
to one funnel (a 2-4 week pilot on a single intake or
follow-up funnel with weekly check-ins), (4) Review and
expansion (a documented review of pilot results, then a
decision to expand to additional funnels or wind down).
Each step block carries a one-sentence honest description,
two or three concrete activities the visitor will see,
and one "what you provide" line. No fabricated efficacy
percentages, no client names, no testimonials. At the
bottom: one strategy-call CTA. Light and dark mode
supported; the page reads cleanly on a 375px viewport.

### Growth

The "show me" moment is the URL a VP forwards to their
CFO: "this is their actual process, four steps, one
URL." That is the single artifact most likely to convert
a stalled deal because it removes the "do they even have
a process" objection without requiring a sales call. Per
the ticket 0018 `/trust` precedent and the ticket 0048
`/compare` hub precedent, a public artifact that the
buyer can audit without a login is the cheapest
acquisition lever the site has. Each step's anchor link
fires `trackCTAClick` with a `playbook_step_<N>` location
label so the funnel can identify which step blocks the
most prospects; the bottom strategy-call CTA fires
`trackCTAClick('playbook_strategy_call', 'playbook')`.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/Playbook.tsx` (new file, under 260 lines) renders at `/playbook`. The page uses the existing `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell mirrored from `src/pages/Trust.tsx` (the closest structural peer because both are static trust-class surfaces emitting a single structured-data block and rendering sectioned content with anchor links). The page renders a hero (H1 contains "Playbook" OR "How We Deploy" - the H1 string is decided in the implementation by what reads best, and the test asserts a substring match against the H1 constant exported from the module), a one-paragraph intro, four sectioned step blocks (each with an `id="step-N"` anchor for deep-linking, a step number badge, a step title, a one-sentence description, two-or-three bullet activities, and a "what you provide" line), and one strategy-call CTA at the bottom. Every claim is defensible per the AGENTS.md rule: no invented efficacy numbers, no client names, no testimonials, no "we have helped 200+ companies" style fabrications.
- [ ] The page exports four step entries from a module-level constant `PLAYBOOK_STEPS: readonly PlaybookStep[]` where each `PlaybookStep` has `{ number, title, description, activities, youProvide }` typed fields. The rendered step blocks read from this constant per the 2026-05-25 mirror-source rule so the HowTo JSON-LD and the visible step rendering cannot drift. The four steps are: (1) Discovery and pain mapping, (2) Demo personalization with your own website data, (3) Pilot deployment scoped to one funnel, (4) Review and expansion. The titles are NOT marketing slogans; they describe the actual activity.
- [ ] The page emits TWO JSON-LD blocks inside the existing `<Helmet>` head: (1) a `BreadcrumbList` (Home -> Playbook) mirroring the shape used in `src/pages/Trust.tsx`, and (2) a `HowTo` block with `@type: 'HowTo'`, `name` matching the page H1, `description` (same string as `META_DESCRIPTION` per the 2026-05-25 mirror-source rule), `totalTime: 'P4W'` (ISO 8601 duration representing four weeks, the typical pilot length), and a `step` array where each element is `{ '@type': 'HowToStep', position: N, name: <step.title>, text: <step.description>, url: 'https://digitalcraftai.com/playbook#step-<N>' }`. The step array is derived from `PLAYBOOK_STEPS.map(...)` so a future change to the step content updates both the visible rendering and the schema.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'HowTo'` predicates AND `=== 'BreadcrumbList'` predicates and documents the result in the Implementation log. The HowTo grep is expected to return zero matches (no existing page emits HowTo today); the BreadcrumbList grep is expected to return many matches, all URL-scoped per the existing convention. The implementer confirms no predecessor predicate is "exactly one HowTo block site-wide" (impossible since none exist) and no BreadcrumbList predicate would intercept a `/playbook`-scoped spec. The grep result is recorded so a future sibling HowTo on a different surface knows how to widen the new spec's assertion.
- [ ] The route is registered in `src/App.tsx` next to the existing `/trust` route. `/playbook` is added to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson; `tests/e2e/routes.ts` re-exports it automatically and the smoke spec exercises the page. The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in any JSON-LD serialized string, and every step block has a working anchor link such that `GET /playbook#step-2` scrolls to the second step block on initial load (the implementer adds a `useEffect` that calls `document.getElementById(hash.slice(1))?.scrollIntoView()` on mount if a hash is present, mirroring the existing `/trust` deep-link pattern if it ships one, otherwise the small inline pattern is added in the new page). The strategy-call CTA opens calendly in a new tab with `rel="noopener noreferrer"`.
- [ ] A new e2e spec at `tests/e2e/playbook.spec.ts` asserts: (1) `GET /playbook` returns 200 and the H1 contains "Playbook" OR "How We Deploy" (case-insensitive substring), (2) the page renders four step blocks (asserted by counting `data-testid="playbook-step"` locators against the imported `PLAYBOOK_STEPS.length`), (3) each step block carries an `id="step-N"` anchor where N is 1-4, (4) the `BreadcrumbList` JSON-LD has two items with the second one named "Playbook" (or matching the H1 constant) linking to `https://digitalcraftai.com/playbook`, (5) the `HowTo` JSON-LD block's `step` array length equals 4 AND each step's `url` matches `/^https:\/\/digitalcraftai\.com\/playbook#step-\d$/`, (6) navigating to `/playbook#step-3` scrolls the third step block into view on initial load (asserted via Playwright's `expect(page.locator('#step-3')).toBeInViewport()` after navigation), (7) the page text contains no `String.fromCharCode(8212)` code point, and (8) dark mode renders cleanly via `document.documentElement.classList.add('dark')`.
- [ ] No `/api/` change, no new hostname (the only external link is the existing `calendly.com/mutaaf` URL already used across the site), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the existing `/trust`, `/uptime`, `/changelog`, or homepage source files. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; every existing JSON-LD spec (tickets 0012, 0013, 0016, 0025, 0030, 0039, 0043, 0044, 0048, 0051, 0054) stays green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A multi-step interactive walk-through (a stepper UI that
  collapses sections, an inline "schedule discovery call"
  micro-form inside step 1, etc.). The page is a static
  artifact for buyer-side reading; an interactive flow is
  its own conversion ticket once telemetry shows the
  static page earns clicks.
- A FAQPage JSON-LD block on the page. The `/pricing`
  FAQ (ticket 0012) already owns that schema family; a
  separate FAQ on `/playbook` would duplicate the
  schema-rich-result eligibility without adding new
  content.
- A `Service` JSON-LD block. The page describes a
  deployment process, not a productized service; HowTo
  is the correct schema and adding Service would
  misrepresent the artifact and trigger the 2026-05-30
  second-@type collision audit unnecessarily.
- Cross-promoting the page from the navbar or footer.
  Cross-surface promotion is its own conversion ticket
  once telemetry shows the page earns organic traffic.
  The `/trust` page footer chip (ticket 0023) is the
  precedent; a `/playbook` chip is a follow-up.
- Adding `/playbook` to the `index.html` SEO Pilot
  pages table. That is its own SEO-hygiene ticket per
  the 2026-05-25 SEO Pilot lesson.
- A blog post pointing at `/playbook`. Blog content
  ships through the `src/data/blogPosts.ts` pipeline
  gated by `check-blog-dates`; cross-promotion is its
  own content ticket.
- Internationalization (`inLanguage` fields on the
  HowTo schema). The page is English-only matching
  every existing trust-class surface.
- A downloadable PDF or shareable share-link version
  of the playbook. The page itself is the shareable
  artifact (one URL the buyer forwards); a PDF would
  require a heavy library (jsPDF or similar) and a
  new dependency, both Hard NO.
- An "estimated cost" section. Pricing is owned by
  the homepage pricing component and the route-aware
  pricing CTA (ticket 0003); duplicating it on
  `/playbook` would create drift.
- A linked-data `Person` block for the deploying
  engineer. The page describes a methodology, not an
  individual; emitting Person without a real named
  identity would violate the AGENTS.md defensible-
  claims rule.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/Playbook.tsx` (under 260 lines).
  Mirror the page-shell pattern of `src/pages/Trust.tsx`
  (Navbar, Footer, ScrollProgress, Helmet, sectioned
  content with anchor links and a single trust-class
  hero). Define module-level constants `META_DESCRIPTION`,
  `PLAYBOOK_H1`, `PLAYBOOK_STEPS`, `BREADCRUMB_SCHEMA`,
  `HOWTO_SCHEMA` per the 2026-05-25 mirror-source rule
  (the description used in the Helmet meta tag and in
  `HOWTO_SCHEMA.description` MUST be the same
  `META_DESCRIPTION` constant; the H1 string and
  `HOWTO_SCHEMA.name` MUST be the same `PLAYBOOK_H1`
  constant).
- `PLAYBOOK_STEPS` is typed as
  `readonly PlaybookStep[]` where
  `interface PlaybookStep { number: 1 | 2 | 3 | 4; title: string; description: string; activities: readonly string[]; youProvide: string }`.
  The constant has exactly four entries. The visible
  step rendering AND the HowTo schema step array both
  derive from this single constant; do NOT inline-
  duplicate the step text in two places.
- New route in `src/App.tsx`: import `Playbook` from
  `./pages/Playbook` and add
  `<Route path="/playbook" element={<Playbook />} />`
  next to the existing `/trust` route. Mirror the
  (non-)lazy-loading convention of the adjacent
  `/trust` route.
- Per the 2026-06-07 src-imports-tests lesson, add
  `/playbook` to the `ROUTES` array in
  `src/data/routes.ts` (the canonical allow-list);
  `tests/e2e/routes.ts` re-exports it automatically
  and the smoke spec exercises the page.
- Per the 2026-05-30 second-@type lesson, BEFORE
  writing code grep `tests/e2e/*-jsonld.spec.ts` for
  `=== 'HowTo'` AND `=== 'BreadcrumbList'` predicates.
  Document the grep result in the Implementation log.
  No existing page emits a HowTo block today (this is
  the first), so the HowTo predicate grep is expected
  to return zero matches; the BreadcrumbList grep is
  expected to return many matches, all per-URL scoped.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e
  spec asserts the Helmet-managed
  `meta[name="description"]` content directly (LAST
  `meta[name="description"]` per the 2026-05-25
  Helmet-appends lesson), NOT `page.toHaveTitle()`.
  `/playbook` is not in the `index.html` SEO Pilot
  pages table.
- Per the 2026-05-07 em-dash Hard NO, every string in
  the page module (the H1, the META_DESCRIPTION, the
  four PLAYBOOK_STEPS titles and descriptions and
  activities and youProvide lines, the JSON-LD
  strings, the CTA label) uses hyphens. Self-Review
  greps the diff for `String.fromCharCode(8212)`
  before pushing.
- Anchor-link deep-linking: add a small `useEffect`
  on mount that reads `window.location.hash` and, if
  present and non-empty, calls
  `document.getElementById(hash.slice(1))?.scrollIntoView()`
  in a `requestAnimationFrame` callback so the scroll
  fires after the step blocks render. The handler
  must guard against `null` (an unknown hash) and
  must NOT throw on server-side or test contexts that
  lack `window`.
- `tests/e2e/playbook.spec.ts` (new) - one assertion
  per acceptance box. Model the spec on
  `tests/e2e/trust-aboutpage-jsonld.spec.ts` (the
  closest peer for "trust-class static page with one
  JSON-LD block and anchor sections"). The deep-link
  scroll assertion uses
  `page.goto('/playbook#step-3')`,
  `await page.waitForLoadState('domcontentloaded')`,
  then `expect(page.locator('#step-3')).toBeInViewport()`
  with a reasonable timeout.
- Per the 2026-05-22 two-PR ship lesson, ship will
  need a follow-up `chore/0059-ship-status` PR after
  the feat PR merges to flip the ticket frontmatter
  AND its `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing the
  second PR so the file and index never drift mid-
  flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, the existing
  Navbar / Footer / ScrollProgress components, and
  the existing `trackCTAClick` helper. Schema
  migration: no. Privacy/security surface change:
  no - the page is static marketing copy and emits
  no new network call. The /trust page disclosure
  list does NOT need an edit because no new
  persistent store is added.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-06-17 - branch `feat/0059-playbook-methodology-page` opened.
- 2026-06-17 - Pre-write JSON-LD predicate grep (per the 2026-05-30 second-@type lesson):
  - `grep -rn "=== 'HowTo'" tests/e2e/` returned ZERO matches. `/playbook` is the first surface site-wide to emit a HowTo JSON-LD block, so no predecessor "exactly one HowTo block site-wide" predicate could collide.
  - `grep -rn "=== 'BreadcrumbList'" tests/e2e/` returned many matches across `tests/e2e/*-jsonld.spec.ts` and other specs (trust-aboutpage-jsonld, changelog-itemlist-jsonld, quiz-jsonld, texas-localbusiness-jsonld, case-study-article-jsonld, the `ai-for-*` specs, the `compare/*` specs, my-dashboard, roi-calculator, demo-breadcrumbs, case-studies-hub, compare-hub). Each predecessor predicate is URL-scoped: the spec calls `page.goto('/trust')` or `/changelog` or `/quiz` or `/case-studies/...` etc. before counting BreadcrumbList blocks, so adding a new `/playbook`-scoped BreadcrumbList block cannot intercept any of them. The new spec is URL-scoped the same way (`page.goto('/playbook')`).
- 2026-06-17 - failing test added in `tests/e2e/playbook.spec.ts`.
- 2026-06-17 - feat PR opened, watching CI.
