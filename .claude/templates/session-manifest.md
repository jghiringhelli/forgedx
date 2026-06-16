# Session Manifest Template

> Copy to `.claude/session/active-manifest.md` at step 0 of each session.
> Fill every field. Leave nothing blank. Unknown = "unknown" not empty.

---

# Session Manifest — [SESSION-ID]

**Scope:** RM-NNN | EX-NNN | QA-NNN | HOTFIX  
**Date:** YYYY-MM-DD  
**Developer:** [name]  
**Objective:** One sentence — what this session accomplishes

## Session Start State

```
Assessment status (stale check): DONE / PENDING
Last commit (git log --oneline -1): <hash> <message>
Active DELTAs: DELTA-NNN (description), or NONE
Active debt: D-XXX (description), or NONE
Open EDRs: EDR-NNN (status), or NONE
```

## Spec Sections Loaded

- [ ] docs/specs/sections/NN-name.md
- [ ] docs/specs/sections/NN-name.md

## TCs to Satisfy

| TC ID | Description | Target Status |
|-------|-------------|---------------|
| TC-XXX | ... | PASS |

## Tasks

- [ ] 1. ...
- [ ] 2. ...
- [ ] 3. ...

## Definition of Done

- [ ] All listed TCs pass
- [ ] Zero failing tests (`vitest run`)
- [ ] Zero lint warnings (`eslint --max-warnings=0`)
- [ ] Zero TS errors (`tsc --noEmit`)
- [ ] All gates pass (pre-commit hook dry-run)
- [ ] Session manifest updated in step 10 (Debt Audit)

## Session Close State

```
Commits made: <hashes>
TCs PASS: 
TCs PARTIAL/SKIP (→ DEBT-PLAN): 
New DELTAs registered: 
EDRs created: 
Debt items: D-XXX
```
