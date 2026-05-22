#!/bin/bash
# Local autonomous Engineering worker. Fired by launchd every 6 hours.
#
# Peer of gtm-worker — same plumbing, different backlog (ENGINEERING.md),
# different label (eng-agent), different allowed-touch zones (CAN modify
# package.json, tsconfig, CI workflows; CANNOT touch /api/, src/data/blogPosts.ts,
# or AGENT.md).
#
# Runs against Claude Max sub via local `claude` CLI — no per-token cost.
# Persistent checkout at ~/.cache/dca-agent/eng-checkout.
#
# Smoke-test: SMOKE=1 ./scripts/eng-worker-local.sh

set -euo pipefail

export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HOME="${HOME:-/Users/$(whoami)}"

REPO_URL="https://github.com/mutaaf/digital-craft-architect"
WORKDIR="$HOME/.cache/dca-agent/eng-checkout"
LOG_DIR="$HOME/.cache/dca-agent/logs"
mkdir -p "$WORKDIR" "$LOG_DIR"

TS=$(date -u +%Y%m%d-%H%M%S)
LOG="$LOG_DIR/eng-worker-$TS.log"
exec >"$LOG" 2>&1

echo "=== dca-eng-worker firing $(date -u) (local $(date)) ==="
echo "claude=$(command -v claude || echo MISSING)"
echo "gh=$(command -v gh || echo MISSING)"
echo

# Self-cancel after 2026-06-12 UTC. Bound spend.
TODAY=$(date -u +%Y%m%d)
if [ "$TODAY" -ge "20260612" ]; then
  echo "expired — bump self-cancel date in scripts/eng-worker-local.sh"
  exit 0
fi

LOCK="/tmp/dca-eng-worker.lock"
if [ -f "$LOCK" ]; then
  PID=$(cat "$LOCK" 2>/dev/null || echo "")
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    echo "another eng-worker run in progress (pid $PID), skipping"
    exit 0
  fi
fi
echo $$ >"$LOCK"
trap 'rm -f "$LOCK"' EXIT

if [ ! -d "$WORKDIR/.git" ]; then
  git clone --depth=50 "$REPO_URL" "$WORKDIR"
fi
cd "$WORKDIR"
git fetch origin --prune --quiet
git checkout main --quiet
git reset --hard origin/main --quiet
git clean -fdq

git config user.email "noreply@anthropic.com"
git config user.name "DigitalCraft Engineering Agent"

if [ "${SMOKE:-0}" = "1" ]; then
  echo "--- SMOKE MODE ---"
  claude --print --dangerously-skip-permissions --model claude-opus-4-7 \
    "Reply with exactly: ENG-WORKER-SMOKE-OK $(date -u +%H:%M:%S). Do not call any tools."
  EXIT=$?
  echo "=== eng-worker SMOKE complete $(date -u) — exit=$EXIT ==="
  exit $EXIT
fi

claude --print --dangerously-skip-permissions --model claude-opus-4-7 <<'PROMPT'
You are the autonomous Engineering Agent for the DigitalCraft AI codebase.
You are at the repo root on main, fresh-pulled.

Read ENGINEERING.md and execute its workflow EXACTLY. It is the authoritative
spec — your no-touch zones, your backlog, your check list, your rubric.

Quick situational awareness (do not skip steps in ENGINEERING.md):
  1. Read LESSONS.md (rules from past reviewer blocks — apply them all).
  2. Single-PR-at-a-time gate: if an eng-agent PR is open, exit cleanly.
  3. Self-healing first: if any check fails on main, fix it as the heal PR.
  4. Pick the first unchecked [ ] item in ENGINEERING.md backlog.
  5. Implement it. Stay strictly in scope.
  6. Run lint, build, test:e2e (and check-links if you touched routes).
  7. Mark [x], commit, push, Self-Review, open PR with label eng-agent.
  8. STOP. Reviewer handles merge.

HARD RULES (these fail the run):
  • Never touch /api/, .env*, src/data/blogPosts.ts, AGENT.md, LESSONS.md.
  • Diff size cap ~300 lines.
  • Never weaken or skip a passing check to make your change pass.
  • Never push to main.

If no actionable [ ] items in ENGINEERING.md, print "no actionable eng
backlog items" and exit cleanly.

End your run with: TASK-ID, PR url, CI state, Self-Review verdict.
PROMPT

EXIT=$?
echo
echo "=== dca-eng-worker complete $(date -u) — exit=$EXIT ==="
exit $EXIT
