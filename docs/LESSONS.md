# Lessons Learned

Append-only log of mistakes the GTM agent (or its reviewer) made and what to
avoid going forward. The worker reads this BEFORE every backlog pick, so
patterns documented here will not repeat.

Format per entry:

```
## YYYY-MM-DD — <one-line headline>
**Where:** <PR #N or file:line>
**What went wrong:** <one paragraph>
**Rule going forward:** <imperative — "always X" / "never Y">
```

The groomer agent folds new entries here from reviewer BLOCK comments on
`needs-human`-labeled PRs. Do not delete entries; if a rule is superseded,
add a new entry citing the old one rather than editing it.

---

## 2026-05-07 — Em-dashes in body copy slipped past Self-Review
**Where:** AGENT.md workflow (Phase 2 handoff note)
**What went wrong:** A worker shipped copy containing em-dashes (`—`); the
inline Self-Review rubber-stamped it and the reviewer caught it after merge.
**Rule going forward:** Never use the em-dash character (`—`) in any copy
you write to React components or `src/data/blogPosts.ts`. Use a hyphen (`-`)
or restructure the sentence. Self-Review must grep the diff for `—` before
returning OK.

## 2026-05-22 — Backlog validator gates CI but not the local gate
**Where:** scripts/check-backlog.mjs, .github/workflows/ci.yml, AGENTS.md local gate
**What went wrong:** check-backlog.mjs runs as a standalone step in CI's `build`
gating job, but it was not in `npm run build` nor the AGENTS.md local gate, so
backlog drift passes the full local gate green then fails `build` in CI.
**Rule going forward:** The local gate now includes `node scripts/check-backlog.mjs`.
When a change touches docs/backlog/, move the ticket-file `status:` and its README
index row together in one commit.

## 2026-05-22 — Loop docs pointed at a non-existent LESSONS path
**Where:** AGENTS.md + the fleet ship/groom prompts
**What went wrong:** They referenced `docs/LESSONS.md` while the file lived at
repo root, so PHASE 0 reads and PHASE 3 appends silently missed it.
**Rule going forward:** Operational memory is `docs/LESSONS.md` (fleet standard);
the file was moved there. Read/append it there.

