# ADR-002 — Hono over NestJS

**Date:** 2026-06-11
**Status:** Accepted
**Context:**
VairixDX (the reference implementation) uses NestJS for the API layer. ForgeDX must choose: inherit NestJS or switch to Hono.

**Decision:** Hono + Node.js.

**Rationale:**
1. **PragmaWorks standard.** forgecraft-server uses Hono. Consistency > novelty.
2. **Hexagonal architecture fit.** NestJS's decorator-driven DI couples the domain to the framework. Hono is a thin HTTP adapter — the domain stays pure TypeScript with no `@Injectable()` / `@Controller()` noise.
3. **Lighter weight.** Hono's startup time is <100ms vs NestJS ~2–5s. For Railway deployments this matters.
4. **Explicit over magic.** Hono forces explicit wiring. Every dependency is visible in `app.ts`. NestJS's module resolution is implicit and hard to trace for a stateless reader.
5. **Zod integration.** `@hono/zod-validator` is a first-class Hono middleware — schema validation at the boundary is idiomatic and enforced.

**Rejected alternatives:**
- NestJS: over-engineered for this use case; couples domain to framework via decorators; longer cold start
- Fastify: good option but not in current PragmaWorks toolchain
- Express: no built-in validation; more boilerplate

**Consequences:**
- ✅ Domain layer is 100% framework-free
- ✅ Explicit dependency wiring (easier to reason about for AI sessions)
- ⚠️ No DI container — wiring in `app.ts` grows as services are added; acceptable for this scale
- ⚠️ Guards/interceptors from NestJS must be implemented as Hono middleware — simpler but requires discipline
