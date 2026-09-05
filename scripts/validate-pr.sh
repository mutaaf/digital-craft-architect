#!/usr/bin/env bash
#
# validate-pr.sh — prove a branch introduces no regression, functional or not.
#
# Why this exists: reviewing a change by eye does not catch a route that stops
# rendering or a bundle that doubles. Worse, running the test suite on the head
# alone cannot tell a regression from a failure that was already there. On
# 2026-08-18 four e2e tests failed on a blog PR that could not possibly have
# caused them; the branch was blameless and the time went into proving it.
# So this measures BASE and HEAD the same way and compares.
#
# Functional:      every e2e test, base vs head, per-test.
# Non-functional:  bundle bytes (raw + gzip), entry-chunk bytes, chunk count,
#                  build duration, sitemap URL count.
#
# Exit 0 = no regression. Exit 1 = regression. Exit 2 = harness could not run.
#
# Usage:
#   bash scripts/validate-pr.sh 181              # a PR number
#   bash scripts/validate-pr.sh some/branch      # a branch
#   bash scripts/validate-pr.sh 181 --fast       # skip the base e2e run
#
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_REF="origin/main"
TARGET="${1:?usage: validate-pr.sh <pr-number|branch> [--fast]}"
FAST=0
[ "${2:-}" = "--fast" ] && FAST=1

WORK="${TMPDIR:-/tmp}/dca-validate-$$"
BASE_WT="$WORK/base"
HEAD_WT="$WORK/head"

die()  { printf '\n\033[31m✗ %s\033[0m\n' "$*" >&2; exit 2; }
step() { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }
note() { printf '  %s\n' "$*"; }

# shellcheck disable=SC2329  # invoked via trap
cleanup() {
  cd "$REPO" || return
  git worktree remove --force "$BASE_WT" 2>/dev/null || true
  git worktree remove --force "$HEAD_WT" 2>/dev/null || true
  rm -rf "$WORK"
}
trap cleanup EXIT

cd "$REPO" || die "repo not found"
command -v gh >/dev/null 2>&1 || die "gh CLI required"

# --------------------------------------------------------------------------
# Resolve the head ref
# --------------------------------------------------------------------------
step "Resolving target"
if [[ "$TARGET" =~ ^[0-9]+$ ]]; then
  HEAD_REF="$(gh pr view "$TARGET" --json headRefName --jq .headRefName)" \
    || die "no PR #$TARGET"
  note "PR #$TARGET -> $HEAD_REF"
else
  HEAD_REF="$TARGET"
fi
git fetch origin --prune --quiet || die "fetch failed"

git rev-parse --verify --quiet "origin/$HEAD_REF" >/dev/null \
  || git rev-parse --verify --quiet "$HEAD_REF" >/dev/null \
  || die "branch $HEAD_REF not found locally or on origin"
HEAD_SHA="$(git rev-parse --short "origin/$HEAD_REF" 2>/dev/null || git rev-parse --short "$HEAD_REF")"
BASE_SHA="$(git rev-parse --short "$BASE_REF")"
note "base $BASE_REF ($BASE_SHA)  head $HEAD_REF ($HEAD_SHA)"

# --------------------------------------------------------------------------
# Two isolated worktrees
# --------------------------------------------------------------------------
step "Preparing worktrees"
mkdir -p "$WORK"
git worktree add --detach "$BASE_WT" "$BASE_REF" >/dev/null 2>&1 || die "base worktree failed"
git worktree add --detach "$HEAD_WT" "origin/$HEAD_REF" >/dev/null 2>&1 \
  || git worktree add --detach "$HEAD_WT" "$HEAD_REF" >/dev/null 2>&1 \
  || die "head worktree failed"

# Dependencies. Sharing the parent's node_modules is safe ONLY when neither
# manifest moved; a PR that changes deps must install its own or the whole
# comparison is measuring the wrong tree.
DEPS_CHANGED=0
if ! git diff --quiet "$BASE_REF" "origin/$HEAD_REF" -- package.json package-lock.json 2>/dev/null; then
  DEPS_CHANGED=1
fi
for wt in "$BASE_WT" "$HEAD_WT"; do
  if [ "$DEPS_CHANGED" -eq 1 ]; then
    note "dependencies differ; installing in $(basename "$wt")"
    (cd "$wt" && npm ci --silent >/dev/null 2>&1) || die "npm ci failed in $wt"
  else
    ln -s "$REPO/node_modules" "$wt/node_modules"
  fi
done
[ "$DEPS_CHANGED" -eq 0 ] && note "manifests identical; sharing node_modules"

