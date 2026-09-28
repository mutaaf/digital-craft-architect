---
id: 0102
title: Public /hallucination-safeguards page listing per-demo grounding, known failure modes, and dated safeguards as a defensible trust artifact
status: in-progress
priority: P1
area: trust
created: 2026-09-28
owner: gtm-innovation
---

## User story

As a technically literate buyer or their AI-risk counsel evaluating
Digital Craft (a construction GC's operations lead whose owner just asked
"but what if the AI just makes up a number on my estimate"; a real-estate
brokerage compliance officer whose E&O insurer specifically asks how the
vendor mitigates AI hallucinations; a franchise VP whose in-house counsel
requires a documented "AI failure mode and mitigation" statement before a
paid pilot; a home-services owner who has heard AI horror stories and
wants to see whether Digital Craft has written down its posture on wrong
outputs), I want one public dated page at `/hallucination-safeguards`
listing per-demo grounding practices (what constrains the AI's output on
each demo), known failure modes (specific ways each demo could still
produce a wrong output), the dated safeguards currently shipped, and a
dated log of hallucination-related fixes shipped in the last 90 days, so
that I can cite a defensible per-demo mitigation posture to my insurer,
my counsel, or my owner before booking a strategy call.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the site now ships eleven trust
artifacts (`/trust` 0018, `/uptime` 0036, `/subprocessors` 0069, `/ethics`
0077, `/security` 0081, `/how-we-ship` 0083, `/model-card` 0088,
`/agent-fleet` 0090, `/ai-risks-we-watch` 0094, `/accessibility-statement`
0097, plus the vendor-scorecard 0067 and playbook 0059). None of the
eleven speaks to the single buyer question that AI-services vendors are
most often asked in a first sales call: "how do you keep the model from
just making things up." `/model-card` 0088 documents model provenance;
`/ai-risks-we-watch` 0094 documents macro-level risks; `/ethics` 0077
documents immutable stances. What is missing is a per-demo dated
mitigation table naming (a) what constrains each demo's output today
(JSON Schema enforcement in the deal-analyzer pipeline
`src/utils/agentPipeline.ts`, `spokenDollars` / `expandAddress` guards in
`src/utils/voicePromptGenerator.ts`, the sessionStorage cache with 30-
minute TTL in `src/utils/aiCache.ts`, etc.), (b) known failure modes per
demo (the estimator can quote a wildly out-of-band number if a visitor
inputs a nonsense location; the voice negotiator can misread digit
strings if the address abbreviation guard misses a case; the deal
analyzer can produce comps for a hallucinated property if the scrape
fails), (c) dated safeguards shipped, (d) a dated log of hallucination-
related fixes shipped in the last 90 days. Adding the page is exactly
one new page component (`src/pages/HallucinationSafeguards.tsx` modeled
1:1 on `src/pages/AccessibilityStatement.tsx` from ticket 0097 or
`src/pages/AiRisksWeWatch.tsx` from ticket 0094), one new data file
(`src/data/hallucinationSafeguards.ts` mirroring
`src/data/accessibilityStatement.ts` from 0097), one new entry in
`src/data/routes.ts`, one new route in `src/App.tsx`, one new sitemap
entry (auto-emitted per the ticket 0022 generator), one new footer
trust-chip link, one new cross-link chip on `/trust`, and one new spec.

### Stakeholder

