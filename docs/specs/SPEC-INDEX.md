# SPEC-INDEX.md — ForgeDX

> Decision tree for navigating the spec. Read this first. Load only what you need.

## Section Map

| # | File | What it covers | Load when… |
|---|------|----------------|-----------|
| 01 | `sections/01-identity.md` | Domain, medical metaphor, GS rubric anchoring, naming rules | Starting any work; identity questions |
| 02 | `sections/02-architecture.md` | Hexagonal architecture, module boundaries, layer rules, CQRS-lite | Architecture decisions; adding new modules |
| 03 | `sections/03-design.md` | PragmaWorks design tokens, shadcn/ui config, component patterns | Any frontend/UI work |
| 04 | `sections/04-schema.md` | Prisma schema, table definitions, enums, indexes | DB work; new entity; migration |
| 05 | `sections/05-auth.md` | Clerk auth flow, Hono middleware, Next.js middleware | Auth work; protected routes |
| 06 | `sections/06-api.md` | Full Hono API contracts (60+ endpoints) with request/response shapes | API work; any endpoint |
| 07 | `sections/07-ai-pipeline.md` | 8-step GS assessment pipeline, step contracts, error semantics | AI pipeline work |
| 08 | `sections/08-rag.md` | Chunking strategy, embedding queries, pgvector, per-step query plans | Document processing; RAG queries |
| 09 | `sections/09-report.md` | Report JSON structure, PDF generation, shareable link | Report or PDF work |
| 10 | `sections/10-frontend.md` | Next.js App Router structure, route groups, page contracts | Frontend work |
| 11 | `sections/11-funnel.md` | Public mini-assessment, Skool CTA, lead capture, shareable reports | Funnel/marketing features |
| 12 | `sections/12-env.md` | All environment variables, required vs optional, dev defaults | Env setup; deployment; new service |
| 13 | `sections/13-knowledge-base.md` | 29 GS pathologies, 20 GS remedies, scoring rules, mappings | Knowledge base work; seed data |
| 14 | `sections/14-mvp.md` | MVP scope boundaries — what is in vs out | Scope questions; planning |
| 15 | `sections/15-use-cases.md` | UC-001 through UC-013 with preconditions, steps, outcomes | Feature work; TC authoring |
| 16a | `sections/16-tc-00-05.md` | TC-001 through TC-006: auth, projects, teams | Test authoring; manual validation |
| 16b | `sections/16-tc-06-10.md` | TC-007 through TC-010: documents, survey | Test authoring; manual validation |
| 16c | `sections/16-tc-11-15.md` | TC-011 through TC-015: assessment pipeline, hypotheses | Test authoring; manual validation |
| 16d | `sections/16-tc-16-20.md` | TC-016 through TC-020: prescriptions, report, funnel | Test authoring; manual validation |

## Quick Decision Tree

```
What are you doing?
├── Implementing a UC → 15-use-cases.md + matching 16-tc-*.md + 06-api.md
├── DB schema change → 04-schema.md (+ 02-architecture.md if new domain module)
├── AI pipeline step → 07-ai-pipeline.md + 08-rag.md
├── Frontend page → 10-frontend.md + 03-design.md + 15-use-cases.md
├── Auth question → 05-auth.md
├── Report or PDF → 09-report.md
├── Funnel feature → 11-funnel.md + 10-frontend.md
├── Knowledge base → 13-knowledge-base.md
├── Env var question → 12-env.md
└── Scope question → 14-mvp.md
```

## Assembled Output (demand only)

```bash
./scripts/assemble-spec.sh
# Output: docs/specs/.build/SPEC-ForgeDX.assembled.md (gitignored)
```
