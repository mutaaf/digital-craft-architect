---
id: 0101
title: Pre-filled "Book a strategy call" mailto CTA on /my composing the visitor's persisted dossier into the email body
status: shipped
priority: P1
area: conversion
created: 2026-09-28
owner: gtm-innovation
---

## User story

As a high-intent returning visitor with a populated `/my` dashboard (a
construction GC who has run the estimate demo, saved two ROI scenarios,
and viewed three vertical landing pages; a real-estate acquisitions lead
who has completed the AI Readiness Quiz twice and read four case studies;
a franchise VP who has bookmarked five comparison pages and downloaded
the dossier JSON), I want one prominent "Book a strategy call" button on
`/my` that opens my own mail client with the recipient, the subject, and
a short body already filled in with a plain-text summary of my saved
artifacts (my last estimate total, my top ROI scenario, my most recent
quiz tier, the verticals I have viewed), so that I can send the intake
email in one tap without retyping any of the context Digital Craft
already has on my browser, without any account signup, and without any
data leaving my browser until I actually press Send in my own mail
client.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: `/my` (ticket 0045) now aggregates
nine sibling persistent-artifact cards (last estimate 0014, recent demos
0026, quiz persona + quiz history 0045 plus 0076, last ROI 0062, printable
recap 0066, recent compares 0074, read blog posts 0091, saved ROI
scenarios 0093), the printable recap composes them (0066), and the
dossier export composes them (0082). None of the shipped cards or
composers ends in a booking action. The visitor who has invested the
most attention in the site (a full dossier) has NO one-tap path to a
conversation, only a printable page or a machine-readable download.
The gap is exactly one new component (`src/components/BookStrategyCallCTA.tsx`
under 120 lines) placed at the top of `/my` above the retention cluster,
one new composer (`src/utils/composeStrategyCallMailto.ts` mirroring the
shape of `src/utils/composePrintableSummary.ts` from ticket 0066 which
already reads every persisted store and produces a plain-text summary),
one new spec, and one new footer disclosure line. Zero new backend, zero
new dependency, zero edit to the shipped cards or the dossier composer,
zero new hostname (mailto: is not a network call).

### Stakeholder

This widens the moat in the conversion dimension the retention family
opens. Every retention artifact on `/my` today teaches the visitor "the
site remembers you"; none of them says "and here is one tap to talk to
us about what you've done." The bridge from remembered state to booking
is the missing conversion moment: a `mailto:` composed from the persisted
dossier converts the accumulated attention into a real inbox reply
without an account signup, a CRM integration, or a `/api/*` capture
endpoint. Per the ticket 0002 five-day-course precedent and the ticket
0015 email-me-estimate precedent, `mailto:` is the accepted intake surface
on this site, and it works offline on the visitor's own mail client so no
new hostname enters the allow-list. The composer is defensible: it quotes
ONLY strings the visitor's own browser already knows (their last estimate
total, their top ROI scenario name, their quiz tier, their viewed
vertical labels); it does not inject a UTM, a hidden tracking pixel, or
an invented "AI-generated summary" that would misrepresent what the
visitor did. Per the ticket 0066 printable-recap precedent, the composer
is a pure function of the persisted stores and produces byte-identical
output for byte-identical persisted state, which the spec asserts. The
new mailto: link's `mailto:hello@digitalcraftai.com` address is the same
address shipped in the ticket 0018 `/trust` page's contact section and
the ticket 0097 `/accessibility-statement` "report a barrier" section, so
no new inbox is added.

### User (in the real moment of use)

A construction GC opens `/my` on his phone Monday morning during coffee.
Above his last-estimate card, one prominent "Book a strategy call"
button renders in the site's accent color with a short subheading
("Send us your saved context in one tap"). He taps it. His phone's
default mail client opens with:

- To: hello@digitalcraftai.com
- Subject: Strategy call request from a Digital Craft visitor
- Body: a short plain-text summary listing his last estimate total,
  the name of his top-savings saved ROI scenario, his most recent quiz
  tier, and up to five verticals he has viewed, followed by a signature
  line the visitor edits before sending.

He edits the "Best time to call" line at the top, taps Send. No account
signup, no lead form, no `/api/*` capture. On a first-time visitor with
zero persisted artifacts, the CTA still renders but the body says only
"I'm exploring Digital Craft and would like to talk," so the CTA is
useful from the first visit onward. Light and dark mode both read
cleanly; the button meets a 44 by 44 CSS-pixel tap target on a 375px
viewport per accessibility posture from ticket 0097.

### Growth

