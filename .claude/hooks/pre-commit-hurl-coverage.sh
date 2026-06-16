#!/usr/bin/env bash
# Gate 3 — Every new Hono route handler must have a Hurl probe file
set -uo pipefail
REPO_ROOT=$(git rev-parse --show-toplevel)
STAGED=$(git diff --cached --name-only --diff-filter=A | grep -E '^apps/api/src/routes/.*\.ts$' | grep -v '\.spec\.' || true)
[ -z "$STAGED" ] && exit 0

MISSING=()
for file in $STAGED; do
  # Derive expected hurl filename from route file basename
  base=$(basename "$file" .ts)
  hurl_glob="$REPO_ROOT/tests/hurl/*${base}*.hurl"
  if ! ls $hurl_glob 2>/dev/null | grep -q .; then
    MISSING+=("  $file → tests/hurl/$base.hurl (not found)")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo ""
  echo "  ✗ [Gate 3] New route handler files lack Hurl probe files:"
  printf '  %s\n' "${MISSING[@]}"
  echo ""
  echo "  Every new Hono route handler must have at least one Hurl test."
  echo "  Create: tests/hurl/uc-NNN-<route-name>.hurl"
  echo "  Escape (internal-only route): add [SKIP-HURL: reason] to commit body."
  echo ""
  exit 1
fi
exit 0
