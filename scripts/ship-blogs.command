#!/bin/bash
# Double-clickable wrapper for ship-blogs.sh.
# Exists so the blog catch-up can be shipped from a machine that has gh and
# network access, without needing anything typed into a terminal.

cd "$(dirname "$0")/.." || exit 1

echo "Running scripts/ship-blogs.sh"
echo "Repo: $(pwd)"
echo "-------------------------------------------------------------"
echo

bash scripts/ship-blogs.sh
STATUS=$?

echo
echo "-------------------------------------------------------------"
if [ $STATUS -eq 0 ]; then
  echo "DONE — exit code 0 (success)"
else
  echo "STOPPED — exit code $STATUS (nothing was force-pushed or force-merged)"
fi
echo
echo "This window can be closed."
