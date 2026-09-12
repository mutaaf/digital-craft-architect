---
id: 0077
title: Public /ethics "What we won't do" commitments page listing dated hard-NO stances as a defensible trust artifact
status: in-progress
priority: P2
area: trust
created: 2026-09-12
owner: gtm-innovation
---

## User story

As a cautious buyer-side evaluator vetting AI vendors on
behalf of a regulated business (a real-estate broker
worried about fabricated review-generation, a construction
GC nervous that an AI receptionist will invent quotes to
close deals, a facility-services owner whose insurance
carrier flagged "AI-generated content" as a policy risk,
an office-manager compliance reviewer who needs vendor
policy pages to attach to a procurement file), Googling
"AI vendor ethics policy," "no dark patterns AI vendor,"
"AI vendor hard NO list," or arriving from the sibling
`/trust`, `/subprocessors`, or `/questions-to-ask-an-ai-vendor`
page, I want one honest public page at `/ethics` that
lists Digital Craft's dated hard-NO stances (no fabricated
testimonials, no invented reviews, no dark-pattern email
capture, no hidden data retention, no persona
misrepresentation on voice calls, no scraped-first-party-
data resale, and similar), so that I can forward the URL
to my partner, my compliance reviewer, or my insurance
carrier as documentary evidence that the vendor has
publicly committed to specific defensive behaviors, in a
form that is harder for a competitor to imitate without
copying the exact commitments and citing them back.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the site already
ships three trust-adjacent pages - `/trust` (ticket 0018,
data handling and how the demos work), `/uptime` (ticket
0036, demo and serverless health), and `/subprocessors`
(ticket 0069, third-party AI and infrastructure vendors)
- but none of them articulate the ETHICAL COMMITMENTS the
vendor has made about behavior it will NOT engage in. Every
peer competitor page in the vertical (Podium, HubSpot,
GoHighLevel, Jobber) has an "AI usage policy" or "content
guidelines" page; Digital Craft does not. This ticket adds
ONE new public page at `/ethics` sourced from a new typed
data constant `src/data/ethicsCommitments.ts` (an
`EthicsCommitment[]` array with 8 to 12 dated hard-NO
stances, each carrying `title`, `stance`, `rationale`,
`sinceDate`). The page renders each commitment as one
bordered card in a single-column layout, mirrors the visual
shape of `src/pages/Trust.tsx` and `src/pages/Subprocessors.tsx`
(the two direct peers for structured-data trust pages),
and adds one new BreadcrumbList JSON-LD block scoped to
the new URL. Zero new backend, zero new dependency, zero
new persistent store, zero visible change to any existing
page beyond ONE new footer link chip on `/trust` cross-
linking to `/ethics`. One new page file, one new data
file, one new spec file, one new entry in `ROUTES`, one
new route in `src/App.tsx`, one new link chip on
`Trust.tsx`.

### Stakeholder

This widens the moat in the trust-artifact dimension along
an axis the other three trust pages cover data flow, uptime,
and vendor list, but do not cover behavioral policy. A dated
public commitments page is structurally more defensible
than a marketing FAQ because (a) each commitment carries a
`sinceDate` a competitor cannot retroactively adopt without
publicly citing the earlier date, (b) the commitments name
specific patterns the vendor has PUBLICLY REFUSED (fabricated
reviews, dark-pattern capture, hidden retention) which
converts an ethical stance into a defensible market
position, and (c) the artifact is exactly the URL a
compliance reviewer or insurance carrier attaches to a
procurement file, which is the highest-quality qualifying
signal the funnel can produce (a prospect whose compliance
team has already reviewed the vendor is by construction
further down the buying process than a raw SERP visitor).
Per the ticket 0018 `/trust`, ticket 0033 per-demo disclosure,
ticket 0036 `/uptime`, and ticket 0069 `/subprocessors`
precedents, the new page fits cleanly into the existing
"public trust artifact" surface family and cross-links from
the other three pages. The commitments themselves are NOT
invented for this ticket; they are lifted from stances
already implicit in shipped work (no fabricated testimonials
per AGENTS.md, no dark-pattern email capture per the ticket
0036 "no fourth capture form" close, no persona
misrepresentation on voice calls per the ticket 0029 voice
summary post-call disclosure, no scraped-first-party-data
resale per the ticket 0069 subprocessors data-recipients
list), so the page CANONICALIZES commitments that were
previously scattered across implementation decisions into
one dated public artifact.

### Visitor (in the real moment of use)

