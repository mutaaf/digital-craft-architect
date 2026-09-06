---
id: 0068
title: Enable noUnusedLocals strict flag (12 fixes)
status: in-progress
priority: P2
area: infra
created: 2026-09-06
owner: eng-dev
---

## Problem

Ticket 0064 (shipped 2026-09-06) flipped `noUnusedParameters: true` as the
smallest strict-family follow-up and explicitly pre-authorized this ticket in
its "Out of scope" section:
*"`noUnusedLocals` (12 errors today, up from 11 on 2026-05-26 due to unrelated
source drift). Deferred to its own follow-up ticket (next free id after this
one)."*

Per the 2026-05-26 lesson ("Re-measure strict-family flags on TODAY's main")
and the 2026-05-22 lesson ("Ratchet tsconfig strictness one zero-error flag at
a time"), I re-ran the isolated-flag measurement on today's `main`
(`tsc -p tsconfig.app.json --noEmit --<flag>`, sequential):

| flag | 2026-09-06 (0064 table) | 2026-09-06 (today, re-measured) |
|------|-------------------------|---------------------------------|
| `noUnusedLocals` | 12 | **12** |
| `noUnusedParameters` | 3 (shipped in 0064) | 0 (already on) |
| `strictNullChecks` | 0 (already on via `strict`) | 0 (already on) |
| `strict` | 0 (already on) | 0 (already on) |

`noUnusedLocals` is stable at 12 fixable, behavior-preserving errors. This is
the LAST strict-family flag remaining on the deferral list, so shipping it
closes out the multi-ticket strictness ratchet begun by 0007 (2026-05-22) and
continued through 0008 and 0064.

Today's twelve errors (all TS6133 / TS6196, all delete-only or trivial
signature edits with no runtime effect):

```
src/components/construction/negotiator/FollowUpChat.tsx(3,1): error TS6133: 'Button' is declared but its value is never read.
src/components/ContactForm.tsx(197,9): error TS6133: 'canAdvance' is declared but its value is never read.
src/components/Hero.tsx(10,10): error TS6133: 'tapCount' is declared but its value is never read.
src/components/Hero.tsx(25,13): error TS6133: 'resetTimer' is declared but its value is never read.
src/pages/compare/GoHighLevel.tsx(19,3): error TS6133: 'DollarSign' is declared but its value is never read.
src/pages/compare/HubSpot.tsx(15,3): error TS6133: 'ArrowRight' is declared but its value is never read.
src/pages/construction/InvoiceGenerator.tsx(12,3): error TS6133: 'FileText' is declared but its value is never read.
src/pages/construction/InvoiceGenerator.tsx(20,3): error TS6133: 'Download' is declared but its value is never read.
src/pages/construction/SMSSequence.tsx(14,3): error TS6133: 'ArrowRight' is declared but its value is never read.
src/pages/construction/VoiceNegotiator.tsx(22,38): error TS6196: 'TranscriptEntry' is declared but never used.
src/pages/Index.tsx(2,8): error TS6133: 'React' is declared but its value is never read.
src/pages/SmallBusiness.tsx(28,3): error TS6133: 'Clock' is declared but its value is never read.
```

## Why now

`noUnusedLocals` is the last strict-family flag left on the deferral list, and
every one of today's 12 errors is a delete-only fix (unused import, unused
type import, unused function whose caller uses a different code path, or
destructuring where the value is never read). Locking the flag in permanently
forecloses a class of dead-code drift (imports that survive a refactor, state
values whose readers were removed) and closes out the strict-family ratchet
started by 0007 (2026-05-22). Every strict-family flag we ratchet today
reduces the surface a future refactor could silently reopen.

## Acceptance criteria

- [ ] `tsconfig.app.json` "Linting" block sets `"noUnusedLocals": true`
      (single-line flip: `false` -> `true`). Every other tsconfig line stays
      untouched. Mirrors 0064's diff-narrowing pattern of keeping unrelated
      flag changes out of a single-flag ratchet PR.
- [ ] `npm run typecheck` exits 0 on the branch after the 12 source edits +
      the config flip.
- [ ] Prove-first recorded: with `noUnusedLocals: true` ON and the source
      edits NOT yet applied, `tsc -p tsconfig.app.json --noEmit` fails with
      exactly the 12 errors listed above. Config reverted to `false` before
      the code edits (so the failure is proven to appear only with the flag
      on).
