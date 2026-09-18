---
id: 0082
title: Downloadable JSON evaluation dossier export from /my composing every persisted client-side artifact as a portable machine-readable file
status: groomed
priority: P1
area: demos
created: 2026-09-18
owner: gtm-innovation
---

## User story

As a returning prospect who has accumulated real
evaluation state across multiple visits (a
construction-firm CFO who saved a $180k renovation
estimate on Tuesday, ran the ROI calculator on
Wednesday and saw a $54,000-per-year figure,
completed the AI Readiness Quiz twice with an
improving tier, opened three comparison pages
against their incumbent tool, and tried four demos),
and as their procurement lead who needs a portable
machine-readable artifact to attach to a vendor-file,
their solo-engineer partner who wants a JSON they
can diff against a similar dossier from a competing
vendor, or their compliance reviewer who wants a
single structured document to attach to a due-
diligence thread, I want a "Download your evaluation
as JSON" button on the `/my` dashboard that emits
one signed-and-dated JSON file containing every
persisted client-side artifact (saved estimate,
saved ROI, quiz history sparkline, quiz persona,
recent demos, recent comparisons, visit streak,
generation timestamp, schema version), so that I
can back up my state, forward it to a colleague,
attach it to my procurement thread, or re-import
it later without an account, without a server call,
and without any state leaving my browser except by
my own explicit download action.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the `/my`
dashboard (ticket 0045) now composes SEVEN
persisted client-side artifacts (`recentDemosStore`
from ticket 0026, `lastEstimateStore` from ticket
0014, `quizPersonaStore` from ticket 0045,
`visitStreakStore` from ticket 0060, `roiResultStore`
from ticket 0062, `recentComparesStore` from ticket
0074, `quizHistoryStore` from ticket 0076) plus the
printable HTML recap from ticket 0066. The printable
recap is designed for a human eye on a printed page;
it is not a structured machine-readable artifact. A
prospect who wants to attach their evaluation state
to a procurement thread, back it up to their own
drive, or diff it against a competing vendor's
dossier needs a STRUCTURED JSON file, not a
rasterized HTML print. This ticket adds ONE new
button in the ticket 0066 recap section reading
"Download JSON" that (a) reads every persisted
store via each store's existing public getter, (b)
composes them into one typed `EvaluationDossier`
object with a `schemaVersion: '1.0'` field and a
`generatedAt: string /* ISO */` field, (c) triggers
a browser download of `digital-craft-evaluation-<YYYY-MM-DD>.json`
via an in-memory Blob + `URL.createObjectURL` +
click-anchor pattern (no new dependency, no server
round-trip). Zero new backend, zero new persistent
store, zero new API route, zero edit to any of the
seven existing stores. This is a purely additive
composition surface over already-persisted data,
mirroring the ticket 0066 recap pattern but emitting
a `.json` instead of a print stylesheet.

### Stakeholder

This widens the moat in the data-portability and
trust dimensions along an axis no shipped ticket
covers. Per the ticket 0069 subprocessors precedent
and the ticket 0081 security posture precedent, the
site's defensible position is that no state ever
leaves the browser; the JSON download makes that
promise visible and verifiable (a buyer can inspect
the file and confirm every field is data they
themselves generated on the site). Per the ticket
0077 ethics precedent (no dark-pattern data
retention, visitor owns their own state), a
one-tap "download my data" export is exactly the
GDPR-style data-portability control regulated-
vertical buyers expect but that AI-vendor sites
almost never ship at the client-side level. The
artifact is also a structural moat: a competitor
who wants to imitate this must first persist an
equivalent breadth of client-side state (which
ticket 0014 through 0076 built over four months),
then wire a matching schema-versioned export, then
publish the schema so it is diffable. Per the
2026-09-12 code-beats-prose lesson, the dossier
schema MUST mirror the actual store contracts (the
groomer names seven stores here; the implementer
greps every `src/utils/*Store.ts` file and every
`lastEstimateStore.ts` module first, and pins the
schema to the ACTUAL exported types and getter
return shapes rather than to this ticket's inline
list). The `dca_recent_compares_v1` bug family per
the 2026-09-10 raw-vs-sliced lesson applies: the
dossier reads the RAW pre-slice list from each
store so a visitor who has visited 8 comparisons
gets 8 entries in the export, not just the display-
sliced 5.

### User (in the real moment of use)

