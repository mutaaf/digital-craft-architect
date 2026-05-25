---
id: 0013
title: Add DefinedTermSet structured data to the AI glossary
status: shipped
priority: P2
area: seo
created: 2026-05-25
owner: gtm-innovation
---

## User story

As an owner Googling "what is speed-to-lead" or "what does RAG mean" while
evaluating AI, I want the glossary's plain-language definitions to be machine
readable so search engines can surface them, so that my question lands on a
Digital Craft page that answers it without jargon and then shows me the relevant
demo.

## Why now (four lenses)

### Product Owner
The smallest meaningful unit of value: `src/pages/Glossary.tsx` already renders a
typed `TERMS` array of 30-plus plain-language definitions in a semantic `<dl>`,
but the page emits no structured data at all. Generating a single
`DefinedTermSet` JSON-LD block from the same `TERMS` array makes the existing
content eligible for richer indexing with no new copy and no layout change.

### Stakeholder
This widens the SEO and content moat. The glossary is a dense, evergreen page that
already internally links several terms to live demos (chatbot, lead scoring, voice
AI). Wrapping it in `DefinedTermSet` / `DefinedTerm` schema gives search engines a
canonical, structured map of the vocabulary the business owns, strengthening topical
authority for AI-automation queries. As terms are added the schema compounds for free.

### Visitor (in the real moment of use)
The on-page experience is unchanged: the same jump-nav and definition list the
owner skims on mobile. The benefit is upstream, in the search result that brought
them: a definition-style query is more likely to route to this page, so the owner
who only wanted a quick answer lands somewhere that also shows them a working demo.

### Growth
The "show me" moment is the long tail of definition searches quietly resolving to
Digital Craft pages, each of which links a term to a real demo. An owner who came
for a definition of "voice AI" leaves having clicked into the voice negotiator demo,
which is the path from idle curiosity to a booked call.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] The Glossary page emits one `application/ld+json` block of type `DefinedTermSet` whose `hasDefinedTerm` array has exactly one `DefinedTerm` per entry in the page's `TERMS` array.
- [ ] Each `DefinedTerm` carries the term name and a plain-text description derived from the term's definition; for definitions that contain inline links (React nodes), the schema uses the plain-text version with no markup or em-dash in the string.
- [ ] The emitted JSON-LD parses as valid JSON and the `DefinedTermSet` name/description match the page's heading and meta description intent.
- [ ] The visible `<dl>` term list, jump-nav, and anchors are unchanged and still render in light and dark mode.
- [ ] The new schema does not introduce a second conflicting head-level block; the page still has its existing `Helmet` title and description.
- [ ] No new hostnames, no `/api/` call, no analytics removal; `npm run check-meta` and `node scripts/check-backlog.mjs` stay green.

## Out of scope

- Adding, removing, or rewording any glossary term or definition.
- Per-term canonical URLs or splitting the glossary into one page per term.
- Adding `FAQPage` or any other schema type to the glossary; this ticket adds
  `DefinedTermSet` only.
- Changing the internal links already embedded in some definitions.

## Engineering notes

Files / patterns the dev should touch.

- `src/pages/Glossary.tsx` - the `TERMS` array (`{ term, slug, definition }`) is
  the source of truth. Some `definition` values are React nodes with inline
  `<Link>`s, so derive a plain-text description for each (a small helper that
  extracts text, or add an optional `plainDefinition` string field on the items
  that need it) and build the `DefinedTermSet` from that. Keep one source so the
  visible list and schema cannot drift.
- Emit via the inline `<script type="application/ld+json">{JSON.stringify(...)}</script>`
  pattern used across the vertical pages (e.g. `src/pages/Construction.tsx`),
  placed inside the existing `Helmet` or directly in the page body as those pages do.
- `tests/` - add a test asserting the JSON-LD parses, has one `DefinedTerm` per
  `TERMS` entry, that names match, and that no description string contains an em-dash.
- New deps: no. Schema migration: no. Privacy/security surface change: no (no new
  hostnames, content is static and already shipped).

## Implementation log

- 2026-05-25: Started on `feat/0013-glossary-definedtermset-schema`. Flipped status
  to in-progress (ticket + README index together). Plan: derive a plain-text
  description for each `TERMS` entry (add an optional `plainDefinition` only where
  the definition is a React node with inline links) and emit one `DefinedTermSet`
  JSON-LD block from that single source, with tests written first against each
  acceptance box.
- 2026-05-25: Shipped via feat PR #58 (squash-merged, build + smoke-required green).
  `src/pages/Glossary.tsx` now emits one `DefinedTermSet` block with one
  `DefinedTerm` per `TERMS` entry; link-bearing definitions carry a
  `plainDefinition` equal to the rendered `<dd>` text so the visible list and the
  schema share one source. Added `tests/e2e/glossary-definedtermset-schema.spec.ts`
  (six tests, one per acceptance box). All boxes met. This commit flips the ticket
  and README index to shipped.
