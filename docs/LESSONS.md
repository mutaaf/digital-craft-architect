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
