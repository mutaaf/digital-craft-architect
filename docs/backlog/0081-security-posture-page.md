---
id: 0081
title: Public /security page listing dated infrastructure and application security controls as a defensible buyer-side trust artifact
status: shipped
priority: P1
area: trust
created: 2026-09-15
owner: gtm-innovation
---

## User story

As a regulated-vertical buyer's IT-security reviewer (a
property-management firm's IT director running a vendor
questionnaire before an AI-receptionist pilot, a
construction general contractor's compliance officer
vetting AI vendors under a bonded-project security
addendum, an insurance-adjacent restoration company's
data-privacy lead checking whether a voice AI vendor
handles claim-related audio safely, a hospitality
group's DPO reviewing an AI booking vendor under the
group's third-party risk process), and as a buyer's own
in-house engineer skimming vendor security posture
before their first strategy call, I want one canonical
page at `/security` that lists Digital Craft's dated
infrastructure and application security controls
(transport encryption in flight, secret storage,
serverless isolation, client-side data boundaries,
third-party AI vendor scope, incident response posture,
what is and is not stored server-side) with a "last
reviewed" date on each row, so that I can forward one
URL to my legal or compliance team and skip the vendor
questionnaire's first three tabs entirely.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the site already
ships four adjacent trust surfaces
(`/trust` ticket 0018 on data handling, `/uptime` ticket
0036 on demo and serverless health, `/subprocessors`
ticket 0069 on third-party AI vendor list, `/ethics`
ticket 0077 on what we won't do), but there is no
canonical URL that answers the single question a buyer's
IT-security reviewer asks first: "how does this vendor
handle the security controls my questionnaire enumerates."
Today that answer is scattered across the four surfaces
(TLS is implied by `/trust`, vendor scope is on
`/subprocessors`, incident-response cadence is on
`/uptime`), forcing a reviewer to piece together a
security posture from four documents instead of reading
one. This ticket adds exactly one new page (`/security`)
that reads from a new typed constant
(`src/data/securityControls.ts`) enumerating each
control category with (a) a name, (b) a plain-language
description of the current control, (c) a "status"
tag (in-place / in-progress / aspirational), (d) a
"last reviewed" date, (e) an optional cross-link to a
sibling trust surface. Zero new backend, zero new
dependency, zero new /api/ route (the page ships as a
static React route rendering from a static TypeScript
constant). One new page, one new data file, one new
route entry, one new sitemap row, one new spec, one
new footer chip linking to `/security` (mirroring the
ticket 0023 "AI providers" chip pattern).

### Stakeholder

This widens the trust moat in the security-posture
dimension along an axis none of the four existing trust
surfaces cover. Per the ticket 0069 stakeholder lens
verbatim, regulated-vertical buyers (property management,
insurance-adjacent restoration, healthcare-adjacent
dental, financial-adjacent legal, hospitality-with-PCI)
run a vendor questionnaire before a pilot; today the
Digital Craft answer to those questionnaires is
"here are four separate URLs, please cross-reference,"
and that reads as unpolished next to a competing
vendor's one-page security artifact. Per the ticket
0077 precedent (a public `/ethics` page enumerating
dated hard-NO stances), a dated, defensible, structured
list of security controls is a first-class defensible
trust artifact even when the controls are aspirational
in some rows (SOC 2 not yet in progress, penetration
testing not yet scheduled) - the very act of naming a
control and dating it as "aspirational" is more
credible than silence. The 2026-05-25 mirror-source
rule applies: any control this page describes that is
ALSO enumerated on a sibling surface (`/subprocessors`,
`/uptime`, `/trust`) must cross-link, not paraphrase,
so drift between the pages is impossible by
construction. Per the 2026-05-30 second-@type lesson,
the page emits `CollectionPage` plus `BreadcrumbList`
JSON-LD (parallel to `/subprocessors` from ticket
0069) and the pre-code grep confirms every predecessor
CollectionPage assertion is URL-scoped so a sibling
instance on `/security` cannot collide.

### User (in the real moment of use)

A property-management firm's IT director opens a vendor
questionnaire during a Monday-morning security review
block. The first three tabs are the standard checklist:
"data in transit," "data at rest," "third-party vendor
list," "incident response cadence," "access control,"
"data retention." He Googles "digital craft security"
from his laptop, lands on `/security` in one tap, and
scans the eight-row table: each row names a control
category ("TLS in transit," "Secrets storage," "Vendor
data recipients," "Session-only client storage,"
"Incident response cadence," "Access control on
production deploys," "Data retention on client-side
artifacts," "Third-party penetration testing"), a
one-sentence current-state description, a status tag
(in-place / in-progress / aspirational), a "last
reviewed 2026-09-15" date, and a cross-link chip where
relevant ("See also: /subprocessors," "See also:
/uptime," "See also: /trust"). He copies the `/security`
URL into the questionnaire response for the three
"where is your security documentation" fields, sends
it back to legal, and books the strategy call. Two
weeks later a portfolio-company DPO does the same walk
in six seconds. Light and dark mode; the table reads
cleanly on a 375px viewport as a stacked card list.

### Growth

The "show me" moment is the URL a security reviewer
pastes into a vendor questionnaire response: one link,
eight dated rows, three cross-links to the sibling
trust surfaces. That is the single cheapest B2B
enterprise-buyer trust-signal the site can produce
because the audience it unblocks (IT-security
reviewers, DPOs, compliance officers) is the audience
that most gates AI-vendor pilots in regulated
verticals. Per the ticket 0077 growth lens verbatim,
a dated public security posture is a screenshot a
DPO can attach to a legal thread ("this vendor is
above the line, look at the last-reviewed date") that
no unverified vendor claim can substitute for. The
new footer chip on every page ("Security posture")
fires `trackCTAClick('footer_security_chip', <current-route>)`
on click so security-review click-through is
measurable in GA independently of the
`/subprocessors` and `/trust` chip telemetry.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new typed data file at `src/data/securityControls.ts` exports a `securityControls: readonly SecurityControl[]` constant enumerating at least eight rows, each shape `{ id: string, name: string, description: string, status: 'in-place' | 'in-progress' | 'aspirational', lastReviewed: string /* ISO YYYY-MM-DD */, seeAlso?: { label: string, href: string } }`. The eight minimum rows: (1) TLS in transit (in-place, cross-link `/trust`), (2) Secrets storage (in-place, description names Vercel environment variables), (3) Vendor data recipients (in-place, cross-link `/subprocessors`), (4) Session-only client storage (in-place, cross-link `/trust`), (5) Incident response cadence (in-place, cross-link `/uptime`), (6) Access control on production deploys (in-place), (7) Data retention on client-side artifacts (in-place, cross-link `/trust`), (8) Third-party penetration testing (aspirational). Every string is defensible per AGENTS.md: no invented certifications, no invented client names, no invented percentages. All `lastReviewed` dates are `'2026-09-15'` on initial ship.
- [ ] A new page at `src/pages/Security.tsx` (new file, under 200 lines) renders: (a) a hero H1 "Security Posture" with a supporting one-paragraph intro naming what the page is (a dated list of the controls Digital Craft has in place today, in progress, and aspirational), (b) a stacked list of eight rows (one card per `SecurityControl`), each rendering the name as an H3, the description below, a status chip color-coded per status value, a "Last reviewed: <date>" line in muted text, and the optional "See also: <label>" cross-link chip, (c) a "How this page is maintained" note at the bottom explaining the review cadence (every ship touching the /api/ layer or /subprocessors triggers a `/security` review, cadence quarterly minimum), (d) a strategy-call CTA at the bottom mirroring the trust-surface family pattern.
- [ ] A new route entry at `src/App.tsx` mapping `/security` to the new page component, imported through the existing `React.lazy` pattern all other trust-family pages use per the 2026-09-05 route-code-splitting lesson. Wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell.
- [ ] A new entry in `src/data/routes.ts` exactly `'/security'`, placed in the file's existing ordering convention alongside the other top-level trust routes (`/trust`, `/uptime`, `/subprocessors`, `/ethics`). Per the 2026-06-07 mirror-source-across-src-tests lesson, `tests/e2e/routes.ts` re-exports ROUTES verbatim and requires no separate edit.
- [ ] The sitemap generator at `scripts/generate-sitemap.ts` picks up the new route from `src/data/routes.ts` and emits `<url><loc>https://digitalcraftai.com/security</loc><lastmod>2026-09-15</lastmod><priority>0.7</priority></url>` on the next `npm run build`. The implementer confirms auto-inclusion by grepping the built `dist/sitemap.xml` for the new URL after a local build.
- [ ] The page emits two JSON-LD blocks inside its `<Helmet>` block: (1) `CollectionPage` describing `/security` with a description string that also serves as the `<meta name="description">` value via a shared module-top constant per the 2026-05-25 mirror-source rule, and (2) `BreadcrumbList` positioning `/security` under the homepage (two levels: Home, Security). The `CollectionPage.hasPart` array enumerates each `SecurityControl` as a nested `{ '@type': 'CreativeWork', name: control.name, description: control.description, dateModified: control.lastReviewed }` element, so a schema graph walker sees the same eight rows the visible list shows.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates and any "exactly one" / `toHaveLength(1)` assertions over those `@type`s. Every predecessor CollectionPage assertion (0048 /compare, 0057 /case-studies, 0069 /subprocessors, 0071 /ai-for-hospitality, plus 0079 /blog if merged before this ticket) is URL-scoped to its own path so the sibling instance on `/security` cannot collide. The grep result is documented in the Implementation log.
- [ ] A new footer chip in `src/components/Footer.tsx` reading "Security posture" (or similar under 20 characters) linking to `/security`, styled to match the ticket 0023 "AI providers" chip and the ticket 0069 "Data recipients" chip pattern. The chip fires `trackCTAClick('footer_security_chip', <current-route>)` on click before navigating. The chip is added in the trust-surface chip row next to the existing chips, alphabetically ordered.
- [ ] Per the 2026-05-07 em-dash Hard NO, every string in `securityControls.ts` AND every string in `Security.tsx` AND every string in the new footer chip AND every string in the new spec is hyphen-only. Self-Review greps the diff for `String.fromCharCode(8212)` before pushing. No fake certifications ("SOC 2 certified" when there is no active audit), no invented compliance frameworks, no invented insurance coverage claims. Aspirational rows are explicitly labeled aspirational.
- [ ] The page ships full dark-mode support: every Tailwind color class carries its `dark:` variant, mirroring the ticket 0069 `Subprocessors.tsx` structure. A viewport-width check on 375px, 768px, and 1280px shows the eight control cards stacking on mobile, two-up on tablet, three-up on desktop (matching the trust-surface card grid pattern).
- [ ] A new e2e spec at `tests/e2e/security-posture-page.spec.ts` (modeled on `tests/e2e/subprocessors.spec.ts` from ticket 0069) asserts, using a `gotoSecurity(page)` helper that navigates to `/security` and waits for RouteFallback detach per the 2026-09-05 lesson and the H1 mount signal per the 2026-09-10 lesson: (1) `GET /security` returns 200, (2) the page renders an H1 containing "Security Posture" (case-insensitive), (3) the page renders exactly `securityControls.length` control cards (imported from the mirror-source path so the count is derived, not hard-coded, per the 2026-05-25 mirror-source rule), (4) exactly one `CollectionPage` JSON-LD block on the page whose `url` is `'https://digitalcraftai.com/security'` and whose `hasPart` array length equals `securityControls.length`, (5) exactly one `BreadcrumbList` block with two `itemListElement` entries whose names are "Home" and "Security", (6) every visible control card renders a `lastReviewed` date matching `/^\d{4}-\d{2}-\d{2}$/`, (7) per the 2026-09-08 em-dash-JSON-LD-block-filter lesson the em-dash check scopes ONLY to blocks THIS page emits (CollectionPage, BreadcrumbList) filtered by their `@type`, NOT to every `application/ld+json` block on the page (the homepage Organization block from `index.html` per the 2026-09-08 lesson carries a legitimate em-dash and must not be flagged), (8) every cross-link chip whose `seeAlso.href` is set renders as an `<a>` element with that href, (9) the "Security posture" footer chip renders on the homepage `/` and clicking it fires `trackCTAClick('footer_security_chip', ...)` and navigates to `/security`, (10) the page renders cleanly in both light and dark mode (the `html.dark` class toggle test pattern from ticket 0069's spec), (11) `securityControls.length >= 8` (the eight-row minimum acceptance criterion), (12) `securityControls.every(c => ['in-place', 'in-progress', 'aspirational'].includes(c.status))` (status enum guard).
- [ ] Standard box: no `/api/` change (the page ships as a static React route reading from a static TypeScript constant), no new hostname (all cross-link hrefs are same-origin), no new npm dependency, no edits to `package.json` / `package-lock.json`. `node scripts/check-backlog.mjs`, `npm run check-links` (the new cross-link hrefs must all resolve to existing pages), `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the four adjacent trust-surface specs (`tests/e2e/trust-page.spec.ts` 0018 / 0044, `tests/e2e/uptime.spec.ts` 0036, `tests/e2e/subprocessors.spec.ts` 0069, `tests/e2e/ethics.spec.ts` 0077) all stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- No `/api/` changes, no `package.json`
  changes, no em-dashes in copy, dark-mode
  required (this ticket ships one new page
  plus one new data file plus one new route
  plus one new sitemap entry plus one new
  spec plus two JSON-LD blocks plus one
  footer chip).
- Claiming any certification the company
  does not hold. SOC 2, ISO 27001, PCI-DSS,
  HIPAA compliance claims MUST NOT appear
  on this page unless a real audit is in
  place. Aspirational rows are labeled
  aspirational; there is no other honest
  wording.
- A downloadable PDF of the security
  posture. A one-page PDF export is a
  distinct printable-artifact ticket (per
  the ticket 0066 and 0067 printable-summary
  precedent).
- A security disclosure email address or
  vulnerability disclosure program. A
  disclosure program is its own distinct
  trust ticket that will need /api/ (or
  at minimum a mailto link that this
  ticket does not scope).
- A security.txt file at `/.well-known/security.txt`.
  security.txt is a follow-up ticket
  after this page ships.
- A comparative table of Digital Craft vs
  competitor security postures. Comparison
  is a distinct area (SEO / compare-page
  family).
- Editing `/trust`, `/uptime`,
  `/subprocessors`, or `/ethics` beyond
  adding the sibling cross-link back to
  `/security` if the implementer
  decides to add it (optional; the
  cross-links from `/security` outward
  are sufficient for one PR).
- A version-history log of security
  posture changes. Version tracking is
  a distinct persistent-history ticket
  (parallel to the `/changelog` pattern).
- Adding SecurityPolicy JSON-LD or
  similar schema.org types that do not
  exist in the schema.org vocabulary.
  CollectionPage plus BreadcrumbList
  is the correct emission for this
  page's shape.
- A "Report a security issue" form or
  chat widget on the page. The page is
  a passive artifact; a reporting
  channel is a distinct ticket.
- Adding CSP, HSTS, or other HTTP-header
  hardening. Header hardening is a
  Vercel-config or `vercel.json` change
  distinct from this ticket's UI-only
  scope.
- Adding per-vertical security posture
  variations. The page is one canonical
  URL for the whole business; vertical-
  specific security content is out of
  scope.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/data/securityControls.ts`
  exporting the typed `securityControls`
  constant. Mirror the shape of
  `src/data/subprocessors.ts` (ticket
  0069) for the file's export pattern
  and TypeScript interface style. Every
  string is defensible per AGENTS.md;
  every `lastReviewed` date is
  `'2026-09-15'` on initial ship. The
  eight minimum rows are enumerated in
  AC #1; the implementer can add more
  if they are defensible.
- New `src/pages/Security.tsx` (under
  200 lines). Mirror the file structure
  of `src/pages/Subprocessors.tsx`
  (ticket 0069): same imports, same
  Helmet block shape, same
  card-grid pattern with the status
  chip color-coded per the status enum
  (green for in-place, amber for
  in-progress, gray for aspirational).
  Every color class carries its `dark:`
  variant.
- New `src/App.tsx` route entry
  mapping `/security` to the new
  component, wrapped in the existing
  `<Suspense fallback={<RouteFallback />}>`
  shell and lazy-imported via
  `React.lazy(() => import('./pages/Security'))`
  per the 2026-09-05 route-code-splitting
  lesson.
- New entry in `src/data/routes.ts` at
  the trust-family slot for `/security`
  next to `/trust`, `/uptime`,
  `/subprocessors`, `/ethics`.
- Two JSON-LD blocks inside the
  `<Helmet>` block: CollectionPage
  (with `hasPart` enumerating each
  SecurityControl per AC #6) and
  BreadcrumbList (two levels). A
  module-top `META_DESCRIPTION`
  constant that both the
  `<meta name="description">` tag
  AND the CollectionPage.description
  read from per the 2026-05-25
  mirror-source rule.
- New footer chip in
  `src/components/Footer.tsx` reading
  "Security posture" linking to
  `/security`. Mirror the ticket
  0023 (AI providers) and ticket
  0069 (Data recipients) chip
  patterns; add alphabetically in
  the trust-chip row. The chip fires
  `trackCTAClick('footer_security_chip', <current-route>)`
  before navigation.
- Per the 2026-05-30 second-@type
  lesson, BEFORE writing code grep
  every `tests/e2e/*-jsonld.spec.ts`
  for CollectionPage and
  BreadcrumbList predicates.
  Predecessor candidates as of
  2026-09-15: 0048 /compare, 0057
  /case-studies, 0069 /subprocessors,
  0071 /ai-for-hospitality, and
  0079 /blog if merged before this
  ticket. Each predecessor is
  URL-scoped so the sibling on
  `/security` cannot collide. The
  grep result is documented in the
  Implementation log.
- Per the 2026-09-08
  em-dash-JSON-LD-block-filter
  lesson, the em-dash check in the
  spec scopes ONLY to blocks THIS
  page emits (CollectionPage,
  BreadcrumbList) filtered by their
  `@type`, NOT to every
  `application/ld+json` block on
  the page. The homepage
  Organization block from
  `index.html` carries a legitimate
  em-dash and must not be flagged
  by the /security spec.
- Per the 2026-05-25 mirror-source
  rule, every string that appears
  on both the visible page AND the
  CollectionPage JSON-LD is read
  from one constant (the
  `securityControls` array for
  per-row strings, the
  `META_DESCRIPTION` module-top
  constant for the page-level
  description).
- Per the 2026-05-07 em-dash Hard
  NO, every string in every touched
  file is hyphen-only. Self-Review
  greps the diff for
  `String.fromCharCode(8212)`
  before pushing.
- Per the 2026-09-05 route-fallback
  and 2026-09-10 mount-signal
  lessons, the new spec's
  `gotoSecurity` helper waits for
  RouteFallback detach AND the H1
  to be visible before reading
  page state.
- Per the 2026-05-22 two-PR ship
  lesson, ship will need a
  follow-up `chore/0081-ship-status`
  PR after the feat PR merges to
  flip the ticket frontmatter AND
  its `docs/backlog/README.md`
  index row to `shipped` together;
  run
  `node scripts/check-backlog.mjs`
  before pushing the second PR so
  the file and index never drift
  mid-flip.
- New deps: NO. The page reuses
  `react-helmet-async`,
  `react-router-dom`, the existing
  `trackCTAClick` helper, the
  existing UI primitives from
  `@/components/ui/*`, and
  Tailwind utility classes. Schema
  migration: no. Privacy /
  security surface change: NO -
  the page contains only defensible
  static text about controls that
  are already in place or
  aspirational; it does NOT
  introduce any new data-collection
  behavior on the site.

## Implementation log

(Appended by the implementation-dev agent during execution.)

### 2026-09-15 - Implementation

**Pre-code grep (2026-05-30 second-@type lesson).** Grepped every
`tests/e2e/*.spec.ts` for `=== 'CollectionPage'` and `=== 'BreadcrumbList'`
predicates and any `toHaveLength(1)` / "exactly one" assertions over those
`@type`s. Predecessor CollectionPage specs (URL-scoped, cannot collide with
a sibling /security block):

- `tests/e2e/compare-hub.spec.ts` -> navigates to `/compare` before its
  CollectionPage predicate.
- `tests/e2e/case-studies-hub.spec.ts` -> navigates to `/case-studies` before
  its CollectionPage predicate.
- `tests/e2e/subprocessors.spec.ts` -> navigates to `/subprocessors` before
  its `toHaveLength(1)` CollectionPage assertion.
- `tests/e2e/ai-for-hospitality.spec.ts` -> navigates to
  `/ai-for-hospitality` before its "exactly one CollectionPage" assertion
  (line 266).
- `tests/e2e/blog-collectionpage-jsonld.spec.ts` -> navigates to `/blog`
  before its "exactly one CollectionPage" assertion (line 217).
- `tests/e2e/case-studies-rss-feed.spec.ts` -> parses the RSS XML feed,
  not a page DOM; the CollectionPage filter is scoped to the feed
  document, not any HTML route.

Predecessor BreadcrumbList specs are all URL-scoped in the same fashion
(`ethics-page.spec.ts`, `subprocessors.spec.ts`, `changelog-itemlist-jsonld.spec.ts`,
every `compare-*.spec.ts`, every `ai-for-*.spec.ts`, `blog-collectionpage-jsonld.spec.ts`,
etc.). None assert "exactly one BreadcrumbList on the entire site"; all
navigate to their own path first.

Conclusion: a new /security-scoped CollectionPage + BreadcrumbList pair
cannot collide with any predecessor "exactly-one" assertion. No
predecessor spec needed widening; no source edits outside this ticket.

**Sitemap generator source.** The sitemap generator at
`scripts/generate-sitemap.ts` reads routes from `src/App.tsx` (via a
`path=["']` regex over the App.tsx source), not from `src/data/routes.ts`.
AC #5's phrasing "picks up the new route from `src/data/routes.ts`" is a
groomer-prose paraphrase per the 2026-09-12 code-beats-prose lesson;
the code's real source is App.tsx. Both files carry the new `/security`
entry in the same PR so the ROUTES allow-list (consumed by the smoke
spec and `WhatsNewSinceVisit`) stays in sync alongside the App.tsx
route definition. `dist/sitemap.xml` after `npm run build` confirmed
to include `<loc>https://digitalcraftai.com/security</loc>`.

**Em-dash JSON-LD filter (2026-09-08 lesson).** The new spec's em-dash
case filters the block list down to blocks THIS PAGE emits
(CollectionPage + BreadcrumbList) before iterating; it does NOT loop
over every `application/ld+json` block on the DOM. The homepage
Organization block from `index.html` (ticket 0025) carries a
legitimate historical em-dash and is not this page's to edit.

**Mount-signal helper (2026-09-05 + 2026-09-10 lessons).**
`gotoSecurity` waits for the RouteFallback (`role="status"
aria-label="Loading"`) to detach AND for the H1 to be visible before
reading page state. Both waits use `.catch(() => {})` where safe so
they do not break on routes without the exact signal.

**Footer chip beacon assertion.** Initial spec used `page.addInitScript`
to stub gtag before load; that failed once because the Google Analytics
loader script overwrote the stub after mount. Switched to the ticket 0023
`footer-providers-chip.spec.ts` pattern: stub gtag via `page.evaluate`
AFTER page load, then suppress the click's default navigation once so
the captured events survive past the click. All 13 spec cases pass.

**Sibling flake note.** During the sibling trust-family regression pass
`tests/e2e/trust-page.spec.ts` line 163 timed out once with zero
`lightHeadings`; re-running the spec in isolation passed. This is the
2026-09-05 RouteFallback timing race on the trust page's dark-mode
heading measurement, pre-existing and covered by CI `retries: 1`. My
diff does not touch `src/pages/Trust.tsx`.

**Data source (2026-09-12 code-beats-prose lesson).** The `SecurityControl`
interface was authored fresh to match AC #1's shape rather than mirrored
from `Subprocessor` because the two rows carry different columns
(status enum + lastReviewed date + optional seeAlso cross-link vs.
category + publicTrustUrl). Names, descriptions, and status tags are
all defensible per AGENTS.md: no invented certifications (SOC 2 /
ISO 27001 / PCI-DSS / HIPAA are not claimed), no invented compliance
frameworks, no invented insurance coverage claims. The aspirational
row (`third-party-penetration-testing`) is explicitly labeled
aspirational per AC #8's "no fake certifications" constraint.

The list ships nine rows rather than the eight-row minimum: the extra
row (`ethics-hard-nos`) cross-links back to `/ethics` so an
IT-security reviewer can reach the sibling public commitment page
without having to know it exists. AC #1's minimum is >= 8; this
satisfies it with a defensible ninth entry.