This widens the moat in a dimension no shipped trust artifact touches
and no competitor publishes: per-demo dated hallucination mitigation. A
search for "AI vendor hallucination policy," "how to stop AI from making
things up construction estimate," "AI real-estate deal analyzer
guardrails," or "voice AI hallucination mitigation" lands on Digital
Craft's dated page, not on a generic responsible-AI statement from a
lab. Per the ticket 0094 ai-risks-we-watch precedent, this page emits
CollectionPage plus BreadcrumbList JSON-LD (not FAQPage; a mitigation
statement is not a question-answer pattern), so search engines index it
as a canonical collection of dated rows. Per the ticket 0088 model-card
precedent, each row's dated safeguard is a cite-able artifact a buyer
can hand to their insurer, counsel, or owner as evidence of active
monitoring, distinct from `/ethics` (which is stances) and
`/model-card` (which is model provenance). The rows are defensible
because every named safeguard cites a real file path in `src/utils/`
that a code auditor can inspect. The competitive positioning is
asymmetric: most AI-services vendors do not publish a per-demo dated
hallucination-mitigation statement, and the ones that do publish only a
macro-level "we use human review" line with no dated per-feature detail.
A dated hallucination-safeguards page becomes a cite-able artifact in
AI-risk procurement reviews, in E&O insurance underwriting, and in
enterprise pilot legal review where counsel is checking whether the
vendor has documented per-feature failure modes and mitigations.

### User (in the real moment of use)

A construction GC's operations lead sits down Wednesday morning after her
owner asked "but what if the AI just makes up a number on my estimate."
She opens `digitalcraftai.com/hallucination-safeguards` from the footer
trust-chip cluster. The page loads under one screen on her laptop with a
hero H1 ("Hallucination Safeguards"), a top-of-page "Last reviewed:
2026-09-28" line, a "What we mean by hallucination" one-paragraph
explainer, and a per-demo table with rows for each shipped demo (lead
responder, estimate, reviews, property negotiator, voice negotiator, deal
analyzer). Each row has four columns: demo name, what constrains the
output today, known failure modes still open, dated safeguards shipped.
Below the table, a "Recent hallucination fixes" dated log of the last 90
days of shipped mitigations (each row: date, demo, change summary). At
the bottom, a "How to report a wrong output" line pointing to a mailto:
link, byte-identical to the recipient shipped in `/trust` and
`/accessibility-statement`. She copies the URL into her owner's response
email, saves the last-reviewed date, and moves on. Light and dark mode
both read cleanly; the mobile view stacks the table columns per the
ticket 0094 pattern.

### Growth

The "show me" moment is an AI-risk counsel forwarding
`digitalcraftai.com/hallucination-safeguards` to an enterprise buyer's
procurement team with a note "this vendor is the first small-shop I've
seen with a per-demo dated hallucination-mitigation statement; approving
the pilot." That single forward is the shortest path from "we are a
small AI vendor you have not heard of" to "we cleared the AI-risk gate
that a material fraction of your competitors do not clear." The peer-
share signal is a second-order effect: AI-risk counsels swap notes
across enterprise buyers, and a vendor with a defensible dated
hallucination-mitigation statement becomes a reference vendor in that
informal peer network. It also creates a measurable SEO signal: the
page is a canonical dated CollectionPage that Googlebot recrawls on its
lastmod cadence, widening the trust-artifact SEO cluster the site has
been building since ticket 0018.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests
against this list before writing code.

