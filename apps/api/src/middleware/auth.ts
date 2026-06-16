import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import type { Context, MiddlewareHandler, Next } from 'hono'
import { UnauthorizedError } from '../lib/errors/domain-errors.js'

// Clerk JWT validation middleware
// Usage: app.use(requireAuth) on any protected route
export const requireAuth: MiddlewareHandler = clerkMiddleware()

// Extract and validate auth object from context
// Throws UnauthorizedError if missing — caught by global error handler
export function getCurrentUser(c: Context): { userId: string; orgId: string | null } {
  const auth = getAuth(c)
  if (!auth?.userId) throw new UnauthorizedError()
  return { userId: auth.userId, orgId: auth.orgId ?? null }
}

// Org membership guard — verifies orgId in auth matches requested resource org
export function requireOrgMember(c: Context, orgId: string): { userId: string; orgId: string } {
  const auth = getCurrentUser(c)
  if (auth.orgId !== orgId) throw new UnauthorizedError()
  return { userId: auth.userId, orgId }
}

