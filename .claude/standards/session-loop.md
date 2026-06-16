# Session Loop — ForgeDX

> **Canonical implementation protocol.** Loaded on demand via `.claude/index.md`.
> CLAUDE.md keeps the one-line summary — this file holds the full protocol with sub-protocols, gate references, and escape hatches.
>
> Every implementation session follows this protocol. A **Session Manifest** (`.claude/session/active-manifest.md`) tracks compliance — create it from `.claude/templates/session-manifest.md` at step 0. The `cc-gate-session-protocol.py` hook blocks `test: [RED]` without steps 0–2, `feat:` without step 4, and session close without all steps completed.

## TDD Protocol (steps 4–9)

Every feature follows **RED → GREEN → INTEGRATE → E2E → REFACTOR**. Enforced by hooks — not advisory.

1. **RED** — Write failing tests FIRST (Hurl contract + Vitest unit). Commit: `test(scope): [RED] description`. Confirm failures before proceeding.
2. **GREEN** — Minimum code to pass unit tests. Commit: `feat(scope): description`. Hook rejects `feat(scope):` without a preceding `test(scope): [RED]` in recent history.
3. **INTEGRATE** — `./scripts/integration-verify.sh uc-NNN`. Starts server, applies migrations, runs Hurl against live server. Blocks E2E if it fails.
4. **E2E** — Playwright E2E spec against live server. Commit: `test(scope): add E2E for UC-XXX`.
5. **VALIDATE** — Manual TC walkthrough via Chrome DevTools MCP. Every spec TC must pass.
6. **REFACTOR** — Clean up; tests stay green. Commit: `refactor(scope):`.

Exceptions: `docs:`, `chore:`, `ci:`, `build:` do not require TDD. `fix:` for existing features does not require new RED.

---

## Step 0: Session Open
- Start Chronicle: `chronicle({action: "session", session: {op: "start", project: "forgedx", scope: "RM-NNN"}})`
- Read `Status.md`
- Confirm pre-commit hook active: `ls .git/hooks/pre-commit`
- Archive prior manifest: `cp .claude/session/active-manifest.md .claude/session/archive/SESSION-$(date +%Y-%m-%d)-{scope}.md`; update `archive/README.md`
- Create new manifest: `cp .claude/templates/session-manifest.md .claude/session/active-manifest.md`
- Fill in Meta (date, scope, type, spec sections) and mark `[x]` step 0

## Step 1: Intake
- Read the bound session prompt from `docs/session-prompts/RM-NNN.md`
- Check for ambiguity — flag before proceeding

## Step 2: Spec Validation

**Spec fit (mandatory):** Does this change *fit* the spec or *change* it?
- If **change**: STOP. Before editing any spec section:
  1. Create `docs/edrs/EDR-NNN-short-title.md` (quote current text, propose new text, list impact, declare **Affected UCs**)
  2. Ask user for explicit confirmation — present sections affected, current vs proposed text
  3. Only after user approval: edit the spec section file

**TC extraction:** Load `docs/specs/sections/16-tc-*.md` for the current scope. These are authoritative acceptance criteria. Extract every TC precondition, step, and expected result. Present the full TC list. Flag any TC the session prompt omits or contradicts. **The spec TCs are the contract. The session prompt is a planning aid. When they conflict, the spec wins.**

**Cascade impact:** If the session modifies an endpoint, a pipeline step, or a page, list explicitly the downstream UCs whose E2E must re-run. Use `.claude/spec-map.md § Pipeline cascade`.

## Step 3: Prereqs Gate
If the feature adds new env vars, npm packages, or external services:
1. List every new env var. Confirm `.env` has real values. Ask user for missing values.
2. Confirm external services are accessible from dev environment.
3. Update `apps/api/.env.example` and `apps/web/.env.example`.
4. **Do NOT proceed to RED until all prerequisites are confirmed.**

## Step 4: RED
Write failing tests (Hurl + Vitest) for all endpoints/behaviors in scope. Commit `test(scope): [RED] description`. Confirm failures.

## Step 5: GREEN
Implement until all unit tests pass. Commit `feat(scope): description`.

## Step 6: Integration Verify
`./scripts/integration-verify.sh uc-NNN`
- Starts the Hono server
- Applies any pending Prisma migrations
- Runs all Hurl files for the UC
- Must PASS before E2E. Cannot skip.

## Step 7: E2E
Write Playwright E2E spec (`apps/web/tests/e2e/tc-NNN-slug.spec.ts`). Run against live server. Every UC must have E2E. A feature without E2E is not complete.

**TC fidelity:** Every spec TC precondition must be verified in the test. If you omit a precondition (e.g., skip document upload for a survey test), register as PARTIAL (D-XXX) — do not name it the TC.

## Step 8: Manual TC Validation
Walk every spec TC via Chrome DevTools MCP. Not the API shortcut — the actual UI flow. Mark each PASS / PARTIAL / SKIP.

## Step 9: Refactor
Clean up. Tests stay green. Commit `refactor(scope):` if changes made.

## Step 10: Doc Cascade
- ADR if non-obvious architectural decision was made
- Update `Status.md` (always, every session)
- Update diagrams if new component/module added

## Step 10.5: Debt & Delta Audit (mandatory, blocking)
- Classify every TC: PASS / PARTIAL / SKIP
- PARTIAL or SKIP → create D-XXX entry in `docs/DEBT-PLAN.md`
- Runtime bugs discovered → create DELTA-NNN in `docs/DELTA-LOG.md § Active`
- Run: `python3 .claude/hooks/cc-gate-debt-audit.py` — must pass before close

## Step 11: Session Close
- Close Chronicle: `chronicle({action: "session", session: {op: "close", summary: "..."}})`
- Record any unrecorded decisions
- Commit final Status.md update