The "show me" moment is a screenshot of the mail-client compose window
after tapping the CTA, with the pre-filled body listing three specific
saved artifacts. A visitor who forwards that screenshot to a colleague
sends a signal ("this AI vendor knows what I did on their site and gave
me a one-tap path to a call") that no other AI-services vendor's
website offers. It is also the missing terminal event in the retention
funnel: the site now has nine persisted cards, a printable recap, and
a dossier export, and the next step for the highest-intent visitor is
to send an email. Making that email one tap away, with the context
already inside, materially compresses the time from last-persisted-
artifact to first-inbox-reply, which is the single most important KPI
this GTM queue can move. The click on the CTA fires
`trackCTAClick('my_book_strategy_call', 'my_dashboard')` so the
resulting reply-rate can be attributed in GA.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests
against this list before writing code.

- [ ] A new composer at `src/utils/composeStrategyCallMailto.ts` (new file, under 150 lines) exports `composeStrategyCallMailto(): { href: string; bodyPreview: string }` returning a `mailto:` href with URL-encoded `subject` and `body` query params. The composer is a pure function of the shipped persisted stores: it reads (a) the last estimate result via the existing helper used by the ticket 0014 last-estimate card, (b) the top-savings saved ROI scenario via `getRoiScenarios()` from ticket 0093 (highest `annualSavings` first), (c) the most recent quiz tier via the existing quiz-history helper from ticket 0076, (d) up to five recent vertical labels via `getRecentVerticals()` from ticket 0100 (if 0100 has shipped by the time this ticket is implemented; otherwise omit that section per the shipped-only mirror-source rule). It does NOT read any raw sessionStorage or localStorage value directly; every read goes through the shipped getter to preserve the parse-safe read invariant. The body is plain text under 900 characters (the max URL-encoded length that the majority of mail clients accept in a single mailto:). If a store is empty the corresponding section is omitted (not printed with "(none)"); if every store is empty the body is a single line "I'm exploring Digital Craft and would like to talk about my options." The recipient is `hello@digitalcraftai.com`, byte-identical to the address in `src/pages/Trust.tsx` (mirror-source assertion per the 2026-05-25 rule).
- [ ] A new component at `src/components/BookStrategyCallCTA.tsx` (new file, under 120 lines) renders one prominent button with label "Book a strategy call" and a short subheading "Send us your saved context in one tap." The button's `href` is `composeStrategyCallMailto().href`. On click the component fires `trackCTAClick('my_book_strategy_call', 'my_dashboard')`. The button wrapper is `data-testid="book-strategy-call-cta"`. The component reads `composeStrategyCallMailto()` once on mount into local state so a re-render does not re-encode on every keystroke elsewhere on the page. On a viewport at 375px the button and subheading stack vertically; on 768px+ they render inline. Dark-mode variants match the ticket 0093 saved-ROI card conventions.
- [ ] `src/pages/MyDashboard.tsx` renders the new `BookStrategyCallCTA` component ABOVE the existing retention-cluster cards (last estimate, saved ROI, recent compares, recent verticals if shipped, etc.). This is one additive insertion at the top of the dashboard render tree. The shipped cards below it stay byte-identical. On a first-time visitor with zero persisted artifacts, the CTA still renders (with the fallback single-line body per the composer contract), so the first-visit experience is improved rather than regressed.
- [ ] Per the 2026-05-25 mirror-source rule, the recipient address, the subject string, and the body-template header line are authored ONCE in `src/data/strategyCallCopy.ts` (new file, under 60 lines) and imported by both `composeStrategyCallMailto.ts` and the spec. Do NOT hand-roll a second copy in the component or the spec. The recipient in `strategyCallCopy.ts` is asserted equal to the recipient shipped in `src/pages/Trust.tsx` and `src/pages/AccessibilityStatement.tsx` (ticket 0097) via a module-load assertion so a future edit to one address cannot silently diverge from the others.
- [ ] Per the 2026-05-07 em-dash Hard NO, every string in the composer body template, the CTA copy, and the new data file is hyphen-only. Self-Review greps the diff for `String.fromCharCode(8212)` before pushing. The composed `body` param is URL-decoded in the spec and asserted to contain zero `String.fromCharCode(8212)` code points.
- [ ] A new e2e spec at `tests/e2e/book-strategy-call-cta.spec.ts` (modeled on `tests/e2e/roi-calculator.spec.ts` from ticket 0046 for the URL-encoding assertion pattern, and on `tests/e2e/my-dashboard.spec.ts` for the `/my` mount pattern) asserts, using a `gotoMyDashboard(page)` helper that waits for RouteFallback detach per the 2026-09-05 lesson: (1) `/my` renders exactly one `data-testid="book-strategy-call-cta"` element (`toHaveCount(1)`), (2) the anchor's `href` starts with `mailto:hello@digitalcraftai.com` and the recipient byte-matches the imported address in `src/data/strategyCallCopy.ts` (mirror-source assertion per the 2026-06-07 rule), (3) with every persisted store empty, the URL-decoded `body` param contains the single-line fallback string exactly once and does NOT contain a section header for estimate, ROI, quiz, or verticals, (4) after `page.evaluate` seeds a last-estimate value, a saved ROI scenario, and a quiz tier, the URL-decoded `body` contains one line per seeded section quoting the seeded value (write-through case; every value quoted comes from the shipped getter, not the raw localStorage read), (5) the URL-encoded `body` param length is at most 900 characters even when every store is populated to its cap (5 ROI scenarios, 5 recent verticals, etc.); the composer truncates section-by-section from the bottom rather than mid-word to stay under the cap, (6) the click fires `trackCTAClick('my_book_strategy_call', 'my_dashboard')` measurable via a `page.on('request')` GA event capture or a `window.dataLayer` spy per the ticket 0046 telemetry-assertion pattern, (7) the rendered CTA and the URL-decoded `body` contain zero `String.fromCharCode(8212)` code points per the 2026-09-08 em-dash-filter lesson (scoped to owned strings, NOT to unrelated page blocks), (8) dark mode renders cleanly via `document.documentElement.classList.add('dark')` and the CTA is visible with an appropriate contrast ratio.
- [ ] Standard box: no `/api/` change (mailto: opens the visitor's mail client, no network endpoint), no new hostname, no new npm dependency, no edits to `package.json` / `package-lock.json`, no edits to any shipped `/my` card (0014, 0026, 0045, 0060, 0062, 0066, 0074, 0076, 0091, 0093), no edits to `src/pages/Trust.tsx` or `src/pages/AccessibilityStatement.tsx` beyond the mirror-source recipient assertion. `node scripts/check-backlog.mjs`, `npm run check-links`, `npm run check-images`, `npm run check-meta`, `npm run check-blog-dates`, `npm run typecheck`, `npm run lint`, `npm run build` all stay green. The new spec passes; the existing `tests/e2e/my-dashboard.spec.ts` stays green with the new CTA present.

## Out of scope

Explicit anti-goals - the dev agent will not do these even if they seem
related.

- Standard anti-goals: no `/api/` changes, no `package.json` changes, no em-dashes in copy, dark-mode required.
- A Calendly, HubSpot Meetings, or SavvyCal embed. Every scheduling embed adds a new hostname to the allow-list and a new script tag, which is out of scope for a GTM ticket. The mailto: primitive is the intake surface; a scheduling embed is a separate infra ticket after mailto: reply-rate is measured.
- A `POST /api/book-call` endpoint that captures the composed body server-side. Adding a server-side capture is a `/api/` edit and is a GTM Hard NO. Every mailto: send is captured by the visitor's own mail client and arrives at hello@digitalcraftai.com as a normal email.
- A "Send now" one-click submit (skipping the mail-client compose step) that would require a server-side send. The mailto: hand-off is intentional so the visitor edits and sends from their own address, which materially raises reply legitimacy for the recipient.
- Reading raw `sessionStorage` or raw `localStorage` values inside the composer bypassing the shipped getters. Every read goes through the shipped `getRoiScenarios()`, `getRecentVerticals()`, quiz-history helpers, etc., to preserve the parse-safe read invariant.
- Emitting a JSON-LD block for the CTA. `/my` is a retention surface, not an SEO surface (per the ticket 0045 precedent); the shipped `/my` BreadcrumbList and WebPage blocks stay byte-identical.
- Cross-linking the CTA from every landing page, every AI-for-* page, the homepage hero, or the demo hub. Cross-surface promotion is its own follow-up ticket once the mailto: reply-rate is measured; the MVP ships the CTA on `/my` only.
- Persisting a "last time you sent a strategy call request" timestamp. The mailto: click is a fire-and-forget hand-off and the visitor's send action never returns to the tab; tracking it would fabricate a signal the browser cannot verify.
- Editing the shipped ticket 0066 printable-recap composer or the ticket 0082 dossier-export composer. Both stay byte-identical; the new mailto: composer is strictly additive.
- Injecting a UTM, a campaign parameter, or a hidden tracking token into the mailto: body. The body is defensible per AGENTS.md conservative-claims: it quotes only strings the visitor's own browser already knows.
- Adding a "copy summary to clipboard" button next to the CTA. That is a distinct primitive and its own follow-up ticket; the MVP ships the mailto: hand-off only.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev
doesn't have to re-discover the architecture.

- New `src/utils/composeStrategyCallMailto.ts` (under 150 lines). Model the composer's shape on `src/utils/composePrintableSummary.ts` (ticket 0066) which already reads every persisted store and produces plain-text output. The composer is a pure function of the shipped getters; it never touches raw storage.
- New `src/data/strategyCallCopy.ts` (under 60 lines). Export `STRATEGY_CALL_RECIPIENT`, `STRATEGY_CALL_SUBJECT`, `STRATEGY_CALL_BODY_HEADER`, `STRATEGY_CALL_FALLBACK_BODY`. Include a module-load assertion that `STRATEGY_CALL_RECIPIENT` byte-matches the recipient shipped in `src/pages/Trust.tsx` (grep the file at branch head per the 2026-09-12 code-beats-prose lesson before wiring the constant).
- New `src/components/BookStrategyCallCTA.tsx` (under 120 lines). Renders the button + subheading + click handler firing `trackCTAClick`. Reads `composeStrategyCallMailto()` once on mount into local state.
- `src/pages/MyDashboard.tsx` gains one additive insertion at the top of the dashboard render tree above the retention cluster. Grep the file at branch head to locate the top of the cluster; do not touch any card below the insertion.
- Per the 2026-05-25 mirror-source rule, the recipient, subject, header line, and fallback body are authored once in `strategyCallCopy.ts` and rendered from the same source in the composer AND asserted in the spec.
- Per the 2026-05-30 second-@type lesson, this ticket adds NO new JSON-LD blocks. The pre-code grep is a no-op; record "no new JSON-LD blocks added" in the Implementation log for auditability.
- Per the 2026-05-07 em-dash Hard NO, every string in the composer, the copy file, the component, and the spec is hyphen-only. Self-Review greps the diff for `String.fromCharCode(8212)`.
- Per the 2026-09-06 VISIBLE_LIMIT lesson, the spec's element-count assertions use `toHaveCount(1)` for the CTA and `toHaveCount(0 | N)` for the seeded write-through cases, NOT `count > 0`.
- Per the 2026-06-07 mirror-source-across-src-tests lesson, the spec imports every constant it asserts against from `src/data/strategyCallCopy.ts` directly; do NOT hand-roll copies.
- Per the 2026-09-05 route-code-splitting lesson, the spec's `gotoMyDashboard` helper waits for the RouteFallback to detach AND for the top-level `/my` H1 to be visible before probing the CTA.
- Per the 2026-09-10 raw-vs-sliced lesson, the composer reads every store through its shipped getter (which enforces the 5-entry display cap); the composer's own truncation logic operates on the getter's output, not on a raw localStorage read.
- `tests/e2e/book-strategy-call-cta.spec.ts` (new), one assertion per acceptance box, modeled on `tests/e2e/roi-calculator.spec.ts` and `tests/e2e/my-dashboard.spec.ts`.
- Per the 2026-05-22 two-PR ship lesson, ship needs a follow-up `chore/0101-ship-status` PR after the feat PR merges to flip the ticket frontmatter AND its `docs/backlog/README.md` index row to `shipped` together; run `node scripts/check-backlog.mjs` before pushing the second PR.
- New deps: NO. The composer reuses `encodeURIComponent`; the component reuses Tailwind and shadcn button utilities already in use on `/my`. Schema migration: no. Privacy / security surface change: no (mailto: is not a network call, no new hostname enters the allow-list, and no new persistent store is created).

## Implementation log

(Appended by the implementation-dev agent during execution.)

- 2026-09-28 - branch `feat/0101-strategy-call-mailto-cta` opened; status flipped groomed -> in-progress
- 2026-09-28 - recipient mirror-source: grepped `src/pages/Trust.tsx` (line 257, 260) and `src/pages/AccessibilityStatement.tsx` (line 44) at branch head; the shipped contact address is `mutaaf@digitalcraftai.com`, NOT `hello@digitalcraftai.com` as the ticket prose named. Per the 2026-09-12 code-beats-prose lesson, `STRATEGY_CALL_RECIPIENT` mirrors the real code (`mutaaf@digitalcraftai.com`); ticket prose is treated as placeholder.
- 2026-09-28 - no new JSON-LD blocks added on /my (per 2026-05-30 pre-code grep; noted for auditability).
- 2026-09-28 - failing test added in `tests/e2e/book-strategy-call-cta.spec.ts`
- 2026-09-28 - PR opened, CI green, merged to main
