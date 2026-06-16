import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { requireAuth, getCurrentUser } from '../middleware/auth.js'
import type { AssessmentService } from '../domain/assessment/assessment.service.js'
import { PaginationSchema } from '../lib/schemas/core.schemas.js'

export function assessmentRoutes(assessmentService: AssessmentService) {
  const app = new Hono()

  // GET /api/assessments/:id
  app.get('/:id', requireAuth, async (c) => {
    getCurrentUser(c)
    const assessment = await assessmentService.getAssessment(c.req.param('id'))
    return c.json(assessment)
  })

  // GET /api/assessments/:id/status
  app.get('/:id/status', requireAuth, async (c) => {
    getCurrentUser(c)
    const status = await assessmentService.getStatus(c.req.param('id'))
    return c.json(status)
  })

  // POST /api/assessments/:id/retry
  app.post('/:id/retry', requireAuth, async (c) => {
    getCurrentUser(c)
    const assessment = await assessmentService.retryAssessment(c.req.param('id'))
    return c.json(assessment)
  })

  // DELETE /api/assessments/:id
  app.delete('/:id', requireAuth, async (c) => {
    getCurrentUser(c)
    await assessmentService.deleteAssessment(c.req.param('id'))
    return c.body(null, 204)
  })

  return app
}

// Nested route for creating assessments: POST /api/teams/:teamId/assessments
export function teamAssessmentRoutes(assessmentService: AssessmentService) {
  const app = new Hono()

  app.get('/', requireAuth, zValidator('query', PaginationSchema), async (c) => {
    getCurrentUser(c)
    const teamId = c.req.param('teamId') ?? ''
    const { limit, offset } = c.req.valid('query')
    const result = await assessmentService.listAssessments(teamId, { limit, offset })
    return c.json(result)
  })

  app.post('/', requireAuth, async (c) => {
    getCurrentUser(c)
    const teamId = c.req.param('teamId') ?? ''
    const assessment = await assessmentService.createAssessment(teamId)
    return c.json(assessment, 201)
  })

  return app
}
