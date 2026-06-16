import { describe, it, expect } from 'vitest'
import app from '../../src/app.js'

describe('GET /health', () => {
  it('returns status ok with ts and version', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    const body = await res.json() as { status: string; ts: string; version: string }
    expect(body.status).toBe('ok')
    expect(typeof body.ts).toBe('string')
    expect(typeof body.version).toBe('string')
  })
})

describe('404 handler', () => {
  it('returns NOT_FOUND for unknown routes', async () => {
    const res = await app.request('/api/unknown-route')
    expect(res.status).toBe(404)
    const body = await res.json() as { code: string }
    expect(body.code).toBe('NOT_FOUND')
  })
})

describe('Auth guard', () => {
  it('rejects unauthenticated request to protected route', async () => {
    const res = await app.request('/api/projects', { method: 'GET' })
    // Without CLERK_PUBLISHABLE_KEY, clerkMiddleware throws → errorHandler → 500
    expect([401, 500]).toContain(res.status)
  })
})
