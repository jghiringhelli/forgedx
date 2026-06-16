#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────
# Gate 2 + Gate 4 + Gate 12: commit-msg stage enforcement
#
# Check 1 — Conventional commit format
# Check 2 — TDD phase ordering: feat(scope) must be preceded by
#            test(scope): [RED] in recent git log
# Check 3 — Regression fixture (Gate 4):
#            Closing a DELTA-NNN in DELTA-LOG.md requires a fixture
#            under tests/fixtures/regressions/DELTA-NNN/ or [no-fixture]
# Check 4 — Three-layer pyramid (Gate 3):
#            feat(scope) touching a Hono route file must include
#            staged Hurl + Playwright tests. Escape: [SKIP-PYRAMID]
#
# Exceptions for Check 2:
#   docs:, chore:, ci:, build: (no TDD required)
#   refactor:, fix: (tests already exist)
# ────────────────────────────────────────────────────────────────────
set -uo pipefail

COMMIT_MSG_FILE="$1"
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Skip merge/fixup commits
if echo "$COMMIT_MSG" | grep -qE "^(Merge|Revert|fixup!|squash!)"; then
  exit 0
fi

STRIPPED=$(echo "$COMMIT_MSG" | sed '/^#/d' | sed '/^$/d')
[ -z "$STRIPPED" ] && exit 0

# ── Check 1: Conventional commit format ─────────────────────────────
PATTERN="^(feat|fix|refactor|docs|test|chore|perf|ci|build|revert)(\([a-z0-9/_-]+\))?(!)?: .{1,72}"
if ! echo "$COMMIT_MSG" | grep -qE "$PATTERN"; then
  echo ""
  echo "  ✗ [Gate 1] Commit message does not follow conventional commit format."
  echo ""
  echo "  Required: <type>(<scope>): <description>"
  echo "  Types: feat | fix | refactor | docs | test | chore | perf | ci | build | revert"
  echo "  Your message: $COMMIT_MSG"
  echo ""
  exit 1
fi

COMMIT_TYPE=$(echo "$COMMIT_MSG" | grep -oE "^(feat|fix|refactor|docs|test|chore|perf|ci|build|revert)" | head -1)
COMMIT_SCOPE=$(echo "$COMMIT_MSG" | grep -oE "^\w+\(([a-z0-9/_-]+)\)" | sed 's/^[^(]*(//;s/)$//' || true)

# ── Check 2: TDD phase enforcement ──────────────────────────────────
if [ "$COMMIT_TYPE" = "feat" ] && [ -n "$COMMIT_SCOPE" ]; then
  COMMIT_COUNT=$(git rev-list --count HEAD 2>/dev/null || echo "0")
  if [ "$COMMIT_COUNT" -gt 0 ]; then
    RED_TEST=$(git log --oneline -20 2>/dev/null | grep -iE "^[a-f0-9]+ test\($COMMIT_SCOPE\):.*\[RED\]" | head -1 || true)
    if [ -z "$RED_TEST" ]; then
      echo ""
      echo "  ✗ [Gate 2] TDD gate: feat($COMMIT_SCOPE) requires a preceding test($COMMIT_SCOPE): [RED] commit."
      echo ""
      echo "  Phase sequence: test: [RED] → feat: [GREEN] → refactor:"
      echo "  To bypass (emergency): feat($COMMIT_SCOPE)!: description [SKIP-TDD-GATE reason]"
      echo ""
      exit 1
    fi
  fi
fi

# ── Check 3: Regression fixture (Gate 4) ────────────────────────────
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
if [ -n "$REPO_ROOT" ] && [ -f "$REPO_ROOT/docs/DELTA-LOG.md" ]; then
  STAGED_LOG_DIFF=$(git -C "$REPO_ROOT" diff --cached docs/DELTA-LOG.md 2>/dev/null || true)
  if [ -n "$STAGED_LOG_DIFF" ]; then
    REMOVED_IDS=$(echo "$STAGED_LOG_DIFF" | grep -oE '^-\| DELTA-[0-9]{3}' | grep -oE 'DELTA-[0-9]{3}' | sort -u || true)
    ADDED_IDS=$(echo "$STAGED_LOG_DIFF" | grep -oE '^\+\| DELTA-[0-9]{3}' | grep -oE 'DELTA-[0-9]{3}' | sort -u || true)
    CLOSED_IDS=""
    for id in $REMOVED_IDS; do
      echo "$ADDED_IDS" | grep -q "^${id}$" && CLOSED_IDS="$CLOSED_IDS $id"
    done
    if [ -n "$CLOSED_IDS" ]; then
      if echo "$COMMIT_MSG" | grep -qiE '\[no-fixture[^]]*\]'; then
        echo "  ⚠ Gate 4: closure of$CLOSED_IDS accepted via [no-fixture] — verify justification."
      else
        MISSING=""
        for id in $CLOSED_IDS; do
          fixture_dir="$REPO_ROOT/tests/fixtures/regressions/$id"
          if [ ! -d "$fixture_dir" ] || [ -z "$(ls -A "$fixture_dir" 2>/dev/null)" ]; then
            MISSING="$MISSING $id"
          fi
        done
        if [ -n "$MISSING" ]; then
          echo ""
          echo "  ✗ [Gate 4] DELTA closures missing regression fixture:$MISSING"
          echo "  Add tests/fixtures/regressions/<DELTA-NNN>/ with the failing input."
          echo "  Escape: [no-fixture: <one-line justification>] in commit body."
          echo ""
          exit 1
        fi
      fi
    fi
  fi
fi

# ── Check 4: Three-layer pyramid (Gate 3) ───────────────────────────
if [ "$COMMIT_TYPE" = "feat" ] && [ -n "$REPO_ROOT" ]; then
  STAGED_NAMES=$(git -C "$REPO_ROOT" diff --cached --name-only --diff-filter=ACM 2>/dev/null || true)
  # Hono route handlers (routes/*.ts in apps/api)
  TOUCHED_ROUTE=$(echo "$STAGED_NAMES" | grep -E '^apps/api/src/routes/.*\.ts$' || true)
  if [ -n "$TOUCHED_ROUTE" ]; then
    if echo "$COMMIT_MSG" | grep -qiE '\[SKIP-PYRAMID[^]]*\]'; then
      echo "  ⚠ Gate 3: pyramid check skipped via [SKIP-PYRAMID] — verify justification."
    else
      HAS_HURL=$(echo "$STAGED_NAMES" | grep -E '^tests/hurl/.*\.hurl$' || true)
      HAS_E2E=$(echo "$STAGED_NAMES" | grep -E '^apps/web/tests/e2e/.*\.spec\.ts$' || true)
      MISSING_LAYERS=""
      [ -z "$HAS_HURL" ] && MISSING_LAYERS="$MISSING_LAYERS Hurl (tests/hurl/*.hurl)"
      [ -z "$HAS_E2E" ] && MISSING_LAYERS="$MISSING_LAYERS Playwright (apps/web/tests/e2e/*.spec.ts)"
      if [ -n "$MISSING_LAYERS" ]; then
        echo ""
        echo "  ✗ [Gate 3] feat($COMMIT_SCOPE) touches a route handler but is missing:$MISSING_LAYERS"
        echo "  Three-layer pyramid: Vitest (unit) + Hurl (contract) + Playwright (E2E)."
        echo "  Escape: [SKIP-PYRAMID: <reason>] in commit body."
        echo ""
        exit 1
      fi
    fi
  fi
fi

exit 0
