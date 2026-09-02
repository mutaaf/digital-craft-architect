---
description: Write one new blog post and ship it (write, check, review, PR, merge)
allowed-tools: Bash(git:*), Bash(gh:*), Bash(npm:*), Bash(bash:*), Read, Edit, Agent
---

Write and publish ONE new blog post for this repo.

Follow `docs/blog-publisher.md` exactly. That file is the single source of truth
for this workflow and is shared with the scheduled task, so read it first and do
not improvise a different sequence.

```bash
cat docs/blog-publisher.md
```

Read it in full before touching git, paying particular attention to:

- **STEP 0 and STEP 1** — the stale-lock sweep and the dirty-tree check. Eleven
  weeks of scheduled runs failed because a dead run left `.git/HEAD.lock` behind
  and nobody swept it. If the tree is already dirty on arrival, salvage and
  report instead of writing.
- **STEP 3** — the date rule. `scripts/check-blog-dates.ts` requires a unique,
  non-future date. Use today if free, otherwise walk backward.
- **Content rules** — zero em dashes, zero invented statistics, every internal
  link verified against a real route in `src/App.tsx`.

Running in Claude Code, you have `gh` and network access, so you are in FULL
mode: write, check, commit, self-review with a sub-agent, PR, watch CI, merge.

When you finish, report the one-line status from STEP 9 and confirm the repo is
clean and back on `main`.
