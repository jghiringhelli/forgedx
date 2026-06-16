import type { Project } from '@prisma/client'
import type { IProjectRepository, PaginatedResult, PaginationOpts } from '../ports/repository.ports.js'
import type { CreateProjectDto, UpdateProjectDto } from '../../lib/schemas/core.schemas.js'

export class ProjectService {
  constructor(private readonly projectRepo: IProjectRepository) {}

  async createProject(ownerId: string, dto: CreateProjectDto): Promise<Project> {
    return this.projectRepo.create(ownerId, dto)
  }

  async getProject(id: string, requesterId: string): Promise<Project> {
    const project = await this.projectRepo.findById(id)
    if (!project) throw new Error(`Project ${id} not found`)
    if (project.ownerId !== requesterId) throw new Error('Unauthorized')
    return project
  }

  async listProjects(ownerId: string, opts?: PaginationOpts): Promise<PaginatedResult<Project>> {
    return this.projectRepo.findByOwnerId(ownerId, opts)
  }

  async updateProject(id: string, requesterId: string, dto: UpdateProjectDto): Promise<Project> {
    await this.getProject(id, requesterId) // ownership check
    return this.projectRepo.update(id, dto)
  }

  async deleteProject(id: string, requesterId: string): Promise<void> {
    await this.getProject(id, requesterId) // ownership check
    return this.projectRepo.delete(id)
  }
}
