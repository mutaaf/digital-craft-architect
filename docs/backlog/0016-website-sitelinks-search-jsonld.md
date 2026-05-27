---
id: 0016
title: Emit WebSite + SiteNavigationElement JSON-LD for sitelinks search box
status: shipped
priority: P1
area: seo
created: 2026-05-26
owner: gtm-innovation
---

## User story

As an owner Googling "DigitalCraft AI" or one of our vertical brand queries, I
want the search result to expose a Google sitelinks search box and a clean set
of named sub-page links, so that I can jump straight to the demo or industry
page I care about from the search result itself instead of landing on the
homepage and hunting for it.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: `index.html` already emits an inline
`Organization` JSON-LD block (lines 26-48), but it does not emit a `WebSite`
node with a `potentialAction` SearchAction (the exact schema Google uses to
decide whether to show the sitelinks search box) and it does not emit a
`SiteNavigationElement` block describing the primary nav. Both are pure static
JSON-LD additions to the same `index.html` head; no new copy, no new route, no
new component.

### Stakeholder

This widens the SEO moat at the cheapest possible price point. The
`WebSite` + `SearchAction` block is what unlocks the in-result search box for
brand queries (a real-estate-grade SERP feature competitors do not have on
their listings), and the `SiteNavigationElement` block tells Google the
canonical names and URLs of our hub pages (`/construction`, `/realestate`,
`/demos`, `/glossary`, `/industries`, `/ai-for-small-business`,
`/locations/texas`) so it can construct branded sitelinks under the homepage
result. Both compound for free every time a new vertical hub is added; both
ride the existing inline-JSON-LD pattern shipped with tickets 0011, 0012, and
0013.

### Visitor (in the real moment of use)

Nothing changes on screen for someone already on the site. The benefit is
upstream, at the moment a prospect types "digitalcraft ai" into Google on
their phone and sees the brand listing expand into a search box plus four or
five named hub links. That richer listing is the difference between one click
and a hunt.

### Growth

The "show me" moment is the Google result itself: a Digital Craft listing
that occupies more vertical space than competitors and routes a brand
searcher straight to the demo they care about. Brand-query CTR is the
cheapest demand the funnel has, and this ticket is the standard way to
expand the surface that demand lands on.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] `index.html` emits one `application/ld+json` block of type `WebSite` whose `url` is `https://digitalcraftai.com`, whose `name` matches the existing `Organization.name`, and whose `potentialAction` is a `SearchAction` with a `urlTemplate` of `https://digitalcraftai.com/glossary?q={search_term_string}` (reuses the existing crawlable glossary surface; no new route).
- [ ] `index.html` emits a second `application/ld+json` block whose top-level type is `SiteNavigationElement` (or an array of them) with one entry per primary hub: `/`, `/construction`, `/realestate`, `/events`, `/demos`, `/industries`, `/glossary`, `/ai-for-small-business`, `/locations/texas`; each entry has a `name` and an absolute `url`.
- [ ] Both new blocks are valid JSON when parsed (no trailing commas, no shell-escaped quotes) and contain no em-dash character in any string.
- [ ] The existing `Organization` JSON-LD block at lines 26 to 48 of `index.html` is unchanged byte-for-byte; the existing `<meta>` tags and the SEO Pilot per-route script are unchanged.
- [ ] `npm run check-meta` and `node scripts/check-backlog.mjs` stay green; the smoke suite stays green (no head-tag-count assertion regresses).
- [ ] No new hostnames enter the allow-list, no `/api/` change, no analytics removal; all URLs in both blocks stay on the existing `digitalcraftai.com` origin.

## Out of scope

- Building a real on-site search page or a search index; the `urlTemplate`
  reuses the existing crawlable `/glossary` page (which already has a jump-nav
  and is the natural answer surface for "what is X" queries) so the
  SearchAction resolves to a real page without new work.
- Adding `WebSite` or navigation schema to any per-route page; this ticket is
  the single global head-level emission in `index.html` only. Per-page schema
  (BreadcrumbList, ItemList, FAQPage, DefinedTermSet) stays where it is.
- Editing the navbar component itself; the schema lists the canonical hubs
  whether or not the visible nav happens to surface all of them today.
- Adding a `BreadcrumbList` block to demo routes (covered separately by
  ticket 0019).
- Changing the existing per-route SEO Pilot title/description table.

## Engineering notes

Files / patterns the dev should touch.

- `index.html` - the only file edited. Add the two new
  `<script type="application/ld+json">` blocks immediately after the existing
  `Organization` block (between lines 48 and 50, before the
  `<!-- SEO fixes by SEO Pilot -->` comment). Mirror the formatting of the
  existing block (top-level `@context`, two-space indent, one statement per
  line). Source the hub list from the `App.tsx` route table by hand-copy (do
  not import code into `index.html`); keep the list short and only include
  hubs that have meaningful SEO copy today.
- `WebSite` schema reference: type is `WebSite`, `url` is the homepage,
  `potentialAction` is `{ "@type": "SearchAction", "target": { "@type": "EntryPoint", "urlTemplate": "..." }, "query-input": "required name=search_term_string" }`.
- `SiteNavigationElement` schema reference: each entry is
  `{ "@type": "SiteNavigationElement", "name": "...", "url": "..." }`; emit
  either an array of entries in one script block or wrap them in a single
  `ItemList` of `SiteNavigationElement` items - pick whichever Google's
  Rich Results Test accepts; both are valid schema.org.
- `tests/e2e/` - add a spec that fetches `/` (or any route, since the head is
  the same), enumerates `script[type="application/ld+json"]` in the head,
  parses each, and asserts exactly one block has `@type === 'WebSite'` with
  the expected `potentialAction.target.urlTemplate`, and that at least one
  block exposes one `SiteNavigationElement` per expected hub URL. Mirror the
  parsing pattern already in `tests/e2e/glossary-definedtermset-schema.spec.ts`
  and `tests/e2e/pricing-faq-structured-data.spec.ts`.
- New deps: no. Schema migration: no. Privacy/security surface change: no
  (head-only static JSON, no new hostnames, no data collected).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-05-26 - branch `feat/0016-website-sitelinks-search-jsonld` opened; ticket
  + README index flipped to `in-progress` in the first commit per the two-PR
  ship contract (this PR carries the feat code; the ship-status flip is its own
  follow-up PR owned by the ship runner).
- 2026-05-26 - failing e2e added in `tests/e2e/website-sitelinks-jsonld.spec.ts`,
  five assertions covering boxes 1, 2, 3, 4, 6 (box 5 is the existing CI gate).
- 2026-05-26 - implementation landed: two static `<script type="application/ld+json">`
  blocks appended after the Organization block in `index.html` (WebSite +
  SearchAction targeting `/glossary?q={search_term_string}`, plus an array of
  nine SiteNavigationElement entries). Organization block at lines 26-48 stays
  byte-identical. Full local gate green; the new e2e spec passes 5/5 locally.
