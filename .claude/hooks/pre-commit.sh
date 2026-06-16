#!/usr/bin/env bash
# pre-commit.sh — ForgeDX gate orchestrator
# Runs all pre-commit gates in order. Any non-zero exit blocks the commit.
# Install: ln -sf ../../.claude/hooks/pre-commit.sh .git/hooks/pre-commit

set -uo pipefail
REPO_ROOT=$(git rev-parse --show-toplevel)
HOOKS_DIR="$REPO_ROOT/.claude/hooks"
STAGED=$(git diff --cached --name-only --diff-filter=ACM)

GATE_PASS=0
GATE_FAIL=0

run_gate() {
  local name="$1"
  local script="$2"
  if bash "$script" 2>&1; then
    GATE_PASS=$((GATE_PASS + 1))
  else
    echo "  ✗ $name FAILED"
    GATE_FAIL=$((GATE_FAIL + 1))
  fi
}

# Gate 1: Debt markers linked
echo "$STAGED" | grep -qE '\.ts$|\.tsx$' && run_gate "Gate 1 (debt markers)" "$HOOKS_DIR/pre-commit-debt-markers.sh"

# Gate 3: Hurl probe coverage (run only when route files are staged)
echo "$STAGED" | grep -qE '^apps/api/src/routes/' && run_gate "Gate 3 (Hurl coverage)" "$HOOKS_DIR/pre-commit-hurl-coverage.sh"

# Gate 5: EDR affected UCs
echo "$STAGED" | grep -qE '^docs/edrs/' && run_gate "Gate 5 (EDR affected UCs)" "$HOOKS_DIR/pre-commit-edr-affected-ucs.sh"

# Gate 6: findMany orderBy
echo "$STAGED" | grep -qE '\.repository\.ts$' && run_gate "Gate 6 (findMany orderBy)" "$HOOKS_DIR/pre-commit-findmany-orderby.sh"

# Gate 7: depcruise layer violations
echo "$STAGED" | grep -qE '^apps/api/src/' && run_gate "Gate 7 (depcruise)" "$HOOKS_DIR/pre-commit-depcruise.sh"

# Gate 8: dead files (knip)
echo "$STAGED" | grep -qE '\.ts$|\.tsx$' && run_gate "Gate 8 (knip)" "$HOOKS_DIR/pre-commit-knip.sh"

# Gate 9: api duplication
echo "$STAGED" | grep -qE '^apps/api/src/' && run_gate "Gate 9 (jscpd api)" "$HOOKS_DIR/pre-commit-jscpd.sh"

# Gate 10: web duplication
echo "$STAGED" | grep -qE '^apps/web/src/' && run_gate "Gate 10 (jscpd web)" "$HOOKS_DIR/pre-commit-jscpd-web.sh"

# Gate 11a: ESLint api
echo "$STAGED" | grep -qE '^apps/api/src/' && run_gate "Gate 11a (ESLint api)" "$HOOKS_DIR/pre-commit-eslint.sh"

# Gate 11b: ESLint web
echo "$STAGED" | grep -qE '^apps/web/src/' && run_gate "Gate 11b (ESLint web)" "$HOOKS_DIR/pre-commit-eslint-web.sh"

# Gate 12: tsc web
echo "$STAGED" | grep -qE '^apps/web/(src|tests)/' && run_gate "Gate 12 (tsc web)" "$HOOKS_DIR/pre-commit-tsc-web.sh"

# Gate 13: testid E2E coverage
echo "$STAGED" | grep -qE '^apps/web/src/' && run_gate "Gate 13 (E2E control coverage)" "$HOOKS_DIR/pre-commit-e2e-control-coverage.sh"

# Gate (dead handlers)
echo "$STAGED" | grep -qE '^apps/web/src/' && run_gate "Gate (dead handlers)" "$HOOKS_DIR/pre-commit-dead-handler.sh"

# Gate (web boundaries)
echo "$STAGED" | grep -qE '^apps/web/src/' && run_gate "Gate (web boundaries)" "$HOOKS_DIR/pre-commit-boundaries.sh"

echo ""
echo "  Pre-commit: $GATE_PASS passed, $GATE_FAIL failed"

[ "$GATE_FAIL" -gt 0 ] && exit 1
exit 0
