#!/usr/bin/env bash
# Gate 8 — No new dead files (knip)
set -uo pipefail
REPO_ROOT=$(git rev-parse --show-toplevel)
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)
[ -z "$STAGED" ] && exit 0

cd "$REPO_ROOT" || exit 1

# Run knip for both workspaces
API_DEAD=$(npx --no-install knip --workspace apps/api --reporter compact 2>/dev/null | grep -v 'Unused' | grep '\.ts$' || true)
WEB_DEAD=$(npx --no-install knip --workspace apps/web --reporter compact 2>/dev/null | grep -v 'Unused' | grep '\.tsx\?$' || true)

if [ -n "$API_DEAD" ] || [ -n "$WEB_DEAD" ]; then
  echo ""
  echo "  ✗ [Gate 8] Dead files detected (knip):"
  [ -n "$API_DEAD" ] && echo "$API_DEAD"
  [ -n "$WEB_DEAD" ] && echo "$WEB_DEAD"
  echo ""
  echo "  Every TS/TSX file must be reachable from a knip entry point."
  echo "  To grandfether: add to knip.json 'ignore' with a DELTA-NNN reference."
  echo ""
  exit 1
fi
exit 0
