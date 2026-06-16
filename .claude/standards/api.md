# API Standards — ForgeDX (Hono)

## Route Handler Pattern

Every Hono route handler follows this exact structure — no deviation:

```typescript
// routes/projects.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { requireAuth, getCurrentUser } from '../middleware/auth'
import type { ProjectService } from '../domain/assessment/project.service'
import { CreateProjectSchema } from '../lib/schemas/project.schema'

export function projectRoutes(projectService: ProjectService) {
  const app = new Hono()

  app.post('/', requireAuth, zValidator('json', CreateProjectSchema), async (c) => {
    const user = getCurrentUser(c)
    const body = c.req.valid('json')   // typed via zValidator — never c.req.json()
    const project = await projectService.createProject(user.userId, body)
    return c.json(project, 201)
  })

  app.get('/:id', requireAuth, async (c) => {
    const { id } = c.req.param()
    const project = await projectService.getProjectById(id)
    return c.json(project, 200)
  })

  return app
}
```

**Rule:** Never call `c.req.json()` directly. Always use `c.req.valid('json')` after `zValidator`.

## Zod Schema Conventions

```typescript
// lib/schemas/project.schema.ts
import { z } from 'zod'

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200),
  clientName: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
})

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>
```

All schemas in `apps/api/src/lib/schemas/`. Named `<Resource>Schema`.

## Error Response Shape

```typescript
// All error responses follow this shape:
{ "error": "Human-readable message", "code": "MACHINE_READABLE_CODE" }

// HTTP status mapping:
// 400 — validation error (Zod rejects input)
// 401 — unauthenticated (Clerk JWT missing/invalid)
// 403 — unauthorized (authenticated but wrong role/ownership)
// 404 — not found (AssessmentNotFoundError)
// 409 — conflict (AssessmentAlreadyRunningError)
// 422 — precondition failed (InsufficientEvidenceError)
// 500 — unexpected server error (logged, generic message to client)
```

## Auth Pattern

```typescript
import { requireAuth, getCurrentUser } from '../middleware/auth'

// Protected route:
app.post('/', requireAuth, async (c) => {
  const auth = getCurrentUser(c)  // throws UnauthorizedError if no auth
  // auth.userId is the Clerk user ID
})
```

`requireAuth` is the Clerk middleware — validates JWT, attaches auth context.
`getCurrentUser` extracts and validates the auth object — throws if missing.

## Async Error Handling

The global error middleware in `middleware/error.ts` catches all thrown errors.
Route handlers should catch domain errors and return typed responses:

```typescript
try {
  const result = await service.doSomething(id)
  return c.json(result, 200)
} catch (e) {
  if (e instanceof AssessmentNotFoundError) return c.json({ error: e.message }, 404)
  if (e instanceof AssessmentAlreadyRunningError) return c.json({ error: e.message }, 409)
  throw e  // let global handler catch unexpected errors
}
```

## Pagination

All list endpoints support optional `?limit` and `?offset` query params.
Default limit: 50. Maximum limit: 200.
Response includes: `{ items: T[], total: number, limit: number, offset: number }`
