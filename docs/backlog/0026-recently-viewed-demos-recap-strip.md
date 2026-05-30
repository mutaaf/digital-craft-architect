---
id: 0026
title: Recently viewed demos recap strip on the /demos hub
status: in-progress
priority: P2
area: demos
created: 2026-05-30
owner: gtm-innovation
---

## User story

As a returning visitor who tried two or three AI demos on a previous
session and came back to `/demos` to look for the one that hooked me, I
want a small "Recently viewed" strip at the top of the demo catalog
naming the demos I actually opened (with a one-tap link back into
each), so that I do not have to re-scroll through 10 industries and
30+ demo cards to find the lead responder I half-finished yesterday.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the `/demos` hub
(`src/pages/Demos.tsx`, 283 lines) renders every demo across 10
industries as one long catalog. Today a returning visitor lands on the
hub and has to either remember which vertical they were exploring or
scroll past every group to find the one demo they liked. Tickets 0010
(`ResumeDemoPrompt`) and 0014 (`saveLastEstimate`) already proved the
per-vertical "we saved your state" pattern using the `dca_*` localStorage
convention; this ticket extends the same convention across the cross-
vertical catalog with one new tiny utility (`dca_recent_demos_v1`)
and one new recap section inserted ABOVE the existing demo groups
on `/demos`. No new component file is strictly required (the strip
can be inline JSX in `Demos.tsx`); no new dep, no API change.

### Stakeholder

This deepens the retention moat in a way generic single-purpose demo
sites cannot copy. A multi-vertical catalog only earns its variety
when the visitor can re-find what they liked; otherwise the variety
becomes friction and the visitor bounces back to Google. The
`dca_recent_demos_v1` store is also a small structured artifact the
site can later use to power "More like this" cross-vertical
recommendations (out of scope for this ticket but pre-authorized by
having the data). The store stays client-side only (no network, no
PII), so it inherits the existing trust posture documented on
`/trust` per ticket 0018.

### Visitor (in the real moment of use)

A construction owner on a phone who tapped through the Lead Responder
and Voice Negotiator on Sunday evening opens `/demos` Tuesday morning
to show a colleague. Instead of scrolling, the first thing under the
hero is a "Recently viewed" strip with three small cards naming
"AI Lead Responder (Construction)" and "Voice Negotiator (Construction)"
linked back to the exact paths. One tap continues the demo, and the
`Continue your <Company> demo` prompt from ticket 0010 takes over from
there. On a brand-new visitor with no history, the strip is hidden
entirely (no empty state, no nag), so the first-time experience is
identical to today.

### Growth

The "show me" moment is the screenshot a salesperson can paste into a
follow-up email: "Open digitalcraftai.com/demos and you'll see the
two demos you tried last week at the top of the page." That implicit
"we remembered" signal is the same retention lever ticket 0010
proved per-vertical, lifted to the cross-vertical catalog. It also
creates a measurable retention KPI: clicks on the "Recently viewed"
strip are firable as a distinct `trackCTAClick` event so we can see
in GA how often returning visitors use the shortcut.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new client-side store at `src/utils/recentDemosStore.ts` (new file) exports `recordDemoVisit(path: string, title: string, vertical: string): void`, `getRecentDemos(): RecentDemo[]`, and `clearRecentDemos(): void`. The store persists at most 5 entries (most recent first) under the localStorage key `dca_recent_demos_v1`, deduplicates by `path` (a re-visit moves the entry to the front, does not append a duplicate), is parse-safe (a malformed value returns `[]` without throwing), and is bounded so a quota-exceeded write silently no-ops per the existing `dca_*` store convention in `src/pages/construction/lastEstimateStore.ts` lines 40 to 46.
- [ ] Every demo Link in `src/pages/Demos.tsx` lines 217 to 236 fires `recordDemoVisit(demo.path, demo.title, group.vertical)` in addition to the existing `trackCTAClick('open_demo', ...)` call on line 220. The two side-effects share the same `onClick` handler; the analytics call is unchanged.
- [ ] On `/demos`, a new recap section renders ABOVE the "Demo groups" block (between line 203 and line 205) ONLY when `getRecentDemos()` returns at least one entry. The section heading reads exactly "Recently viewed" (no em-dash, no exclamation), and each entry renders as a card showing the demo title, the vertical label in muted text, and a `Try it again` arrow link pointing at the stored `path`. The cards lay out in a responsive grid mirroring the existing demo card grid (`grid gap-4 sm:grid-cols-2 lg:grid-cols-3`).
- [ ] When `getRecentDemos()` returns an empty array (first-time visitor, cleared storage, or storage unavailable), the recap section does NOT render and the page's existing layout is byte-identical to today's. A first-visit Playwright spec asserts the section is absent from the DOM.
- [ ] Each card click fires `trackCTAClick('recent_demo', 'demos_hub_recap')` so the recap surface is measurable in GA separately from the catalog's `open_demo` events. Clicking a card navigates SPA-internally to the stored `path` (no full reload), mirroring the assertion pattern in `tests/e2e/demo-breadcrumbs.spec.ts`.
- [ ] The recap section renders in light AND dark mode on a 375px mobile viewport, contains no em-dash character in any rendered text, no entry path resolves to a 404 (the store rejects unknown paths by validating against the union of `path` values in `DEMO_GROUPS` at write time so a deleted demo route does not strand a dead link), and `node scripts/check-backlog.mjs` plus `npm run check-links` stay green.
- [ ] No new hostnames, no `/api/` change, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `DemoContext`. Storage stays under the existing `dca_*` localStorage namespace already documented in `src/pages/Trust.tsx` lines 141 to 148 so no new privacy disclosure is required.

