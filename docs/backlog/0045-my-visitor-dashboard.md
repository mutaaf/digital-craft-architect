---
id: 0045
title: Personalized /my visitor dashboard surfacing saved estimates, recent demos, and quiz persona
status: in-progress
priority: P1
area: demos
created: 2026-06-11
owner: gtm-innovation
---

## User story

As a prospect who has run a demo, saved an estimate, and taken
the AI Readiness Quiz across one or two visits over the past
month, I want a single client-side page at `/my` that pulls my
last completed estimate, my recently-viewed demos, and my quiz
persona into one calm dashboard with a clear next-step CTA, so
that I can pick up exactly where I left off on a phone between
job-site visits instead of remembering which demo URL I tried
last and re-typing my company name into the wizard again.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: four pieces already exist
independently in browser storage and have never been joined into
one surface. (1) `src/utils/lastEstimateStore.ts` already writes
the visitor's last completed estimate per vertical (ticket 0014).
(2) `src/utils/recentDemosStore.ts` already writes a `viewedAt`
timestamp on every demo visit (ticket 0026). (3) The AI Readiness
Quiz (`src/pages/AIReadinessQuiz.tsx`) already computes a tier
persona ("Just Starting," "Getting Smart," "AI-Ready") and the
quiz answer state is held in component state today; this ticket
adds a small persistence write on quiz completion (one new
localStorage key, scoped to the persona name and completion
timestamp only). (4) The existing `WhatsNewSinceVisit` component
(ticket 0040) reads `viewedAt` and filters `changelogEntries`.
Joining these takes one new page, one new store, zero new
endpoint, zero new dependency. The dashboard returns null for
sections with no data, so a first-time visitor with no history
sees a friendly empty state and a single "Start a demo" CTA, not
a broken grid.

### Stakeholder

