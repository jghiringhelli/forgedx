import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProjectService } from '../../src/domain/assessment/project.service.js'
import type { IProjectRepository } from '../../src/domain/ports/repository.ports.js'
import type { Project } from '@prisma/client'

const makeProject = (overrides?: Partial<Project>): Project => ({
  id: 'proj-1',
  name: 'Test Project',
  clientName: 'Acme Corp',
  description: null,
  ownerId: 'user-1',
  orgId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const mockRepo: IProjectRepository = {
  findById: vi.fn(),
  findByOwnerId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

describe('ProjectService', () => {
  let service: ProjectService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ProjectService(mockRepo)
  })

  it('createProject returns project with correct ownerId', async () => {
    const dto = { name: 'My Project', clientName: 'Acme' }
    const expected = makeProject({ name: 'My Project', ownerId: 'user-42' })
    vi.mocked(mockRepo.create).mockResolvedValue(expected)

    const result = await service.createProject('user-42', dto)

    expect(result.ownerId).toBe('user-42')
    expect(mockRepo.create).toHaveBeenCalledWith('user-42', dto)
  })

  it('getProject throws if not found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)
    await expect(service.getProject('missing', 'user-1')).rejects.toThrow('not found')
  })

  it('getProject throws Unauthorized if wrong owner', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeProject({ ownerId: 'user-1' }))
    await expect(service.getProject('proj-1', 'user-99')).rejects.toThrow('Unauthorized')
  })

  it('deleteProject calls repo.delete after ownership check', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(makeProject({ ownerId: 'user-1' }))
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined)

    await service.deleteProject('proj-1', 'user-1')

    expect(mockRepo.delete).toHaveBeenCalledWith('proj-1')
  })
})
