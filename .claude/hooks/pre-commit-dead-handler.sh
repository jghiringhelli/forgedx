#!/usr/bin/env bash
# Gate — Dead handler: new data-testid button must have onClick/type=submit/disabled
set -uo pipefail
REPO_ROOT=$(git rev-parse --show-toplevel)
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '^apps/web/src/' | grep '\.tsx$' || true)
[ -z "$STAGED" ] && exit 0

MISSING=()
for file in $STAGED; do
  full="$REPO_ROOT/$file"
  [ -f "$full" ] || continue
  # New lines with data-testid button patterns
  NEW_BTNS=$(git diff --cached "$file" | grep '^+' | grep 'data-testid=' | grep -i 'button\|btn' || true)
  while IFS= read -r btn_line; do
    [ -z "$btn_line" ] && continue
    if ! echo "$btn_line" | grep -qE '(onClick=|type="submit"|disabled|e2e-coverage-exempt)'; then
      MISSING+=("  $file: $btn_line")
    fi
  done <<< "$NEW_BTNS"
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo ""
  echo "  ✗ [Dead Handler Gate] Buttons with testid but no handler:"
  printf '  %s\n' "${MISSING[@]}"
  echo ""
  echo "  Each testid'd button needs: onClick={...} OR type=\"submit\" OR disabled"
  echo ""
  exit 1
fi
exit 0
