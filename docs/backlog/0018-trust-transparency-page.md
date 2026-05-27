---
id: 0018
title: How-the-demos-work transparency page at /trust
status: in-progress
priority: P2
area: trust
created: 2026-05-26
owner: gtm-innovation
---

## User story

As a skeptical owner who just watched the voice negotiator demo make a real
phone call, I want one page that plainly tells me which AI providers run the
demos, what happens to the URL I scraped, where my email goes if I submit
the estimate-email field, and what is and is not stored on Digital Craft
servers, so that I can decide whether the product is trustworthy enough to
hand my own customers' data to.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the architecture is already
trustworthy (API keys never reach the browser, demo company profiles live in
browser storage only, conversation cache is sessionStorage with a TTL, the
only third-party form submit is Formspree which is already in the allow-list)
and `CLAUDE.md` documents this clearly. A single static page that translates
those facts into owner-readable language turns an existing engineering
property into a public trust signal. No new infrastructure, no new code path,
no claim that is not already true in the repo.

### Stakeholder

This widens the moat in a way competitors cannot copy without a rebuild.
Generic AI vendors hide their stack behind marketing speak; a transparency
page that names OpenAI, Vapi, ElevenLabs, Deepgram, Firecrawl, and Formspree
by name and explains the data flow in one screen is a defensible position
for a vendor selling AI into industries (healthcare, legal, real estate)
where the buyer is paid to ask exactly these questions. It also gives the
footer's currently-dead `Privacy Policy` link a real destination (the link
in `src/components/Footer.tsx` line 152 is `href="#"` today).

### Visitor (in the real moment of use)

An owner skimming on mobile sees six short cards in plain language: "Where
your scraped website data goes," "Where your voice-call audio goes," "What
happens to the email you submit," "What we never store," "How long sessions
live," and "Who to email for deletion." Each card is two sentences and a
quiet citation of which provider is behind it. No legalese, no popup, no
scrollable wall of terms.

### Growth

The "show me" moment is the link a salesperson can paste into a follow-up
email when a prospect asks "but where does my data actually go?" Today the
answer requires a custom email; with this page it is a one-line reply with
a URL. That asymmetry (their question takes 60 seconds, the answer takes
one) shortens the gap between "interested" and "booked."

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new `/trust` route renders a page whose body explicitly names every third-party provider currently in use (OpenAI, Vapi, ElevenLabs, Deepgram, Firecrawl, Jina, Formspree, Sentry, Google Analytics) in one visible list, sourced from the table in `CLAUDE.md`; no provider is omitted and no provider is named that the repo does not actually use.
- [ ] The page has at least six labeled sections covering: scraped website data, voice call audio + transcripts, email form submissions, browser storage (sessionStorage + localStorage), what is NOT stored on Digital Craft servers, and a deletion-request contact. Each section's claim must be verifiable against the existing code path it describes (no aspirational copy).
- [ ] The footer's `Privacy Policy` link in `src/components/Footer.tsx` (currently `href="#"` at line 152) points to `/trust` instead of `#`; the change is the only edit to the footer file.
- [ ] The page renders the shared `Navbar` + `Footer` via `const { content } = useContent()` then `<Footer data={content.footer} />` (the ticket 0006 pattern), uses `Helmet` for title/description/canonical, and registers as a top-level route in `src/App.tsx` so it appears in the generated sitemap.
- [ ] The page renders in light and dark mode on a mobile viewport, contains no em-dash character in any copy, makes no defensible-claim violations (no "500+" hype, no invented partners), and contains no contact email address that is not already published elsewhere in the repo (or uses the existing `/contact` route if no public mailbox exists).
- [ ] No new hostnames enter the allow-list, no `/api/` change, no new third-party script; the page is static copy referencing existing infrastructure.

## Out of scope

- Writing a full legal privacy policy or terms of service; this is a
  plain-language transparency page, not a binding legal document. A separate
  ticket can layer in formal legal copy later if counsel asks.
- A cookie-consent banner, GDPR/CCPA workflow, or a per-region data-residency
  story. The page describes what the architecture does today; it does not
  introduce new rights surfaces.
- HIPAA/BAA messaging beyond a one-line pointer to the existing
  `SmallBusiness.tsx` FAQ answer (line 117 to 118). HIPAA configuration is a
  sales-cycle concern, not a public page concern.
- A data-deletion self-service form. The "Who to email for deletion" section
  links to the existing `/contact` page or a published mailbox; building a
  workflow is its own ticket.
- Adding a similar page per vertical. One global `/trust` page is enough.
- Editing the `Organization` JSON-LD in `index.html` to add a `privacyPolicy`
  property; that ride-along belongs with ticket 0016's head-level work, not
  here.

## Engineering notes

Files / patterns the dev should touch.

- New `src/pages/Trust.tsx` - model on the cleanest existing static SEO page
  in the repo: `src/pages/Glossary.tsx` (Helmet head, Navbar, ScrollProgress,
  Footer via `const { content } = useContent()`, jump-nav by section id).
  Keep the page typography matched to Glossary so it reads as a sibling.
- Source every factual claim from these existing files (cite them in inline
  comments so a future editor can verify):
  - Provider list and key locations: `CLAUDE.md` "Tech Stack" and
    "Environment Variables" tables.
  - Browser-storage TTLs and keys: `src/utils/aiCache.ts` (`dca_deal_` prefix,
    30-min TTL), `src/contexts/DemoContext.tsx` (localStorage scoping per
    ticket 0010), `src/components/EmailCourseOptin.tsx` and
    `src/components/construction/estimate/EmailEstimateCapture.tsx`
    (Formspree-only submit per tickets 0002 and 0015).
  - "Never reaches the browser" claim: `CLAUDE.md` key design decisions list,
    backed by the `/api/` proxy pattern.
- `src/App.tsx` - register `<Route path="/trust" element={<Trust />} />` next
  to the other top-level content routes (e.g. by `/glossary` and `/demos`).
  The sitemap generator picks the route up automatically from the `path=`
  attribute.
- `src/components/Footer.tsx` - update the `Privacy Policy` `<a>` at line 152
  from `href="#"` to `<Link to="/trust">Trust & Privacy</Link>` (use
  react-router `Link` to match the rest of the footer; keep the label short
  and accurate to what the page actually is). This is the only edit to the
  footer.
- Per-route SEO Pilot table caveat: as documented in `docs/LESSONS.md`
  (2026-05-25 Glossary entry), routes not in the SEO Pilot `pages` table in
  `index.html` will not have their `document.title` driven by Helmet on SPA
  navigation. Assert the Helmet-managed head element directly in the e2e
  spec rather than `expect(page).toHaveTitle(...)`. Adding `/trust` to the
  SEO Pilot table is its own SEO concern, out of scope here.
- `tests/e2e/trust-page.spec.ts` - one spec per acceptance box: provider list
  contains each expected name, six section headings present, footer link in
  the rendered DOM points to `/trust`, dark-mode render check, no em-dash in
  the page's visible text, page link resolves under check-links.
- New deps: no. Schema migration: no. Privacy/security surface change: no
  (the page describes existing behavior; it does not change it).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-05-27 - branch `feat/0018-trust-transparency-page` opened
- YYYY-MM-DD - failing test added in `tests/e2e/trust-page.spec.ts`
- YYYY-MM-DD - PR #N opened, CI [state]
- YYYY-MM-DD - merged to main
