import type { PrismaClient, Team } from '@prisma/client'
import type { ITeamRepository, PaginatedResult, PaginationOpts } from '../../../domain/ports/repository.ports.js'
import type { CreateTeamDto } from '../../../lib/schemas/core.schemas.js'

export class TeamPrismaRepo implements ITeamRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Team | null> {
    return this.prisma.team.findUnique({ where: { id } })
  }

  async findByProjectId(projectId: string, opts?: PaginationOpts): Promise<PaginatedResult<Team>> {
    const limit = opts?.limit ?? 50
    const offset = opts?.offset ?? 0
    const [items, total] = await Promise.all([
      this.prisma.team.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.team.count({ where: { projectId } }),
    ])
    return { items, total, limit, offset }
  }

  async create(projectId: string, dto: CreateTeamDto): Promise<Team> {
    return this.prisma.team.create({
      data: { ...dto, projectId },
    })
  }

  async isMember(teamId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    })
    return member !== null
  }

  async delete(id: string): Promise<void> {
    await this.prisma.team.delete({ where: { id } })
  }
}
