#!/bin/bash
# Local autonomous GTM groomer. Fired by launchd (daily ~6am local).
#
# This is the "self-learning" loop:
#  1. Scans recent merged PRs and reviewer BLOCK comments on `needs-human`
#     PRs, distills any new lessons, and appends them to LESSONS.md.
#  2. Re-grooms AGENT.md backlog: marks shipped items [x], demotes stale
#     items, and adds 2-4 fresh conversion-focused ideas if the unchecked
#     queue is running low (< 5 [ ] items).
#  3. Opens a PR with AGENT.md + LESSONS.md changes only — no src/ touches.
#
# Runs against your Claude Max subscription via local `claude` CLI — free.
# Persistent checkout at ~/.cache/dca-agent/groom-checkout so it never
# touches the working repo.
#
# Smoke-test: SMOKE=1 ./scripts/gtm-groomer-local.sh

set -euo pipefail

export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HOME="${HOME:-/Users/$(whoami)}"

REPO_URL="https://github.com/mutaaf/digital-craft-architect"
WORKDIR="$HOME/.cache/dca-agent/groom-checkout"
LOG_DIR="$HOME/.cache/dca-agent/logs"
mkdir -p "$WORKDIR" "$LOG_DIR"

TS=$(date -u +%Y%m%d-%H%M%S)
LOG="$LOG_DIR/groomer-$TS.log"
exec >"$LOG" 2>&1

echo "=== dca-gtm-groomer firing $(date -u) (local $(date)) ==="
echo "claude=$(command -v claude || echo MISSING)"
echo "gh=$(command -v gh || echo MISSING)"
echo

# Self-cancel after 2026-06-02 UTC. Bound the autonomous spend.
TODAY=$(date -u +%Y%m%d)
if [ "$TODAY" -ge "20260602" ]; then
  echo "expired — bump self-cancel date in scripts/gtm-groomer-local.sh"
  exit 0
fi

# Lock — skip if another groomer run is still going.
LOCK="/tmp/dca-gtm-groomer.lock"
if [ -f "$LOCK" ]; then
  PID=$(cat "$LOCK" 2>/dev/null || echo "")
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    echo "another groomer run in progress (pid $PID), skipping"
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
git config user.name "DigitalCraft GTM Groomer"

if [ "${SMOKE:-0}" = "1" ]; then
  echo "--- SMOKE MODE ---"
  claude --print --dangerously-skip-permissions --model claude-opus-4-7 \
    "Reply with exactly: GROOMER-SMOKE-OK $(date -u +%H:%M:%S). Do not call any tools."
  EXIT=$?
  echo "=== groomer SMOKE complete $(date -u) — exit=$EXIT ==="
  exit $EXIT
fi

claude --print --dangerously-skip-permissions --model claude-opus-4-7 <<'PROMPT'
You are the autonomous GTM Groomer for the DigitalCraft AI marketing site.
You are at the repo root on main, fresh-pulled. You may ONLY modify
AGENT.md and LESSONS.md. Any other path change fails the run.

Today's date: run `date +%Y-%m-%d` and use the value verbatim.

## Part A — Distill new lessons (LESSONS.md)

Inputs:
  gh pr list --state all --label needs-human --limit 10 \
    --json number,title,reviews,closedAt \
    --jq '[.[] | {n: .number, title, blocks: [.reviews[] | select(.state=="CHANGES_REQUESTED") | .body]}] | .[]'

For each PR returned:
  - Read the BLOCK body (reviewer's rubric findings).
  - If the lesson is NOT already in LESSONS.md (grep for keywords), append
    a new entry using the format documented at the top of LESSONS.md.
  - Cite the PR (`**Where:** PR #N`). One headline per distinct mistake
    pattern; don't write three entries for the same issue across three PRs.

If no new lessons, leave LESSONS.md untouched.

## Part B — Groom AGENT.md backlog

  1. Count unchecked `[ ]` items in AGENT.md backlog.
  2. For each `[ ]` item, ask: is this still high-leverage? Are any items
     superseded by what's been shipped (read `git log --oneline -20`)?
     Mark superseded items `[~]` with a one-line reason in parentheses.
  3. If the unchecked queue is < 5 items, add 2-4 NEW backlog items at the
     bottom of the appropriate tier section. Focus areas, in priority order:
       - Direct conversion lift (CTA placement, form friction reduction,
         scarcity, social proof)
       - SEO + new blog posts (target the verticals that don't yet have a
         post: look at src/data/blogPosts.ts)
       - Trust signals (testimonials in new verticals, case studies)
       - New demos for under-served verticals (check src/App.tsx route list
         — which verticals have only 1-2 demos vs construction's 7?)
     Each new item follows the existing template:
       `- [ ] TASK-ID: <description with specific files to touch>`
     IDs are SHOUT_CASE, prefixed with category (BLOG-, DEMO-, CTA-, etc.).
     Make the description SPECIFIC enough that a worker can ship it in one
     PR under 200 lines — list the exact files and the exact change.

## Part C — Ship the PR

  1. If neither LESSONS.md nor AGENT.md changed, print "no grooming needed"
     and exit cleanly with no PR.
  2. Otherwise:
     git checkout -b chore/groom-$(date +%Y%m%d)
     git add AGENT.md LESSONS.md
     git commit -m "chore(groom): $(date +%Y-%m-%d) — <X lessons folded, Y backlog items added/demoted>"
     git push -u origin HEAD
     gh pr create --title "chore(groom): $(date +%Y-%m-%d) backlog + lessons refresh" \
       --body "<summary of what changed and why>"

HARD RULES:
  - Never touch src/, api/, package.json, .env*, public/, tests/, scripts/,
    .github/, or any other path. Only AGENT.md and LESSONS.md.
  - Never delete existing LESSONS.md entries; only append.
  - Never invent new backlog items that duplicate existing checked-off ones.
  - Conservative claim discipline applies to backlog descriptions too.

End with: PR url (or "no grooming needed"), lessons added count, backlog
items added/demoted counts.
PROMPT

EXIT=$?
echo
echo "=== dca-gtm-groomer complete $(date -u) — exit=$EXIT ==="
exit $EXIT
