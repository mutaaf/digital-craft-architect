---
id: 0039
title: Emit Quiz JSON-LD on the AI Readiness Quiz for question-rich-result eligibility
status: groomed
priority: P2
area: seo
created: 2026-06-07
owner: gtm-innovation
---

## User story

As a business owner searching for "AI readiness quiz" or
"is my business ready for AI," I want Google to surface the
DigitalCraft AI Readiness Quiz with a rich, quiz-shaped result
that names the questions and the persona outcomes, so that the
SERP listing reads as a real assessment artifact and I click
through with intent to actually take it instead of bouncing on
the first ambiguous summary line.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: `/quiz` is a real,
working seven-question assessment that already collects answers,
scores them by point total, places the visitor in one of three
personas (Just Starting, Getting Smart, AI-Ready), and renders a
recommendation block. The page has zero structured data today
(grep `<script type="application/ld+json"` against
`src/pages/AIReadinessQuiz.tsx` returns nothing). The
seven-question + three-persona shape maps directly onto
schema.org `Quiz` (with `hasPart: Question[]`) and `EducationalAudience`,
and the recommendation block maps onto
`assesses: 'AI automation readiness for small business'`. One
JSON-LD block inside the existing Helmet head publishes the
structure without changing one line of UI copy or the quiz
flow. No new endpoint, no new component, no new dependency.

### Stakeholder

This widens the SEO moat in a content class no comparison page,
landing page, or trust page can earn: a canonical assessment
artifact. The quiz is the only DigitalCraft surface that takes
visitor input and returns a personalized persona in under two
minutes; structured data is the prerequisite to Google ever
displaying it as a `Quiz` rich result (the same way the
pricing-FAQ ticket 0012 emitted FAQPage to earn the FAQ rich
result). Same pattern as the `DefinedTermSet` ticket 0013
applied to glossary: take a uniquely-shaped artifact already
shipped and publish its shape to crawlers. The quiz also feeds
the email capture (ticket 0002 / 0015 family), so any SERP-side
visibility lift compounds across the funnel.

### Visitor (in the real moment of use)

A small-business owner Googles "am I ready for AI" on a phone.
The SERP listing for `/quiz` shows the page title, the meta
description, and (after this ticket and Google's normal indexing
cycle) the first one or two quiz questions surfaced as a rich
preview. The visitor recognises "this is an actual quiz, not a
sales page" and clicks. On `/quiz` itself, nothing visible
changes (the JSON-LD is head-only); the quiz still loads,
renders, scores, and routes to the recommendation block exactly
as today. No new UI element, no new input, no copy change.

### Growth

