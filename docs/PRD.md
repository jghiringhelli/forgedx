# ForgeDX — Product Requirements Document

## Problem

Software development teams adopting AI tools have no structured way to measure their Generative Specification (GS) maturity. Teams don't know which GS pathologies they exhibit, which GS practices would close those gaps, or how to sequence adoption. ForgeDX follows the medical diagnostic methodology from VairixDX — survey, hypothesis generation, confirmatory analysis, report — adapted to the GS discipline: it identifies the specific GS pathologies a team suffers from, prescribes the GS remedies that address those pathologies, and delivers a phased GS adoption treatment plan.

The platform serves a dual purpose: (1) a useful diagnostic tool teams benefit from directly, and (2) the primary funnel for the PragmaWorks Skool course on Generative Specification and for in-person GS workshops (pragmaworks.dev).

## Users

- **CTO / Engineering Consultant (MVP):** Single admin who manually curates data, runs assessments, and generates reports for client teams. Creates projects and teams, uploads evidence documents, completes surveys, reviews AI-generated hypotheses, confirms/discards pathologies, reviews prescribed remedies, and exports PDF reports.
- **Workshop Participant (funnel):** A developer or team lead who completes the public mini-assessment to see their GS score and identify their top pathologies before deciding to enroll in the Skool course or book a workshop.
- **Viewer (future):** Read-only access to reports and dashboards.

## Success Criteria

- Complete team GS assessment with evidence-based hypotheses using a hybrid scoring engine (deterministic scoring + LLM narrative)
- GS score on the 14-point rubric (7 properties × 0–2) with per-property breakdown
- Personalized remedy prescriptions matched to confirmed pathologies and team context
- Phased GS adoption treatment plan (quick wins / short term / long term) with dependency ordering
- AI opportunity map evaluating which SDLC process areas benefit most from GS discipline
- Exportable PDF report: executive summary, GS scorecard, pathology findings, AI opportunity map, treatment plan, roadmap
- Document-aware survey auto-fill (3-tier confidence) from uploaded evidence (CLAUDE.md, ADRs, test files, specs)
- Public mini-assessment (no auth) → score teaser → Skool course CTA
- Shareable report link (public URL) for stakeholder distribution

## Components

- **Frontend (apps/web):** Next.js 15 App Router + TypeScript, shadcn/ui (new-york) + Tailwind CSS, TanStack Query, Recharts
- **Backend (apps/api):** Hono + Node.js + TypeScript REST API, Clerk JWT middleware
- **Database:** PostgreSQL + pgvector extension (Supabase or Railway), Prisma ORM
- **Auth:** Clerk (Google, GitHub, email sign-in; no registration flow for MVP admin)
- **AI Pipeline:** 8-step GS assessment pipeline — survey analysis, evidence analysis, signal extraction + pathology matching (hybrid scoring), confirmatory question generation, evidence re-evaluation, GS opportunity mapping, remedy prescription, report generation
- **Scoring Engine:** Deterministic hybrid scoring — LLM extracts signals, engine computes scores from weighted signal rules per pathology
- **RAG System:** Document chunking (~500 tokens), OpenAI text-embedding-3-small embeddings, HNSW vector index, scoped queries per pipeline step
- **Knowledge Base:** 29 GS pathologies (all with scoring rules), 20 GS remedies, pathology-remedy mappings, survey templates
- **PDF Generation:** Puppeteer server-side HTML-to-PDF from standalone HTML endpoint
- **File Storage:** Supabase Storage for uploaded documents (CLAUDE.md, ADRs, .md specs, test files, PDF, TXT)
- **Funnel Layer:** Public mini-assessment (3 questions, no auth), lead capture after score reveal, Skool CTA, workshop booking link

## External Systems

- **OpenAI API:** GPT-4.1-mini for all LLM calls (temperature=0, structured JSON outputs), text-embedding-3-small for embeddings
- **Clerk:** Authentication provider (JWT, session management, user management)
- **Supabase:** PostgreSQL + pgvector + file storage (or Railway PostgreSQL + local storage for dev)
- **Puppeteer / Chromium:** Server-side PDF rendering
- **Stripe (future):** Payment for premium report credits

## Funnel Flow

```
Public landing (pragmaworks.dev/gs-audit OR app.forgedx.dev)
  └─► Mini-assessment (3 GS questions, no auth)
        └─► Score teaser: "Your team scores X/14 — you exhibit N GS pathologies"
              └─► [See Full Report] → Clerk auth (Google / GitHub / email)
                    └─► Full assessment: 45+ questions + document upload
                          └─► AI diagnostic runs (~2–3 min)
                                └─► Interactive GS report + PDF export
                                      ├─► [Master GS in 6 weeks] → skool.com/pragmaworks
                                      ├─► [Book In-Person Workshop] → pragmaworks.dev/workshops
                                      └─► [Share Report] → public shareable link
```
