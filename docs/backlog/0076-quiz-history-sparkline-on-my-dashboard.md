---
id: 0076
title: Persist every AI Readiness Quiz completion and surface a "Your readiness trend" sparkline card on /my dashboard
status: proposed
priority: P1
area: demos
created: 2026-09-12
owner: gtm-innovation
---

## User story

As a returning prospect who has taken the AI Readiness Quiz
more than once over several weeks (a GC who took the quiz
first on a Tuesday out of curiosity and scored Tier 1, then
piloted a lead-responder demo, then re-took the quiz two
weeks later after their office manager watched a walkthrough
and scored Tier 2, then plans to re-take it a third time
after a leadership meeting to see if their score has moved
again; a plumbing-shop owner who wants to walk into a
partner meeting with proof that his readiness has climbed
from Tier 1 to Tier 3 across a month of internal work), I
want every quiz completion to persist as an entry in a
small dated history log in my browser, and I want the `/my`
dashboard to render one new card titled "Your AI readiness
trend" that shows my tier trajectory as a tiny inline SVG
sparkline plus a dated list of the last eight completions,
so that I have a visible reason to re-take the quiz on a
return visit and a printable record of my own readiness
progression, without any account, any email capture, or any
server-side sync.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the AI Readiness
Quiz already persists ONE piece of client-side state -
`src/utils/quizPersonaStore.ts` (ticket 0045) writes the
LATEST persona name and completion timestamp to the
localStorage key `dca_quiz_persona_v1` on quiz completion
via the `setQuizPersona(persona, completedAt)` call wired
into `src/pages/AIReadinessQuiz.tsx` around line 750.
Every prior retention ticket on `/my` (0026 recent demos,
0014 last estimate, 0062 last ROI, 0074 recent compares)
persists exactly ONE current snapshot per artifact family;
none of them accretes a history log. This ticket adds a
NEW sibling store, `src/utils/quizHistoryStore.ts`, that
appends every completion into a bounded eight-entry array
under the versioned key `dca_quiz_history_v1`, and adds
ONE new card component to `src/pages/MyDashboard.tsx` that
reads the history and renders (a) an inline SVG sparkline
tracing the tier trajectory when the history has two or
more entries, and (b) a small dated list of the last
eight completions. The existing `quizPersonaStore.ts`
stays byte-identical (the LATEST persona still drives the
existing readiness card on `/my` per ticket 0045); the new
history store is strictly additive. Zero new backend, zero
new dependency, zero edit to the quiz component beyond one
new line adjacent to the existing `setQuizPersona(...)`
call. One new util, one additive card block on
`MyDashboard.tsx`, one additive line in the quiz
completion path, one additive entry in
`src/data/demoDisclosures.ts` for the `/trust` disclosure
list. Modeled structurally on `src/utils/recentDemosStore.ts`
(the direct peer for a bounded array store keyed by
timestamp) and on `src/utils/roiResultStore.ts` (the
direct peer for a numeric artifact that drives a card on
`/my`).

### Stakeholder

This widens the moat in the retention-artifact dimension
by turning a one-shot quiz into a recurring engagement
surface. Ticket 0060 shipped a raw-frequency signal
(visit-streak badge) and ticket 0074 shipped a
per-artifact recency signal (recent comparisons); this
ticket ships the missing DOMAIN-SPECIFIC progression
signal (readiness improvement across time). A prospect
whose stored history shows Tier 1 to Tier 2 to Tier 3
across three visits is by construction the most engaged
readiness-quiz completer the funnel can produce because
the artifact is evidence to the prospect (and to their
partner or leadership) that engagement with Digital Craft
has moved a measurable number. The moat argument is
identical to the argument ticket 0066 made for the
printable summary recap: an artifact composed of the
visitor's own persisted actions is structurally more
persuasive than any marketing copy we can write, and it
only exists because we persist prior interactions. Per
the ticket 0018 / 0033 / 0045 / 0060 / 0062 / 0074
honesty rule, the new `dca_quiz_history_v1` key is added
to the `/trust` persistent-stores disclosure list in the
same PR so the disclosure stays honest. Per the ticket
0066 printable-summary precedent, the new history line
is ALSO a candidate for inclusion in a future
`SUMMARY_LINES` extension (out of scope for this ticket)
so the printable summary can render "Readiness trend:
Tier 1 to Tier 3 across 3 completions" once telemetry
justifies the composition change.

