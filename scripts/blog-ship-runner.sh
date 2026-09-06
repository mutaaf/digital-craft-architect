#!/usr/bin/env bash
#
# blog-ship-runner.sh — close the merge half of autonomous blog publishing.
#
# Why this exists: the cloud publisher routine writes a post and opens a PR,
# then stops. It cannot finish the job itself. Its sandbox has no `gh`, so it
# reaches GitHub over MCP, and MCP cannot arm auto-merge; meanwhile CI takes
# 6+ minutes and the routine's session ends before the checks conclude. So the
# PR sits there, green and unmerged, until something with `gh` picks it up.
#
# That something is this. It runs on a schedule on a machine that has gh, and
# hands off to ship-blogs.sh, which merges only on green CI.
#
# It deliberately operates on a DEDICATED CLONE under ~/.cache, never the
# interactive checkout: ship-blogs.sh checks out and rebases branches, and
# doing that on a timer inside a directory someone is editing would destroy
# their work in progress. The whole point of this project's tooling history is
# not doing that again.
#
# Usage:  bash scripts/blog-ship-runner.sh          (from launchd, or by hand)
#         bash scripts/blog-ship-runner.sh --dry-run
#
set -uo pipefail

REMOTE="https://github.com/mutaaf/digital-craft-architect.git"
CACHE="$HOME/.cache/digitalcraft-blog-ship"
CLONE="$CACHE/repo"
LOG_DIR="$CACHE/logs"
LOG="$LOG_DIR/run-$(date -u +%Y%m%d-%H%M%S).log"
DRY_RUN=""
[ "${1:-}" = "--dry-run" ] && DRY_RUN="--dry-run"

mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG") 2>&1

echo "=== blog-ship-runner $(date -u) ==="

# The script this hands off to lives in the repo, so use the copy from the
# clone rather than whatever happens to be on this machine's working tree.
if [ ! -d "$CLONE/.git" ]; then
  echo "cloning $REMOTE -> $CLONE"
  mkdir -p "$CACHE"
  git clone --quiet "$REMOTE" "$CLONE" || { echo "clone failed"; exit 1; }
fi

cd "$CLONE" || { echo "clone missing"; exit 1; }

# Never leave the clone mid-operation; a wedged clone means every later run
# fails at checkout, which is exactly how this project lost 76 days.
if ! pgrep -x git >/dev/null 2>&1; then
  find .git -name '*.lock' -type f -delete 2>/dev/null || true
fi
git checkout --quiet main 2>/dev/null || true
git reset --hard --quiet origin/main 2>/dev/null || true
git clean -fdq 2>/dev/null || true
git fetch origin --prune --quiet || { echo "fetch failed"; exit 1; }
git reset --hard --quiet origin/main || { echo "reset failed"; exit 1; }

# Cheap exit when there is nothing waiting. Keeps an hourly schedule almost
# free, and keeps the logs readable.
OPEN_BLOG_PRS="$(gh pr list --repo mutaaf/digital-craft-architect \
  --state open --base main --json headRefName \
  --jq '[.[] | select(.headRefName | startswith("gtm/blog-"))] | length' 2>/dev/null || echo 0)"

if [ "${OPEN_BLOG_PRS:-0}" -eq 0 ]; then
  echo "no open blog PR; nothing to ship"
  exit 0
fi
echo "$OPEN_BLOG_PRS open blog PR(s); handing off to ship-blogs.sh"

# ship-blogs.sh owns every safety property from here: it refuses a dirty tree,
# reruns the full check suite, never force-pushes without a lease, and never
# merges without green CI.
bash "$CLONE/scripts/ship-blogs.sh" --repo "$CLONE" ${DRY_RUN:+"$DRY_RUN"}
STATUS=$?

echo "=== blog-ship-runner complete, exit=$STATUS ==="

# Keep the last 200 logs; this runs hourly and nobody prunes it by hand.
# Names are run-YYYYmmdd-HHMMSS.log, so lexical sort IS chronological.
find "$LOG_DIR" -name 'run-*.log' -type f 2>/dev/null | sort -r | tail -n +201 \
  | while IFS= read -r old_log; do rm -f "$old_log"; done
exit $STATUS
