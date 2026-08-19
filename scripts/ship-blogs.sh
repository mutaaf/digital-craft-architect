#!/usr/bin/env bash
#
# ship-blogs.sh — push the blog catch-up branch, open a PR, wait on CI, merge.
#
# Why this exists: the blog-post-publisher scheduled task runs in an environment
# with no `gh` and no network route to github.com, so it can write posts but
# cannot ship them. This script does the shipping half on a machine that can.
#
# Safe to re-run. It never force-pushes without a lease, never merges without
# green CI, and aborts loudly instead of resolving conflicts on its own.
#
# Usage:  bash scripts/ship-blogs.sh
#         bash scripts/ship-blogs.sh --dry-run            (stop before pushing)
#         bash scripts/ship-blogs.sh --branch gtm/blog-catchup-20260901
#
set -euo pipefail

REPO="/Users/mutaafaziz/Desktop/projects/digital-craft-architect"
BASE="main"
BRANCH_GLOB="gtm/blog-catchup-*"

die()  { printf '\n\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }
step() { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }
note() { printf '  %s\n' "$*"; }

usage() {
  cat <<USAGE
Usage: bash scripts/ship-blogs.sh [--branch <name>] [--dry-run]

  --branch <name>  Blog branch to ship. Defaults to the single branch matching
                   $BRANCH_GLOB, local or on origin. If several match, the
                   script refuses to guess and asks you to name one.
  --dry-run        Run every check, then stop before pushing.
USAGE
}

BRANCH=""
DRY_RUN=0
while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run)  DRY_RUN=1; shift ;;
    --branch)   BRANCH="${2:-}"; [ -n "$BRANCH" ] || die "--branch needs a branch name"; shift 2 ;;
    --branch=*) BRANCH="${1#--branch=}"; shift ;;
    -h|--help)  usage; exit 0 ;;
    *)          usage >&2; die "unknown argument: $1" ;;
  esac
done

cd "$REPO" || die "repo not found at $REPO"

# Resolve which branch to ship when the caller did not name one.
#
# The branch name used to be hardcoded, which meant the script stopped working
# the moment that batch merged and the branch was deleted. Every batch carries a
# fresh date suffix, so discover it instead.
#
# Ambiguity is fatal on purpose: this script auto-merges to main, and silently
# picking the "newest" of several candidates could ship an abandoned draft.
resolve_branch() {
  local candidates count
  candidates="$(
    {
      git for-each-ref --format='%(refname:short)' "refs/heads/$BRANCH_GLOB"
      git for-each-ref --format='%(refname:short)' "refs/remotes/origin/$BRANCH_GLOB" \
        | sed 's|^origin/||'
    } | sort -u
  )"
  count="$(printf '%s\n' "$candidates" | grep -c . || true)"
  if [ "$count" -eq 0 ]; then
    die "no branch matching $BRANCH_GLOB exists locally or on origin.
     Name one explicitly with --branch <name>."
  fi
  if [ "$count" -gt 1 ]; then
    printf '%s\n' "$candidates" | sed 's/^/    /' >&2
    die "$count branches match $BRANCH_GLOB; refusing to guess which one to merge.
     Name the one you want with --branch <name>."
  fi
  printf '%s' "$candidates"
}

# ---------------------------------------------------------------------------
# 0. Stale lock sweep.
#
# This is the failure that silently killed weeks of scheduled runs: an agent
# died mid-git-operation and left .git/index.lock and .git/HEAD.lock behind,
# so every later run failed at `git checkout` before it could do anything.
# ---------------------------------------------------------------------------
step "Sweeping stale git locks"
if pgrep -x git >/dev/null 2>&1; then
  die "a git process is currently running; refusing to touch lock files"
fi
found_lock=0
for lock in .git/index.lock .git/HEAD.lock .git/objects/maintenance.lock; do
  if [ -e "$lock" ]; then
    rm -f "$lock" && note "removed stale $lock" && found_lock=1
  fi
done
[ "$found_lock" -eq 0 ] && note "none found"

# ---------------------------------------------------------------------------
# 1. Preflight
# ---------------------------------------------------------------------------
step "Preflight"
command -v gh >/dev/null 2>&1 || die "gh CLI not installed (brew install gh)"
gh auth status >/dev/null 2>&1 || die "gh not authenticated (run: gh auth login)"