## Out of scope

- A "Recently viewed" surface on any page other than `/demos`. The
  per-vertical demo hubs (`/construction/demo`, `/realestate/demo`,
  etc.) already have the per-vertical `ResumeDemoPrompt` from ticket
  0010; adding a second recap there would duplicate the surface.
- Cross-vertical recommendations ("People who tried X also tried Y"),
  inferred next-best demo, or any algorithmic ranking. The store is
  pre-authorized to feed a future recommendation ticket; this ticket
  only ships the recap strip and the underlying store.
- Editing `src/pages/Trust.tsx` to document `dca_recent_demos_v1`
  explicitly. The key follows the existing `dca_*` convention already
  generically described on `/trust` and stores no PII (path, title,
  vertical, timestamp only). If a future privacy edit deepens the
  per-key disclosure, it can name this key then.
- Server-side persistence, an authenticated "my history" page, or
  syncing the recent list across devices.
- A "clear history" UI surface on `/demos`. The store exports
  `clearRecentDemos()` for future use, but the recap section has no
  visible clear control in this ticket (the value would not justify
  the chrome on a 5-entry strip).
- Editing any of the 30+ per-vertical demo Link onClick handlers
  outside of `Demos.tsx`. Visits recorded only via the `/demos` hub
  catalog are enough to populate the recap; per-vertical demo-card
  links can be wired in a follow-up if usage data justifies it.
