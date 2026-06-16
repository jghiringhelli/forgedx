# Section 01 — Project Identity

## 1.1 What ForgeDX Is

ForgeDX is a **Generative Specification readiness diagnostic platform**. It diagnoses software development teams on their GS adoption maturity, identifies the specific GS pathologies they exhibit, prescribes the GS practices (remedies) that address those pathologies, and delivers a phased adoption treatment plan.

The platform follows the medical diagnostic methodology: **general survey → hypothesis generation → confirmatory analysis → diagnosis → prescription → treatment plan → report**. This methodology is the same as used in VairixDX (the reference implementation), applied to the GS discipline domain.

The primary output is a **GS report** that a CTO or engineering consultant can share with their team or client. The secondary output is **a qualified lead** who proceeds to enroll in the PragmaWorks Skool course or book an in-person GS workshop.

## 1.2 The GS Rubric as Primary Domain Object

The GS rubric (from the white paper) is a first-class domain concept in ForgeDX:

| Property | What it removes | Score (0–2) |
|----------|----------------|-------------|
| Self-describing | Hidden purpose — reader must infer what the system is | 0/1/2 |
| Bounded | Unbounded surface — reader must scan everything | 0/1/2 |
| Verifiable | Unchecked correctness — "it compiles" mistaken for "it works" | 0/1/2 |
| Defended | Advisory rules the model treats as optional | 0/1/2 |
| Auditable | Lost rationale — intentional decisions look like debt | 0/1/2 |
| Composable | Tangled coupling that cannot recombine | 0/1/2 |
| Executable | Specifications never run against reality | 0/1/2 |

**Total: 0–14 points.** The assessment computes a per-property score and an overall `gs_score`.

## 1.3 Medical Metaphor — Domain Vocabulary

| Medical term | GS domain term | Definition |
|---|---|---|
| disease | `pathology` | A diagnosed GS failure mode (e.g., Architectural Drift) |
| vitamin | `remedy` | A prescribed GS practice or tool (e.g., ADR Practice) |
| hypothesis | `hypothesis` | An AI-generated diagnostic candidate for a pathology |
| diagnosis | `assessment` | The full evaluation of a team's GS readiness |
| prescription | `prescription` | A remedy assigned to a confirmed assessment |
| survey | `survey` | The structured GS questionnaire |
| signal | `evidence_signal` | An extracted data point from documents or survey |
| treatment plan | `treatment_plan` | The phased GS adoption roadmap |

**These are the only allowed names** in code, DB, tests, and documentation. See CLAUDE.md § Domain Vocabulary.

## 1.4 The 29 GS Pathologies

These are the "diseases" of the ForgeDX knowledge base, derived from the GS white paper's 29 named pathologies. See `docs/specs/sections/13-knowledge-base.md` for the full catalog with scoring rules.

| ID | Pathology Name | GS Property | Severity |
|----|---------------|-------------|----------|
| P-001 | Architectural Drift | All | critical |
| P-002 | Session Amnesia | Self-describing, Auditable | high |
| P-003 | Implicit Contract Syndrome | Self-describing, Composable | high |
| P-004 | Specification Debt | All | critical |
| P-005 | Context Overload | Bounded | high |
| P-006 | Verification Gap | Verifiable | high |
| P-007 | Rationale Loss | Auditable | medium |
| P-008 | Layer Violation | Composable, Defended | high |
| P-009 | Naming Anarchy | Self-describing | medium |
| P-010 | Test Surface Blindness | Verifiable | high |
| P-011 | ADR Absence | Auditable | medium |
| P-012 | Contract Drift | Executable, Verifiable | high |
| P-013 | Unchecked Generation | Defended, Verifiable | critical |
| P-014 | Silent Assumption | Self-describing, Defended | high |
| P-015 | Stale Specification | All | high |
| P-016 | Boundary Leak | Bounded, Composable | high |
| P-017 | Duplicate Knowledge | Bounded | medium |
| P-018 | Dead Code Accumulation | Bounded | low |
| P-019 | Emerging Pattern Blindness | Auditable | medium |
| P-020 | Manual Gate Decay | Defended | high |
| P-021 | Token Bloat | Bounded | medium |
| P-022 | Domain Language Drift | Self-describing | medium |
| P-023 | Execution Gap | Executable | high |
| P-024 | Phase Collapse Failure | All | critical |
| P-025 | Composability Breakdown | Composable | high |
| P-026 | Confidence Inflation | Verifiable, Defended | critical |
| P-027 | Monolith Specification | Bounded, Self-describing | high |
| P-028 | Missing Enforcement | Defended | high |
| P-029 | Retrospective Documentation | Auditable, Executable | medium |

## 1.5 Domain Context Boundaries

ForgeDX is bounded by three concerns:
1. **Assessment domain** — projects, teams, surveys, hypotheses, prescriptions, treatment plans
2. **Knowledge domain** — pathologies, remedies, scoring rules, seed data
3. **Funnel domain** — public mini-assessment, lead capture, Skool CTA, shareable reports

These are implemented as separate module directories in `apps/api/src/domain/`. No cross-domain direct imports — communicate through service interfaces only.

## 1.6 What ForgeDX Is NOT

- Not a general AI maturity tool (that is VairixDX)
- Not a project management tool
- Not a code scanner (GitHub repo scanning is a Phase 2 feature)
- Not a multi-tenant SaaS (MVP is single-admin, single-org)
- Not a replacement for in-person GS workshops — it is the funnel TO them
