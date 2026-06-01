---
id: 0029
title: Shareable branded voice-call summary link
status: in-progress
priority: P2
area: demos
created: 2026-06-01
owner: gtm-innovation
---

## User story

As a real-estate investor (or construction GC) who just finished a
live AI voice negotiation demo and is staring at the call summary
(agreed price, key insights, recommended next steps), I want a
"Copy share link" button that produces a URL anyone can open to see
the same finished summary, so that I can send it to my own partner
or seller and they land on a Digital Craft demo for the first time
with a real, branded artifact that names the property and the
outcome.

## Why now (four lenses)

### Product Owner

The smallest meaningful unit of value: the voice-call summary
already exists fully client-side as a `CallSummary` object in
`src/components/construction/negotiator/VoiceCallSummary.tsx` (304
lines, types in `src/data/voiceNegotiation.ts`). Ticket 0009
proved the same pattern for the estimate result: encode the
artifact in the URL, rehydrate on load, no API round-trip. Doing
the same for the voice summary turns a throwaway post-call screen
into a durable, sendable artifact. Nothing new is computed; the
summary is just made addressable.

### Stakeholder

This deepens both the retention moat and the referral surface in
the same move. The voice negotiator is the most memorable demo in
the catalog (live phone call, real LLM, real comps); today the
summary lives for one tab session and then disappears. A
shareable link is a structured artifact: every link a visitor
sends carries Digital Craft branding and a `Book Free
Consultation` CTA to a brand-new viewer, turning one demo run
into a referral surface at zero acquisition cost. The pattern
also leaves a clean seam for a future "email me this summary"
capture (ticket 0015 did the equivalent for estimates).

### Visitor (in the real moment of use)

A real-estate investor on a phone finishes the voice demo, sees
the agreed price and the key insights, taps "Copy share link,"
gets a brief "Copied" confirmation, and pastes the URL into a
text to their business partner. The partner opens the link on
their own phone and immediately sees the same summary card with
the property address, agreed price, sentiment, key insights, and
recommended next steps. No form, no signup, no waiting; the
encoded payload rehydrates the summary directly. The full
transcript stays out of the URL (privacy posture: the summary is
shareable, the call audio and turn-by-turn transcript are not).

### Growth

The "show me" moment is the screenshot of a real, branded
voice-call summary card with the prospect's own property address
at the top and a clear `Book a Free Consultation` CTA below.
That artifact lives in a text message thread between two
business partners; the second partner has now had a hands-free
first encounter with the product. Each "Copy share link" click
fires `trackCTAClick('share_voice_summary', 'voice_summary_card')`
and each cold-open of a shared link fires
`trackCTAClick('open_shared_voice_summary', 'voice_summary_card')`
so the inbound vs outbound funnel is measurable in GA
independently.

## Acceptance criteria

Each box maps 1:1 to a test scenario. The dev agent writes the tests against this
list before writing code.

- [ ] A new pure-function encoder/decoder at `src/utils/voiceSummaryShareLink.ts` (new file, under 120 lines) exports `encodeVoiceSummary(payload: ShareableVoiceSummary): string` and `decodeVoiceSummary(encoded: string): ShareableVoiceSummary | null`. The `ShareableVoiceSummary` shape includes only the fields safe to share (property address, agreedPrice, lowestAcceptable, sellerTimeline, sentiment, keyInsights, recommendedNextSteps, durationSeconds); it does NOT include `transcript`, `sellerEmail`, `sellerName`, or any free-form seller-said utterance. Encoding is `btoa(JSON.stringify(payload))` with URL-safe replacement (`+` to `-`, `/` to `_`, strip `=`), capped at 1800 chars so the URL stays under typical browser limits; over-cap payloads truncate `keyInsights` and `recommendedNextSteps` to the first 5 entries each before re-encoding.
- [ ] On the voice-call summary view (`src/components/construction/negotiator/VoiceCallSummary.tsx`), a "Copy share link" button writes the URL `${origin}${currentPath}?v=${encoded}` to the clipboard using `navigator.clipboard.writeText`, shows a transient "Copied" badge for 2 seconds (mirroring the ticket 0009 confirmation pattern in `src/utils/shareableEstimateLink.ts` if it exists, otherwise the `useState` toggle pattern already used elsewhere in `VoiceCallSummary.tsx`), and fires `trackCTAClick('share_voice_summary', 'voice_summary_card')`.
- [ ] Opening any `/construction/demo/voice-negotiator?v=<encoded>` or `/realestate/demo/voice-negotiator?v=<encoded>` URL with a valid encoded payload renders the summary view DIRECTLY (skips the property-input + agent-pipeline + setup + call phases) with the decoded summary values rendered identically to a freshly-finished call. The page fires `trackCTAClick('open_shared_voice_summary', 'voice_summary_card')` exactly once on mount when `?v=` is present and decodes to a valid payload.
- [ ] When `?v=` is absent the page falls back to the normal `input` phase with no error thrown and no analytics event fired. When `?v=` is present but malformed (invalid base64, JSON parse fail, missing required field, or fails a per-field type check), the page falls back to the normal `input` phase and shows no error UI (the visitor sees the standard demo entry).
- [ ] A "Book Free Consultation" CTA renders below the shared summary card on the cold-open path (same CTA as the standard post-call view, no new copy) so the shared artifact is a self-contained funnel surface. The button uses `trackCTAClick` with a location label that includes `shared_voice_summary` so cold-open conversions are measurable separately.
- [ ] The shared summary card renders the property address, agreedPrice (formatted with `toLocaleString()`), durationSeconds, sentiment badge, keyInsights, and recommendedNextSteps; it explicitly does NOT render `transcript`, `sellerName`, or `sellerEmail` even if they leak into the encoded payload (the decoder strips them before render). The transcript collapsible is hidden on the cold-open path.
- [ ] The "Copy share link" button and the cold-opened summary card both render in light AND dark mode on a 375px mobile viewport, contain no em-dash character in any rendered text, and `node scripts/check-backlog.mjs` plus `npm run check-links` stay green.
- [ ] No new hostnames, no `/api/` change, no new npm dependency, no edits to `package.json` / `package-lock.json`. The encoded payload travels as a URL query param only; nothing is written to localStorage or sessionStorage by the share path (the existing `dca_voice_agentResult` sessionStorage handoff is unchanged).

