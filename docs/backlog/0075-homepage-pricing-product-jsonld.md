---
id: 0075
title: Emit Product plus Offer JSON-LD on the homepage pricing tiers section so the AI-services offer indexes as a structured artifact
status: shipped
priority: P2
area: seo
created: 2026-09-10
owner: gtm-innovation
---

## User story

As a search engine crawling the Digital Craft
homepage looking for structured pricing signals to
enrich the SERP result (a Google Shopping
Insights crawler indexing service-tier prices for
comparison snippets, a Bing crawler surfacing a
"starting at $X per month" rich result, a
peer-watching audience like a competing
AI-services agency using the `application/ld+json`
blocks on our homepage to benchmark our
positioning tiers), and as a prospect scanning
the SERP for "AI automation pricing for service
businesses" who benefits when a rich result shows
the actual starting price rather than a marketing
tagline, I want the homepage pricing tiers
section to emit a `Product` JSON-LD block with a
nested `offers` array whose values are derived
byte-identically from the same `content.pricingTiers`
data that renders the visible PricingTiers cards,
so that a copy edit to a tier price flows through
to both the visible card AND the structured data
in one render without hand-maintaining a second
source.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the homepage
pricing tiers section already renders three tiers
via `src/components/PricingTiers.tsx` reading from
the typed `content.pricingTiers: PricingTiersConfig`
constant defined in `src/hooks/useContent.ts` lines
99-115 (`{ headline, subheadline, tiers: PricingTier[] }`
with each tier carrying `name`, `price`, `period`,
`description`, `features`, `highlighted`, `badge`,
`ctaText`, `ctaLink`). The Helmet on `src/pages/Index.tsx`
lines 110-137 already emits an `Organization` JSON-LD
block (ticket 0025) sourced from
`src/data/organizationSchema.ts`. This ticket adds
ONE additional `<script type="application/ld+json">`
tag inside the SAME Helmet block, whose value is a
`Product` schema.org object with a nested
`offers: Offer[]` array constructed by
`content.pricingTiers.tiers.map(...)`. Zero new
component file, zero new dependency, zero new
data shape (the tier data already exists and is
already validated by the `PricingTier` interface),
zero new backend surface. The block is emitted
ONLY when `content.pricingTiers` is truthy, so a
homepage rendered without pricing (e.g. a
content.json missing the optional field) is
unaffected. Modeled structurally on
`src/pages/CompareHub.tsx` (ticket 0048, the
closest peer for "read from a typed data constant,
map into a JSON-LD ItemList") and on
`src/pages/Demos.tsx` (ticket 0030's
SoftwareApplication block on /demos).

### Stakeholder

This widens the moat in the structured-data
dimension where Digital Craft's homepage is
currently thin. The homepage today emits ONLY
`Organization` (ticket 0025) plus `WebSite` +
`SiteNavigationElement` (ticket 0016 in
`index.html`); there is no product-level or
offer-level structured signal despite three
visible pricing tiers rendering above the fold on
every visit. Google's Product rich-result
documentation supports service-tier pricing when
represented as a `Product` with nested `Offer`
entries carrying `price`, `priceCurrency`, and
`availability`. Emitting the block means a
peer-watching audience (competing AI-services
agencies benchmarking our positioning, an
analyst mapping the AI-services pricing
landscape, a Google Shopping Insights crawler)
sees the tier prices as first-class structured
data rather than only as rendered HTML the
crawler has to parse. Per the 2026-05-30
second-@type lesson, BEFORE writing code the
implementer greps every existing
`tests/e2e/*-jsonld.spec.ts` and
`tests/e2e/homepage-*.spec.ts` for
`=== 'Product'` AND `=== 'Offer'` predicates. If
zero matches exist, a new homepage-scoped
`Product` + nested `Offer` block cannot collide
with any predecessor "exactly one" predicate. If
any predecessor emits `Product` or `Offer`
anywhere on the site, the implementer widens the
predecessor's assertion in the SAME PR by
identifying its block via a unique field (e.g.
its own `name` or `url`) rather than by
"the only Product block."

### Visitor (in the real moment of use)

A SERP for "AI automation pricing for construction
companies" or "AI receptionist pricing service
businesses" surfaces the homepage with a rich
result that includes a "starting at" price
scraped from the new `Product` JSON-LD block.
The prospect who taps the listing lands on the
homepage where the visible PricingTiers cards
render the exact same numbers (mirror-source
invariant), so the SERP-to-page transition is
frictionless: what the crawler indexed matches
what the visitor sees. On a homepage rendered
without pricing (a stub content.json), no rich
result is generated and the visitor sees the
same page they see today. No visible change in
either case; the value is entirely in the
crawlable metadata layer.

### Growth

The "show me" moment is the SERP screenshot: a
Digital Craft AI listing with a "$X per month"
starting-at chip beside the URL, competing on
the same rich-result surface as HubSpot,
GoHighLevel, Jobber, Housecall Pro, and the
other named-competitor entries the visitor is
seeing on the same SERP. That structured signal
is exactly the artifact a decision-maker
forwards to their partner when they compare
services on the SERP. Per the ticket 0025
Organization JSON-LD precedent (which added
`sameAs` and `contactPoint` to the homepage
because the prior state was thin), a
Product-plus-Offer emission is the next
structural step for the homepage's crawlable
metadata: it converts three rendered pricing
cards from HTML the crawler has to guess about
into first-class structured data.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] `src/pages/Index.tsx` gains ONE additional `<script type="application/ld+json">` tag inside the existing `<Helmet>` block (lines 110-137), emitted ONLY when `content.pricingTiers` is truthy. The value is a `Product` schema.org object with `@context: 'https://schema.org'`, `@type: 'Product'`, `name` (a new module-level constant, suggested "Digital Craft AI Automation"), `description` (equal to `content.pricingTiers.subheadline` per the 2026-05-25 mirror-source rule so a subheadline edit flows through to the schema in one render), `brand: { '@type': 'Brand', name: 'Digital Craft AI' }`, `url: 'https://digitalcraftai.com'`, and a nested `offers: Offer[]` array whose length equals `content.pricingTiers.tiers.length` and whose entries are constructed via `content.pricingTiers.tiers.map((tier, i) => ({ '@type': 'Offer', name: tier.name, description: tier.description, price: String(tier.price), priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: tier.ctaLink, category: tier.period }))`.
- [ ] Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/*-jsonld.spec.ts` AND every existing `tests/e2e/homepage-*.spec.ts` for `=== 'Product'` AND `=== 'Offer'` predicates. The grep result is documented in the Implementation log. If ANY predecessor predicate is site-wide (an "exactly one Product block" assertion that scans every JSON-LD script on the DOM), the implementer widens that predecessor's assertion in the SAME PR by identifying its block via a unique field (`name`, `url`, or a specific `@id`) rather than by "the only Product block." Per the 2026-09-08 subprocessors-em-dash lesson, the new spec's em-dash check filters the block list down to blocks THIS page owns (Product plus its nested Offers) BEFORE iterating; it does NOT scan every JSON-LD block on the DOM (that would trip the shipped homepage Organization block from `index.html`, which contains a legitimate em-dash in its description string).
- [ ] The new `Product` block and every nested `Offer` object contain zero em-dash characters (`U+2014`) in any JSON-LD string. Per the 2026-05-25 mirror-source-fix rule, if `content.pricingTiers.subheadline` or any `tier.description` / `tier.name` in the shipped content.json contains an em-dash, the fix is applied at the single source (content.json or the constant it comes from) so both the visible PricingTiers card AND the new JSON-LD Offer stay identical. The Self-Review greps the diff for `String.fromCharCode(8212)` before pushing; if a source em-dash is discovered, it is replaced with a hyphen or the sentence is restructured. The name constant "Digital Craft AI Automation" and the "Brand" name are hyphen-only.
- [ ] The new e2e spec at `tests/e2e/homepage-pricing-product-jsonld.spec.ts` (modeled on `tests/e2e/homepage-organization-jsonld.spec.ts` from ticket 0025) asserts: (1) `GET /` returns 200 and at least one `script[type="application/ld+json"]` block on the DOM parses as a `Product` object with `@type: 'Product'` AND `name: 'Digital Craft AI Automation'` (the unique-field selector per the 2026-09-08 lesson), (2) that block's `offers` array length equals 3 (matching the current tier count in the shipped content.json; the spec imports the count from the shipped content shape rather than hard-coding 3 if the test-environment can access the file, otherwise asserts `>= 2` to survive a future tier addition), (3) every `offers[i]` entry carries `@type: 'Offer'`, a numeric-string `price`, `priceCurrency: 'USD'`, and a `url` starting with `http`, (4) the block's `description` byte-matches the visible PricingTiers subheadline (`content.pricingTiers.subheadline` rendered as page text under `#pricing`), (5) no `String.fromCharCode(8212)` code point appears in the parsed Product block or any nested Offer string (scoped to THIS page's block only per the 2026-09-08 lesson, NOT the homepage Organization block from `index.html`), (6) sibling-page regression: navigating to `/` from `/compare` via SPA transition and re-running assertions (1)+(2)+(4) proves the block is stable across Helmet head swaps per the 2026-09-08 sibling-hub-poll lesson (the reader helper polls `page.locator('script[type="application/ld+json"]').evaluateAll` until at least one block's `name` equals `'Digital Craft AI Automation'` BEFORE reading and filtering).
- [ ] The existing homepage tests (`tests/e2e/homepage-organization-jsonld.spec.ts` from ticket 0025, `tests/e2e/website-sitelinks-jsonld.spec.ts` from ticket 0016, and `tests/e2e/utm-hero.spec.ts` from ticket 0001) stay green after the additive Helmet edit. The pre-code grep documents that each existing spec's JSON-LD predicates are filtered by `@type` and by a unique field (Organization by `contactPoint`, WebSite by `potentialAction`), so a new sibling `Product` block cannot collide. If any existing spec is a raw "all JSON-LD blocks on `/` filtered ONLY by `@type`" predicate that would break with a new `@type`, the implementer widens the predecessor in the SAME PR.
- [ ] The Product block is emitted ONLY when `content.pricingTiers` is truthy (the same guard the existing `{content.pricingTiers && <PricingTiers data={content.pricingTiers} />}` render uses on line 160 of `Index.tsx`); a homepage rendered from a content.json without pricing emits zero new blocks. The spec includes a "no-pricing-content" regression case that mocks `useContent` to return no pricing and asserts the Product block is absent (the case may need Playwright's `page.route` to stub the content.json response, or an environment-variable guard in the test-mode content loader; the implementer documents the technique used).
- [ ] Standard box: no `/api/` change, no new hostname (the block self-references `digitalcraftai.com` only), no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/components/PricingTiers.tsx` (the visible render), no edits to the content.json data file BEYOND fixing an em-dash at source if the mirror-source rule requires it. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the existing `tests/e2e/homepage-organization-jsonld.spec.ts` (ticket 0025), `tests/e2e/website-sitelinks-jsonld.spec.ts` (ticket 0016), `tests/e2e/utm-hero.spec.ts` (ticket 0001), and the full `tests/e2e/smoke.spec.ts` all stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- Standard anti-goals: no /api/ changes, no
  package.json changes, no em-dashes in copy,
  dark-mode required (this ticket only emits
  invisible JSON-LD; there is no new visible
  element that needs a dark: variant).
- Adding the `Product` block to every vertical
  page (`/construction`, `/realestate`,
  `/homeservices`, etc). Vertical pages render
  their pricing via inline sections, not via
  the shared `PricingTiers` component; scoping
  this ticket to the ONE page that actually
  renders `PricingTiers` (the homepage) keeps
  the diff under 200 lines. A per-vertical
  Product block is its own follow-up ticket
  once telemetry justifies the additional
  emissions.
- Adding an `AggregateOffer` block wrapping the
  three individual `Offer` entries. Nested
  `offers` on `Product` is the correct
  schema.org shape for "one product, three
  price points"; adding a wrapper AggregateOffer
  would duplicate the pricing metadata and risk
  a Google Search Console warning about
  redundant structured data.
- Adding `Review` or `AggregateRating` fields
  to the `Product`. Ratings require real
  first-party or third-party review data;
  fabricating a rating is a Hard NO per the
  AGENTS.md "no invented testimonials" rule.
  A rating field ships once a real
  first-party review surface exists on the
  site, not before.
- Editing the ticket 0025 `Organization` block
  or the ticket 0016 `WebSite` block. Both
  stay byte-identical; this ticket is purely
  additive.
- Emitting a `Service` block instead of
  `Product`. Both are valid schema.org types
  for a SaaS-style offering, but `Product`
  with nested `Offer` is the type Google's
  Product rich-result docs specifically call
  out for price snippets, and the tier data
  we have (name, price, description,
  features) maps cleanly to Product plus
  Offer. Switching to Service would delay
  the rich-result eligibility for no
  structural benefit.
- Adding a `hasMerchantReturnPolicy` or
  `shippingDetails` field to any Offer.
  These are physical-goods fields; a
  digital-service Offer without them is
  valid schema.org.
- Cross-promoting the new block from any
  vertical page or landing page. Structured
  data is per-URL by schema.org design;
  cross-URL emission of the same block
  creates canonical ambiguity.
- Adding `/` to any additional SEO Pilot
  table in `index.html`. The homepage is
  already in the SEO Pilot table per the
  2026-05-25 SEO Pilot lesson.
- Internationalization (`inLanguage` fields,
  multi-currency Offers). The homepage
  content is English and USD only; a
  multi-locale Product block is its own
  ticket once a non-English homepage
  variant exists.
- Fabricated availability, priceValidUntil,
  or lowPrice / highPrice fields. Every
  Offer field MUST map to a concrete value
  from `content.pricingTiers.tiers[i]`; no
  invented aggregation or rounding.
- Editing `src/data/organizationSchema.ts`
  or `src/data/routes.ts`. This ticket
  touches Helmet in `Index.tsx` and a new
  module-level constant only.
- A `productID` or `sku` field on the
  Product or its Offers. Digital Craft does
  not publish SKUs for its service tiers;
  a fabricated ID would misrepresent the
  artifact per the AGENTS.md
  conservative-claims rule.
- Adding a `SoftwareApplication` @type on
  the homepage (ticket 0030 already emits
  SoftwareApplication on `/demos`; adding
  a second on `/` would create the exact
  second-@type collision the 2026-05-30
  lesson warns against). This ticket
  emits `Product`, a distinct @type not
  currently emitted anywhere.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- `src/pages/Index.tsx` - add ONE new
  module-level constant (`PRODUCT_NAME =
  'Digital Craft AI Automation'`) and ONE
  additional `<script type="application/ld+json">`
  tag inside the existing `<Helmet>` block
  (lines 110-137, after the ticket 0025
  Organization script on line 136). The
  emission is guarded by
  `content.pricingTiers &&` matching the
  existing PricingTiers render guard on
  line 160. The `offers` array is derived
  via `content.pricingTiers.tiers.map(...)`
  so a tier addition or price change in
  content.json flows through automatically.
  No changes to
  `src/components/PricingTiers.tsx` (the
  visible render is byte-identical).
- Per the 2026-05-30 second-@type lesson,
  BEFORE writing code grep
  `tests/e2e/*-jsonld.spec.ts` AND
  `tests/e2e/homepage-*.spec.ts` for
  `=== 'Product'` AND `=== 'Offer'`
  predicates. Document the grep result in
  the Implementation log. If any existing
  spec has a site-wide "exactly one X
  block" predicate over a new @type, widen
  the predecessor's assertion in the SAME
  PR by identifying its block via a
  unique field.
- Per the 2026-09-08 subprocessors-em-dash
  lesson, the new spec's em-dash check
  filters the block list down to blocks
  THIS page owns (the new Product block
  identified by
  `name: 'Digital Craft AI Automation'`
  plus its nested Offers) BEFORE
  iterating. Never `for (const b of allBlocks)`
  on `/`; the shipped Organization block
  from `index.html` contains a
  legitimate em-dash and is not this
  ticket's concern.
- Per the 2026-09-08 sibling-hub-poll
  lesson, the sibling-page regression case
  extracts an
  `assertHomepageProductBlock(page)`
  helper that polls
  `page.locator('script[type="application/ld+json"]').evaluateAll`
  until at least one block's `name`
  equals `'Digital Craft AI Automation'`
  BEFORE reading and filtering blocks by
  `name`. Do NOT reuse a `count > 0` poll
  that fires before the Helmet head swap
  finishes.
- Per the 2026-05-25 mirror-source rule,
  the Product block's `description` reads
  from `content.pricingTiers.subheadline`
  (already used to render the visible
  subheadline text) and each Offer's
  `name` / `description` / `price` /
  `url` reads from the corresponding
  `tier.name` / `tier.description` /
  `tier.price` / `tier.ctaLink`. If any
  of those source strings contains a
  U+2014, the fix is applied at the
  single source (content.json or the
  hooks/useContent constant it comes
  from) so the visible card and the
  Offer stay identical.
- Per the 2026-05-07 em-dash Hard NO,
  the new `PRODUCT_NAME` constant, the
  brand name, and every string emitted
  into the block use hyphens.
  Self-Review greps the diff for
  `String.fromCharCode(8212)` before
  pushing.
- `tests/e2e/homepage-pricing-product-jsonld.spec.ts`
  (new) - one assertion per acceptance
  box. Model the spec on
  `tests/e2e/homepage-organization-jsonld.spec.ts`
  (ticket 0025, the direct peer for a
  homepage JSON-LD block emitted from
  Helmet). The no-pricing-content
  regression case uses Playwright's
  `page.route` to stub the content.json
  response with a copy that omits
  `pricingTiers`, then asserts the
  Product block is absent (the
  implementer documents the exact stub
  technique in the Implementation log).
- Per the 2026-05-28 "encode assertions
  in the gated script" lesson, this
  ticket does NOT need a script-level
  assertion because the Playwright spec
  runs in the existing `smoke-required`
  gating job. The spec-level
  assertions are the primary invariant.
- Per the 2026-05-22 two-PR ship lesson,
  ship will need a follow-up
  `chore/0075-ship-status` PR after the
  feat PR merges to flip the ticket
  frontmatter AND its
  `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs`
  before pushing the second PR so the
  file and index never drift mid-flip.
- New deps: NO. The block uses
  `react-helmet-async` already loaded
  by `Index.tsx`, `JSON.stringify`, and
  standard TypeScript types. Schema
  migration: no. Privacy / security
  surface change: no - the block
  contains only data already public on
  the visible pricing tiers cards.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-10 - branch `feat/0075-homepage-pricing-product-jsonld` opened from `origin/main`; ticket flipped groomed to in-progress in both frontmatter and `docs/backlog/README.md` in the same commit so `check-backlog.mjs` stays green.
- 2026-09-10 - pre-code grep of `tests/e2e/*-jsonld.spec.ts` and `tests/e2e/homepage-*.spec.ts` for `=== 'Product'` and `=== 'Offer'` predicates: ZERO matches. Broader `grep "Product\|Offer"` shows only `tests/e2e/demos-softwareapplication-jsonld.spec.ts` (scoped to `/demos`, filters via `SoftwareApplication.offers` field) and `tests/e2e/roi-calculator.spec.ts` (scoped to `/roi-calculator`, filters via `SoftwareApplication.offers`). Neither is a homepage predicate, neither is a site-wide "exactly one Product/Offer" assertion. No predecessor widening required. Existing homepage specs filter by unique fields already: Organization by `contactPoint` or `knowsAbout`, WebSite by `potentialAction`, SiteNavigationElement by `@type` scoped to nav blocks - so a new sibling `Product` block on `/` cannot collide.
- 2026-09-10 - content.json inspection: `pricingTiers.subheadline` = "Keep your AI systems running smoothly with ongoing support" (no em-dash); each tier `name`, `description` hyphen-only; three tiers (Basic, Plus, Premium); mirror-source em-dash fix NOT required.
- 2026-09-10 - failing spec added at `tests/e2e/homepage-pricing-product-jsonld.spec.ts` (one test per acceptance box), then Helmet edit landed in `src/pages/Index.tsx` (new `PRODUCT_NAME` constant plus one JSON-LD script tag, guarded by `content.pricingTiers &&`). No-pricing-content regression case uses Playwright's `page.route` to intercept `/content.json` and return a copy with `pricingTiers` deleted.
- 2026-09-10 - PR #N opened, CI [state]
- 2026-09-10 - merged to main
