---
id: 0060
title: Return-visit streak badge on /my dashboard surfacing a multi-day engagement signal
status: groomed
priority: P2
area: demos
created: 2026-06-17
owner: gtm-innovation
---

## User story

As a returning prospect (a construction-company owner who
opened the demo hub last Tuesday, tried the voice
negotiator over the weekend, and bookmarked `/my` so they
can pick up the deal-analyzer demo on Monday), I want a
small visit-streak badge on the `/my` dashboard that shows
me how many distinct days in the last 14 days I have
visited the site ("Day 3 of 14" or "Visiting 4 days in a
row"), so that I can see my own engagement as a low-key
progress signal that nudges me to come back for one more
demo before I forget, without any push notification, any
email capture, or any guilt-trip messaging.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: returning-visit
detection already partially exists. `src/utils/recentDemosStore.ts`
writes a `viewedAt` timestamp on every demo visit and
`src/components/WhatsNewSinceVisit.tsx` (ticket 0040)
already reads the most-recent `viewedAt` to surface the
changelog delta on `/demos`. The dashboard at `/my`
(ticket 0045) reads `getRecentDemos()` and renders the
last three. But no surface today captures the COUNT of
distinct visit-days over a rolling window, which is the
single cheapest signal of repeat engagement. This ticket
adds a small new util `src/utils/visitStreakStore.ts`
that tracks distinct visit-days in a versioned
localStorage entry (`dca_visit_days_v1`), and the
existing `/my` dashboard renders one new badge card at
the top of the page reading the streak count via
`getVisitStreak()`. The badge is purely informational
(no streak penalty for missing a day, no celebratory
animation, no email capture); it shows "Visited N days
in the last 14" where N is the count of distinct YYYY-
MM-DD strings the visitor has visited any page on the
site over the trailing 14-day window. One new util,
one new card on an existing page, zero new backend, zero
new dependency, no edit to `/api/`, no edit to the
existing dashboard data flows.

### Stakeholder

This widens the moat in the retention dimension that the
ticket 0045 dashboard opened but did not close. Ticket
0045 made `/my` a canonical retention URL the visitor can
bookmark; ticket 0040 made `/demos` surface a "what's new
since you visited" delta. Neither surface tells the
visitor "you have been engaged for N consecutive days"
which is the single weakest retention signal the site
has compared to peer SaaS products that ship streak UIs
(Duolingo, Strava, GitHub contribution graph). The
streak badge is the smallest possible surface for that
signal: one number, one trailing-window text, one
sparkle icon, no animation. Per the ticket 0045 Out of
Scope language ("A daily-streak / progress badge on the
visitor dashboard is a follow-up ticket once telemetry
shows the dashboard earns repeat-visit clicks"), this is
pre-authorized follow-up work. The 14-day rolling window
is deliberately short so the badge never becomes a
guilt-trip surface (a 30-day streak that breaks would
demoralize a real prospect; 14 days resets gently and
the visitor can build it back in two weeks). The badge
also produces NO new persistent data outside the
localStorage entry the new util writes, so the privacy
disclosure on `/trust` widens by exactly one row.

### Visitor (in the real moment of use)

A construction-company owner who has visited the site on
Tuesday, Wednesday, Friday, Saturday, and now Monday
opens `/my` from a bookmark on a phone. The page renders
the existing dashboard with one new small card at the
top: "Visiting 5 days in the last 14" with a small
Sparkles icon (already imported into the dashboard from
`lucide-react`). The visitor reads it for two seconds,
thinks "I have actually been engaged with this," and
scrolls to their last-estimate card with a tiny dopamine
hit. They do NOT see a "DO NOT LOSE YOUR STREAK"
warning, do NOT see a confetti animation, do NOT get a
push permission prompt, do NOT see an email capture
form. The badge is calm by design. If the visitor has
never visited the site before, the badge renders
"Visiting 1 day in the last 14" on first load (today
counts as the first day) which is honest and not
inflationary. Light and dark mode supported; the page
reads cleanly on a 375px viewport.

### Growth

The "show me" moment is a small one but durable: when a
visitor checks `/my` for a third time in a week and sees
the badge tick from 2 to 3, they feel seen by the
product in a low-key way. That feeling is what a peer
recommends ("their dashboard remembers you, it is not
spammy"). Per the ticket 0045 / 0040 precedent, every
retention signal we add to `/my` is measured: the badge
fires `trackCTAClick('streak_badge_view', 'mydashboard')`
on render (debounced to once per page mount) so the
funnel can quantify how many visitors actually see the
badge versus skip past it. The badge also indirectly
lifts the bottom-of-page strategy-call CTA conversion
because a visitor who is told "you have been around for
N days" is structurally more qualified than a first-
time visitor with no engagement history.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new util `src/utils/visitStreakStore.ts` (under 90 lines) exports `recordVisitToday(): void` and `getVisitStreak(): { daysInLast14: number, latestDay: string | null }`. The store reads and writes a versioned localStorage entry under key `dca_visit_days_v1` whose value is a JSON-stringified `readonly string[]` of distinct YYYY-MM-DD date strings (sorted ascending). On `recordVisitToday()`, the store computes today's YYYY-MM-DD in the browser's local time, adds it to the array if not already present, prunes any entry older than 14 days from today, and writes back. On `getVisitStreak()`, the store reads the array, prunes anything older than 14 days, and returns `{ daysInLast14: array.length, latestDay: last(array) ?? null }`. All reads and writes are guarded in try/catch the same way `src/utils/recentDemosStore.ts` does; a corrupted entry returns the empty default and silently overwrites.
- [ ] The `recordVisitToday()` call is wired into exactly ONE site-entry surface: `src/App.tsx` (the existing top-level `<App />` component or its closest equivalent that mounts once per session). The call sits inside a `useEffect(() => { recordVisitToday(); }, [])` block so it fires once per app mount and not once per route change. Do NOT wire it into individual pages (that would multi-count a session). The implementer documents the placement choice in an HTML comment next to the new useEffect so a future editor does not accidentally relocate it.
- [ ] The `/my` dashboard page (`src/pages/MyDashboard.tsx`) renders one new badge card at the TOP of the page (above the existing four sections), reading the streak via `getVisitStreak()` on mount with the existing `safeRead` try/catch wrapper the page already uses (line 82-83). The badge card shows: a Sparkles icon (already imported), the text "Visiting <N> day in the last 14" or "Visiting <N> days in the last 14" (singular vs. plural correctly per N === 1), and a small subtitle "Welcome back" if N >= 2 OR "Glad you are here" if N === 1. If N === 0 (impossible in practice because `recordVisitToday()` ran on mount, but defensively), the badge does NOT render at all.
- [ ] The badge fires `trackCTAClick('streak_badge_view', 'mydashboard')` exactly once per page mount (debounced via a ref so a React 18 strict-mode double-mount does not double-fire). The badge has no clickable CTA; it is informational only. The badge contains zero em-dash characters in any rendered text and zero in the new util's exported types or constants.
- [ ] The `/trust` page (`src/pages/Trust.tsx`) gets ONE additive edit to its existing persistent-store disclosure list to add a new row naming the `dca_visit_days_v1` localStorage key, what it stores (a list of distinct YYYY-MM-DD strings over the trailing 14 days), and that it lives client-side only with no server-side write. The disclosure follows the existing row shape in the trust page; the edit is under 8 added lines and changes no existing copy. This satisfies the ticket 0018 / 0033 honesty rule that every persistent store appears in the disclosure.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, the badge card is visible above the existing four dashboard sections without pushing the existing sections out of the viewport on a 375x667 device, and the badge degrades gracefully on a localStorage-disabled browser (the `safeRead` wrapper returns null and the card simply does not render). The new util emits no console warnings on a corrupted localStorage entry; it silently resets.
- [ ] A new e2e spec at `tests/e2e/visit-streak-badge.spec.ts` asserts: (1) seeded-empty case clears localStorage, navigates to `/my`, and asserts the badge shows "Visiting 1 day in the last 14" (because the `recordVisitToday` mount fired today's date), (2) seeded-five-day case uses `page.addInitScript` to seed `dca_visit_days_v1` with five distinct YYYY-MM-DD strings within the last 14 days BEFORE mount, navigates to `/my`, and asserts the badge shows "Visiting 5 days in the last 14" (or 6 if today is one of the seeded five plus a sixth day for the mount), (3) seeded-with-old-entry case seeds three valid days plus two days older than 14 days, navigates to `/my`, and asserts the badge shows "Visiting 3 days in the last 14" (or 4 with today's mount) because the old entries were pruned, (4) corrupted-entry case seeds `dca_visit_days_v1` to a non-JSON string, navigates to `/my`, and asserts the badge renders with the post-mount default of 1 day (the corrupted read silently reset), (5) dark-mode case applies `document.documentElement.classList.add('dark')` and asserts the badge renders, (6) no-em-dash case reads `page.textContent('body')` and asserts no `String.fromCharCode(8212)`.
- [ ] No `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/utils/recentDemosStore.ts` or `src/utils/quizPersonaStore.ts` or `src/components/WhatsNewSinceVisit.tsx` (the existing retention surfaces stay byte-identical). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck` stay green. The new spec passes; the existing `tests/e2e/my-dashboard.spec.ts` (ticket 0045) and `tests/e2e/whats-new-since-visit.spec.ts` (ticket 0040) stay green.

## Out of scope

- No /api/ changes, no package.json changes, no em-dashes in copy, dark-mode required.
- A celebratory animation (confetti, a tier-up animation,
  a "10 day streak unlocked" toast). The badge is calm
  by design; any reward animation undermines the
  retention thesis (the badge is a low-key signal, not
  a gamification surface).
- A streak-broken warning ("you missed yesterday, your
  streak reset"). The 14-day rolling window is a
  forgiving model; explicit streak-loss messaging
  would be a guilt-trip surface. The badge simply
  shows the current count.
- A push-notification prompt asking the visitor to be
  reminded daily. Push permissions are a friction
  surface that the site has explicitly avoided per
  ticket 0036 ("no fourth capture form"); pushing
  the visitor would violate the same principle.
- An email-capture "send me a weekly streak summary"
  form. Same as above; the streak is a passive on-page
  signal, not an outbound channel.
- A leaderboard of visitor streaks. The site has no
  account system; ranking anonymous localStorage
  visitors against each other is structurally
  impossible and pointless.
- Cross-device streak sync. The store is localStorage
  only; cross-device persistence requires an account
  system and is out of scope per the ticket 0045
  rationale.
- Surfacing the streak on the homepage hero or the
  navbar. The badge is a `/my` surface only; cross-
  promotion is its own ticket once telemetry shows
  the badge earns repeat visits to the dashboard.
- A streak-themed JSON-LD block. There is no
  schema.org type that fits a "visitor streak"
  artifact and emitting one would be misrepresentation.
- A 30-day or 90-day rolling window variant. The
  14-day window is intentional (forgiving enough to
  rebuild, short enough to feel actionable); longer
  windows are a follow-up ticket only if telemetry
  shows visitors max out the badge regularly.
- Counting visits per day (a heatmap-style "visited
  3 times yesterday" detail). The badge counts
  distinct DAYS only; visit-frequency-per-day is a
  different mental model and out of scope.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/utils/visitStreakStore.ts` (under 90 lines).
  Mirror the shape of `src/utils/quizPersonaStore.ts`
  (ticket 0045, the closest peer because both are
  small localStorage utils with a versioned key). Export
  `recordVisitToday(): void` and
  `getVisitStreak(): { daysInLast14: number, latestDay: string | null }`.
  Use the existing `safeRead` / try-catch idiom the
  other stores use. Key: `dca_visit_days_v1`. The date
  format is `YYYY-MM-DD` computed from
  `new Date().toLocaleDateString('en-CA')` (the
  Canadian locale produces ISO YYYY-MM-DD reliably
  across browsers) or `new Date().toISOString().slice(0, 10)`
  if the implementer prefers UTC over local time;
  document the choice in a comment because UTC vs.
  local has end-of-day edge cases at midnight.
- `src/App.tsx` - one new `useEffect(() => { recordVisitToday(); }, [])`
  inside the top-level App component (or the closest
  component that mounts exactly once per session). Add
  the import `import { recordVisitToday } from './utils/visitStreakStore'`
  alongside the existing imports. Document the
  placement choice in an HTML comment naming this
  ticket so a future editor does not relocate it.
- `src/pages/MyDashboard.tsx` - one additive edit to add
  a new badge card at the TOP of the page (above the
  existing four sections). Add the import
  `import { getVisitStreak } from '@/utils/visitStreakStore'`
  next to the existing imports. Add a new state hook
  `const [streak, setStreak] = useState<ReturnType<typeof getVisitStreak> | null>(null)`
  and read it in the existing mount `useEffect` next
  to the existing `setRecent` / `setPersona` calls
  using the existing `safeRead` wrapper. Render the
  badge card conditionally when `streak && streak.daysInLast14 >= 1`.
  Fire `trackCTAClick('streak_badge_view', 'mydashboard')`
  exactly once per mount via a `useRef<boolean>(false)`
  guard so a React strict-mode double-mount does not
  double-fire.
- `src/pages/Trust.tsx` - one additive edit to the
  existing persistent-store disclosure list (search the
  file for `dca_quiz_persona_v1` from ticket 0045 to
  find the disclosure block; add a sibling row for
  `dca_visit_days_v1` with the same shape). The new
  row names the key, what it stores (the YYYY-MM-DD
  strings over the trailing 14 days), and the
  client-side-only scope. Under 8 added lines; no
  existing copy is edited.
- Per the 2026-05-07 em-dash Hard NO, every string in
  the new util, the new badge card, the trust
  disclosure row, and the new spec uses hyphens.
  Self-Review greps the diff for
  `String.fromCharCode(8212)` before pushing.
- Per the 2026-05-25 SEO Pilot lesson, no
  `meta[name="description"]` change is needed (the
  dashboard already emits its own; the badge is a
  content addition, not a meta change).
- `tests/e2e/visit-streak-badge.spec.ts` (new) - one
  assertion per acceptance box. Model the spec on
  `tests/e2e/my-dashboard.spec.ts` (ticket 0045, the
  closest peer for "client-side personalization page
  seeded via `page.addInitScript`"). Use
  `page.addInitScript` to seed `dca_visit_days_v1`
  before navigation in each seeded test; use
  `page.evaluate(() => localStorage.clear())` in the
  empty test. The seeded YYYY-MM-DD strings must be
  computed RELATIVE to today's date inside the spec
  (compute today and N days ago in the spec setup)
  so the test does not break when the system clock
  advances. The today-already-recorded case requires
  the spec to expect the array length plus one OR
  the same length depending on whether the seeded
  five-day set already includes today; the spec's
  assertion is conservative ("at least 5") so the
  edge case does not flake.
- Per the 2026-05-22 two-PR ship lesson, ship will
  need a follow-up `chore/0060-ship-status` PR after
  the feat PR merges to flip the ticket frontmatter
  AND its `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing
  the second PR so the file and index never drift
  mid-flip.
- New deps: NO. The util uses only `localStorage` and
  `Date`. Schema migration: no (the new key is
  additive and versioned per the existing store
  convention). Privacy/security surface change: yes,
  minor - one new localStorage key (`dca_visit_days_v1`)
  captures distinct YYYY-MM-DD visit-day strings over
  the trailing 14 days. The /trust page disclosure
  list MUST list the new key in the same PR so the
  disclosure stays honest per ticket 0018 / 0033 /
  0045.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0060-visit-streak-badge` opened
- YYYY-MM-DD - failing test added in `tests/e2e/visit-streak-badge.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
