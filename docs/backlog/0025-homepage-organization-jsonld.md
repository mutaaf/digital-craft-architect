---
id: 0025
title: Emit Organization JSON-LD with sameAs and contactPoint on the homepage
status: groomed
priority: P1
area: seo
created: 2026-05-30
owner: gtm-innovation
---

## User story

As Google's entity-recognition crawler arriving at `digitalcraftai.com/`,
I want one canonical `Organization` JSON-LD block on the homepage that
names DigitalCraft AI, links its public LinkedIn and Calendly profiles
via `sameAs`, and exposes the published phone number as a `contactPoint`,
so that knowledge-panel eligibility, brand-name SERP enrichment, and
entity-disambiguation from other "Digital Craft" companies all stop
depending on Google guessing from scattered footer links.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the site already publishes
every signal a valid `Organization` block needs, but in unstructured
form scattered across the codebase. The public phone number
`(972) 352-3293` is hard-coded in `src/components/Footer.tsx` line 125,
the LinkedIn URL is in `public/content.json` line 257
(`https://linkedin.com/in/mutaaf`), the Calendly URL is in the same
block plus 30+ inline `href="https://calendly.com/mutaaf"` CTAs across
landing pages, and the brand name and logo are already used in the
existing `BlogPosting` schema's `publisher` field
(`src/pages/BlogPost.tsx` lines 57 to 63). The homepage emits no
`Organization` JSON-LD today (verified: grep for `"Organization"|sameAs`
in `src/pages/Index.tsx` returns nothing in the schema-emitting
block at lines 108 to 131). One inline `<script type="application/ld+json">`
block in the homepage Helmet head, sourced from these existing
strings, makes the entity legible to crawlers in one render.

### Stakeholder

This deepens the SEO moat in a way that compounds across every brand-
name query and every page that links back to `/`. Google's knowledge
panel and rich-result eligibility both prefer entities with a clear
`Organization` graph; the absence of one is why a search for
"DigitalCraft AI" today returns a generic blue-link result instead of
a brand-name SERP card with the right logo, Calendly link, and phone.
The `sameAs` array (LinkedIn, Calendly, the Texas locations page,
optionally a future GitHub or X handle) is the canonical entity-
disambiguation surface; without it Google has to infer the entity from
scattered footer anchors. Unlike a per-page schema add, this ticket
ships once on `/` and feeds every brand-name query the site receives.

### Visitor (in the real moment of use)

Indirect for the on-page visitor; the win is the visitor who finds the
site sooner via a brand search because Google now resolves
"DigitalCraft AI" to a single entity with a phone number and
scheduling link visible directly in the SERP. The four-lens visitor
check here is: a prospect who heard the brand name on a podcast and
searches it on their phone sees the Calendly link rendered as a
sitelink or knowledge-panel CTA on the result page, one tap closer to
booking than today. No on-page behavior change, no new chrome, no
performance cost (one `<script>` tag, body size in the low hundreds
of bytes).

### Growth

