import { z } from 'zod'

// ============================================================
// Project schemas
// ============================================================
export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200),
  clientName: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
})
export type CreateProjectDto = z.infer<typeof CreateProjectSchema>

export const UpdateProjectSchema = CreateProjectSchema.partial()
export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>

// ============================================================
// Team schemas
// ============================================================
export const CreateTeamSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
})
export type CreateTeamDto = z.infer<typeof CreateTeamSchema>

// ============================================================
// Assessment schemas
// ============================================================
export const CreateAssessmentSchema = z.object({}).strict()
export type CreateAssessmentDto = z.infer<typeof CreateAssessmentSchema>

// ============================================================
// Pagination
// ============================================================
export const PaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})
export type PaginationDto = z.infer<typeof PaginationSchema>