# --------------------------------------------------------------------------
# Measurement helpers
# --------------------------------------------------------------------------
# Bytes of every emitted JS chunk, plus the entry chunk specifically. The entry
# is what a first-time visitor pays for before anything renders, so a
# code-splitting change can cut it dramatically while total bytes barely move.
measure_bundle() {
  local wt="$1" out="$2" start end
  start=$(date +%s)
  (cd "$wt" && npm run build >/dev/null 2>&1) || return 1
  end=$(date +%s)

  local total=0 gzip_total=0 count=0 entry=0
  while IFS= read -r f; do
    local sz gz
    sz=$(wc -c <"$f" | tr -d ' ')
    gz=$(gzip -c "$f" | wc -c | tr -d ' ')
    total=$((total + sz)); gzip_total=$((gzip_total + gz)); count=$((count + 1))
    case "$(basename "$f")" in index-*.js) entry=$sz ;; esac
  done < <(find "$wt/dist/assets" -name '*.js' -type f 2>/dev/null)

  local urls
  urls=$(grep -c '<loc>' "$wt/dist/sitemap.xml" 2>/dev/null || echo 0)

  cat >"$out" <<EOF
total_js=$total
gzip_js=$gzip_total
chunks=$count
entry_js=$entry
build_secs=$((end - start))
sitemap_urls=$urls
EOF
}

# One line per test: "status<TAB>title". Compared as sets, so a test that was
# already failing on base is never counted against the branch.
run_e2e() {
  local wt="$1" out="$2"
  (cd "$wt" && CI=1 npx playwright test --reporter=list 2>&1) \
    | sed -nE 's/^[[:space:]]*(✓|✘)[[:space:]]+[0-9]+[[:space:]]+(.*[^ ]) \([0-9]+(\.[0-9]+)?m?s\)$/\1\t\2/p' \
    | sed 's/^✓/PASS/; s/^✘/FAIL/' | sort -u >"$out"
}

fmt_kb() { awk -v b="$1" 'BEGIN{printf "%.1f KB", b/1024}'; }
pct()    { awk -v a="$1" -v b="$2" 'BEGIN{if(a==0){print "n/a"}else{printf "%+.1f%%", (b-a)*100/a}}'; }

# --------------------------------------------------------------------------
# Non-functional: build + bundle, both sides
# --------------------------------------------------------------------------
step "Building base and head"
measure_bundle "$BASE_WT" "$WORK/base.metrics" || die "base build failed (branch is not the cause)"
note "base built"
measure_bundle "$HEAD_WT" "$WORK/head.metrics" || {
  printf '\n\033[31m✗ REGRESSION: head does not build\033[0m\n'; exit 1;
}
note "head built"
# Read the metrics files explicitly rather than sourcing them: a metrics file
# is generated data, and sourcing generated data into this shell would let a
# stray line define anything it likes.
mval() { awk -F= -v k="$2" '$1==k{print $2}' "$1"; }
B_TOTAL=$(mval "$WORK/base.metrics" total_js);     H_TOTAL=$(mval "$WORK/head.metrics" total_js)
B_GZIP=$(mval "$WORK/base.metrics" gzip_js);       H_GZIP=$(mval "$WORK/head.metrics" gzip_js)
B_CHUNKS=$(mval "$WORK/base.metrics" chunks);      H_CHUNKS=$(mval "$WORK/head.metrics" chunks)
B_ENTRY=$(mval "$WORK/base.metrics" entry_js);     H_ENTRY=$(mval "$WORK/head.metrics" entry_js)
B_BUILD=$(mval "$WORK/base.metrics" build_secs);   H_BUILD=$(mval "$WORK/head.metrics" build_secs)
B_URLS=$(mval "$WORK/base.metrics" sitemap_urls);  H_URLS=$(mval "$WORK/head.metrics" sitemap_urls)

# --------------------------------------------------------------------------
# Static gates on head
# --------------------------------------------------------------------------
step "Static checks on head"
STATIC_FAIL=""
for c in lint check-links check-images check-meta check-blog-dates; do
  if (cd "$HEAD_WT" && npm run "$c" >/dev/null 2>&1); then
    note "$c ok"
  else
    note "$c FAILED"; STATIC_FAIL="$STATIC_FAIL $c"
  fi
done

# --------------------------------------------------------------------------
# Functional: e2e both sides
# --------------------------------------------------------------------------
step "Running e2e on head"
run_e2e "$HEAD_WT" "$WORK/head.tests"
H_PASS=$(grep -c '^PASS' "$WORK/head.tests" || true)
H_FAIL=$(grep -c '^FAIL' "$WORK/head.tests" || true)
note "head: $H_PASS passed, $H_FAIL failed"

NEW_FAILURES=""
if [ "$FAST" -eq 1 ]; then
  note "--fast: skipping base e2e (cannot separate new failures from pre-existing)"