The "show me" moment is the Google rich-results test
(`search.google.com/test/rich-results`) returning a green
`Quiz`-detected card for `/quiz`. That is the single screenshot
the Product Owner can paste into a stakeholder review as proof
the assessment is indexable. A returning visitor who lands on
the SERP for "AI readiness quiz" is by construction
high-intent; structured data is the cheapest, most defensible
lever to compete for that listing position against the dozen
generic articles that currently own page one.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A `Quiz` JSON-LD block is emitted inside the existing `<Helmet>` head of `src/pages/AIReadinessQuiz.tsx` via `<script type="application/ld+json">`. The block's `@context` is `https://schema.org`, its `@type` is `Quiz`, and it carries: `name: 'AI Readiness Quiz'`, `description` (same string as the Helmet meta description per the 2026-05-25 mirror-source rule), `educationalUse: 'Self-Assessment'`, `assesses: 'AI automation readiness for small business operations'`, `provider: { '@type': 'Organization', name: 'DigitalCraft AI', url: 'https://digitalcraftai.com' }`, and `hasPart: Question[]` with one entry per quiz question in `QUESTIONS`. Each `Question` entry has `@type: 'Question'`, `name: <the question text>`, `eduQuestionType: 'Multiple choice'`, and `suggestedAnswer: Answer[]` listing each option's label as `text`. No `acceptedAnswer` is emitted (the quiz is a scoring instrument, not a single-correct-answer test; emitting an acceptedAnswer would lie about the schema's semantics).
- [ ] The JSON-LD `hasPart` array length equals `QUESTIONS.length` (today 7). The implementer does NOT hardcode 7; the JSON-LD is built by mapping over the existing `QUESTIONS` array so any future question add or remove updates the schema automatically. Per the 2026-05-25 mirror-source rule, `QUESTIONS` is the single shared source for both the visible quiz flow and the schema; an e2e assertion confirms `hasPart.length === QUESTIONS.length` by counting visible question-render passes through the quiz UI on `/quiz`.
- [ ] A `BreadcrumbList` JSON-LD block is ALSO emitted inside the same `<Helmet>` head (Home -> AI Readiness Quiz), matching the existing trade-page pattern in `src/pages/AiForRoofers.tsx` and `src/pages/AiForElectricians.tsx`. Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/*-jsonld.spec.ts` for a `=== 'BreadcrumbList'` predicate to confirm no existing spec asserts "exactly one BreadcrumbList block site-wide" (assertions are per-URL scoped today, so the risk is low, but the grep is mandatory). The grep result is documented in the Implementation log.
- [ ] No copy on `/quiz` changes: the QUESTIONS array, the persona scoring thresholds, the email capture form, the recommendation block, and every rendered string stay byte-for-byte identical to the current build. The diff is additive only (one JSON-LD block + one BreadcrumbList block inside the existing Helmet). A regression e2e asserts: the H1 still reads "AI Readiness Quiz," the first question text is unchanged, the persona names ("Just Starting," "Getting Smart," "AI-Ready") still appear in the final recommendation block when the quiz is completed with maximum-point answers.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, the Quiz JSON-LD parses as valid JSON (a parse failure throws and the spec catches it), and the JSON-LD block contains zero em-dash characters (`U+2014`). Per the 2026-05-25 mirror-source-fix lesson, if any string in the existing `QUESTIONS` array currently contains an em-dash (likely candidates: the lead_volume answers "10-50" and "50-100" - check `String.fromCharCode(8212)` in the source), repair it AT THE SOURCE (the `QUESTIONS` constant) in this same PR so the visible quiz and the JSON-LD mirror stay identical. The repair is in-scope as a single-source punctuation fix per the 2026-05-25 mirror-source-fix lesson; the diff cap stays under 220 lines.
- [ ] A new e2e spec at `tests/e2e/quiz-jsonld.spec.ts` asserts: navigate to `/quiz` and read all `script[type="application/ld+json"]` blocks; exactly one block has `@type === 'Quiz'`; the Quiz block parses as valid JSON; `Quiz.hasPart.length === 7`; every entry has `@type === 'Question'` and a non-empty `name`; exactly one block has `@type === 'BreadcrumbList'`; the BreadcrumbList's second item names "AI Readiness Quiz"; the page has no `U+2014` code point in either the rendered text or the JSON-LD serialized strings. The spec also asserts the `meta[name="description"]` content matches the Quiz block's `description` field exactly (mirror-source guarantee), reading the LAST `meta[name="description"]` per the 2026-05-25 Helmet-appends lesson. Per the 2026-05-25 SEO Pilot lesson, the spec does NOT use `page.toHaveTitle()` (`/quiz` is not in the SEO Pilot table).
- [ ] No `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to the seven question texts or the scoring weights other than punctuation repair noted above. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta` stay green; `npm run typecheck` stays clean. The new spec passes; every pre-existing quiz-related test (if any) stays green.

## Out of scope

- Adding `/quiz` to the `index.html` SEO Pilot `pages` table.
  That is its own SEO-hygiene ticket. Out of scope here.
- Emitting `acceptedAnswer` per question. The quiz is a
  scoring instrument that maps a point total to a persona; no
  single answer is "correct." Emitting an acceptedAnswer would
  misrepresent the schema. Out of scope.
- Emitting a `Course` or `LearningResource` schema. The
  assessment is two minutes, not a course; `Course` would
  overstate the artifact. Out of scope.
- Adding an Open Graph quiz card (`og:type=quiz` or similar).
  OG-type extensions for quizzes are nonstandard; the structured
  data alone is what Google indexes. Out of scope.
- Changing the persona-scoring thresholds, the persona names,
  or the recommendation copy. The ticket is structured-data
  publication of the artifact AS IT IS today, not a redesign
  of the quiz.
- Adding the quiz to the homepage hero or to the trust page.
  Cross-promotion is its own conversion ticket once the rich
  result is indexed.
- A multi-language Quiz schema. The quiz is English-only today
  and no `inLanguage` field is emitted; if the quiz is
  internationalized, the `inLanguage` field would be added then.
- A Google rich-results validation script as part of the local
  gate. The 2026-05-28 lesson on inlined assertions vs new
  frameworks applies: the validation is done by the new spec
  reading the schema, not by adding a new validator script.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- `src/pages/AIReadinessQuiz.tsx` - add two new JSON-LD blocks
  inside the existing `<Helmet>` head (lines ~774-777). The
  blocks are built as module-level constants
  (`QUIZ_SCHEMA`, `BREADCRUMB_SCHEMA`) so the page module stays
  readable; do NOT inline a giant object literal inside the
  Helmet JSX. Per the 2026-05-25 mirror-source rule, define a
  module-level `META_DESCRIPTION` constant once and read it
  from BOTH `<meta name="description" content={META_DESCRIPTION} />`
  AND `QUIZ_SCHEMA.description`. Repair any em-dash characters
  in the `QUESTIONS` array at the same source (likely candidates
  are the answer labels using en-dash or em-dash separators -
  grep `String.fromCharCode(8212)` in the source first).
- The `QUIZ_SCHEMA.hasPart` array is built by mapping over the
  existing `QUESTIONS` array (`QUESTIONS.map(q => ({ '@type': 'Question', name: q.question, eduQuestionType: 'Multiple choice', suggestedAnswer: q.options.map(o => ({ '@type': 'Answer', text: o.label })) }))`),
  so the schema length always equals the quiz length and a
  future question add does not need a schema edit.
- The Helmet emits the two JSON-LD blocks as
  `<script type="application/ld+json">{JSON.stringify(QUIZ_SCHEMA)}</script>`
  AND a second `<script>` for `BREADCRUMB_SCHEMA`. Two separate
  script tags is the same shape as the AiForRoofers /
  AiForElectricians pages today; do NOT wrap them in a
  `@graph` since Google parses sibling script tags
  independently.
- Per the 2026-05-30 second-@type lesson, the implementer
  greps `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'`
  and confirms no global "exactly one BreadcrumbList" assertion
  exists (each existing spec is URL-scoped per the 0034 /
  0035 grep precedent). Document the result in the
  Implementation log.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e spec asserts
  the Helmet-managed `meta[name="description"]` content
  directly (reading the LAST `meta[name="description"]` element
  in the head per the 2026-05-25 Helmet-appends lesson), NOT
  `page.toHaveTitle()`. The route is not in the `index.html`
  SEO Pilot pages table; adding it is a separate SEO concern.
- Per the 2026-05-07 em-dash Hard NO, every string in the
  emitted JSON-LD (the Quiz `description`, the
  `educationalUse`, the `assesses`, every Question `name`,
  every Answer `text`, the BreadcrumbList names) uses hyphens.
  Self-Review greps the diff for the em-dash character
  (`U+2014`) before pushing. The 2026-05-25 mirror-source-fix
  applies if any pre-existing QUESTIONS string already
  contains one - repair AT THE SOURCE so visible and mirror
  stay identical.
- `tests/e2e/quiz-jsonld.spec.ts` (new) - one spec per
  acceptance box. Model the spec on
  `tests/e2e/glossary-definedtermset-schema.spec.ts` (ticket
  0013, the closest peer for "publish structure of an
  existing artifact"). JSON-LD case: read all
  `script[type="application/ld+json"]` blocks, filter to
  `@type === 'Quiz'`, assert exactly one. Length case: assert
  `Quiz.hasPart.length === 7`. Shape case: assert every
  hasPart entry has `@type === 'Question'` and a non-empty
  `name`. Mirror case: read the LAST
  `meta[name="description"]` content, assert it equals the
  Quiz block's `description` byte-for-byte. Breadcrumb case:
  filter to `@type === 'BreadcrumbList'`, assert exactly one,
  assert second item name is "AI Readiness Quiz." No-em-dash
  case: read the rendered text AND the JSON-LD serialized
  strings, assert neither contains `String.fromCharCode(8212)`.
  Dark-mode case: apply
  `document.documentElement.classList.add('dark')` and assert
  the page renders. Regression case: assert the H1 text is
  unchanged, the first question text is unchanged.
- Per the 2026-05-22 two-PR ship lesson, ship will need a
  follow-up `chore/0039-ship-status` PR after the feat PR
  merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to `shipped` together;
  run `node scripts/check-backlog.mjs` before pushing the
  second PR so the file and index never drift mid-flip.
- New deps: NO. The page already uses `react-helmet-async`;
  no new component, no new utility, no new test framework.
  Schema migration: no. Privacy/security surface change:
  no - the JSON-LD is static derived from the existing
  QUESTIONS array; no new data flow, no new analytics field,
  no new external network destination is introduced.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0039-...` opened
- YYYY-MM-DD - failing test added in `tests/e2e/quiz-jsonld.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
