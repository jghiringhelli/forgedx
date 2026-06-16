# ADR-003 — Clerk for Authentication

**Date:** 2026-06-11
**Status:** Accepted
**Context:**
VairixDX implements custom JWT auth (argon2id hashing, manual token storage, dual cookie/localStorage strategy). This is ~500 lines of auth code that represents an attack surface and a maintenance burden.

**Decision:** Clerk for all authentication.

**Rationale:**
1. **PragmaWorks standard.** forgecraft-web and forgecraft-server both use Clerk. Consistent auth story across the ecosystem.
2. **Eliminates auth surface area.** No password hashing, no token refresh logic, no session management, no registration flow to implement or secure.
3. **Social auth out of the box.** Google, GitHub, and email magic link without additional configuration.
4. **Clerk-Hono integration.** `@hono/clerk-auth` is a first-class middleware that validates Clerk JWTs in one line.
5. **Next.js 15 integration.** `@clerk/nextjs` provides `clerkMiddleware()` for App Router route protection with `auth().protect()`.

**Consequences:**
- ✅ Eliminates ~500 lines of custom auth code
- ✅ Social auth (Google, GitHub) without OAuth implementation
- ✅ Webhook-based user sync to DB on Clerk events
- ⚠️ Dependency on third-party auth provider (acceptable — Clerk is reliable and SLA-backed)
- ⚠️ `await auth()` is required (async) in Next.js 15 — documented in Known Pitfalls
- ⚠️ MVP has no self-service registration — admin users created via Clerk Dashboard or seed