else
  step "Running e2e on base (to separate new failures from pre-existing)"
  run_e2e "$BASE_WT" "$WORK/base.tests"
  B_PASS=$(grep -c '^PASS' "$WORK/base.tests" || true)
  B_FAIL=$(grep -c '^FAIL' "$WORK/base.tests" || true)
  note "base: $B_PASS passed, $B_FAIL failed"

  # A regression is a test that passed on base and fails on head. Nothing else.
  grep '^PASS' "$WORK/base.tests" | cut -f2 | sort -u >"$WORK/base.passing"
  grep '^FAIL' "$WORK/head.tests" | cut -f2 | sort -u >"$WORK/head.failing"
  NEW_FAILURES="$(comm -12 "$WORK/base.passing" "$WORK/head.failing")"
fi

# --------------------------------------------------------------------------
# Verdict
# --------------------------------------------------------------------------
printf '\n\033[1m=== VALIDATION REPORT: %s (%s) vs %s (%s) ===\033[0m\n' \
  "$HEAD_REF" "$HEAD_SHA" "$BASE_REF" "$BASE_SHA"

printf '\nNon-functional\n'
printf '  %-18s %12s %12s   %s\n' "metric" "base" "head" "delta"
printf '  %-18s %12s %12s   %s\n' "total JS"    "$(fmt_kb "$B_TOTAL")" "$(fmt_kb "$H_TOTAL")" "$(pct "$B_TOTAL" "$H_TOTAL")"
printf '  %-18s %12s %12s   %s\n' "total JS (gzip)" "$(fmt_kb "$B_GZIP")" "$(fmt_kb "$H_GZIP")" "$(pct "$B_GZIP" "$H_GZIP")"
printf '  %-18s %12s %12s   %s\n' "entry chunk" "$(fmt_kb "$B_ENTRY")" "$(fmt_kb "$H_ENTRY")" "$(pct "$B_ENTRY" "$H_ENTRY")"
printf '  %-18s %12s %12s   %s\n' "chunk count" "$B_CHUNKS" "$H_CHUNKS" "$(pct "$B_CHUNKS" "$H_CHUNKS")"
printf '  %-18s %12s %12s   %s\n' "build seconds" "$B_BUILD" "$H_BUILD" "$(pct "$B_BUILD" "$H_BUILD")"
printf '  %-18s %12s %12s   %s\n' "sitemap urls" "$B_URLS" "$H_URLS" "$(pct "$B_URLS" "$H_URLS")"

printf '\nFunctional\n'
printf '  head e2e: %s passed, %s failed\n' "$H_PASS" "$H_FAIL"
[ "$FAST" -eq 0 ] && printf '  base e2e: %s passed, %s failed\n' "$B_PASS" "$B_FAIL"

VERDICT=0
REASONS=""

if [ -n "$NEW_FAILURES" ]; then
  VERDICT=1
  REASONS="$REASONS\n  FUNCTIONAL REGRESSION: tests passing on base now fail on head:"
  while IFS= read -r t; do [ -n "$t" ] && REASONS="$REASONS\n    - $t"; done <<<"$NEW_FAILURES"
elif [ "$FAST" -eq 1 ] && [ "$H_FAIL" -gt 0 ]; then
  VERDICT=1
  REASONS="$REASONS\n  $H_FAIL e2e failure(s) on head and --fast skipped the base run, so they cannot be cleared as pre-existing."
fi

if [ -n "$STATIC_FAIL" ]; then
  VERDICT=1
  REASONS="$REASONS\n  STATIC CHECK FAILED:$STATIC_FAIL"
fi

# Bundle thresholds. Entry chunk is weighted hardest because it gates first
# paint; total is allowed more room since lazy bytes are not paid up front.
if [ "$B_ENTRY" -gt 0 ] && awk -v a="$B_ENTRY" -v b="$H_ENTRY" 'BEGIN{exit !(b > a*1.10)}'; then
  VERDICT=1
  REASONS="$REASONS\n  NON-FUNCTIONAL REGRESSION: entry chunk grew more than 10% ($(fmt_kb "$B_ENTRY") -> $(fmt_kb "$H_ENTRY"))."
fi
if [ "$B_GZIP" -gt 0 ] && awk -v a="$B_GZIP" -v b="$H_GZIP" 'BEGIN{exit !(b > a*1.15)}'; then
  VERDICT=1
  REASONS="$REASONS\n  NON-FUNCTIONAL REGRESSION: total gzipped JS grew more than 15% ($(fmt_kb "$B_GZIP") -> $(fmt_kb "$H_GZIP"))."
fi
if [ "$H_URLS" -lt "$B_URLS" ]; then
  VERDICT=1
  REASONS="$REASONS\n  SEO REGRESSION: sitemap lost URLs ($B_URLS -> $H_URLS)."
fi

if [ "$VERDICT" -eq 0 ]; then
  printf '\n\033[32m✓ NO REGRESSION\033[0m\n'
  printf '  No test that passed on base fails on head. Static checks green.\n'
  printf '  Bundle and sitemap within thresholds.\n'
else
  printf '\n\033[31m✗ REGRESSION\033[0m'
  printf '%b\n' "$REASONS"
fi
exit "$VERDICT"