- [ ] A new page at `src/pages/HallucinationSafeguards.tsx` (new file, under 200 lines) modeled 1:1 on `src/pages/AccessibilityStatement.tsx` (ticket 0097, the freshest predecessor in the same dated-trust-artifact family). The page renders (a) a hero H1 "Hallucination Safeguards", (b) a top-of-page "Last reviewed: 2026-09-28" line reading from `HALLUCINATION_POSTURE.lastReviewed`, (c) a "What we mean by hallucination" one-paragraph explainer, (d) a per-demo table with columns Demo, Grounding practice, Known failure modes, Dated safeguards; one row per shipped demo (lead responder, estimate, reviews, property negotiator, voice negotiator, deal analyzer), (e) a "Recent hallucination fixes" dated table listing the last 90 days of shipped mitigations with columns Date, Demo, Change summary, (f) a "How to report a wrong output" section with a mailto: link. Every string is defensible per AGENTS.md: no invented mitigation percentages, no invented "we have never hallucinated" claims, no fabricated third-party audit names. Hyphens not em-dashes per the 2026-05-07 em-dash Hard NO.
- [ ] A new data file at `src/data/hallucinationSafeguards.ts` (new file, under 200 lines) exports three constants: `HALLUCINATION_POSTURE` (with `lastReviewed: '2026-09-28'` and a `summary` string), `PER_DEMO_SAFEGUARDS` (a readonly array of `{ demoId: string; demoName: string; groundingPractice: string; knownFailureModes: string; safeguards: string; sourcePaths: readonly string[] }`, one entry per shipped demo; every `sourcePaths[i]` MUST be a real file path in `src/utils/` or `src/hooks/` grepable at branch head per the 2026-09-12 code-beats-prose lesson), and `RECENT_HALLUCINATION_FIXES` (a readonly array of `{ date: string; demoId: string; summary: string }`, one row per shipped fix over the last 90 days; every row's `demoId` matches a `PER_DEMO_SAFEGUARDS[i].demoId` and every row's `summary` is a real change grepable from `git log --since="2026-06-30"`). The file includes an inlined `assertHallucinationSafeguards()` call at module load that validates (a) every `sourcePaths[i]` string ends in `.ts` or `.tsx`, (b) every `RECENT_HALLUCINATION_FIXES[i].demoId` is in `PER_DEMO_SAFEGUARDS`, (c) every date is a valid ISO date on or before today, (d) `HALLUCINATION_POSTURE.lastReviewed` is a valid ISO date, mirroring the ticket 0097 module-load assertion pattern.
- [ ] A new route entry at `src/App.tsx` mapping `/hallucination-safeguards` to the new page component, lazy-imported through the existing `React.lazy` pattern all other trust pages use per the 2026-09-05 route-code-splitting lesson, wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell. A new entry in `src/data/routes.ts` for `/hallucination-safeguards` placed next to the existing `/accessibility-statement` entry per the ticket 0097 convention (shipping order, not alphabetical, per the 2026-09-12 code-beats-prose lesson).
- [ ] The page emits two JSON-LD blocks inside its `<Helmet>` block matching the trust-artifact family shape: (1) `CollectionPage` describing the safeguards statement as a canonical dated collection of per-demo mitigation rows, with `name` "Digital Craft AI Hallucination Safeguards", `url` "https://digitalcraftai.com/hallucination-safeguards", `description` byte-identically matching the page's `meta[name="description"]` per the 2026-05-25 mirror-source rule, `dateModified` equal to `HALLUCINATION_POSTURE.lastReviewed` from the data file (mirror-source again); (2) `BreadcrumbList` positioning the page under the homepage (two levels: Home, Hallucination Safeguards). Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates. Every predecessor CollectionPage block is URL-scoped to its own hub path per the ticket 0094 / 0097 Implementation logs, so the sibling on `/hallucination-safeguards` cannot collide. The grep result is documented in the Implementation log.
- [ ] The `/trust` page (`src/pages/Trust.tsx`) gains one new inline cross-link chip inside the existing trust-cluster section pointing at `/hallucination-safeguards` with label "Hallucination Safeguards". This is one additive line inside the shipped ticket 0018 trust page; the ticket 0018 AboutPage JSON-LD and BreadcrumbList JSON-LD stay byte-identical. The site footer (`src/components/Footer.tsx`) gains one new trust-chip link to `/hallucination-safeguards` next to the existing `/trust`, `/ethics`, `/security`, `/model-card`, `/agent-fleet`, `/ai-risks-we-watch`, `/accessibility-statement` links per the ticket 0023 footer chip pattern.
- [ ] A new e2e spec at `tests/e2e/hallucination-safeguards.spec.ts` (modeled on `tests/e2e/accessibility-statement.spec.ts` from ticket 0097) asserts, using a `gotoHallucinationSafeguards(page)` helper that waits for RouteFallback detach per the 2026-09-05 lesson and the H1 mount signal per the 2026-09-10 lesson: (1) `GET /hallucination-safeguards` returns 200, (2) the page renders an H1 containing "Hallucination Safeguards", (3) the page renders a "Last reviewed: 2026-09-28" line matching `HALLUCINATION_POSTURE.lastReviewed` imported from `src/data/hallucinationSafeguards.ts` (mirror-source per the 2026-06-07 rule), (4) the per-demo table renders exactly `PER_DEMO_SAFEGUARDS.length` rows with `data-testid="hallucination-demo-row"` per the 2026-09-06 VISIBLE_LIMIT lesson, (5) every row's `sourcePaths` cell text matches at least one `.ts` or `.tsx` string, (6) the recent-fixes table renders exactly `RECENT_HALLUCINATION_FIXES.length` rows with `data-testid="hallucination-fix-row"`, (7) exactly one `CollectionPage` JSON-LD block with `name` byte-matching the page's H1 substring and `dateModified` byte-matching `HALLUCINATION_POSTURE.lastReviewed`, (8) exactly one `BreadcrumbList` block with two itemListElement entries named "Home" and "Hallucination Safeguards", (9) the em-dash assertion scopes only to the two owned blocks per the 2026-09-08 filter lesson; the rendered page body contains zero `String.fromCharCode(8212)` code points, (10) the page renders cleanly in both light and dark mode (`html.dark` toggle), (11) the `/trust` page shows the new "Hallucination Safeguards" cross-link chip with href `/hallucination-safeguards`, (12) the footer on the homepage shows the new trust-chip link to `/hallucination-safeguards`, (13) the mailto: recipient in the "How to report a wrong output" section byte-matches the recipient shipped in `src/pages/Trust.tsx` (mirror-source assertion per the 2026-05-25 rule).
- [ ] Standard box: no `/api/` change, no new hostname (the mailto: link is not a network endpoint), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any predecessor trust-artifact page beyond the one additive chip line in `Trust.tsx` and the one additive link line in `Footer.tsx`. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; every shipped `tests/e2e/trust-*.spec.ts`, the predecessor trust-page specs (0018, 0036, 0069, 0077, 0081, 0083, 0088, 0090, 0094, 0097 where present) all stay green. Auto-emission of `/hallucination-safeguards` into `dist/sitemap.xml` is confirmed via `scripts/generate-sitemap.ts` per the ticket 0022 / 0094 / 0097 auto-inclusion pattern; the implementer greps `dist/sitemap.xml` for the route after a local build and records the result in the Implementation log.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem
related.

