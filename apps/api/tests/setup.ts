import { vi } from 'vitest'

// Mock Prisma for all tests — no DATABASE_URL needed
vi.mock('../src/lib/prisma-client.js', () => ({
  prisma: {
    assessment: {
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    user: { upsert: vi.fn(), findUnique: vi.fn() },
    organization: { upsert: vi.fn(), findUnique: vi.fn() },
    organizationMember: { upsert: vi.fn() },
    project: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    team: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), create: vi.fn(), delete: vi.fn() },
    teamMember: { findUnique: vi.fn() },
  },
}))
