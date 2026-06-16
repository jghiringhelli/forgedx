#!/usr/bin/env bash
# Gate 9 — apps/api jscpd duplication ≤ 4%
set -uo pipefail
REPO_ROOT=$(git rev-parse --show-toplevel)
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '^apps/api/src/' | grep '\.ts$' | grep -v '\.spec\.' || true)
[ -z "$STAGED" ] && exit 0

cd "$REPO_ROOT/apps/api" || exit 1

OUTPUT=$(npx --no-install jscpd src --config .jscpd.json --reporters consoleFull 2>&1 || true)
DUPLICATION=$(echo "$OUTPUT" | grep -oE '[0-9]+\.[0-9]+%' | tail -1 || true)

if echo "$OUTPUT" | grep -qi 'error\|exceeded'; then
  echo ""
  echo "  ✗ [Gate 9] apps/api jscpd duplication threshold exceeded (limit: 4%)."
  echo "  Current: $DUPLICATION"
  echo "  Extract the duplicated logic into a shared helper."
  echo ""
  exit 1
fi
exit 0
