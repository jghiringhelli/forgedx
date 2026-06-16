# CLAUDE.md — ForgeDX

## Project Identity
- **Name:** ForgeDX — Generative Specification Diagnostic Platform
- **Domain:** GS readiness diagnostic — medical methodology: diagnose GS pathologies → prescribe GS practices → deliver adoption treatment plan
- **Purpose:** Funnel for the PragmaWorks Skool course and in-person workshops (pragmaworks.dev)
- **Primary Language:** TypeScript 5.x (strict mode, no `any`)
- **Monorepo:** `apps/web` (Next.js 15, App Router) + `apps/api` (Hono + Node.js)
- **Database:** PostgreSQL (Supabase or Railway) + pgvector extension
- **ORM:** Prisma
- **Auth:** Clerk (JWT validation in Hono middleware, Clerk components in Next.js)
- **AI:** OpenAI API (GPT-4.1-mini, text-embedding-3-small)
- **Validation:** Zod at ALL boundaries (API request/response, domain inputs)
- **Testing:** Vitest (unit + integration) + Hurl (contract) + Playwright (E2E)

Read `.claude/index.md` before any task. Navigate to the relevant domain node. Load `.claude/core.md` always.

## Spec Navigation — MANDATORY
The spec lives as section files under `docs/specs/sections/`. There is no monolithic source file.
1. Read `docs/specs/SPEC-INDEX.md` first — it routes to the right section file(s).
2. Load ONLY the section(s) you need for the current task.
3. To edit the spec: edit the section file directly — no mirror to maintain.
4. To produce a single document: run `./scripts/assemble-spec.sh` → `docs/specs/.build/SPEC-ForgeDX.assembled.md` (gitignored).
5. Never commit the assembled output.

## Architecture Invariants
Full rules in `.claude/standards/architecture.md`. Key invariants in `.claude/core.md`.

## Domain Vocabulary — Enforced Production Names
Use these names exactly in code, tests, DB, and docs:
- `pathology` — a diagnosed GS failure mode (not "issue", "problem", "disease", "finding")
- `remedy` — a prescribed GS practice or tool (not "recommendation", "vitamin", "action", "fix")
- `hypothesis` — an AI-generated diagnostic candidate (not "suggestion" or "result")
- `assessment` — the full evaluation of a team (not "diagnosis", "evaluation", "analysis")
- `prescription` — a remedy assigned to an assessment (not "recommendation")
- `survey` — the structured GS questionnaire (not "form" or "quiz")
- `evidence_signal` / `signal` — an extracted data point from documents or survey (not "indicator")
- `treatment_plan` — the phased GS adoption roadmap (not "action plan")
- `gs_score` — the 0–14 rubric score (not "score", "rating", "grade")
- Function names: `findPathologyById`, `createHypothesis`, `computePathologyScore` — verb + domain noun
- Repository methods: `findById`, `findByTeamId`, `create`, `update`, `delete` — generic CRUD verbs
- Test names: `rejects_expired_token`, `returns_empty_list_when_no_hypotheses` — behavior, not path

## Testing
Full pyramid, coverage targets, and TDD enforcement in `.claude/standards/testing.md`.
Three layers mandatory: Vitest (unit) + Hurl (contract) + Playwright (E2E). No feature ships without all three.

## Commit Protocol
- Conventional commits: `feat|fix|refactor|docs|test|chore(scope): description`
- Commits must pass: TypeScript compilation, lint (zero warnings), Vitest, Hurl
- Keep commits atomic — one logical change per commit
- Update `Status.md` at end of every session

## Forbidden Patterns (gate-enforced)
Full text with rationale and escape hatches in `.claude/standards/forbidden-patterns.md`.

