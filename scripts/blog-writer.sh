#!/usr/bin/env bash
#
# blog-writer.sh: draft ONE blog post as a gtm/blog-* PR, on the agency server.
#
# The writing half of the blog pipeline (P-3). It never merges: blog-ship
# (~/blogship/blog-ship, its own timer) merges gtm/blog-* PRs on green CI.
# The prompt is blog/writer/PROMPT.md, versioned in this repo.
#
# DISABLED until Mutaaf retires the cloud routine trig_0127b6vx6XFJzjLpoJF17yBp.
# Two writers on one day collide on the post date and double post. The guard:
# a run without --manual does nothing unless ~/.config/dca-blog-writer/ENABLED
# exists, and the systemd timer in blog/writer/systemd/ is not installed.
#
# Usage:  bash scripts/blog-writer.sh             (from the timer; needs ENABLED)
#         bash scripts/blog-writer.sh --manual    (one hand run; refused on Mon/Wed
#                                                  while ENABLED is absent, the
#                                                  cloud routine's days)
#         bash scripts/blog-writer.sh --dry-run   (prep and gates only, no Claude)
#
# Stop it: rm ~/.config/dca-blog-writer/ENABLED (takes effect on the next run),
# and systemctl --user disable --now dca-blog-writer.timer.
#
# Like blog-ship-runner.sh it works in a DEDICATED clone, never the shared
# checkout other agents edit, so resetting it can never destroy their work.
set -uo pipefail

REMOTE="https://github.com/mutaaf/digital-craft-architect.git"
REPO="mutaaf/digital-craft-architect"
STATE="$HOME/.config/dca-blog-writer"
CACHE="$HOME/.cache/dca-blog-writer"
CLONE="$CACHE/repo"
LOG="$CACHE/logs/run-$(date -u +%Y%m%d-%H%M%S).log"
MODE="scheduled"
case "${1:-}" in
  --manual) MODE="manual" ;;
  --dry-run) MODE="dry-run" ;;
  "") ;;
  *) echo "usage: $0 [--manual|--dry-run]"; exit 2 ;;
esac

mkdir -p "$CACHE/logs"
exec > >(tee -a "$LOG") 2>&1
echo "=== blog-writer $MODE $(date -u) ==="

report() { echo "$1"; exit "${2:-0}"; }

if [ ! -f "$STATE/ENABLED" ]; then
  [ "$MODE" = "scheduled" ] && report "SKIPPED: blog writer disabled (no $STATE/ENABLED)"
  case "$(date -u +%u)" in
    1|3) [ "$MODE" = "manual" ] && report "SKIPPED: Mon/Wed is the cloud routine's day; hand runs only on other days until it is retired" ;;
  esac
fi
[ -f "$STATE/STOP" ] && report "SKIPPED: $STATE/STOP exists"

for tool in git gh npm node agency-ring; do
  command -v "$tool" >/dev/null 2>&1 || report "FAILED: $tool not on PATH" 1
done
gh auth status >/dev/null 2>&1 || report "FAILED: gh not authenticated" 1

# Gates, before any Claude spend. A failed query is a failure, never "no PRs".
if ! OPEN="$(gh pr list -R "$REPO" --state open --json headRefName \
  --jq '[length, ([.[] | select(.headRefName | startswith("gtm/blog-"))] | length)] | @tsv' 2>&1)"; then
  report "FAILED: could not list open PRs: $OPEN" 1
fi
read -r OPEN_ALL OPEN_BLOG <<<"$OPEN"
case "$OPEN_ALL$OPEN_BLOG" in ''|*[!0-9]*) report "FAILED: unexpected PR list output: $OPEN" 1 ;; esac
[ "$OPEN_BLOG" -gt 0 ] && report "SKIPPED: a gtm/blog-* PR is still open"
[ "$OPEN_ALL" -ge 3 ] && report "SKIPPED: $OPEN_ALL PRs open, cap is 3"

# Fresh clone state: this clone belongs to the writer alone.
if [ ! -d "$CLONE/.git" ]; then
  git clone --quiet "$REMOTE" "$CLONE" || report "FAILED: clone failed" 1
fi
cd "$CLONE" || report "FAILED: clone missing" 1
if [ -n "$(find .git -name '*.lock' -type f 2>/dev/null)" ]; then
  report "FAILED: git lock in $CLONE/.git; a run may still be going, or one crashed" 1
fi
git fetch origin --prune --quiet || report "FAILED: fetch failed" 1
git checkout --quiet -f main && git reset --hard --quiet origin/main && git clean -fdq \
  || report "FAILED: could not reset the writer clone to origin/main" 1
# Drop local gtm/blog-* branches from earlier runs (their PRs carry the work).
git for-each-ref --format='%(refname:short)' 'refs/heads/gtm/blog-*' | xargs -r git branch -D --quiet
npm ci --no-audit --no-fund --loglevel=error >/dev/null || report "FAILED: npm ci failed" 1

TODAY="$(date -u +%Y-%m-%d)"
STAMP="$(date -u +%Y%m%d)"
PROMPT="$(cat "$CLONE/blog/writer/PROMPT.md")

## Run facts (from scripts/blog-writer.sh)
- TODAY: $TODAY
- STAMP: $STAMP
- Mode: $MODE"

[ "$MODE" = "dry-run" ] && report "SKIPPED: dry run; clone ready at $CLONE, gates passed"

# agency-ring queues the job behind the memory guard and posts the result to
# Slack when BLOG_WRITER_SLACK_THREAD (CHANNEL: or CHANNEL:TS) is set.
OUT="$(agency-ring run claude "$CLONE" "$PROMPT" --turns 80 --timeout 3600 \
  ${BLOG_WRITER_SLACK_THREAD:+--thread "$BLOG_WRITER_SLACK_THREAD"})"
RC=$?
echo "$OUT"
LAST="$(printf '%s\n' "$OUT" | sed '/^[[:space:]]*$/d' | tail -n 1)"

find "$CACHE/logs" -name 'run-*.log' -type f | sort -r | tail -n +101 | xargs -r rm -f

case "$LAST" in
  SHIPPED-PR:*|SKIPPED:*) echo "=== blog-writer done (ring exit $RC): $LAST ==="; exit 0 ;;
  *) echo "=== blog-writer FAILED (ring exit $RC): last line was: $LAST ==="; exit 1 ;;
esac
