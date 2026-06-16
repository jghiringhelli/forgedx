import { Hono } from 'hono'
import { errorHandler } from './middleware/error.js'
import { healthRoute } from './routes/health.js'
import { webhookRoutes } from './routes/webhooks.js'
import { projectRoutes } from './routes/projects.js'
import { teamRoutes } from './routes/teams.js'
import { assessmentRoutes, teamAssessmentRoutes } from './routes/assessments.js'
import { ProjectService } from './domain/assessment/project.service.js'
import { TeamService } from './domain/assessment/team.service.js'
import { AssessmentService } from './domain/assessment/assessment.service.js'
import { ProjectPrismaRepo } from './infrastructure/db/repositories/project.repository.js'
import { TeamPrismaRepo } from './infrastructure/db/repositories/team.repository.js'
import { AssessmentPrismaRepo } from './infrastructure/db/repositories/assessment.repository.js'
import { prisma } from './lib/prisma-client.js'

// ============================================================
// Explicit DI wiring (no framework)
// ============================================================
const projectRepo = new ProjectPrismaRepo(prisma)
const teamRepo = new TeamPrismaRepo(prisma)
const assessmentRepo = new AssessmentPrismaRepo(prisma)

const projectService = new ProjectService(projectRepo)
const teamService = new TeamService(teamRepo)
const assessmentService = new AssessmentService(assessmentRepo)

// ============================================================
// Startup recovery — reset stale assessments
// ============================================================
assessmentService.recoverStaleAssessments().catch((err) => {
  console.error('[STARTUP] Failed to recover stale assessments:', err)
})

// ============================================================
// App
// ============================================================
const app = new Hono()

app.onError((err, c) => errorHandler(err, c))
app.notFound((c) => c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404))

// Public routes
app.route('/health', healthRoute)
app.route('/webhooks', webhookRoutes(prisma))

// Protected API routes
app.route('/api/projects', projectRoutes(projectService))
app.route('/api/projects/:projectId/teams', teamRoutes(teamService))
app.route('/api/teams/:teamId/assessments', teamAssessmentRoutes(assessmentService))
app.route('/api/assessments', assessmentRoutes(assessmentService))

export default app

// Server bootstrap is in index.ts to keep app.ts importable in tests


