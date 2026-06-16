// proxy.ts — Next.js 16 convention (replaces middleware.ts from Next.js 15)
// Runs on every route/prefetch. Only optimistic checks here — no DB access.
// See: node_modules/next/dist/docs/01-app/02-guides/authentication.md §Proxy

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/reports/(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/funnel/(.*)',
  '/api/health',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files per Next.js 16 proxy docs
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