# Prune first so a branch deleted by a previous merge cannot be resolved from a
# stale remote-tracking ref.
git fetch origin --prune --quiet || die "git fetch failed (network? auth?)"

if [ -z "$BRANCH" ]; then
  BRANCH="$(resolve_branch)"
  note "resolved branch $BRANCH"
fi

if git rev-parse --verify --quiet "refs/heads/$BRANCH" >/dev/null; then
  :
elif git rev-parse --verify --quiet "refs/remotes/origin/$BRANCH" >/dev/null; then
  note "$BRANCH exists only on origin; checking out a tracking copy"
else
  die "branch $BRANCH does not exist locally or on origin"
fi
note "gh authenticated, branch present"

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  git status --short
  die "working tree has uncommitted tracked changes; commit or stash them first"
fi

git checkout "$BRANCH" >/dev/null 2>&1
note "on $BRANCH"

# ---------------------------------------------------------------------------
# 2. Sync with the real remote.
#
# The sandbox that wrote these posts had a stale origin/main (weeks behind),
# so this is the first point at which we learn what main actually contains.
# ---------------------------------------------------------------------------
step "Fetching origin/$BASE"
git fetch origin "$BASE" || die "git fetch failed (network? auth?)"
note "origin/$BASE is now $(git rev-parse --short origin/$BASE)"

step "Rebasing $BRANCH onto origin/$BASE"
if ! git rebase "origin/$BASE"; then
  git rebase --abort 2>/dev/null || true
  die "rebase conflict against origin/$BASE (likely another blog post landed on main).
     Resolve by hand, then re-run. Nothing has been pushed."
fi
note "rebased cleanly"

# ---------------------------------------------------------------------------
# 3. Full local check suite.
#
# Run AFTER the rebase, because main may have gained blog posts whose dates or
# slugs now collide with ours. check-blog-dates is the guard that catches that.
# `npm run build` regenerates public/sitemap.xml via its prebuild hook.
# ---------------------------------------------------------------------------
step "Running full check suite"
[ -d node_modules ] || { note "installing dependencies"; npm install; }

npm run lint             || die "lint failed"
npm run check-links      || die "check-links failed"
npm run check-images     || die "check-images failed"
npm run check-meta       || die "check-meta failed"
npm run check-blog-dates || die "check-blog-dates failed — a date now collides with main; fix before shipping"
npm run build            || die "build failed"
note "all checks green"

# ---------------------------------------------------------------------------
# 4. Fold the regenerated sitemap into the commit
# ---------------------------------------------------------------------------
step "Staging regenerated build artifacts"

# Everything the build regenerates from committed sources. generate-sitemap.ts
# rewrites the sitemap AND src/data/changelogEntries.ts (from docs/backlog
# frontmatter), and generate-changelog-rss.ts renders the feed from those
# entries.
#
# An earlier version staged only the sitemap and actively discarded the
# changelog entries as "unrelated build churn". That was wrong twice over: it
# threw away a real regeneration when a shipped ticket had gone un-regenerated
# on main, and it left public/changelog/rss.xml dirty afterwards, which then
# tripped this script's own clean-tree preflight on the very next run.
#
# All three are deterministic output, so carrying them is always safe.
GENERATED=(
  public/sitemap.xml
  public/changelog/rss.xml
  src/data/changelogEntries.ts
)
for artifact in "${GENERATED[@]}"; do
  [ -e "$artifact" ] && git add "$artifact"
done

if ! git diff --cached --quiet; then
  git diff --cached --name-only | sed 's/^/    /'
  git commit --amend --no-edit >/dev/null
  note "regenerated artifacts folded into the commit"
else
  note "no regenerated artifacts changed"
fi

# The build must leave nothing behind, or the next run dies at preflight.
leftover="$(git status --porcelain --untracked-files=no)"
if [ -n "$leftover" ]; then
  printf '%s\n' "$leftover"
  die "the build left tracked files dirty that this script does not stage.
     Add them to GENERATED above (if generated) or commit them, otherwise the
     next run fails its clean-tree preflight."
fi

echo
git status --short || true
git show --stat HEAD | tail -5

if [ "$DRY_RUN" -eq 1 ]; then
  step "Dry run complete — stopping before push"
  exit 0
