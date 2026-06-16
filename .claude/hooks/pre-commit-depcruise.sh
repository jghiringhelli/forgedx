#!/usr/bin/env bash
# Gate 7 — Architecture layer violations via dependency-cruiser
# Enforces: no-openai-outside-domain-pipeline, scoring-engine-purity,
#            no-route-to-db, no-route-to-infrastructure-direct
set -uo pipefail
REPO_ROOT=$(git rev-parse --show-toplevel)
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '^apps/api/src/' | grep '\.ts$' || true)
[ -z "$STAGED" ] && exit 0

cd "$REPO_ROOT/apps/api" || exit 1

if ! npx --no-install depcruise --config .dependency-cruiser.cjs --output-type err-long src/ 2>/dev/null; then
  echo ""
  echo "  ✗ [Gate 7] Architecture layer violations detected (depcruise)."
  echo "  Run: cd apps/api && npx depcruise --config .dependency-cruiser.cjs --output-type text src/"
  echo "  Fix violations before committing. See docs/adrs/ADR-004-hexagonal-architecture.md"
  echo ""
  exit 1
fi
exit 0