The "show me" moment is a "site:digitalcraftai.com" check in Google
Rich Results Test (or a search for "DigitalCraft AI" on a clean
browser) that returns a parsed `Organization` entity with name, URL,
logo, phone, and the LinkedIn sameAs link. That asymmetry (their
brand check takes 5 seconds, the answer comes back as a structured
entity instead of a guess) is the same lever ticket 0016 (WebSite +
SearchAction) and 0012 (FAQPage) named for structured-data wins. It
also tightens the funnel for cold inbound: a prospect who pastes
"digitalcraft ai linkedin" into Google lands on the right LinkedIn
profile faster.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] The homepage at `/` emits exactly one new `<script type="application/ld+json">` block whose parsed JSON has `@context: "https://schema.org"` and `@type: "Organization"`. The block lives inside the existing `<Helmet>` block in `src/pages/Index.tsx` lines 108 to 131, not as a `useEffect` DOM injection. The existing WebSite/SearchAction JSON-LD from ticket 0016 is untouched.
- [ ] The emitted Organization object contains: `name: "DigitalCraft AI"`, `url: "https://digitalcraftai.com"`, `logo: "https://digitalcraftai.com/og-default.png"` (the same logo URL the existing `BlogPosting` publisher uses in `src/pages/BlogPost.tsx` line 63 - sourced from one shared constant, not duplicated), and `description` matching `content.seo.description` (so a future copy edit on the homepage description does not leave the schema stale).
- [ ] The `sameAs` field is a non-empty array containing at least `"https://linkedin.com/in/mutaaf"` and `"https://calendly.com/mutaaf"` (the two public profiles already linked from `public/content.json` footer.socialLinks). The array MUST NOT contain a URL that does not actually resolve to a public DigitalCraft AI profile; a test asserts each URL also appears somewhere in `public/content.json` OR in a rendered footer anchor so the schema cannot drift past what the site actually links to.
- [ ] The `contactPoint` field is an array containing one entry with `@type: "ContactPoint"`, `telephone: "+1-972-352-3293"` (E.164 format, matching the already-published number at `src/components/Footer.tsx` line 125 `tel:+19723523293`), `contactType: "sales"`, and `areaServed: "US"`. The same phone string is sourced from one constant shared by the schema and any test assertion (per the 2026-05-25 mirror-source lesson).
- [ ] The block contains zero em-dash characters in any string value, parses as valid JSON via `JSON.parse` on the script tag text, and a Playwright spec navigates to `/`, queries `script[type="application/ld+json"]`, parses each block, and asserts exactly one of them has `@type === "Organization"` (the existing WebSite block has `@type === "WebSite"`, so the assertion is non-ambiguous).
- [ ] No new hostnames in the page (the LinkedIn/Calendly/phone URIs are already rendered elsewhere on `/`), no `/api/` change, no new npm dependency, no edits to `package.json` / `package-lock.json`. `node scripts/check-backlog.mjs` stays green, the existing `check-meta` and `check-links` scripts stay green, and `npm run typecheck` stays clean.

## Out of scope

- Adding an `Organization` block to any page other than `/`. Per
  schema.org guidance and the WebSite/SearchAction precedent in ticket
  0016, the homepage is the canonical surface for the entity block;
  per-page repetition is noise and risks divergence.
- Editing the existing `BlogPosting` publisher field in
  `src/pages/BlogPost.tsx` to point at the new shared logo constant
  beyond the minimum needed to share the one logo URL. A broader
  refactor of every page's schema-emitter into a shared util is its
  own ticket (it touches 21+ files per the earlier grep).
- Adding a `founder` field, employee count, address, or any other
  schema field the site cannot defensibly back from existing public
  copy. The Hard NO on hypey/fabricated claims applies to JSON-LD
  strings too.
- Adding a second `sameAs` link to a GitHub, X, YouTube, or other
  social profile that the footer does not already render. If the
  footer adds a profile later, a follow-up ticket adds it to the
  schema then.
- Adding `aggregateRating` or `review` schema; testimonials on the
  site are first-party only and we do not publish a fabricated
  aggregate score.
- Adding the homepage to a future `LocalBusiness` schema (the site
  serves nationally and does not publish a single office address).
- Renaming or restructuring the existing homepage `<Helmet>` block,
  the `content.seo` shape, or the `public/content.json` footer
  socialLinks object. The ticket only ADDS one script tag and
  optionally one tiny shared constant module.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- `src/pages/Index.tsx` lines 108 to 131 - the existing `<Helmet>`
  block already emits canonical, OG, Twitter, and meta tags. Add one
  `<script type="application/ld+json">{JSON.stringify(ORGANIZATION_SCHEMA)}</script>`
  child right before `</Helmet>`. The `ORGANIZATION_SCHEMA` const is
  defined at module top-level (outside the component) so React does
  not re-stringify on every render. Pattern reference: the inline
  schema emission in `src/pages/BlogPost.tsx` line 40 and
  `src/pages/AiForHvac.tsx` lines 123 to 124.
