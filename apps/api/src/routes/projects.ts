import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { requireAuth, getCurrentUser } from '../middleware/auth.js'
import type { ProjectService } from '../domain/assessment/project.service.js'
import { CreateProjectSchema, PaginationSchema, UpdateProjectSchema } from '../lib/schemas/core.schemas.js'

export function projectRoutes(projectService: ProjectService) {
  const app = new Hono()

  app.get('/', requireAuth, zValidator('query', PaginationSchema), async (c) => {
    const { userId } = getCurrentUser(c)
    const { limit, offset } = c.req.valid('query')
    const result = await projectService.listProjects(userId, { limit, offset })
    return c.json(result)
  })

  app.post('/', requireAuth, zValidator('json', CreateProjectSchema), async (c) => {
    const { userId } = getCurrentUser(c)
    const dto = c.req.valid('json')
    const project = await projectService.createProject(userId, dto)
    return c.json(project, 201)
  })

  app.get('/:id', requireAuth, async (c) => {
    const { userId } = getCurrentUser(c)
    const project = await projectService.getProject(c.req.param('id'), userId)
    return c.json(project)
  })

  app.patch('/:id', requireAuth, zValidator('json', UpdateProjectSchema), async (c) => {
    const { userId } = getCurrentUser(c)
    const project = await projectService.updateProject(c.req.param('id'), userId, c.req.valid('json'))
    return c.json(project)
  })

  app.delete('/:id', requireAuth, async (c) => {
    const { userId } = getCurrentUser(c)
    await projectService.deleteProject(c.req.param('id'), userId)
    return c.body(null, 204)
  })

  return app
}