### Visitor (in the real moment of use)

A GC who took the quiz last month and scored Tier 1, then
re-took it two weeks ago after his office manager watched
a walkthrough and scored Tier 2, opens `/my` on a phone at
lunch to prepare for a Friday leadership meeting. Below
the existing readiness card (which still shows the LATEST
persona per ticket 0045), one new card titled "Your AI
readiness trend" renders with (a) a small inline SVG
sparkline (roughly 220 pixels wide, 40 pixels tall) that
plots two data points climbing from Tier 1 to Tier 2, (b)
a dated list reading "2026-08-15: Tier 1 (Just Starting)"
and "2026-08-29: Tier 2 (Getting Smart)", and (c) one
"Re-take the quiz" button routing to `/quiz` and firing
`trackCTAClick('my_quiz_history_retake', 'my_dashboard')`.
When the visitor takes the quiz a third time on Friday
morning and scores Tier 3, the sparkline redraws with
three points and the third row appears at the bottom of
the list; the visitor now has an artifact showing a
month-long readiness climb. First-time visitors with zero
completions see NO new card (the existing readiness card
also hides per ticket 0045 in that case). Visitors with
exactly one completion see the card with a small "Take the
quiz again to see your trend" chip in place of the
sparkline (the list still renders the one dated row). The
card reads cleanly on a 375px viewport and supports light
and dark mode.

### Growth

