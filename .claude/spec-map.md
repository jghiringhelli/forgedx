# Spec Map — ForgeDX Pipeline Cascade

> Used by `cc-gate-session-protocol.py` for EDR cascade detection.
> When you change a node, all downstream nodes require an EDR.

## Assessment Pipeline Cascade

```
docs/specs/sections/04-schema.md (Assessment state machine)
  └── docs/specs/sections/07-ai-pipeline.md (8 pipeline steps)
        ├── docs/specs/sections/08-rag.md (evidence retrieval)
        ├── docs/specs/sections/13-knowledge-base.md (pathology scoring rules)
        │     └── docs/specs/sections/06-api.md (scoring endpoints)
        ├── docs/specs/sections/09-report.md (report JSON schema)
        │     └── docs/specs/sections/06-api.md (report endpoints)
        └── docs/specs/sections/06-api.md (pipeline endpoints)
              └── docs/specs/sections/15-use-cases.md (UCs referencing API)
```

## Funnel Cascade

```
docs/specs/sections/11-funnel.md (funnel flow, 3 mini-Qs)
  ├── docs/specs/sections/04-schema.md (MiniAssessmentLead table)
  │     └── docs/specs/sections/06-api.md (§6.14 funnel endpoints)
  └── docs/specs/sections/10-frontend.md (funnel page behavior)
```

## Auth Cascade

```
docs/specs/sections/05-auth.md (Clerk flow)
  ├── docs/specs/sections/06-api.md (all protected endpoints)
  └── docs/specs/sections/10-frontend.md (route protection)
```

## Schema Cascade

```
docs/specs/sections/04-schema.md (Prisma schema)
  └── (ALL spec sections) — schema changes ripple everywhere
```

## Rule

When editing any spec node, trace all downstream nodes.
For each downstream node: verify no behavioral contradiction exists.
If contradiction found: create EDR before editing any code.
