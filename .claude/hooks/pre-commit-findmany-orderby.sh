#!/usr/bin/env bash
# Gate 6 — findMany() calls in repositories must declare orderBy:
set -uo pipefail
REPO_ROOT=$(git rev-parse --show-toplevel)
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.repository\.ts$' || true)
[ -z "$STAGED" ] && exit 0

VIOLATIONS=()
for file in $STAGED; do
  full="$REPO_ROOT/$file"
  [ -f "$full" ] || continue
  # Find findMany( calls in added/changed lines, check same call block for orderBy
  while IFS= read -r num_line; do
    lineno=$(echo "$num_line" | cut -d: -f1)
    # Extract 10 lines from findMany occurrence to look for orderBy
    context=$(sed -n "${lineno},$((lineno+10))p" "$full")
    if ! echo "$context" | grep -q 'orderBy:'; then
      # Check for exempt comment
      line_content=$(echo "$num_line" | cut -d: -f2-)
      if ! echo "$line_content" | grep -qi 'orderBy-exempt'; then
        VIOLATIONS+=("  $file:$lineno — findMany without orderBy:")
      fi
    fi
  done < <(grep -n 'findMany(' "$full" || true)
done

if [ ${#VIOLATIONS[@]} -gt 0 ]; then
  echo ""
  echo "  ✗ [Gate 6] findMany() calls without orderBy: clause:"
  printf '  %s\n' "${VIOLATIONS[@]}"
  echo ""
  echo "  PostgreSQL does not guarantee heap-scan order. Always declare:"
  echo "    orderBy: { createdAt: 'asc' }  OR  orderBy: { id: 'asc' }"
  echo "  Escape: // orderBy-exempt: <reason> on the findMany line"
  echo ""
  exit 1
fi
exit 0