- `src/data/organizationSchema.ts` (new, small) - source the four
  shared strings (`ORG_NAME`, `ORG_URL`, `ORG_LOGO`, `ORG_PHONE_E164`)
  here as exported consts, then export the `ORGANIZATION_SCHEMA`
  object built from them. This satisfies the 2026-05-25 mirror-source
  lesson: the schema and the test (and any future page that imports
  the same constants) read from one array. Keep the file under 40
  lines; this is a data module, not a new component. Existing
  precedent: `src/data/blogPosts.ts`, `src/data/caseStudies.ts`.
- The `description` field in `ORGANIZATION_SCHEMA` is built at render
  time from `content.seo.description` so a homepage copy edit cannot
  leave the schema stale. Wire it inline:
  `const schema = { ...ORGANIZATION_SCHEMA, description: content.seo.description }`
  inside the component, then stringify into the script tag. Do NOT
  inline a duplicate description literal in the schema file.
- The phone constant `ORG_PHONE_E164 = "+1-972-352-3293"` is the
  E.164-formatted version of the `tel:+19723523293` href already at
  `src/components/Footer.tsx` line 125. A test asserts the digits
  match (both contain `9723523293`) so a future phone-number change
  in the footer will fail the test until the schema constant is
  updated in the same PR.
- The two `sameAs` URLs are read from one shared array in
  `src/data/organizationSchema.ts`: `SAME_AS_URLS = ["https://linkedin.com/in/mutaaf", "https://calendly.com/mutaaf"]`.
  A test asserts each entry of this array also appears as a value in
  `public/content.json`'s `footer.socialLinks` map (the JSON parsed
  at test setup), guarding against the schema diverging from what
  the footer actually links to.
- Per the 2026-05-07 em-dash Hard NO, run a grep over the diff for
  the em-dash character before pushing; the schema description
  comes from `content.seo.description` so if THAT contains an
  em-dash the test catches it as a brand-voice defect that must be
  fixed at the source (per the 2026-05-25 mirror-source repair-at-source
  lesson, this is in-scope punctuation repair, not rewording).
- `tests/e2e/homepage-organization-jsonld.spec.ts` (new) - one spec
  per acceptance box, modeled on
  `tests/e2e/website-sitelinks-jsonld.spec.ts` (the closest existing
  precedent for homepage JSON-LD assertions). Spec navigates to `/`,
  reads all `script[type="application/ld+json"]` elements, parses
  each, finds the one with `@type === "Organization"`, and asserts
  `name`, `url`, `logo`, `sameAs` contents, `contactPoint[0].telephone`
  digits, and `description` matches the rendered
  `meta[name="description"]` content. Also asserts no em-dash
  character appears in the JSON text and that the page still emits
  the existing `WebSite` block (regression check for ticket 0016).
- Per the 2026-05-28 inline-assertion-in-the-gated-script lesson, the
  shared-constant invariants (phone digits match the footer tel href,
  each sameAs URL appears in content.json) CAN ALSO be encoded as a
  build-time assertion inside `scripts/check-meta.ts` if the dev
  prefers a non-Playwright path - that script already runs in the
  local gate. Either path is acceptable; Playwright is the simpler
  default since it can also verify the rendered DOM.
- Per the 2026-05-22 two-PR ship lesson, ship will need a follow-up
  `chore/0025-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter AND its `docs/backlog/README.md` index row to
  `shipped` together. Do not skip the second PR.
- New deps: no. Schema migration: no. Privacy/security surface change:
  no (every URL and phone digit in the schema is already publicly
  rendered on `/`; this ticket only restates them as structured data).
  Per the AGENTS.md Hard NO, this ticket does not touch `/api/`,
  `.env*`, `package.json`, or `package-lock.json`.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- YYYY-MM-DD - branch `feat/0025-homepage-organization-jsonld` opened
- YYYY-MM-DD - failing test added in `tests/e2e/homepage-organization-jsonld.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