## Out of scope

- A persistent server-side `/shared/voice/:id` route or any database
  store of shared summaries. The encoded payload travels in the
  URL only, mirroring the ticket 0009 estimate share pattern. No
  `/api/` change.
- Sharing the full transcript. The transcript is the actual
  conversation content and stays out of the URL by privacy
  construction. A future ticket can add a separate "Email me the
  full transcript" capture (analogous to ticket 0015 for the
  estimate) but it is not in this scope.
- A printable / PDF render of the summary. The current
  `Printer` icon import in `VoiceCallSummary.tsx` can stay or go;
  this ticket does not wire it. A future ticket can add print
  styling.
- Editing the per-vertical demo router so the `?v=` param works on
  pages other than the voice-negotiator routes. Only
  `/construction/demo/voice-negotiator` and
  `/realestate/demo/voice-negotiator` decode the param in this
  ticket. The voice booking agent under `/events/demo/voice-booking`
  is structurally different (no `CallSummary` type) and is out of
  scope.
- A "Clear shared link" UI surface or a "regenerate link" button.
  One button, one copy action.
- Adding the shared summary URL to the sitemap. The shareable URLs
  are per-call personalizations, not catalog routes; the existing
  voice-negotiator route is already in the sitemap.
- Documenting the share encoding on `/trust`. The encoded payload
  contains only data the user just saw on their own screen and is
  not written to storage; no new privacy disclosure is required
  beyond the existing `/trust` posture. If a future ticket wants to
  highlight "shareable artifacts," it can add the disclosure then.
- Editing `src/data/voiceNegotiation.ts` to add the
  `ShareableVoiceSummary` type. Keep the new type local to the
  share-link util so the encoder/decoder is self-contained.

## Engineering notes

Files / patterns the dev should touch. Specific enough that the dev doesn't have
to re-discover the architecture.

- New `src/utils/voiceSummaryShareLink.ts` (under 120 lines). Export
  the `ShareableVoiceSummary` type and the encode/decode pair.
  Encoding is `btoa(JSON.stringify(payload))` with URL-safe
  replacement, capped at 1800 chars; decoding is the inverse with
  full per-field type validation (mirror the `isRecentDemo` guard
  in `src/utils/recentDemosStore.ts` lines 93 to 103 exactly: a
  malformed entry returns `null`, never throws). The decoder MUST
  strip any extra fields the encoder did not emit (defensive
  against a hand-edited URL trying to inject `transcript` or
  `sellerName` into the render).
- `src/components/construction/negotiator/VoiceCallSummary.tsx` -
  add a "Copy share link" button near the existing action buttons.
  Implementation: a `useState<'idle' | 'copied'>` toggle, click
  handler computes the URL from `window.location.origin + window.location.pathname`
  plus `?v=` + `encodeVoiceSummary({ ...fields })`, writes to
  clipboard via `navigator.clipboard.writeText`, sets state to
  `'copied'` for 2s, fires `trackCTAClick`. Apply `dark:` Tailwind
  variants on every new class per the AGENTS.md Hard NO. Mirror
  the existing button style classes in the file so the new
  control is visually consistent.
