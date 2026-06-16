#!/usr/bin/env bash
# Gate — Web layer boundaries (app → component → hook → lib only)
# Uses ESLint boundaries config
set -uo pipefail
REPO_ROOT=$(git rev-parse --show-toplevel)
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '^apps/web/src/' | grep -E '\.(ts|tsx)$' | grep -v '\.spec\.' || true)
[ -z "$STAGED" ] && exit 0

cd "$REPO_ROOT/apps/web" || exit 1

if ! npx --no-install eslint --max-warnings=0 --config eslint.boundaries.config.mjs $STAGED 2>&1; then
  echo ""
  echo "  ✗ [Boundary Gate] Web layer boundary violation."
  echo "  Allowed: app → component → hook → lib"
  echo "  lib/ cannot import from hook/, component/, or app/"
  echo "  hook/ cannot import from component/ or app/"
  echo ""
  exit 1
fi
exit 0
