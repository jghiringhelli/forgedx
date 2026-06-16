# Testing Standards — ForgeDX

## Testing Pyramid — Three Layers Mandatory

```
        /    E2E (Playwright)    \   ← Every UC gets a spec. Full browser journey.
       /  Contract (Hurl)         \  ← Every API endpoint. Request/response assertions.
      /  Unit (Vitest)              \ ← Domain services, scoring engine, pure functions.
```

| Layer | Location | Naming | Runner | Trigger |
|-------|----------|--------|--------|---------|
| Unit (api) | `apps/api/src/<module>/<module>.service.spec.ts` | behavior description | Vitest | RED phase commit |
| Unit (web) | `apps/web/src/<area>/<file>.spec.ts` (colocated) | behavior description | Vitest | RED phase commit |
| Contract | `tests/hurl/uc-NNN-slug.hurl` | one file per use case | Hurl | RED phase commit |
| E2E | `apps/web/tests/e2e/tc-NNN-slug.spec.ts` | aligned with spec section 16 | Playwright | E2E phase commit |

## Coverage Targets

- **Overall minimum:** 80% line coverage (blocks commit via CI)
- **New/changed code:** 90% minimum
- **Scoring engine:** 100% — pure deterministic functions, no excuse for gaps
- **Mutation score (MSI):** ≥ 65% overall; ≥ 70% on new/changed code
- Run Vitest mutation with `@vitest/coverage-v8` or integrate `stryker-mutator`

**Line coverage is necessary but not sufficient.** 80% line coverage with 40% MSI means tests execute code without asserting behavior. Run mutation after each test batch.

## Test Rules

- Test names are specifications: `rejects_expired_token` not `test_validation`
- No empty catch blocks. No `expect(true).toBe(true)`. No tests that can't fail.
- `vi.mock` / `vi.fn()` — not `jest.mock` / `jest.fn()`
- Flaky tests are bugs — fix or quarantine immediately
- Scoring engine unit tests: zero mocks — pure input/output assertions
- AI pipeline unit tests: mock `IAIProvider` port — no real OpenAI calls in unit tests

## E2E Requirements

- Every UC (UC-001 through UC-013) must have a Playwright E2E spec
- E2E runs against real server + DB (not mocked)
- `beforeEach`: login via Clerk test user
- `afterAll`: cleanup of test data (delete created project/team)
- Selectors: `getByRole`, `getByLabel`, `getByTestId` — never CSS selectors for app logic
- Config: `apps/web/playwright.config.ts`
- Run: `cd apps/web && npx playwright test`

## Hurl Contract Tests

- Every API endpoint group has a Hurl file: `tests/hurl/uc-NNN-*.hurl`
- Each file: health check → auth → happy path → error cases
- `jsonpath` assertions for every field in the spec `**Response shape**` block
- Run: `hurl --variable host=http://localhost:3001 tests/hurl/uc-NNN-*.hurl`

## Raw SQL Requires Integration Tests

Any `$queryRaw` or `$executeRaw` usage:
1. A Hurl contract test exercising the query against the real DB is **mandatory**
2. Verify every column/function in raw SQL exists in `prisma/schema.prisma`
3. Prefer Prisma Client API. Raw SQL is the exception.
4. Post-mortem rationale: unit tests mock Prisma — they cannot verify schema compatibility

## Vitest Configuration

```typescript
// apps/api/vitest.config.ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 80, functions: 80, branches: 75 }
    }
  }
})
```

## LLM Replay Fixtures

Any new Vitest spec under `apps/api/src/domain/pipeline/` that tests LLM-consuming code must import at least one fixture from `tests/fixtures/llm-replays/`. Real captured LLM outputs prevent shape mismatches.

Escape (purely deterministic, no LLM output): `// LLM-FIXTURE-EXEMPT: <reason>` in first 5 lines.
