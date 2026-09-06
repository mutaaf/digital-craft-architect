#!/usr/bin/env bash
#
# install-blog-ship.sh — schedule the blog merge half via launchd.
#
# Installs blog-ship-runner.sh to a TCC-safe location and registers an hourly
# launchd job that closes the loop the cloud publisher routine cannot: the
# routine opens a PR and stops (its sandbox has no gh, and MCP cannot arm
# auto-merge), so something with gh has to merge it once CI is green.
#
# Two placement rules, both learned the hard way in this project:
#
#   1. NOT from ~/Desktop. macOS refuses to let a launchd-spawned bash read
#      ~/Desktop without Full Disk Access, so the runner is copied to
#      ~/.local/share, the same reason agent-fleet does it.
#   2. NOT against the interactive checkout. The runner operates on its own
#      clone under ~/.cache, because ship-blogs.sh checks out and rebases
#      branches and doing that on a timer inside a directory someone is editing
#      would destroy work in progress.
#
# Idempotent. Re-run after editing blog-ship-runner.sh to refresh the copy.
#
# Usage:  bash scripts/install-blog-ship.sh
#         bash scripts/install-blog-ship.sh --uninstall
#
set -euo pipefail

LABEL="com.digitalcraft.blog-ship"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="$HOME/.local/share/digitalcraft-blog-ship"
RUNNER="$INSTALL_DIR/blog-ship-runner.sh"
LOG_DIR="$HOME/.cache/digitalcraft-blog-ship/logs"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
DOMAIN="gui/$UID"

# :47 keeps this clear of the agent-fleet jobs already on this machine
# (ship :17, eng :23, groom :00), so two runners never contend for gh at once.
MINUTE=47

if [ "${1:-}" = "--uninstall" ]; then
  launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
  rm -f "$PLIST"
  echo "uninstalled $LABEL (clone and logs under ~/.cache left in place)"
  exit 0
fi

mkdir -p "$INSTALL_DIR" "$LOG_DIR" "$(dirname "$PLIST")"
install -m 0755 "$SRC_DIR/blog-ship-runner.sh" "$RUNNER"
echo "installed runner -> $RUNNER"

cat >"$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$RUNNER</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict><key>Minute</key><integer>$MINUTE</integer></dict>
  <key>StandardOutPath</key><string>$LOG_DIR/launchd.out</string>
  <key>StandardErrorPath</key><string>$LOG_DIR/launchd.err</string>
  <key>ProcessType</key><string>Background</string>
  <key>RunAtLoad</key><false/>
</dict>
</plist>
EOF
echo "wrote $PLIST"

# bootout is idempotent on a missing label.
launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
launchctl bootstrap "$DOMAIN" "$PLIST"
launchctl enable "$DOMAIN/$LABEL"

echo
echo "scheduled: hourly at :$MINUTE"
echo "logs:      $LOG_DIR"
echo "run now:   launchctl kickstart -k $DOMAIN/$LABEL"
echo "remove:    bash scripts/install-blog-ship.sh --uninstall"
