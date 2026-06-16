# Section 04 — Database Schema (Prisma)

All tables use UUID PKs (`@default(uuid())`), `createdAt`/`updatedAt` timestamps. Prisma schema file: `apps/api/prisma/schema.prisma`.

## 4.1 Schema Overview

| # | Model | Key Fields | Relationships |
|---|-------|-----------|---------------|
| 1 | `User` | clerkId (unique), email, name, role | Created by for projects |
| 2 | `Project` | name, clientName, status | Has many teams, documents, assessments |
| 3 | `Team` | projectId, name, size, techStack, aiToolsCurrent, context(Json) | Belongs to project; has members, documents, assessments |
| 4 | `TeamMember` | teamId, name, role, seniority, aiProficiency | Belongs to team |
| 5 | `Document` | projectId?, teamId?, type, status, storagePath, extractedSignals(Json) | Belongs to project/team; has chunks |
| 6 | `DocumentChunk` | documentId, chunkIndex, content, embedding(Unsupported("vector(1536)")), tokenCount | Belongs to document; HNSW index |
| 7 | `Pathology` | name(unique), category, gsProperty[], symptoms[], scoringRules(Json), searchVector | Many-to-many with remedies |
| 8 | `SurveyTemplate` | gsProperty, dimension, question, questionType, dependsOn(Json) | Referenced by survey responses |
| 9 | `SurveyResponse` | teamId, assessmentId, templateId, answer(Json), source, aiConfidence | Belongs to team + assessment |
| 10 | `Assessment` | projectId, teamId, scope, status, gsScore, propertyScores(Json), treatmentPlan(Json) | Has hypotheses, prescriptions, reports |
| 11 | `Hypothesis` | assessmentId, pathologyId, status, evidenceLevel, computedScore, supportingEvidence(Json) | Belongs to assessment; has confirmatory questions |
| 12 | `ConfirmatoryQuestion` | hypothesisId, question, answer | Belongs to hypothesis |
| 13 | `GsOpportunityMap` | assessmentId, processArea, currentAdoption, expectedImpact, effortToImplement | Belongs to assessment |
| 14 | `AiLog` | projectId?, assessmentId?, stage, model, tokensInput, tokensOutput, durationMs | Audit trail |
| 15 | `Report` | assessmentId, content(Json), pdfStoragePath, shareToken(unique) | Belongs to assessment |
| 16 | `Remedy` | name(unique), type, category, effort, expectedImpact, searchVector | Many-to-many with pathologies |
| 17 | `PathologyRemedy` | pathologyId, remedyId, strength, rationale, priorityOrder | Junction: pathology → remedy |
| 18 | `AssessmentPrescription` | assessmentId, remedyId, pathologyId, strength, status, phase, isNewRemedy | Per-assessment AI-prescribed remedies |
| 19 | `MiniAssessmentLead` | sessionId(unique), email?, score, responses(Json), convertedToFullAssessment | Funnel lead capture |

## 4.2 Prisma Schema (Abbreviated)

