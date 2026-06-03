---
id: 0033
title: Per-demo "what we store" disclosure chip linked to /trust
status: in-progress
priority: P2
area: trust
created: 2026-06-03
owner: gtm-innovation
---

## User story

As a healthcare-office manager (or a real-estate broker handling
client phone numbers) about to type real customer data into a
Digital Craft AI demo, I want a small, persistent "What we store"
chip in the corner of the demo screen that, when tapped, expands a
one-paragraph plain-language summary naming exactly what fields
this specific demo writes to browser storage (and what it does not),
with a link to the full `/trust` page, so that I can answer "is it
safe to put real data into this demo" in five seconds without
leaving the screen.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: ticket 0018 shipped the
`/trust` page that names every third-party provider and describes
the browser-storage TTLs and keys in plain language. That page
lives at one URL, hidden behind a footer link. The visitor who is
ABOUT to type real data into the lead-responder chat (or paste a
property address into the voice-negotiator) does not stop to open
the footer and read a transparency page; they either trust enough
to proceed or bounce. A small per-demo chip that summarizes the
SAME facts already on `/trust` in two sentences scoped to the
specific demo on screen converts the trust page from a destination
into a checkpoint. The data already exists; this ticket adds one
new component (`<DataDisclosureChip />`) and a small per-demo
config object naming which storage keys each demo writes.

### Stakeholder

This widens the trust moat in the dimension a single trust page
cannot: contextual reassurance at the moment the data is about to
be typed. Industries Digital Craft AI targets (healthcare, legal,
real estate, dental) are exactly the verticals where a buyer is
PAID to ask "where does this data go" before any pilot. A
per-demo disclosure chip is the cheapest possible answer to that
question at the cheapest possible moment (before the data is
typed, not after). The chip also gives a clean seam for a future
HIPAA-mode toggle on healthcare demos (deliberately out of scope
here) without committing to one now. Every fact on the chip is
already true of the architecture; this ticket only surfaces them
inline.

### Visitor (in the real moment of use)

A healthcare-office manager on a phone opens the healthcare intake
demo. In the top-right corner of the chat surface sits a small
gray pill reading `What we store` with a tiny shield icon. They
tap it. A small modal slides up: "This demo writes the company
profile you entered to your browser only (`dca_demo_company_healthcare`).
The chat itself is sent to OpenAI via our server; we keep no
transcript on our servers. Full transparency: digitalcraftai.com/trust."
Two sentences, one outbound link. They close the modal and start
typing. On a brand-new visitor with no prior demos, the chip
renders identically; no detection or personalization gate.

### Growth

The "show me" moment is the screenshot a salesperson can paste
into a follow-up reply to "what about HIPAA": a healthcare demo
screenshot with the chip expanded, showing the exact storage key
and the link to `/trust`. The implicit "we don't hide this" signal
is a single artifact and a single tap. Each chip-expand fires
`trackCTAClick('open_data_disclosure', '<demoPath>')` and each
`/trust` jump fires `trackCTAClick('disclosure_to_trust', '<demoPath>')`
so we can measure which demos drive the most trust-page traffic;
that data informs which verticals need deeper privacy copy on
`/trust` itself.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new component at `src/components/DataDisclosureChip.tsx` (new file, under 100 lines) exports `DataDisclosureChip` with the prop shape `{ demoPath: string }`. The component renders a small pill in the top-right of its containing box (`absolute top-3 right-3` Tailwind positioning, opaque background with a one-line shield icon and the text `What we store`), `aria-label="Data disclosure"`, `data-testid="data-disclosure-chip"`. The chip is keyboard-focusable, tabs naturally into the demo's focus order, and clicking it opens a `<Dialog>` (existing shadcn/ui component) with the disclosure body.
- [ ] The disclosure body is sourced from a typed `DEMO_DISCLOSURES` constant in `src/data/demoDisclosures.ts` (new file, under 80 lines) that maps each demo path in `KNOWN_PATHS` (from `src/utils/recentDemosStore.ts`, the existing allow-list) to a `{ storageKeys: string[]; serverSendsTo: string[]; neverStored: string[] }` shape. The text rendered in the modal is built from this shape with three short sentences: one naming the localStorage/sessionStorage keys, one naming the server destinations (OpenAI, Vapi, Firecrawl, Formspree as applicable), one naming what is NOT stored on Digital Craft servers. Every claim in this constant MUST also appear on `/trust` (the test asserts every storage-key string and every provider name in `DEMO_DISCLOSURES` also appears in `src/pages/Trust.tsx` rendered output).
- [ ] The modal contains exactly one outbound `<Link to="/trust">` styled as a button reading `Read full transparency page`. Clicking it fires `trackCTAClick('disclosure_to_trust', demoPath)`. Opening the modal fires `trackCTAClick('open_data_disclosure', demoPath)` exactly once per open (a `useRef` guard prevents React 18 strict-mode double-fire, mirroring the pattern in `src/pages/construction/VoiceNegotiator.tsx` from ticket 0029).
- [ ] The `<DataDisclosureChip demoPath={location.pathname} />` is mounted on the SAME set of demo pages where the ticket 0027 `<RelatedDemos />` is already mounted. To keep the diff under 200 lines, mount once per shared demo component (e.g. `src/pages/construction/LeadResponder.tsx`, `src/pages/construction/VoiceNegotiator.tsx`, `src/pages/healthcare/Intake.tsx`, etc. - grep `RelatedDemos` for the existing mount points and add the chip in the same JSX block). The chip is mounted ABOVE the demo's first input field (so it is visible BEFORE data is typed) but BELOW the demo's heading. Use `useLocation()` to source `demoPath`.
- [ ] If a demo path is mounted but missing from `DEMO_DISCLOSURES`, the component returns `null` (no broken chip) AND the module logs a one-line `console.warn` in dev mode only. The new e2e spec asserts the chip renders on at least 4 representative demo routes spanning 4 different verticals (construction lead-responder, healthcare intake, real-estate voice-negotiator, home-services estimate), and confirms the modal body for each route names a storage key and at least one provider.
- [ ] The chip and modal render in light AND dark mode on a 375px mobile viewport, the modal traps focus and closes on Escape (using shadcn `<Dialog>` defaults), and the rendered modal body contains zero em-dash characters in any text. Self-Review greps the diff for the em-dash character before pushing. The chip's positioning does not overlap any existing demo input (visual regression check on the four representative routes).
- [ ] No new hostnames, no `/api/` change, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to `src/pages/Trust.tsx` (the chip references `/trust`; `/trust` does not need to know about the chip). `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-meta` stay green; `npm run typecheck` stays clean.

