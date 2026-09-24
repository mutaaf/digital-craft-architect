---
id: 0094
title: Public /ai-risks-we-watch dated risk-watchlist page as a defensible moat trust artifact
status: shipped
priority: P2
area: trust
created: 2026-09-24
owner: gtm-innovation
---

## User story

As a risk-aware buyer at a
regulated or reputation-sensitive
business evaluating Digital
Craft (a construction GC whose
E&O insurer asks whether the
vendor has a documented posture
on AI-generated hallucinated
estimates, a real-estate
brokerage compliance officer
who needs to see a dated
document listing the AI
failure modes the vendor is
actively monitoring, a
franchise VP whose corporate
counsel reads every vendor's
"AI risks we track" page as
part of vendor onboarding, a
healthcare adjacent buyer who
wants to see the vendor's
hallucination and prompt-
injection posture before
opening a paid pilot), I want
one public dated page at
`/ai-risks-we-watch` listing
the specific AI failure modes
Digital Craft is actively
monitoring, the current
mitigation posture for each,
and the last-reviewed date, so
that I can read a defensible
audit trail before booking a
strategy call and I can cite
it to my own risk team as
part of the vendor
onboarding packet.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of
value: the site already ships
three defensible trust artifacts
that speak to specific slices
of AI risk (`/ethics` from
ticket 0077 lists dated
hard-NO commitments,
`/security` from ticket 0081
lists dated infrastructure
and application security
controls, `/model-card` from
ticket 0088 lists third-party
model provenance with
intended-use and limitation
rows). None of the three
speaks to the buyer's actual
question "what AI failure
modes are you watching and
what is your current
mitigation." That question is
the shortest bridge between
the "we won't do X" (ethics)
and "here is our security
control" (security) artifacts:
it names the risk, its
current mitigation, and its
last-reviewed date. Adding
the page is exactly one new
file
(`src/pages/AiRisksWeWatch.tsx`,
modeled 1:1 on
`src/pages/Ethics.tsx`
from ticket 0077 which
renders a dated commitments
table from a data-file
constant), one new data
file
(`src/data/aiRisksWatchlist.ts`
mirroring the pattern of
`src/data/ethicsCommitments.ts`
or
`src/data/subprocessors.ts`),
one new entry in
`src/data/routes.ts`, one
new route in `src/App.tsx`,
one new entry in
`public/sitemap.xml`, one
new footer trust-chip link
next to the existing `/trust`
/ `/ethics` / `/security`
links, and one new spec
file. No new backend, no
new dependency, no new demo
surface.

### Stakeholder

This widens the moat in the
buyer-side-defensibility
dimension that the trust
family (`/trust`, `/ethics`,
`/security`, `/how-we-ship`,
`/model-card`,
`/subprocessors`,
`/agent-fleet`,
`/playbook`,
`/questions-to-ask-an-ai-vendor`,
`/questions-to-ask-an-ai-vendor/scorecard`)
already opens. Every one of
those pages is a defensible
dated artifact that a buyer's
compliance officer, insurer,
or corporate counsel can cite;
none of them says "here are
the 8-12 specific AI failure
modes we watch and here is our
current mitigation posture for
each." The competitive
positioning is asymmetric:
most AI-services vendors do
NOT publish a dated risk-
watchlist page (the closest
public analogue is a big-lab
"responsible AI" statement,
which is broad, undated, and
not vertical-specific to
construction / real-estate /
home-services buyers). A
dated risk-watchlist becomes
a cite-able artifact in
buyer-side vendor
onboarding packets, and
because it names the vertical
context (hallucinated
estimates, prompt-injected
lead-response, over-promised
voice-agent commitments), it
speaks the buyer's language
in a way a generic RAI
statement cannot. Per the
ticket 0077 ethics-page
precedent, the page emits
CollectionPage plus
BreadcrumbList JSON-LD (NOT
FAQPage; a risk-watchlist
is not a question-answer
pattern) so search engines
index the page as a
canonical collection of
dated risk rows. Per the
ticket 0088 model-card
precedent, the page's
"last-reviewed" date on
each row is a dated
artifact the buyer can cite
as evidence of active
monitoring, distinct from
the /ethics page which is
about immutable stances.
The moat is: a search for
"AI hallucination
mitigation posture
construction vendor" or
"AI prompt injection
disclosure" lands on
Digital Craft's dated
watchlist, not on a
generic responsible-AI
statement from a lab.

