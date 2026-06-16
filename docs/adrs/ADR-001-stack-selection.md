# ADR-001 — Stack Selection

**Date:** 2026-06-11
**Status:** Accepted
**Context:**
ForgeDX needs a full-stack TypeScript platform: API backend, Next.js frontend, PostgreSQL with vector search, auth, and AI pipeline. Multiple framework options are available for the API layer.

**Decision:**
- **Backend:** Hono + Node.js (via `@hono/node-server`)
- **Frontend:** Next.js 15 App Router
- **Database:** PostgreSQL + pgvector via Supabase or Railway
- **ORM:** Prisma
- **Auth:** Clerk
- **Validation:** Zod at all boundaries
- **Testing:** Vitest + Hurl + Playwright
- **AI:** OpenAI API (GPT-4.1-mini + text-embedding-3-small)

**Rationale:**
This stack is the PragmaWorks standard (forgecraft-server uses Hono + Prisma; forgecraft-web uses Next.js + Clerk). Using the same stack across the ecosystem reduces cognitive overhead and enables shared tooling. Hono is lighter than NestJS, has no decorator magic, and aligns with the hexagonal architecture principle: the framework is an adapter, not a host.

**Consequences:**
- ✅ Consistent with PragmaWorks toolchain
- ✅ Hono's `@hono/zod-validator` enforces schema validation at the boundary
- ✅ Clerk eliminates the custom JWT surface area entirely
- ⚠️ Hono requires manual DI (no IoC container) — addressed by explicit wiring in `app.ts`
- ⚠️ Prisma raw SQL required for pgvector (`$queryRaw`) — documented in CLAUDE.md Known Pitfalls