## Out of scope

- A "HIPAA mode" or per-vertical compliance toggle on the chip.
  Healthcare and legal verticals have specific compliance posture
  the chip cannot capture in two sentences. A future ticket can
  layer that on; this one ships the contextual disclosure only.
- Adding the chip to non-demo pages (the homepage, the per-vertical
  marketing pages, `/glossary`, `/changelog`). Those pages do not
  collect data; the chip would be noise.
- Editing the `/trust` page itself. The chip points at the existing
  page; if a future ticket wants to deepen the per-demo disclosure
  on `/trust`, it can pull `DEMO_DISCLOSURES` into that page then.
- A "Dismiss" or "Don't show again" control on the chip. The chip
  is small and out of the way; allowing dismissal undermines the
  contextual-reassurance hypothesis (the visitor MIGHT need it on
  the SECOND visit too).
- A schema.org `WebPage.specialty` or `mainContentOfPage.privacyPolicy`
  schema. The chip is a UI disclosure surface, not a crawlable
  list; the existing `/trust` page is the canonical crawlable
  surface.
- Auto-detecting which demo features the visitor is using and
  showing only the relevant providers. The static per-path
  `DEMO_DISCLOSURES` shape is enough; conditional rendering by
  feature flag is over-engineered.
- A "Copy disclosure to clipboard" or "Email me this disclosure"
  control. The `/trust` page is the durable artifact; if a visitor
  wants to share, they share that URL.
