# Forbidden Patterns — ForgeDX

> Canonical list. CLAUDE.md keeps only the compact gate table — this file has full text with rationale and escape hatches.
> The AI must refuse to generate code that violates any of these.

## Always-On Principles (no gate — discipline)

- **No direct DB calls from route handlers.** Routes → domain services → repository ports → infrastructure. No `prisma.*` in `routes/`.
- **No OpenAI calls outside `infrastructure/ai/`.** All LLM interaction via `IAIProvider` port. The port is injected; the adapter is the only place that imports `openai`.
- **No business logic in route handlers.** Validate with Zod, call domain service, return response. That's the entire allowed scope of a Hono route handler.
- **No assessment pipeline state in frontend.** Backend is the source of truth. Frontend polls `GET /assessments/:id/status` every 5s. Never store pipeline step state in React state.
- **No circular imports.** Enforced via knip and manual review.
- **No `any` types.** Use `unknown` + type narrowing, or define the type. `as any` is a compile-time lie.
- **No LLM-generated confidence percentages.** Evidence strength is computed deterministically by the scoring engine from extracted signals. Never ask the LLM to assign a percentage score to a pathology.
- **No auto-promoting hypotheses.** Human-in-the-loop required. AI generates hypotheses; user confirms or discards.
- **No auto-promoting emerging patterns to pathologies.** Human review required for taxonomy changes.
- **No security precondition without named mechanism.** Every "Actor is authenticated" precondition needs both: API (Clerk middleware → 401) AND frontend (Next.js middleware → Clerk redirect). A precondition without both mechanisms is a spec gap — fix the spec before implementing.
- **No feature without E2E tests.** A `feat(scope):` commit for a use case without a corresponding Playwright E2E spec is incomplete.
- **No `new PrismaClient()` in domain classes.** Prisma is infrastructure. Domain uses repository port interfaces. PrismaClient is created once in `app.ts` and injected.
- **No code changes without an active session manifest.** ANY source file change requires session loop steps 0–2 completed first. There are no trivial changes. The process is for ALL tasks.
- **No simplified E2E claiming full TC coverage.** An E2E that omits a spec TC precondition is PARTIAL, not PASS. Register as D-XXX debt. Do not name a test "TC-006" when it only covers half the TC.
- **No spec modification without EDR + user confirmation.** The spec (`docs/specs/sections/`) is the source of truth. Any behavioral change requires: (1) EDR created, (2) user approval, (3) then spec edit. Cosmetic/typo fixes exempt.
- **No duplicate business rule between read and write paths.** Extract to shared helper. Add to Shared Invariants Catalog in `architecture.md`.

## Gate-Enforced Rules (full text)

### Gate 1 — Debt markers must be linked
Every `// TODO`, `// FIXME`, `// HACK`, `// TEMP` in production code must include `DELTA-NNN` or `D-XXX`.
Enforcer: `pre-commit-debt-markers.sh`

### Gate 2 — TDD phase ordering
`feat(scope):` commit requires a preceding `test(scope): [RED]` in recent git log (last 20 commits).
Enforcer: `commit-msg.sh` Check 2
Escape: `feat(scope)!: description [SKIP-TDD-GATE reason]`

### Gate 3 — New route handler needs Hurl probe
Every new file in `apps/api/src/routes/*.ts` must have a `tests/hurl/*route-name*.hurl` file in the same commit.
Enforcer: `pre-commit-hurl-coverage.sh`
Escape: `[SKIP-HURL: reason]` in commit body

### Gate 4 — Regression fixture on DELTA close
Closing DELTA-NNN (moving row from `## Active` to `## Resolved` in DELTA-LOG.md) requires a non-empty `tests/fixtures/regressions/DELTA-NNN/` or `[no-fixture: reason]` in commit body.
Enforcer: `commit-msg.sh` Check 3

### Gate 5 — EDR declares Affected UCs
Every new `docs/edrs/EDR-NNN-*.md` must declare `**Affected UCs**:` line.
Enforcer: `pre-commit-edr-affected-ucs.sh`
Format: `**Affected UCs**: tc-003, tc-006` OR `**Affected UCs**: none`

### Gate 6 — findMany must have orderBy
Every `findMany(` in `*.repository.ts` files must have `orderBy:` in the same call block.
Enforcer: `pre-commit-findmany-orderby.sh`
Escape: `// orderBy-exempt: reason` within 3 lines of the call

### Gate 7 — Architecture layer violations (depcruise)
Four rules: (1) no openai outside `infrastructure/ai/`, (2) scoring engine purity, (3) no route → db direct, (4) no domain → infrastructure direct.
Enforcer: `pre-commit-depcruise.sh`

### Gate 8 — No dead files (knip)
Every TS/TSX file must be reachable from a knip entry point. New files with zero importers blocked.
Enforcer: `pre-commit-knip.sh`
Grandfathering: add to `knip.json` `ignore` with DELTA-NNN reference

### Gate 9 — apps/api duplication ≤ 4%
Enforcer: `pre-commit-jscpd.sh`

### Gate 10 — apps/web duplication ≤ 1%
Enforcer: `pre-commit-jscpd-web.sh`

### Gate 11 — ESLint zero warnings (both apps)
`eslint --max-warnings=0` on staged files.
Enforcer: `pre-commit-eslint.sh`, `pre-commit-eslint-web.sh`

### Gate 12 — TypeScript zero errors (apps/web)
`tsc --noEmit` on staged web files.
Enforcer: `pre-commit-tsc-web.sh`

### Gate 13 — Testid'd buttons need E2E coverage
New `data-testid="*-btn"` must be clicked in a Playwright spec.
Enforcer: `pre-commit-e2e-control-coverage.sh`
Escape: `// e2e-coverage-exempt: reason` on the same line

### Dead Handler Gate — Testid'd buttons need a handler
New `data-testid="*-btn"` button must have `onClick`, `type="submit"`, or `disabled`.
Enforcer: `pre-commit-dead-handler.sh`

### Boundary Gate — Web layer imports
`app → component → hook → lib` only.
Enforcer: `pre-commit-boundaries.sh`