A construction GC whose office-manager compliance reviewer
asked "what does this vendor say they won't do with our
data" opens `/ethics` from a footer chip on `/trust`. The
page renders a calm single-column layout: an H1 reading
"What we won't do," one short intro paragraph explaining
that each commitment carries a date and a rationale, then
8 to 12 bordered commitment cards each showing a title
(e.g. "We will not fabricate customer testimonials"), a
one-sentence stance in bold, two to four sentences of
rationale, and a small footer chip "In effect since
2026-05-01" (the specific date the commitment was first
articulated in shipped work). At the bottom of the page:
one small cross-link chip pointing to `/trust` for data
handling, `/subprocessors` for third-party vendors, and
`/uptime` for operational transparency. On mobile the
cards render as a single 375px column with generous
vertical spacing; light and dark mode supported. There is
NO email capture, no CTA button, no strategy-call chip
on the page (the artifact is intentionally passive; the
CTA is the URL itself, which the visitor forwards to
their compliance reviewer). The office-manager reviewer
opens the forwarded URL, scans the eight cards, and
attaches the URL to the procurement file.

### Growth

The "show me" moment is the screenshot a compliance
reviewer or insurance carrier attaches to a vendor-vetting
memo: a Digital Craft AI page titled "What we won't do"
listing eight dated hard-NO commitments, each with a
rationale and a "In effect since <date>" chip. That
artifact is structurally the strongest B2B qualifying
signal the site can produce because compliance-reviewed
vendors are the highest-lifetime-value prospects in the
funnel (they clear the internal review hurdle that stops
most competing vendors). Per the ticket 0069 subprocessors
precedent (which added a `trackCTAClick('subprocessors_view',
'trust_footer')` beacon), this ticket adds
`trackCTAClick('ethics_view', 'page_mount')` fired once
per page mount so ethics-page traffic is measurable in GA
independently of the parent `/trust` funnel. The cross-
link chip on `/trust` fires
`trackCTAClick('ethics_from_trust', 'trust_footer')` on
click so the referral path from `/trust` to `/ethics` is
measurable independently of direct SERP arrivals.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new page `src/pages/Ethics.tsx` (new file, under 220 lines) renders at `/ethics`. The page uses the existing `Navbar` + `Footer` + `ScrollProgress` + `Helmet` shell mirrored from `src/pages/Trust.tsx` and `src/pages/Subprocessors.tsx`. The Helmet emits `<title>What we won't do - Digital Craft AI</title>` and a `<meta name="description">` matching a new module-level `META_DESCRIPTION` constant per the 2026-05-25 mirror-source rule. Renders (a) an H1 reading "What we won't do", (b) one short intro paragraph, (c) a `<section data-testid="ethics-commitments-list">` containing one `<article data-testid="ethics-commitment-card">` per entry in the new data constant, (d) a footer cross-link chip section pointing at `/trust`, `/subprocessors`, and `/uptime`. NO strategy-call CTA button, NO email capture form, NO pricing chip - the page is intentionally passive.
- [ ] A new typed data constant at `src/data/ethicsCommitments.ts` (new file, under 200 lines) exports `ETHICS_COMMITMENTS: readonly EthicsCommitment[]` with 8 to 12 entries. The `EthicsCommitment` interface is `{ id: string; title: string; stance: string; rationale: string; sinceDate: string /* YYYY-MM-DD */; }`. Each entry's `sinceDate` is a real ISO date matching or predating a shipped ticket that first articulated the stance in code or copy (e.g. "no fabricated testimonials" cites a date matching the earliest ticket that codified the AGENTS.md conservative-claims rule; "no dark-pattern email capture" cites the ticket 0036 uptime page ship date or the AGENTS.md "no fourth capture form" date, whichever is earlier). NO fabricated dates. NO placeholder rationale text. Every string is hyphen-only per the 2026-05-07 em-dash Hard NO. The eight required commitments (implementer may add up to four more if they cite a real shipped-work anchor date): (1) no fabricated customer testimonials or reviews, (2) no invented case-study numbers or client names, (3) no dark-pattern email capture (no popups, no exit-intent, no forced signup walls), (4) no hidden client-side data retention beyond what the `/trust` disclosure lists, (5) no persona misrepresentation on voice demo calls (the AI always identifies itself as AI when asked), (6) no scraped-first-party-data resale to third parties, (7) no auto-enrolled email sequences from demo interactions (email opt-in is always explicit), (8) no marketing use of the visitor's uploaded property photos or scraped website content beyond the demo session.
- [ ] `src/pages/Ethics.tsx` emits ONE new BreadcrumbList JSON-LD block inside its Helmet head: `{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com/' }, { '@type': 'ListItem', position: 2, name: 'Trust', item: 'https://digitalcraftai.com/trust' }, { '@type': 'ListItem', position: 3, name: 'What we won't do', item: 'https://digitalcraftai.com/ethics' } ] }`. Per the 2026-05-30 second-@type lesson, BEFORE writing code the implementer greps every existing `tests/e2e/*-jsonld.spec.ts` for `=== 'BreadcrumbList'` predicates and documents the grep result in the Implementation log. Every existing BreadcrumbList spec is URL-scoped per the ticket 0019 / 0044 / 0063 precedents, so a new `/ethics`-scoped block cannot collide. NO additional JSON-LD block (no AboutPage, no ItemList, no CreativeWork, no ClaimReview) is emitted, mirroring the strict "one URL-scoped BreadcrumbList only" approach so this ticket does not fall into the saturated-schema pattern.
- [ ] `src/pages/Trust.tsx` gains ONE new cross-link chip at the bottom of its existing footer cross-link section pointing to `/ethics` with label "What we won't do". The chip fires `trackCTAClick('ethics_from_trust', 'trust_footer')` on click. No other edit to `Trust.tsx` (the existing sections, disclosure list, and JSON-LD stay byte-identical). `src/pages/Subprocessors.tsx` and `src/pages/Uptime.tsx` are NOT edited in this ticket; the cross-linking is one-directional from `/trust` to `/ethics` (a reverse cross-link is a follow-up ticket).
- [ ] The page fires `trackCTAClick('ethics_view', 'page_mount')` exactly ONCE per page mount, guarded by a `useRef<boolean>(false)` flag `ethicsViewTracked` mirroring the ticket 0060 / 0062 view-tracking pattern.
- [ ] The route `/ethics` is added to `ROUTES` in `src/data/routes.ts` per the 2026-06-07 src-imports-tests lesson AND registered in `src/App.tsx` next to the existing `/trust` route (mirror the non-lazy-loading convention of the adjacent trust routes per the ticket 0069 precedent). The route is INCLUDED in `scripts/generate-sitemap.ts` (unlike `/my`, this page IS a crawler-facing SEO surface); the sitemap script's inclusion pattern reads from `ROUTES` automatically per the ticket 0022 precedent, so no manual edit to the excluder list is required beyond confirming `/ethics` is NOT in the excluder list.
- [ ] The page renders in light AND dark mode on a 375px mobile viewport, contains zero em-dash characters (`U+2014`) in any rendered text, in the `ETHICS_COMMITMENTS` data file, in the JSON-LD serialized string, or in the new cross-link chip on `Trust.tsx`. The `sinceDate` field on every commitment renders as "In effect since YYYY-MM-DD" (ISO format, hyphen-separated, no fabricated dates).
- [ ] A new e2e spec at `tests/e2e/ethics-page.spec.ts` (modeled on `tests/e2e/trust-page.spec.ts` from ticket 0018 and on `tests/e2e/subprocessors-page.spec.ts` from ticket 0069) asserts: (1) `GET /ethics` returns 200, (2) the page renders exactly N commitment cards where N is `ETHICS_COMMITMENTS.length` imported from `src/data/ethicsCommitments.ts` (per the 2026-06-07 src-imports-tests lesson), (3) each `data-testid="ethics-commitment-card"` article contains a visible `sinceDate` chip matching `/In effect since \d{4}-\d{2}-\d{2}/`, (4) the page contains no `String.fromCharCode(8212)` code point anywhere in body text, (5) the page emits exactly ONE BreadcrumbList JSON-LD block scoped to `/ethics` whose third ListItem `name` equals "What we won't do" (the unique-field selector per the 2026-09-08 lesson), (6) the page emits NO other JSON-LD blocks (assert exactly one `script[type="application/ld+json"]` on the DOM by the count assertion, which is safe because `/ethics` is a new page not covered by any existing predicate), (7) the `/trust` cross-link chip is present on `/trust` and its href resolves to `/ethics`, (8) a click on the cross-link chip on `/trust` fires the `ethics_from_trust` beacon (spied via the `trackCTAClick` shim seeded before navigation), (9) the page renders identically in dark mode via `document.documentElement.classList.add('dark')`, (10) the page fires the `ethics_view` beacon exactly once per page mount (not twice on a return-to-page via SPA transition; the useRef guard prevents the double-fire).
- [ ] Standard box: no `/api/` change, no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/pages/Subprocessors.tsx` or `src/pages/Uptime.tsx`, no edits to `src/data/organizationSchema.ts`, no edits to any existing JSON-LD block on any existing page (this ticket is purely additive on `/ethics` plus one cross-link chip on `/trust`). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the existing `tests/e2e/trust-page.spec.ts` (ticket 0018), `tests/e2e/subprocessors-page.spec.ts` (ticket 0069), `tests/e2e/uptime-page.spec.ts` (ticket 0036), `tests/e2e/trust-aboutpage-jsonld.spec.ts` (ticket 0044), `tests/e2e/sitemap.spec.ts` (or equivalent sitemap spec) stay green.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem related.

- No /api/ changes, no package.json changes, no
  em-dashes in copy, dark-mode required.
- A "sign our ethics pledge" email capture form
  on the page. Per the ticket 0036 "no fourth
  capture form" close, `/ethics` is a passive
  artifact, not a capture surface.
- A "propose a new commitment" open-comment
  form. Public open-comment surfaces require
  server-side moderation, backend storage, and
  a spam-defense layer; none of which exists.
- Emitting an AboutPage JSON-LD block on
  `/ethics`. The `/trust` page already emits
  AboutPage per ticket 0044; adding a second
  AboutPage on a sibling trust-family URL
  would risk a second-@type collision AND
  fall into the "AboutPage is saturated"
  category the current groom pass avoids.
  BreadcrumbList only.
- Emitting a ClaimReview JSON-LD block for
  each commitment. ClaimReview is designed
  for fact-check organizations reviewing
  third-party claims; a vendor listing its
  own commitments is not the semantic fit
  and emitting ClaimReview would misrepresent
  the artifact per the AGENTS.md conservative-
  claims rule.
- Fabricated commitment dates or invented
  historical anchors. Every `sinceDate` MUST
  cite a real shipped-work anchor (a shipped
  ticket date, an AGENTS.md rule date, or a
  documented lesson date in `docs/LESSONS.md`);
  no invented dates.
- Adding a "Digital Craft ethics score" or
  self-rated compliance grade to the page.
  Self-scored ethics claims are dark-pattern
  by construction; the commitments are
  binary hard-NO stances, not graded
  positions.
- A per-commitment sub-page (`/ethics/no-fabricated-testimonials`
  as a separate URL). The commitments render
  on ONE page for a compliance reviewer to
  scan in one pass; per-commitment sub-pages
  would fragment the artifact and require
  N additional BreadcrumbList blocks.
- Adding `/ethics` to `WhatsNewSinceVisit`
  (ticket 0040) or `changelogEntries.ts` in
  a way that surfaces it as a "recent ship"
  strip. The page is a canonical trust
  artifact, not a weekly-ship update; it
  surfaces via `/trust` cross-link, the
  sitemap, and the SERP - not via the
  ship-velocity surfaces.
- Cross-linking from the homepage hero,
  `/demos`, or any vertical page. The
  cross-link is one-directional from
  `/trust` in this ticket; broader
  cross-linking is its own follow-up
  ticket once telemetry shows the page
  earns compliance-reviewer traffic.
- Editing the AGENTS.md rules to reference
  the new page. The commitments DERIVE
  from AGENTS.md and shipped work; a
  reverse citation would create a
  circular dependency.
- Adding a per-commitment "share this
  commitment" URL. The artifact is the
  full page URL; per-commitment share is
  overkill for a passive trust surface.
- A visitor-facing changelog of when
  commitments were added or changed. The
  `sinceDate` field per commitment IS the
  changelog; a separate log is unnecessary.
- Emitting a `SpecialAnnouncement` JSON-LD
  block. That schema is for time-limited
  crisis announcements (COVID-era pattern),
  not standing policy commitments;
  emission would misrepresent the artifact.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/pages/Ethics.tsx` (under 220 lines).
  Mirror the page-shell pattern of
  `src/pages/Trust.tsx` (Navbar, Footer,
  ScrollProgress, Helmet) and
  `src/pages/Subprocessors.tsx` (structured
  data table with typed constant source).
  Define module-level `META_DESCRIPTION` and
  `BREADCRUMB_SCHEMA` constants per the
  2026-05-25 mirror-source rule.
