# Section 02 — Architecture

## 2.1 Architectural Style: Hexagonal (Ports and Adapters)

ForgeDX uses **hexagonal architecture** (Ports and Adapters). The domain core is pure TypeScript with zero framework dependencies. Infrastructure adapters implement port interfaces. Route handlers are thin — validate input with Zod, call domain service, return response.

```
┌───────────────────────────────────────────────────────────┐
│                        apps/api                            │
│                                                           │
│  ┌──────────────┐   ┌──────────────────────────────────┐  │
│  │   Routes     │   │           Domain Core             │  │
│  │  (Hono)      │──►│  services / entities / ports      │  │
│  │  Zod valid.  │   │  (no framework imports)           │  │
│  └──────────────┘   └──────────────┬─────────────────┘  │  │
│                                    │ calls ports          │
│  ┌──────────────────────────────────▼─────────────────┐  │
│  │               Infrastructure Adapters               │  │
│  │  PrismaRepository  OpenAIAdapter  StorageAdapter    │  │
│  │  EmbeddingAdapter  PuppeteerAdapter  ClerkAdapter   │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

## 2.2 Module Structure — apps/api/src

```
src/
  index.ts                    — Node.js entry: create app, start server
  app.ts                      — Hono app factory: mount middleware + routes
  routes/                     — HTTP adapter layer (Hono route handlers only)
    auth.ts
    projects.ts
    teams.ts
    documents.ts
    assessments.ts
    hypotheses.ts
    prescriptions.ts
    reports.ts
    knowledge/
      pathologies.ts
      remedies.ts
    funnel.ts                  — public mini-assessment endpoints
    ai-logs.ts
  domain/                     — Business logic (pure, framework-free)
    assessment/
      assessment.entity.ts    — Assessment domain entity (rich, not anemic)
      assessment.service.ts   — Use case implementations
      assessment.repository.ts — Port interface (IAssessmentRepository)
    hypothesis/
      hypothesis.entity.ts
      hypothesis.service.ts
      hypothesis.repository.ts
    prescription/
      prescription.entity.ts
      prescription.service.ts
      prescription.repository.ts
    knowledge/
      pathology.entity.ts
      remedy.entity.ts
      knowledge.service.ts
      knowledge.repository.ts
    scoring/
      scoring.engine.ts       — Deterministic scoring from extracted signals
      scoring.types.ts        — ScoredPathology, EvidenceLevel, GsScore
    pipeline/
      pipeline.service.ts     — Orchestrates the 8-step assessment pipeline
      steps/
        01-survey-analysis.step.ts
        02-evidence-analysis.step.ts
        03-signal-extraction.step.ts
        04-hypothesis-generation.step.ts
        05-confirmatory-questions.step.ts
        06-gs-opportunity-mapping.step.ts
        07-remedy-prescription.step.ts
        08-report-generation.step.ts
    funnel/
      mini-assessment.service.ts
      lead-capture.service.ts
    ports/                    — Port interfaces (dependency inversion targets)
      ai-provider.port.ts     — IAIProvider: complete(), embed()
      assessment-repo.port.ts
      document-repo.port.ts
      storage.port.ts
      pdf.port.ts
  infrastructure/             — Adapters implement ports
    db/
      prisma.client.ts        — Prisma singleton
      repositories/
        assessment.prisma-repo.ts
        hypothesis.prisma-repo.ts
        prescription.prisma-repo.ts
        knowledge.prisma-repo.ts
        document.prisma-repo.ts
    ai/
      openai.adapter.ts       — Implements IAIProvider (complete + embed)
      embedding.adapter.ts    — Manages embedding operations
    storage/
      supabase-storage.adapter.ts
    pdf/
      puppeteer.adapter.ts
  middleware/
    auth.ts                   — Clerk JWT validation (Hono middleware)
    error.ts                  — Global error handler
    logger.ts                 — Request logging
  lib/
    schemas/                  — Zod schemas (shared between routes and domain)
      assessment.schema.ts
      hypothesis.schema.ts
      knowledge.schema.ts
    errors.ts                 — Domain error types (AssessmentNotFound, etc.)
    result.ts                 — Result<T, E> type for explicit error handling