A property-management firm's IT-security reviewer
opens `/my` Tuesday morning after their CFO forwarded
the URL Friday evening. They see the seven cards
(saved estimate, saved ROI, quiz history sparkline,
quiz persona, recent demos, comparisons weighed,
visit streak), scroll to the ticket 0066 recap
section, and see two buttons side by side: "Print
summary" (the ticket 0066 button, byte-identical)
and "Download JSON" (new). They tap "Download JSON"
on their laptop; the browser saves
`digital-craft-evaluation-2026-09-18.json` to their
default download folder in under 300ms with no
network call. They open the file in their text
editor, scan the schema, confirm every field is
data their CFO entered on the site (no invented
company names, no hidden telemetry ids, no third-
party tracking hashes), attach the file to the
procurement Slack thread, and send. Two weeks later
a portfolio-company DPO does the same walk. On a
375px mobile viewport the button renders as a full-
width secondary button below the print button;
light and dark mode both render cleanly.

### Growth

The "show me" moment is the screenshot a buyer's
procurement lead pastes into a vendor-file thread:
one JSON file titled `digital-craft-evaluation-2026-09-18.json`,
readable in a code editor, schema-versioned, dated,
containing exactly the fields the visitor generated
on the site. That artifact is structurally the
strongest data-portability trust signal the site
can produce because it makes the "no state leaves
the browser" promise directly verifiable (the buyer
can grep the file for their own inputs and confirm
nothing else is there) AND it converts a returning
prospect's persisted state into a shareable
artifact their teammates can inspect asynchronously.
Per the ticket 0066 growth argument, a returning
visitor with a rich dossier is the highest-lifetime-
value prospect in the funnel; the JSON export
compounds that value by making the dossier
transferable across the buyer's own team without a
Digital Craft account. The download click fires
`trackCTAClick('dashboard_dossier_download', 'my_dashboard_recap')`
so dossier-export volume is measurable in GA
independently of the ticket 0066 print-button
telemetry.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new typed data module at `src/utils/evaluationDossier.ts` (new file, under 200 lines) exports (a) a `DOSSIER_SCHEMA_VERSION = '1.0'` const, (b) an `EvaluationDossier` interface with the shape `{ schemaVersion: string, generatedAt: string /* ISO 8601 with timezone */, artifacts: { estimate: LastEstimate | null, roi: RoiResult | null, quizPersona: QuizPersona | null, quizHistory: QuizHistoryEntry[], recentDemos: RecentDemo[], recentCompares: RecentCompare[], visitStreak: VisitStreak | null } }`, (c) a `buildEvaluationDossier(): EvaluationDossier` function that reads each persisted store via its existing public getter (`readLastEstimate` from `lastEstimateStore`, `readRoiResult` from `roiResultStore`, `readQuizPersona` from `quizPersonaStore`, `readQuizHistory` from `quizHistoryStore`, `readRecentDemos` from `recentDemosStore`, `readRecentCompares` from `recentComparesStore`, `readVisitStreak` from `visitStreakStore`) and composes them into one object. Per the 2026-09-12 code-beats-prose lesson, BEFORE writing code the implementer greps every `src/utils/*Store.ts` file (and `src/pages/construction/lastEstimateStore.ts` per ticket 0014) and pins the `EvaluationDossier.artifacts` sub-types to the ACTUAL exported types and getter return shapes; the type-name list in this AC is groomer prose per the 2026-09-12 rule. Per the 2026-09-10 raw-vs-sliced lesson, `recentCompares` and `recentDemos` are read from the RAW list getter (or a new `readAllVisited()` helper if the display getter slices), not from a display-sliced view; every entry the visitor has genuinely visited appears in the export.
- [ ] A new UI element in `src/pages/MyDashboard.tsx` inside the existing ticket 0066 `data-testid="dashboard-summary-recap"` section: one new button with `data-testid="dashboard-dossier-download"` reading "Download JSON" placed adjacent to the ticket 0066 print button, styled as a secondary button per the existing shadcn/ui `Button` variant conventions (mirror the ticket 0066 print button's variant, size, and dark-mode classes). Clicking the button (a) calls `buildEvaluationDossier()`, (b) serializes to JSON with two-space indent, (c) creates a Blob with type `application/json`, (d) creates an object URL, (e) triggers a click on a hidden `<a download="digital-craft-evaluation-<YYYY-MM-DD>.json">`, (f) revokes the object URL after a 100ms microtask. No `window.open`, no new tab, no server round-trip. The filename YYYY-MM-DD uses the visitor's local date (via `new Date().toISOString().slice(0, 10)` in UTC to keep the filename deterministic across timezones for a test seed).
- [ ] The download click fires `trackCTAClick('dashboard_dossier_download', 'my_dashboard_recap')` BEFORE the Blob is created (so the beacon fires even if the download itself is blocked by a browser policy, mirroring the ticket 0023 footer chip beacon-before-navigate pattern).
- [ ] The emitted JSON file passes a shape assertion: `parsed.schemaVersion === '1.0'`, `typeof parsed.generatedAt === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(parsed.generatedAt)`, `parsed.artifacts` is a plain object with the seven keys enumerated in AC #1, every array-typed artifact is an Array (even when empty), every nullable artifact is either `null` or an object (never `undefined`). No PII the visitor did not enter appears in the file (no hostname, no user agent, no localStorage keys other than the seven persisted stores, no IP address, no session id, no third-party analytics id).
- [ ] Per the 2026-05-25 mirror-source rule, the `EvaluationDossier.artifacts` sub-type keys AND the seven store getter names are wired through a single ordered constant `DOSSIER_ARTIFACT_KEYS: readonly ['estimate', 'roi', 'quizPersona', 'quizHistory', 'recentDemos', 'recentCompares', 'visitStreak']` exported from `src/utils/evaluationDossier.ts`. The spec imports this constant (per the 2026-06-07 mirror-source-across-src-tests lesson: the dossier module lives in `src/utils/` and the test imports it directly via `import { DOSSIER_ARTIFACT_KEYS } from '../../src/utils/evaluationDossier'`) rather than hard-coding the seven keys, so a schema-version rename in the future can never drift the source and the spec.
- [ ] Per the 2026-09-12 code-beats-prose lesson, if any of the seven stores enumerated in AC #1 is renamed, removed, or has its getter signature changed between the ticket write date (2026-09-18) and the implementation start, the implementer treats this ticket's list as placeholder groomer prose and pins the schema to the ACTUAL exported types on the branch head. The deviation is documented in the Implementation log with the file:line of the real source.
- [ ] Per the 2026-05-07 em-dash Hard NO, every string in `evaluationDossier.ts` AND every string in the new button label AND every string in the new spec is hyphen-only. Self-Review greps the diff for `String.fromCharCode(8212)` before pushing. The JSON file content is derived entirely from the seven persisted stores' data, which may contain em-dashes only if the visitor themselves entered one (e.g. inside a saved-estimate note field); the export MUST NOT insert em-dashes into any wrapper field it authors (`schemaVersion`, `generatedAt`, any label string).
- [ ] The button ships full dark-mode support: every Tailwind color class carries its `dark:` variant, mirroring the sibling ticket 0066 print button. A viewport-width check on 375px, 768px, and 1280px shows the download button stacking below the print button on mobile and rendering inline on tablet and desktop (matching the ticket 0066 recap-section button-row pattern).
- [ ] A new e2e spec at `tests/e2e/dashboard-dossier-export.spec.ts` (modeled on `tests/e2e/summary-recap.spec.ts` from ticket 0066) asserts, using a `gotoDashboard(page)` helper that seeds every persisted store via `page.addInitScript` before navigation (per the ticket 0066 spec's seed pattern) and waits for RouteFallback detach per the 2026-09-05 lesson and the H1 mount signal per the 2026-09-10 lesson: (1) `GET /my` returns 200, (2) the "Download JSON" button renders with `data-testid="dashboard-dossier-download"` inside the ticket 0066 recap section, (3) the download-button click intercepts the download via Playwright's `page.waitForEvent('download')` and the resolved `Download` object's `suggestedFilename()` matches `/^digital-craft-evaluation-\d{4}-\d{2}-\d{2}\.json$/`, (4) reading the download's saved file and parsing as JSON succeeds with no exception, (5) the parsed object satisfies the shape assertion in AC #4 (schemaVersion, generatedAt regex, seven artifact keys derived from `DOSSIER_ARTIFACT_KEYS`), (6) every artifact-array field is an Array even when the seeded state is empty (an empty visitor exports an empty-but-well-formed dossier), (7) with the seven stores seeded to sample fixture data the parsed JSON echoes the same values verbatim (the seeded estimate total appears in `parsed.artifacts.estimate`, the seeded ROI dollar figure in `parsed.artifacts.roi`, and so on), (8) the download click fires `trackCTAClick('dashboard_dossier_download', 'my_dashboard_recap')` exactly once (stubbed via `page.evaluate` after page load per the ticket 0077 beacon-stub pattern), (9) per the 2026-05-07 em-dash Hard NO the parsed JSON's wrapper string fields (`schemaVersion`, `generatedAt`, any keys added by the composer) contain zero `String.fromCharCode(8212)` code points (visitor-entered content is out of scope for this check because the visitor themselves may have typed one), (10) the button and its surrounding recap section render cleanly in both light and dark mode (the `html.dark` class toggle pattern from ticket 0066's spec), (11) per the 2026-09-10 raw-vs-sliced lesson, seeding `dca_recent_compares_v1` with 8 entries (above the 5-entry display slice) results in `parsed.artifacts.recentCompares.length === 8` (the export reads the raw list, not the sliced view).
- [ ] Standard box: no `/api/` change (the dossier is composed entirely client-side from localStorage), no new hostname (the download is a same-origin Blob URL), no new npm dependency (no jsPDF, no FileSaver.js; the Blob + URL.createObjectURL + click-anchor pattern is native), no edits to `package.json` / `package-lock.json`, no edits to any of the seven existing store modules (their public getters are consumed verbatim). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the ticket 0066 `tests/e2e/summary-recap.spec.ts` stays green (the print-button assertions are unaffected because the new download button is a sibling element, not a replacement).

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- No `/api/` changes, no `package.json`
  changes, no em-dashes in copy, dark-mode
  required (this ticket ships one new
  dossier util plus one new button plus one
  new spec, all reading from already-shipped
  persistent stores).
- A server-side dossier storage or "email
  me my dossier" flow. The dossier is a
  client-side artifact that leaves the
  browser only when the visitor themselves
  downloads it. A server-mailed export
  would require /api/ (out of scope per
  the AGENTS.md Hard NO) and would
  contradict the trust story.
- An "Import a dossier" or "restore state
  from JSON" flow. Import surfaces have
  their own validation, error, and abuse-
  vector concerns; import is a distinct
  follow-up ticket once export ships.
- A PDF version of the dossier. The
  ticket 0066 printable recap covers the
  human-eye print use case; a distinct
  binary format like PDF adds no
  portability over JSON for the
  procurement-thread audience this ticket
  targets.
- A signed or notarized dossier (a
  cryptographic hash or signature field
  in the JSON). Cryptographic signing
  requires a server-side key and is a
  distinct trust ticket; the dated
  `generatedAt` field is sufficient for
  the current audience.
- Adding a "share your dossier" tokenless
  deep-link surface that encodes the
  dossier in a URL. URL-encoded dossiers
  bloat the URL past most browser limits
  once the visitor has three or more
  quiz history entries; a JSON download
  is the correct surface for a full
  dossier. Per-artifact share links are
  already shipped (ticket 0009
  shareable-estimate, ticket 0029 voice
  summary, ticket 0046 ROI, ticket 0052
  quiz tier).
- Adding new persisted stores or new
  fields to any of the seven existing
  stores. The dossier composes what
  is ALREADY persisted; extending the
  persistence surface is its own
  distinct ticket.
- Adding a "clear my data" or "wipe
  all persisted state" button. Data
  wipe is a distinct trust ticket
  (parallel to the dossier export
  but with different UX concerns).
- Adding `application/ld+json` schema
  emission of the dossier (a
  `DataDownload` or `Dataset` JSON-LD
  block). The dossier is a
  visitor-private artifact, not a
  crawler-indexable page; schema
  emission is inappropriate.
- Editing `src/pages/construction/lastEstimateStore.ts`
  or any of the six other store
  modules. The composer imports
  their public getters; no store
  edit is required.
- Adding the dossier download to any
  page other than `/my`. The
  dashboard is the canonical
  visitor-state surface; per-page
  download buttons would fragment
  the artifact.
- A "schedule a follow-up review of my
  dossier" calendar-invite flow. The
  dossier is a static point-in-time
  export; recurring exports are
  their own distinct ticket.
- Adding the download button to the
  ticket 0066 print-preview HTML
  (the print stylesheet suppresses
  interactive elements per ticket
  0066 design). The button lives
  in the screen-only variant of
  the recap section.
- Cross-linking `/my` from
  `/subprocessors`, `/uptime`,
  `/ethics`, or `/security` as a
  data-portability control demo.
  Cross-surface promotion is its
  own follow-up ticket once GA
  telemetry shows dossier-export
  volume.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/utils/evaluationDossier.ts`
  (under 200 lines). Export
  `DOSSIER_SCHEMA_VERSION`,
  `DOSSIER_ARTIFACT_KEYS`, the
  `EvaluationDossier` interface, and the
  `buildEvaluationDossier` composer.
  Import each store getter from its
  existing module; do NOT reach into
  localStorage directly (mirror-source
  rule per the 2026-05-25 lesson: each
  store owns its allow-list and
  validation, so consuming the getter
  keeps the dossier honest to whatever
  the store considers a valid entry).
- Per the 2026-09-12 code-beats-prose
  lesson, BEFORE writing code grep
  every `src/utils/*Store.ts` file and
  `src/pages/construction/lastEstimateStore.ts`
  and pin the `EvaluationDossier.artifacts`
  sub-type list to the ACTUAL exported
  types and getter return shapes on
  main. If any store enumerated in
  AC #1 has been renamed, removed, or
  has its getter signature changed
  between 2026-09-18 (this ticket's
  write date) and the implementation
  start, note the deviation in the
  Implementation log with the file:line
  of the real source.
- Per the 2026-09-10 raw-vs-sliced
  lesson, if a store caps its display
  list (as `recentComparesStore` does
  with `MAX_ENTRIES = 5`), the composer
  reads the RAW pre-slice list via the
  store's `readAllVisited` helper (or
  an equivalent introduced in the
  store module if none exists today).
  Extending the store's public surface
  to add a raw-list helper is
  IN-SCOPE for this ticket ONLY when
  the store lacks one; the change is
  additive and does not modify the
  existing display getter.
- `src/pages/MyDashboard.tsx` - add
  ONE new button next to the ticket
  0066 print button inside the
  `data-testid="dashboard-summary-recap"`
  section. Mirror the print button's
  variant, size, and dark-mode classes.
  Wire the click handler to a small
  private helper that (a) calls
  `buildEvaluationDossier()`, (b)
  serializes to JSON with two-space
  indent, (c) creates a Blob with
  type `application/json`, (d)
  creates an object URL, (e) triggers
  a click on a hidden anchor with
  the `download` attribute set, (f)
  revokes the object URL in a 100ms
  timeout. Fire the
  `trackCTAClick('dashboard_dossier_download', 'my_dashboard_recap')`
  beacon BEFORE the Blob is created
  per the ticket 0023 beacon-before-
  navigate pattern.
- Per the 2026-05-30 second-@type
  lesson, this ticket emits NO new
  JSON-LD blocks (the dossier is a
  visitor-private surface not
  crawler-indexable). No pre-code
  grep for structured-data collisions
  is required.
- Per the 2026-09-05 route-fallback
  and 2026-09-10 mount-signal
  lessons, the new spec's
  `gotoDashboard` helper waits for
  RouteFallback detach AND the H1
  to be visible before reading page
  state or attempting a
  download-click intercept. Both
  waits use `.catch(() => {})` where
  safe.
- Per the ticket 0066 spec seed
  pattern, the new spec seeds every
  persisted store via
  `page.addInitScript` (setting the
  localStorage keys BEFORE navigation)
  so the dossier composer reads a
  known-good input at test time.
  Fixture data uses defensible,
  hyphen-only strings and small
  integer/float values (no fake
  client names, no invented dollar
  amounts above a defensible
  ballpark, no invented
  percentages).
- Per the 2026-05-07 em-dash Hard
  NO, every string this ticket
  writes is hyphen-only. The JSON
  file's content may echo a visitor-
  entered em-dash only if the
  visitor typed one into a saved-
  estimate note; the composer MUST
  NOT insert one into any wrapper
  field it authors.
- Per the 2026-05-22 two-PR ship
  lesson, ship will need a follow-up
  `chore/0082-ship-status` PR after
  the feat PR merges to flip the
  ticket frontmatter AND its
  `docs/backlog/README.md` index row
  to `shipped` together; run
  `node scripts/check-backlog.mjs`
  before pushing the second PR so
  the file and index never drift
  mid-flip.
- New deps: NO. The Blob API,
  URL.createObjectURL, and hidden-
  anchor click are all native browser
  APIs; no `jsPDF`, no `FileSaver.js`,
  no `blob-util` needed. Schema
  migration: no (the schema is a
  brand new client-side artifact,
  not a mutation of an existing
  store). Privacy / security surface
  change: NO - the dossier is
  composed and downloaded entirely
  client-side; no new hostname, no
  new network call, no new server
  handler. The dossier's `generatedAt`
  ISO timestamp is a locally-computed
  clock value, not a server-derived
  id.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0082-...` opened
- YYYY-MM-DD - failing test added in `tests/e2e/dashboard-dossier-export.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