The "show me" moment is the screenshot a prospect forwards
to their partner or leadership: a Digital Craft AI
dashboard showing THEIR OWN dated tier progression across
weeks, in a small clean sparkline. That artifact is the
single strongest re-engagement signal the funnel can
produce because it is evidence of the prospect's own
learning curve, not marketing copy. The card also creates
a measurable retention KPI: clicks on the "Re-take the
quiz" button fire as a distinct `trackCTAClick` event
(`my_quiz_history_retake`) so quiz-retake velocity from
`/my` is measurable in GA independently of the raw quiz
completion rate at `/quiz`. Per the ticket 0062 dashboard-
card precedent, the card is filed on `/my` and NOT on
`/quiz` (returning-visit surfaces belong on the
personalized dashboard; the quiz page itself renders for
first-time visitors and cannot show a history in a
crawler context). Per the ticket 0060 view-tracking
precedent, the card fires
`trackCTAClick('quiz_history_view', 'my_dashboard')`
exactly ONCE per page mount when it renders, guarded by
a `useRef<boolean>` flag mirroring the existing
`streakViewTracked` and `roiCardViewTracked` patterns.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new client-side store at `src/utils/quizHistoryStore.ts` (new file, under 160 lines) exports `appendQuizHistory(entry: QuizHistoryEntry): void`, `getQuizHistory(): QuizHistoryEntry[]`, and `clearQuizHistory(): void`. The `QuizHistoryEntry` shape is `{ persona: 'Just Starting' | 'Getting Smart' | 'AI-Ready'; completedAt: number }` (the same three persona names the existing `quizPersonaStore.ts` uses per ticket 0045; do NOT invent new names). The store persists at most 8 entries (most recent LAST so array-index order matches chronological order for the sparkline plot) under the versioned localStorage key `dca_quiz_history_v1`. A duplicate completion within 60 seconds of the most recent stored entry is a no-op (dedup guard against a double-click on the completion screen); a completion whose persona is not one of the three known personas is a no-op (allow-list guard). Parse-safe read: a malformed value returns `[]` without throwing. Quota-exceeded write silently no-ops per the ticket 0026 / 0074 convention. Every read and write is wrapped in try/catch mirroring the shape of `src/utils/recentDemosStore.ts`.
- [ ] `src/pages/AIReadinessQuiz.tsx` gains ONE additional call inside the existing `isQuizDone` completion branch adjacent to the existing `setQuizPersona(tier.name, Date.now())` call from ticket 0045 (around line 750): `appendQuizHistory({ persona: tier.name, completedAt: Date.now() })`. The two calls share the same timestamp (compute once, pass to both) so the LATEST entry in the history array is byte-identical to the value in the `dca_quiz_persona_v1` snapshot for the same completion. No other quiz logic changes; the existing quiz completion UI, share-link (ticket 0052), and JSON-LD (ticket 0039) stay byte-identical.
- [ ] `src/pages/MyDashboard.tsx` gains ONE new card component (`QuizHistoryCard`, inline or under `src/components/QuizHistoryCard.tsx`) rendered BELOW the existing readiness card (per ticket 0045) and ABOVE the existing strategy-call CTA / empty-state block. The card renders conditionally when `getQuizHistory().length >= 1`. Card content: (a) `<h3>Your AI readiness trend</h3>` heading, (b) an inline `<svg>` sparkline (`data-testid="quiz-history-sparkline"`) plotting tier values (1 for "Just Starting", 2 for "Getting Smart", 3 for "AI-Ready") ONLY when `history.length >= 2`; when `history.length === 1` the SVG is absent and a small `<p>` reads "Take the quiz again to see your trend" instead, (c) a dated `<ol>` (`data-testid="quiz-history-list"`) with one `<li>` per entry (`data-testid="quiz-history-row"`) rendering `<YYYY-MM-DD>: <persona name>` per row (max 8 rows, most recent LAST), (d) one `<Link>` "Re-take the quiz" button routing to `/quiz` and firing `trackCTAClick('my_quiz_history_retake', 'my_dashboard')` on click. The card fires `trackCTAClick('quiz_history_view', 'my_dashboard')` exactly ONCE per page mount, guarded by a `useRef<boolean>(false)` flag `quizHistoryViewTracked` adjacent to the existing `streakViewTracked` and `roiCardViewTracked` guards. When `getQuizHistory().length === 0` the card returns null (the existing readiness card also returns null in that case per ticket 0045 spec, so a first-time visitor sees neither).
- [ ] The inline SVG sparkline uses a `viewBox="0 0 220 40"` with polyline points computed from `history.map((e, i) => [i * (220 / (history.length - 1)), 40 - ((tierValue(e.persona) - 1) * 20)])`. Stroke width is 2, stroke color is `currentColor` so the line inherits the light or dark theme correctly (no hard-coded hex). Each data point is rendered as a small `<circle r="3" fill="currentColor">` element on top of the polyline. The SVG has `role="img"` and `aria-label="Your AI readiness tier trajectory across N completions"` where N is the history length. No external SVG dependency; no chart library; no import beyond React. When the sparkline renders it does NOT fabricate a data point (a single-entry history triggers the "Take the quiz again" fallback per the prior box, NOT a flat one-point line).
- [ ] The `dca_quiz_history_v1` localStorage key is added to `src/data/demoDisclosures.ts` (the source of truth for per-store disclosures on `/trust` per ticket 0033) AND surfaces automatically on `src/pages/Trust.tsx` per the ticket 0018 / 0033 / 0045 / 0060 / 0062 / 0074 honesty rule. The disclosure text names the key, the shape (`{ persona, completedAt }` bounded to 8 entries), and the "client-side only, never leaves your browser" language mirroring the ticket 0074 recent-compares-store disclosure. The `/trust` render tree passes its existing `tests/e2e/trust-page.spec.ts` after the additive edit.
- [ ] Per the 2026-05-30 second-@type lesson, this ticket adds NO new JSON-LD blocks (the `/my` dashboard already emits BreadcrumbList and WebPage per ticket 0045; the quiz page already emits Quiz per ticket 0039). The pre-code grep for JSON-LD predicate collisions is a no-op, but the implementer records "no new JSON-LD blocks added" in the Implementation log for auditability. The existing `tests/e2e/my-dashboard.spec.ts` (ticket 0045) stays green after the additive card insertion; the spec asserts the dashboard renders and the existing cards render but does NOT assert "no additional cards on the dashboard," so an additive card is safe.
- [ ] A new e2e spec at `tests/e2e/quiz-history-card.spec.ts` (modeled on `tests/e2e/roi-card-on-dashboard.spec.ts` from ticket 0062, the direct peer for a `/my` card that reads a client-side store seeded via `page.addInitScript`) asserts: (1) with an empty `dca_quiz_history_v1` value, `/my` renders WITHOUT `data-testid="quiz-history-sparkline"` AND WITHOUT `data-testid="quiz-history-list"`, (2) with a single entry seeded via `page.addInitScript`, `/my` renders the list with exactly ONE `data-testid="quiz-history-row"` row AND does NOT render the SVG sparkline (the "Take the quiz again" fallback `<p>` is visible instead), (3) with three entries seeded (Tier 1 then Tier 2 then Tier 3), `/my` renders the list with exactly THREE rows in chronological order AND renders the SVG sparkline with exactly three `<circle>` data-point elements, (4) the sparkline SVG's `polyline` `points` attribute contains three coordinate pairs whose x-values are 0, 110, 220 (matching the viewBox math from the prior acceptance box), (5) the "Re-take the quiz" button href resolves to `/quiz` and a click fires the `my_quiz_history_retake` event (spied on via the `trackCTAClick` shim seeded before navigation per the ticket 0066 pattern), (6) a seeded entry with an unknown persona name (e.g. `"Wizard"`) is filtered at read time and does NOT render a row, (7) a duplicate seeded entry within 60 seconds of the previous entry does NOT add a second row (dedup guard), (8) the card fires the `quiz_history_view` beacon exactly once per page mount (not twice), (9) dark mode renders cleanly via `document.documentElement.classList.add('dark')` and the sparkline `currentColor` stroke is visible, (10) the `/my` page contains no `String.fromCharCode(8212)` code point in the new card's rendered text.
- [ ] Standard box: no `/api/` change, no new hostname (the store is localStorage only, no network), no new npm dependency, no chart library, no edits to `package.json` / `package-lock.json`, no edits to `src/utils/quizPersonaStore.ts` (the existing single-snapshot store stays byte-identical; this ticket adds a SIBLING history store). Every string in the new util, the QuizHistoryCard, and the disclosure additions is hyphen-only per the 2026-05-07 em-dash Hard NO; Self-Review greps the diff for `String.fromCharCode(8212)` before pushing. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the existing `tests/e2e/my-dashboard.spec.ts` (ticket 0045), `tests/e2e/quiz-jsonld.spec.ts` (ticket 0039), `tests/e2e/quiz-share-link.spec.ts` (ticket 0052), `tests/e2e/trust-page.spec.ts`, `tests/e2e/roi-card-on-dashboard.spec.ts`, `tests/e2e/visit-streak-badge.spec.ts`, `tests/e2e/summary-recap.spec.ts` (ticket 0066) all stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- No /api/ changes, no package.json changes, no
  em-dashes in copy, dark-mode required.
