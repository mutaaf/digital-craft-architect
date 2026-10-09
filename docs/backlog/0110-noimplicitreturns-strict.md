---
id: 0110
title: Enable noImplicitReturns strict flag (zero-fix ratchet)
status: shipped
priority: P2
area: infra
created: 2026-10-06
owner: eng-dev
---

## Problem

Tickets 0007/0008/0064/0068/0085 progressively ratcheted `tsconfig.app.json`
strictness one zero-error-after-fix flag at a time (per the 2026-05-22
"ratchet one zero-error flag at a time" lesson). The strict-family has one
remaining zero-cost flag that today's `main` already satisfies:

Isolated measurement on today's `main`, Node 20,
`tsc -p tsconfig.app.json --noEmit --<flag>`:

| flag | errors on 2026-10-06 main |
|------|---------------------------|
| `noImplicitReturns` | **0** |
| `allowUnreachableCode` (set to `false`) | 0 |
| `allowUnusedLabels` (set to `false`) | 0 |

Per the 2026-05-22 rule, one flag per ticket. This ticket ratchets
`noImplicitReturns` only — the only flag of the three that actively adds a
distinct code-correctness check (functions that return in some paths and
implicitly `undefined` in others). The other two are deferred to their own
follow-up tickets (next free ids) so each flag's prove-first measurement is
isolated and the diff stays single-flag.

## Why now

`noImplicitReturns` is zero-cost right now, so flipping it is a pure
foreclosure of a future regression class: a reviewer adding a conditional
`return` inside an existing non-`void` function without a matching `else`
branch will fail typecheck locally and in CI instead of silently returning
`undefined`. The window to lock it in cheaply closes the moment any
contributor merges a function that trips it; every strict flag we ratchet
today reduces the surface a future refactor could silently reopen.

## Acceptance criteria

- [ ] `tsconfig.app.json` "Linting" block adds `"noImplicitReturns": true`
      inside the existing block. Every other line stays untouched; no
      reordering. Follows 0064/0068's single-line-add pattern.
- [ ] `npm run typecheck` exits 0 on the branch with the flag on. No source
      edits are required (prove-first: zero errors on today's `main`).
- [ ] Prove-first recorded in the Implementation log: with
      `noImplicitReturns: true` ON and no source edits, running
      `npx tsc -p tsconfig.app.json --noEmit` on the branch's first commit
      exits 0 and prints 0 errors. (If any error surfaces that was not seen
      on `main` at ticket-creation time, STOP and re-scope — this ticket
      assumes the measurement holds.)
- [ ] No rendered-output / copy / runtime behavior change. The flag is a
      compile-time check only.
- [ ] No `/api/`, `.env*`, or dependency changes (`package-lock.json`
      unchanged).
- [ ] `node scripts/check-backlog.mjs` passes (ticket file status and README
      index row in sync, flipped to `shipped` in the same commit that flips
      the flag).
- [ ] `tsconfig.node.json` is intentionally NOT edited (same reasoning as
      0007/0008/0064: the typecheck gate targets `tsconfig.app.json` only).
- [ ] `tsconfig.json` (the project-references root) is intentionally NOT
      edited (same reasoning as 0007/0008/0064).

## Out of scope

- `allowUnreachableCode: false` and `allowUnusedLabels: false` (both 0
  errors today). Deferred to their own follow-up tickets (next free ids).
  Bundling here would violate the 2026-05-22 "one zero-error flag per
  ticket" rule and widen the diff for no benefit.
- `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` — expected to
  surface many errors; separate groomed tickets with real source edits.
- Any refactor beyond flipping the single flag. If the prove-first
  measurement surfaces any error on the branch, STOP and re-scope down.

## Engineering notes

- File: `tsconfig.app.json`, the "Linting" block (lines 23-28). One-line
  add after `"noFallthroughCasesInSwitch": true,`:
  `"noImplicitReturns": true`.
- No source edits expected. Prove-first measurement already run at ticket
  creation (2026-10-06, Node 20, `npx tsc -p tsconfig.app.json --noEmit
  --noImplicitReturns`): exit 0, zero errors.
- New deps: no. Schema migration: no. Privacy/security surface change: no.
- Local Node default may be v16.14 which can't run
  `scripts/sync-classes-data.ts` (uses `import.meta.dirname`). Before any
  npm script that triggers `sync:classes` (typecheck, build), prepend a
  Node 20 PATH. CI uses Node 20 so this is local-env-only (same lesson as
  0008/0064).
- Local gate per AGENTS.md § Agent parameters:
  `npm run lint && npm run typecheck && npm run check-links && npm run
  check-images && npm run check-meta && npm run check-blog-dates && node
  scripts/check-backlog.mjs && npm run build`.

## Implementation log

### 2026-10-06 - eng-dev - prove-first measurement with flag ON

Branched `eng/0110-noimplicitreturns-strict` from `main` (carrying the groomed
ticket file + README index row).

Flipped `tsconfig.app.json` "Linting" block: added one line
`"noImplicitReturns": true,` immediately after `"noFallthroughCasesInSwitch": true,`.
No other lines in that file or in `tsconfig.node.json` / `tsconfig.json`
changed. Zero source edits.

Ran the prove-first typecheck on the branch with the flag enabled (Node 20
via `~/.nvm/versions/node/v20.19.0/bin` on PATH, matching CI):

```
npx tsc -p tsconfig.app.json --noEmit
```

Result: exit code 0, no stdout/stderr lines. Zero errors. The 2026-10-06
ticket-creation measurement (`npx tsc -p tsconfig.app.json --noEmit
--noImplicitReturns` -> exit 0, 0 errors) holds on today's `main` with the
flag flipped persistently in the config instead of passed as a CLI arg.

Flipped the ticket frontmatter and `docs/backlog/README.md` index row
`groomed` -> `shipped` in the same commit as the config change, per the
2026-05-22 check-backlog rule.
