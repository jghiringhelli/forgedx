import type { PrismaClient, Assessment } from '@prisma/client'
import type { IAssessmentRepository, PaginatedResult, PaginationOpts } from '../../../domain/ports/repository.ports.js'
import type { CreateAssessmentDto } from '../../../lib/schemas/core.schemas.js'

export class AssessmentPrismaRepo implements IAssessmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Assessment | null> {
    return this.prisma.assessment.findUnique({ where: { id } })
  }

  async findByTeamId(teamId: string, opts?: PaginationOpts): Promise<PaginatedResult<Assessment>> {
    const limit = opts?.limit ?? 50
    const offset = opts?.offset ?? 0
    const [items, total] = await Promise.all([
      this.prisma.assessment.findMany({
        where: { teamId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.assessment.count({ where: { teamId } }),
    ])
    return { items, total, limit, offset }
  }

  async create(teamId: string, _dto: CreateAssessmentDto): Promise<Assessment> {
    return this.prisma.assessment.create({
      data: { teamId, status: 'survey_pending' },
    })
  }

  async updateStatus(
    id: string,
    status: Assessment['status'],
    extra?: Partial<Assessment>,
  ): Promise<Assessment> {
    return this.prisma.assessment.update({
      where: { id },
      data: { status, ...extra },
    })
  }

  async resetStaleAnalyzing(staleThreshold: Date): Promise<number> {
    const result = await this.prisma.assessment.updateMany({
      where: {
        status: 'analyzing',
        updatedAt: { lt: staleThreshold },
      },
      data: { status: 'evidence_pending' },
    })
    return result.count
  }

  async delete(id: string): Promise<void> {
    await this.prisma.assessment.delete({ where: { id } })
  }
}
