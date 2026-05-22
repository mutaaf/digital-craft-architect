---
id: 0005
title: Add CI type-check gate (tsc --noEmit)
status: shipped
priority: P1
area: infra
created: 2026-05-22
owner: eng-dev
---

## Problem

The `build` script is `vite build` (SWC), which transpiles **without type-checking**;
ESLint is configured but does not run the TypeScript type-checker either. So type
errors merge silently. CLAUDE.md even claims "npm run build catches type errors" —
that is false for SWC. Today `npx tsc -p tsconfig.app.json --noEmit` reports **11
errors across `src/`**, several of which are real latent bugs (see below). Nothing
in CI catches them or stops new ones from accumulating.

This is engineering build-health / type-safety work, not a user-facing change. The
goal is to add a type-check gate and grandfather the current baseline so NEW type
errors fail CI, while the pre-existing user-facing bugs are handed to the feature
loop (this ticket must not change any rendered output, copy, or runtime behavior).

## Why now

A type-check gate is the cheapest durable guard against an entire class of silent
regressions. The codebase already has the type errors; without a gate the count
only grows. `typescript` is already a devDependency — no new dependency required.

## Acceptance criteria

- [ ] `npm run typecheck` exists and runs `npm run sync:classes` (to materialize the
      gitignored generated `api/_classesData` file) then `tsc -p tsconfig.app.json --noEmit`.
- [ ] `npm run typecheck` exits 0 on the branch (baseline made green; see plan).
- [ ] A "Type check" step is added to the **existing `build` job** in
      `.github/workflows/ci.yml` (before the Build step). No new gating check name is
      introduced — `build` and `smoke-required` remain the only required checks.
- [ ] `npm run typecheck` is added to the AGENTS.md local-gate command line.
- [ ] Prove-first: demonstrate (in the implementation log) that with a deliberate
      type error introduced, `npm run build` still passes while `npm run typecheck`
      fails — then revert the deliberate error.
- [ ] No change to any rendered output, copy, or runtime behavior. Smoke suite green.
- [ ] No `/api/`, `.env*`, or dependency changes (package-lock unchanged).

## Out of scope

- Fixing the user-facing `useContent().data` footer bug (Glossary, Industries,
  compare/HubSpot, compare/GoHighLevel render `<Footer data={data.footer}/>` but the
  hook returns `content`, so the footer never renders). That is a VISUAL behavior
  change → feature loop. Grandfather these files here; flag the bug for groom.
- Supplying the missing `sellerMotivation` field in VoiceBookingAgent's property
  stub (would change the voice prompt) → feature loop. Grandfather here.
- Tightening tsconfig strictness (`strict`, `strictNullChecks`, etc.) — separate
  follow-up ticket once the baseline is clean.

## Engineering notes

After `npm run sync:classes`, current `tsc -p tsconfig.app.json --noEmit` errors:

FIX (type-only, behavior-preserving — keep rendered output identical):
- `src/pages/RealEstate.tsx` — `Phone` imported twice (lines 24 and 39, same
  lucide-react block). Remove the duplicate import. Zero behavior change.
- `src/components/construction/CompanySetupForm.tsx` — `VERTICAL_PLACEHOLDERS:
  Record<Vertical,string>` defines 3 of 12 verticals. Change to
  `Partial<Record<Vertical,string>>`. Access site is a placeholder (`string | undefined`
  is fine); no other change needed.
- `src/App.tsx` — local `FallbackProps.error: Error` doesn't match Sentry's
  `FallbackRender` (`error: unknown`). Change `error: Error` → `error: unknown` and at
  the render site narrow: `{(error instanceof Error ? error.message : String(error)) ||
  "An unexpected error occurred"}`. Output identical for the normal Error case.
- `src/utils/websiteScraper.ts` — three maps (`VERTICAL_DEFAULTS`,
  `VERTICAL_EXTRACTION_PROMPTS`, `VERTICAL_LABELS`) typed `Record<Vertical,...>` but
  define only construction/realestate/events. Change each to
  `Partial<Record<Vertical,...>>` and add a non-null assertion at the access sites
  (`VERTICAL_DEFAULTS[vertical]!`, etc.) — callers only pass supported verticals, so
  runtime is unchanged. SAFETY VALVE: if this needs more than ~4 assertions or any
  behavior change, grandfather this file instead.

