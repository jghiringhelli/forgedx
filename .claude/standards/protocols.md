# Protocols — ForgeDX

## EDR Protocol (Engineering Decision Record)

**When:** Any behavioral spec change — pipeline steps, schemas, API endpoints, seed data, test cases.
**Exempt:** Cosmetic/typo fixes, documentation prose that doesn't change behavior.

**File:** `docs/edrs/EDR-NNN-short-title.md`

**Required sections:**
```markdown
# EDR-NNN — Short Title
**Date:** YYYY-MM-DD
**Status:** Draft | Accepted | Rejected
**Affected UCs**: tc-003, tc-006  (or: none)

## Current spec text
> quote the exact current spec text being changed

## Proposed change
> exact proposed new text

## Rationale
> why the change is needed

## Impact
- Schema: [affected tables/fields]
- API: [affected endpoints]
- Pipeline: [affected steps]
- Frontend: [affected pages/components]
- Tests: [affected TCs]
```

**Process:**
1. Create the EDR file
2. Stop and ask user for explicit approval (show current vs proposed)
3. Only after approval: edit the spec section file
4. Gate 5 enforces `**Affected UCs**:` line on commit

## DELTA Protocol (Runtime Bug / Improvement)

**When:** After manual TC validation reveals unexpected behavior, after E2E finds quality issues, when a user reports a bug, when code review identifies an improvement.

**Registration:** Add a row to `docs/DELTA-LOG.md § Active`:
```
| DELTA-NNN | description | type (bug/improvement/feature) | cascade depth | priority | registered |
```

**Cascade depth** (classify BEFORE fixing):
- `data` — seed data gap, no code change needed
- `code` — implementation bug, TDD cycle required
- `prompt` — LLM prompt quality, empirical iteration needed
- `spec` — specification gap, update spec first (with EDR) then implement

**Closing a DELTA:** Move row from `## Active` to `## Resolved`. Gate 4 requires a regression fixture in `tests/fixtures/regressions/DELTA-NNN/` or `[no-fixture: reason]` in commit body.

## Debt Protocol (D-XXX)

**When:** A TC is classified PARTIAL or SKIP during step 10.5.

**Registration:** Add to `docs/DEBT-PLAN.md`:
```
| D-XXX | description | TC affected | escape hatch used | session | priority |
```

**Types:**
- `partial-tc` — TC partially implemented (missing precondition, simplified flow)
- `deferred-feature` — feature in spec, deferred to post-MVP
- `deferred-quality` — quality gate deferred (coverage, mutation, etc.)

**Zero-debt sessions:** Add `## RM-NNN — Zero Debt` entry to confirm the audit was done.
