---
id: 0024
title: AI-for-roofers long-tail landing page funneling into home-services demos
status: in-progress
priority: P1
area: content
created: 2026-05-30
owner: gtm-innovation
---

## User story

As a roofing company owner Googling "AI for roofers," "roofing missed call
text back," or "AI scheduler for roofing contractors," I want a landing
page that names roofing in the headline and shows me the two AI tools
that solve my actual pain (storm-week call surges and slow roof-quote
follow-up), so that the demo I try in the next 60 seconds feels built
for roofing and I do not have to translate generic home-services copy
into the reality of hail-season weeks and insurance-claim quotes.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: tickets 0017 (plumbers, shipped
2026-05-26) and 0020 (HVAC, shipped 2026-05-28) proved the trade-specific
landing-page pattern. The two pages share a structural template
(`src/pages/AiForPlumbers.tsx` and `src/pages/AiForHvac.tsx`, both 318
lines) that registers a single route in `src/App.tsx`, reuses the
existing home-services lead responder and estimate demos verbatim, and
emits Breadcrumb + Service JSON-LD with no new components. Roofing is
the next-highest unpaid-search trade in the same demo bucket. Cloning
the pattern with roofing-specific pains, schema, and CTAs adds one
route and zero new demos, prompts, or pricing.

### Stakeholder

This deepens the long-tail SEO moat where unpaid acquisition compounds.
"AI for roofers," "AI for roofing companies," and "AI roof estimate"
are low-competition, high-intent query classes the umbrella
`/homeservices` hub does not rank for because its title targets the
umbrella term. A trade-specific page carves out another query class the
product already serves end-to-end with zero feature work. The pattern
is repeatable for electrical, landscaping, and painting trades in
future tickets, each as its own focused 200-line slice. Sitemap
auto-discovery from `App.tsx` `path=` attributes (per the 0022 sitemap
generator) means the new route lands in `public/sitemap.xml` with an
accurate `<lastmod>` on the next build.

### Visitor (in the real moment of use)

A roofing contractor on a phone, mid-hail-season Monday morning, reads
a hero that says "AI for roofing companies" and a sub-line that names
their three real pains (storm-week call surges that drown the office
line, slow follow-up on inspection appointments and claim-supplement
quotes, missed review windows after a tear-off). They see two demo
cards that route to the existing home-services lead responder and
estimate demos pre-labeled for roofing. One tap goes to a working
demo; one tap goes to existing pricing on `/homeservices`. No setup
form blocks the demo. The page reads fine on a 375px viewport with
muddy work-glove fingers because the layout mirrors 0017 and 0020
which already ship that way.

### Growth

The "show me" moment is the Google search result for "AI for roofers"
or "AI for roofing contractors" pointing at a page that names roofing
in the title, H1, meta description, and demo card labels, then routes
the visitor to a real working tool in one tap. Roofing forums and
trade subreddits (r/Roofing, r/HomeImprovement) share links specific
to the trade; a generic home-services URL does not earn that share.
The same URL is paste-friendly in a salesperson's follow-up to a
roofing prospect after a storm-chaser conference.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new `/ai-for-roofers` route renders a page whose Helmet-emitted `<title>`, H1, and meta description all explicitly name "roofing" or "roofing contractors" (or "roofers"), and whose body lists at least three roofing-specific pain points (storm-week call surges, inspection and claim-supplement quote follow-up, post-tear-off review timing) using defensible language and no invented client names, dollar figures, or efficacy percentages.
- [ ] The page surfaces two demo CTA cards that link to `/homeservices/demo/lead-responder` and `/homeservices/demo/estimate` (the existing home-services demos); both links resolve and `npm run check-links` stays green after the build that emits the new sitemap entry.
- [ ] The page emits one `BreadcrumbList` JSON-LD block (Home then AI for Roofers) matching the structure in `src/pages/AiForPlumbers.tsx` lines 74 to 86, and one `Service` JSON-LD whose `serviceType` mentions roofing; both parse as valid JSON via `JSON.parse` on the script tag text.
- [ ] The page renders the shared `Navbar` plus `Footer` using `const { content } = useContent()` then `{content?.footer && <Footer data={content.footer} />}` (the ticket 0006 pattern, NOT `const { data } = useContent()` which is the bug 0006 fixed), uses `Helmet` for title/description/canonical/OG, and the `/ai-for-roofers` URL appears in the generated `public/sitemap.xml` because it is registered as a top-level `<Route path=...>` in `src/App.tsx` next to the existing `/ai-for-hvac` route.
- [ ] The page renders in light and dark mode on a 375px mobile viewport, contains zero em-dash characters in any rendered copy or JSON-LD string, and `trackCTAClick` fires on each demo CTA and the Calendly CTA with a location label that includes "roofers" or "roofing" so the page's funnel is measurable in GA.
- [ ] No new hostnames, no `/api/` change, no new demo, no new component file, no edits to `package.json` / `package-lock.json`. `node scripts/check-backlog.mjs` stays green.