- Migrating `dca_quiz_persona_v1` (ticket 0045
  single-snapshot store) into the new history array.
  The two stores coexist: the existing store still
  drives the existing readiness card, and the new
  history store drives the new trend card. Merging
  them would require a schema migration and would
  break the ticket 0045 spec.
- Adding the readiness history line to
  `SUMMARY_LINES` in the ticket 0066 printable
  summary recap. Composition into the summary is
  its own follow-up ticket once telemetry shows the
  history card earns re-take clicks.
- A "clear my quiz history" visible button on the
  card. `clearQuizHistory()` is exported for future
  use but no visible UI is wired, mirroring the
  ticket 0026 / 0074 pattern of reserving the clear
  function for a later general-clear UI ticket.
- Server-side sync of the quiz history (so a
  visitor sees the same trend on a different
  device). The store is browser-local per the
  privacy posture of the six sibling stores;
  cross-device sync is its own major ticket and
  requires a backend account surface.
- A chart library (Chart.js, Recharts, D3, ApexCharts).
  The sparkline is a hand-drawn inline SVG polyline
  under 20 lines of JSX; adding a chart library
  would touch `package.json` and violate the
  AGENTS.md dependency rule.
- Fabricated tier data (a synthetic "typical
  progression" line drawn behind the visitor's
  real line for comparison). The card renders only
  the visitor's own persisted history; no invented
  numbers, per the AGENTS.md conservative-claims
  rule.
