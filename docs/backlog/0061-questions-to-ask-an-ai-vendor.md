---
id: 0061
title: Public /questions-to-ask-an-ai-vendor buyer-side artifact with FAQPage JSON-LD
status: shipped
priority: P1
area: content
created: 2026-06-19
owner: gtm-innovation
---

## User story

As a buyer-side evaluator (a VP of operations weighing
three AI vendors before a board update, an owner-operator
two weeks before signing with whoever sounds most honest,
an in-house IT lead asked by the owner to write the
shortlist of vendor questions), Googling "questions to ask
an AI vendor," "AI receptionist vendor checklist," or
"how to evaluate AI automation companies" on a laptop the
night before a vendor call, I want one honest public page
at `/questions-to-ask-an-ai-vendor` that lists 10-12
specific, defensible questions a buyer should ask any AI
services vendor (covering data handling, model and
provider transparency, pricing model, deployment process,
what breaks when the AI fails, and how to exit the
contract), each with a one-paragraph "why this matters"
explainer in plain language, so that I can bookmark the
URL, forward it to my team, walk into the next vendor
call with a written checklist, and treat the vendor's
own answers on this page as evidence the vendor will
answer the same questions honestly when I ask them.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: every shipped
trust artifact today answers ONE specific question. The
`/trust` page (ticket 0018) answers "where does my data
go." The `/uptime` page (ticket 0036) answers "is the
service up." The `/playbook` page (ticket 0059) answers
"what is your deployment process." The `/changelog` page
(ticket 0032) answers "how often do you ship." None of
those four surfaces gives a buyer a CHECKLIST of
questions to ask. This ticket adds exactly one new
content page that fills that gap. The page is static
marketing copy modeled on the `/playbook` page-shell
pattern (Navbar, Footer, ScrollProgress, Helmet,
sectioned content with anchor links), reads its 10-12
question entries from a single module-level constant
(`VENDOR_QUESTIONS`), and emits a `FAQPage` JSON-LD
block so search engines can index the checklist as a
structured artifact eligible for FAQ rich results. No
new backend, no new data, no new dependency, no edit to
any existing page outside the strict trust-page
disclosure widen.

### Stakeholder

