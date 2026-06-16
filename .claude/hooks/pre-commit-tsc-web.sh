#!/usr/bin/env bash
# Gate 12 — apps/web tsc --noEmit (zero errors)
set -uo pipefail
REPO_ROOT=$(git rev-parse --show-toplevel)
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '^apps/web/(src|tests)/' | grep -E '\.(ts|tsx)$' || true)
[ -z "$STAGED" ] && exit 0

cd "$REPO_ROOT/apps/web" || exit 1

if ! npx --no-install tsc --noEmit -p tsconfig.json 2>&1; then
  echo ""
  echo "  ✗ [Gate 12] apps/web TypeScript errors (tsc --noEmit)."
  echo "  Fix all type errors before committing."
  echo ""
  exit 1
fi
exit 0
