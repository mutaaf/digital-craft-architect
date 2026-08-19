---
description: Push the blog catch-up branch, open a PR, wait on CI, and merge
allowed-tools: Bash(git:*), Bash(gh:*), Bash(npm:*), Bash(bash:*), Read, Edit
---

Ship the pending blog branch by running `scripts/ship-blogs.sh`.

That script is the source of truth for the sequence (lock sweep, fetch, rebase,
full check suite, sitemap regen, push, PR, CI watch, squash merge). Do not
reimplement its steps by hand and do not run the individual git commands
yourself. Run the script, read its output, and act on the outcome.

```bash
cd /Users/mutaafaziz/Desktop/projects/digital-craft-architect
bash scripts/ship-blogs.sh
```

## Before running

Confirm the branch still exists and the tree is clean:

```bash
git branch --list 'gtm/blog-catchup-*'
git status --porcelain --untracked-files=no
```

If the tree has uncommitted tracked changes, stop and show me what they are
rather than stashing or discarding them on your own. Past runs of the automated
publisher lost work exactly that way.

## Handling outcomes

- **Exit 0** — merged. Confirm with `gh pr view --json number,state,url --jq '.'`
  and report the PR number and URL.

- **Rebase conflict** — `origin/main` has moved since the branch was written
  (its `origin/main` ref was weeks stale). The script aborts the rebase and
  pushes nothing. Resolve it: the conflict will be in `src/data/blogPosts.ts`,
  almost certainly at the top of the `blogPosts` array where both sides inserted
  posts. Keep both sets of posts. Then check for the two things a merge can
  break, since `check-blog-dates` enforces both:
  - a date now used twice (walk the new post backward to the nearest free date)
  - a slug now duplicated (rename, or drop ours if main's post covers the topic)
  Re-run `bash scripts/ship-blogs.sh` after resolving.

- **A check fails** — fix the cause, never the check. `check-blog-dates` failing
  means a date collides with or postdates today. Re-run the script.

- **CI red** — the script already commented on the PR and labelled it
  `needs-human`, and deliberately did not merge. Show me the failing job output;
  do not merge or delete the branch.

Never use `--force` (the script uses `--force-with-lease`), never merge without
green CI, and never resolve a conflict by discarding one side wholesale.

## Dry run

If I ask for a dry run, use `bash scripts/ship-blogs.sh --dry-run`, which stops
before pushing.