- New `src/data/ethicsCommitments.ts` (under
  200 lines). Export `ETHICS_COMMITMENTS: readonly EthicsCommitment[]`
  and the `EthicsCommitment` interface.
  Every string is hyphen-only. Every
  `sinceDate` cites a real shipped-work
  anchor; do NOT invent dates.
- The commitment card render is a small
  inline `<article data-testid="ethics-commitment-card">`
  block (or a small extracted component
  under `src/components/`) containing an
  `<h2>` title, a bold `<p>` stance, a
  paragraph rationale, and a small footer
  chip rendering "In effect since <sinceDate>".
  No hover state, no CTA button, no icon;
  the visual is intentionally calm.
- `src/App.tsx` - add `<Route path="/ethics" element={<Ethics />} />`
  next to the existing `/trust` route.
  Mirror the non-lazy-loading convention of
  the adjacent trust routes per the ticket
  0069 precedent.
- `src/data/routes.ts` - add `/ethics` to
  the `ROUTES` array per the 2026-06-07
  src-imports-tests lesson; `tests/e2e/routes.ts`
  re-exports it automatically and the smoke
  spec exercises the page.
- `scripts/generate-sitemap.ts` - confirm
  `/ethics` is NOT in the excluder list
  (the page IS a crawler-facing SEO
  surface). No edit required if the
  script reads from `ROUTES` per the
  ticket 0022 precedent.
