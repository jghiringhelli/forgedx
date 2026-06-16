import type { Project, Team, Assessment } from '@prisma/client'
import type { CreateProjectDto, UpdateProjectDto, CreateTeamDto, CreateAssessmentDto } from '../../lib/schemas/core.schemas.js'

export type PaginationOpts = { limit?: number; offset?: number }
export type PaginatedResult<T> = { items: T[]; total: number; limit: number; offset: number }

// ============================================================
// Project port
// ============================================================
export interface IProjectRepository {
  findById(id: string): Promise<Project | null>
  findByOwnerId(ownerId: string, opts?: PaginationOpts): Promise<PaginatedResult<Project>>
  create(ownerId: string, dto: CreateProjectDto): Promise<Project>
  update(id: string, dto: UpdateProjectDto): Promise<Project>
  delete(id: string): Promise<void>
}

// ============================================================
// Team port
// ============================================================
export interface ITeamRepository {
  findById(id: string): Promise<Team | null>
  findByProjectId(projectId: string, opts?: PaginationOpts): Promise<PaginatedResult<Team>>
  create(projectId: string, dto: CreateTeamDto): Promise<Team>
  delete(id: string): Promise<void>
  isMember(teamId: string, userId: string): Promise<boolean>
}

// ============================================================
// Assessment port
// ============================================================
export interface IAssessmentRepository {
  findById(id: string): Promise<Assessment | null>
  findByTeamId(teamId: string, opts?: PaginationOpts): Promise<PaginatedResult<Assessment>>
  create(teamId: string, dto: CreateAssessmentDto): Promise<Assessment>
  updateStatus(id: string, status: Assessment['status'], extra?: Partial<Assessment>): Promise<Assessment>
  resetStaleAnalyzing(staleThreshold: Date): Promise<number>
  delete(id: string): Promise<void>
}