**Always-on principles (no gate — discipline):**
- Layering: no DB calls from route handlers; no business logic in routes; no OpenAI calls outside `domain/pipeline/` or `domain/scoring/`; no circular imports
- Types: no `any`; no confidence percentages from LLM (scoring engine computes evidence strength deterministically)
- Lifecycle: no Prisma client instantiated in domain classes (inject via port interface); no auto-promoting hypotheses (human in the loop)
- Process: no code changes without an active session manifest; no spec modification without EDR + user confirmation
- Quality: no duplicate business rule between read+write paths; no dead handlers (`data-testid` buttons without `onClick`/`type="submit"`)

**Gate-enforced rules (commit-time blocks):**

| Gate | Rule | Enforcer |
|------|------|----------|
| 1 | Debt markers (TODO/HACK/FIXME) must link to DELTA-NNN | `pre-commit-debt-markers.sh` |
| 2 | `feat:` commit without prior `test: [RED]` is rejected | `commit-msg.sh` |
| 3 | New endpoint without Hurl probe file is rejected | `pre-commit-hurl-coverage.sh` |
| 4 | Closing DELTA-NNN requires regression fixture | `commit-msg.sh` Check 3 |
| 5 | New EDR must declare `**Affected UCs**:` line | `pre-commit-edr-affected-ucs.sh` |
| 6 | New `findMany(` in repositories must declare `orderBy:` | `pre-commit-findmany-orderby.sh` |
| 7 | API layer boundaries (depcruise: no-openai-outside-domain, no-route-to-db) | `pre-commit-depcruise.sh` |
| 8 | No new dead files in apps/api or apps/web (knip) | `pre-commit-knip.sh` |
| 9 | apps/api jscpd duplication ≤ 4% | `pre-commit-jscpd.sh` |
| 10 | apps/web jscpd duplication ≤ 1% | `pre-commit-jscpd-web.sh` |
| 11 | apps/api and apps/web ESLint `--max-warnings=0` | `pre-commit-eslint.sh` |
| 12 | apps/web `tsc --noEmit` zero errors | `pre-commit-tsc-web.sh` |
| 13 | New `data-testid="*-btn"` must be clicked by Playwright spec | `pre-commit-e2e-control-coverage.sh` |

## MCP Tools — When Active (inherit from The Forge ecosystem)
- **CodeSeeker** — default for ALL code search (semantic, graph, symbol lookup)
- **Chronicle** — mandatory session episodic memory (session open/close/decisions/blockers)
- **ForgeCraft** — generate engineering standards on new feature domains

## Session Loop
Every implementation session follows this protocol. Full text in `.claude/standards/session-loop.md`.

0. **Session open** — start Chronicle, archive prior manifest, create new manifest, read Status.md
1. **Intake** — read the bound session prompt, flag ambiguity
2. **Spec validation** — spec fit check; TC extraction from `docs/specs/sections/16-tc-*.md`; cascade impact
3. **Prereqs gate** — confirm env vars / external services BEFORE coding; update `.env.example`
4. **RED** — failing Hurl + Vitest tests. Commit `test(scope): [RED]`
5. **GREEN** — minimum code to pass. Commit `feat(scope):`
6. **Integration verify** — `./scripts/integration-verify.sh [uc-NNN]`
7. **E2E** — Playwright UC journey
8. **Manual TC validation** — every spec TC via Chrome DevTools MCP
9. **REFACTOR** — clean up, tests stay green
10. **Doc cascade** — ADR if non-obvious decision; diagrams if new component; Status.md always
10.5. **Debt & Delta audit** — classify every TC PASS/PARTIAL/SKIP
11. **Session close** — close Chronicle with summary

## Known Pitfalls
- Hono `c.req.valid('json')` requires `@hono/zod-validator` middleware on the route — do not call `.valid()` without it
- Clerk `auth()` in Next.js 15 App Router is async — always `await auth()`
- Prisma `$queryRaw` with pgvector: use string interpolation for vector literal (`[${embedding.join(',')}]::vector`)
- Vitest does not support `jest.mock` — use `vi.mock` and `vi.fn()`
- Hono in Node.js adapter: `@hono/node-server` serves on a specific port; do not use `bun serve`
