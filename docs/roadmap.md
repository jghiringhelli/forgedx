# ForgeDX Roadmap

> Each item maps to one implementation session. Generated from spec + dependency graph.
> Status: pending | in-progress | done
> Run `generate_session_prompt` with the RM ID to get the bound session prompt.

---

## Phase 0: Foundation

| ID | Title | Depends On | Status |
|----|-------|-----------|--------|
| RM-000 | Monorepo scaffold: apps/api (Hono) + apps/web (Next.js 15) + Prisma init + Clerk setup | — | pending |
| RM-001 | API: Authentication middleware (Clerk JWT) + health endpoint + user sync webhook | RM-000 | pending |
| RM-002 | Database: Full Prisma schema + migrations + pgvector extension + seed scripts | RM-000 | pending |
| RM-003 | Knowledge base seed: 29 pathologies + 20 remedies + mappings | RM-002 | pending |

## Phase 1: Core CRUD

| ID | Title | Depends On | Status |
|----|-------|-----------|--------|
| RM-004 | UC-003: Projects + Teams CRUD (API + Frontend) | RM-001, RM-002 | pending |
| RM-005 | UC-004: Document upload + storage (API + Frontend) | RM-004 | pending |
| RM-006 | Document processing pipeline: parse + chunk + embed + extract signals | RM-005, RM-003 | pending |
| RM-007 | UC-005: Survey templates + survey API + AI prefill from documents | RM-006 | pending |
| RM-008 | UC-011, UC-012: Pathology + Remedy knowledge base management (API + Frontend) | RM-003 | pending |

## Phase 2: Assessment Pipeline

| ID | Title | Depends On | Status |
|----|-------|-----------|--------|
| RM-009 | Scoring engine: deterministic scoring + evidence level computation | RM-003 | pending |
| RM-010 | Pipeline Steps 1–3: Survey analysis + Evidence analysis + Signal extraction | RM-007, RM-009 | pending |
| RM-011 | Pipeline Steps 4–5: Hypothesis generation + Confirmatory questions | RM-010 | pending |
| RM-012 | Pipeline Step 6: GS Opportunity mapping | RM-011 | pending |
| RM-013 | UC-006: Assessment trigger + status polling (API + Frontend) | RM-012 | pending |
| RM-014 | UC-007: Hypothesis review (confirm/discard/no-info/answer) + re-analysis | RM-013 | pending |

## Phase 3: Prescription + Report

| ID | Title | Depends On | Status |
|----|-------|-----------|--------|
| RM-015 | UC-008: Remedy prescription pipeline step + frontend | RM-014 | pending |
| RM-016 | UC-009: Report generation (JSON + web view + GS radar chart) | RM-015 | pending |
| RM-017 | PDF export via Puppeteer + Supabase Storage | RM-016 | pending |
| RM-018 | Shareable report link (public URL + public API endpoint) | RM-016 | pending |

## Phase 4: Funnel

| ID | Title | Depends On | Status |
|----|-------|-----------|--------|
| RM-019 | UC-001: Public mini-assessment (3 questions, no auth, score teaser) | RM-003 | pending |
| RM-020 | UC-002: Lead capture (email optional, MiniAssessmentLead) | RM-019 | pending |
| RM-021 | Landing page: hero + mini-assessment CTA + GS rubric visual | RM-019 | pending |
| RM-022 | Skool CTA + Workshop CTA (on report + score teaser) | RM-018, RM-021 | pending |

## Executable Sprint: Live Verification

> Complete all Phase 1–4 items before starting. Gate: Hurl + Playwright.

| ID | Title | Depends On | Status |
|----|-------|-----------|--------|
| EX-000 | Bring up: start server, confirm health endpoint | RM-022 | pending |
| EX-001 | Verify live: UC-001 Mini-assessment + score teaser | EX-000 | pending |
| EX-002 | Verify live: UC-003 Create project + team | EX-001 | pending |
| EX-003 | Verify live: UC-004 Upload + process document | EX-002 | pending |
| EX-004 | Verify live: UC-005 Survey + AI prefill | EX-003 | pending |
| EX-005 | Verify live: UC-006 Run assessment (full pipeline) | EX-004 | pending |
| EX-006 | Verify live: UC-007 Confirm hypotheses | EX-005 | pending |
| EX-007 | Verify live: UC-008 Prescribe remedies | EX-006 | pending |
| EX-008 | Verify live: UC-009 Generate report + PDF + share link | EX-007 | pending |

## Phase 5: Quality Hardening

| ID | Title | Depends On | Status |
|----|-------|-----------|--------|
| QA-001 | Mutation testing: ≥65% MSI on scoring engine | EX-008 | pending |
| QA-002 | Architecture audit: depcruise all layer rules pass | QA-001 | pending |
| QA-003 | Security: Clerk webhook signature enforcement + npm audit zero HIGH | QA-002 | pending |
| QA-004 | Performance: pipeline completes ≤3 min under load | QA-003 | pending |

---
_Generated: 2026-06-11_
_Spec: docs/PRD.md + docs/specs/SPEC-INDEX.md_