- The 2026-05-25 mirror-source lesson applies HERE: line 51 of
  `VoiceCallSummary.tsx` currently builds the email subject with
  an em-dash character (the `buildFollowUpEmail` function). The
  shareable URL must not introduce or propagate em-dashes. Per
  the lesson, fix the em-dash at the single shared source (line
  51, and one more on line 52 if present) by replacing the em-dash
  character with a hyphen so the visible email subject and the new share-link
  surface stay consistent. This is punctuation repair, not
  rewording, and is in-scope by the mirror-source rule even though
  the visible email subject is not the primary surface this
  ticket adds.
- `src/pages/construction/VoiceNegotiator.tsx` and
  `src/pages/realestate/VoiceNegotiator.tsx` - add a `useEffect`
  on mount that reads `?v=` from `useLocation().search` (or
  `useSearchParams`), runs `decodeVoiceSummary`, and on a valid
  payload synthesizes a minimal `CallSummary` + `PropertyData`
  pair and jumps the `Phase` state machine straight to `summary`.
  On a missing or invalid `?v=` the effect does nothing (the
  normal `input` flow renders). Fire
  `trackCTAClick('open_shared_voice_summary', 'voice_summary_card')`
  exactly once via a `useRef` guard so React 18 strict-mode
  double-mount does not double-fire the event.
- Reading from `window.location` and `URLSearchParams` is safe
  because both voice-negotiator pages already run client-side
  only. The 2026-05-25 SEO Pilot lesson does NOT bite here (this
  is not a `document.title` concern); standard react-helmet-async
  head management remains as-is.
- The 2026-05-30 "second @type instance" lesson is not directly
  triggered here (this ticket emits no JSON-LD). If the
  implementer decides to add a `Service` or `WebPage` schema for
  the cold-opened share view, they MUST first grep
  `tests/e2e/*-jsonld.spec.ts` for `=== '<Type>'` predicates over
  the voice-negotiator routes and widen any "exactly one"
  assertion in the same PR. Default posture for this ticket: no
  new JSON-LD.
- Per the 2026-05-07 em-dash Hard NO, write the new button copy,
  the "Copied" badge, and any tooltip text with hyphens. Self-
  Review must grep the diff for the em-dash character before
  pushing, and the diff MUST include the source fix on
  `VoiceCallSummary.tsx` line 51 (and any neighbor) per the
  mirror-source guidance above.
- `tests/e2e/voice-summary-share-link.spec.ts` (new) - one spec
  per acceptance box. Encode/decode round-trip case: pure unit-style
  assertion via a `page.evaluate` of the encoded module (or a
  smaller harness route). Copy-button case: navigate to
  `/construction/demo/voice-negotiator`, advance the phase state
  machine to `summary` via a `sessionStorage` pre-seed of
  `dca_voice_agentResult` similar to the existing
  `useEffect` restore on lines 44 to 56, click "Copy share link",
  assert the clipboard contains the expected URL (Playwright's
  `context.grantPermissions(['clipboard-read', 'clipboard-write'])`
  pattern), assert the "Copied" badge renders. Cold-open valid
  case: navigate directly to
  `/construction/demo/voice-negotiator?v=<encoded>`, assert the
  summary view renders, assert no transcript is visible, assert
  the `trackCTAClick('open_shared_voice_summary', ...)` event
  fires exactly once. Cold-open invalid case: navigate with a
  malformed `?v=` and assert the normal input phase renders, no
  error UI. Cold-open malicious case: navigate with a `?v=` whose
  decoded payload tries to inject `transcript` or `sellerName`,
  assert neither field appears in the rendered DOM. Dark-mode
  case: apply `document.documentElement.classList.add('dark')`
  and assert the share button and cold-opened card both render.
  Same spec covers the realestate route for the dark-mode and
  cold-open valid assertions.
- Per the 2026-05-22 two-PR ship lesson, ship will need a follow-up
  `chore/0029-ship-status` PR after the feat PR merges to flip the
  ticket frontmatter AND its `docs/backlog/README.md` index row to
  `shipped` together; run `node scripts/check-backlog.mjs` before
  pushing the second PR so the file and index never drift mid-
  flip.
- New deps: no (uses native `btoa`, `URLSearchParams`,
  `navigator.clipboard`; all are already used in the codebase).
  Schema migration: no. Privacy/security surface change: yes -
  this ticket introduces a URL-encoded artifact that may be
  shared outside the visitor's own session. Justification: the
  payload carries only data the visitor just saw on their own
  screen (property address they entered, agreed price the AI
  reached); the transcript, seller email, and seller name are
  stripped by construction; no PII is captured server-side; no
  new hostname is contacted. Per the AGENTS.md Hard NO, this
  ticket does not touch `/api/`, `.env*`, `package.json`, or
  `package-lock.json`.

## Implementation log

(Appended by the implementation-dev agent during execution.)
