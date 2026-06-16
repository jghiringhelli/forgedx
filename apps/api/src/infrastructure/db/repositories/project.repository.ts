import type { PrismaClient, Project } from '@prisma/client'
import type { IProjectRepository, PaginatedResult, PaginationOpts } from '../../../domain/ports/repository.ports.js'
import type { CreateProjectDto, UpdateProjectDto } from '../../../lib/schemas/core.schemas.js'

export class ProjectPrismaRepo implements IProjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Project | null> {
    return this.prisma.project.findUnique({ where: { id } })
  }

  async findByOwnerId(ownerId: string, opts?: PaginationOpts): Promise<PaginatedResult<Project>> {
    const limit = opts?.limit ?? 50
    const offset = opts?.offset ?? 0
    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where: { ownerId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.project.count({ where: { ownerId } }),
    ])
    return { items, total, limit, offset }
  }

  async create(ownerId: string, dto: CreateProjectDto): Promise<Project> {
    return this.prisma.project.create({
      data: { ...dto, ownerId },
    })
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    return this.prisma.project.update({ where: { id }, data: dto })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } })
  }
}
