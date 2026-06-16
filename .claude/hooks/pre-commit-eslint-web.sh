#!/usr/bin/env bash
# Gate 11b — apps/web ESLint --max-warnings=0
set -uo pipefail
REPO_ROOT=$(git rev-parse --show-toplevel)
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '^apps/web/src/' | grep -E '\.(ts|tsx)$' || true)
[ -z "$STAGED" ] && exit 0

cd "$REPO_ROOT/apps/web" || exit 1

if ! npx --no-install eslint --max-warnings=0 "src/**/*.{ts,tsx}" 2>&1; then
  echo ""
  echo "  ✗ [Gate 11b] apps/web ESLint violations (max-warnings=0)."
  echo "  Fix all ESLint errors and warnings before committing."
  echo ""
  exit 1
fi
exit 0