### User (in the real moment of use)

A construction GC's E&O
insurance broker emails the
GC on a Wednesday morning:
"before we bind coverage
that includes AI-generated
estimates, we need to see
the vendor's written
posture on hallucinated
estimates and prompt-
injected inputs, plus the
date they last reviewed
it." The GC has already
tried the Digital Craft
demos and is on
`/questions-to-ask-an-ai-vendor`
when he sees a link in the
footer to `/ai-risks-we-watch`.
He taps in on his phone
in the truck between
jobs. The page renders a
single H1 ("AI risks we
watch"), one paragraph of
context, then a dated table
of 8 to 12 rows: risk name
(hallucinated estimates,
prompt-injection on lead
intake, over-promised voice
commitments, subtle bias in
lead-scoring, personal-data
leakage through prompts,
model deprecation without
warning, third-party model
outage, cross-tenant data
mixing, silent quality
regression, over-confident
follow-up SMS wording,
mis-transcribed voice
inputs, stale cached
answers), a two-sentence
current mitigation posture
per row (naming a
specific control from
`/security` or a stance
from `/ethics` where
applicable), and a
last-reviewed date
(quarterly cadence). He
screenshots the page,
forwards it to his
broker, and books a
15-minute strategy call
from the CTA at the
bottom. No mobile scroll
trap, no dead links, no
non-defensible claim.
Light and dark mode
both read cleanly.

### Growth

The "show me" moment is
the screenshot a buyer
pastes into their
insurer's or corporate
counsel's inbox: a dated
table of 8 to 12 AI risk
rows with mitigation
posture and last-reviewed
date. That single
screenshot is the
shortest path from "I
tried a demo" to "my
compliance officer says
yes" because it
answers the compliance-
officer's exact
question (dated posture,
enumerated failure modes,
cited mitigation) without
the buyer having to
translate the vendor's
marketing into a risk
disclosure. It also
creates a measurable
SEO surface: "AI
hallucination posture
construction vendor,"
"AI prompt injection
disclosure real
estate," "AI risks
watched by AI-services
vendor" all become
long-tail head terms
the page owns as one
of the very few
public vendor
watchlists on the
open web. The
generator ships as
one new page file
plus one new data
file plus one new
route entry plus one
new spec plus one
sitemap line plus
one footer link;
the growth value is
in the SERP surface
AND in the buyer-
side cite-ability
the page opens.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page at `src/pages/AiRisksWeWatch.tsx` (new file, under 200 lines) modeled 1:1 on `src/pages/Ethics.tsx` (ticket 0077) which renders a dated commitments table from a data-file constant. The page renders: (a) a hero H1 "AI risks we watch," (b) one paragraph of context naming this page as a dated defensible artifact distinct from `/ethics` (immutable stances) and `/security` (infra controls), (c) a table with one row per risk from the new data file, each row rendering the risk name, a two-sentence current mitigation posture, a last-reviewed ISO date (`YYYY-MM-DD`), and a chip linking to the related `/ethics` commitment or `/security` control where applicable (the chip is optional per row; some risks link to `/ethics`, some to `/security`, some to none), (d) a "Book a 15-minute strategy call" CTA at the bottom pointing at the existing homepage strategy-call anchor. Every string on the page is defensible per AGENTS.md: no invented statistics, no invented percentages, no invented client names, hyphens not em-dashes per the 2026-05-07 em-dash Hard NO.
- [ ] A new data file at `src/data/aiRisksWatchlist.ts` (new file, under 200 lines) exports `AI_RISKS_WATCHLIST: readonly AiRiskRow[]` where `AiRiskRow` is `{ id: string; name: string; mitigation: string; lastReviewed: string; relatedLink?: { label: string; href: string } }`. Exactly 8 to 12 rows, each row defensible: no invented model-vendor SLAs, no invented incident-frequency figures, no client-attributed failure counts. Every `id` is a stable kebab-case slug. Every `lastReviewed` is a real ISO date (`YYYY-MM-DD`) matching or preceding 2026-09-24. Every `relatedLink.href`, when present, is one of the shipped routes in `src/data/routes.ts` (`/ethics`, `/security`, `/model-card`, `/subprocessors`, `/how-we-ship`, `/agent-fleet`); a link to a non-shipped route is a build-time assertion failure. Per the 2026-05-25 mirror-source rule the label text of the `relatedLink` chip is authored once in the data file and rendered on the page from that single source; do NOT hand-roll a second copy of the label.
- [ ] A new route entry at `src/App.tsx` mapping `/ai-risks-we-watch` to the new page component, imported through the existing `React.lazy` pattern per the 2026-09-05 route-code-splitting lesson. Wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell.
- [ ] A new entry in `src/data/routes.ts` (the canonical route allow-list) exactly `'/ai-risks-we-watch'`, placed near the other trust-artifact routes (`/ethics`, `/security`, `/how-we-ship`) per the file's existing grouping. Per the 2026-06-07 mirror-source-across-src-tests lesson, `tests/e2e/routes.ts` continues to re-export `ROUTES` verbatim and requires no separate edit.
- [ ] A new entry in `public/sitemap.xml` for `<url><loc>https://digitalcraftai.com/ai-risks-we-watch</loc><lastmod>2026-09-24</lastmod><priority>0.6</priority></url>` (mirroring the priority and lastmod pattern of the ticket 0077 `/ethics` sitemap row per the 2026-05-28 sitemap-lastmod lesson). If the sitemap is auto-generated by `scripts/generate-sitemap.ts` per the ticket 0022 precedent, the entry is emitted via the generator's existing enumeration; no manual XML edit required and the implementer confirms auto-inclusion in the Implementation log by grepping `dist/sitemap.xml` for `/ai-risks-we-watch` after a local build.
- [ ] The page emits exactly two JSON-LD blocks inside its `<Helmet>` block: (1) `CollectionPage` with `name: "AI risks we watch"`, a `description` field authored once in the page and mirrored byte-for-byte from a visible hero paragraph per the 2026-05-25 mirror-source rule, and a `mainEntity: ItemList` whose `itemListElement` array iterates `AI_RISKS_WATCHLIST` producing one `ListItem` per row with `position`, `name`, and `url` (a same-page fragment anchor like `#risk-<id>`), (2) `BreadcrumbList` positioning the page under the homepage (two levels: Home, AI risks we watch). Do NOT emit a third `FAQPage` block; a risk-watchlist is not a question-answer pattern per the ticket 0077 precedent. Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'`, `=== 'BreadcrumbList'`, and `=== 'ItemList'` predicates and any "exactly one" / `toHaveLength(1)` assertions over those `@type`s. Predecessor candidates as of 2026-09-24: `/case-studies` (ticket 0057), `/subprocessors` (ticket 0069), `/blog` (ticket 0079), `/compare` (ticket 0048), `/case-studies` RSS pairing, `/glossary` (ticket 0063 BreadcrumbList), `/trust` (ticket 0044 BreadcrumbList), plus every trade-page BreadcrumbList and every compare-page BreadcrumbList. Each predecessor is URL-scoped so the sibling instance on `/ai-risks-we-watch` cannot collide; the grep result is documented in the Implementation log.
- [ ] Per the 2026-05-07 em-dash Hard NO, every string emitted on the page AND every string emitted in `src/data/aiRisksWatchlist.ts` AND every string emitted into the two JSON-LD blocks AND every string in the new e2e spec is hyphen-only. Self-Review greps the diff for `String.fromCharCode(8212)` before pushing. Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the em-dash-in-JSON-LD assertion in the new spec scopes ONLY to the two blocks THIS page emits (`CollectionPage`, `BreadcrumbList`) filtered by their `@type`, NOT to every `application/ld+json` block on the page (the homepage Organization block from `index.html` ships site-wide and carries a legitimate em-dash and must not be flagged).
- [ ] The page ships full dark-mode support: every Tailwind color class carries its `dark:` variant, mirroring `src/pages/Ethics.tsx` and `src/pages/Subprocessors.tsx` verbatim. A viewport-width check on 375px, 768px, and 1280px shows the risk table stacking to a single column on mobile and expanding to a two-column layout on desktop (matching the predecessor pattern).
- [ ] One new footer trust-chip link is added to the shipped footer component (`src/components/Footer.tsx` or equivalent, grep for the existing `/ethics` link render) pointing to `/ai-risks-we-watch` next to the existing `/ethics` and `/security` links, so a visitor on any page can reach the new artifact in one tap. Per the 2026-05-25 mirror-source rule, the link label is authored once in the footer's shipped constants and rendered from that single source.
- [ ] A new e2e spec at `tests/e2e/ai-risks-we-watch.spec.ts` (modeled on `tests/e2e/ethics-page.spec.ts` from ticket 0077 or `tests/e2e/subprocessors.spec.ts` from ticket 0069) asserts, using a `gotoRisks(page)` helper that navigates to `/ai-risks-we-watch` and waits for RouteFallback detach per the 2026-09-05 lesson and the H1 mount signal per the 2026-09-10 lesson: (1) `GET /ai-risks-we-watch` returns 200, (2) the page renders an H1 containing "AI risks we watch" (case-insensitive), (3) the page renders exactly N `data-testid="ai-risk-row"` rows where N equals `AI_RISKS_WATCHLIST.length` (mirror-source assertion per the 2026-05-25 rule; the spec imports `AI_RISKS_WATCHLIST` from `src/data/aiRisksWatchlist.ts`, not from a hand-rolled copy in the test file per the 2026-09-12 code-beats-prose lesson), (4) every row's `lastReviewed` string parses as a valid ISO date matching `/^\d{4}-\d{2}-\d{2}$/` and represents a date on or before 2026-09-24 (defensible-date assertion), (5) every row's `relatedLink.href` (when present) is one of the shipped routes in `src/data/routes.ts` (imported from `src/data/routes.ts` per the 2026-06-07 lesson; a href pointing outside the allow-list is a spec failure), (6) exactly one `CollectionPage` JSON-LD block on the page with a `name` field containing "AI risks we watch" and a `mainEntity.itemListElement` array whose length equals `AI_RISKS_WATCHLIST.length`, (7) exactly one `BreadcrumbList` block with two `itemListElement` entries whose names are "Home" and "AI risks we watch", (8) per the 2026-09-08 em-dash-JSON-LD-block-filter lesson the em-dash check scopes ONLY to the two blocks THIS page emits (CollectionPage, BreadcrumbList) filtered by their `@type`, NOT to every `application/ld+json` block on the page, (9) every string in the rendered page body contains zero `String.fromCharCode(8212)` code points, (10) the page renders cleanly in both light and dark mode via the `html.dark` class toggle, (11) the shipped footer's `/ai-risks-we-watch` link is visible and clickable from at least one shipped route (`/`, `/trust`, `/ethics`, `/security`) and navigates to the new page. Per the 2026-06-15 attribute-list regex lesson, any regex in the spec that matches an XML/HTML attribute list uses `[^>]*`, not `[^/>]*`, so slashes inside MIME types or paths do not break the match. Per the 2026-09-08 sibling-hub-name-poll lesson, any SPA navigation between two hubs in the spec keys its JSON-LD block poll on the target hub's own `name` field, not on `count > 0` scripts.
- [ ] Standard box: no `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/data/ethicsCommitments.ts`, `src/data/securityControls.ts`, `src/data/modelCard.ts`, or `src/data/subprocessors.ts` (each stays byte-identical; this ticket's data file is a NEW artifact, not a merge). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the existing `tests/e2e/ethics-page.spec.ts`, `tests/e2e/subprocessors.spec.ts`, `tests/e2e/security-page.spec.ts`, `tests/e2e/trust-page.spec.ts`, and every predecessor CollectionPage / BreadcrumbList spec stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- Standard anti-goals: no /api/
  changes, no package.json
  changes, no em-dashes in
  copy, dark-mode required.
- Merging the new watchlist
  data into the shipped
  ticket 0077
  `src/data/ethicsCommitments.ts`
  or ticket 0081
  `src/data/securityControls.ts`
  or ticket 0088
  `src/data/modelCard.ts`.
  Each of the three shipped
  data files stays byte-
  identical; the new
  watchlist is an
  ADDITIONAL dated artifact
  in its own file.
- Fabricated incident-
  frequency figures ("we
  see prompt-injection
  attempts on 3% of
  lead-response
  sessions"). Every row
  names the risk, the
  mitigation posture, and
  the last-reviewed date;
  no row claims a
  frequency, a percent,
  or an SLA the ticket
  cannot cite to a
  defensible public
  source.
- Client-attributed
  failure counts ("client
  X saw two hallucinated
  estimates last
  quarter"). Every row is
  policy language, not
  a client incident.
- A public incident-
  postmortem table
  linking to specific
  incidents. Incident
  postmortems are the
  domain of the ticket
  0036 `/uptime` page;
  this page is
  forward-looking
  posture, not backward-
  looking incidents.
- A separate "AI risks
  we watch" JSON export
  (`/ai-risks-we-watch.json`).
  Machine-readable
  export is its own
  ticket parallel to
  the ticket 0055 RSS
  and 0078 JSON Feed
  pattern; the MVP
  ships the page and
  its CollectionPage
  JSON-LD only.
- Cross-linking
  `/ai-risks-we-watch`
  from every trade-
  landing page or every
  comparison page. The
  MVP wires exactly
  one footer link and
  lets Googlebot index
  from there; cross-
  surface promotion is
  its own follow-up
  ticket.
- A per-risk detail
  page
  (`/ai-risks-we-watch/hallucination`).
  Every row renders on
  the same page under
  a fragment anchor;
  per-row detail pages
  are a follow-up
  ticket once
  telemetry justifies
  the deeper structure.
- Emitting a
  `DefinedTermSet`
  JSON-LD block
  (ticket 0013 pattern).
  A risk-watchlist is
  not a glossary; the
  CollectionPage plus
  ItemList shape is
  the correct
  structured-data
  pattern per the
  ticket 0057 / 0069 /
  0079 precedent.
- Emitting a
  `FAQPage` JSON-LD
  block. A risk row
  is not a question-
  answer pattern; the
  CollectionPage shape
  is authoritative.
- Adding a comments,
  reactions, or "email
  us about a missing
  risk" form on the
  page. The page is a
  static dated
  artifact; a feedback
  form is a distinct
  ticket with its own
  privacy surface.
- A newsletter-style
  "monthly risk-watch
  digest" email. Email
  retention is its own
  ticket once ticket
  0002 (5-day course)
  confirms email
  consent.
- Editing the shipped
  ticket 0077 `/ethics`
  page or the ticket
  0081 `/security`
  page beyond the
  additive footer
  link. Each shipped
  trust page stays
  byte-identical.
- Adding a "last-
  reviewed changelog"
  showing the delta
  between review
  cycles. The page
  renders the current
  posture only; a
  historical delta
  timeline is a
  follow-up ticket
  once quarterly
  reviews have
  accumulated.
- Adding the page
  to the `index.html`
  SEO Pilot pages
  table. Per the
  2026-05-25 SEO
  Pilot lesson, only
  routes in that
  table get
  `document.title`
  overrides; the
  new page relies
  on Helmet-managed
  head elements
  (title, meta
  description,
  JSON-LD) exclusively.
  The spec asserts
  the emitted JSON-LD,
  NOT
  `toHaveTitle`.
- A "share this page"
  button. The URL is
  already shareable;
  a formal share
  affordance is
  redundant.
- Fabricated public
  cite-links (linking
  to a fictitious
  NIST or ISO
  document). Any
  external cite must
  be to a real
  document; the MVP
  keeps external
  links to zero and
  cites Digital
  Craft's own
  `/ethics`,
  `/security`, and
  `/model-card` pages
  as the mitigation
  posture references.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New
  `src/data/aiRisksWatchlist.ts`
  (under 200 lines). Mirror
  the shape of
  `src/data/ethicsCommitments.ts`
  (ticket 0077) or
  `src/data/subprocessors.ts`
  (ticket 0069): one
  exported `readonly`
  array constant, one
  exported `interface`
  or `type`. Author 8 to
  12 rows. Every row's
  `lastReviewed` is an
  ISO date on or before
  2026-09-24. Every row's
  optional `relatedLink.href`
  is one of the shipped
  trust-family routes.
- New
  `src/pages/AiRisksWeWatch.tsx`
  (under 200 lines).
  Mirror the file
  structure of
  `src/pages/Ethics.tsx`
  (ticket 0077) or
  `src/pages/Subprocessors.tsx`
  (ticket 0069)
  verbatim: same
  imports, same section
  layout, same table
  render. Every Tailwind
  color class carries
  its `dark:` variant.
  Import
  `AI_RISKS_WATCHLIST`
  from
  `src/data/aiRisksWatchlist.ts`
  and iterate the
  array.
- `src/App.tsx` - add
  `<Route path="/ai-risks-we-watch" element={<AiRisksWeWatch />} />`
  next to the existing
  `/ethics` and
  `/security` routes,
  wrapped in the
  existing
  `<Suspense fallback={<RouteFallback />}>`
  shell and lazy-
  imported via
  `React.lazy(() => import('./pages/AiRisksWeWatch'))`
  per the 2026-09-05
  route-code-splitting
  lesson.
- `src/data/routes.ts` -
  add `/ai-risks-we-watch`
  to the `ROUTES` array
  near the other trust
  routes.
- Per the 2026-05-25
  mirror-source rule,
  the visible page
  description string
  and the
  CollectionPage
  JSON-LD `description`
  field share a single
  source; author the
  string once at the
  top of the page
  component (or in a
  helper) and read it
  from both render
  paths.
- Per the 2026-05-30
  second-@type lesson,
  BEFORE writing code
  grep every
  `tests/e2e/*-jsonld.spec.ts`
  for `=== 'CollectionPage'`,
  `=== 'BreadcrumbList'`,
  and `=== 'ItemList'`
  predicates.
  Predecessor
  candidates as of
  2026-09-24:
  `/case-studies`
  (ticket 0057),
  `/subprocessors`
  (ticket 0069),
  `/blog` (ticket
  0079), `/compare`
  (ticket 0048), and
  every BreadcrumbList
  spec across
  `/glossary`
  (ticket 0063),
  `/trust` (ticket
  0044), the sixteen
  `ai-for-*` pages,
  and every compare
  page. Each
  predecessor is URL-
  scoped, so the
  sibling on
  `/ai-risks-we-watch`
  cannot collide.
  Document the grep
  result in the
  Implementation log.
- Per the 2026-09-05
  route-code-splitting
  lesson, the new
  page's e2e helper
  waits for the
  RouteFallback to
  detach AND for the
  H1 to be visible
  before probing the
  DOM.
- Per the 2026-09-08
  em-dash-JSON-LD-
  block-filter lesson,
  the spec's em-dash
  assertion filters
  the block list to
  the two `@type`s
  THIS page emits
  before iterating;
  it does NOT loop
  over every
  `application/ld+json`
  script on the page
  (the homepage
  Organization block
  from `index.html`
  ships site-wide
  and carries a
  legitimate em-dash).
- Per the 2026-06-15
  attribute-list
  regex lesson, any
  regex in the new
  spec that matches
  an XML/HTML
  attribute list uses
  `[^>]*`, not
  `[^/>]*`.
- Per the 2026-09-08
  sibling-hub-name-
  poll lesson, any
  SPA navigation
  between two hubs
  in the spec keys
  its JSON-LD block
  poll on the target
  hub's own `name`
  field, not on
  `count > 0`
  scripts.
- Per the 2026-09-12
  code-beats-prose
  lesson, the ticket
  cites "8 to 12
  rows" as groomer
  prose. The
  implementer greps
  the ACTUAL row
  count at
  implementation
  time; if the count
  needs to deviate
  (e.g., a fresh
  vertical-specific
  risk emerges), the
  ticket's spec
  asserts
  `N === AI_RISKS_WATCHLIST.length`
  via a real import
  from the data
  file, not against
  a hard-coded
  count.
- Per the 2026-05-25
  mirror-source rule,
  the spec imports
  `AI_RISKS_WATCHLIST`
  from
  `src/data/aiRisksWatchlist.ts`
  directly (per the
  2026-06-07 src-
  imports-tests
  lesson, the data
  file lives under
  `src/data/` and
  is imported from
  the spec
  unchanged).
- `src/components/Footer.tsx`
  (or the equivalent
  shipped footer) -
  add one new link
  to
  `/ai-risks-we-watch`
  next to the
  existing `/ethics`
  and `/security`
  links. Grep the
  file first for the
  existing `/ethics`
  link render; place
  the new link in
  the same trust-
  chip cluster with
  identical styling.
  Per the 2026-05-25
  mirror-source
  rule, the link
  label is authored
  once in the
  footer's shipped
  constants and
  rendered from
  that single
  source.
- `tests/e2e/ai-risks-we-watch.spec.ts`
  (new) - one
  assertion per
  acceptance box.
  Model the spec on
  `tests/e2e/ethics-page.spec.ts`
  (ticket 0077) or
  `tests/e2e/subprocessors.spec.ts`
  (ticket 0069).
- Per the 2026-05-22
  two-PR ship
  lesson, ship will
  need a follow-up
  `chore/0094-ship-status`
  PR after the feat
  PR merges to flip
  the ticket
  frontmatter AND
  its
  `docs/backlog/README.md`
  index row to
  `shipped`
  together; run
  `node scripts/check-backlog.mjs`
  before pushing the
  second PR so the
  file and index
  never drift mid-
  flip.
- New deps: NO. The
  page reuses `react-
  router-dom`,
  `react-helmet-async`,
  `lucide-react`,
  and Tailwind
  utility classes
  already in use on
  the shipped trust
  pages. Schema
  migration: no.
  Privacy /
  security surface
  change: no (the
  page renders
  server-side-safe
  static content;
  no new
  localStorage key,
  no new hostname,
  no new outbound
  network call).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-24 - branch `feat/0094-ai-risks-we-watch` opened off fresh origin/main; ticket + README flipped to in-progress in the same commit (check-backlog green).
- 2026-09-24 - predecessor JSON-LD grep per AC #6: `rg "=== 'CollectionPage'|=== 'BreadcrumbList'|=== 'ItemList'|toHaveLength\(1\)" tests/e2e/*jsonld*.spec.ts` returned hits in `blog-collectionpage-jsonld.spec.ts`, `case-study-article-jsonld.spec.ts`, `changelog-itemlist-jsonld.spec.ts`, `demos-softwareapplication-jsonld.spec.ts`, `glossary-breadcrumb-jsonld.spec.ts`, `homepage-organization-jsonld.spec.ts`, `homepage-pricing-product-jsonld.spec.ts`, `texas-localbusiness-jsonld.spec.ts`, `trust-aboutpage-jsonld.spec.ts`, and `website-sitelinks-jsonld.spec.ts`. Every "exactly one Foo" / `toHaveLength(1)` predicate is URL-scoped: each spec navigates to its own hub (`/blog`, `/case-studies`, `/changelog`, `/demos`, `/glossary`, `/`, `/locations/texas`, `/trust`) and asserts blocks emitted on THAT route. The sibling /ai-risks-we-watch CollectionPage + BreadcrumbList blocks are only mounted when Helmet swaps on this new route, so they cannot land in any predecessor spec's block list. No predecessor assertion needs widening.
- 2026-09-24 - failing test added in `tests/e2e/ai-risks-we-watch.spec.ts` (mirrors `tests/e2e/security-posture-page.spec.ts`).
- 2026-09-24 - sitemap auto-inclusion confirmed by grepping `dist/sitemap.xml` post-build for `/ai-risks-we-watch`; hit found on the same shape as the /ethics row (priority 0.8, weekly, appLastmod-driven date). Sitemap is generated from App.tsx route table, so no manual public/sitemap.xml edit needed.
- 2026-09-24 - PR #N opened, CI [state]
- 2026-09-24 - merged to main
