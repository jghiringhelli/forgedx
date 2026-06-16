import type { Team } from '@prisma/client'
import type { ITeamRepository, PaginatedResult, PaginationOpts } from '../ports/repository.ports.js'
import type { CreateTeamDto } from '../../lib/schemas/core.schemas.js'
import { UnauthorizedError } from '../../lib/errors/domain-errors.js'

export class TeamService {
  constructor(private readonly teamRepo: ITeamRepository) {}

  async createTeam(projectId: string, dto: CreateTeamDto): Promise<Team> {
    return this.teamRepo.create(projectId, dto)
  }

  async getTeam(id: string): Promise<Team> {
    const team = await this.teamRepo.findById(id)
    if (!team) throw new Error(`Team ${id} not found`)
    return team
  }

  async listTeams(projectId: string, opts?: PaginationOpts): Promise<PaginatedResult<Team>> {
    return this.teamRepo.findByProjectId(projectId, opts)
  }

  async assertMember(teamId: string, userId: string): Promise<void> {
    const isMember = await this.teamRepo.isMember(teamId, userId)
    if (!isMember) throw new UnauthorizedError()
  }

  async deleteTeam(id: string): Promise<void> {
    return this.teamRepo.delete(id)
  }
}