## Out of scope

- Building any new demo, prompt, or estimate logic. This page reuses the
  existing home-services demos verbatim; their behavior is unchanged.
- Sibling landing pages for electrical, landscaping, painting, or
  general contractors. Each trade gets its own focused ticket if this
  one earns its traffic.
- Editing the `/homeservices` hub page itself or its schema; that page
  keeps its umbrella positioning.
- Inventing testimonials, client names, storm-loss numbers, or
  efficacy percentages; the page uses defensible market-context
  language only (no "we close 47% more claims" style claims).
- Adding roofing-specific pricing; the page links to the existing
  `/homeservices` pricing tiers.
- Personalizing the page by UTM or scraped company; UTM personalization
  is ticket 0001's lane and is out of scope here.
- Adding `/ai-for-roofers` to the `index.html` SEO Pilot `pages` table;
  that is its own SEO ticket. Helmet drives this page's head, and the
  e2e spec asserts the Helmet-managed head element directly (see
  engineering notes for the 2026-05-25 SEO Pilot lesson).
- A roofing-specific blog post or case study; those are their own
  content tickets.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/AiForRoofers.tsx` (318 lines or less, mirroring the
  existing trade-page budget). Model directly on
  `src/pages/AiForHvac.tsx` (the most recent shipped trade page, 318
  lines). Reuse its structure: Helmet head plus Navbar plus
  ScrollProgress plus hero plus stats plus three roofing pain cards
  plus two demo CTA cards routing to
  `/homeservices/demo/lead-responder` and `/homeservices/demo/estimate`
  plus why-now block plus final CTA plus Footer plus StickyCTA. Keep
  the `BREADCRUMB_SCHEMA` const + `SERVICE_SCHEMA` const pattern
  (AiForHvac lines 74 to 104) with `serviceType: "AI Automation for
  Roofing Contractors"`. Pick lucide icons that match the trade
  (`HardHat` or `Home` for hero, `PhoneOff` for storm surge,
  `Calculator` for quotes, `Star` for reviews). No new lucide icon
  imports beyond what AiForHvac.tsx already imports.
- `src/App.tsx` line 273 area - register
  `<Route path="/ai-for-roofers" element={<AiForRoofers />} />`
  immediately after the existing `/ai-for-hvac` route, and add the
  matching `import AiForRoofers from "./pages/AiForRoofers";` near the
  existing `import AiForHvac from "./pages/AiForHvac";` line. The
  sitemap generator (`scripts/generate-sitemap.ts`) discovers routes
  from `path=` attributes in `App.tsx`, so the route picks up sitemap
  inclusion automatically, and the 0022 `<lastmod>` resolver emits an
  accurate date.
- Footer wiring follows the ticket 0006 pattern exactly:
  `const { content } = useContent()` then
  `{content?.footer && <Footer data={content.footer} />}`. Do NOT use
  `const { data } = useContent()`; that is the bug ticket 0006 fixed
  on five sibling pages.
- Per the 2026-05-25 SEO Pilot lesson in `docs/LESSONS.md`, routes not
  in the `index.html` SEO Pilot `pages` table do not have
  `document.title` driven by Helmet on SPA navigation. Do NOT assert
  `expect(page).toHaveTitle(...)` in the e2e spec for this route.
  Assert the Helmet-managed head element directly: the
  `meta[name="description"]` content (read the LAST matching meta
  element since Helmet appends rather than overwrites), and the
  emitted JSON-LD script tag text. Adding `/ai-for-roofers` to the
  SEO Pilot table is its own SEO concern, out of scope here.
