---
id: 0085
title: Remove @ts-nocheck from VoiceBookingAgent.tsx (close 0005 grandfathering)
status: in-progress
priority: P2
area: infra
created: 2026-09-19
owner: eng-dev
---

## Problem

Ticket 0005 (shipped 2026-05-22, docs/backlog/0005-typecheck-ci-gate.md)
introduced the `npm run typecheck` gate and grandfathered five files behind
`// @ts-nocheck` when the baseline was made green. Its Out-of-scope section
called out this exact file:

> "Supplying the missing `sellerMotivation` field in VoiceBookingAgent's
> property stub (would change the voice prompt) → feature loop."

Four of those five files have since been de-grandfathered by feature-loop
tickets that resolved their underlying user-facing bugs (the footer `data`
vs `content` cases in Glossary, Industries, compare/HubSpot, and
compare/GoHighLevel). The last remaining `@ts-nocheck` header lives in
`src/pages/events/VoiceBookingAgent.tsx`.

Per the 2026-05-22 LESSONS entry
("Eng backlog has no groomer; bootstrap pre-authorized follow-ups instead of
NOOPing"), and per 0005's own pre-authorization pointing at this file, this
is the next pre-authorized eng follow-up: removing the last `@ts-nocheck`
header from the 0005 baseline.

The original concern in 0005's Out-of-scope note was that supplying a
meaningful value for `sellerMotivation` would change the voice prompt.
That concern applies to a meaningful string value. Supplying `null` does
NOT change the voice prompt: the template at
`src/utils/voicePromptGenerator.ts:147` reads

```
${property.sellerMotivation ? `Seller motivation: ${property.sellerMotivation}` : ''}
```

Today `property.sellerMotivation` is `undefined` (missing field under
`@ts-nocheck`) which is falsy and renders `''`. With `null` it is also
falsy and renders `''`. Byte-identical output. That makes this an
eng-safe pure type-only fix, not a feature-loop concern.

Measurement (Node 20 + `npm run sync:classes`, then temporarily deleted
the 3 header lines of `VoiceBookingAgent.tsx` and ran
`npx tsc -p tsconfig.app.json --noEmit`) reports exactly one error:

```
src/pages/events/VoiceBookingAgent.tsx(27,3): error TS2741: Property 'sellerMotivation' is missing in type '{ ... }' but required in type 'PropertyData'.
```

No other typecheck errors surface. `PropertyData.sellerMotivation` is
declared `string | null` at `src/data/propertyNegotiation.ts:17`. Every
existing consumer already handles `null` via a truthy check (grep
`sellerMotivation` — all readers gate on `property.sellerMotivation ? ...`
or accept the wider type).

## Why now

This is the LAST `@ts-nocheck` file left from the 0005 baseline. Removing
it permanently closes 0005's grandfathering list so no `@ts-nocheck`
lives in the app source at all. Once closed, the typecheck gate is a
full-strength floor with zero exceptions; future accidental
`@ts-nocheck` reintroductions become visible in code review rather than
hiding among a grandfathered pool. This ships the smallest possible edit
(add one nullable field, delete a 3-line header) with zero rendered-
output change and no dependency touch.

## Acceptance criteria

- [ ] The 3-line `@ts-nocheck` header block (the
      `/* eslint-disable @typescript-eslint/ban-ts-comment */` comment,
      the `// @ts-nocheck` line, and the
      `// TODO(eng): typecheck baseline, see docs/backlog/0005` line)
      is removed from `src/pages/events/VoiceBookingAgent.tsx`.
- [ ] `buildPropertyStub` in that file adds `sellerMotivation: null` to
      the returned `PropertyData` object, slotted right after
      `utilities: null` to match the ordering used by
      `emptyProperty()` in `src/data/propertyNegotiation.ts`.
- [ ] `npm run typecheck` exits 0 on the branch.
- [ ] Prove-first recorded: with the 3 header lines removed and BEFORE
      the `sellerMotivation: null` addition,
      `npx tsc -p tsconfig.app.json --noEmit` reports exactly one TS2741
      error at line 27 col 3 naming `sellerMotivation`. After adding
      `sellerMotivation: null`, typecheck exits 0. Both outputs are
      recorded in the Implementation log.
- [ ] No rendered-output / copy / runtime behavior change: the voice
      prompt generator reads `sellerMotivation` via a truthy check
      (`property.sellerMotivation ? ... : ''`) so `undefined` and `null`
      produce a byte-identical prompt. The `voiceNegotiation.ts`
      `sellerMotivation: string` field at line 29 is on a DIFFERENT type
      (`CallSummary`, not `PropertyData`) and is NOT touched.
- [ ] No `/api/`, `.env*`, or dependency changes
      (`package-lock.json` unchanged).
- [ ] `node scripts/check-backlog.mjs` passes (ticket file status and
      README index row in sync).

## Out of scope

- Any change to the voice prompt content, the negotiation flow, or the
  event booking prompt itself. This ticket only removes the
  `@ts-nocheck` guard and adds the one missing field with a null value.
  If typecheck surfaces ANY additional error beyond the one TS2741
  measured, STOP and re-scope.
- The other four files that used to be grandfathered by 0005 — they were
  already de-grandfathered by feature-loop tickets and are not touched
  here.
- Any refactor of `buildPropertyStub` or the `PropertyData` interface,
  or of any consumer of `sellerMotivation`.

## Engineering notes

- File: `src/pages/events/VoiceBookingAgent.tsx`.
- Delete lines 1-3 of the file (the eslint-disable comment, the
  `// @ts-nocheck` line, and the `// TODO(eng)` baseline comment).
- In `buildPropertyStub`, add `sellerMotivation: null,` to the returned
  object. Slot it directly after the existing `utilities: null,` line to
  match the ordering used by `emptyProperty()` in
  `src/data/propertyNegotiation.ts`.
- The `PropertyData` interface at `src/data/propertyNegotiation.ts:17`
  types the field as `string | null` and its default constructor
  `emptyProperty()` already returns `sellerMotivation: null`, so `null`
  is the ordinary neutral value used elsewhere in the codebase.
- `src/pages/construction/VoiceNegotiator.tsx` already sets
  `sellerMotivation: null` (line 54) and later blanks it to `''` in a
  separate copy at line 67, so the null value is the established
  neutral in the codebase's other `PropertyData` sites.
- Node 20 gotcha: local Node default may be v16/v25; use v20 for
  `npm run sync:classes` (materializes the gitignored
  `api/_classesData` file that the typecheck transitively imports).
  CI uses Node 20.
- After the fix lands, `src/pages/events/VoiceBookingAgent.tsx` should
  have zero `// @ts-nocheck` lines and the total `// @ts-nocheck` count
  under `src/` should drop to zero.
- Also add the README index row for 0085 at the end of
  `docs/backlog/README.md` in the same bootstrap commit so
  `check-backlog.mjs` stays green from commit 1 onward.

## Implementation log

### 2026-09-19 — prove-first + fix (eng-dev)

Branch: `eng/0085-voicebooking-tsnocheck-close` off fresh `origin/main`
(HEAD `8f670e2`).

**Bootstrap commit** (`881840c`): authored this ticket file +
`docs/backlog/README.md` row (`0085 | ... | P2 | in-progress | infra`) as
the first commit on the branch, per the 2026-05-22 "bootstrap
pre-authorized follow-ups" LESSON. `node scripts/check-backlog.mjs` green
before push (`✓ backlog integrity: 85 tickets, index in sync.`).

**Prove-first** (Node 20.19.0 + `npm run sync:classes`, then removed the
3-line header block from `src/pages/events/VoiceBookingAgent.tsx` WITHOUT
adding `sellerMotivation: null` yet, then `npx tsc -p tsconfig.app.json
--noEmit`):

```
src/pages/events/VoiceBookingAgent.tsx(27,3): error TS2741: Property 'sellerMotivation' is missing in type '{ address: string; askingPrice: number; bedrooms: null; bathrooms: null; sqft: null; yearBuilt: null; propertyType: string; condition: string; lotSize: string; daysOnMarket: null; listingSource: string; notes: string; acreage: null; zoning: null; utilities: null; }' but required in type 'PropertyData'.
```

Exactly one TS2741 error at line 27 col 3 (the `return {` opening of
`buildPropertyStub`) naming `sellerMotivation`. No other errors surfaced,
so the safety valve ("if any additional error surfaces beyond the one
TS2741, STOP and re-scope") does NOT trip.

**Fix**: added `sellerMotivation: null,` to `buildPropertyStub`'s returned
`PropertyData` object, slotted immediately after `utilities: null,` to
match `emptyProperty()` ordering in
`src/data/propertyNegotiation.ts:123-124`.

**Post-fix typecheck** (`npm run typecheck`): exits 0.

**Verification**: `grep -rn "@ts-nocheck" src/` returns zero matches; the
0005 baseline grandfathering is now fully closed.
