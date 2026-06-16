# Section 15 — Use Cases

> **Enforcement rule:** Every precondition "Actor is authenticated" requires TWO enforcement mechanisms:
> (1) API-side: Clerk JWT middleware returns 401; (2) Frontend-side: Next.js middleware redirects to Clerk sign-in.
> A precondition without both named mechanisms is a spec gap.

## UC-001: Complete Public Mini-Assessment (Funnel Entry)

**Actor:** Anonymous visitor
**Precondition:** None (public)
**Steps:**
1. Visitor opens `/gs-audit`. System loads 3 mini-assessment questions.
2. Visitor answers 3 questions (scale 1–5 each) and submits.
3. System generates `sessionId`, computes mini-score, identifies top 2 pathology candidates.
4. System stores `MiniAssessmentLead` row (no email yet).
5. System redirects to `/gs-audit/results?leadId=xxx`.
6. Results page shows: score badge (X/14), 2 teased pathology names (details blurred), partial radar chart, Skool CTA, Workshop CTA, and "See full report →" auth CTA.
**Outcome:** Visitor sees their estimated GS score and is motivated to proceed to full assessment.

## UC-002: Capture Lead Email

**Actor:** Anonymous visitor (after UC-001)
**Precondition:** Mini-assessment completed (`MiniAssessmentLead` exists).
**Steps:**
1. Visitor optionally enters email on score teaser page.
2. System calls `POST /api/funnel/capture-lead` → updates `MiniAssessmentLead.email`.
**Outcome:** Email captured for future outreach. Not required to proceed.

## UC-003: Create Project and Team

**Actor:** Admin (authenticated). **Enforcement:** API — Clerk middleware (401); Frontend — Next.js middleware (Clerk redirect).
**Steps:**
1. Admin creates a new project with name, client name, description.
2. Admin creates one or more teams within the project: name, size, tech stack, AI tools, methodology, deployment frequency, main challenges.
3. Optionally, admin adds team members with role, seniority, AI proficiency.
**Outcome:** Project and team(s) created and ready for document upload and survey.

## UC-004: Upload and Process Evidence Documents

**Actor:** Admin (authenticated)
**Precondition:** A project and team exist.
**Steps:**
1. Admin navigates to the team's documents page.
2. Admin uploads files (CLAUDE.md, ADRs, spec files, test files, transcripts) with document type.
3. Admin triggers document processing.
4. System parses, chunks, generates embeddings (text-embedding-3-small), extracts signals via type-specific LLM prompts.
5. System stores chunks with embeddings and signals.
**Outcome:** Documents processed with extracted signals and embeddings available for RAG and survey prefill.

## UC-005: Complete GS Survey

**Actor:** Admin (authenticated)
**Precondition:** A team exists. Optionally, documents have been processed.
**Steps:**
1. Admin opens the survey for a team. System creates an `Assessment` (status: `survey_pending`) if none exists.
2. If processed documents exist, the system pre-fills survey answers using the 3-tier confidence model.
3. Admin reviews AI-prefilled answers, edits as needed, manually fills remaining questions.
4. Admin submits the survey. System stores responses with source tracking.
**Outcome:** Survey responses saved. Assessment status moves to `evidence_pending`.

## UC-006: Run Team GS Assessment

**Actor:** Admin (authenticated)
**Precondition:** Survey responses exist for the team.
**Steps:**
1. Admin clicks "Run Assessment". System sets status to `analyzing` and runs the 8-step pipeline as a background job.
2. Pipeline executes steps 1–6 (see §07-ai-pipeline.md).
3. Frontend polls `/api/assessments/:id/status` every 5 seconds until `hypotheses_ready`.
**Outcome:** Hypotheses generated with GS scores, evidence levels, supporting evidence, confirmatory questions. GS opportunity map populated.

## UC-007: Review and Confirm Hypotheses

