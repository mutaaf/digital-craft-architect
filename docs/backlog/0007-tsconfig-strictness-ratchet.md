---
id: 0007
title: Ratchet tsconfig strictness (zero-cost flags)
status: in-progress
priority: P1
area: infra
created: 2026-05-22
owner: eng-dev
---

## Problem

`tsconfig.app.json` has the entire strict family turned OFF (`strict`,
`noUnusedLocals`, `noUnusedParameters`, `noImplicitAny`,
`noFallthroughCasesInSwitch` all `false`). That means whole classes of latent
bugs — untyped (implicit-`any`) parameters and accidental `switch` fallthrough —
compile and merge silently even with the type-check gate from 0005 in place,
because the gate only enforces the (lax) flags that are currently on.

Ticket 0005 explicitly pre-authorized this follow-up in its "Out of scope":
*"Tightening tsconfig strictness (`strict`, `strictNullChecks`, etc.) — separate
follow-up ticket once the baseline is clean."* The baseline is now clean
(`npm run typecheck` passes 0 errors on `main`), so the ratchet can begin.

Each strict-family flag was measured individually against the current baseline
(after `npm run sync:classes`, `tsc -p tsconfig.app.json --noEmit --<flag>`):

| flag | new errors |
|------|-----------|
| `noImplicitAny` | 0 |
| `noFallthroughCasesInSwitch` | 0 |
| `noUnusedParameters` | 3 |
| `strictNullChecks` | 9 |
| `strict` | 9 |
| `noUnusedLocals` | 11 |

This ticket enables ONLY the two zero-error flags. Because they cost 0 errors
they are pure guards: they change no current code, but they fail CI the moment
someone introduces an implicit-`any` or a switch fallthrough. The higher-count
flags require real source fixes and are deferred to follow-up 0008.

## Why now

The two zero-cost flags are the cheapest possible strictness win: enabling them
is config-only (0 typecheck errors, no source edits), yet they immediately close
two real regression channels that the 0005 gate currently lets through. Locking
them in now ratchets the floor up at no cost and shrinks the surface 0008 has to
reason about.

## Acceptance criteria

- [ ] `tsconfig.app.json` sets `noImplicitAny: true` and
      `noFallthroughCasesInSwitch: true`.
- [ ] `npm run typecheck` exits 0 on the branch (config-only; no source files
      changed).
- [ ] Prove-first recorded: a deliberate implicit-any + a deliberate switch
      fallthrough fail typecheck with the flags on (TS7006 + TS7029); reverted.
- [ ] No rendered-output / copy / runtime behavior change; smoke suite green.
- [ ] No `/api/`, `.env*`, or dependency changes (package-lock unchanged).
- [ ] `node scripts/check-backlog.mjs` passes (ticket file status and README
      index row in sync).

## Out of scope

- The higher-count strict-family flags (`noUnusedParameters` = 3,
  `strictNullChecks` = 9, `strict` = 9, `noUnusedLocals` = 11). They require real
  code fixes and behavior-preserving review → follow-up ticket 0008.
- `tsconfig.json` (the project-references root) is intentionally left untouched;
  the typecheck gate targets `tsconfig.app.json` only, so aligning the root is
  not part of this ratchet.
- Any source-file edits. This is a config-only change. If enabling either flag
  surfaces an error, STOP and re-scope down — do not start fixing source here.

## Engineering notes

- File: `tsconfig.app.json`, the "Linting" block.
- Flip `"noImplicitAny": false` -> `true` and
  `"noFallthroughCasesInSwitch": false` -> `true`. Leave `strict`,
  `noUnusedLocals`, `noUnusedParameters` (and the implied `strictNullChecks`)
  as-is.
- Per-flag measurement (after `npm run sync:classes`,
  `tsc -p tsconfig.app.json --noEmit --<flag>`):

  | flag | new errors |
  |------|-----------|
  | `noImplicitAny` | 0 |
  | `noFallthroughCasesInSwitch` | 0 |
  | `noUnusedParameters` | 3 |
  | `strictNullChecks` | 9 |
  | `strict` | 9 |
  | `noUnusedLocals` | 11 |

- New deps: no. Schema migration: no. Privacy/security surface change: no.

## Implementation log

(Appended by the eng-dev agent during execution.)