```

## 2.3 Module Structure — apps/web/src

```
src/
  app/
    (public)/                 — No Clerk auth required
      page.tsx                — Landing page: hero, mini-assessment CTA
      gs-audit/
        page.tsx              — Public mini-assessment (3 questions)
        results/
          page.tsx            — Score teaser + auth gate CTA
    (auth)/                   — Clerk-protected route group
      layout.tsx              — ClerkProvider + auth check
      dashboard/
        page.tsx              — Projects overview
      projects/
        new/
          page.tsx            — Create project
        [id]/
          page.tsx            — Project detail
          teams/
            new/
              page.tsx        — Create team
            [teamId]/
              page.tsx        — Team overview
              documents/
                page.tsx      — Document upload + processing status
              survey/
                page.tsx      — Survey form with AI prefill
              assessment/
                page.tsx      — Run assessment + status polling
              hypotheses/
                page.tsx      — Hypothesis review + confirm/discard
              prescriptions/
                page.tsx      — Remedy prescription + treatment plan
              report/
                page.tsx      — GS report view + PDF export
      knowledge/
        pathologies/
          page.tsx            — Pathology management
        remedies/
          page.tsx            — Remedy management
    reports/
      [shareToken]/
        page.tsx              — Public shareable report (no auth)
    api/
      pdf-render/
        [reportId]/
          route.ts            — HTML render for Puppeteer (unauthenticated)
  components/
    ui/                       — shadcn/ui components only
    assessment/               — Assessment-domain components
      HypothesisCard.tsx
      GsScoreRadar.tsx
      TreatmentPlan.tsx
    knowledge/
      PathologyList.tsx
      RemedyCard.tsx
    report/
      ReportView.tsx
      PdfExportButton.tsx
    funnel/
      MiniAssessment.tsx
      SkoolCta.tsx
      WorkshopBookingCta.tsx
      ShareReportButton.tsx
  hooks/
    use-assessment.ts
    use-hypotheses.ts
    use-prescriptions.ts
    use-report.ts
  lib/
    api-client.ts             — TanStack Query base + axios interceptors
    auth.ts                   — Clerk auth helpers
    schemas/                  — Shared Zod schemas (subset mirroring API)
```

## 2.4 Layer Enforcement Rules

Enforced by `depcruise` (Gate 7):

| From | To | Allowed? |
|------|----|----------|
| routes/ | domain/ | ✅ (via service injection) |
| domain/ | infrastructure/ | ❌ (domain defines ports only) |
| infrastructure/ | domain/ | ✅ (implements ports) |
| routes/ | infrastructure/ | ❌ (must go through domain) |
| domain/pipeline/ | OpenAI directly | ❌ (must use IAIProvider port) |
| domain/scoring/ | Prisma directly | ❌ (must use IRepository port) |

## 2.5 Dependency Injection

ForgeDX does not use a DI framework. Adapters are instantiated in `app.ts` and injected manually into domain services at startup. This keeps the domain pure and the wiring explicit.

```typescript
// app.ts
const prisma = new PrismaClient();
const aiProvider = new OpenAIAdapter(process.env.OPENAI_API_KEY!);
const assessmentRepo = new AssessmentPrismaRepo(prisma);
const scoringEngine = new ScoringEngine();
const pipelineService = new PipelineService(aiProvider, assessmentRepo, scoringEngine);
const assessmentService = new AssessmentService(assessmentRepo, pipelineService);
// ... mount routes with services
```

## 2.6 Error Semantics

All domain errors are typed. Route handlers catch and map to HTTP status codes.

```typescript
// Domain errors (domain/lib/errors.ts)
class AssessmentNotFoundError extends Error { readonly kind = 'NOT_FOUND'; }
class AssessmentAlreadyRunningError extends Error { readonly kind = 'CONFLICT'; }
class InsufficientEvidenceError extends Error { readonly kind = 'PRECONDITION_FAILED'; }

// Route handler pattern
try {
  const result = await assessmentService.runAssessment(id);
  return c.json(result, 200);
} catch (e) {
  if (e instanceof AssessmentNotFoundError) return c.json({ error: e.message }, 404);
  if (e instanceof AssessmentAlreadyRunningError) return c.json({ error: e.message }, 409);
  throw e; // propagate to global error middleware
}
```

## 2.7 CQRS-Lite for Pipeline State

The assessment pipeline is a long-running background operation. The pattern:
1. **Command:** `POST /api/teams/:teamId/assessments` — starts the pipeline, returns `{ assessmentId, status: 'analyzing' }` immediately
2. **Query:** `GET /api/assessments/:id/status` — polled every 5s by frontend until `hypotheses_ready`
3. **No WebSocket in MVP** — polling is acceptable for 2–3 min pipeline duration

## 2.8 Monorepo Structure

```
forgedx/
  apps/
    api/          — Hono + Node.js backend
    web/          — Next.js 15 frontend
  packages/
    schemas/      — Shared Zod schemas (future: API types generated from here)
  docs/           — GS spec (this spec)
  scripts/        — Shared scripts
  .claude/        — Claude navigation tree
  CLAUDE.md       — Navigation root
```