## 2026-05-22 — Shipping a ticket needs two PRs (status lives in tracked files)
**Where:** Ticket 0002 ship run (PR #31), docs/backlog/0002-*.md + README index
**What went wrong:** The `status: shipped` flip cannot ride the same PR as the
code, because the in-progress flip merges first and main is protected. After the
feat PR squash-merges, the shipped flip is a second commit that also cannot push
to main directly, so it needs its own `chore/` PR through the same `build` +
`smoke-required` gate. A run that stops after the feat merge leaves the ticket
stuck at `in-progress`.
**Rule going forward:** Budget two PRs per ship: (1) `feat/<id>-*` carrying the
in-progress flip + code, (2) `chore/<id>-ship-status` flipping the ticket file
AND its README index row to `shipped` together. Run `node scripts/check-backlog.mjs`
before pushing the second PR so the file and index never drift mid-flip.

## 2026-05-22 — `@ts-nocheck` is itself an ESLint error in this repo
**Where:** PR for ticket 0005, src/pages/{Glossary,Industries,compare/HubSpot,
compare/GoHighLevel,events/VoiceBookingAgent}.tsx
**What went wrong:** Grandfathering type errors with a bare `// @ts-nocheck` made
`npm run lint` fail: the typescript-eslint preset enables
`@typescript-eslint/ban-ts-comment`, which flags `@ts-nocheck` as an ERROR (the
repo's lint baseline is otherwise warnings-only). The typecheck gate passed but the
existing lint gate broke.
**Rule going forward:** When grandfathering a file with `// @ts-nocheck`, put
`/* eslint-disable @typescript-eslint/ban-ts-comment */` on the line above it. tsc
still honors `@ts-nocheck` with a leading comment. Always run the FULL local gate
(lint included), not just the new check, before pushing.

## 2026-05-22 — Eng backlog has no groomer; bootstrap pre-authorized follow-ups instead of NOOPing
**Where:** eng run after PR #42; ticket 0007 (PRs #43/#44), docs/backlog/0007-*.md
**What went wrong:** The eng runner's PHASE 2 says "pick the highest-priority
groomed engineering ticket," but nothing grooms the eng backlog (gtm-innovation
grooms only conversion/seo/content/trust). After 0005 shipped, every ticket was
`shipped` and no groomed eng ticket existed, so a strict reading makes the eng loop
NOOP forever even though real eng work is queued in prior tickets' "Out of scope"
sections (0005 explicitly named "tighten tsconfig strictness once the baseline is
clean").
**Rule going forward:** When no groomed eng ticket exists, do NOT invent unscoped
work and do NOT NOOP; instead bootstrap the next follow-up that a prior *shipped*
ticket explicitly pre-authorized. Author the new ticket file as the FIRST commit of the
`eng/<id>` branch in `status: in-progress` with its README index row in sync (main
is protected, so the file can't pre-land as `groomed`); ship still takes two PRs
(eng/ then chore/ ship-status) per the 2026-05-22 two-PR lesson. If nothing is
pre-authorized, NOOP and say so rather than self-grooming speculative work.

## 2026-05-22 — Ratchet tsconfig strictness one zero-error flag at a time
**Where:** ticket 0007, tsconfig.app.json (noImplicitAny, noFallthroughCasesInSwitch)
**What went wrong:** N/A (technique, not a defect). `strict` was fully off; turning
on the whole family at once would surface a large mixed batch (measured:
strictNullChecks 9, strict 9, noUnusedLocals 11, noUnusedParameters 3) and force
risky source edits into one PR.
**Rule going forward:** Measure each strict-family flag in isolation first:
`for f in noImplicitAny noFallthroughCasesInSwitch noUnusedLocals noUnusedParameters strictNullChecks strict; do npx tsc -p tsconfig.app.json --noEmit --$f 2>&1 | grep -c 'error TS'; done`
(run the flag passes SEQUENTIALLY; concurrent tsc processes thrash and stall). Enable
only the flags at 0 errors as a pure config-only guard (no source edits, behavior
preserved by construction); defer non-zero flags to their own ticket. The typecheck
gate already targets `tsconfig.app.json`, so no CI/workflow change is needed; the
flag flip is self-enforcing.

## 2026-05-25 — A ticket stuck at in-progress with its feat PR already merged needs the missing ship-status PR, not a skip
**Where:** ticket 0009 (feat PR #47 merged 596218f), ship run with no open PRs; ship PR #49
**What went wrong:** N/A (recovery technique). A prior ship run merged `feat/0009`
but never opened the second `chore/0009-ship-status` PR, so 0009 sat at
`in-progress` with its code already in main. PHASE 1 found no open PR to heal, and
PHASE 2 step 3's literal instruction ("SKIP any whose file says ... in-progress")
would skip 0009 forever and ship the next ticket — leaving 0009 permanently stuck
because the feat code is already merged and every future run skips it identically.
**Rule going forward:** Before applying PHASE 2's in-progress skip, check whether
that ticket's `feat/<id>` PR has already merged (its code is in main) with no open
PR. If so, the correct action is to COMPLETE the missing `chore/<id>-ship-status`
PR (flip ticket frontmatter + README index row to `shipped` together, check-backlog
green) — that IS the run's one ship action. Only skip an in-progress ticket whose
feat PR is genuinely still open/unmerged (PHASE 1 tends that). Verify the feat diff
actually landed all the ticket's files before flipping to shipped.

## 2026-05-25 - Mirroring copy into structured data exposes pre-existing em-dashes; fix at the single source
**Where:** ticket 0012 (feat PR #53), src/components/PricingFAQ.tsx FAQ_ITEMS
**What went wrong:** N/A (technique). 0012 emits a FAQPage JSON-LD block built
from the component's existing FAQ_ITEMS array, and an acceptance box required "no
em-dash in any emitted question or answer string." Writing that test first
revealed four FAQ_ITEMS answers had already shipped em-dashes in the visible copy
(a standing brand-voice Hard NO violation that no check had caught, because the
em-dash gate is only enforced by Self-Review on the diff, not by an automated
check over already-merged source). The ticket also said schema must mirror the
rendered accordion with no drift AND not reword any FAQ copy. Stripping the
em-dash only in the schema would have created drift between the visible text and
the schema.
**Rule going forward:** When a ticket reflects existing on-page copy into a
mirrored surface (JSON-LD, OG tags, sitemap titles, an email, etc.) and the spec
forbids a character/pattern, fix it at the single shared source so the visible
copy and the mirror stay identical, never with a one-sided transform that
diverges them. Replacing an em-dash with a hyphen is punctuation repair, not
rewording, so it respects an "out of scope: no rewording" rule. Treat the source
fix as in-scope when it is the only way to satisfy a mirror-with-no-drift
criterion plus a forbidden-character criterion at once.

## 2026-05-25 - The index.html "SEO Pilot" script owns document.title; Helmet titles only win for routes in its table
**Where:** ticket 0013 (feat PR #58), index.html SEO Pilot block, src/pages/Glossary.tsx Helmet
**What went wrong:** N/A (gotcha discovered). A first test asserted
`expect(page).toHaveTitle(/glossary/i)` for the glossary, mirroring the demos-hub
test that does the same and passes. It failed: on `/glossary` `document.title`
stays the homepage title even 10s after hydration. Root cause is an inline
`index.html` "SEO Pilot" script with its own per-route `pages` table that rewrites
the single `<title>` element on SPA navigation and runs after Helmet. Routes in
that table (`/`, `/demos`, `/construction`, ...) get the right title; routes NOT in
it (e.g. `/glossary`, which `check-meta` already flags as "missing explicit meta
tags in index.html") fall back to the homepage title, overwriting Helmet's. The
meta description is unaffected because Helmet APPENDS a second
`meta[name="description"]` rather than overwriting one element, so the page's own
description is still present (two description tags, the Helmet one is correct).
**Rule going forward:** Do not assert `toHaveTitle`/`document.title` for a route
unless that route is in the index.html SEO Pilot `pages` table; for routes driven
only by react-helmet-async, assert the Helmet-managed head element directly (its
own `meta[name="description"]` content, or its emitted JSON-LD) instead. Adding a
route to the SEO Pilot table is its own SEO concern, out of scope for a
structured-data ticket.

## 2026-05-25 - The 0012 pricing-FAQ dark-mode e2e spec is flaky locally; do not red-flag your own PR over it
**Where:** ticket 0014 (feat PR #60), tests/e2e/pricing-faq-structured-data.spec.ts:183
**What went wrong:** N/A (false-alarm avoidance). Running the FULL local e2e suite
during 0014, the 0012 spec "accordion renders in light and dark mode" timed out
once on `/realestate`, then on a re-run timed out on a DIFFERENT parametrization
(`/construction`) while everything else passed. The failure follows worker timing
(readVisibleAccordion polling the open `[data-state="open"] [role="region"]`), not
any code under test, and 0014 touches neither the FAQ accordion nor the pricing
pages. CI's `retries: 1` (playwright.config.ts) absorbs it: the `smoke` and
`smoke-required` jobs both went green on PR #60 and #61. A run that treats a single
local full-suite failure as a regression would wrongly leave its own green PR open.
**Rule going forward:** When the FULL local e2e suite shows exactly one failure in a
spec your diff does not touch, re-run that spec in isolation; if it fails on a
different shard/parametrization (or passes), it is pre-existing flakiness that CI
`retries: 1` covers, not your regression. Confirm with `git diff main --stat` that
the failing spec/files are outside your change, gate on the CI `build` +
`smoke-required` result, and do not block your merge on it. (Quarantining or
de-flaking that spec is its own eng concern, not a ship-run task.)

## 2026-05-25 - When delegating ship to implementation-dev, finish the second (ship-status) PR in the SAME run
**Where:** ticket 0015 (feat PR #63, ship-status PR #64), ship run delegating to the implementation-dev subagent
**What went wrong:** N/A (orchestration technique). The implementation-dev subagent
runs only PR 1: it branches `feat/<id>`, flips the ticket to `in-progress`, ships
the code+tests, arms auto-merge, watches it squash-merge to main, then RETURNS. It
does not open PR 2 (`chore/<id>-ship-status`). If the ship runner ends the run right
after the subagent returns, the ticket is left at `in-progress` with its feat code
already in main, the exact stuck state the 2026-05-25 missing-ship-status recovery
lesson describes - except self-inflicted, deferring completion to a whole extra run.
**Rule going forward:** A delegated ship is not done when implementation-dev returns
"feat merged." In the SAME run, immediately complete PR 2 yourself: confirm the feat
PR actually merged and landed all the ticket's files (`git show --stat <mergeCommit>`),
branch `chore/<id>-ship-status` off fresh `origin/main`, flip the ticket frontmatter
AND its README index row to `shipped` together, run `node scripts/check-backlog.mjs`
(must be green), push, `gh pr create --fill`, `gh pr merge --auto --squash`, watch
`build`+`smoke-required` to green. This is still ONE ship action (the two-PR budget of
2026-05-22), not a second ticket - so it does not violate "heal OR ship, never both."

## 2026-05-26 - Re-measure strict-family flags on TODAY's main; a predecessor ticket's numbers drift fast
**Where:** ticket 0008 (eng PR #66), tsconfig.app.json, follow-up to 0007 (PR #43)
**What went wrong:** N/A (technique). 0007 measured the deferred strict-family flags
on 2026-05-22 as: `strictNullChecks` 9, `strict` 9, `noUnusedParameters` 3,
`noUnusedLocals` 11, and named ticket 0008 as the follow-up for the "higher-count"
flags requiring source fixes. Trusting that table four days later would have scoped
0008 as a noUnusedParameters fix-3-files job. Re-measuring on TODAY's main
(`for f in noUnusedLocals noUnusedParameters strictNullChecks strict; do npx tsc -p tsconfig.app.json --noEmit --$f 2>&1 | grep -c 'error TS'; done`,
sequentially) showed `strictNullChecks` and `strict` both at 0 - unrelated feature
work in tickets 0009-0015 inadvertently closed all 9 null-check holes. That turned
0008 from a source-edit ticket into a true zero-cost ratchet (config-only flip of
the whole `strict` meta-flag, mirroring 0007's pattern). `noUnusedLocals` (11) and
`noUnusedParameters` (3) are NOT in the `strict` family and stayed unchanged.
**Rule going forward:** When bootstrapping a strict-family follow-up from a prior
shipped ticket's "Out of scope" table, always re-run the isolated-flag
measurement on today's `main` BEFORE scoping the new ticket. Predecessor numbers
drift quickly when unrelated feature work edits source - both downward (your favor;
re-scope to a bigger zero-cost batch) and upward (against you; re-scope smaller).
Cite both the predecessor's table and today's table in the new ticket so the drift
is auditable. The 2026-05-22 "one zero-error flag at a time" rule still holds;
this lesson adds: the SET of zero-error flags is itself a moving target, so
re-measurement is a precondition, not a courtesy.

## 2026-05-26 - GitHub account suspension fails CI at checkout; escalate after 1 heal attempt, not 2
**Where:** PR #69 (chore/gtm-20260526-1109), build job run 26447731932 / e2e run 26447731976
**What went wrong:** PHASE 1 opened on PR #69 with mergeStateStatus BLOCKED and zero
workflow runs at head 1h+ after open (gating checks `build` and `smoke-required`
were both null in the rollup, only Vercel was present). The runbook's step (d)
treats null gating checks as "mid-flight, exit" — but a workflow that has not
fired after 1h is not mid-flight, it is stuck. The cheap, low-risk nudge
(`gh pr close 69 && gh pr reopen 69`) did successfully fire both workflows, but the
`build` job failed at the very first step (`actions/checkout@v4`) with
`remote: Your account is suspended. Please visit https://support.github.com for more information.`
and a 403. Same root cause as the original null-checks state: the repo owner's
GitHub account is suspended, so the runner's ambient `GITHUB_TOKEN` cannot fetch
the repo. The last successful CI on `main` was 2026-05-26 09:21 UTC, so the
suspension landed between then and the heal run at 12:20 UTC. No source-level
heal can recover this — a second `heal:` attempt would fail identically at
checkout. (The agent's own personal git auth still worked, which is why this
lesson could be pushed; the runner's token is what's suspended.)
**Rule going forward:** When the `build` or `smoke-required` job fails at
`actions/checkout@v4` with `remote: Your account is suspended` (or any 403 from
github.com on the repo clone), STOP after one heal attempt — do not consume the
second of the 2-attempt budget. Post a human-escalation PR comment naming
the suspension, the failing run URL, and the last-known-good CI timestamp on
`main`, then exit. Also extend the runbook step (d) reading: if gating checks
are null AND the PR is >30 min old AND no workflow run exists at the head SHA
(`gh api "repos/{owner}/{repo}/actions/runs?head_sha=<sha>" --jq .total_count`
returns 0), this is NOT mid-flight — it is a trigger failure (most commonly an
account suspension, less commonly an Actions outage). Diagnose by reopening to
force a retrigger; if the new run also fails at checkout with the same 403,
escalate. The "never freeze the loop on a stuck PR" principle does not require
us to keep banging on something only a human can unblock.

## 2026-05-28 - When a ticket spec asks for Vitest, encode the assertions in the gated script instead
**Where:** ticket 0022 (feat PR for sitemap lastmod), scripts/generate-sitemap.ts
**What went wrong:** N/A (adaptation technique). 0022's engineering notes asked
for a `tests/unit/generate-sitemap.spec.ts` "using Vitest" mirroring the
acceptance criteria, but this repo has no Vitest installed (`tests/e2e/` is
Playwright only). AGENTS.md Hard NO forbids the GTM queue from touching
`package.json` to add the dependency, and writing a `scripts/check-sitemap-lastmod.ts`
verifier would only gate the build if it were wired into the CI workflow or one
of the local-gate `npm run` scripts (also a `package.json` edit). The
sustainable path: encode the acceptance invariants as a post-write assertion
block inside the script the local gate already invokes. `npm run build`
shells out to `npx tsx scripts/generate-sitemap.ts` before `vite build`, so
throwing from the script fails both `npm run build` locally and the `build`
gating CI job, with zero new files and zero `package.json` touch.
**Rule going forward:** When a ticket asks for unit tests in a framework this
repo does not install, do NOT touch `package.json` to add it (GTM queue Hard
NO) and do NOT write an ungated standalone verifier. Inline the assertions
into whatever script the local gate already runs (the sitemap generator, the
RSS generator, a `check-*` script), exit non-zero on violation, and save the
broken artifact (`*.broken`) alongside the real output for debugging. Cite
this adaptation in the ticket's Implementation log so the deviation is
auditable. This converts "needs a new test framework" into a zero-dependency
fix-yourself-or-fail-the-build invariant.

## 2026-05-30 - Adding a second instance of a structured-data @type collides with a predecessor "exactly-one-of-this-@type" assertion
**Where:** ticket 0025 (feat PR #91), tests/e2e/website-sitelinks-jsonld.spec.ts (ticket 0016's spec) vs new tests/e2e/homepage-organization-jsonld.spec.ts
**What went wrong:** Ticket 0016 (WebSite + sitelinks search) had asserted "exactly one `Organization` JSON-LD block exists on `/`" against the pre-existing block in `index.html`. Ticket 0025 deliberately adds a SECOND `Organization` block (a richer one with `sameAs`/`contactPoint`/`logo` injected via Helmet), which immediately reds 0016's spec in CI even though 0025 is the spec's intended evolution. tsc/lint don't see it; only the Playwright run does.
**Rule going forward:** When a ticket adds a second instance of a structured-data `@type` already emitted somewhere on the page, grep every existing `tests/e2e/*-jsonld.spec.ts` for `=== '<Type>'` and any "exactly one" / `toHaveLength(1)` / `.filter(b => b['@type'] === '<Type>')` predicate over the same @type BEFORE writing code. Rewrite the predecessor's assertion to identify its original block by a UNIQUE field on that block (e.g. the index.html Organization's `knowsAbout`), not by "the only Organization block." Update the predecessor spec in the SAME PR — don't ship a knowingly-red sibling test. Same mirror-source-fix family as 2026-05-25 (the predecessor's assertion is the source of truth that has to widen to admit the new sibling).

## 2026-06-07 - Mirror-source allow-lists in tests/ cannot be imported from src/; relocate to src/data and re-export
**Where:** ticket 0040 (feat PR #125), src/data/routes.ts, tests/e2e/routes.ts, src/components/WhatsNewSinceVisit.tsx
**What went wrong:** N/A (technique). 0040's engineering notes said "component imports ROUTES from tests/e2e/routes.ts" so the smoke spec and the production component share one allow-list (the 2026-05-25 mirror-source rule). But `tsconfig.app.json` includes only `["src"]`, so an `import from '../../tests/e2e/routes'` inside src/ either fails type resolution or pulls test code into the production compile graph (lint and bundle both choke). Widening the tsconfig include to admit tests/ would drag test-only types into the prod build — wrong direction.
**Rule going forward:** When a ticket says "component imports a constant currently living in `tests/e2e/`", do NOT add `tests/` to `tsconfig.app.json` include and do NOT inline-duplicate the constant. Move the canonical constant to `src/data/<name>.ts` and rewrite the tests/e2e file to re-export it verbatim, keeping any test-environment-only siblings (e.g., `IGNORABLE_ERROR_PATTERNS`) local to the test file. Production reads the src copy; the spec keeps its existing `from './routes'` import unchanged; there is still exactly one source. Same single-source-of-truth family as 2026-05-25 mirror-source, applied across the src/tests boundary.

## 2026-06-15 - Negated character class `[^/>]*` over an XML attribute list rejects valid attribute values
**Where:** ticket 0055 (feat PR for /changelog/rss.xml), tests/e2e/changelog-rss-feed.spec.ts initial channel-block regex
**What went wrong:** N/A (technique). The first version of the spec's atom self-link assertion used `<atom:link[^/>]*href="..."[^/>]*rel="self"[^/>]*/>` to match the self-closing tag with attributes in either order. It failed because the attribute list contains `type="application/rss+xml"`, and the negated class `[^/>]` rejects the `/` inside `application/rss+xml` before the regex ever reaches the closing `/>`. The intent (a self-closing tag with no nested children) was right; the implementation conflated "no nested tags" with "no slashes anywhere," which is wrong for any XML/HTML attribute that contains a path or a MIME type.
**Rule going forward:** When matching the inside of a self-closing tag's attribute list, use `[^>]*` (exclude only the closing angle bracket), not `[^/>]*`. The forward slash is a legitimate character in attribute values (paths, MIME types, dates, URLs). If you need to be stricter about "this is a self-closing tag, not an opening one," capture the whole tag with `<name\b[^>]*/>` and then assert `.includes(...)` for each required attribute on the captured string. The same trap applies to any regex that wants to match a self-closing JSX/HTML/XML tag from a stringified DOM.

