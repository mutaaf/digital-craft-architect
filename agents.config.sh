# agents.config.sh — Digital Craft fleet manifest (plumbing only).
# Semantics live in AGENTS.md § Agent parameters. After editing, redeploy:
#   bash ../agent-fleet/lib/install.sh /Users/mutaafaziz/Desktop/projects/digital-craft-architect
#
# NOTE: the launchd cutover from the legacy com.digitalcraft.gtm-worker/groomer/
# reviewer/eng-worker jobs to the kit (com.digitalcraft.agent-ship/groom/review/
# eng) is a GATED step — DC is a live daily-committing site and the move from
# label-based detection + reviewer-owns-merge to branch-prefix + GitHub
# auto-merge is a behavioral change. See agent-fleet/MIGRATION.md "DC cutover".

PROJECT_NAME="Digital Craft"
SLUG="digitalcraft"
NAMESPACE="com.digitalcraft"
REPO_URL="https://github.com/mutaaf/digital-craft-architect"
MODEL="claude-opus-4-7"

GIT_AUTHOR_NAME="Digital Craft Agent"
GIT_AUTHOR_EMAIL="noreply@anthropic.com"

SELF_CANCEL="20260621"

SHIP_MINUTE=17             # DC's worker historically ran at :17
GROOM_HOURS="6"           # DC groomed daily ~6am
GROOM_MINUTE=0
REVIEW_INTERVAL=900       # DC reviewed every 15 min

# DC keeps its second (engineering) queue.
ENG_ENABLED=1
ENG_HOURS="3 9 15 21"
ENG_MINUTE=23