- A share-link for the quiz history trend (a
  `/quiz/trend?data=` URL that decodes an
  eight-entry history from query params). The
  existing ticket 0052 share-link surfaces a
  single tier result; a history share-link would
  exceed reasonable URL length limits and would
  require a new decode path on `/quiz`. Out of
  scope; a compact hash-based share bundle is a
  separate ticket if telemetry justifies it.
- Emitting a `Dataset` or `ObservationalStudy`
  JSON-LD block for the history. The history is a
  browser-local per-visitor artifact, not a
  published dataset; emitting either type would
  misrepresent the artifact.
- Adding the QuizHistoryCard to the homepage hero,
  `/demos`, `/quiz`, or any vertical strip.
  Cross-surface promotion is its own follow-up
  ticket once telemetry shows the card earns
  re-take clicks on `/my`.
- Editing `src/pages/AIReadinessQuiz.tsx` beyond
  the single new `appendQuizHistory(...)` call in
  the completion branch. The existing quiz UI,
  scoring math, tier assignment, share-link
  emission, and JSON-LD block stay byte-identical.
- Widening the persona-name allow-list beyond
  "Just Starting" / "Getting Smart" / "AI-Ready".
  The three names are the source of truth per
  ticket 0045; introducing a fourth name would
  break both stores' allow-list guards and would
  require a coordinated edit across both.
- Adding the QuizHistoryCard to the `index.html`
  SEO Pilot pages table. The `/my` route is not
  in the table per the ticket 0045 precedent and
  is not indexable.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/utils/quizHistoryStore.ts` (under 160
  lines). Copy the shape of
  `src/utils/recentDemosStore.ts` (ticket 0026):
  parse-safe read via an `isQuizHistoryEntry`
  type guard, append-with-bound write that pops
  the oldest entry when length would exceed 8,
  quota-tolerant write. Persona allow-list is a
  module-level `KNOWN_PERSONAS: readonly Persona[]`
  constant deriving from the three names the
  existing `quizPersonaStore.ts` uses; a
  `appendQuizHistory` call with a persona outside
  the allow-list is a no-op. Dedup guard: if the
  incoming `completedAt` is within 60 seconds of
  the LAST stored entry's `completedAt`, the call
  is a no-op. Export `appendQuizHistory`,
  `getQuizHistory`, `clearQuizHistory`.
- `src/pages/AIReadinessQuiz.tsx` gains ONE
  additive line adjacent to the existing
  `setQuizPersona(tier.name, Date.now())` call
  around line 750: compute the timestamp ONCE,
  pass to both calls. New import at the top of
  the file: `import { appendQuizHistory } from '../utils/quizHistoryStore'`.
  No other quiz logic changes.
- `src/pages/MyDashboard.tsx` gains one new
  `QuizHistoryCard` render block (either inline
  or under `src/components/QuizHistoryCard.tsx`).
  The block reads `getQuizHistory()` once on
  mount into local state via `useState` +
  `useEffect`, renders the
  `data-testid="quiz-history-card"` wrapper when
  the length is >= 1, and returns null otherwise.
  The card renders BELOW the existing readiness
  card (per ticket 0045 vertical order) and
  ABOVE the existing strategy-call CTA / empty-
  state block. Add a `useRef<boolean>(false)`
  guard `quizHistoryViewTracked` adjacent to
  the existing `streakViewTracked` and
  `roiCardViewTracked` guards. Add a mirror
  `useEffect` firing
  `trackCTAClick('quiz_history_view', 'my_dashboard')`
  exactly once when the history has >= 1 entry.
- The sparkline SVG is inline JSX under 20 lines:
  `<svg viewBox="0 0 220 40" role="img" aria-label={...}>`
  containing one `<polyline>` and N `<circle>`
  elements computed from the history array. Do
  NOT introduce a chart library. Colors use
  `currentColor` so the light and dark themes
  inherit correctly per the ticket 0060 streak-
  badge SVG precedent.
- `src/data/demoDisclosures.ts` gains one new
  entry describing the `dca_quiz_history_v1`
  key: purpose ("history of your AI Readiness
  Quiz completions"), shape (`{ persona, completedAt }`
  bounded to 8 entries), and the "client-side
  only, never leaves your browser" language
  mirroring the ticket 0074 recent-compares
  entry. `src/pages/Trust.tsx` automatically
  renders the additive entry because its
  persistent-stores list reads from the
  demoDisclosures constant per the ticket
  0018 / 0033 mirror-source rule.
- Per the 2026-05-25 mirror-source rule, the
  three persona names in
  `quizHistoryStore.KNOWN_PERSONAS` MUST match
  the tier names in `AIReadinessQuiz.tsx` (the
  same source ticket 0045 mirrored). Do NOT
  hand-roll a second copy of the names; import
  from a shared source if one exists, or
  duplicate the names once and add a
  `// KEEP IN SYNC WITH src/pages/AIReadinessQuiz.tsx`
  comment.