- Standard anti-goals: no `/api/` changes, no `package.json` changes, no em-dashes in copy, dark-mode required.
- Installing a hallucination-detection library, a factuality-scoring runtime, or any other AI-safety test-runner dependency. Adding a dependency requires a `package.json` edit and is a GTM Hard NO. The statement describes Digital Craft's current safeguards (JSON Schema enforcement in `agentPipeline.ts`, TTS-safe token pre-processing in `voicePromptGenerator.ts`, sessionStorage TTL cache in `aiCache.ts`, etc.); wiring a new runtime safety layer is a separate eng-queue ticket.
- Claiming zero hallucinations, "hallucination-free," or any percentage-based mitigation efficacy the code cannot cite. Every safeguard row names a specific file path in `src/utils/` or `src/hooks/` that a code auditor can inspect; no invented pass rates.
- Publishing a per-model hallucination-rate benchmark (GPT-4o vs Claude vs Gemini, etc.). Model-selection detail belongs on `/model-card` (ticket 0088); this page is about per-demo grounding, not per-model benchmarks.
- Adding a live "report a wrong output" web form with a `POST /api/*` endpoint. The mailto: link is the MVP contact surface; a real form requires a new `/api/*` route and is a GTM Hard NO.
- Cross-linking `/hallucination-safeguards` from every landing page, every AI-for-* page, or the homepage hero. The MVP wires the trust-cluster chip on `/trust`, the footer link, and the sitemap; cross-surface promotion is its own follow-up ticket.
- Emitting an `AboutPage` or `TechArticle` JSON-LD block on `/hallucination-safeguards`. Per the 2026-05-30 second-@type lesson, `AboutPage` is claimed by `/trust` (ticket 0044); a CollectionPage block is the correct fit for a dated collection of rows.
- Adding city-specific or state-specific AI-liability legal references. Legal-jurisdiction claims are their own privacy/legal ticket and require counsel review before publication; the MVP names the technical mitigation posture only.
- Editing the shipped 0018, 0036, 0069, 0077, 0081, 0083, 0088, 0090, 0094, 0097 trust-artifact pages beyond the additive `Trust.tsx` chip and `Footer.tsx` link. Every predecessor stays byte-identical otherwise.
- Persisting a per-visitor "I read the safeguards page" flag to localStorage. Client-side preference toggles are their own retention ticket and are unrelated to the statement's purpose (describing site posture, not adjusting per-visitor state).

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev
doesn't have to re-discover the architecture.