- `src/pages/Trust.tsx` - add ONE new
  cross-link chip at the bottom of the
  existing footer cross-link section
  (find the existing chips linking to
  `/subprocessors` and `/uptime` per the
  ticket 0069 shipped implementation, add
  a sibling `/ethics` chip). The chip
  fires `trackCTAClick('ethics_from_trust', 'trust_footer')`
  on click. No other Trust.tsx edit.
- Per the 2026-05-30 second-@type lesson,
  BEFORE writing code grep every
  `tests/e2e/*-jsonld.spec.ts` for
  `=== 'BreadcrumbList'` predicates.
  Document the grep result in the
  Implementation log. Every prior
  BreadcrumbList spec is URL-scoped per
  the ticket 0019 / 0044 / 0063
  precedents, so a `/ethics`-scoped
  block cannot collide.
- Per the 2026-09-08 sibling-hub-poll
  lesson, the spec's JSON-LD assertion
  extracts a small
  `assertEthicsBreadcrumb(page)` helper
  that polls
  `page.locator('script[type="application/ld+json"]').evaluateAll`
  until at least one block's third
  ListItem `name` equals
  "What we won't do" BEFORE reading and
  filtering blocks. Do NOT reuse a
  `count > 0` poll that fires before
  the Helmet head swap finishes.
