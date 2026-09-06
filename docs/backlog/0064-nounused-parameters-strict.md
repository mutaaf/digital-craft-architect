---
id: 0064
title: Enable noUnusedParameters strict flag (3 fixes)
status: in-progress
priority: P2
area: infra
created: 2026-09-06
owner: eng-dev
---

## Problem

Ticket 0008 (shipped 2026-05-26) flipped `strict: true` as a zero-cost ratchet
and explicitly pre-authorized this follow-up in its "Out of scope" section:
*"`noUnusedLocals` (11 errors today) and `noUnusedParameters` (3 errors today).
They require real source edits ... Deferred to a future ticket (next free id)."*

Per the 2026-05-26 lesson ("Re-measure strict-family flags on TODAY's main")
and the 2026-05-22 lesson ("Ratchet tsconfig strictness one zero-error flag at a
time"), I re-ran the isolated-flag measurement on today's `main`
(`tsc -p tsconfig.app.json --noEmit --<flag>`, sequential):

| flag | 2026-05-26 (0008 table) | 2026-09-06 (today) |
|------|-------------------------|--------------------|
| `noUnusedParameters` | 3 | **3** |
| `noUnusedLocals` | 11 | 12 |

`noUnusedParameters` is stable at 3 fixable, behavior-preserving errors. This
ticket ships that flag ONLY (one zero-error-after-fix flag per ticket per the
2026-05-22 rule). `noUnusedLocals` drifted from 11 to 12 (unrelated source
motion) and remains its own follow-up (see Out of scope).

Today's three errors:

```
src/components/ui/calendar.tsx(55,20): error TS6133: '_props' is declared but its value is never read.
src/components/ui/calendar.tsx(56,21): error TS6133: '_props' is declared but its value is never read.
src/utils/sentry.ts(60,23): error TS6133: 'hint' is declared but its value is never read.
```

## Why now

`noUnusedParameters` is the smallest strict-family flag left on the deferral
list (3 errors versus `noUnusedLocals`'s 12), each fixable with a rename or a
delete-the-arg edit that provably does not touch runtime behavior. Locking it
in now permanently forecloses a class of "declared parameter that lies about
what the function reads" regressions and shrinks the deferral queue by one flag
before shipping the harder `noUnusedLocals` batch as its own ticket. Every
strict-family flag we ratchet today reduces the surface a future refactor could
silently reopen.

## Acceptance criteria

- [ ] `tsconfig.app.json` "Linting" block sets `"noUnusedParameters": true`
      (single-line flip: `false` -> `true`). Every other tsconfig line stays
      untouched, including `"noUnusedLocals": false` (kept as-is; separate
      out-of-scope ticket). Mirrors 0008's diff-narrowing pattern of keeping
      unrelated flag changes out of a single-flag ratchet PR.
- [ ] `npm run typecheck` exits 0 on the branch after the three source edits +
      the config flip.
- [ ] Prove-first recorded: with `noUnusedParameters: true` ON and the source
      edits NOT yet applied, `tsc -p tsconfig.app.json --noEmit` fails with
      exactly the three TS6133 errors listed above. Config reverted to `false`
      before the code edits (so the failure is proven to appear only with the
      flag on).
- [ ] No rendered-output / copy / runtime behavior change; the three edits are
      strictly parameter-signature cleanups. The Vitest-less repo has no unit
      layer, so behavior preservation is proven by (a) leaving every call site
      untouched (b) the smoke suite green.
- [ ] No `/api/`, `.env*`, or dependency changes (`package-lock.json`
      unchanged).
- [ ] `node scripts/check-backlog.mjs` passes (ticket file status and README
      index row in sync).

## Out of scope

- `noUnusedLocals` (12 errors today, up from 11 on 2026-05-26 due to unrelated
  source drift). Deferred to its own follow-up ticket (next free id after
  this one). Bundling it here would violate the 2026-05-22 "one zero-error
  flag at a time" rule — the 12 unused-locals errors need real deletes /
  inlines with behavior-preserving review per site, and mixing them into a
  3-parameter flip would widen the diff and mask which source edit answers
  which strict flag.
- `tsconfig.json` (the project-references root) is intentionally left
  untouched; the typecheck gate targets `tsconfig.app.json` only (same
  reasoning as 0007/0008).
- Any refactor beyond the minimum edit to silence each of the three named
  errors. If any edit turns out to require a call-site change, STOP and
  re-scope down — this ticket assumes all three are true no-touch-runtime
  fixes.

## Engineering notes

- File: `tsconfig.app.json`, the "Linting" block. One-line change:
  `"noUnusedParameters": false` -> `"noUnusedParameters": true`.
- Source edits (three total, all behavior-preserving):
  - `src/components/ui/calendar.tsx:55-56` — `IconLeft` and `IconRight` render
    a fixed-size `<ChevronLeft/Right className="h-4 w-4" />` and use nothing
    from their props. Drop the parameter entirely
    (`() => <ChevronLeft ... />`). react-day-picker calls these components
    with a props object; JSX components ignore arguments they don't declare,
    so dropping the parameter is a pure signature change with no call-site
    effect.
  - `src/utils/sentry.ts:60` — `beforeSend(event, hint)` is a Sentry SDK
    callback. Rename `hint` -> `_hint`. The SDK invokes the callback
    positionally and does not care what the parameter is named.
- Leading-underscore-in-destructure gotcha (see LESSONS candidate): TS's
  `noUnusedParameters` convention for suppressing TS6133 with a leading `_`
  applies to the PARAMETER NAME, not to a rest-binding inside a destructured
  object pattern. Today's calendar.tsx code already uses
  `({ ..._props }) => ...`, which does not satisfy the convention — the
  destructured pattern is the parameter, and `_props` is a rest-binding
  inside it, not the parameter name. Renaming the pattern's rest-target
  doesn't help; the whole pattern still counts as an unused parameter. The
  clean fix (used here) is to drop the parameter entirely, since these two
  components use no props.
- New deps: no. Schema migration: no. Privacy/security surface change: no.
- Local Node default may be v16.14 which can't run `scripts/sync-classes-data.ts`
  (uses `import.meta.dirname`). Before any npm script that triggers
  `sync:classes` (typecheck, build), prepend a Node 20 PATH. CI uses Node 20
  so this is local-env-only (same lesson as 0008).

## Implementation log

(Appended by the eng-dev agent during execution.)