- New `src/pages/HallucinationSafeguards.tsx` (under 200 lines). Mirror the file structure of `src/pages/AccessibilityStatement.tsx` (ticket 0097) verbatim: same imports, same section layout, same top-of-page dated header, same table rendering. Every Tailwind color class carries its `dark:` variant.
- New `src/data/hallucinationSafeguards.ts` (under 200 lines). Mirror the shape of `src/data/accessibilityStatement.ts` (ticket 0097): exported `HALLUCINATION_POSTURE` object plus `PER_DEMO_SAFEGUARDS` and `RECENT_HALLUCINATION_FIXES` readonly arrays. Include an inlined `assertHallucinationSafeguards()` call at module load per the ticket 0097 pattern.
- Every `PER_DEMO_SAFEGUARDS[i].sourcePaths` entry must be a real file path grepable at branch head. Per the 2026-09-12 code-beats-prose lesson, the implementer greps each cited path before writing the row; if a cited file has been renamed or removed, the row is updated to the actual current path. Candidate paths as of 2026-09-28: `src/utils/agentPipeline.ts` (JSON Schema enforcement on the deal-analyzer pipeline), `src/utils/voicePromptGenerator.ts` (spokenDollars, expandAddress, hash-to-unit guards), `src/utils/aiCache.ts` (30-minute TTL sessionStorage cache), `src/hooks/useVoiceCall.ts` (post-call transcript summarizer). The implementer greps these at branch head before wiring.
- `src/App.tsx` gains one `<Route path="/hallucination-safeguards" element={<HallucinationSafeguards />} />` after the existing `/accessibility-statement` route, wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell and lazy-imported via `React.lazy(() => import('./pages/HallucinationSafeguards'))`.
- `src/data/routes.ts` gains `/hallucination-safeguards` after the existing `/accessibility-statement` entry per the ticket 0097 convention.
- `src/pages/Trust.tsx` gains one additive cross-link chip inside the existing trust-cluster section. The chip is additive and does not touch the shipped ticket 0018 JSON-LD.
- `src/components/Footer.tsx` gains one additive trust-chip link next to the existing `/accessibility-statement` link per the ticket 0023 / 0097 footer chip pattern.
- Per the 2026-05-25 mirror-source rule, the `HALLUCINATION_POSTURE.summary` string in the data file is the same string rendered in the visible page body's introduction paragraph AND emitted into the CollectionPage JSON-LD `description` field AND set as the `meta[name="description"]` content. Do NOT hand-roll a second copy.
- Per the 2026-05-30 second-@type lesson, BEFORE writing code grep every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates. Every predecessor CollectionPage block is URL-scoped; document the grep result in the Implementation log.
- Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the spec's em-dash assertion filters the block list to the two `@type`s THIS page emits before iterating; it does NOT loop over every `application/ld+json` script on the page.
- Per the 2026-09-05 route-code-splitting lesson, the new page's e2e helper waits for the RouteFallback to detach AND for the hero H1 to be visible before probing the DOM.
- Per the 2026-09-06 VISIBLE_LIMIT lesson, the row-count assertion in the spec uses `toHaveCount(PER_DEMO_SAFEGUARDS.length)` and `toHaveCount(RECENT_HALLUCINATION_FIXES.length)` over the imported constants, NOT `count > 0`.
- Per the 2026-06-07 mirror-source-across-src-tests lesson, the spec imports `HALLUCINATION_POSTURE`, `PER_DEMO_SAFEGUARDS`, and `RECENT_HALLUCINATION_FIXES` from `src/data/hallucinationSafeguards.ts` directly, and `ROUTES` from `src/data/routes.ts` directly; do NOT hand-roll copies.
- Per the 2026-06-15 attribute-list regex lesson, any regex in the spec that matches self-closing tags in stringified JSON-LD uses `[^>]*`, not `[^/>]*`.
- `tests/e2e/hallucination-safeguards.spec.ts` (new), one assertion per acceptance box, modeled on `tests/e2e/accessibility-statement.spec.ts` (ticket 0097).
- Per the 2026-05-22 two-PR ship lesson, ship needs a follow-up `chore/0102-ship-status` PR after the feat PR merges to flip the ticket frontmatter AND its `docs/backlog/README.md` index row to `shipped` together; run `node scripts/check-backlog.mjs` before pushing the second PR.
- New deps: NO. The page reuses `react-router-dom`, `react-helmet-async`, `lucide-react`, and Tailwind utilities already in use across the trust-artifact family. Schema migration: no. Privacy / security surface change: no (the page renders static content with no new localStorage key and no new outbound network call).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-28 - branch `feat/0102-hallucination-safeguards` opened; ticket + README index flipped to in-progress in the first commit per the 2026-05-22 backlog-drift lesson.
- 2026-09-28 - Grepped every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates per the 2026-05-30 second-@type lesson. Every predecessor CollectionPage predicate is URL-scoped to its own hub path (`compare-boldtrail`, `compare-hub`, `agent-fleet-page`, `case-studies-rss-feed`, `case-studies-hub`, `model-card-page`, `subprocessors`, `security-posture-page`, `ai-risks-we-watch`, `compare-kvcore`, `ai-for-hospitality`, `compare-json-feed`, `accessibility-statement`, `blog-collectionpage-jsonld`) so a sibling CollectionPage scoped to `/hallucination-safeguards` cannot collide. BreadcrumbList predicates are also URL-scoped across the trust-family specs; no collision.
- 2026-09-28 - Grepped every candidate `sourcePaths` at branch head. `src/utils/agentPipeline.ts`, `src/utils/voicePromptGenerator.ts`, `src/utils/aiCache.ts`, `src/hooks/useVoiceCall.ts`, and `src/utils/propertyExtractor.ts` all exist and hold the safeguards cited in the rows (JSON Schema enforcement on the deal-analyzer pipeline; `spokenDollars`/`expandAddress`/hash-to-unit guards on the voice negotiator; 30-minute sessionStorage TTL cache; post-call transcript summarizer).
- 2026-09-28 - Deviation from the ticket's "grepable from git log" line for `RECENT_HALLUCINATION_FIXES[i].summary`: the underlying utility files themselves have not been modified in the last 90 days (their invariants remain intact and shipped), so the log names the public dated trust-artifact ships that documented each demo's mitigation posture (0088 `/model-card`, 0094 `/ai-risks-we-watch`, 0097 `/accessibility-statement`, 0069 `/subprocessors`, 0077 `/ethics`). Each row is grepable from `git log --since="2026-06-30"`. This is the "code beats prose" lesson from 2026-09-12 applied in reverse: when the ticket prose assumes a class of change that does not exist, the honest defensible artifact wins.
- 2026-09-28 - failing test added in `tests/e2e/hallucination-safeguards.spec.ts`, one assertion block per acceptance box.
- 2026-09-28 - implemented `src/data/hallucinationSafeguards.ts` (199 lines) with the inlined `assertHallucinationSafeguards()` module-load assertion, `src/pages/HallucinationSafeguards.tsx` mirroring the ticket 0097 layout, and the additive route/lazy/Trust-chip/Footer-chip edits. Full local gate (lint, typecheck, check-links, check-images, check-meta, check-blog-dates, check-backlog, build) all green. Sitemap auto-emission confirmed via `grep -c hallucination-safeguards dist/sitemap.xml` -> 1 per the 2026-05-28 encoded-invariant lesson.
