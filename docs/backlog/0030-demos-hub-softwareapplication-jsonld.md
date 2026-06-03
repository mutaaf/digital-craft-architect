---
id: 0030
title: Emit SoftwareApplication JSON-LD on the /demos hub
status: groomed
priority: P1
area: seo
created: 2026-06-03
owner: gtm-innovation
---

## User story

As Google's rich-results crawler arriving at `digitalcraftai.com/demos`,
I want one canonical `SoftwareApplication` JSON-LD block that names
the Digital Craft AI demo platform, points its `applicationCategory`
at `BusinessApplication`, surfaces a free price for the demos
themselves, and links back to the `Organization` entity from ticket
0025, so that brand-name SERP cards and "AI demo" rich-result
eligibility stop depending on Google guessing from the existing
`ItemList` plus scattered `BlogPosting` references.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the `/demos` hub already
emits a perfectly good `ItemList` block (ticket 0011) listing every
demo route. What `ItemList` does NOT do is tell Google that the
whole catalog is a single software application a buyer can evaluate
free. Adding one `SoftwareApplication` script tag inside the same
`<Helmet>` block in `src/pages/Demos.tsx` reuses the existing
`ORGANIZATION_SCHEMA` constants from ticket 0025 for `provider`,
sources `applicationCategory` and `operatingSystem` from facts the
site already publishes, and ships in under 40 lines of diff. Nothing
new is computed; the catalog is simply restated as a software
entity.

### Stakeholder

This deepens the SEO moat in the same compounding way the
`Organization` block from ticket 0025 deepened the homepage. A
typed `SoftwareApplication` entity is the Google-preferred shape
for any vendor selling a product a buyer can try free, and the
`offers.price = "0"` field is the canonical signal for "evaluate
without a credit card." Combined with the existing `ItemList`,
crawlers now see both the catalog and the product behind it, which
is the dual-schema posture rich-result eligibility actually rewards.
The block also gives a clean seam for a future `aggregateRating`
add once real demo-session metrics exist (deliberately out of scope
here per the AGENTS.md "no fabricated aggregate scores" rule).

### Visitor (in the real moment of use)

Indirect for the on-page visitor; the win is the visitor who finds
the site sooner via a search like "free AI demo for contractors"
because Google now resolves the `/demos` hub to a structured
`SoftwareApplication` entity with a free price and a named provider
instead of a generic blue-link result. No on-page behavior change,
no new chrome, no performance cost (one inline `<script>` tag,
body size in the low hundreds of bytes).

### Growth

The "show me" moment is the Google Rich Results Test response for
`https://digitalcraftai.com/demos`: today it parses one `ItemList`
and stops; with this ticket it parses both an `ItemList` AND a
`SoftwareApplication` with the provider entity linked to the same
URL as the homepage `Organization` block, which is the single
screenshot a salesperson can paste into a "your structured data is
weak" outbound thread. Each rich-result win on a brand-adjacent
query (`"AI demos for construction"`, `"home services AI tool"`)
compounds because the catalog page already ranks for those long-tail
shapes from tickets 0017, 0020, 0024.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] `src/pages/Demos.tsx` emits exactly one new `<script type="application/ld+json">` block inside the existing `<Helmet>` whose parsed JSON has `@context: "https://schema.org"` and `@type: "SoftwareApplication"`. The block lives next to the existing `ItemList` script tag, not as a `useEffect` DOM injection. The existing `ItemList` block from ticket 0011 is untouched.
- [ ] The emitted SoftwareApplication object contains: `name: "Digital Craft AI Demos"`, `url: "https://digitalcraftai.com/demos"`, `applicationCategory: "BusinessApplication"`, `operatingSystem: "Web"`, `description` matching the page's rendered `meta[name="description"]` content (so a future copy edit on the Demos hub description does not leave the schema stale), and `provider` set to an inline reference of the form `{ "@type": "Organization", "name": ORG_NAME, "url": ORG_URL }` sourced from `src/data/organizationSchema.ts` constants (no new copies, mirror-source rule per the 2026-05-25 lesson).
- [ ] The `offers` field is a single `Offer` object with `@type: "Offer"`, `price: "0"`, `priceCurrency: "USD"`, and `availability: "https://schema.org/InStock"`. A test asserts the price string is exactly `"0"` (not the number `0`) so JSON-LD validators that require schema.org `Number`-as-string semantics accept it.
- [ ] A new e2e spec at `tests/e2e/demos-softwareapplication-jsonld.spec.ts` navigates to `/demos`, queries `script[type="application/ld+json"]`, parses each block, and asserts exactly one of them has `@type === "SoftwareApplication"` AND the existing `@type === "ItemList"` block is still present (regression check for ticket 0011 per the 2026-05-30 "second @type instance" lesson - widening any predecessor "exactly one block" assertion if grep finds one).
- [ ] The block contains zero em-dash characters (hyphens only, character `U+2014` is banned per the 2026-05-07 Hard NO) in any string value, parses as valid JSON via `JSON.parse` on the script tag text, and the new spec asserts `script.textContent` does not contain the em-dash code point (assert via `String.fromCharCode(8212)` in the test). Self-Review greps the diff for the U+2014 code point before pushing.
- [ ] The `/demos` page still renders in light AND dark mode on a 375px mobile viewport with no visible chrome change (the only new bytes are inside `<head>`, not the rendered body). A dark-mode regression case in the spec applies `document.documentElement.classList.add('dark')` and asserts the existing demo grid is unchanged.
- [ ] No new hostnames, no `/api/` change, no new npm dependency, no edits to `package.json` / `package-lock.json`. `node scripts/check-backlog.mjs` stays green, `npm run check-meta` stays green, `npm run check-links` stays green, and `npm run typecheck` stays clean.

