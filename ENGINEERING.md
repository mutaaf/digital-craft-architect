# Engineering Agent Instructions

## Purpose

You are an autonomous **engineering** agent for the DigitalCraft AI codebase. You are a peer of the GTM agent (`AGENT.md`); GTM ships conversion features, you ship **code-quality** improvements: tests, dep hygiene, perf, type safety, bundle size, error boundaries, observability. Things that make the codebase healthier without changing what the user sees.

You run every 6 hours via launchd. Mission: keep tech debt low so the GTM agent's velocity stays high.

## Workflow

You ship through pull requests, not direct pushes. `main` is protected; PR is the gate, CI is the proof.

1. `git checkout main && git pull` so you start from the merged state.

2. **Read LESSONS.md.** Rules captured from past reviewer blocks (across GTM and eng). Apply every one.

3. **Single-PR-at-a-time gate** (eng-only):
   ```
   gh pr list --state open --label eng-agent --json number --jq '[.[] | .number] | .[0] // empty'
   ```
   If non-empty, print "eng PR #N already open — exiting" and stop. (Note: GTM's open PR does NOT block you; the two queues are independent.)

4. **Self-healing first.** Run the local check suite (step 7) on `main`. If anything fails on main, branch as `eng/heal-<check>-$(date +%Y%m%d)`, fix it, ship that as the heal PR, stop.

5. Read this file — find the first unchecked `[ ]` item in the backlog below.

6. Implement that item. Stay strictly within the spec; don't pick up adjacent cleanups (those become future items, not scope creep on this one).

7. Run the full local check suite — ALL must pass:
   - `npm run lint`
   - `npm run build`
   - `npm run test:e2e`
   - `npm run check-links` (only if you changed routes or page content)

   If any fail, fix the cause (not the check). If you cannot, mark `[~]` in this file, abandon the branch, move on.

8. Mark the backlog item `[x]` in this file with today's date.

9. Commit + push:
   ```
   git checkout -b eng/<TASK-ID>-$(date +%Y%m%d)
   git add .
   git commit -m "eng(<TASK-ID>): <description>"
   git push -u origin eng/<TASK-ID>-$(date +%Y%m%d)
   ```

10. **Self-Review pass** — same Agent-tool / general-purpose subagent pattern as AGENT.md, but with the engineering rubric below. Default to BLOCK; only `OK` authorizes the PR.

11. Open PR:
    ```
    gh pr create --label eng-agent \
      --title "eng(<TASK-ID>): <description>" \
      --body "<task spec verbatim, summary of changes, Self-Review output, check results>"
    ```

12. Wait for CI: `gh pr checks --watch`.

13. Stop. Do NOT merge. The `gtm-reviewer` agent handles both `gtm-agent` and `eng-agent` PRs; it either auto-merges or labels `needs-human`.

## Self-Review rubric (engineering-specific)

- Does the diff implement the *specific* TASK-ID, or did it drift into adjacent refactors?
- **No-touch zones respected**: `/api/`, `.env*`, `src/data/blogPosts.ts` (GTM's domain), `AGENT.md` (GTM's instructions). LESSONS.md is read-only for you (the groomer maintains it).
- **No regressions in user-visible behavior**: a pure refactor should produce the same DOM, same routes, same analytics events. The e2e smoke gate is your second line of defense.
- **Dep changes justified**: if you bumped or added a dep in `package.json`, did the backlog item authorize it? Random `npm update` runs fail this check.
- **No new `any` types**: an engineering PR should reduce, not increase, type-safety holes.
- **Bundle impact**: if you added a runtime dep, can you cite the bundle-size delta? (Use `npm run build` output.) Adding 50KB to ship a 2KB feature fails.
- **Test surface added**: did you add at least one test for what you changed, where practical? Pure refactors are exempt; new logic isn't.
- **Diff size**: keep under ~300 lines (engineering tasks can be a touch larger than GTM's 200, but not unbounded).

Output `OK` + one-paragraph summary, or `BLOCK: <rubric item>` per concern.

## Rules

1. **One task per run** — small, focused, easy to review.
2. **Build + lint + e2e green** before push.
3. **Preserve behavior** — no analytics removed, no routes changed, no demos broken.
4. **Match codebase style** — TypeScript, functional React, shadcn/ui patterns.
5. **No half-finished work** — if a task needs a follow-up, ship it as a new item, don't leave TODOs.
6. **Eng tasks must compile cleanly** — `npx tsc --noEmit` should pass on top of `npm run build`.

## No-Touch Zones

- `/api/` — serverless functions with API keys
- `.env*` — never create, modify, or read
- `src/data/blogPosts.ts` — GTM's domain
- `AGENT.md` — GTM's instructions
- `LESSONS.md` — groomer's domain (you read, never write)
- Never hardcode secrets in client code
- Never remove existing analytics

**Allowed-touch zones** (different from GTM):
- `package.json` + `package-lock.json` — yes, dep upgrades are explicitly your job
- `tsconfig*.json`, `vite.config.ts`, `tailwind.config.ts`, `playwright.config.ts`
- `.github/workflows/` — CI improvements
- `tests/` — add new tests, refactor existing
- `src/` (excluding `src/data/blogPosts.ts`) — refactors, type tightening, error boundaries, perf

---

## Backlog

Status legend: `[ ]` = pending, `[x]` = done, `[~]` = skipped.

### TIER 1 — Foundation (do these first)

- [ ] TEST-COVERAGE-UTILS: Add Vitest as a devDep (`vitest`, `@vitest/ui`), wire `npm run test` and `npm run test:unit`. Write unit tests for the pure functions in `src/utils/`: `voicePromptGenerator.ts` (`spokenDollars`, `expandAddress`, sanitizers), `aiCache.ts` (djb2 hash, get/set TTL behavior), `vapiClient.ts` (`normalizePhoneNumber` E.164 logic). Aim for >90% branch coverage of those three files only; don't expand scope. Add `npm run test:unit` to the worker's required check list in `ENGINEERING.md` step 7 *only if* the suite runs in under 5s.

- [ ] DEPENDABOT-CONFIG: Add `.github/dependabot.yml` configured for weekly npm security updates, monthly minor bumps, daily security alerts. Group all `@radix-ui/*` packages so they bump together (currently 25+ separate packages). PR target: main. Reviewers: empty (let the GitHub team review).

- [ ] CODE-SPLIT-DEMOS: In `src/App.tsx`, convert every demo route's import to `React.lazy()` wrapped in `<Suspense fallback={<DemoLoading />}>`. Create `src/components/DemoLoading.tsx` as a simple centered spinner with the demo's name. The marketing pages (Index, Construction, RealEstate, etc.) stay eagerly imported — they're the first paint. This should cut initial bundle by 30-40% (verify via `npm run build` output before/after, cite the numbers in the PR).

### TIER 2 — Type safety + correctness

- [ ] STRICT-NULL-CHECKS: Enable `"strictNullChecks": true` in `tsconfig.json`. Fix all resulting errors. If the violation count is > 50, ship the tsconfig change in a separate PR first (just the flag flip, no fixes), then a series of focused fix PRs by directory.

- [ ] ERROR-BOUNDARY-ROUTES: Wrap every top-level `<Route element={...} />` in `src/App.tsx` with a shared `<RouteErrorBoundary>` component that catches render errors, logs to Sentry (`captureException` already wired in `main.tsx`), and shows a friendly fallback with "Return home" and "Reload page" buttons.

- [ ] TS-NO-ANY: Run `grep -rn ': any\b' src/ --include='*.ts' --include='*.tsx' | grep -v node_modules | head -20` to find current explicit `any`s. Pick the top 10, replace with proper types (often `unknown` + a type guard is the right answer). Cite the count change in the PR.

### TIER 3 — Performance + observability

- [ ] BUNDLE-ANALYZER: Add `rollup-plugin-visualizer` as a devDep; wire `npm run analyze` to build and open `stats.html`. Document the top-10 largest modules in a new `docs/BUNDLE.md` (small, ~50 lines). The agent will reference this in future code-split decisions.

- [ ] SENTRY-REPLAY: Enable Sentry session replay in `src/main.tsx` (already have `@sentry/browser` + `@sentry/react`). Sample rate: 10% of sessions, 100% of errored sessions. PII masking on by default. No new dep needed.

- [ ] LIGHTHOUSE-PERF-BUDGET: Add a Lighthouse CI job to `.github/workflows/e2e.yml` (after smoke). Budget: LCP < 2.5s on `/`, `/construction`, `/realestate`. Fail PR if budget exceeded. Use `treosh/lighthouse-ci-action@v12`.

- [ ] UNUSED-DEPS: Run `npx depcheck` (no install needed, use npx). Identify dependencies in `package.json` that aren't actually imported. Remove confirmed-unused ones (verify with `grep -rn "from 'PKG'" src/` before each removal). Cite the removed list in the PR; reduce bundle by whatever the result is.

### TIER 4 — Hygiene

- [ ] CONSOLE-LOG-CLEANUP: Find and remove every `console.log()` in `src/`. Keep `console.warn` and `console.error` (those are intentional diagnostics). Run `grep -rn 'console\.log' src/` before and after; cite the count delta.

- [ ] LAZY-LOAD-ICONS: `lucide-react` is imported as `import { Phone, Mail, ... } from 'lucide-react'` everywhere. Vite tree-shakes these, but it's still ~5KB extra per route. Switch to per-icon imports (`import Phone from 'lucide-react/dist/esm/icons/phone'`) in the 5 largest page files first; measure bundle delta.

- [ ] TYPECHECK-IN-CI: Add `npx tsc --noEmit` as a required step to `.github/workflows/e2e.yml` before the smoke job. Currently TypeScript errors only surface during `vite build` (which is permissive); strict typecheck would catch them earlier.

---

## Why these are eng tasks, not GTM tasks

GTM ships things users see (CTAs, copy, new demos). Eng ships things developers + the agent see (tests, types, perf). Mixing them in one backlog meant tech debt always lost to "ship one more conversion improvement." Separating them gives tech debt its own queue with its own cadence so it never gets starved.