This widens the moat in a structurally durable way: a
public buyer-checklist artifact is the single piece of
content most often shared in late-stage vendor research
("read this before our call") and producing it as a
canonical URL the prospect can audit before the call
shifts the conversation from "convince me you are not
hiding anything" to "here is how we answer question
three." The FAQPage JSON-LD opens FAQ rich-result
eligibility on the same query class the pricing FAQ
(ticket 0012) and the per-vertical FAQs on
`/realestate`, `/homeservices`, `/restaurant`,
`/autorepair` already target, but on a buyer-side query
class none of those five surfaces touch
("questions to ask AI vendor," not "how much does AI
cost"). Per the 2026-05-30 second-@type lesson, BEFORE
writing code the implementer greps every
`tests/e2e/*-jsonld.spec.ts` AND
`tests/e2e/pricing-faq-structured-data.spec.ts` for
`=== 'FAQPage'` predicates; the pricing-FAQ predecessor
spec is per-URL scoped (its `mine` filter narrows the
FAQPage block by mainEntity question set, not by site-
wide uniqueness), and the per-vertical FAQ specs go to
their vertical URL first, so a new `/questions-to-ask-
an-ai-vendor`-scoped FAQPage block does not collide
with any prior assertion. The grep is mandatory
regardless and the result is documented in the
Implementation log. The page also indirectly extends the
trust-class artifact set the buyer encounters between
SERP click and demo book: `/trust` describes data flow,
`/playbook` describes process, this page hands them
the questions to ask anyone (including us). That
structural posture (we publish the checklist BEFORE the
sales call) is what a discerning buyer rewards.

### Visitor (in the real moment of use)

A VP of operations doing late-stage vendor research on
a laptop opens `/questions-to-ask-an-ai-vendor` from a
colleague's Slack message: "use this in tomorrow's
call." The page loads with a hero H1 ("Questions to
Ask Any AI Services Vendor Before You Sign"), a one-
paragraph intro framing the page as buyer-side
ammunition (not a sales pitch), then 10-12 sectioned
question blocks (each with its own anchor link so the
URL can deep-link to a single question): each block
shows the question as an H2, a one-paragraph "why this
matters" explainer naming what the vendor's evasive
answer would reveal, and where applicable a small
"how Digital Craft answers this" line linking to the
existing artifact that already answers it (the data-
handling row links to `/trust`, the process row links
to `/playbook`, the uptime row links to `/uptime`,
the changelog row links to `/changelog`, the
comparison row links to `/compare`). No fabricated
efficacy percentages, no client names, no
testimonials, no fake-urgency CTA. At the bottom: one
strategy-call CTA. Light and dark mode supported; the
page reads cleanly on a 375px viewport. The visitor
prints the page (or copies the URL into their Notes
app) and walks into the next vendor call with a real
checklist.

### Growth

The "show me" moment is the URL a VP forwards to their
CFO: "this is the actual checklist - read it before
tomorrow's call." That is the single artifact most
likely to convert a stalled deal because it removes the
"do they have something to hide" objection without
requiring a sales call (the answer to every question
already lives on a separate canonical artifact). Per
the ticket 0018 `/trust` precedent, the ticket 0059
`/playbook` precedent, and the ticket 0048 `/compare`
hub precedent, a public artifact that the buyer can
audit without a login is the cheapest acquisition lever
the site has. Each question's anchor link fires
`trackCTAClick` with a `vendor_questions_q<N>` location
label so the funnel can identify which questions block
the most prospects; the bottom strategy-call CTA fires
`trackCTAClick('vendor_questions_strategy_call', 'vendor_questions')`.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/QuestionsToAskAnAiVendor.tsx` (new file, under 300 lines) renders at `/questions-to-ask-an-ai-vendor`. The page uses the existing `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell mirrored from `src/pages/Playbook.tsx` (ticket 0059, the closest structural peer because both are static buyer-class surfaces emitting structured-data blocks and rendering sectioned content with anchor links). The page renders a hero (H1 contains "Questions to Ask" - case-insensitive substring), a one-paragraph intro framing the page as buyer-side ammunition, 10-12 sectioned question blocks (each with an `id="q-N"` anchor for deep-linking, an H2 question title, a one-paragraph "why this matters" explainer, and where applicable a small "how Digital Craft answers this" line linking to the existing artifact that already answers it), and one strategy-call CTA at the bottom. Every claim is defensible per the AGENTS.md rule: no invented efficacy numbers, no client names, no testimonials, no "9 out of 10 AI vendors lie about X" style fabrications.
- [ ] The page exports 10-12 entries from a module-level constant `VENDOR_QUESTIONS: readonly VendorQuestion[]` where each `VendorQuestion` has `{ id, question, whyItMatters, ourAnswerHref, ourAnswerLabel }` typed fields, `ourAnswerHref` and `ourAnswerLabel` optional. The rendered question blocks read from this constant per the 2026-05-25 mirror-source rule so the FAQPage JSON-LD and the visible rendering cannot drift. Required topics covered (the implementer picks the exact phrasing): data handling and where customer data goes; model and provider transparency; pricing model and what happens on churn; deployment process; what breaks when the AI is wrong; uptime track record; ship velocity track record; comparison-of-comparable vendors; exit and data-export terms; security posture; defensible efficacy claims; cross-vertical generalization. The `ourAnswerHref` values, where present, MUST resolve to a route in `ROUTES` from `src/data/routes.ts` (the canonical allow-list per the 2026-06-07 src-imports-tests lesson). Suggested mappings: data handling -> `/trust`, process -> `/playbook`, uptime -> `/uptime`, ship velocity -> `/changelog`, comparison -> `/compare`.
- [ ] The page emits TWO JSON-LD blocks inside the existing `<Helmet>` head: (1) a `BreadcrumbList` (Home -> Questions to Ask an AI Vendor) mirroring the shape used in `src/pages/Playbook.tsx`, and (2) a `FAQPage` block with `@type: 'FAQPage'` and a `mainEntity` array where each element is `{ '@type': 'Question', name: <vendorQuestion.question>, acceptedAnswer: { '@type': 'Answer', text: <vendorQuestion.whyItMatters> } }`. The mainEntity array is derived from `VENDOR_QUESTIONS.map(...)` so a future change to the question content updates both the visible rendering and the schema in one place. The acceptedAnswer text is the plain-text "why this matters" explainer, NOT a marketing answer (the page is buyer-side; the FAQPage block must read as a buyer artifact too, not as a sales pitch in disguise).
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` AND `tests/e2e/pricing-faq-structured-data.spec.ts` for `=== 'FAQPage'` predicates AND `=== 'BreadcrumbList'` predicates and documents the result in the Implementation log. The FAQPage grep is expected to return matches in the pricing-faq spec and on per-vertical pages (`src/pages/RealEstate.tsx`, `AutoRepair.tsx`, `HomeServices.tsx`, `Restaurant.tsx` per the 2026-06-19 inventory) - the implementer confirms each predecessor predicate identifies its block by URL scoping (the spec calls `page.goto('/pricing')` or similar BEFORE the FAQPage filter) and no predicate is "exactly one FAQPage block site-wide." Per the 2026-05-25 mirror-source-fix family rule, if any predecessor predicate IS site-wide, the implementer widens it (by mainEntity question-set match) in the SAME PR.
- [ ] The route is registered in `src/App.tsx` next to the existing `/playbook` route. `/questions-to-ask-an-ai-vendor` is added to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson; `tests/e2e/routes.ts` re-exports it automatically and the smoke spec exercises the page. The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically and emits a `lastmod` from the commit date.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text, in the `VENDOR_QUESTIONS` constant strings, or in any JSON-LD serialized string. Every question block has a working anchor link such that `GET /questions-to-ask-an-ai-vendor#q-3` scrolls to the third question block on initial load (mirror the `useEffect(() => { document.getElementById(hash.slice(1))?.scrollIntoView(); }, [])` pattern from ticket 0059's `/playbook` page). The strategy-call CTA opens calendly in a new tab with `rel="noopener noreferrer"`.
- [ ] A new e2e spec at `tests/e2e/questions-to-ask-an-ai-vendor.spec.ts` (modeled on `tests/e2e/playbook.spec.ts`) asserts: (1) `GET /questions-to-ask-an-ai-vendor` returns 200 and the H1 contains "Questions to Ask" (case-insensitive substring), (2) the page renders 10-12 question blocks (asserted by counting `data-testid="vendor-question"` locators against the imported `VENDOR_QUESTIONS.length` with `.toBeGreaterThanOrEqual(10)` and `.toBeLessThanOrEqual(12)` so a future copy edit that adds/removes a question does not red the spec out of the gate), (3) each question block carries an `id="q-N"` anchor where N is the 1-indexed position, (4) the `BreadcrumbList` JSON-LD has two items with the second one named matching the page H1 substring linking to `https://digitalcraftai.com/questions-to-ask-an-ai-vendor`, (5) the `FAQPage` JSON-LD block's `mainEntity` array length equals `VENDOR_QUESTIONS.length` AND each item is a `Question` with a non-empty `acceptedAnswer.text`, (6) navigating to `/questions-to-ask-an-ai-vendor#q-2` scrolls the second question block into view on initial load (asserted via `expect(page.locator('#q-2')).toBeInViewport()`), (7) the page text contains no `String.fromCharCode(8212)` code point, (8) dark mode renders cleanly via `document.documentElement.classList.add('dark')`, and (9) every `ourAnswerHref` value present in the rendered DOM resolves to a path in `ROUTES` imported from `tests/e2e/routes.ts`.
- [ ] No `/api/` change, no new hostname (the only external link is the existing `calendly.com/mutaaf` URL already used across the site), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the existing `/trust`, `/playbook`, `/changelog`, `/uptime`, `/compare`, or `src/components/PricingFAQ.tsx` files, no edits to `src/pages/RealEstate.tsx` / `AutoRepair.tsx` / `HomeServices.tsx` / `Restaurant.tsx` FAQPage blocks. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; the existing `tests/e2e/pricing-faq-structured-data.spec.ts` and `tests/e2e/playbook.spec.ts` and every other JSON-LD spec stay green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A "Digital Craft answers" expansion section that
  provides our marketing answer to each question inline
  on the page. The page is buyer-side ammunition, not a
  sales surface; the "how Digital Craft answers this"
  links route to the existing canonical artifact
  (`/trust`, `/playbook`, etc.). Inlining our answer
  would convert a buyer-checklist page into a marketing
  page and undermine the artifact's credibility.
- A downloadable PDF or printable share-link version of
  the checklist. The page itself is the shareable
  artifact (one URL the buyer forwards or prints from
  the browser); a PDF would require a heavy library
  (jsPDF or similar) and a new dependency, both Hard NO.
- An interactive "score the vendor's answers" widget. A
  vendor-scoring quiz is a separate conversion ticket
  and would compete with the AI Readiness Quiz (ticket
  0039) for attention.
- A FAQPage block whose `acceptedAnswer.text` is a
  marketing answer rather than the buyer-side "why this
  matters" explainer. The acceptedAnswer must mirror the
  visible explainer per the 2026-05-25 mirror-source
  rule so the schema cannot drift from the visible
  artifact into a sales pitch.
- A HowTo JSON-LD block on the page. HowTo is the
  schema family `/playbook` (ticket 0059) owns; emitting
  a second site-wide HowTo would force the 2026-05-30
  second-@type collision audit on the playbook spec
  unnecessarily and the artifact here is a checklist,
  not a stepped process.
- Cross-promoting the page from the navbar or footer.
  Cross-surface promotion is its own conversion ticket
  once telemetry shows the page earns organic traffic;
  the `/trust` footer chip (ticket 0023) is the
  precedent that a chip ships on its own ticket only
  after the page is shown to earn clicks.
- Adding the page to the `index.html` SEO Pilot pages
  table. That is its own SEO-hygiene ticket per the
  2026-05-25 SEO Pilot lesson; the page is not in the
  table and the spec asserts the Helmet-managed
  `meta[name="description"]` directly, not
  `page.toHaveTitle()`.
- A blog post pointing at the new page. Blog content
  ships through `src/data/blogPosts.ts` and is gated by
  `check-blog-dates`; cross-promotion is its own
  content ticket.
- Internationalization (`inLanguage` fields on the
  FAQPage schema). The page is English-only matching
  every existing buyer-class surface.
- A linked-data `Review` block on the page. The page is
  a question checklist, not a review surface; emitting
  Review without a real attributed reviewer would
  violate the AGENTS.md defensible-claims rule.
- A vendor-comparison table. The `/compare` hub (ticket
  0048) owns side-by-side vendor comparison; duplicating
  that on the checklist page would create drift and
  conflate two distinct buyer-side artifacts.
- A persistent client-side store of which questions the
  visitor "checked off." Browser state would invite a
  cross-device-sync ticket and the page is intentionally
  stateless (the buyer forwards a URL, not a session
  cookie).
- A live "ask the AI this question" widget. The page is
  static buyer-side content; threading the demo agents
  into it would conflate a methodology artifact with a
  demo surface.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/QuestionsToAskAnAiVendor.tsx` (under
  300 lines). Mirror the page-shell pattern of
  `src/pages/Playbook.tsx` (ticket 0059, Navbar,
  Footer, ScrollProgress, Helmet, sectioned content
  with anchor links, two JSON-LD blocks). Define
  module-level constants `META_DESCRIPTION`, `PAGE_H1`,
  `VENDOR_QUESTIONS`, `BREADCRUMB_SCHEMA`, `FAQPAGE_SCHEMA`
  per the 2026-05-25 mirror-source rule (the
  description used in the Helmet meta tag and the H1
  used in the BreadcrumbList second item MUST each be
  a single constant; `FAQPAGE_SCHEMA.mainEntity` MUST
  be derived from `VENDOR_QUESTIONS.map(...)`, not
  inlined separately).
- `VENDOR_QUESTIONS` is typed as
  `readonly VendorQuestion[]` where
  `interface VendorQuestion { id: string; question: string; whyItMatters: string; ourAnswerHref?: string; ourAnswerLabel?: string }`.
  The constant has 10-12 entries. The visible rendering
  AND the FAQPage `mainEntity` array both derive from
  this single constant; do NOT inline-duplicate the
  question text in two places. Each `id` is a short
  kebab-case identifier (e.g. `data-handling`,
  `pricing-model`) used as the anchor suffix; the
  rendered anchor is `q-<index>` with the 1-indexed
  position (so the URL fragment is stable against a
  future reorder, since the index moves but the spec's
  predicate is "id matches `q-<N>`").
- New route in `src/App.tsx`: import
  `QuestionsToAskAnAiVendor` from
  `./pages/QuestionsToAskAnAiVendor` and add
  `<Route path="/questions-to-ask-an-ai-vendor" element={<QuestionsToAskAnAiVendor />} />`
  next to the existing `/playbook` route. Mirror the
  (non-)lazy-loading convention of the adjacent
  `/playbook` route.
- Per the 2026-06-07 src-imports-tests lesson, add
  `/questions-to-ask-an-ai-vendor` to the `ROUTES`
  array in `src/data/routes.ts` (the canonical allow-
  list); `tests/e2e/routes.ts` re-exports it
  automatically and the smoke spec exercises the page.
- Per the 2026-05-30 second-@type lesson, BEFORE
  writing code grep `tests/e2e/pricing-faq-structured-data.spec.ts`
  and `tests/e2e/*-jsonld.spec.ts` for
  `=== 'FAQPage'` AND `=== 'BreadcrumbList'`
  predicates. Document the grep result in the
  Implementation log. The pricing-FAQ spec's `mine`
  filter narrows the FAQPage block by mainEntity
  question-set match (per the comment block at
  pricing-faq-structured-data.spec.ts:9-13), and the
  per-vertical pages emit their own page-level
  FAQPage but their specs go to vertical URLs first,
  so all existing predicates are URL-scoped and a new
  `/questions-to-ask-an-ai-vendor`-scoped FAQPage
  block does not collide. If the grep surfaces any
  site-wide-uniqueness predicate, the implementer
  widens it in the SAME PR per the 2026-05-25 mirror-
  source-fix rule (do NOT ship a knowingly-red
  sibling test).
- Per the 2026-05-25 SEO Pilot lesson, the new e2e
  spec asserts the Helmet-managed
  `meta[name="description"]` content directly (LAST
  `meta[name="description"]` per the 2026-05-25
  Helmet-appends lesson), NOT `page.toHaveTitle()`.
  `/questions-to-ask-an-ai-vendor` is NOT in the
  `index.html` SEO Pilot pages table.
- Per the 2026-05-07 em-dash Hard NO, every string in
  the page module (the H1, the META_DESCRIPTION, the
  10-12 VENDOR_QUESTIONS questions and whyItMatters
  paragraphs, the ourAnswerLabel strings, the JSON-
  LD strings, the CTA label) uses hyphens. Self-
  Review greps the diff for
  `String.fromCharCode(8212)` before pushing.
- Anchor-link deep-linking: mirror the
  `useEffect(() => { window.location.hash && document.getElementById(window.location.hash.slice(1))?.scrollIntoView(); }, [])`
  pattern from `src/pages/Playbook.tsx`. The handler
  must guard against `null` (an unknown hash) and
  must NOT throw on a server-side or test context
  that lacks `window`.
- `tests/e2e/questions-to-ask-an-ai-vendor.spec.ts`
  (new) - one assertion per acceptance box. Model the
  spec on `tests/e2e/playbook.spec.ts` (ticket 0059,
  the closest peer for "static page with two JSON-LD
  blocks and anchor sections"). The deep-link scroll
  assertion uses
  `page.goto('/questions-to-ask-an-ai-vendor#q-2')`,
  `await page.waitForLoadState('domcontentloaded')`,
  then `expect(page.locator('#q-2')).toBeInViewport()`
  with a reasonable timeout. The
  `ourAnswerHref`-resolves-to-`ROUTES` assertion uses
  `page.locator('[data-testid="vendor-question-answer-link"]').evaluateAll(...)`
  to collect every href and filter against the
  imported `ROUTES` set.
- Per the 2026-05-22 two-PR ship lesson, ship will
  need a follow-up `chore/0061-ship-status` PR after
  the feat PR merges to flip the ticket frontmatter
  AND its `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing
  the second PR so the file and index never drift
  mid-flip.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, the existing
  Navbar / Footer / ScrollProgress components, and
  the existing `trackCTAClick` helper. Schema
  migration: no. Privacy/security surface change:
  no - the page is static marketing copy and emits
  no new network call; the only external link is the
  existing calendly URL already disclosed on
  `/trust` per ticket 0018.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-06-19 - branch `feat/0061-questions-to-ask-an-ai-vendor` opened off fresh `origin/main`; ticket flipped to in-progress and README index row updated in the same commit; `node scripts/check-backlog.mjs` green at start.
- 2026-06-19 - Mandatory pre-write JSON-LD grep per the 2026-05-30 second-@type lesson:
  - `grep -rn "=== 'FAQPage'" tests/e2e/` returned ONE match: `tests/e2e/pricing-faq-structured-data.spec.ts:88` - its `findComponentFaqPage` filter (lines 93-104) narrows by mainEntity question-set match (`mine` filter), and the spec only navigates to `/construction` and `/realestate` (PAGES constant on line 17). Per-URL scoped; not a site-wide-uniqueness predicate. No collision.
  - `grep -rn "=== 'BreadcrumbList'" tests/e2e/` returned 30+ matches across `compare-hub`, `ai-for-*`, `compare-*`, `quiz-jsonld`, `roi-calculator`, `case-studies-hub`, `case-study-article-jsonld`, `changelog-itemlist-jsonld`, `trust-aboutpage-jsonld`, `my-dashboard`, `texas-localbusiness-jsonld`, `playbook`, and `demo-breadcrumbs`. Every match is preceded by a `page.goto(<that-page's-url>)` call, so each BreadcrumbList predicate is URL-scoped to its own page. None is "exactly one BreadcrumbList block site-wide." No collision.
- 2026-06-19 - failing test added in `tests/e2e/questions-to-ask-an-ai-vendor.spec.ts`, confirmed red (page does not exist yet).