- A schema.org `Collection` or `ItemList` for the recap (the existing
  `ItemList` block at `src/pages/Demos.tsx` lines 138 to 152 covers
  the catalog already, and the recap is a personalization surface,
  not a crawlable list).

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/utils/recentDemosStore.ts` (under 80 lines). Mirror the
  parse-safe pattern in `src/pages/construction/lastEstimateStore.ts`
  exactly: typed `RecentDemo` shape (`{ path: string; title: string;
  vertical: string; viewedAt: number }`), `STORAGE_KEY = 'dca_recent_demos_v1'`,
  `MAX_ENTRIES = 5`, every `localStorage.getItem`/`setItem` wrapped
  in `try/catch` with a `/* storage unavailable - non-fatal */`
  comment per the existing convention. `recordDemoVisit` reads the
  list, removes any existing entry with the same `path`, unshifts the
  new entry, truncates to `MAX_ENTRIES`, and writes back. A leading
  `KNOWN_PATHS: Set<string>` constant lists the union of every
  `demo.path` in `DEMO_GROUPS`; `recordDemoVisit` returns without
  writing if `!KNOWN_PATHS.has(path)`, so a renamed-or-removed demo
  route cannot strand a dead recap link. Export `KNOWN_PATHS` so the
  test can assert it stays in sync with `DEMO_GROUPS`.
- The 2026-05-25 mirror-source lesson applies: `KNOWN_PATHS` is
  derived from `DEMO_GROUPS`, not hand-maintained as a parallel
  array. Either compute it at module load
  (`new Set(DEMO_GROUPS.flatMap(g => g.demos.map(d => d.path)))` -
  requires moving `DEMO_GROUPS` into a sibling data module the store
  can import without circular dep) OR keep the literal `KNOWN_PATHS`
  set in the store and add a unit-style assertion in the e2e spec
  that every entry in `KNOWN_PATHS` matches a `Route path=` in
  `src/App.tsx`. The cleaner path is the data-module extraction
  (`src/data/demoCatalog.ts` exporting `DEMO_GROUPS` and the derived
  set) but either is acceptable in the 200-line budget.
- `src/pages/Demos.tsx` - two edits only:
  (1) wrap the existing demo Link onClick on line 220 with both
  `trackCTAClick('open_demo', ...)` AND
  `recordDemoVisit(demo.path, demo.title, group.vertical)`; and
  (2) insert a new `<section>` between line 203 and line 205 that
  reads `const recent = getRecentDemos()` (call inside the component
  body, not at module scope, so the snapshot is fresh per render),
  short-circuits to `null` when `recent.length === 0`, and otherwise
  renders the recap grid using the same Tailwind classes as the
  existing demo group grid for visual consistency. Heading copy:
  `"Recently viewed"` (no em-dash).
- Reading from localStorage in a render path is safe because
  `Demos.tsx` already runs client-side (it has no SSR pre-render),
  but be defensive: wrap `getRecentDemos()` in a try/catch at the
  call site OR have the store do it - the store already does, so the
  component path is one line. No `useEffect` needed; the snapshot is
  read on mount and stays stable for the page lifetime (a new
  visit fires `recordDemoVisit` AFTER navigation away from `/demos`).
- Per the 2026-05-07 em-dash Hard NO, write the recap heading and
  every card string with hyphens or restructured punctuation.
  Self-Review must grep the diff for the em-dash character before
  pushing.
- `tests/e2e/recent-demos-recap.spec.ts` (new) - one spec per
  acceptance box. First-visit case: navigate to `/demos`, assert
  `getByText('Recently viewed')` is NOT visible. Returning-visit
  case: pre-seed `localStorage.setItem('dca_recent_demos_v1', JSON.stringify([...]))`
  in a Playwright `addInitScript`, navigate to `/demos`, assert the
  heading is visible, assert the expected card titles render, click
  a card and assert SPA navigation to the expected path (URL change,
  no full reload). Quota/parse-error case: pre-seed an invalid
  string, assert no crash and recap is absent. Dark-mode case: run
  the returning-visit spec with `document.documentElement.classList.add('dark')`
  pre-applied. Cross-route case: after recording a visit via clicking
  a demo card on `/demos`, navigate to `/demos` again and assert the
  entry appears at the top of the recap. Path-validation case: pre-
  seed an unknown path (e.g. `/construction/demo/this-was-removed`),
  assert the store rejects it and the recap renders only the valid
  entries. Mirror the localStorage-pre-seeding pattern in
  `tests/e2e/resumable-demo-session.spec.ts` (which uses
  `dca_demo_company_*` similarly).
- Per the 2026-05-28 inline-assertion lesson, an additional invariant
  CAN be encoded in `scripts/check-meta.ts` (already in the local
  gate): assert `KNOWN_PATHS` is a strict subset of the `Route path=`
  values parsed from `src/App.tsx`. This is optional; the Playwright
  path-validation case already covers it at the user level. If the
  dev chooses the data-module extraction (`src/data/demoCatalog.ts`),
  the invariant is satisfied by construction and no script check is
  needed.
- Per the 2026-05-22 two-PR ship lesson, ship will need a follow-up
  `chore/0026-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter AND its `docs/backlog/README.md` index row to
  `shipped` together.
- New deps: no. Schema migration: no (the localStorage key is new;
  malformed values are tolerated by construction so a future schema
  bump is a `_v2` suffix). Privacy/security surface change: no - the
  store records path, title, vertical, and timestamp only, all of
  which are already public catalog metadata; no PII is captured.
  Storage stays under the existing `dca_*` namespace already
  generically documented on `/trust` per ticket 0018. Per the
  AGENTS.md Hard NO, this ticket does not touch `/api/`, `.env*`,
  `package.json`, or `package-lock.json`.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-05-30 - branch `feat/0026-recently-viewed-demos-recap-strip` opened off fresh `origin/main`; ticket file flipped to `in-progress` (README index row flips alongside in the feat code commit so `check-backlog.mjs` stays green at PR HEAD).
