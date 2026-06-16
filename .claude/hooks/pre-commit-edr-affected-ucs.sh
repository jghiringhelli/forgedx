#!/usr/bin/env bash
# Gate 5 — New EDR must declare **Affected UCs**: line
set -uo pipefail
REPO_ROOT=$(git rev-parse --show-toplevel)
STAGED=$(git diff --cached --name-only --diff-filter=A | grep -E '^docs/edrs/EDR-[0-9]+-.*\.md$' || true)
[ -z "$STAGED" ] && exit 0

MISSING=()
for file in $STAGED; do
  full="$REPO_ROOT/$file"
  [ -f "$full" ] || continue
  if ! grep -qi '^\*\*Affected UCs\*\*:' "$full"; then
    MISSING+=("  $file")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo ""
  echo "  ✗ [Gate 5] New EDR files missing '**Affected UCs**:' line:"
  printf '  %s\n' "${MISSING[@]}"
  echo ""
  echo "  Format: **Affected UCs**: tc-003, tc-006  OR  **Affected UCs**: none"
  echo "  This line declares which Playwright E2E suites must re-run."
  echo ""
  exit 1
fi
exit 0