GRANDFATHER (add `// @ts-nocheck` as the first line + a `// TODO(eng): typecheck
baseline, see docs/backlog/0005` comment; do NOT change runtime). These are
user-facing behavior bugs owned by the feature loop:
- `src/pages/Glossary.tsx`, `src/pages/Industries.tsx`,
  `src/pages/compare/HubSpot.tsx`, `src/pages/compare/GoHighLevel.tsx` — `data`
  should be `content`; the footer silently never renders today.
- `src/pages/events/VoiceBookingAgent.tsx` — property stub missing required
  `sellerMotivation`.

Note: pages are statically imported in App.tsx, so `tsconfig` `exclude` will NOT
suppress their errors (tsc checks transitively-imported files) — grandfathering must
be inline `// @ts-nocheck`.

Wiring:
- `package.json`: add `"typecheck": "npm run sync:classes && tsc -p tsconfig.app.json --noEmit"`.
  (Eng queue may touch package.json scripts; this adds NO dependency.)
- `.github/workflows/ci.yml`: add a "Type check" step (`npm run typecheck`) in the
  `build` job, before "Build".
- `AGENTS.md` § Agent parameters: add `npm run typecheck &&` to the local gate command.
- `CLAUDE.md` "Testing" section: correct the misleading "npm run build catches type
  errors" line to reference `npm run typecheck`.

New deps: no. Schema migration: no. Privacy/security surface change: no.

## Implementation log

### 2026-05-22 - eng-dev

- Branch `eng/0005-typecheck-ci-gate`. First commit flips status groomed -> in-progress
  in both the ticket frontmatter and the README index row (in sync).
- Re-verified baseline: after `npm run sync:classes`,
  `npx tsc -p tsconfig.app.json --noEmit` reports 11 errors across `src/`, matching the
  Engineering notes exactly.
- PROVE-FIRST (no committed fixture): temporarily added
  `const __proveFirst: number = "this is a deliberate type error";` to `src/main.tsx`.
  - `npm run build` -> EXIT 0 (`✓ built`), i.e. SWC transpiles the bad type silently.
  - `npx tsc -p tsconfig.app.json --noEmit` -> FAILS:
    `src/main.tsx(8,7): error TS2322: Type 'string' is not assignable to type 'number'.`
  - Reverted the deliberate error; `git diff src/main.tsx` is empty. This demonstrates
    the gap (build does not type-check) and that the new `typecheck` gate closes it.
- FIXED (type-only, behavior-preserving): `src/pages/RealEstate.tsx` (dup `Phone`
  import), `src/components/construction/CompanySetupForm.tsx`
  (`Partial<Record<Vertical,string>>`), `src/App.tsx` (`error: unknown` +
  `instanceof Error` narrowing, output identical), `src/utils/websiteScraper.ts`
  (three maps -> `Partial<Record<...>>` + non-null assertions at the 4 access sites;
  within the safety-valve budget, no behavior change).
- GRANDFATHERED (`// @ts-nocheck` + TODO(eng) baseline comment, no runtime change;
  user-facing bugs owned by the feature loop): `src/pages/Glossary.tsx`,
  `src/pages/Industries.tsx`, `src/pages/compare/HubSpot.tsx`,
  `src/pages/compare/GoHighLevel.tsx` (footer `data` vs `content`),
  `src/pages/events/VoiceBookingAgent.tsx` (missing `sellerMotivation`).
- Wiring: `package.json` `typecheck` script (no dep change), `ci.yml` "Type check"
  step in the existing `build` job before "Build", AGENTS.md local gate, CLAUDE.md
  Testing note corrected.
- Gotcha: the typescript-eslint preset bans `@ts-nocheck`
  (`@typescript-eslint/ban-ts-comment`), so a bare `// @ts-nocheck` turned 5 lint
  WARNINGS-only files into lint ERRORS and broke `npm run lint`. Fixed by prefixing
  each grandfathered file with `/* eslint-disable @typescript-eslint/ban-ts-comment */`
  above the `// @ts-nocheck`. Verified tsc still honors `@ts-nocheck` with a leading
  comment, and lint returns to its warnings-only baseline.
