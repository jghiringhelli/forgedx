#!/usr/bin/env bash
# Gate 10 — apps/web jscpd duplication ≤ 1%
set -uo pipefail
REPO_ROOT=$(git rev-parse --show-toplevel)
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '^apps/web/src/' | grep -E '\.(ts|tsx)$' | grep -v '\.spec\.' || true)
[ -z "$STAGED" ] && exit 0

cd "$REPO_ROOT/apps/web" || exit 1

OUTPUT=$(npx --no-install jscpd src --config .jscpd.json --reporters consoleFull 2>&1 || true)

if echo "$OUTPUT" | grep -qi 'error\|exceeded'; then
  echo ""
  echo "  ✗ [Gate 10] apps/web jscpd duplication threshold exceeded (limit: 1%)."
  echo "  Extract duplicated JSX/logic into a shared component or hook."
  echo ""
  exit 1
fi
exit 0
