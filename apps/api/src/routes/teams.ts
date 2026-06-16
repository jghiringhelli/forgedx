import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { requireAuth, getCurrentUser } from '../middleware/auth.js'
import type { TeamService } from '../domain/assessment/team.service.js'
import { CreateTeamSchema, PaginationSchema } from '../lib/schemas/core.schemas.js'

export function teamRoutes(teamService: TeamService) {
  const app = new Hono()

  // Teams are nested under projects in the URL: /projects/:projectId/teams
  // This router is mounted at /api/projects/:projectId/teams
  app.get('/', requireAuth, zValidator('query', PaginationSchema), async (c) => {
    getCurrentUser(c)
    const projectId = c.req.param('projectId') ?? ''
    const { limit, offset } = c.req.valid('query')
    const result = await teamService.listTeams(projectId, { limit, offset })
    return c.json(result)
  })

  app.post('/', requireAuth, zValidator('json', CreateTeamSchema), async (c) => {
    getCurrentUser(c)
    const projectId = c.req.param('projectId') ?? ''
    const team = await teamService.createTeam(projectId, c.req.valid('json'))
    return c.json(team, 201)
  })

  app.get('/:teamId', requireAuth, async (c) => {
    getCurrentUser(c)
    const team = await teamService.getTeam(c.req.param('teamId'))
    return c.json(team)
  })

  app.delete('/:teamId', requireAuth, async (c) => {
    getCurrentUser(c)
    await teamService.deleteTeam(c.req.param('teamId'))
    return c.body(null, 204)
  })

  return app
}
