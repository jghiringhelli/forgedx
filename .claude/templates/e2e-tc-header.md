# E2E TC Header Template

> Paste at the top of every Playwright test file.
> Fill in all fields — do not leave TODOs.

```typescript
/**
 * @tc TC-XXX — Short TC title (from docs/specs/sections/16-tc-*.md)
 * @scope [scope label from TC file, e.g. "Survey management"]
 * @preconditions
 *   - [Copy preconditions list verbatim from TC spec]
 * @main_flow
 *   - [Copy main flow steps verbatim from TC spec]
 * @coverage FULL | PARTIAL
 * @if_partial
 *   Omits: [describe what is missing]
 *   Debt: D-XXX (register in docs/DEBT-PLAN.md before committing)
 * @spec_section docs/specs/sections/NN-name.md § N.N
 */

import { test, expect } from '@playwright/test'
// ... test implementation
```

## Coverage Classification Rules

**FULL:** Every precondition is set up in the test; every main flow step is exercised; each `THEN` assertion is verified.

**PARTIAL:** One or more of the following:
- A precondition is approximated (e.g., skipping a previous pipeline step)
- An API is mocked where the spec says it should be live
- An assertion from the TC is missing
- A negative/error branch from the TC is not covered

**NEVER claim FULL when PARTIAL.** If PARTIAL, register D-XXX debt before committing.
