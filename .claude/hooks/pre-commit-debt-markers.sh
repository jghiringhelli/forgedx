#!/usr/bin/env bash
# Gate 1 — Debt markers must be linked to DELTA-NNN or D-XXX
set -uo pipefail
REPO_ROOT=$(git rev-parse --show-toplevel)
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' | grep -v '\.spec\.' | grep -v '\.test\.' || true)
[ -z "$STAGED" ] && exit 0

VIOLATIONS=()
for file in $STAGED; do
  full="$REPO_ROOT/$file"
  [ -f "$full" ] || continue
  while IFS= read -r line; do
    if echo "$line" | grep -qiE '(TODO|FIXME|HACK|TEMP)\b' && ! echo "$line" | grep -qiE '(DELTA-[0-9]{3}|D-[0-9]{3})'; then
      VIOLATIONS+=("  $file: $line")
    fi
  done < <(grep -in 'TODO\|FIXME\|HACK\|TEMP' "$full" || true)
done

if [ ${#VIOLATIONS[@]} -gt 0 ]; then
  echo ""
  echo "  ✗ [Gate 1] Unlinked debt markers found. Each must reference DELTA-NNN or D-XXX:"
  printf '  %s\n' "${VIOLATIONS[@]}"
  echo ""
  echo "  Fix: // TODO DELTA-001: description  OR  // FIXME D-042: description"
  echo ""
  exit 1
fi
exit 0
