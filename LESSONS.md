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
