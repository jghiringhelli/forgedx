# Regression Fixture README Template

> Copy to `tests/fixtures/regressions/DELTA-NNN/README.md` when closing any DELTA.

---

# Regression Fixture — DELTA-NNN

**DELTA Title:** [title from DELTA-LOG.md]  
**Cascade Type:** data | code | prompt | spec  
**Date Fixed:** YYYY-MM-DD  
**Fixed in Commit:** <hash>

## What Broke

> Describe the bug or unexpected behavior, as observed (not theorized).

## Root Cause

> One sentence: what in the code/data/prompt caused this.

## Fixture Contents

| File | Purpose |
|------|---------|
| `input.json` | Input that triggered the bug |
| `expected.json` | Expected correct output (post-fix) |
| `snapshot.hurl` | Hurl probe to reproduce scenario live |
| `seed.sql` | DB seed state required (if applicable) |

## How to Reproduce Bug (for historical reference)

```bash
# checkout the commit before fix and run:
# (add specific steps)
```

## Regression Test

```
# The Vitest/Playwright test that now covers this path:
apps/api/tests/<path>
apps/web/e2e/<path>
```