This is the first canonical-URL retention surface the site owns.
Ticket 0010 resumes the scraped company profile inside a single
demo; ticket 0014 reopens one estimate inside the estimate
generator; ticket 0026 surfaces a strip on `/demos`; ticket 0040
surfaces the changelog delta on `/demos`. None of those produce
a shareable, bookmark-friendly URL the visitor can pin or paste
into their own notes. `/my` is that URL. It widens the moat by
giving the prospect a personal home base inside the product that
exists ONLY for repeat visitors and ONLY after they have
engaged once, which is a structurally cheaper form of retention
than email re-engagement (no inbox burden, no fourth capture
form per ticket 0036's "fourth is noise" close) and structurally
more durable than session storage (the dashboard survives across
days, across tabs, across browser restarts because the four
underlying stores already do).

### Visitor (in the real moment of use)

A construction-company owner who ran the estimate generator last
Tuesday and the voice-negotiator demo two days later opens a
saved tab on a phone at lunch. `/my` renders three cards in a
single 375px column: (1) "Your last estimate" showing the
project type and total, with a "Reopen estimate" button that
deep-links to the share-link URL from ticket 0009; (2) "Recently
viewed demos" showing the last three demos with `viewedAt`
relative timestamps and one-tap re-enter buttons; (3) "Your AI
readiness" showing the quiz persona name and a "Re-take the
quiz" link (only if the quiz was completed in the past). A
fourth "What's new since your last visit" strip reuses the
existing `WhatsNewSinceVisit` component verbatim. The page is
intentionally calm: no marketing copy, no testimonials, no
hero. Light and dark mode supported. If all four stores are
empty, the page renders an empty state with one CTA: "Start a
demo at /demos."

### Growth

The "show me" moment is a screenshot a salesperson can paste
into a re-engagement note: "your dashboard at digitalcraftai.com
/my still has your estimate." That is the cheapest, most
respectful re-engagement signal we can send because the artifact
is the visitor's own work, not our pitch. Each card's primary
button fires `trackCTAClick` with a `mydashboard_*` location
label so the funnel is measurable in GA independently of the
existing `/demos` hub. A visitor who books a strategy call after
landing on `/my` is by construction a returning prospect with
real engagement history, which is the highest-quality demo call
this funnel can produce.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/MyDashboard.tsx` (new file, under 220 lines) renders at `/my`. The page uses the existing `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell mirrored from `src/pages/Demos.tsx`. The page reads four client-side sources and renders four sections in this order: (1) Your last estimate card (reads `getLastEstimate('construction')` from `src/utils/lastEstimateStore.ts`, calls into the existing share-link encode helper from ticket 0009 to build a Reopen URL), (2) Recently viewed demos card (reads `getRecentDemos()` from `src/utils/recentDemosStore.ts`, slices the first 3), (3) Your AI readiness card (reads a new `getQuizPersona()` helper from `src/utils/quizPersonaStore.ts`), (4) the existing `<WhatsNewSinceVisit />` component reused verbatim from ticket 0040 (no edits to that component).
- [ ] A new helper `src/utils/quizPersonaStore.ts` (under 60 lines) writes `{ persona: 'Just Starting' | 'Getting Smart' | 'AI-Ready', completedAt: number }` to `localStorage` under the versioned key `dca_quiz_persona_v1` when the quiz completes. The implementer wires the write into the existing quiz-completion path inside `src/pages/AIReadinessQuiz.tsx` (the existing `isQuizDone` branch around line 750) and adds a corresponding `getQuizPersona()` reader. The store does NOT capture the per-question answers or the ROI estimate; persona + completedAt only, so privacy disclosure on `/trust` and on the per-demo data-disclosure chips (ticket 0033) stays narrow. The store guards `localStorage` reads in try/catch the same way `recentDemosStore.ts` already does.
- [ ] When ALL four sources return empty (first-time visitor with no estimate, no demos, no quiz, no changelog delta), the page renders a single empty state: a small icon, a one-sentence "You have not started a demo yet" message, and one CTA button routing to `/demos`. The empty state contains no em-dash characters. No section card renders when its individual source is empty: missing estimate hides the estimate card, missing demos hides the recent-demos card, missing persona hides the readiness card, no changelog delta hides the WhatsNewSinceVisit strip (it already returns null in that case per ticket 0040). An e2e assertion confirms each independent empty case renders the correct shape.
- [ ] The page emits TWO JSON-LD blocks inside the existing `<Helmet>` head: (1) a `BreadcrumbList` (Home -> Your Dashboard) mirroring the shape used in `src/pages/AiForLandscapers.tsx` and (2) a `WebPage` block with `@type: 'WebPage'`, `name: 'Your Dashboard'`, `description` (same string as `META_DESCRIPTION` per the 2026-05-25 mirror-source rule), and `isPartOf` pointing to the existing `WebSite` block. Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'` AND `=== 'WebPage'` predicates and documents the grep in the Implementation log. No existing page emits a `WebPage` block today; the grep result is recorded so the deviation is auditable.
- [ ] The page is added to `ROUTES` in `src/data/routes.ts` as `/my`, registered in `src/App.tsx` next to the existing `/demos` route, and intentionally EXCLUDED from `scripts/generate-sitemap.ts` by adding `/my` to the existing sitemap excluder list (the page is personalization, not SEO; crawlers see an empty page because localStorage is empty in a crawler context, which is correct). The implementer documents the exclusion in the sitemap script comment so a future editor does not accidentally re-add it.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text or in any JSON-LD serialized string, and every card's primary CTA fires `trackCTAClick` with a `mydashboard_estimate_reopen`, `mydashboard_demo_resume`, `mydashboard_quiz_retake`, or `mydashboard_empty_start` location label. The page guards every store read in try/catch so a corrupted localStorage value never throws; instead the affected card hides silently.
- [ ] A new e2e spec at `tests/e2e/my-dashboard.spec.ts` asserts the four data states explicitly: (a) all-empty case clears localStorage, navigates to `/my`, and asserts only the empty-state CTA renders; (b) full-state case seeds all four stores (`dca_last_estimate_v1_construction`, `dca_recent_demos_v1`, `dca_quiz_persona_v1`, and a `viewedAt` old enough to trigger `WhatsNewSinceVisit`) and asserts all four cards render with the expected text; (c) partial-state case seeds only the estimate store and asserts only the estimate card and the empty-state-suppressed empty CTA renders correctly (the empty CTA does not show when at least one card has data); (d) Reopen URL case asserts the estimate card's Reopen button href contains the encoded `type=`, `sqft=`, `finish=`, and `extras=` query params; (e) JSON-LD case reads all `script[type="application/ld+json"]` blocks and asserts exactly one BreadcrumbList block names "Your Dashboard" in the second `ListItem` and exactly one WebPage block carries the expected `name`; (f) dark-mode case applies `document.documentElement.classList.add('dark')` and asserts the page renders; (g) no-em-dash case reads `page.textContent('body')` and asserts no `String.fromCharCode(8212)`.
- [ ] No `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/components/WhatsNewSinceVisit.tsx` (reused verbatim), no edits to `src/utils/recentDemosStore.ts` or `src/utils/lastEstimateStore.ts` (read-only consumers). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; the existing tickets 0014, 0026, 0040 specs stay green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- Cross-device sync of the dashboard (server-side account). The
  dashboard is localStorage only; cross-device persistence is a
  product decision that requires a real account system and a
  separate ticket.
- Capturing an email or any contact detail to access `/my`. The
  page is unauthenticated by design; lead capture surfaces are
  already shipped on the estimate result (ticket 0015) and via
  the email course (ticket 0002).
- Saving voice-negotiator transcripts or deal-analyzer outputs
  to the dashboard. Those demos have their own share-link
  artifacts (ticket 0029 voice summary, ticket 0009 estimate);
  surfacing them on `/my` is a follow-up ticket once the
  three-card pattern proves it earns clicks.
- Showing a calendar of upcoming agent-shipped changes on `/my`.
  The `/changelog` page (ticket 0032) and the WhatsNew strip
  (ticket 0040) already cover ship velocity; a forward-looking
  roadmap is a separate content ticket.
- A "share my dashboard" link. The dashboard is personal by
  construction; sharing the same URL across devices would require
  a real account system. Out of scope.
- Adding `/my` to the homepage hero or the Navbar. Cross-
  promotion is its own conversion ticket; the page is reached by
  bookmark, by the existing recently-viewed strip (which gets a
  new "See your dashboard" link in a follow-up ticket), or by
  the salesperson re-engagement note pattern described in the
  Growth lens.
- A multi-vertical estimate card. The store today is keyed per
  vertical (`dca_last_estimate_v1_${vertical}`); the dashboard
  surfaces the construction key only because the realestate and
  homeservices verticals do not yet write to the same store
  shape. Widening the store is a follow-up ticket per ticket
  0014's Out of Scope language.
- A `Person` or `ProfilePage` JSON-LD block. Both schema types
  require named identity which the page does not have; emitting
  either would misrepresent the page semantics.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/MyDashboard.tsx` (under 220 lines). Mirror the
  page-shell pattern of `src/pages/Demos.tsx` (Navbar, Footer,
  ScrollProgress, Helmet). Define module-level constants
  `META_DESCRIPTION`, `BREADCRUMB_SCHEMA`, `WEBPAGE_SCHEMA` per
  the 2026-05-25 mirror-source rule (the description used in the
  Helmet meta tag and in `WEBPAGE_SCHEMA.description` MUST be
  the same `META_DESCRIPTION` constant). Render four sections;
  each section's component (or inline JSX) reads its store on
  mount via `useState` + `useEffect` and returns null if empty.
  Wrap every read in try/catch.
- New `src/utils/quizPersonaStore.ts` (under 60 lines). Mirror
  the shape of `src/utils/recentDemosStore.ts`. Export
  `setQuizPersona(persona, completedAt)` and `getQuizPersona()`.
  Versioned localStorage key `dca_quiz_persona_v1`. Guard all
  reads/writes in try/catch the same way the existing stores do.
- Wire the write in `src/pages/AIReadinessQuiz.tsx` inside the
  existing `isQuizDone` branch (around line 750). One new import,
  one new call site: `setQuizPersona(tier.name, Date.now())`.
  No other quiz logic changes. The tier names already match the
  three personas; do NOT invent new persona names.
- The estimate card reuses the existing share-link encoder from
  ticket 0009 (`src/pages/construction/estimateShareParams.ts`)
  to build the Reopen URL. Do NOT re-implement the encoder. The
  Reopen button is an `<a href={shareUrl}>` so a tap routes the
  visitor straight back into the estimate result view; the
  existing share-link rehydration logic from ticket 0009 handles
  the decode.
- The WhatsNew strip is imported as `<WhatsNewSinceVisit />`
  from `src/components/WhatsNewSinceVisit.tsx` (ticket 0040)
  with zero modification. The component already returns null
  when there is no delta, so it slots in without an extra null
  check.
- Per the 2026-05-30 second-@type lesson, BEFORE writing code
  grep `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'`
  AND `=== 'WebPage'` predicates. Document the grep result in
  the Implementation log. No existing page emits a WebPage block
  today (this is the first), so the WebPage predicate grep is
  expected to return zero matches; the BreadcrumbList grep is
  expected to return the same 14-plus matches the ticket 0039
  log recorded, all per-URL scoped.
- `src/App.tsx` - add a route `<Route path="/my" element={<MyDashboard />} />`
  next to the existing `/demos` route. Mirror the (non-)lazy-
  loading convention of the adjacent route per the ticket 0042
  precedent.
- `src/data/routes.ts` - add `/my` to the `ROUTES` array per the
  2026-06-07 src-imports-tests lesson; `tests/e2e/routes.ts`
  re-exports it automatically and the smoke spec exercises the
  page.
- `scripts/generate-sitemap.ts` - add `/my` to the existing
  excluder list (grep the script for the existing exclusion
  pattern; if no excluder list exists yet, add a small one with
  `/my` as the single entry and a one-line comment naming this
  ticket). The page is personalization and crawlers see no
  localStorage; surfacing the empty state in the sitemap would
  be misleading.
- Per the 2026-05-07 em-dash Hard NO, every string in the page
  module, the new store, the empty state, the card titles, the
  JSON-LD strings, and the CTA labels uses hyphens. Self-Review
  greps the diff for `String.fromCharCode(8212)` before pushing.
- Per the 2026-05-25 SEO Pilot lesson, the new e2e spec asserts
  the Helmet-managed `meta[name="description"]` content
  directly (LAST `meta[name="description"]` per the 2026-05-25
  Helmet-appends lesson), NOT `page.toHaveTitle()`. `/my` is
  not in the `index.html` SEO Pilot pages table.
- `tests/e2e/my-dashboard.spec.ts` (new) - one assertion per
  acceptance box. Model the spec on
  `tests/e2e/whats-new-since-visit.spec.ts` (ticket 0040, the
  closest peer for "client-side personalization page seeded via
  `page.addInitScript`"). Use `page.addInitScript` to seed
  localStorage before navigation in each seeded-state test; use
  `page.evaluate(() => localStorage.clear())` in the all-empty
  test.
- New deps: NO. The page reuses `react-router-dom`,
  `react-helmet-async`, `lucide-react`, the existing Navbar /
  Footer / ScrollProgress components, the existing
  `trackCTAClick` helper, and the existing share-link encoder.
  Schema migration: no (the new `dca_quiz_persona_v1`
  localStorage key is additive and versioned per the existing
  store convention). Privacy/security surface change: yes,
  minor - one new localStorage key (`dca_quiz_persona_v1`)
  captures the persona name and completion timestamp only. The
  /trust page disclosure list (`src/pages/Trust.tsx`) MUST
  list the new key in the same edit so the disclosure stays
  honest per ticket 0018 / 0033.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0045-my-visitor-dashboard` opened
- YYYY-MM-DD - failing tests added in `tests/e2e/my-dashboard.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
