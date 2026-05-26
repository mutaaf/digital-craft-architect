---
id: 0008
title: Enable strict tsconfig flag (zero-cost ratchet)
status: in-progress
priority: P1
area: infra
created: 2026-05-26
owner: eng-dev
---

## Problem

Ticket 0007 ratcheted on the two strict-family flags that measured 0 errors at
the time (`noImplicitAny`, `noFallthroughCasesInSwitch`), and explicitly
pre-authorized this follow-up in its "Out of scope" section: *"The higher-count
strict-family flags (`noUnusedParameters` = 3, `strictNullChecks` = 9,
`strict` = 9, `noUnusedLocals` = 11). They require real code fixes and
behavior-preserving review -> follow-up ticket 0008."*

Re-measuring each strict-family flag in isolation against today's `main`
(after `npm run sync:classes`, `tsc -p tsconfig.app.json --noEmit --<flag>`,
flag passes run SEQUENTIALLY per the 2026-05-22 lesson on concurrent tsc):

| flag | 2026-05-22 (0007) | 2026-05-26 (today) |
|------|-------------------|--------------------|
| `noImplicitAny` | 0 (now ON) | n/a |
| `noFallthroughCasesInSwitch` | 0 (now ON) | n/a |
| `strictNullChecks` | 9 | **0** |
| `strict` (meta) | 9 | **0** |
| `noUnusedParameters` | 3 | 3 |
| `noUnusedLocals` | 11 | 11 |

The nine null-check holes 0007 measured were inadvertently closed by source
that landed in tickets 0009-0015. The `strict` meta-flag (which implies
`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`,
`strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`,
`alwaysStrict`, `useUnknownInCatchVariables`) is now a zero-cost ratchet -
exactly mirroring 0007's pattern. Per the 2026-05-22 lesson "enable only flags
at 0 errors as a pure config-only guard," this ticket turns on `strict: true`
and nothing else. `noUnusedLocals` (11) and `noUnusedParameters` (3) are
separate additional-checks flags (not implied by `strict`); they still cost
real source edits and are deferred to a future ticket (next free id after
this one).

## Why now

`strict: true` at 0 errors is the cheapest possible strictness win. It's
config-only - no source files change - yet it permanently closes seven
regression channels at once (null-deref, untyped-this, missing class-property
init, bivariant function params, sloppy bind/call/apply, parse-mode laxness,
and untyped catch variables). Locking it in immediately prevents a future
source change from silently reopening any of them. Today is exactly the window
the 0007 lesson identified: re-measure the deferred flags whenever code lands;
the moment a flag goes to 0, ratchet it.

## Acceptance criteria

- [ ] `tsconfig.app.json` "Linting" block sets `"strict": true`. The existing
      `"noImplicitAny": true` line is left in place even though `strict`
      implies it: removing it would be a behavior-neutral but diff-widening
      semantic change that adds a review distraction unrelated to the
      ratchet. Keeping it makes the diff a single line flip
      (`"strict": false -> true`). Same for `"noUnusedLocals": false` and
      `"noUnusedParameters": false` - kept as-is (those flags are out of
      scope, and `strict` does not imply them anyway).
- [ ] `npm run typecheck` exits 0 on the branch (config-only; no source edits).
- [ ] Prove-first recorded: with `strict: true` ON, a deliberate
      `strictNullChecks` violation AND a deliberate `strictPropertyInitialization`
      violation each fail typecheck (TS2322 + TS2564); flipping `--strict false`
      makes both errors disappear, establishing the gap this closes. Both
      reverted before commit (no fixture in the diff).
- [ ] No rendered-output / copy / runtime behavior change; smoke suite green.
- [ ] No `/api/`, `.env*`, or dependency changes (`package-lock.json`
      unchanged).
- [ ] `node scripts/check-backlog.mjs` passes (ticket file status and README
      index row in sync).

## Out of scope

- `noUnusedLocals` (11 errors today) and `noUnusedParameters` (3 errors
  today). They require real source edits (deletes of unused symbols, or `_`
  renames for intentionally-unused parameters) and behavior-preserving review.
  Deferred to a future ticket (next free id).
- `tsconfig.json` (the project-references root) is intentionally left
  untouched; the typecheck gate targets `tsconfig.app.json` only, so aligning
  the root is not part of this ratchet (same reasoning as 0007).
- Any source-file edits. This is a config-only change. If turning on
  `strict: true` surfaces ANY typecheck error on the branch, STOP and
  re-scope down to whichever single sub-flag is still at 0 errors today
  (e.g. just `strictNullChecks: true`) - do not start fixing source here.
  The 2026-05-22 lesson is explicit that zero-cost ratchets are config-only.

## Engineering notes

- File: `tsconfig.app.json`, the "Linting" block.
- One-line change: `"strict": false` -> `"strict": true`. Leave
  `noImplicitAny`, `noFallthroughCasesInSwitch`, `noUnusedLocals`,
  `noUnusedParameters` as-is.
- Per-flag re-measurement, sequential (after `npm run sync:classes`,
  `tsc -p tsconfig.app.json --noEmit --<flag>`):

  | flag | new errors |
  |------|-----------|
  | `noImplicitAny` | n/a (already on) |
  | `noFallthroughCasesInSwitch` | n/a (already on) |
  | `strictNullChecks` | 0 |
  | `strict` | 0 |
  | `noUnusedParameters` | 3 |
  | `noUnusedLocals` | 11 |

- New deps: no. Schema migration: no. Privacy/security surface change: no.
- Local Node default is v16.14 which can't run `scripts/sync-classes-data.ts`
  (uses `import.meta.dirname`). Before any npm script that triggers
  `sync:classes` (typecheck, build), prepend the PATH:
  `export PATH="/Users/.../.nvm/versions/node/v20.19.0/bin:$PATH"`. CI uses
  Node 20 so this is local-env-only.

## Implementation log

(Appended by eng-dev during execution.)
