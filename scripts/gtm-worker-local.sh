#!/bin/bash
# Local autonomous GTM worker. Fired by launchd (every hour at :17 local).
#
# - Pulls latest main into a persistent working checkout (separate from your
#   working repo at ~/Desktop/projects/digital-craft-architect so it never
#   touches your uncommitted changes).
# - Asks the local `claude` CLI to execute one AGENT.md backlog item end to
#   end: branch -> implement -> checks -> Self-Review -> commit -> push -> PR.
# - Merge is the reviewer agent's job; this script never merges.
#
# Runs against your Claude Max subscription via the local `claude` CLI, so
# there is no per-token API spend. All work happens through claude's tool
# use; this script is just the launcher.
#
# Logs land in ~/.cache/dca-agent/logs/worker-<UTC timestamp>.log.
#
# To smoke-test without doing real work:
#   SMOKE=1 ./scripts/gtm-worker-local.sh

set -euo pipefail

# launchd starts processes with a minimal environment — set PATH ourselves.
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HOME="${HOME:-/Users/$(whoami)}"

REPO_URL="https://github.com/mutaaf/digital-craft-architect"
WORKDIR="$HOME/.cache/dca-agent/checkout"
LOG_DIR="$HOME/.cache/dca-agent/logs"
mkdir -p "$WORKDIR" "$LOG_DIR"

TS=$(date -u +%Y%m%d-%H%M%S)
LOG="$LOG_DIR/worker-$TS.log"
exec >"$LOG" 2>&1

echo "=== dca-gtm-worker firing $(date -u) (local $(date)) ==="
echo "PATH=$PATH"
echo "HOME=$HOME"
echo "claude=$(command -v claude || echo MISSING)"
echo "gh=$(command -v gh || echo MISSING)"
echo

# Self-cancel after 2026-06-02 UTC. Bound the autonomous spend; re-arm by
# editing the date below, then:
#   launchctl kickstart -k gui/$UID/com.digitalcraft.gtm-worker
TODAY=$(date -u +%Y%m%d)
if [ "$TODAY" -ge "20260602" ]; then
  echo "expired — bump the self-cancel date in scripts/gtm-worker-local.sh"
  exit 0
fi

# Lock — skip this run if a previous one is still going.
LOCK="/tmp/dca-gtm-worker.lock"
if [ -f "$LOCK" ]; then
  PID=$(cat "$LOCK" 2>/dev/null || echo "")
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    echo "another worker run in progress (pid $PID), skipping"
    exit 0
  fi
fi
echo $$ >"$LOCK"
trap 'rm -f "$LOCK"' EXIT

# Fresh-pull each run; depth-50 keeps `gh pr` history queries cheap.
if [ ! -d "$WORKDIR/.git" ]; then
  git clone --depth=50 "$REPO_URL" "$WORKDIR"
fi
cd "$WORKDIR"
git fetch origin --prune --quiet
git checkout main --quiet
git reset --hard origin/main --quiet
git clean -fdq

git config user.email "noreply@anthropic.com"
git config user.name "DigitalCraft GTM Agent"

# Smoke-test path: just prove the plumbing works without touching the repo.
if [ "${SMOKE:-0}" = "1" ]; then
  echo "--- SMOKE MODE: skipping real backlog run ---"
  claude --print --dangerously-skip-permissions --model claude-opus-4-7 \
    "Reply with exactly: SMOKE-OK $(date -u +%H:%M:%S). Do not call any tools."
  EXIT=$?
  echo
  echo "=== dca-gtm-worker SMOKE complete $(date -u) — exit=$EXIT ==="
  exit $EXIT
fi

# Real run. Hand off to local claude. --print is non-interactive,
# --dangerously-skip-permissions auto-approves every tool call (no human here).
claude --print --dangerously-skip-permissions --model claude-opus-4-7 <<'PROMPT'
You are the autonomous GTM Innovation Agent for the DigitalCraft AI marketing
site. You are already at the repo root on main, fresh-pulled.

Read AGENT.md and execute its workflow EXACTLY — it is the authoritative spec.
The short version, for your situational awareness only (do not skip steps in
AGENT.md):

  1. Find the first unchecked [ ] item in the backlog.
  2. Branch: gtm/<TASK-ID>-$(date +%Y%m%d).
  3. Implement the item.
  4. Run the full local check suite: lint, check-links, check-images,
     check-meta, check-blog-dates, build. All must pass.
  5. Mark the backlog item [x] with today's date.
  6. Commit (implementation + AGENT.md) with: gtm(TASK-ID): description
  7. Push the branch.
  8. Run the Self-Review pass (Agent tool, general-purpose) per AGENT.md.
     Default posture is BLOCK; only the literal token OK authorizes the PR.
  9. Open the PR with label gtm-agent and the body template from AGENT.md.
 10. Wait for CI: gh pr checks --watch
 11. Do NOT merge. The reviewer agent merges or labels needs-human. Stop.

HARD RULES (these fail the run):
  • Never touch /api/, package.json, package-lock.json, .env*.
  • One task per run. Max ~200 lines diff (excluding blog post content).
  • Never push to main directly. Never bypass branch protection.
  • Blog post date field MUST equal today (`date +%Y-%m-%d`).
  • Preserve dark mode: all new components include dark: Tailwind variants.

If there are no unchecked [ ] items, print "no actionable backlog items" and
exit cleanly.

End your run with: TASK-ID, PR url, CI state, and the Self-Review verdict.
PROMPT

EXIT=$?
echo
echo "=== dca-gtm-worker complete $(date -u) — exit=$EXIT ==="
exit $EXIT