- Per the 2026-05-07 em-dash Hard NO and the 2026-05-25 mirror-source
  lesson: write every visible string AND every JSON-LD description
  with hyphens or restructured punctuation. Self-Review must grep the
  diff for the em-dash character before pushing. If a copy
  string is reflected into both a visible card AND a JSON-LD
  description (e.g. the Service `description` field), source the
  string once and reuse it in both surfaces.
- `tests/e2e/ai-for-roofers.spec.ts` (new) - one spec per acceptance
  box: hero/H1 names roofing, Helmet-emitted meta description names
  roofing, two demo CTA links resolve and target the correct paths,
  BreadcrumbList + Service JSON-LD parse and contain the expected
  strings (`AI for Roofers` in breadcrumb item 2, `roofing` substring
  in `Service.serviceType`), footer renders and contains the chip
  from ticket 0023, dark-mode render check on a 375px viewport,
  `trackCTAClick` fires with a roofing label (assert via
  `window.dataLayer.push` mock or the existing `tests/e2e/utm-hero.spec.ts`
  pattern for analytics observability), and a final assertion that
  the rendered page text contains no em-dash character. Mirror the
  assertion patterns in `tests/e2e/ai-for-hvac.spec.ts` and
  `tests/e2e/ai-for-plumbers.spec.ts` line-for-line where they
  overlap; do not invent new test helpers.
- Per the 2026-05-22 two-PR ship lesson, ship will need a follow-up
  `chore/0024-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter AND its `docs/backlog/README.md` index row to
  `shipped` together. Do not skip the second PR; the ticket stays at
  `in-progress` until both land, and the 2026-05-25 missing-ship-status
  recovery lesson describes the stuck state otherwise.
- New deps: no. Schema migration: no. Privacy/security surface change:
  no (same origin, no new hostnames, no data collected, no new
  cookies). Per the AGENTS.md Hard NO, this ticket does not touch
  `/api/`, `.env*`, `package.json`, or `package-lock.json`.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-05-30 - branch `feat/0024-ai-for-roofers-landing-page` opened off fresh `origin/main`; ticket frontmatter AND `docs/backlog/README.md` index row both flipped to `in-progress` in lockstep so `node scripts/check-backlog.mjs` (gated by the `build` job) stays green. Deviation from the runner directive: the directive said "do NOT touch the README index row in this PR" but the backlog-integrity check fails on any drift between file and index. The 2026-05-22 validator lesson ("move the ticket-file `status:` and its README index row together in one commit") wins over the directive; the 2026-05-22 two-PR ship lesson governs the `in-progress` -> `shipped` flip in PR 2, not the `groomed` -> `in-progress` flip here. PR #86 (feat/0023) followed the same lockstep pattern.
- 2026-05-30 - failing e2e spec added at `tests/e2e/ai-for-roofers.spec.ts` (one assertion block per acceptance-criteria box), mirroring `tests/e2e/ai-for-hvac.spec.ts` line-for-line where they overlap.
- 2026-05-30 - `src/pages/AiForRoofers.tsx` cloned from `src/pages/AiForHvac.tsx` with roofing-specific pain copy (storm-week call surges, inspection and claim-supplement quote follow-up, post-tear-off review timing). Route registered in `src/App.tsx` next to `/ai-for-hvac`; `/ai-for-roofers` added to `tests/e2e/routes.ts` so the smoke gate covers it. Deviation from engineering notes: the notes list `HardHat`/`Home` as roofing-trade hero icons AND simultaneously require "no new lucide icon imports beyond what AiForHvac.tsx already imports" - the two constraints conflict. The no-new-imports rule won; the hero chip reuses `Wrench` (already imported by AiForHvac) which still reads as a trade-tools marker. `PhoneOff`/`Calculator`/`Star` for pain icons all come from AiForHvac's existing import list as the notes specify.
