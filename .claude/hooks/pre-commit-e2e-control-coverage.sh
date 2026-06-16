#!/usr/bin/env bash
# Gate 13 — New data-testid="*-btn" must be clicked in some Playwright spec
set -uo pipefail
REPO_ROOT=$(git rev-parse --show-toplevel)
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '^apps/web/src/' | grep -E '\.(tsx)$' || true)
[ -z "$STAGED" ] && exit 0

MISSING=()
for file in $STAGED; do
  full="$REPO_ROOT/$file"
  [ -f "$full" ] || continue
  # Find newly added testid btn attributes
  NEW_TESTIDS=$(git diff --cached "$file" | grep '^+' | grep -oE 'data-testid="[^"]*-btn[^"]*"' | grep -oE '"[^"]*"' | tr -d '"' || true)
  for testid in $NEW_TESTIDS; do
    # Skip exempt ones
    if grep -q "e2e-coverage-exempt" "$full" 2>/dev/null; then continue; fi
    # Search for this testid in E2E specs
    if ! grep -rqE "(getByTestId|data-testid)[^>]*['\"]${testid}['\"]" "$REPO_ROOT/apps/web/tests/e2e/" 2>/dev/null; then
      MISSING+=("  $file: data-testid=\"$testid\" not clicked in any Playwright spec")
    fi
  done
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo ""
  echo "  ✗ [Gate 13] Testid'd buttons missing E2E coverage:"
  printf '  %s\n' "${MISSING[@]}"
  echo ""
  echo "  Add a Playwright test that clicks this button, or:"
  echo "  Escape (decorative): add // e2e-coverage-exempt: <reason> on the same line"
  echo ""
  exit 1
fi
exit 0
