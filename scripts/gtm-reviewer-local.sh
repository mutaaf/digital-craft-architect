#!/bin/bash
# Local autonomous GTM reviewer. Polls every 15 minutes for open agent PRs
# that haven't been reviewed yet, then grades each one with local `claude`
# (Claude Max subscription, free).
#
# GitHub forbids self-approval and the gh token is yours (same identity that
# pushes the PR), so this agent never posts --approve. It posts:
#   --comment           — clean PRs (informational sign-off; doesn't block)
#   --request-changes   — blocking issues (blocks auto-merge until dismissed)
#
# It also applies the `needs-human` label on BLOCK, and removes it on OK.
# Quiet-exits when no work, so launchd doesn't fill the disk with empty logs.

set -euo pipefail

export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HOME="${HOME:-/Users/$(whoami)}"

REPO="mutaaf/digital-craft-architect"
WORKDIR="$HOME/.cache/dca-agent/review-checkout"
LOG_DIR="$HOME/.cache/dca-agent/logs"
mkdir -p "$LOG_DIR"

# Self-cancel after 2026-06-02 UTC. Bound the autonomous spend.
TODAY=$(date -u +%Y%m%d)
if [ "$TODAY" -ge "20260602" ]; then
  exit 0
fi

ME=$(gh api user --jq .login 2>/dev/null || echo "")
if [ -z "$ME" ]; then
  echo "$(date -u): reviewer — no gh auth, exiting" >> "$LOG_DIR/reviewer.err"
  exit 1
fi

# Find open PRs from either agent (gtm-agent | eng-agent) that we haven't
# reviewed yet. The two labels share one reviewer queue.
UNREVIEWED=$(gh pr list --repo "$REPO" --state open --base main \
  --json number,headRefName,reviews,labels \
  --jq "[.[]
          | select((.labels | any(.name == \"gtm-agent\")) or (.labels | any(.name == \"eng-agent\")))
          | select(.reviews | any(.author.login == \"$ME\") | not)
          | .number] | .[]" 2>/dev/null)

if [ -z "$UNREVIEWED" ]; then
  exit 0
fi

# We have work. Spin up the log file.
TS=$(date -u +%Y%m%d-%H%M%S)
LOG="$LOG_DIR/reviewer-$TS.log"
exec >"$LOG" 2>&1

echo "=== dca-gtm-reviewer firing $(date -u) (local $(date)) ==="
echo "reviewer identity: $ME"
echo "unreviewed PRs: $(echo "$UNREVIEWED" | tr '\n' ' ')"
echo

# Fresh checkout of the repo so claude can read the actual files.
if [ ! -d "$WORKDIR/.git" ]; then
  git clone --depth=50 "https://github.com/$REPO" "$WORKDIR"
fi
cd "$WORKDIR"
git fetch origin --prune --quiet
git checkout main --quiet
git reset --hard origin/main --quiet
git clean -fdq

for PR in $UNREVIEWED; do
  echo "--- reviewing PR #$PR ---"
  claude --print --dangerously-skip-permissions --model claude-opus-4-7 <<PROMPT
You are the autonomous GTM Reviewer for the DigitalCraft AI marketing site.
You are at the repo root on main, fresh-pulled.

Review PR #$PR (repo: $REPO). You have gh CLI and tool access.

Step 1 — gather context:
  gh pr view $PR --json title,body,headRefName,files,labels,statusCheckRollup
  gh pr diff $PR  (read the entire diff)

Step 2 — apply this rubric. Default to BLOCK on uncertainty:
  - Does the diff implement the *specific* TASK-ID claimed in the PR title?
  - Date sanity: any post in src/data/blogPosts.ts with a date ≠ today
    ($(date +%Y-%m-%d)) or duplicating an existing post's date?
  - No-touch zones: any change in /api/, package.json, package-lock.json, .env*?
  - Dark mode: new components/markup with light variants but missing dark: ones?
  - Brand voice: indefensible claims ("500+" without basis), fabricated
    testimonials, em-dashes (—), invented numbers?
  - Internal links: do new blog posts link to the right vertical pages
    (/construction, /realestate, etc.)?
  - Off-task signal: more than ~200 lines diff (excluding blog post content)
    under one TASK-ID?
  - CI state: must be green (statusCheckRollup all SUCCESS/PASS).

Step 3 — verdict:
  If everything passes AND CI is green:
    gh pr review $PR --comment --body "OK — <one-paragraph summary of what you checked>"
    gh pr edit $PR --remove-label needs-human 2>/dev/null || true
    gh pr merge $PR --squash --auto

  If any rubric item fails OR CI is red:
    gh pr review $PR --request-changes --body "BLOCK\n\n<one line per concern, file:line + reason>"
    gh pr edit $PR --add-label needs-human

End your output with: PR number, verdict (OK/BLOCK), and the merge state.
PROMPT
  echo
done

echo "=== dca-gtm-reviewer complete $(date -u) ==="
