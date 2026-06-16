import type { Assessment } from '@prisma/client'
import type { IAssessmentRepository, PaginatedResult, PaginationOpts } from '../ports/repository.ports.js'
import { AssessmentNotFoundError, AssessmentAlreadyRunningError, AssessmentCompletedError } from '../../lib/errors/domain-errors.js'

export class AssessmentService {
  constructor(private readonly assessmentRepo: IAssessmentRepository) {}

  async createAssessment(teamId: string): Promise<Assessment> {
    return this.assessmentRepo.create(teamId, {})
  }

  async getAssessment(id: string): Promise<Assessment> {
    const a = await this.assessmentRepo.findById(id)
    if (!a) throw new AssessmentNotFoundError(id)
    return a
  }

  async listAssessments(teamId: string, opts?: PaginationOpts): Promise<PaginatedResult<Assessment>> {
    return this.assessmentRepo.findByTeamId(teamId, opts)
  }

  async getStatus(id: string): Promise<{ status: Assessment['status']; failureReason?: string | null }> {
    const a = await this.getAssessment(id)
    return { status: a.status, failureReason: a.failureReason }
  }

  async deleteAssessment(id: string): Promise<void> {
    const a = await this.getAssessment(id)
    if (a.status === 'analyzing') throw new AssessmentAlreadyRunningError(id)
    return this.assessmentRepo.delete(id)
  }

  async retryAssessment(id: string): Promise<Assessment> {
    const a = await this.getAssessment(id)
    if (a.status !== 'failed') {
      throw new Error(`Assessment ${id} is not in failed state`)
    }
    return this.assessmentRepo.updateStatus(id, 'evidence_pending')
  }

  // Called on server startup — recovers stale analyzing assessments
  async recoverStaleAssessments(): Promise<void> {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    const count = await this.assessmentRepo.resetStaleAnalyzing(tenMinutesAgo)
    if (count > 0) console.log(`[STARTUP] Reset ${count} stale assessments to evidence_pending`)
  }
}
