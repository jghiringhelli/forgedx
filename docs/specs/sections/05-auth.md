# Section 05 — Authentication

## 5.1 Auth Provider: Clerk

ForgeDX uses **Clerk** for authentication. This eliminates the custom JWT stack (no argon2, no token refresh logic, no session management) and aligns with the PragmaWorks ecosystem (forgecraft-web, forgecraft-server both use Clerk).

**Decision record:** ADR-003.

## 5.2 Auth Flow

1. **Login:** User visits `/login` or any protected route → redirected to Clerk-hosted sign-in
2. **Providers (MVP):** Google, GitHub, email/password (magic link)
3. **Session:** Clerk manages JWT; `@hono/clerk-auth` middleware validates on every API request
4. **User sync:** Clerk webhook `user.created` → `POST /api/webhooks/clerk` → creates `User` row in DB with `clerkId`
5. **No registration endpoint:** Admin users are created via the Clerk Dashboard or seed script in MVP

## 5.3 Hono API Auth Middleware

```typescript
// apps/api/src/middleware/auth.ts
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'

export const requireAuth = clerkMiddleware()

export const getCurrentUser = (c: Context): ClerkUser => {
  const auth = getAuth(c)
  if (!auth?.userId) throw new UnauthorizedError('Authentication required')
  return auth
}
```

Applied globally: all routes except `/api/health`, `/api/funnel/*`, `/api/reports/:shareToken/public`.

## 5.4 Next.js Middleware (Frontend Guard)

```typescript
// apps/web/src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/gs-audit(.*)',
  '/reports/:shareToken',
  '/api/(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
```

## 5.5 Protected vs Public Routes

| Route | Auth required? | Notes |
|-------|---------------|-------|
| `/` | ❌ | Landing page |
| `/gs-audit` | ❌ | Public mini-assessment |
| `/gs-audit/results` | ❌ | Score teaser (shows partial) |
| `/reports/:shareToken` | ❌ | Shareable report link |
| `/dashboard/*` | ✅ | Full platform (Clerk redirect) |
| `GET /api/health` | ❌ | Health check |
| `POST /api/funnel/*` | ❌ | Mini-assessment + lead capture |
| `GET /api/reports/:shareToken/public` | ❌ | Public report data |
| All other `/api/*` | ✅ | Clerk JWT required (401 if missing) |

## 5.6 Enforcement Rule

Every precondition "Actor is authenticated" requires **two** enforcement mechanisms:
1. **API-side:** `requireAuth` Hono middleware returns 401 without valid Clerk JWT
2. **Frontend-side:** Next.js middleware redirects to `/login` without valid Clerk session

A precondition without both named mechanisms is a **spec gap** — fix the spec before implementing.

## 5.7 Admin Seed

In MVP, admin users are seeded:
```typescript
// scripts/seed-admin.ts
// Creates a Clerk user via Clerk Admin API, then syncs to DB
```

No self-service registration in MVP scope. See `docs/specs/sections/14-mvp.md`.