- Editing `src/contexts/DemoContext.tsx` or any
  `dca_demo_company_*` storage key behavior. The chip describes
  what those keys are; it does not change them.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/components/DataDisclosureChip.tsx` (under 100 lines).
  Props: `{ demoPath: string }`. Implementation: a small
  `<button>` with `data-testid="data-disclosure-chip"` positioned
  with `absolute top-3 right-3` Tailwind classes, opens a shadcn
  `<Dialog>` (already used elsewhere; grep `src/components/ui/dialog.tsx`
  to confirm). Render the disclosure body from
  `DEMO_DISCLOSURES[demoPath]`; if missing, return `null`. The
  shield icon comes from `lucide-react` (already a dependency;
  use `ShieldCheck` or `Shield` - grep existing usage in
  `src/pages/Trust.tsx` for the icon already imported there).
  Apply `dark:` Tailwind variants on every new class per the
  AGENTS.md Hard NO.
- New `src/data/demoDisclosures.ts` (under 80 lines). Exports the
  `DEMO_DISCLOSURES` constant keyed by every path in `KNOWN_PATHS`
  from `src/utils/recentDemosStore.ts`. Each value is the typed
  `{ storageKeys: string[]; serverSendsTo: string[]; neverStored: string[] }`
  shape. Source every fact from `src/pages/Trust.tsx` (the page
  comments already cite the storage keys and provider list per
  ticket 0018). Per the 2026-05-25 mirror-source lesson, the
  constants in this file MUST appear in the rendered
  `src/pages/Trust.tsx` text; the e2e spec asserts the overlap.
  A leading module-load assertion confirms every key in
  `DEMO_DISCLOSURES` is also in `KNOWN_PATHS` (throw a clear
  dev-time error on drift, so a renamed demo cannot strand a
  chip mount without a disclosure entry).
- Mount the component on the SAME set of demo files where
  `<RelatedDemos />` (ticket 0027) is already mounted. Grep
  `RelatedDemos` in `src/pages/` to find the existing mount points.
  Add one import + one JSX line per file. The chip mounts BELOW
  the demo's main heading and ABOVE the first user-input field;
  the implementer picks the exact JSX position per demo file.
  Use `useLocation()` to source `demoPath`; do not hardcode.
- Per the 2026-05-25 SEO Pilot lesson, the chip is not a
  `document.title` concern; standard react-helmet-async head
  management remains as-is in each demo page. The e2e spec
  asserts the chip's rendered DOM directly, not page titles.
- Per the 2026-05-30 "second @type instance" lesson, this ticket
  emits no JSON-LD. Confirm by grepping `tests/e2e/*-jsonld.spec.ts`
  for any predicate over the modified demo-page files; the default
  posture for this ticket is no new structured data.
- Per the 2026-05-07 em-dash Hard NO, every string in
  `DEMO_DISCLOSURES` MUST use hyphens, and the chip's visible
  copy (`What we store`, `Read full transparency page`) uses
  hyphens. Self-Review greps the diff for the em-dash character
  before pushing. The 2026-05-25 mirror-source repair rule
  applies: if grep finds an em-dash in any string that ALSO
  appears in `src/pages/Trust.tsx`, fix it at the single shared
  source (the `/trust` page text).
- `tests/e2e/data-disclosure-chip.spec.ts` (new) - one spec per
  acceptance box. Mount-presence case: navigate to 4 representative
  demo routes (construction/demo/lead-responder,
  healthcare/demo/intake, realestate/demo/voice-negotiator,
  homeservices/demo/estimate), assert
  `data-testid="data-disclosure-chip"` is visible on each. Click
  case: click the chip, assert the modal opens, assert the modal
  body names at least one storage key string AND at least one
  provider name from the visible Trust page (cross-reference by
  reading `/trust` text in `beforeAll`). Trust-link case: click
  the `Read full transparency page` button, assert URL changes
  to `/trust`, assert
  `trackCTAClick('disclosure_to_trust', demoPath)` fires once.
  Focus-trap case: assert `Escape` closes the modal. Dark-mode
  case: apply `document.documentElement.classList.add('dark')`,
  assert chip + modal render. No-em-dash case: read
  `page.textContent('body')` on the open modal, assert no `U+2014`
  code point. Missing-disclosure case: mount a hypothetical
  unknown demo path via a `addInitScript` override, assert the
  chip returns `null` (no broken UI).
- The 2026-05-22 two-PR ship lesson applies: ship needs a
  follow-up `chore/0033-ship-status` PR after the feat PR
  merges to flip the ticket frontmatter AND its
  `docs/backlog/README.md` index row to `shipped` together; run
  `node scripts/check-backlog.mjs` before pushing the second
  PR so the file and index never drift mid-flip.
- New deps: no. Schema migration: no (no new storage key, no new
  schema; the chip READS existing facts). Privacy/security surface
  change: yes BUT the surface is purely informational - the chip
  discloses what already happens; it does not change any data
  flow, add any new external call, or write any new storage key.
  The trust posture documented on `/trust` (ticket 0018) is
  unchanged; this ticket only makes it visible at the moment of
  data entry. Per the AGENTS.md Hard NO, this ticket does not
  touch `/api/`, `.env*`, `package.json`, or `package-lock.json`.

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-06-03 - branch `feat/0033-data-disclosure-chip` opened off fresh origin/main
- 2026-06-03 - failing test added in `tests/e2e/data-disclosure-chip.spec.ts`
- 2026-06-03 - implemented `src/components/DataDisclosureChip.tsx` + `src/data/demoDisclosures.ts`; mounted chip on the 13 demo files that already mount `<RelatedDemos />` (LeadResponder, EstimateGenerator, InvoiceGenerator, SMSSequence, LeadScoring, ReviewSystem, PropertyNegotiator, VoiceNegotiator, ContractDrafter, MarketAnalyzer, InquiryQualifier, ProposalGenerator, VoiceBookingAgent). These shared components serve every demo path in `KNOWN_PATHS` via per-vertical `App.tsx` routes (e.g. `/healthcare/demo/intake` resolves to `LeadResponder`, `/homeservices/demo/estimate` resolves to `EstimateGenerator`), so a single mount per shared file delivers the chip to all 4 representative routes the spec names.
- 2026-06-03 - did NOT touch `src/pages/Trust.tsx`: every storage-key prefix (`dca_demo_company_`, `dca_deal_`) and every provider name (OpenAI, Vapi, ElevenLabs, Deepgram, Firecrawl, Jina, Formspree) used in `DEMO_DISCLOSURES` already appears in the rendered `/trust` body, so the mirror-source overlap holds without a Trust edit.
- 2026-06-03 - PR #N opened, CI [state]
- 2026-06-03 - merged to main
