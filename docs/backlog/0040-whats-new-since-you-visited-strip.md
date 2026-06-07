---
id: 0040
title: "What's new since you visited" delta strip on the /demos hub for week-2-and-beyond returners
status: groomed
priority: P2
area: demos
created: 2026-06-07
owner: gtm-innovation
---

## User story

As a prospect who took a demo two to four weeks ago and is
re-landing on `/demos` from an email or a saved tab, I want a
small "what is new since you last visited" strip at the top of
the hub showing the changelog entries shipped since my last
visit (capped at the most recent five), so that I can see the
product is alive and worth a second look without scrolling the
full `/changelog` page or re-evaluating every demo card.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: three pieces already
exist independently and have never been joined.
(1) `src/utils/recentDemosStore.ts` already writes a
`viewedAt` timestamp into localStorage on every demo visit
(ticket 0026). (2) `src/data/changelogEntries.ts` is the typed,
build-time-regenerated changelog list with a `date` field on
every entry (ticket 0032). (3) `src/pages/Demos.tsx` already
renders the recently-viewed recap strip from the same store
above its DEMO_GROUPS grid (ticket 0026). Joining these takes
one small client-side filter: read the most recent `viewedAt`
across all `getRecentDemos()` entries, find every
`changelogEntries[i].date > viewedAt`, render the top five in a
strip below the existing recent-demos recap. No new endpoint,
no new dependency, no new storage key, no new analytics field
beyond a single CTA-click reuse.

### Stakeholder

This is the only currently-targeted retention surface for the
W2-W4 dropoff window. Ticket 0002 (5-day email course) covers
days 1-5 by construction. Ticket 0010 (resumable demo session)
covers same-week return. Ticket 0026 (recently-viewed recap)
covers any-time return but tells the visitor about THEIR
history, not about OUR ship velocity. Ticket 0032
(`/changelog` page) is great for crawlers and for new
visitors but a returning visitor will not load it
spontaneously. This strip is the bridge: it shows ONLY the
delta against the visitor's last known visit, so a two-week
returner sees "5 new since you visited" and a four-week
returner sees "9 new since you visited" - a concrete signal of
product momentum without an inbox burden, without a new email,
and without a fourth lead-capture form (per the 0036 Out of
Scope language on "a fourth is noise").

### Visitor (in the real moment of use)

