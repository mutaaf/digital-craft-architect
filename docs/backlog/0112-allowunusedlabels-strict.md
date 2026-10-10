---
id: 0112
title: Enable allowUnusedLabels strict flag (zero-fix ratchet)
status: in-progress
priority: P2
area: infra
created: 2026-10-09
owner: eng-dev
---

## Problem

Ticket 0111 (allowUnreachableCode, shipped 2026-10-09) explicitly
pre-authorized this follow-up in its "Out of scope" section:

> `allowUnusedLabels: false` (0 errors today). Deferred to its own
> follow-up ticket at the next free id (0112). Bundling here would violate
> the 2026-05-22 "one zero-error flag per ticket" rule.

Isolated measurement re-run on today's `main` (2026-10-09, Node 20,
`npx tsc -p tsconfig.app.json --noEmit --allowUnusedLabels`): exit 0,
zero errors. The measurement from the 0111 ticket (`allowUnusedLabels`
at 0 errors) holds unchanged, as required by the 2026-05-26
re-measurement rule.

Per the 2026-05-22 "ratchet one zero-error flag at a time" rule, this
ticket flips only `allowUnusedLabels`. It is the final remaining
zero-cost strict-family flag; the next unflipped flags
(`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) surface many
errors on today's `main` and require their own groomed source-edit
tickets.

## Why now

`allowUnusedLabels: false` is zero-cost right now, so flipping it is a
pure foreclosure of a future regression class: a contributor who writes
a labeled statement (`outer: for (...)`) and never uses the label in a
`break outer;` or `continue outer;` will fail typecheck locally and in
CI instead of silently landing dead syntax. The window to lock it in
cheaply closes the moment any contributor merges a function that trips
it; every strict flag ratcheted today reduces the surface a future
refactor could silently reopen.

## Acceptance criteria

- [ ] `tsconfig.app.json` "Linting" block adds `"allowUnusedLabels": false`
      inside the existing block, immediately after `"allowUnreachableCode":
      false,`. Every other line stays untouched; no reordering. Follows
      0064/0068/0110/0111's single-line-add pattern.
- [ ] `npm run typecheck` exits 0 on the branch with the flag on. No source
      edits are required (prove-first: zero errors on today's `main`).
- [ ] Prove-first recorded in the Implementation log: with
      `allowUnusedLabels: false` ON and no source edits, running
      `npx tsc -p tsconfig.app.json --noEmit` on the branch's first commit
      exits 0 and prints 0 errors. (If any error surfaces that was not seen
      on `main` at ticket-creation time, STOP and re-scope - this ticket
      assumes the measurement holds.)
- [ ] No rendered-output / copy / runtime behavior change. The flag is a
      compile-time check only.
- [ ] No `/api/`, `.env*`, or dependency changes (`package-lock.json`
      unchanged).
- [ ] `node scripts/check-backlog.mjs` passes (ticket file status and README
      index row in sync).
- [ ] `tsconfig.node.json` is intentionally NOT edited (same reasoning as
      0007/0008/0064/0110/0111: the typecheck gate targets `tsconfig.app.json`
      only).
- [ ] `tsconfig.json` (the project-references root) is intentionally NOT
      edited (same reasoning as 0007/0008/0064/0110/0111).

## Out of scope

- `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` - expected to
  surface many errors; separate groomed tickets with real source edits.
- Any refactor beyond flipping the single flag. If the prove-first
  measurement surfaces any error on the branch, STOP and re-scope down.

## Engineering notes

- File: `tsconfig.app.json`, the "Linting" block. One-line add after
  `"allowUnreachableCode": false,`: `"allowUnusedLabels": false`.
- Note the asymmetry (same as 0111): unlike the other strict-family flags
  which are flipped ON (`true`), `allowUnusedLabels` defaults to
  `undefined` (which allows unused labels with no warning) and must be
  set to `false` to activate the check. Setting `true` would allow it;
  setting `false` disallows it. This is a tsc quirk, not a typo.
- No source edits expected. Prove-first measurement already run at ticket
  creation (2026-10-09, Node 20, `npx tsc -p tsconfig.app.json --noEmit
  --allowUnusedLabels`): exit 0, zero errors.
- New deps: no. Schema migration: no. Privacy/security surface change: no.
- Local Node default may be v16.14 which cannot run
  `scripts/sync-classes-data.ts` (uses `import.meta.dirname`). Before any
  npm script that triggers `sync:classes` (typecheck, build), prepend a
  Node 20 PATH. CI uses Node 20 so this is local-env-only (same lesson as
  0008/0064/0110/0111).
- Local gate per AGENTS.md § Agent parameters:
  `npm run lint && npm run typecheck && npm run check-links && npm run
  check-images && npm run check-meta && npm run check-blog-dates && node
  scripts/check-backlog.mjs && npm run build`.

## Implementation log

### 2026-10-09 - eng-dev - prove-first measurement with flag ON

Branched `eng/0112-allowunusedlabels-strict` from `main` (carrying the
groomed ticket file + README index row as the first commit, since no
groomer exists for the eng backlog per the 2026-05-22 bootstrap lesson).

Flipped `tsconfig.app.json` "Linting" block: added one line
`"allowUnusedLabels": false,` immediately after `"allowUnreachableCode":
false,`. No other lines in that file or in `tsconfig.node.json` /
`tsconfig.json` changed. Zero source edits.

Ran the prove-first typecheck on the branch with the flag enabled (Node
20 via `~/.nvm/versions/node/v20.19.0/bin` on PATH, matching CI):

```
npx tsc -p tsconfig.app.json --noEmit
```

Result: exit code 0, no stdout/stderr lines. Zero errors. The 2026-10-09
ticket-creation measurement (`npx tsc -p tsconfig.app.json --noEmit
--allowUnusedLabels` -> exit 0, 0 errors) holds on today's `main` with
the flag flipped persistently in the config instead of passed as a CLI
arg.