fi

# ---------------------------------------------------------------------------
# 5. Push
# ---------------------------------------------------------------------------
step "Pushing $BRANCH"
git push -u origin "$BRANCH" --force-with-lease || die "push failed"

# ---------------------------------------------------------------------------
# 6. Open the PR (reuse one if it already exists)
# ---------------------------------------------------------------------------
step "Opening pull request"
if gh pr view --json number >/dev/null 2>&1; then
  PR=$(gh pr view --json number --jq .number)
  note "PR #$PR already exists, reusing"
else
  # Title and body are derived from the branch, not hardcoded. The previous
  # version pinned both to one specific August 2026 batch, so any later run
  # would have opened a PR whose description was simply false.
  PR_TITLE="$(git log --format=%s --no-merges "origin/$BASE..HEAD" | tail -1)"
  [ -n "$PR_TITLE" ] || PR_TITLE="gtm(BLOG-POST): blog catch-up"

  build_pr_body() {
    printf '## Commits\n\n'
    git log --format='- %s' --no-merges "origin/$BASE..HEAD"

    local slugs
    slugs="$(git diff "origin/$BASE...HEAD" -- src/data/blogPosts.ts 2>/dev/null \
      | sed -nE 's/^\+[[:space:]]*slug:[[:space:]]*["'"'"']([^"'"'"']+)["'"'"'].*/\1/p')"
    if [ -n "$slugs" ]; then
      printf '\n## Posts added\n\n'
      # shellcheck disable=SC2016  # the backticks are literal markdown, not a subshell
      printf '%s\n' "$slugs" | sed 's/^/- `/; s/$/`/'
    fi

    printf '\n## Local checks\n\n'
    printf 'lint, check-links, check-images, check-meta, check-blog-dates, build: all green before push.\n'
  }

  gh pr create \
    --label gtm-agent \
    --base "$BASE" \
    --head "$BRANCH" \
    --title "$PR_TITLE" \
    --body "$(build_pr_body)"
  PR=$(gh pr view --json number --jq .number)
  note "opened PR #$PR"
fi

# ---------------------------------------------------------------------------
# 7. Wait on CI, then merge
# ---------------------------------------------------------------------------
step "Waiting on CI for PR #$PR"

# `gh pr checks` exits non-zero printing "no checks reported on the ... branch"
# when GitHub has not yet registered check runs for a just-pushed commit.
# Watching immediately after a push therefore races: on 2026-08-18 that race
# read as a red CI, so the script commented and labelled a perfectly healthy
# PR needs-human while its checks were still spinning up.
#
# Wait for the checks to exist before judging them. This deliberately does NOT
# label needs-human on timeout: no checks at all is a repo/workflow problem,
# not a failing PR.
checks_registered() {
  local out
  out="$(gh pr checks "$PR" 2>&1 || true)"
  [ -n "$out" ] && ! printf '%s' "$out" | grep -qi 'no checks reported'
}

registered=0
for _ in $(seq 1 30); do          # up to 30 x 10s = 5 minutes
  if checks_registered; then registered=1; break; fi
  note "checks not registered yet, waiting 10s"
  sleep 10
done

if [ "$registered" -eq 0 ]; then
  die "no CI checks registered for PR #$PR after 5 minutes.
     Nothing was merged and no label was applied. Check the Actions tab:
     https://github.com/mutaaf/digital-craft-architect/actions"
fi
note "checks registered, watching"

if gh pr checks "$PR" --watch; then
  step "CI green — merging"
  if gh pr merge --squash --delete-branch; then
    git checkout "$BASE" && git pull origin "$BASE"
    printf '\n\033[32m✓ PR #%s: MERGED\033[0m\n' "$PR"
  else
    gh pr comment "$PR" --body "Merge failed after green CI, likely a race with another commit on main. Leaving for a human."
    gh pr edit "$PR" --add-label needs-human 2>/dev/null || true
    die "PR #$PR: NEEDS-HUMAN — merge failed (not retrying destructively)"
  fi
else
  gh pr comment "$PR" --body "CI red. Leaving open for inspection."
  gh pr edit "$PR" --add-label needs-human 2>/dev/null || true
  die "PR #$PR: NEEDS-HUMAN — CI failed. Branch left intact."
fi
