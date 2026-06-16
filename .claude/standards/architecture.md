# Architecture Standards — ForgeDX

## Module Boundaries

```
apps/api/src/
  routes/              — HTTP adapter (Hono route handlers, Zod validation only)
  domain/
    assessment/        — Assessment lifecycle, status machine
    hypothesis/        — Hypothesis CRUD, confirmation flow
    prescription/      — Remedy prescription, treatment plan
    knowledge/         — Pathology + Remedy CRUD
    scoring/           — Deterministic hybrid scoring engine (PURE — zero I/O)
    pipeline/          — 8-step assessment pipeline orchestration
      steps/           — One file per pipeline step
      prompts/         — All LLM prompt templates
    funnel/            — Mini-assessment, lead capture
    ports/             — IAIProvider, IAssessmentRepository, IStorageAdapter, etc.
  infrastructure/
    db/repositories/   — Prisma repository implementations
    ai/                — OpenAIAdapter, EmbeddingAdapter (implements IAIProvider)
    storage/           — SupabaseStorageAdapter
    pdf/               — PuppeteerAdapter
  middleware/          — Hono auth (Clerk), error handler, logger
  lib/                 — Shared: schemas (Zod), errors, Result type

apps/web/src/
  app/                 — Next.js App Router pages
  components/          — UI components (shadcn/ui + domain composites)
  hooks/               — TanStack Query hooks per API resource
  lib/                 — API client, auth helpers, schemas, query-keys
```

## Critical Boundaries (depcruise enforced — Gate 7)

| Rule | Allowed | Forbidden |
|------|---------|----------|
| `no-openai-outside-ai-adapter` | `infrastructure/ai/*.ts` imports `openai` | Any other file |
| `scoring-engine-purity` | `domain/scoring/*.ts` imports pure TS only | `@prisma/client`, `openai`, `hono` |
| `no-route-to-db` | `routes/*.ts` → `domain/` services | `routes/*.ts` → `infrastructure/` directly |
| `no-domain-to-infra` | `domain/` → `domain/ports/` interfaces | `domain/` → `infrastructure/` directly |
| `not-to-test` | Production code | Test files |

```javascript
// apps/api/.dependency-cruiser.cjs (abbreviated)
module.exports = {
  forbidden: [
    {
      name: 'no-openai-outside-ai-adapter',
      from: { pathNot: '^src/infrastructure/ai' },
      to: { path: 'openai' }
    },
    {
      name: 'scoring-engine-purity',
      from: { path: '^src/domain/scoring' },
      to: { path: '@prisma/client|openai|hono' }
    },
    {
      name: 'no-route-to-db',
      from: { path: '^src/routes' },
      to: { path: 'infrastructure/db|@prisma/client' }
    },
    {
      name: 'no-domain-to-infra',
      from: { path: '^src/domain' },
      to: { path: '^src/infrastructure' }
    }
  ]
}
```

## Scoring Engine — Purity Contract

`domain/scoring/scoring.engine.ts` is a **pure computation module**:
- **Input:** pathology `scoringRules` JSONB + array of `MatchedSignal`
- **Output:** `{ computedScore: number, evidenceLevel: EvidenceLevel, signalCount: number, sourceTypes: string[] }`
- **Zero side effects** — no DB reads, no API calls, no logging inside scoring functions
- **Deterministic** — same signal set always produces same score

The anti-double-counting rule lives here:
- `ai_auto` or `ai_prefilled` survey answers → count as `document` source
- `manual` survey answers only → count as independent `survey` source

## AI Pipeline — Orchestration Pattern

`domain/pipeline/pipeline.service.ts` orchestrates via the `IAIProvider` port:
- Each step is an independent function: `(prevStepOutput) => Promise<StepOutput>`
- Steps 1–6 run automatically on assessment start
- Steps 7 (prescription) and 8 (report) are user-triggered via separate endpoints
- No direct OpenAI imports in pipeline code — uses `IAIProvider.complete()` only

## Dependency Injection Wiring (explicit, no framework)

All dependencies wired in `apps/api/src/app.ts`:
```typescript
// app.ts — top-level wiring
const prisma = new PrismaClient()
const aiProvider = new OpenAIAdapter(env.OPENAI_API_KEY)
const assessmentRepo = new AssessmentPrismaRepo(prisma)
const scoringEngine = new ScoringEngine()                    // pure — no deps
const pipelineService = new PipelineService(aiProvider, assessmentRepo, scoringEngine)
const assessmentService = new AssessmentService(assessmentRepo, pipelineService)
// mount routes
app.route('/api/assessments', assessmentRoutes(assessmentService))
```

## Web Layer Boundaries (eslint-plugin-boundaries)

Direction: `app → component → hook → lib`
- `lib/` cannot import from `hook/`, `component/`, or `app/`
- `hook/` cannot import from `component/` or `app/`
- `component/` cannot import from `app/`
- Config: `apps/web/eslint.boundaries.config.mjs`

## Shared Invariants Catalog

When the same business rule applies to both a read and a write path, extract it into a shared helper. Current known pairs:

| Rule | Read path | Write path | Shared helper |
|------|-----------|------------|---------------|
| Active hypothesis filter | `GET /hypotheses` | `PATCH /hypotheses/:id/confirm` | `filterActiveHypotheses()` |
| Assessment scope check | `GET /assessments/:id` | `POST /teams/:id/assessments` | `validateAssessmentScope()` |
| Pipeline stage classification | `GET /assessments/:id/status` | Pipeline step runner | `classifyPipelineStage()` |

**New duplications must be added here as they appear** — reviewer enforced.

## Stale Status Recovery

`onStartup` hook in `app.ts`:
```typescript
// Reset assessments stuck in 'analyzing' for > 10 minutes
const staleThreshold = new Date(Date.now() - 10 * 60 * 1000)
await assessmentRepo.resetStaleAnalyzing(staleThreshold)
```
