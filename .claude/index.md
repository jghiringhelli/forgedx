# .claude/index.md — ForgeDX Sentinel Navigation Tree

> Read this file before any task. Navigate to the correct domain node. Load core.md always.

## Root

```
ForgeDX
├── core.md                          ← ALWAYS LOAD FIRST
├── Assessment domain                → domain/assessment/
├── Knowledge domain                 → domain/knowledge/
├── Pipeline domain                  → domain/pipeline/
├── Scoring engine                   → domain/scoring/
├── Funnel domain                    → domain/funnel/
├── Infrastructure                   → infrastructure/
└── Frontend                         → apps/web/src/
```

## Domain Nodes

### Assessment Domain
**Files:** `domain/assessment/`, `domain/hypothesis/`, `domain/prescription/`
**Spec:** `docs/specs/sections/15-use-cases.md` (UC-003 through UC-013)
**Schema:** `docs/specs/sections/04-schema.md` (Assessment, Hypothesis, Prescription models)
**API:** `docs/specs/sections/06-api.md` §6.8–6.11
**TCs:** `docs/specs/sections/16-tc-00-05.md`, `16-tc-06-10.md`, `16-tc-11-15.md`

### Knowledge Domain
**Files:** `domain/knowledge/`
**Spec:** `docs/specs/sections/13-knowledge-base.md`
**Schema:** `docs/specs/sections/04-schema.md` (Pathology, Remedy, PathologyRemedy)
**API:** `docs/specs/sections/06-api.md` §6.5–6.6
**Seeds:** `apps/api/prisma/seeds/pathologies.ts`, `seeds/remedies.ts`

### Pipeline Domain
**Files:** `domain/pipeline/`
**Spec:** `docs/specs/sections/07-ai-pipeline.md`
**RAG:** `docs/specs/sections/08-rag.md`
**Prompts:** `domain/pipeline/prompts/`

### Scoring Engine
**Files:** `domain/scoring/`
**Spec:** `docs/specs/sections/07-ai-pipeline.md` §7.4 + ADR-005
**Tests:** `domain/scoring/*.spec.ts` (unit — no DB, no OpenAI)

### Funnel Domain
**Files:** `domain/funnel/`
**Spec:** `docs/specs/sections/11-funnel.md`
**API:** `docs/specs/sections/06-api.md` §6.14
**TCs:** `docs/specs/sections/16-tc-00-05.md` (TC-001, TC-002)

### Infrastructure
**Files:** `infrastructure/`
**Spec:** `docs/specs/sections/02-architecture.md` §2.2
**ADRs:** ADR-004 (hexagonal), ADR-001 (stack)
**Ports:** `domain/ports/` — read BEFORE touching infrastructure adapters

### Frontend
**Files:** `apps/web/src/`
**Spec:** `docs/specs/sections/10-frontend.md`
**Design:** `docs/specs/sections/03-design.md`
**Funnel pages:** `docs/specs/sections/11-funnel.md`

## Quick Lookup

| I'm working on... | Load these |
|---|---|
| A route handler | `06-api.md` §6.x + `15-use-cases.md` |
| The assessment pipeline | `07-ai-pipeline.md` + `08-rag.md` |
| A new DB model | `04-schema.md` |
| Auth or protected routes | `05-auth.md` |
| Frontend page | `10-frontend.md` + `03-design.md` |
| Funnel / public pages | `11-funnel.md` + `10-frontend.md` |
| Knowledge base (pathologies/remedies) | `13-knowledge-base.md` |
| Report or PDF | `09-report.md` |
| Scoring engine | ADR-005 + `07-ai-pipeline.md` §7.2 |
| Environment question | `12-env.md` |
| Scope question | `14-mvp.md` |