- Per the 2026-05-07 em-dash Hard NO,
  every string in the new page, the
  data constant, the JSON-LD block, the
  cross-link chip on `Trust.tsx`, and
  the meta description is hyphen-only.
  Self-Review greps the diff for
  `String.fromCharCode(8212)` before
  pushing.
- Per the 2026-05-25 SEO Pilot lesson,
  add `/ethics` to the `index.html`
  SEO Pilot pages table if the ticket
  0018 `/trust` and ticket 0069
  `/subprocessors` entries are in the
  table (mirror whichever convention
  the sibling trust pages follow).
- `tests/e2e/ethics-page.spec.ts` (new) -
  one assertion per acceptance box. Model
  the spec on `tests/e2e/trust-page.spec.ts`
  (ticket 0018, the direct peer for a
  trust-family public page) and on
  `tests/e2e/subprocessors-page.spec.ts`
  (ticket 0069, the direct peer for a
  structured-content trust page with a
  BreadcrumbList JSON-LD block).
- Per the 2026-05-22 two-PR ship lesson,
  ship will need a follow-up
  `chore/0077-ship-status` PR after the
  feat PR merges to flip the ticket
  frontmatter AND its
  `docs/backlog/README.md` index row to
  `shipped` together; run
  `node scripts/check-backlog.mjs`
  before pushing the second PR so the
  file and index never drift mid-flip.
- New deps: NO. The page reuses
  `react-router-dom`, `react-helmet-async`,
  `lucide-react` for the cross-link chip
  icons, the existing Navbar / Footer /
  ScrollProgress components, and Tailwind
  utility classes. Schema migration: no.
  Privacy / security surface change: NO -
  the page is a passive read-only surface
  with no persistent store, no network
  call, no visitor input capture.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-12 - branch `feat/0077-ethics-what-we-wont-do-page` opened off fresh `origin/main` (parent 27b0170).