## Out of scope

- Adding a `SoftwareApplication` block on any page other than
  `/demos`. The hub is the canonical surface for the application
  entity; per-vertical landing pages and per-demo pages keep their
  current schema posture.
- Adding `aggregateRating` or `review` to the SoftwareApplication
  object. No defensible aggregate exists yet (no public demo-session
  metric); inventing one violates the AGENTS.md "no inflated
  numbers" Hard NO. A future ticket can add it once real, citeable
  metrics exist.
- Adding `softwareVersion`, `releaseNotes`, or a link to a future
  changelog page. The changelog is a separate ticket; cross-linking
  it can be a follow-up once it ships.
- Editing the existing `ItemList` block on `/demos` (ticket 0011)
  to add `mainEntityOfPage` or merge it into the
  `SoftwareApplication`. Keep the two blocks distinct so a future
  edit to one cannot break the other; this also matches Google's
  preference for separate top-level entities.
- Adding the SoftwareApplication block to `index.html` as a static
  pre-render. It belongs to the `/demos` page surface, not the
  homepage, and the existing react-helmet-async pattern already
  emits it into the HTML at SSR-replacement time.
- Adding a `Service` schema with `offerCatalog` to the pricing page.
  That is a different surface and a different schema family; it
  belongs in its own ticket.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- `src/pages/Demos.tsx` - the page already wraps its head in a
  `<Helmet>` and emits the `ItemList` JSON-LD inline (per ticket
  0011). Add one more `<script type="application/ld+json">` child
  right after the `ItemList` script tag, built from a module-top
  `SOFTWARE_APPLICATION_SCHEMA` constant so React does not
  re-stringify on every render. Pattern reference: the
  `ORGANIZATION_SCHEMA` const usage in `src/pages/Index.tsx` line
  136 (ticket 0025).
- `src/data/organizationSchema.ts` already exports `ORG_NAME`,
  `ORG_URL`, and `ORG_LOGO` per ticket 0025. Import those names
  into `Demos.tsx` and use them for the `provider` inline reference;
  do NOT duplicate the literal strings. This is the 2026-05-25
  mirror-source rule applied: the homepage Organization entity and
  the demos SoftwareApplication entity share their identity from
  one constant module.
- The `description` field is built at render time from the page's
  existing meta description (already rendered into the `<Helmet>`
  via the local `META_DESCRIPTION` constant or
  `content.seo.demosDescription`-equivalent - grep `Demos.tsx` for
  the existing description literal and lift it to a module-top
  `DEMOS_META_DESCRIPTION` constant the schema can also read).
  Inline: `const schema = { ...SOFTWARE_APPLICATION_SCHEMA, description: DEMOS_META_DESCRIPTION }`,
  then stringify into the script tag. Do NOT inline a duplicate
  description literal in the schema constant.
- The 2026-05-30 "second @type instance" lesson applies here in
  inverse: this ticket adds a NEW `@type` distinct from the existing
  `ItemList`, but the implementer MUST still grep
  `tests/e2e/*-jsonld.spec.ts` for `=== 'SoftwareApplication'`
  and any "exactly one of every type" predicate over `/demos`
  BEFORE writing code. If the existing `tests/e2e/demos-index-hub.spec.ts`
  asserts "exactly one script tag" or "every block is ItemList,"
  widen that assertion in the SAME PR to allow the new
  SoftwareApplication block while still asserting the ItemList
  block is present (cite the lesson in the spec comment).
- The 2026-05-25 SEO Pilot lesson does NOT bite here because the
  ticket emits no `document.title` change; standard
  react-helmet-async head management is sufficient. The new spec
  asserts the JSON-LD content directly via
  `page.locator('script[type="application/ld+json"]').allTextContents()`
  rather than `toHaveTitle`.
- Per the 2026-05-07 em-dash Hard NO, every string in the schema
  object is a brand-name literal (no narrative copy); the only risk
  surface is the description sourced from `DEMOS_META_DESCRIPTION`.
  If grep finds an em-dash in that description, replace it with a
  hyphen at the single source per the 2026-05-25 mirror-source
  repair rule. Self-Review greps the diff for the em-dash character
  before pushing.
- `tests/e2e/demos-softwareapplication-jsonld.spec.ts` (new) - one
  spec per acceptance box, modeled on
  `tests/e2e/homepage-organization-jsonld.spec.ts` (ticket 0025's
  spec, the closest precedent for a multi-block JSON-LD assertion).
  Reads all `script[type="application/ld+json"]` elements, parses
  each, finds the `SoftwareApplication` block, asserts every
  required field, asserts the `Offer.price === "0"` string, asserts
  the `provider.url === ORG_URL`, asserts the `ItemList` block is
  still present, and asserts no em-dash character (`U+2014`) appears
  in the JSON text.
- Per the 2026-05-22 two-PR ship lesson, ship will need a follow-up
  `chore/0030-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter AND its `docs/backlog/README.md` index row to
  `shipped` together. Run `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index never drift mid-flip.
- New deps: no. Schema migration: no. Privacy/security surface
  change: no (every string in the schema is already publicly
  rendered on `/` or `/demos`; this ticket only restates them as
  structured data). Per the AGENTS.md Hard NO, this ticket does
  not touch `/api/`, `.env*`, `package.json`, or `package-lock.json`.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0030-...` opened
- YYYY-MM-DD - failing test added in `tests/e2e/demos-softwareapplication-jsonld.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
