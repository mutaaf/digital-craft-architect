---
id: 0011
title: Crawlable /demos index hub with ItemList structured data
status: proposed
priority: P2
area: seo
created: 2026-05-23
owner: gtm-innovation
---

## User story

As a search visitor looking for "AI demo" examples or a returning visitor who wants
to explore beyond one vertical, I want a single page that lists every live demo with
a short description and a direct link, so that I can find and try the relevant demo
without guessing demo-hub URLs.

## Why now (four lenses)

### Product Owner
The product has grown to 40+ demo routes across a dozen verticals (see the route
table in `src/App.tsx`), but there is no single page that lists them. The smallest
meaningful unit of value is one crawlable index page that links to each demo. It
makes the existing surface discoverable without building anything new behind it.

### Stakeholder
This widens the SEO and content moat. A `/demos` hub creates a dense internal-link
target that distributes crawl equity to deep demo routes that are otherwise only
reachable through per-vertical hubs, and it adds an `ItemList` structured-data block
so search engines can understand the catalog. As demos are added, the page (and the
moat) compounds with no extra work.

### Visitor (in the real moment of use)
A traditional-industry owner skimming on mobile sees a clean grid: each card names
the demo, its industry, and a one-line "what it does," with a tap-through to try it.
No hunting through nav menus or guessing routes; the whole product surface is one
scroll.

### Growth
The "show me" moment is the breadth: a single screen that proves the product is not
one trick but a dozen working AI tools. That catalog view is what a prospect skims
to decide the company is serious, and it is the page worth linking from an outbound
message ("here is everything you can try").

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new `/demos` route renders a page listing the live demos grouped or labeled by vertical, each with a title, a one-line description, and a working link to the demo route.
- [ ] Every link on the page resolves to an existing route (no dead links); `npm run check-links` stays green.
- [ ] The page emits one `application/ld+json` `ItemList` block whose items match the rendered demo links, following the existing JSON-LD pattern used on the vertical pages.
- [ ] The page has a canonical tag, title, and meta description via `Helmet`, and renders the shared `Navbar` and `Footer` (using the `const { content } = useContent()` pattern, per ticket 0006).
- [ ] The page renders in light and dark mode, is responsive on mobile, and contains no em-dash in its copy.
- [ ] The `/demos` route appears in the generated sitemap; `npm run check-meta` and `node scripts/check-backlog.mjs` stay green.

## Out of scope

- Building any new demo. This page only indexes demos that already exist.
- A search/filter UI on the index. A static grouped list is enough for this ticket.
- Personalizing the list by detected vertical or UTM; that can be a follow-up.
- Editing the per-vertical demo hub pages; they keep working as they do today.

## Engineering notes

Files / patterns the dev should touch.

- New `src/pages/Demos.tsx` - model the page on a simple existing SEO page such as
  `src/pages/Glossary.tsx` (Helmet head, Navbar, Footer via
  `const { content } = useContent()` then `<Footer data={content.footer} />`).
  Keep the demo catalog as a typed array in the page (or a small sibling data file)
  so adding a demo is a one-line change.
- `src/App.tsx` - register `<Route path="/demos" element={<Demos />} />` near the
  other top-level content routes (e.g. by `/industries` and `/glossary` around the
  `/industries` registration). The sitemap generator
  (`scripts/generate-sitemap.ts`) discovers routes from `path=` attributes in
  `App.tsx`, so the route picks up sitemap inclusion automatically.
- For the structured data, reuse the inline `<script type="application/ld+json">`
  pattern already used in `src/pages/Construction.tsx` and the vertical pages;
  build an `ItemList` of the demo links.
- Source the demo list from the route table in `src/App.tsx` (the `/.../demo/...`
  routes) so the page stays honest about what is live; do not invent demos.
- `tests/e2e/` - add a spec asserting the page renders, that its links resolve, and
  that the `ItemList` JSON-LD parses and is non-empty.
- New deps: no. Schema migration: no. Privacy/security surface change: no (no new
  hostnames; links stay on the current origin).