```prisma
// apps/api/prisma/schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

enum UserRole { admin viewer }
enum ProjectStatus { active archived }
enum DocumentType { claudeMd adr spec testFile transcript discovery report }
enum DocumentStatus { pending processing processed failed }
enum AnswerSource { manual ai_prefilled ai_auto }
enum AssessmentStatus {
  survey_pending evidence_pending analyzing
  hypotheses_ready prescription_ready treatment_ready completed failed
}
enum AssessmentScope { team project organization }
enum EvidenceLevel { weak moderate strong corroborated }
enum PathologyCategory { spec_discipline quality_enforcement context_management change_governance }
enum PathologySeverity { low medium high critical }
enum GsProperty { self_describing bounded verifiable defended auditable composable executable }
enum RemedyType { practice tool protocol gate }
enum RemedyEffort { low medium high }
enum ExpectedImpact { low medium high }
enum MappingStrength { supplementary primary essential }
enum PrescriptionStatus { proposed accepted rejected started completed }
enum TreatmentPhase { quick_win core_treatment transformation }

model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique
  email     String   @unique
  name      String
  role      UserRole @default(admin)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  projects  Project[]
}

model Project {
  id          String        @id @default(uuid())
  name        String
  clientName  String
  description String?
  status      ProjectStatus @default(active)
  createdById String
  createdBy   User          @relation(fields: [createdById], references: [id])
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  teams       Team[]
  documents   Document[]
  assessments Assessment[]
}

model Team {
  id                   String         @id @default(uuid())
  projectId            String
  project              Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)
  name                 String
  size                 Int
  techStack            String[]
  aiToolsCurrent       String[]
  methodology          String?
  deploymentFrequency  String?
  mainChallenges       String?
  context              Json?
  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt
  members              TeamMember[]
  documents            Document[]
  assessments          Assessment[]
  surveyResponses      SurveyResponse[]
}

model Assessment {
  id              String           @id @default(uuid())
  projectId       String
  project         Project          @relation(fields: [projectId], references: [id])
  teamId          String?
  team            Team?            @relation(fields: [teamId], references: [id])
  scope           AssessmentScope  @default(team)
  status          AssessmentStatus @default(survey_pending)
  gsScore         Float?
  propertyScores  Json?            // { self_describing: 2, bounded: 1, ... }
  treatmentPlan   Json?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  surveyResponses SurveyResponse[]
  hypotheses      Hypothesis[]
  prescriptions   AssessmentPrescription[]
  opportunityMap  GsOpportunityMap[]
  report          Report?
  aiLogs          AiLog[]
}

model Hypothesis {
  id                    String       @id @default(uuid())
  assessmentId          String
  assessment            Assessment   @relation(fields: [assessmentId], references: [id])
  pathologyId           String
  pathology             Pathology    @relation(fields: [pathologyId], references: [id])
  status                String       @default("pending") // pending|confirmed|discarded|no_info
  evidenceLevel         EvidenceLevel?
  computedScore         Float?
  supportingEvidence    Json?        // { signals: [], excerpts: [], reasoning: "", contradictions: [] }
  missingEvidence       String?
  aiReasoning           String?
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  confirmatoryQuestions ConfirmatoryQuestion[]
}

model Pathology {
  id            String             @id @default(uuid())
  name          String             @unique
  slug          String             @unique  // e.g. "architectural-drift"
  category      PathologyCategory
  severity      PathologySeverity
  gsProperties  GsProperty[]
  symptoms      String[]
  scoringRules  Json               // { signals: [...], thresholds: {...} }
  searchVector  Unsupported("tsvector")?
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt
  remedies      PathologyRemedy[]
  hypotheses    Hypothesis[]
}

model Remedy {
  id                  String               @id @default(uuid())
  name                String               @unique
  slug                String               @unique
  type                RemedyType
  category            String
  effort              RemedyEffort
  expectedImpact      ExpectedImpact
  implementationSteps String[]
  description         String
  searchVector        Unsupported("tsvector")?
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  pathologies         PathologyRemedy[]
  prescriptions       AssessmentPrescription[]
}

model PathologyRemedy {
  pathologyId   String
  pathology     Pathology        @relation(fields: [pathologyId], references: [id])
  remedyId      String
  remedy        Remedy           @relation(fields: [remedyId], references: [id])
  strength      MappingStrength
  rationale     String
  priorityOrder Int
  @@id([pathologyId, remedyId])
}

model Report {
  id             String     @id @default(uuid())
  assessmentId   String     @unique
  assessment     Assessment @relation(fields: [assessmentId], references: [id])
  content        Json       // Full report JSON structure
  pdfStoragePath String?
  shareToken     String?    @unique @default(uuid())
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
}

model MiniAssessmentLead {
  id                          String   @id @default(uuid())
  sessionId                   String   @unique
  email                       String?
  score                       Float
  responses                   Json
  convertedToFullAssessment   Boolean  @default(false)
  createdAt                   DateTime @default(now())
}
```

## 4.3 pgvector Index

```sql
-- Migration: create HNSW index on document_chunks.embedding
CREATE INDEX document_chunks_embedding_idx
ON document_chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

## 4.4 Full-Text Search

Pathologies and remedies use PostgreSQL `tsvector` full-text search for the knowledge base search:
```sql
-- Trigger to maintain searchVector on pathologies
CREATE OR REPLACE FUNCTION update_pathology_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW."searchVector" = to_tsvector('english', coalesce(NEW.name, '') || ' ' || array_to_string(NEW.symptoms, ' '));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 4.5 Assessment Status State Machine

```
survey_pending → evidence_pending → analyzing → hypotheses_ready
                                              → failed
hypotheses_ready → prescription_ready → treatment_ready → completed
```

Transition guards:
- `evidence_pending` → `analyzing`: survey responses exist (≥1)
- `analyzing` is set by pipeline start; pipeline sets `hypotheses_ready` or `failed`
- `hypotheses_ready` → `prescription_ready`: triggered by `POST /prescriptions/generate`
- `treatment_ready` → `completed`: triggered by `POST /reports`
