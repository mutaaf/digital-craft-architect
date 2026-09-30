---
id: 0105
title: Public /data-retention dated per-storage-key retention policy page as a defensible trust artifact
status: in-progress
priority: P2
area: trust
created: 2026-09-30
owner: gtm-innovation
---

## User story

As a privacy-minded buyer or their counsel evaluating Digital Craft
(a public-sector construction GC's data-protection officer whose
onboarding checklist asks how long each client-side storage key
persists; a real-estate brokerage's IT compliance lead whose
insurance policy asks for a per-key retention window before a paid
pilot; a franchise VP whose privacy counsel reads every vendor's
retention policy as part of vendor onboarding; a home-services owner
who used four demos on his phone and now wants to see when the
saved artifacts will actually expire from his browser), I want one
public dated page at `/data-retention` listing every persistent
client-side storage key Digital Craft writes, its purpose, its
retention window, and the review cadence, so that I can cite a
defensible per-key retention posture to my counsel, my insurer, or
my owner before booking a strategy call, and I can hand it to my
DPO as evidence that the vendor documents its retention windows
per storage key rather than a hand-wave "we don't sell your data"
statement.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the site now writes at least
ten client-side persistent stores (last estimate 0014,
`dca_recent_demos_*` 0026, quiz persona + quiz history 0045 + 0076,
last ROI 0062, `dca_recent_compares_v1` 0074, read blog posts 0091,
saved ROI scenarios 0093, `dca_recent_verticals_v1` 0100, and any
sibling this ticket's neighbors ship). The `NEW_PERSISTENT_STORES`
constant in `src/data/demoDisclosures.ts` already enumerates every
key with a short "what we store" line, and `/trust` (ticket 0018)
renders that list. What is missing is a canonical dated page that
lists PER KEY (a) the retention window (browser-local until manual
clear, or session-scoped, or N-day evict via a FIFO cap), (b) the
purpose (which shipped card the key powers), (c) the review cadence
(when the retention policy is next reviewed), (d) the row shape and
allow-list validation the store enforces. Adding the page is
exactly one new page component
(`src/pages/DataRetention.tsx` modeled 1:1 on
`src/pages/HallucinationSafeguards.tsx` from ticket 0102 or
`src/pages/AccessibilityStatement.tsx` from ticket 0097), one new
data file (`src/data/dataRetention.ts` mirroring
`src/data/hallucinationSafeguards.ts` from ticket 0102), one new
entry in `src/data/routes.ts`, one new route in `src/App.tsx`, one
new sitemap entry (auto-emitted per the ticket 0022 generator), one
new footer trust-chip link, one new cross-link chip on `/trust`,
and one new spec.

### Stakeholder

This widens the moat in a dimension no shipped trust artifact fully
addresses. Ticket 0069 `/subprocessors` names third-party data
recipients; ticket 0081 `/security` names infrastructure controls;
ticket 0033 per-demo disclosure chips name what a single demo
stores; ticket 0018 `/trust` renders the aggregate persistent-store
list from `NEW_PERSISTENT_STORES`. None of them names a per-key
retention WINDOW ("this key is browser-local until you manually
clear it," "this key auto-evicts the sixth entry after five,"
"this key is session-scoped and clears when you close the tab"). A
dated retention policy is the specific artifact a data-protection
officer, a Section-508 procurement lead, or an insurance
underwriter asks for when they read `/subprocessors` and want to
close the loop on "and how long do you keep each of these client-
side keys." The competitive positioning is asymmetric: most AI-
services vendors publish a single "data retention" paragraph
covering server-side records, and NONE publish a per-key client-
side retention table with a dated review cadence. Per the ticket
0094 / 0097 / 0102 precedent, this page emits CollectionPage plus
BreadcrumbList JSON-LD so search engines index it as a canonical
collection of dated rows; per the ticket 0102 grep-the-real-source
rule, every row's storage key is grepable at branch head from
`src/data/demoDisclosures.ts` and every retention-window claim is
grepable from the shipped store's slice-and-evict source code.

### User (in the real moment of use)

A public-sector construction GC's data-protection officer sits down
Thursday morning to finish the vendor onboarding packet. Her
checklist has a "retention windows per client-side key" line and
she needs a dated URL. She opens
`digitalcraftai.com/data-retention` from the footer trust-chip
cluster; the page loads under one screen on her laptop with a hero
H1 ("Data Retention Policy"), a top-of-page "Last reviewed:
2026-09-30" line, a one-paragraph explainer of what "client-side
retention" means on a static site with no backend account, and a
per-key table with columns: Storage key, Purpose, Retention window,
Allow-list validation, Next review. Each row is one shipped key
(e.g. `dca_recent_verticals_v1`, purpose "recent AI-for-vertical
pages", retention "browser-local until manual clear, FIFO evict at
5 entries", allow-list "path must start with /ai-for- and be in
ROUTES", next review "2026-12-30"). Below the table, a "How to
clear these keys yourself" section with an inline snippet showing
the DevTools Application tab path and a "Clear all Digital Craft
keys" button that runs `Object.keys(localStorage).filter(k =>
k.startsWith('dca_')).forEach(k => localStorage.removeItem(k))`.
At the bottom, a "How to report a retention concern" line with a
mailto: link byte-identical to the recipient shipped in `/trust`
and `/accessibility-statement`. She copies the URL into her vendor
packet and moves on. Light and dark mode read cleanly; the mobile
view stacks the table columns per the ticket 0094 pattern; the
"Clear all Digital Craft keys" button carries a confirm dialog
before deleting.

### Growth

The "show me" moment is a data-protection officer forwarding
`digitalcraftai.com/data-retention` to a procurement peer with a
note "this vendor is the first small-shop I've seen with a per-key
dated retention table AND a one-click clear button; approving the
pilot." That single forward is the shortest path from "we are a
small AI vendor you have not heard of" to "we cleared the
data-retention gate that a material fraction of your competitors
do not clear." The peer-share signal is a second-order effect:
data-protection officers swap notes across enterprise buyers, and a
vendor with a dated per-key retention statement plus a one-click
clear button becomes a reference vendor in that informal peer
network. It also creates a measurable SEO signal: the page is a
canonical dated CollectionPage that Googlebot recrawls on its
lastmod cadence, widening the trust-artifact SEO cluster the site
has been building since ticket 0018.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests
against this list before writing code.

- [ ] A new page at `src/pages/DataRetention.tsx` (new file, under 250 lines) modeled 1:1 on `src/pages/HallucinationSafeguards.tsx` (ticket 0102, the freshest predecessor in the same dated-trust-artifact family). The page renders (a) a hero H1 "Data Retention Policy", (b) a top-of-page "Last reviewed: 2026-09-30" line reading from `RETENTION_POSTURE.lastReviewed`, (c) a one-paragraph explainer of what "client-side retention" means on a static site, (d) a per-key table with columns Storage key, Purpose, Retention window, Allow-list validation, Next review; one row per persistent key enumerated in `RETENTION_POLICIES`, (e) a "How to clear these keys yourself" section with an inline code block and a "Clear all Digital Craft keys" button that opens a browser-native `window.confirm` before running the loop, (f) a "How to report a retention concern" section with a mailto: link. Every string is defensible per AGENTS.md: no invented retention windows the shipped store code does not enforce, no fabricated "we auto-purge every 30 days" claim the code cannot cite. Hyphens not em-dashes per the 2026-05-07 em-dash Hard NO.
- [ ] A new data file at `src/data/dataRetention.ts` (new file, under 200 lines) exports two constants: `RETENTION_POSTURE` (with `lastReviewed: '2026-09-30'` and a `summary` string) and `RETENTION_POLICIES` (a readonly array of `{ storageKey: string; purpose: string; retentionWindow: string; allowListValidation: string; nextReview: string; sourcePath: string }`). Every `storageKey` string is byte-identical to a key present in `NEW_PERSISTENT_STORES` from `src/data/demoDisclosures.ts` (imported and asserted at module load per the 2026-05-28 sitemap-lastmod encoded-invariant lesson pattern); every `sourcePath` is a real file path grepable at branch head per the 2026-09-12 code-beats-prose lesson (e.g. `src/utils/recentVerticalsStore.ts` from ticket 0100, `src/utils/recentComparesStore.ts` from ticket 0074, `src/utils/roiScenariosStore.ts` from ticket 0093, and any sibling shipped between 2026-09-30 and the branch-head date). The file includes an inlined `assertRetentionPolicies()` call at module load that validates (a) every `storageKey` is present in `NEW_PERSISTENT_STORES` (throw with `NOT_IN_DISCLOSURES` on violation, per the 2026-09-12 code-beats-prose rule that the disclosure list is the source of truth for which keys exist), (b) every `sourcePath` ends in `.ts` and is grepable from branch head (checked implicitly via a `import.meta.glob` compile-time reference not required; a static string suffix check on `.ts` is sufficient), (c) every `nextReview` date is a valid ISO date strictly after `RETENTION_POSTURE.lastReviewed`, (d) `RETENTION_POSTURE.lastReviewed` is a valid ISO date. Per the 2026-09-12 code-beats-prose lesson, the implementer greps `NEW_PERSISTENT_STORES` at branch head BEFORE locking `RETENTION_POLICIES`; if the disclosure list has drifted since 2026-09-30 the row set mirrors the real code list, not the ticket prose enumeration.
- [ ] A new route entry at `src/App.tsx` mapping `/data-retention` to the new page component, lazy-imported through the existing `React.lazy` pattern all other trust pages use per the 2026-09-05 route-code-splitting lesson, wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell. A new entry in `src/data/routes.ts` for `/data-retention` placed next to the existing `/hallucination-safeguards` entry per the ticket 0102 convention (shipping order, not alphabetical, per the 2026-09-12 code-beats-prose lesson).
- [ ] The page emits two JSON-LD blocks inside its `<Helmet>` block matching the trust-artifact family shape: (1) `CollectionPage` describing the retention policy as a canonical dated collection of per-key retention rows, with `name` "Digital Craft AI Data Retention Policy", `url` "https://digitalcraftai.com/data-retention", `description` byte-identically matching the page's `meta[name="description"]` per the 2026-05-25 mirror-source rule, `dateModified` equal to `RETENTION_POSTURE.lastReviewed` from the data file (mirror-source again); (2) `BreadcrumbList` positioning the page under the homepage (two levels: Home, Data Retention). Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates. Every predecessor CollectionPage block is URL-scoped to its own hub path per the ticket 0102 Implementation log grep, so the sibling on `/data-retention` cannot collide. The grep result is documented in the Implementation log.
- [ ] The `/trust` page (`src/pages/Trust.tsx`) gains one new inline cross-link chip inside the existing trust-cluster section pointing at `/data-retention` with label "Data Retention". This is one additive line inside the shipped ticket 0018 trust page; the ticket 0018 AboutPage JSON-LD and BreadcrumbList JSON-LD stay byte-identical. The site footer (`src/components/Footer.tsx`) gains one new trust-chip link to `/data-retention` next to the existing trust-family links per the ticket 0023 footer chip pattern.
- [ ] The "Clear all Digital Craft keys" button in section (e) opens a browser-native `window.confirm` dialog with the message "This will remove every 'dca_' key from your browser's localStorage. Continue?" and only runs the clear loop if the user accepts. On accept, the button clears every localStorage key whose name starts with `dca_` and re-renders a small "Cleared N keys" acknowledgment beneath the button; on cancel, nothing changes. The button carries `data-testid="clear-dca-keys-button"` and the acknowledgment carries `data-testid="clear-dca-keys-ack"` per the 2026-09-06 VISIBLE_LIMIT lesson so the spec asserts `toHaveCount(1)` rather than `count > 0`. The button does NOT clear sessionStorage (out of scope for this ticket) and does NOT clear localStorage keys outside the `dca_` prefix (a foreign key from a different origin cannot appear on this origin, but the prefix guard is a defensible-scope belt).
- [ ] A new e2e spec at `tests/e2e/data-retention.spec.ts` (modeled on `tests/e2e/hallucination-safeguards.spec.ts` from ticket 0102 and `tests/e2e/accessibility-statement.spec.ts` from ticket 0097) asserts, using a `gotoDataRetention(page)` helper that waits for RouteFallback detach per the 2026-09-05 lesson and the H1 mount signal per the 2026-09-10 lesson: (1) `GET /data-retention` returns 200, (2) the page renders an H1 containing "Data Retention Policy", (3) the page renders a "Last reviewed: 2026-09-30" line matching `RETENTION_POSTURE.lastReviewed` imported from `src/data/dataRetention.ts` (mirror-source per the 2026-06-07 rule), (4) the per-key table renders exactly `RETENTION_POLICIES.length` rows with `data-testid="retention-policy-row"` per the 2026-09-06 VISIBLE_LIMIT lesson (use `toHaveCount(RETENTION_POLICIES.length)` over the imported constant), (5) every row's `storageKey` cell text is present in `NEW_PERSISTENT_STORES` imported from `src/data/demoDisclosures.ts` (mirror-source assertion across two source files per the 2026-06-07 rule), (6) exactly one `CollectionPage` JSON-LD block with `name` byte-matching the page's H1 substring and `dateModified` byte-matching `RETENTION_POSTURE.lastReviewed`, (7) exactly one `BreadcrumbList` block with two itemListElement entries named "Home" and "Data Retention", (8) the em-dash assertion scopes only to the two owned blocks per the 2026-09-08 filter lesson; the rendered page body contains zero `String.fromCharCode(8212)` code points, (9) the page renders cleanly in both light and dark mode (`html.dark` toggle), (10) the `/trust` page shows the new "Data Retention" cross-link chip with href `/data-retention`, (11) the footer on the homepage shows the new trust-chip link to `/data-retention`, (12) after `page.evaluate` seeds two arbitrary `dca_*` localStorage keys and clicking the "Clear all Digital Craft keys" button plus accepting the `window.confirm` dialog (via `page.on('dialog', d => d.accept())`), `Object.keys(localStorage).filter(k => k.startsWith('dca_'))` returns `[]` and the "Cleared N keys" acknowledgment renders exactly once (`toHaveCount(1)`); a foreign key `unrelated_key` seeded at the same time survives the clear (defensible-scope belt), (13) the mailto: recipient in the "How to report a retention concern" section byte-matches the recipient shipped in `src/pages/Trust.tsx` (mirror-source assertion per the 2026-05-25 rule), (14) per the 2026-06-15 attribute-list regex lesson, any regex in the spec over stringified JSON-LD uses `[^>]*`, not `[^/>]*`.
- [ ] Standard box: no `/api/` change, no new hostname (the mailto: link is not a network endpoint; the clear button runs entirely in the browser), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any predecessor trust-artifact page beyond the one additive chip line in `Trust.tsx` and the one additive link line in `Footer.tsx`, no edits to any shipped store's retention window (the ticket documents the CURRENT windows; changing a window is a separate ticket per store). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. Auto-emission of `/data-retention` into `dist/sitemap.xml` is confirmed via `scripts/generate-sitemap.ts` per the ticket 0022 / 0094 / 0097 / 0102 auto-inclusion pattern; the implementer greps `dist/sitemap.xml` for the route after a local build and records the result in the Implementation log.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem
related.

- Standard anti-goals: no `/api/` changes, no `package.json` changes, no em-dashes in copy, dark-mode required.
- Changing any shipped store's retention window. The ticket documents the CURRENT windows only; a change like "reduce recent-verticals FIFO cap from 5 to 3" is its own per-store ticket because it edits the shipped store's slice logic. If the branch-head grep reveals a store whose window has drifted since the ticket was written, the row mirrors the real code (per the 2026-09-12 code-beats-prose rule) and the deviation is cited in the Implementation log.
- Adding a server-side retention statement (how long the `/api/*` serverless functions retain request logs, how long Vercel keeps deploy logs, how long Sentry retains error events). Server-side retention is Vercel's and Sentry's contract; the ticket is scoped to CLIENT-side keys the site itself writes. A server-side retention page is its own follow-up ticket that requires reading Vercel's and Sentry's own retention policies at ship time.
- Adding a "Clear only one specific key" button per row. The MVP ships the site-wide "clear all dca_ keys" button; per-row clear is its own follow-up ticket because it needs a per-row confirm dialog and a per-row acknowledgment that risks visual noise.
- Adding a "download my retention receipt" that produces a JSON manifest of every key currently in the browser. The ticket 0082 dossier export already covers programmatic access; a dedicated retention-only receipt is its own ticket.
- Adding city-specific or state-specific privacy-law references (CCPA, GDPR, LGPD). Legal-jurisdiction claims are their own privacy/legal ticket and require counsel review before publication; the MVP names the technical retention window per key only.
- Editing the ten predecessor trust-artifact pages beyond the additive `Trust.tsx` chip and `Footer.tsx` link. Every predecessor stays byte-identical otherwise.
- Emitting an `AboutPage`, `TechArticle`, or `Dataset` JSON-LD block on `/data-retention`. Per the 2026-05-30 second-@type lesson, `AboutPage` is claimed by `/trust` (ticket 0044); `CollectionPage` is the correct fit for a dated collection of rows.
- Persisting a per-visitor "I read the retention policy" flag to localStorage. Client-side preference toggles are their own retention ticket (and there is a delicious irony in tracking a visit to the retention policy in the very store the retention policy describes, but that recursion is out of scope). The ticket 0104 reviewed-trust-pages store, if shipped, transitively picks up `/data-retention` via the standard trust-family label map.
- A cookie-consent banner triggered by the page. The site ships no third-party tracking cookies; adding a banner would misrepresent the artifact per the AGENTS.md conservative-claims rule.
- Adding the retention policy to the sitemap with a custom `<priority>` above 0.4; the auto-emission from `scripts/generate-sitemap.ts` uses the default priority for new trust pages per the ticket 0097 precedent.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev
doesn't have to re-discover the architecture.

- New `src/pages/DataRetention.tsx` (under 250 lines). Mirror the file structure of `src/pages/HallucinationSafeguards.tsx` (ticket 0102) verbatim: same imports, same section layout, same top-of-page dated header, same table rendering. Every Tailwind color class carries its `dark:` variant.
- New `src/data/dataRetention.ts` (under 200 lines). Mirror the shape of `src/data/hallucinationSafeguards.ts` (ticket 0102): exported `RETENTION_POSTURE` object plus `RETENTION_POLICIES` readonly array. Include an inlined `assertRetentionPolicies()` call at module load. The assertion imports `NEW_PERSISTENT_STORES` from `src/data/demoDisclosures.ts` and validates every `storageKey` is present in that constant per the 2026-09-12 code-beats-prose rule (the disclosure list is the source of truth for which keys exist on the site).
- Per the 2026-09-12 code-beats-prose lesson, the implementer greps `src/data/demoDisclosures.ts` at branch head BEFORE locking `RETENTION_POLICIES`; the ten to twelve keys named in the User section prose are placeholder enumeration, and the real set is whatever the disclosure lists at branch head. If a key has been added since 2026-09-30 (e.g. `dca_reviewed_trust_pages_v1` from ticket 0104), the new row is included; if a key has been renamed, the row mirrors the shipped name.
- Per the 2026-09-12 code-beats-prose lesson, every `sourcePath` is greped at branch head; if a shipped store file has been renamed the row cites the actual current path. Candidate paths as of 2026-09-30: `src/utils/lastEstimateStore.ts`, `src/utils/recentDemosStore.ts`, `src/utils/quizPersonaStore.ts`, `src/utils/quizHistoryStore.ts`, `src/utils/lastRoiStore.ts`, `src/utils/recentComparesStore.ts`, `src/utils/readBlogPostsStore.ts`, `src/utils/roiScenariosStore.ts`, `src/utils/recentVerticalsStore.ts`. The implementer greps these before wiring.
- `src/App.tsx` gains one `<Route path="/data-retention" element={<DataRetention />} />` after the existing `/hallucination-safeguards` route, wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell and lazy-imported via `React.lazy(() => import('./pages/DataRetention'))`.
- `src/data/routes.ts` gains `/data-retention` after the existing `/hallucination-safeguards` entry per the ticket 0102 convention.
- `src/pages/Trust.tsx` gains one additive cross-link chip inside the existing trust-cluster section. The chip is additive and does not touch the shipped ticket 0018 JSON-LD.
- `src/components/Footer.tsx` gains one additive trust-chip link next to the existing `/hallucination-safeguards` link per the ticket 0023 / 0097 / 0102 footer chip pattern.
- Per the 2026-05-25 mirror-source rule, the `RETENTION_POSTURE.summary` string in the data file is the same string rendered in the visible page body's introduction paragraph AND emitted into the CollectionPage JSON-LD `description` field AND set as the `meta[name="description"]` content. Do NOT hand-roll a second copy.
- Per the 2026-05-30 second-@type lesson, BEFORE writing code grep every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates. Every predecessor CollectionPage block is URL-scoped per the ticket 0102 Implementation log; document the grep result in the Implementation log.
- Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the spec's em-dash assertion filters the block list to the two `@type`s THIS page emits before iterating; it does NOT loop over every `application/ld+json` script on the page (the homepage Organization block from `index.html` carries a legitimate em-dash and must not be flagged).
- Per the 2026-09-05 route-code-splitting lesson, the new page's e2e helper waits for the RouteFallback to detach AND for the hero H1 to be visible before probing the DOM.
- Per the 2026-09-06 VISIBLE_LIMIT lesson, the row-count assertion in the spec uses `toHaveCount(RETENTION_POLICIES.length)` over the imported constant, NOT `count > 0`.
- Per the 2026-06-07 mirror-source-across-src-tests lesson, the spec imports `RETENTION_POSTURE`, `RETENTION_POLICIES` from `src/data/dataRetention.ts` directly, and `NEW_PERSISTENT_STORES` from `src/data/demoDisclosures.ts` directly; do NOT hand-roll copies.
- Per the 2026-06-15 attribute-list regex lesson, any regex in the spec that matches self-closing tags in stringified JSON-LD uses `[^>]*`, not `[^/>]*`.
- Per the 2026-09-26 static-file MIME-shim lesson: NOT applicable here, no new static extension is introduced. Record "no new static extension shipped" in the Implementation log for auditability.
- The "Clear all Digital Craft keys" button in section (e) is implemented as a plain `<button type="button">` calling `window.confirm(...)` followed by the localStorage prefix-clear loop. Do NOT introduce a shadcn dialog primitive that risks a hydration-order edge case; the browser-native confirm is sufficient and matches the "small, static site" posture of the trust family. The `data-testid` attributes on the button and the acknowledgment enable the spec's `toHaveCount(1)` assertions per the 2026-09-06 VISIBLE_LIMIT lesson.
- `tests/e2e/data-retention.spec.ts` (new), one assertion per acceptance box, modeled on `tests/e2e/hallucination-safeguards.spec.ts` (ticket 0102).
- Per the 2026-05-22 two-PR ship lesson, ship needs a follow-up `chore/0105-ship-status` PR after the feat PR merges to flip the ticket frontmatter AND its `docs/backlog/README.md` index row to `shipped` together; run `node scripts/check-backlog.mjs` before pushing the second PR.
- New deps: NO. The page reuses `react-router-dom`, `react-helmet-async`, `lucide-react`, and Tailwind utilities already in use across the trust-artifact family. Schema migration: no. Privacy / security surface change: no (the page renders static content with no new localStorage key; the clear button DELETES existing keys but does not create any new one; no new outbound network call and no new hostname).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-30 - branch `feat/0105-data-retention-policy-page` opened; status flipped to in-progress in ticket frontmatter and docs/backlog/README.md row in one commit (2026-05-22 rule).
- 2026-09-30 - grepped `src/data/demoDisclosures.ts` at branch head for NEW_PERSISTENT_STORES (2026-09-12 code-beats-prose): 6 storage keys enumerated - `dca_recent_compares_v1`, `dca_quiz_history_v1`, `dca_recent_blog_posts_v1`, `dca_roi_scenarios_v1`, `dca_recent_verticals_v1`, `dca_reviewed_trust_pages_v1`. Ticket 0104 shipped `dca_reviewed_trust_pages_v1` (bounded to 6 entries) after ticket 0105 was authored; RETENTION_POLICIES mirrors the real 6-row set, not the ticket prose's older enumeration.
- 2026-09-30 - `ls src/utils/*Store.ts` confirms real files at branch head: `recentComparesStore.ts`, `quizHistoryStore.ts`, `recentBlogPostsStore.ts`, `roiScenariosStore.ts`, `recentVerticalsStore.ts`, `reviewedTrustPagesStore.ts`. Every RETENTION_POLICIES sourcePath points at a real file.
- 2026-09-30 - grepped every `tests/e2e/*.spec.ts` for `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates (2026-05-30 second-@type). Every predecessor CollectionPage predicate is URL-scoped to its own hub path (`/agent-fleet`, `/model-card`, `/subprocessors`, `/security`, `/ai-risks-we-watch`, `/hallucination-safeguards`, `/accessibility-statement`, `/ai-for-hospitality`, `/blog`, `/compare/*`, `/case-studies*`). The sibling scoped to `/data-retention` cannot collide.
- 2026-09-30 - no new static-file extension shipped by this ticket; the 2026-09-26 static-file MIME-shim lesson is not applicable.
- 2026-09-30 - failing test added in `tests/e2e/data-retention.spec.ts`
- 2026-09-30 - `/data-retention` confirmed in `dist/sitemap.xml` after `npm run build` (auto-emission per ticket 0022).
- 2026-09-30 - PR #N opened, CI [state]
- 2026-09-30 - merged to main