A construction-company owner who tried `/construction/demo/voice-negotiator`
three weeks ago re-opens a saved `/demos` tab on a phone. Above
the existing "Recently viewed" recap they see a single soft
strip: "5 new since your last visit on 2026-05-17," with three
chips ("Public uptime page," "Compare Podium," "AI for
electricians") and a "See all" link to `/changelog`. One tap on
a chip routes them to the relevant page (changelog entries that
mention a route deep-link to that route via the existing
`changelogEntries[i].path` field; chips for entries with no
path link to `/changelog` with a hash anchor to that entry).
The strip is conditional: a first-time visitor with no
`viewedAt` history sees nothing (zero noise); a same-day
returner with no entries since their last visit sees nothing.
Light and dark mode supported.

### Growth

The "show me" moment is a screenshot a salesperson can paste
into a re-engagement reply: "we shipped 7 new things since you
last visited, including AI for electricians and a public
uptime page." Each chip click fires
`trackCTAClick('whatsnew_delta_open', '<entryId>')` and the
"See all" link fires `trackCTAClick('whatsnew_delta_seeall', 'demos')`,
so we can measure which delta entries actually pull a returner
back into the funnel. That telemetry then informs which kinds
of ship updates (trade landing pages vs. trust surfaces vs.
compare pages) earn returner clicks - directly informing future
groom priorities. Per the ticket 0010 / 0026 / 0032 precedent,
the strip itself is client-side only and emits no new network
call.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new `WhatsNewSinceVisit` component at `src/components/WhatsNewSinceVisit.tsx` (new file, under 120 lines) renders ABOVE the existing recently-viewed recap on `src/pages/Demos.tsx` (which today sits above the DEMO_GROUPS grid). The component reads the most recent `viewedAt` timestamp from `getRecentDemos()` (the existing helper in `src/utils/recentDemosStore.ts`) and filters `changelogEntries` (imported from `src/data/changelogEntries.ts`) to entries with `date > lastVisitTimestamp`. The top FIVE most-recent entries render as chips; a "See all" link routes to `/changelog`.
- [ ] The strip is conditional: (a) a visitor with NO `getRecentDemos()` entries (first-time, no history) sees NOTHING (the component returns `null`), (b) a visitor whose most-recent `viewedAt` is AFTER every `changelogEntries[i].date` (same-day returner, no delta) sees NOTHING, (c) a visitor with at least one qualifying entry sees the strip with a header reading "X new since your last visit on YYYY-MM-DD" (X is the count, capped at 5 for display; if the underlying count is higher, the header reads "X new since your last visit on YYYY-MM-DD" with the unclipped X but only 5 chips render). The header date is formatted from the `viewedAt` epoch using `toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })` so the visible string reads e.g. "May 17, 2026."
- [ ] Each chip shows the changelog entry's title and links to either (a) `changelogEntries[i].path` if the field is present and resolves to a registered route in `tests/e2e/routes.ts`, or (b) `/changelog#<entryId>` otherwise. The implementer adds a runtime guard in the component: a chip whose `path` does NOT match any entry in the `ROUTES` array from `tests/e2e/routes.ts` (imported as a typed read-only set) falls back to the changelog hash link, so a renamed route cannot strand a dead chip link.
- [ ] Per the 2026-05-25 mirror-source rule, the strip's count of "new" entries MUST be derived from the same `changelogEntries` constant the `/changelog` page reads. The component does NOT maintain its own filtered copy or its own counter; it filters live on render. An e2e assertion confirms that if a new changelog entry is added to `changelogEntries.ts` and dated later than the test's seeded `viewedAt`, the strip count increments by exactly one without any component code change.
- [ ] The component renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text, includes a `data-testid="whats-new-strip"` wrapper attribute (and `data-testid="whats-new-chip"` on every chip) for spec assertion, and degrades to `null` if `getRecentDemos()` throws or returns a malformed value (the existing helper already guards this; the component adds a try/catch around the read so a corrupted localStorage value never breaks the `/demos` hub).
- [ ] A new e2e spec at `tests/e2e/whats-new-since-visit.spec.ts` asserts: (1) first-time-visitor case - clear localStorage, navigate to `/demos`, assert the strip does NOT render (zero `data-testid="whats-new-strip"` elements). (2) Same-day-returner-no-delta case - seed localStorage with a `dca_recent_demos_v1` entry whose `viewedAt` is `Date.now()`, navigate to `/demos`, assert the strip does NOT render. (3) Two-week-returner case - seed `viewedAt` to a timestamp 14 days in the past, navigate to `/demos`, assert the strip DOES render, the header text matches `/new since your last visit/`, and at least one chip renders. (4) Cap-at-5 case - seed `viewedAt` to a date OLDER than every changelog entry, navigate to `/demos`, assert exactly 5 chips render (not 6, not more). (5) Dead-route fallback case - mock a chip whose `path` is `/non-existent-route`, assert the chip's href ends in `/changelog#<entryId>` not the dead path. (6) Dark mode case - apply `document.documentElement.classList.add('dark')` and assert the strip renders. (7) No-em-dash case - read `page.textContent('[data-testid="whats-new-strip"]')` and assert no `String.fromCharCode(8212)`. (8) Mirror-source case - read the chip titles, assert each one appears verbatim in `changelogEntries`.
- [ ] No new hostname, no `/api/` change, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/data/changelogEntries.ts` (the changelog is regenerated by `scripts/generate-changelog.ts` at build time per ticket 0032 and is not hand-edited), no edits to `src/utils/recentDemosStore.ts` (the existing `viewedAt` field is reused as-is, no new field added). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta` stay green; `npm run typecheck` stays clean. The new spec passes; the existing ticket-0026 `recent-demos-recap.spec.ts` AND the ticket-0032 `changelog-page.spec.ts` stay green.

## Out of scope

- A second instance of the strip on any other page (homepage,
  trust, vertical landing pages). The ticket scopes the strip
  to `/demos` only; other surfaces are follow-up tickets if
  the funnel telemetry justifies them.
- A "subscribe to a weekly digest" email capture inside the
  strip. Three capture surfaces already exist (tickets 0002,
  0015, 0033) and ticket 0036 explicitly closed the door on a
  fourth as noise. The strip is a passive surface, not a
  capture form.
- Persisting "this entry has been viewed" state so chips
  collapse after click. That requires a new localStorage key
  and a new write path; the strip stays stateless and re-shows
  the same delta until the visitor records a new demo visit,
  which naturally moves `viewedAt` forward and shrinks the
  delta on its own.
- Server-side rendering of the strip for crawlers. The strip
  is personalization, not SEO; crawlers see nothing (they
  have no localStorage), which is correct. The `/changelog`
  page (ticket 0032) is the crawlable surface.
- Adding a `viewedAt`-on-quiz or `viewedAt`-on-trust write so
  non-demo visits also seed the strip. The store is
  deliberately scoped to demos per ticket 0026's KNOWN_PATHS
  rule; widening the scope is a separate ticket.
- A "compare to last week" toggle in the strip. The header
  date does the same job in one line.
- Animating the strip in. Motion is a polish concern, not the
  point of this ticket; ship the static strip first.
- Updating the existing `/changelog` page to show the same
  delta. The `/changelog` page is intentionally a full
  reverse-chrono list; the strip is the personalized excerpt.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/components/WhatsNewSinceVisit.tsx` (under 120
  lines). Read `getRecentDemos()` from
  `src/utils/recentDemosStore.ts` once on mount via
  `useState` + `useEffect`. Compute
  `lastVisit = Math.max(...recent.map(r => r.viewedAt))` if
  the array is non-empty, else return `null`. Filter
  `changelogEntries` (imported from
  `src/data/changelogEntries.ts`) to entries with
  `new Date(entry.date).getTime() > lastVisit`. If the
  filtered list is empty, return `null`. Slice the first 5,
  render as Tailwind chips with `dark:` variants. Apply
  `data-testid="whats-new-strip"` on the wrapper and
  `data-testid="whats-new-chip"` on each chip.
- The chip link logic uses the existing typed `ROUTES`
  constant from `tests/e2e/routes.ts`. The component imports
  `ROUTES` and converts it to a `Set` once at module load
  for O(1) lookup; if `entry.path` is in the set, the chip
  links there, else it links to
  `/changelog#${entry.id}`. Per the 2026-05-25 mirror-source
  rule, `ROUTES` is the single allow-list for both the
  smoke spec and this component, so a route rename cannot
  drift the two.
- `src/pages/Demos.tsx` - one-line import + one-line render
  of `<WhatsNewSinceVisit />` above the existing
  `<RecentlyViewedRecap />` block (or above the
  DEMO_GROUPS grid if the recap component is named
  differently in the current source; grep `recentDemos` to
  find the existing render site). This is the only edit to
  `Demos.tsx`.
- Per the 2026-05-07 em-dash Hard NO, every string in the
  component (header copy, "See all" link, chip text fallback)
  uses hyphens. Self-Review greps the diff for the em-dash
  character (`U+2014`) before pushing. The header reads
  exactly "X new since your last visit on <date>" with a
  comma if needed, never an em-dash.
- Per the 2026-05-25 SEO Pilot lesson, this ticket does NOT
  touch Helmet, the index.html SEO Pilot pages table, or any
  meta tag. The strip is a body-only component.
- Per the 2026-05-30 second-@type lesson, this ticket emits
  no JSON-LD. The strip is personalization; structured data
  is not appropriate.
- `tests/e2e/whats-new-since-visit.spec.ts` (new) - one spec
  per acceptance box. Model the spec on
  `tests/e2e/recent-demos-recap.spec.ts` (ticket 0026, the
  closest peer for "client-side personalization strip on
  /demos"). Use `page.addInitScript` to seed
  `localStorage['dca_recent_demos_v1']` before navigation in
  the seeded-state tests; use `page.context().clearCookies`
  + `page.evaluate(() => localStorage.clear())` in the
  first-time-visitor test. The dead-route fallback test
  uses `page.evaluate` to inject a chip with a known dead
  `path` (or alternatively asserts the runtime guard logic
  via a unit-style assertion if the component is structured
  to allow it).
- Per the 2026-05-22 two-PR ship lesson, ship will need a
  follow-up `chore/0040-ship-status` PR after the feat PR
  merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to `shipped` together;
  run `node scripts/check-backlog.mjs` before pushing the
  second PR so the file and index never drift mid-flip.
- New deps: NO. The component uses `react-router-dom`'s
  `Link`, `lucide-react` for a chip icon, and the existing
  `trackCTAClick` analytics helper. Schema migration: no.
  Privacy/security surface change: no - the component reads
  only the existing `dca_recent_demos_v1` localStorage key
  (already disclosed on `/trust` per ticket 0018 and via
  the per-demo chip per ticket 0033); no new key is
  written, no new external network call is fired, no new
  analytics field is captured beyond reusing the existing
  `trackCTAClick` helper.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0040-...` opened
- YYYY-MM-DD - failing test added in `tests/e2e/whats-new-since-visit.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