**Actor:** Admin (authenticated)
**Precondition:** Assessment status is `hypotheses_ready`.
**Steps:**
1. Admin reviews hypothesis cards sorted by evidence level and score.
2. For each hypothesis, admin sees: pathology name, category, severity, GS properties, evidence strength badge, supporting evidence with excerpts, missing evidence, AI reasoning, contradictions.
3. Admin takes action: Confirm, Discard (with optional reason), No Info, or answers confirmatory questions.
4. After actions, admin can trigger re-analysis to update scores.
5. Emerging patterns (AI-detected) can be promoted to official pathologies.
**Outcome:** Hypotheses confirmed/discarded. Evidence levels may upgrade to corroborated.

## UC-008: Generate Treatment Plan (Remedy Prescription)

**Actor:** Admin (authenticated)
**Precondition:** At least one hypothesis confirmed.
**Steps:**
1. Admin clicks "Prescribe Treatment". System runs remedy prescription step.
2. AI selects remedies from the catalog matched to confirmed pathologies, considering team context.
3. AI organizes prescriptions into 3 phases: Quick Wins (0–30 days), Core Treatment (1–3 months), Transformation (3–6 months) with dependency ordering.
4. Admin reviews: Accept, Reject, Start, or Complete each prescription.
**Outcome:** Treatment plan with phased remedy prescriptions ready. Assessment status: `treatment_ready`.

## UC-009: Generate and Export Report

**Actor:** Admin (authenticated)
**Precondition:** Treatment plan is ready.
**Steps:**
1. Admin clicks "Generate Report". System compiles full JSON report.
2. Admin reviews the interactive report: GS radar chart, property scores, pathology findings, opportunity map, treatment plan, roadmap.
3. Admin clicks "Export PDF". System renders via Puppeteer → A4 PDF stored in Supabase Storage.
4. Admin clicks "Share Report". System generates/reveals shareable link (`/reports/:shareToken`).
**Outcome:** Report viewable, downloadable as PDF, and shareable via public link. Assessment status: `completed`.

## UC-010: View Public Shareable Report

**Actor:** Anonymous visitor (given a share link)
**Precondition:** Report has a valid `shareToken`.
**Steps:**
1. Visitor opens `/reports/:shareToken`.
2. System fetches report content from `GET /api/reports/:shareToken/public` (no auth).
3. Full report is displayed (read-only, no edit controls).
4. Skool CTA and Workshop CTA are prominently displayed.
**Outcome:** Stakeholders can view the team's GS report. CTAs drive course enrollments.

## UC-011: Manage GS Pathology Knowledge Base

**Actor:** Admin (authenticated)
**Steps:**
1. Admin navigates to `/knowledge/pathologies`.
2. Admin can list, search (full-text by name or symptom), filter by category/gsProperty, create, edit, or delete pathologies.
3. Admin can link/unlink remedies to pathologies with strength and rationale.
4. Admin can promote emerging patterns from assessments into official pathologies.
**Outcome:** Pathology knowledge base maintained.

## UC-012: Manage GS Remedy Knowledge Base

**Actor:** Admin (authenticated)
**Steps:**
1. Admin navigates to `/knowledge/remedies`.
2. Admin can list, search, filter by type/category, create, edit, or delete remedies.
3. Admin can view which pathologies each remedy addresses.
**Outcome:** Remedy knowledge base maintained.

## UC-013: Re-analyze After New Evidence

**Actor:** Admin (authenticated)
**Precondition:** Assessment status is `hypotheses_ready` or `prescription_ready`.
**Steps:**
1. Admin uploads new documents OR answers confirmatory questions.
2. Admin clicks "Re-analyze".
3. System re-runs the pipeline from Step 2 (Evidence Analysis) with the new evidence.
4. Hypotheses are updated with new scores and evidence levels.
**Outcome:** Assessment updated with stronger or weaker evidence. Confirmatory answers can promote evidence level to `corroborated`.
