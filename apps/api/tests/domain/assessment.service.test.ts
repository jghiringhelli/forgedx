import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AssessmentService } from '../../src/domain/assessment/assessment.service.js'
import type { IAssessmentRepository } from '../../src/domain/ports/repository.ports.js'
import type { Assessment } from '@prisma/client'
import { AssessmentNotFoundError, AssessmentAlreadyRunningError } from '../../src/lib/errors/domain-errors.js'

const makeAssessment = (overrides?: Partial<Assessment>): Assessment => ({
  id: 'asm-1',
  teamId: 'team-1',
  status: 'survey_pending',
  failureReason: null,
  failedAt: null,
  startedAt: null,
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const mockRepo: IAssessmentRepository = {
  findById: vi.fn(),
  findByTeamId: vi.fn(),
  create: vi.fn(),
  updateStatus: vi.fn(),
  resetStaleAnalyzing: vi.fn(),
  delete: vi.fn(),
}

describe('AssessmentService', () => {
  let service: AssessmentService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new AssessmentService(mockRepo)
  })

  it('createAssessment starts with status survey_pending', async () => {
    const expected = makeAssessment({ status: 'survey_pending' })
    vi.mocked(mockRepo.create).mockResolvedValue(expected)

    const result = await service.createAssessment('team-1')

    expect(result.status).toBe('survey_pending')
    expect(mockRepo.create).toHaveBeenCalledWith('team-1', {})
  })

  it('getAssessment throws AssessmentNotFoundError if missing', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)
    await expect(service.getAssessment('missing')).rejects.toThrow(AssessmentNotFoundError)
  })

  it('deleteAssessment throws if assessment is analyzing', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeAssessment({ status: 'analyzing' }))
    await expect(service.deleteAssessment('asm-1')).rejects.toThrow(AssessmentAlreadyRunningError)
  })

  it('retryAssessment resets failed assessment to evidence_pending', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeAssessment({ status: 'failed' }))
    const recovered = makeAssessment({ status: 'evidence_pending' })
    vi.mocked(mockRepo.updateStatus).mockResolvedValue(recovered)

    const result = await service.retryAssessment('asm-1')

    expect(result.status).toBe('evidence_pending')
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('asm-1', 'evidence_pending')
  })

  it('retryAssessment throws if not in failed state', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeAssessment({ status: 'analyzing' }))
    await expect(service.retryAssessment('asm-1')).rejects.toThrow('not in failed state')
  })

  it('recoverStaleAssessments logs count when assessments reset', async () => {
    vi.mocked(mockRepo.resetStaleAnalyzing).mockResolvedValue(3)
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await service.recoverStaleAssessments()

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Reset 3 stale'))
    consoleSpy.mockRestore()
  })
})