- Per the 2026-05-30 second-@type lesson, this
  ticket adds NO new JSON-LD blocks. The pre-
  code grep is a no-op; record the no-op in the
  Implementation log for auditability.
- Per the 2026-05-07 em-dash Hard NO, every
  string in the new util, the QuizHistoryCard,
  the disclosure additions, and the sparkline
  aria-label is hyphen-only. Self-Review greps
  the diff for `String.fromCharCode(8212)`
  before pushing.
- Per the 2026-09-06 VISIBLE_LIMIT window drift
  lesson, the new spec's row-count assertion
  uses `toHaveCount(N)` over the seeded-then-
  read state, NOT `count > 0` over the live
  dashboard whose card visibility depends on
  prior state. The spec seeds
  `dca_quiz_history_v1` via `page.addInitScript`
  at the start of each case so the assertion
  is deterministic.
- `tests/e2e/quiz-history-card.spec.ts` (new) -
  one assertion per acceptance box. Model the
  spec on `tests/e2e/roi-card-on-dashboard.spec.ts`
  (ticket 0062, the direct peer for a `/my`
  card that reads a client-side store) and on
  `tests/e2e/quiz-share-link.spec.ts` (ticket
  0052, the direct peer for quiz-specific
  state seeding).
- Per the 2026-05-22 two-PR ship lesson, ship
  will need a follow-up
  `chore/0076-ship-status` PR after the feat
  PR merges to flip the ticket frontmatter AND
  its `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index
  never drift mid-flip.
- New deps: NO. The store reuses `localStorage`
  and standard `try/catch` per the ticket 0026
  pattern. The card and sparkline reuse React,
  `react-router-dom`, Tailwind utility classes,
  and inline SVG (no chart library). Schema
  migration: no (the new `dca_quiz_history_v1`
  key is additive and versioned per the
  existing store convention). Privacy / security
  surface change: YES - the new
  `dca_quiz_history_v1` key is added to the
  `/trust` disclosure list in the same PR per
  the ticket 0018 / 0033 / 0045 / 0060 / 0062
  / 0074 honesty rule; no data leaves the
  browser.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0076-quiz-history-sparkline-on-my-dashboard` opened
- YYYY-MM-DD - failing test added in `tests/e2e/quiz-history-card.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
