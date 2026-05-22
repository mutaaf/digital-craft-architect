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
