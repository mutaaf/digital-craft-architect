---
id: 0012
title: Emit FAQPage structured data for the visible pricing FAQ
status: groomed
priority: P1
area: seo
created: 2026-05-25
owner: gtm-innovation
---

## User story

As an owner researching AI pricing on Google before they ever click, I want the
six pricing questions and answers that already show on the page to appear as a
rich FAQ result in search, so that I can see "Is there a setup fee?" and "Can I
cancel anytime?" answered directly in the listing and choose to click through.

## Why now (four lenses)

### Product Owner
The smallest meaningful unit of value: `src/components/PricingFAQ.tsx` already
renders six question-and-answer pairs in a visible accordion on the Construction
and Real Estate pages, but that exact content emits no `FAQPage` JSON-LD. The
page-level `FAQPage` blocks on those pages cover a different set of questions, so
the visible pricing FAQ is invisible to search engines as structured data.
Emitting one `application/ld+json` block from the component that mirrors its own
visible `FAQ_ITEMS` array closes that gap with no new copy and no new surface.

### Stakeholder
This widens the SEO moat. FAQ rich results take up more vertical space on the
search page and answer high-intent objections (setup fee, contract length, ROI
timing) before the click, which lifts qualified clickthrough. Because the schema
is generated from the same `FAQ_ITEMS` source the accordion already renders, the
visible content and the structured data can never drift, and every page that
mounts `PricingFAQ` inherits the markup for free.

### Visitor (in the real moment of use)
Nothing changes on screen for the visitor reading the page; the accordion looks
and behaves exactly as it does today. The change is felt earlier, in the search
result the owner skims on their phone before clicking: the pricing answers are
right there, so the click that follows is warmer and better qualified.

### Growth
The "show me" moment is the search listing itself: a Digital Craft result that
expands to show plain-language pricing answers where competitors show a bare
title. That expanded listing is what a skeptical owner trusts enough to click,
and it earns that placement from content that already exists on the page.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] `PricingFAQ` renders one `application/ld+json` script whose type is `FAQPage` and whose `mainEntity` has exactly one `Question` per entry in the component's `FAQ_ITEMS` array.
- [ ] Each emitted `Question.name` equals the visible question text and each `acceptedAnswer.text` equals the visible answer text for the same item (schema mirrors the rendered accordion, no drift).
- [ ] The emitted JSON-LD parses as valid JSON and contains no em-dash character in any question or answer string.
- [ ] On a page that mounts `PricingFAQ` more than once would be a duplicate; confirm `PricingFAQ` is mounted once per page today (Construction, Real Estate) so exactly one `FAQPage` block from this component renders per page (regression check against accidental double emit).
- [ ] The accordion's existing visible markup and `dark:` styling are unchanged; the component still renders correctly in light and dark mode.
- [ ] No new hostnames, no `/api/` call, no analytics removal; `npm run check-meta` and `node scripts/check-backlog.mjs` stay green.

## Out of scope

- Adding, removing, or rewording any FAQ question or answer; this ticket only
  reflects the existing six items into structured data.
- Adding `FAQPage` schema to pages that do not render `PricingFAQ`, or to the
  comparison pages (they have no visible FAQ today; that is a separate ticket).
- Deduplicating against the separate page-level `FAQPage` blocks already present
  on Construction and Real Estate; those cover different questions and stay as is.
- Any visual redesign of the accordion.

## Engineering notes

Files / patterns the dev should touch.

- `src/components/PricingFAQ.tsx` - the `FAQ_ITEMS` array (six `{ q, a }`
  objects) is the single source of truth. Map it to a `FAQPage` object and emit
  it via the same inline `<script type="application/ld+json">{JSON.stringify(...)}</script>`
  pattern already used in `src/pages/Construction.tsx` (search for `"@type": "FAQPage"`).
  Build the JSON-LD from `FAQ_ITEMS` so the visible content and schema share one source.
- The component is mounted in `src/pages/Construction.tsx` and
  `src/pages/RealEstate.tsx`; do not change those mount sites beyond what already
  exists. Be aware those pages also have their own distinct page-level `FAQPage`
  blocks, which is allowed (different questions).
- `tests/` - add a unit/render test asserting the JSON-LD parses, has one
  `Question` per `FAQ_ITEMS` entry, and that names/answers match the array.
- New deps: no. Schema migration: no. Privacy/security surface change: no (no new
  hostnames, no data collected, schema is built from static copy already shipped).
