# .claude/core.md — ForgeDX Core Invariants

> Load this file for EVERY task. These invariants are never overridden.

## Non-Negotiable Rules

1. **No `any` in TypeScript.** Ever. Use `unknown` and narrow, or define the type.
2. **Zod at every API boundary.** Every Hono route with a body uses `@hono/zod-validator`. Every Next.js API route validates inputs. No raw `JSON.parse`.
3. **Domain never imports infrastructure.** `domain/` has zero imports from `infrastructure/`. Domain depends only on `domain/ports/` interfaces.
4. **No OpenAI calls outside domain/pipeline/ or infrastructure/ai/.** If you find yourself calling OpenAI in a route handler, stop. Route calls service; service calls port; adapter calls OpenAI.
5. **No Prisma calls outside infrastructure/db/.** Domain uses repository port interfaces only.
6. **No feature ships without Hurl probe.** Every new endpoint must have a Hurl file under `tests/hurl/`. Gate 3 enforces this.
7. **No `feat:` commit without prior `test: [RED]`.** TDD is enforced by commit hook. Gate 2.
8. **Await auth() in Next.js 15.** `const { userId } = await auth()` — the async is mandatory.
9. **Anti-double-counting in scoring.** AI-prefilled survey answers (`ai_auto`, `ai_prefilled`) count as `document` source. Only `manual` survey answers count as independent `survey` source. This is the single most important scoring correctness rule.
10. **Assessment status transitions follow the state machine in §04-schema.md §4.5 exactly.** No status assignment outside `AssessmentService`.
11. **Domain vocabulary is enforced.** `pathology` not `disease`. `remedy` not `vitamin`. `assessment` not `diagnosis`. `gs_score` not `score`. Wrong names in code = spec violation.
12. **Stale status recovery.** On startup, reset any assessment stuck in `analyzing` for >10 minutes to `evidence_pending` with an error log.
13. **`findMany` calls must declare `orderBy`.** Gate 6 enforces this. No implicit ordering.
14. **Shareable report URL uses `shareToken` (UUID), never a sequential ID.** Public URLs must be unguessable.
15. **Clerk webhook must verify signature.** Use `svix` library to verify Clerk webhook signature before processing. Never trust unverified webhook bodies.

## Domain Vocabulary Reference

| Use | Never use |
|-----|----------|
| `pathology` | disease, issue, problem, finding |
| `remedy` | vitamin, recommendation, action, fix |
| `hypothesis` | suggestion, result, candidate |
| `assessment` | diagnosis, evaluation, analysis |
| `prescription` | recommendation |
| `survey` | form, quiz, questionnaire |
| `evidence_signal` | indicator, signal (short form ok in code) |
| `treatment_plan` | action plan |
| `gs_score` | score, rating, grade |

## Architecture Quick Reference

```
Allowed import directions:
  routes → domain → ports ← infrastructure
  routes → middleware (for auth/validation)
  
Forbidden:
  domain/* → infrastructure/*
  domain/* → openai (direct)
  domain/* → prisma (direct)
  routes/* → prisma (direct)
```
