---
id: 0088
title: Public /model-card AI model provenance page listing every third-party model with dated intended-use and limitation rows as a defensible trust artifact
status: shipped
priority: P2
area: trust
created: 2026-09-20
owner: gtm-innovation
---

## User story

As a cautious buyer-side evaluator vetting AI
vendors on behalf of a regulated business (a
real-estate broker whose E&O carrier flagged
"AI-generated content" as a policy risk, a
construction GC's compliance reviewer who needs
to know which LLM powers the receptionist and
whether it retains training data, a
property-management IT-security lead who wants
one URL to attach to a vendor-risk questionnaire,
a facility-services owner asking "which brand of
AI is behind this?" before signing), or arriving
from the sibling `/trust`, `/subprocessors`,
`/security`, or `/ethics` page, I want one
honest public page at `/model-card` that lists
every third-party AI model Digital Craft calls
in production (the OpenAI chat and vision model
that runs lead qualification and estimate
generation, the ElevenLabs voice model behind
the negotiation demo, the Deepgram speech-to-
text model, the Firecrawl and Jina scraping
models, the Vapi orchestration layer) with a
dated row per model naming the vendor, the
model family, the intended use on this site,
the two or three limitations a buyer should
know about, and the "since" date the model was
adopted here, so that I can forward the URL to
my compliance reviewer, my insurance carrier,
or my partner as documentary evidence of the
exact AI supply chain behind the demos.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the site
already ships five trust-adjacent public pages -
`/trust` (ticket 0018, data handling and how the
demos work), `/uptime` (ticket 0036, demo and
serverless health), `/subprocessors` (ticket
0069, third-party AI and infrastructure vendors
in tabular form), `/ethics` (ticket 0077, dated
hard-NO commitments), `/security` (ticket 0081,
dated infrastructure and application security
controls), `/playbook` (ticket 0059, methodology),
and `/how-we-ship` (ticket 0083, autonomous-
agent transparency) - but none of them
articulate WHICH specific AI models Digital
Craft calls, their intended use on this site,
and their known limitations. `/subprocessors`
names each vendor but not the model family or
its behavioral properties; a buyer's compliance
reviewer or E&O carrier asks specifically "which
GPT variant, which TTS voice model, which STT
model, and what are their limits?" The answer
today is scattered across `CLAUDE.md`,
`KNOWLEDGE_BASE.md`, and code comments; a
buyer cannot fetch it as a single URL. This
ticket adds ONE new public page at `/model-card`
sourced from a new typed data constant
`src/data/modelCard.ts` (a `ModelCardRow[]`
array with 5 to 7 dated model rows, each
carrying `vendor`, `modelFamily`, `intendedUse`,
`limitations` (a short string array of 2 to 3
items), `sinceDate`, and an optional
`vendorPolicyUrl` linking out to the vendor's
own model-card or usage policy). The page
renders each row as one bordered card in a
single-column layout, mirrors the visual shape
of `src/pages/Security.tsx` (ticket 0081) and
`src/pages/Ethics.tsx` (ticket 0077), and emits
one new `CollectionPage` plus one new
`BreadcrumbList` JSON-LD block scoped to the
new URL. Zero new backend, zero new
dependency, zero new persistent store, zero
visible change to any existing page beyond ONE
new footer link chip on `/trust` cross-linking
to `/model-card`. One new page file, one new
data file, one new spec file, one new entry in
`ROUTES`, one new route in `src/App.tsx`, one
new link chip on `Trust.tsx`.

### Stakeholder

This widens the moat in the trust-artifact
dimension along an axis the six other trust
pages structurally cannot capture: model
provenance and limitations. The Anthropic-style
"model card" concept is now the industry-
standard artifact for AI transparency
(published by every frontier lab), but almost
no AI-services vendor site publishes one for
their own supply chain. A dated public model-
card page is structurally more defensible than
a marketing "powered by GPT-4" chip because
(a) each row carries a `sinceDate` a
competitor cannot retroactively adopt without
publicly citing the earlier date, (b) each row
names the LIMITATIONS of the specific model
(context window, hallucination class, TTS voice
uncanniness, STT accent bias, scraping
rate-limit edge cases) which converts a
transparency posture into a defensible market
position, (c) the artifact is exactly the URL
an E&O carrier or compliance reviewer attaches
to a vendor-risk questionnaire, and (d) the
list can be `git blame`d and diffed by any
buyer who wants to audit when the AI supply
chain last changed. Per the 2026-09-12 code-
beats-prose lesson, the model list here is
groomer prose from the CLAUDE.md tech-stack
table; the implementer greps `CLAUDE.md`,
`KNOWLEDGE_BASE.md`, and every `src/utils/*.ts`
that names a model constant BEFORE writing the
data file and pins the row list to the actual
models called in production, not this ticket's
inline enumeration.

### User (in the real moment of use)

A property-management firm's IT-security
reviewer opens `/trust` Tuesday morning after
their operations lead forwarded the URL Friday
evening. They see the existing chips linking to
`/subprocessors`, `/uptime`, `/ethics`,
`/security`, and (new) `/model-card`. They tap
`/model-card` on their laptop; the page loads
in under one screen with a hero H1 ("AI Model
Card"), a short introduction naming the intent
(one dated row per third-party AI model called
in production), and a single-column card grid
where each card shows vendor, model family,
intended use, three limitation bullets, and a
"since" date. They scan the six rows in 40
seconds, note that every row carries an
outbound link to the vendor's own model-card
or usage policy (OpenAI usage policy,
ElevenLabs voice-cloning policy, Deepgram
model page), copy the page URL, paste it into
their vendor-risk questionnaire attachment, and
forward. On a 375px mobile viewport the cards
stack vertically; light and dark mode both
render cleanly. No CTA, no email capture, no
strategy-call chip; the CTA is the URL itself.

### Growth

The "show me" moment is the screenshot a
buyer's compliance reviewer pastes into a
vendor-risk questionnaire: a single URL
(`digitalcraftai.com/model-card`) that opens a
dated table of the exact AI supply chain
behind the demos. That artifact is structurally
the strongest AI-transparency trust signal the
site can produce because it converts a
scattered set of README references into a
canonical, indexable, forwardable public URL,
and because peer AI-services vendors almost
never publish one. Per the ticket 0069
subprocessors precedent and the ticket 0081
security precedent, a buyer who forwards
`/model-card` to their carrier or reviewer is
the highest-intent prospect the trust funnel
can produce. The page also gives the sales
funnel a defensible answer to "which brand of
AI is behind this?" that redirects the
question from a sales conversation to a public
URL, shortening the qualification cycle for
regulated-vertical prospects.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new typed data module at `src/data/modelCard.ts` (new file, under 200 lines) exports (a) a `ModelCardRow` interface with the shape `{ id: string; vendor: string; modelFamily: string; intendedUse: string; limitations: readonly string[]; sinceDate: string /* YYYY-MM-DD */; vendorPolicyUrl?: string }`, (b) a `MODEL_CARD_ROWS: readonly ModelCardRow[]` constant with 5 to 7 rows enumerating the third-party AI models called in production. Per the 2026-09-12 code-beats-prose lesson, BEFORE writing this file the implementer greps `CLAUDE.md`, `KNOWLEDGE_BASE.md`, every `src/utils/*.ts` and every `/api/*.ts` for model-name literals (`gpt-4o`, `nova-2`, `turbo-v2.5`, `firecrawl`, `jina`, `vapi`, `elevenlabs`, `cassidy`) and pins the row list to the models ACTUALLY called on branch head; the model list in this AC is groomer prose. Every row carries a `sinceDate` in `YYYY-MM-DD` form no later than today; every `vendorPolicyUrl` (when present) resolves to an https URL on a vendor domain the site already lists in `src/data/subprocessors.ts`. Every string in every row is hyphen-only per the 2026-05-07 em-dash Hard NO.
- [ ] A new page at `src/pages/ModelCard.tsx` (new file, under 200 lines) renders at `/model-card` modeled 1:1 on `src/pages/Security.tsx` (ticket 0081, the closest structural peer for a trust-family public page backed by a `src/data/` typed constant emitting `CollectionPage` plus `BreadcrumbList` JSON-LD). The page has: (a) a hero H1 "AI Model Card" with a short intro paragraph naming the intent (one dated row per third-party AI model called in production, so a compliance reviewer or insurance carrier can forward the URL as documentary evidence), (b) a single-column grid of one bordered card per `MODEL_CARD_ROWS` entry showing vendor, model family, intended use, a bulleted list of limitations, and the `sinceDate` chip, (c) an outbound link chip per row when `vendorPolicyUrl` is present (opens in a new tab with `rel="noopener noreferrer"`), (d) a "Sibling trust surfaces" strip cross-linking to `/trust`, `/subprocessors`, `/security`, `/ethics`, `/uptime`, `/playbook`, `/how-we-ship` reusing the ticket 0081 sibling-link pattern, (e) NO strategy-call CTA and NO email-capture form (the page is intentionally passive per the ticket 0077 ethics-page precedent; the CTA is the URL itself). Every rendered string is hyphen-only. Per the 2026-05-25 mirror-source rule `META_DESCRIPTION`, `PAGE_H1`, `PAGE_URL`, and `COLLECTION_PAGE_NAME` are single module-level constants read by the Helmet meta tag, the render, AND the JSON-LD blocks so they cannot drift.
- [ ] The page emits TWO JSON-LD blocks inside its `<Helmet>` head: (1) a `CollectionPage` block with `name` equal to `COLLECTION_PAGE_NAME`, `description` equal to `META_DESCRIPTION`, `url: 'https://digitalcraftai.com/model-card'`, `isPartOf: { '@type': 'WebSite', url: 'https://digitalcraftai.com' }`, and a `mainEntity` field of type `ItemList` whose `numberOfItems` equals `MODEL_CARD_ROWS.length` and whose `itemListElement` array enumerates one `ListItem` per row with `name` equal to `${vendor} ${modelFamily}` and `url` equal to `https://digitalcraftai.com/model-card#${id}` (each row card carries a matching `id` attribute so the fragment link resolves in-page); (2) a `BreadcrumbList` block with two `itemListElement` entries whose names are "Home" and "AI Model Card". Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/*-jsonld.spec.ts` for `=== 'CollectionPage'` AND `=== 'BreadcrumbList'` predicates AND any `toHaveLength(1)` / "exactly one" assertions over those types; the four existing `CollectionPage` predecessors (ticket 0048 `/compare` hub, ticket 0057 `/case-studies` hub, ticket 0069 `/subprocessors`, ticket 0071 `/ai-for-hospitality`, ticket 0079 `/blog`, ticket 0081 `/security`) are each URL-scoped so a sibling `/model-card`-scoped pair cannot collide. The grep result is documented in the Implementation log.
- [ ] The new route is registered in `src/App.tsx` next to the existing `/security` route, imported through the existing `React.lazy` pattern all other trust pages use per the 2026-09-05 route-code-splitting lesson, wrapped in the existing `<Suspense fallback={<RouteFallback />}>` shell. The implementer adds `/model-card` to the `ROUTES` array in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson; `tests/e2e/routes.ts` re-exports it automatically. The sitemap generator (`scripts/generate-sitemap.ts`, ticket 0022) picks up the new App route automatically. `src/pages/Trust.tsx` gets ONE additive edit: a new sibling-link chip pointing at `/model-card` next to the existing `/subprocessors`, `/uptime`, `/ethics`, `/security` chips (the chip strip is the only trust-page surface this ticket touches; no reordering of existing chips, no visible-text changes to any existing chip).
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text, in `MODEL_CARD_ROWS`, or in any JSON-LD serialized string. Per the 2026-09-08 em-dash-JSON-LD-block-filter lesson, the em-dash check in the new spec scopes ONLY to the two blocks THIS page emits (`CollectionPage`, `BreadcrumbList`) filtered by their `@type`, NOT to every `application/ld+json` block on the page. The homepage Organization block from `index.html` carries a legitimate em-dash and must not be flagged by the `/model-card` spec.
- [ ] A new e2e spec at `tests/e2e/model-card-page.spec.ts` (modeled on `tests/e2e/security-posture-page.spec.ts` from ticket 0081) asserts, using a `gotoModelCard(page)` helper that waits for RouteFallback detach AND the H1 to be visible before reading page state (2026-09-05 + 2026-09-10 lessons): (1) `GET /model-card` returns 200 and the H1 contains "Model Card" (case-insensitive), (2) the `meta[name="description"]` content (LAST occurrence per the 2026-05-25 Helmet-appends lesson) byte-matches the `META_DESCRIPTION` constant imported from `src/pages/ModelCard.tsx` per the 2026-05-25 mirror-source rule, (3) the visible card count on the page equals `MODEL_CARD_ROWS.length` (imported from `src/data/modelCard.ts` per the 2026-06-07 src-imports-tests lesson), asserted via `data-testid="model-card-row"` count, (4) each visible row card displays its `vendor`, `modelFamily`, at least one `limitation` bullet, and a `sinceDate` chip whose text matches the row's `sinceDate` value byte-for-byte, (5) the `CollectionPage` JSON-LD block's `mainEntity.itemListElement` array length equals `MODEL_CARD_ROWS.length` and every `ListItem.url` matches `/^https:\/\/digitalcraftai\.com\/model-card#[a-z0-9-]+$/`, (6) the `BreadcrumbList` JSON-LD has two `itemListElement` entries whose names are "Home" and "AI Model Card" and whose URLs are `https://digitalcraftai.com/` and `https://digitalcraftai.com/model-card`, (7) every string in the two THIS-PAGE JSON-LD blocks (filtered by `@type` per the 2026-09-08 lesson) contains zero `String.fromCharCode(8212)` code points; the homepage Organization block from `index.html` is deliberately excluded from the filter, (8) the page renders cleanly in both light and dark mode via the `document.documentElement.classList.add('dark')` toggle pattern from ticket 0081's spec, (9) every `vendorPolicyUrl` outbound link on the page opens in a new tab (has `target="_blank"` and `rel="noopener noreferrer"`), (10) sibling-page-regression case: navigate to `/trust`, assert the new `/model-card` chip is present in the sibling-link strip and resolves to `/model-card` in the `ROUTES` allow-list, and assert the four existing sibling chips (`/subprocessors`, `/uptime`, `/ethics`, `/security`) are still present with unchanged text (mirror-source additive-only guard).
- [ ] Standard box: no `/api/` change, no new hostname (every `vendorPolicyUrl` points to a vendor domain already listed in `src/data/subprocessors.ts`; the implementer greps `subprocessors.ts` first to confirm), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any of the six existing trust pages (`Trust.tsx`, `Uptime.tsx`, `Ethics.tsx`, `Subprocessors.tsx`, `Security.tsx`, `Playbook.tsx`, `HowWeShip.tsx`) beyond the additive one-chip edit on `Trust.tsx`. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; every pre-existing trust-page spec (`trust-page.spec.ts`, `trust-aboutpage-jsonld.spec.ts`, `subprocessors.spec.ts`, `security-posture-page.spec.ts`, `ethics-page.spec.ts`, `uptime-*.spec.ts`, `playbook-*.spec.ts`, `how-we-ship-*.spec.ts`) stays green because the model-card chip added on `Trust.tsx` is a purely additive sibling element.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- No `/api/` changes, no
  `package.json` changes, no
  em-dashes in copy, dark-mode
  required (this ticket ships
  one new page plus one new
  data file plus one new route
  plus one new spec plus two
  JSON-LD blocks plus one
  additive chip on Trust.tsx).
- A model-card entry for the
  homepage `content.json` copy
  generation, the changelog
  entry generator, or any
  internal-tooling AI model
  not called in production
  visitor flows. The card
  scopes to production
  visitor-facing AI calls
  only; internal-tooling
  models (Claude Code, the
  agent-fleet review model)
  are out of scope because
  they never touch a visitor.
- A public `training data
  usage` or `evaluation
  benchmarks` section. Both
  are vendor properties, not
  Digital Craft properties;
  the row's `vendorPolicyUrl`
  outbound link is sufficient
  to hand off that concern.
- A comparative table
  ("OpenAI vs Anthropic")
  ranking model families.
  Comparative rankings are
  vendor-loaded and non-
  defensible; the page names
  what THIS site calls
  without asserting one
  model is superior.
- Emitting a
  `SoftwareApplication` or
  `Product` JSON-LD block
  for each model. Neither
  `@type` fits a third-party
  model on this site;
  `CollectionPage` plus
  `ItemList` mirrors the
  ticket 0069 subprocessors
  precedent.
- Cross-promoting `/model-card`
  from the homepage hero, the
  navbar, the footer, or any
  demo page. Cross-surface
  promotion is its own
  follow-up ticket once
  telemetry shows the page
  earns organic traffic. The
  ONE additive chip on
  `/trust` is the only
  cross-link in scope.
- A per-model efficacy
  claim ("GPT-4o answers
  95% of lead questions
  correctly"). Efficacy
  claims are non-defensible
  per the AGENTS.md rule
  and are the exact
  vendor-loaded language
  the page is built to
  displace.
- Adding `/model-card` to
  the `index.html` SEO
  Pilot `pages` table.
  That is its own SEO-
  hygiene ticket and
  applies uniformly to
  every trust-family
  route per the 2026-05-25
  SEO Pilot lesson.
- A blog post about "our
  AI model card." Blog
  content ships through
  the `src/data/blogPosts.ts`
  pipeline and is gated by
  `check-blog-dates`;
  cross-promotion is its
  own content ticket.
- A downloadable PDF or
  JSON export of the model
  card. The page is a
  static public URL; a
  machine-readable export
  is its own follow-up
  ticket (parallel to the
  ticket 0082 evaluation-
  dossier export pattern).
- Adding a "request an
  update" or "flag a model
  change" form on the page.
  Buyer-side feedback is
  handled through the
  existing strategy-call
  path; a page-scoped form
  fragments the funnel.
- Editing the six existing
  trust-page files beyond
  the additive one-chip
  edit on `Trust.tsx`. No
  reordering, no visible-
  text changes, no schema
  changes.
- Adding a per-row
  outbound link to a
  Wikipedia page or a
  research paper about
  the model. The
  `vendorPolicyUrl` field
  is scoped to the
  vendor's OWN model card
  or usage policy; third-
  party references are
  out of scope.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/data/modelCard.ts`
  (under 200 lines). Export
  `ModelCardRow` interface and
  `MODEL_CARD_ROWS` constant.
  Per the 2026-09-12 code-
  beats-prose lesson, BEFORE
  writing this file grep
  `CLAUDE.md`,
  `KNOWLEDGE_BASE.md`, every
  `src/utils/*.ts`, and every
  `/api/*.ts` for model-name
  literals; pin the row list
  to the models ACTUALLY
  called on branch head. If
  a model in this ticket's
  inline list has been swapped
  or removed between 2026-09-20
  and the implementation start,
  note the deviation in the
  Implementation log with the
  file:line of the real source.
- Every `vendorPolicyUrl`
  points to a vendor domain
  already listed in
  `src/data/subprocessors.ts`
  (ticket 0069). The
  implementer greps that file
  first and confirms the
  domain overlap in the
  Implementation log; the
  `check-links` gate then
  validates every URL
  resolves.
- New `src/pages/ModelCard.tsx`
  (under 200 lines). Copy
  `src/pages/Security.tsx`
  (ticket 0081, the direct
  peer for a trust-family
  public page backed by a
  `src/data/` typed constant
  emitting `CollectionPage`
  plus `BreadcrumbList`)
  end-to-end as the starting
  frame, then swap every
  "Security" / "security
  controls" string for the
  model-card equivalent. Keep
  the same module-level
  mirror-source constants:
  `PAGE_H1`, `PAGE_URL`,
  `META_DESCRIPTION`,
  `COLLECTION_PAGE_NAME`,
  `BREADCRUMB_SCHEMA`,
  `COLLECTION_PAGE_SCHEMA`
  (per the 2026-05-25
  mirror-source rule the
  description used in the
  Helmet meta tag AND the
  `CollectionPage` JSON-LD
  description MUST read
  from the same
  `META_DESCRIPTION`
  constant). Each row card
  carries a matching `id`
  attribute so the fragment
  URL emitted in the
  `ItemList.itemListElement`
  entries resolves in-page.
- `src/App.tsx` - add
  `<Route path="/model-card" element={<ModelCard />} />`
  next to the existing
  `/security` route,
  wrapped in the existing
  `<Suspense fallback={<RouteFallback />}>`
  shell and lazy-imported
  via
  `React.lazy(() => import('./pages/ModelCard'))`
  per the 2026-09-05
  route-code-splitting
  lesson.
- `src/data/routes.ts` -
  add `/model-card` to the
  `ROUTES` array
  alphabetically per the
  file's ordering
  convention.
- `src/pages/Trust.tsx` -
  ONE additive edit: append
  a new sibling-link chip
  pointing at `/model-card`
  next to the existing
  `/subprocessors`,
  `/uptime`, `/ethics`,
  `/security` chips. No
  reordering of existing
  chips, no visible-text
  changes to any existing
  chip. The mirror-source
  rule protects the four
  existing chip labels;
  the additive edit adds a
  fifth chip with the
  label "Model card."
- Per the 2026-05-30
  second-@type lesson,
  BEFORE writing code grep
  every
  `tests/e2e/*-jsonld.spec.ts`
  for `=== 'CollectionPage'`
  AND `=== 'BreadcrumbList'`
  predicates AND any
  `toHaveLength(1)` /
  "exactly one" assertions
  over those types.
  Predecessor CollectionPage
  candidates as of
  2026-09-20: ticket 0048
  `/compare` hub, ticket 0057
  `/case-studies` hub, ticket
  0069 `/subprocessors`,
  ticket 0071
  `/ai-for-hospitality`,
  ticket 0079 `/blog`,
  ticket 0081 `/security`.
  Each predecessor spec is
  URL-scoped to its own
  page so the sibling on
  `/model-card` cannot
  collide. The grep result
  is documented in the
  Implementation log.
- Per the 2026-09-08 em-
  dash-JSON-LD-block-filter
  lesson, the em-dash check
  in the spec scopes ONLY to
  the two blocks THIS page
  emits (`CollectionPage`,
  `BreadcrumbList`) filtered
  by their `@type`, NOT to
  every `application/ld+json`
  block on the page. The
  homepage Organization
  block from `index.html`
  carries a legitimate
  em-dash and must not be
  flagged by the
  /model-card spec.
- Per the 2026-05-25 SEO
  Pilot lesson,
  `/model-card` is NOT in
  the `index.html` SEO
  Pilot pages table; the
  new spec asserts the
  Helmet-managed
  `meta[name="description"]`
  content directly (LAST
  `meta[name="description"]`
  per the 2026-05-25
  Helmet-appends lesson),
  NOT `page.toHaveTitle()`.
- Per the 2026-09-12 code-
  beats-prose lesson, if
  the model list in
  `MODEL_CARD_ROWS`
  deviates from this
  ticket's inline list
  (because the code has
  swapped or added a model
  since 2026-09-20), the
  implementer pins the row
  list to the actual
  models on branch head
  and notes the deviation
  in the Implementation
  log with the file:line
  of the real source.
- Per the 2026-05-07
  em-dash Hard NO, every
  string in every touched
  file is hyphen-only.
  Self-Review greps the
  diff for
  `String.fromCharCode(8212)`
  before pushing.
- Per the 2026-09-05
  route-fallback and
  2026-09-10 mount-signal
  lessons, the new spec's
  `gotoModelCard` helper
  waits for RouteFallback
  detach AND the H1 to be
  visible before reading
  page state. The sibling-
  page-regression case
  that navigates to `/trust`
  also uses a
  RouteFallback-aware
  goto helper.
- Per the 2026-05-22
  two-PR ship lesson, ship
  will need a follow-up
  `chore/0088-ship-status`
  PR after the feat PR
  merges to flip the
  ticket frontmatter AND
  its
  `docs/backlog/README.md`
  index row to `shipped`
  together; run
  `node scripts/check-backlog.mjs`
  before pushing the
  second PR so the file
  and index never drift
  mid-flip.
- New deps: NO. The page
  reuses `react-router-dom`,
  `react-helmet-async`,
  `lucide-react`, the
  existing Navbar / Footer /
  ScrollProgress components,
  the existing
  `trackCTAClick` helper,
  and the existing
  `useContent` hook. Schema
  migration: no. Privacy /
  security surface change:
  NO - the page is a
  passive read-only
  surface with no
  persistent store, no
  network call to any new
  hostname, no visitor
  input capture. Every
  outbound `vendorPolicyUrl`
  points to a vendor
  domain already listed
  in `subprocessors.ts`.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-20 - branch `feat/0088-model-card-ai-provenance-page` opened; status flipped to in-progress.
- 2026-09-20 - Predecessor JSON-LD grep (2026-05-30 second-@type lesson):
  `grep -rn "=== 'CollectionPage'" tests/e2e/` returned 10 matches across
  `tests/e2e/compare-hub.spec.ts`, `case-studies-hub.spec.ts`,
  `case-studies-rss-feed.spec.ts`, `subprocessors.spec.ts`,
  `security-posture-page.spec.ts`, `ai-for-hospitality.spec.ts`,
  `blog-collectionpage-jsonld.spec.ts`, `compare-kvcore.spec.ts` - every
  "exactly one CollectionPage" assertion is URL-scoped to its own page
  (`on /compare`, `on /case-studies`, `on /security`, etc.), so a new
  /model-card-scoped CollectionPage does not collide. Same URL-scoped
  isolation holds for the 30+ `=== 'BreadcrumbList'` matches. No
  predecessor asserts "exactly one CollectionPage site-wide" or filters
  without URL scoping. Result: the /model-card sibling CollectionPage +
  BreadcrumbList blocks are safe additions.
- 2026-09-20 - Model-name literal grep (2026-09-12 code-beats-prose lesson):
  `grep -rniE "gpt-4o|nova-?2|firecrawl|jina|vapi|elevenlabs|cassidy|deepgram" src/utils/ api/ CLAUDE.md KNOWLEDGE_BASE.md`
  showed the models actually called on branch head are:
  (1) `gpt-4o` (OpenAI) at `api/chat.ts:19`, `api/stream.ts:25`,
  `api/vapi-assistant.ts:28`, `api/call-summary.ts:29`;
  (2) `eleven_turbo_v2_5` (ElevenLabs Turbo v2.5) with the Cassidy voice
  id `56AoDkrOh6qfVPDXZ7Pt` at `api/vapi-assistant.ts:36`;
  (3) `nova-2` (Deepgram Nova-2) at `api/vapi-assistant.ts:53`;
  (4) Vapi voice orchestration layer at `api/vapi-call.ts`, `vapi-call-status.ts`,
  `vapi-call-end.ts`, `vapi-assistant.ts`;
  (5) Firecrawl scraper at `api/scrape.ts:19`;
  (6) Jina Reader fallback at `api/scrape.ts:42`.
  This matches the ticket's inline enumeration verbatim; the initial
  MODEL_CARD_ROWS list pins to these six vendors with no deviation.
- 2026-09-20 - Subprocessor domain overlap grep: every candidate
  `vendorPolicyUrl` (openai.com, vapi.ai, elevenlabs.io, deepgram.com,
  firecrawl.dev, jina.ai) has a matching row in `src/data/subprocessors.ts`
  under `publicTrustUrl`, so no new outbound hostname is introduced.
- 2026-09-20 - Trust.tsx chip strip inspection: the current strip contains
  a single chip (`trust-ethics-link` -> /ethics with text "What we won't do")
  at src/pages/Trust.tsx:438-452. The ticket prose names four existing
  chips (/subprocessors, /uptime, /ethics, /security) but the code only
  has the ethics one plus an inline paragraph link (`trust-subprocessors-link`)
  higher up. Per the 2026-09-12 code-beats-prose rule, the additive edit
  appends only the /model-card chip and the spec's regression case
  asserts the /ethics chip stays unchanged (the only existing chip to
  guard against reordering); the /subprocessors inline link is also
  asserted unchanged.
- YYYY-MM-DD - failing test added in `tests/e2e/model-card-page.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