- [ ] No rendered-output / copy / runtime behavior change; the 12 edits are
      strictly dead-code cleanups. The Vitest-less repo has no unit layer, so
      behavior preservation is proven by (a) leaving every call site
      untouched (b) the smoke suite green.
- [ ] No `/api/`, `.env*`, or dependency changes (`package-lock.json`
      unchanged).
- [ ] `node scripts/check-backlog.mjs` passes (ticket file status and README
      index row in sync).

## Out of scope

- No further strict-family flag ratchets. This ticket ships the LAST flag on
  the deferral list started by 0007 (2026-05-22); after it merges, every
  strict-family flag in `tsconfig.app.json` is at `true` and no successor
  bootstrap is needed. Future TS strictness work (if any) would be a fresh
  concern, not a continuation of this ratchet series.
- `tsconfig.json` (the project-references root) is intentionally left
  untouched; the typecheck gate targets `tsconfig.app.json` only (same
  reasoning as 0007/0008/0064).
- Any refactor beyond the minimum edit to silence each of the 12 named
  errors. If any edit turns out to require a call-site change, STOP and
  re-scope down - this ticket assumes all 12 are true no-touch-runtime
  fixes.

## Engineering notes

- File: `tsconfig.app.json`, the "Linting" block. One-line change:
  `"noUnusedLocals": false` -> `"noUnusedLocals": true`.
- Source edits (12 total, all behavior-preserving):
  - `src/components/construction/negotiator/FollowUpChat.tsx:3` - drop the
    unused `Button` import (the file uses ChatInput / ChatBubble instead).
  - `src/components/ContactForm.tsx:197` - delete the unused `canAdvance`
    helper (dead code; `handleNext` uses `form.trigger` and never reads
    `canAdvance`).
  - `src/components/Hero.tsx:10` - rewrite the destructured pair to
    `const [, setTapCount] = useState(0)`. The value slot is never read; only
    the setter is used (with a functional updater). See leading-underscore
    gotcha below.
  - `src/components/Hero.tsx:25` - drop the `const resetTimer =` binding, keep
    the bare `setTimeout(() => setTapCount(0), 2000)` call. The setTimeout
    runs to completion whether or not its return is bound; the reset behavior
    is preserved.
  - `src/pages/compare/GoHighLevel.tsx:19` - drop the unused `DollarSign`
    import from the lucide-react import list.
  - `src/pages/compare/HubSpot.tsx:15` - drop the unused `ArrowRight` import
    from the lucide-react import list.
  - `src/pages/construction/InvoiceGenerator.tsx:12,20` - drop the unused
    `FileText` and `Download` imports from the lucide-react import list.
  - `src/pages/construction/SMSSequence.tsx:14` - drop the unused `ArrowRight`
    import from the lucide-react import list.
  - `src/pages/construction/VoiceNegotiator.tsx:22` - drop the unused
    `TranscriptEntry` type from the type-only import list (TS6196).
  - `src/pages/Index.tsx:2` - drop the unused default `React` import. Vite's
    SWC JSX transform is automatic (`jsx: "react-jsx"` in tsconfig), so the
    default import is not needed. Verified no `React.` qualified reference
    exists in the file.
  - `src/pages/SmallBusiness.tsx:28` - drop the unused `Clock` import from
    the lucide-react import list.
- Leading-underscore-in-destructure gotcha (mirror of 0064's calendar.tsx
  case): TS's `noUnusedLocals` convention for suppressing TS6133 with a
  leading `_` applies to a bare local binding, NOT to a slot inside an array-
  destructuring pattern. `const [_tapCount, setTapCount] = useState(0)`
  would NOT satisfy the check - the destructured slot IS the local. Empty
  slot (`const [, setTapCount] = useState(0)`) is the clean fix, same
  drop-the-binding family as 0064's parameter deletes.
- New deps: no. Schema migration: no. Privacy/security surface change: no.
- Local Node default may be v16.14 which can't run `scripts/sync-classes-data.ts`
  (uses `import.meta.dirname`). Before any npm script that triggers
  `sync:classes` (typecheck, build), prepend a Node 20 PATH. CI uses Node 20
  so this is local-env-only (same lesson as 0008 / 0064).

## Implementation log

(Appended by the eng-dev agent during execution.)
