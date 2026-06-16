// Query key factory — type-safe, no magic strings
// Pattern: queryKeys.resource() → ['resource'], queryKeys.resource(id) → ['resource', id]

export const queryKeys = {
  projects: () => ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  teams: (projectId: string) => ['projects', projectId, 'teams'] as const,
  team: (id: string) => ['teams', id] as const,
  assessments: (teamId?: string) => teamId ? ['assessments', 'team', teamId] : ['assessments'] as const,
  assessment: (id: string) => ['assessments', id] as const,
  assessmentStatus: (id: string) => ['assessments', id, 'status'] as const,
  documents: (assessmentId: string) => ['assessments', assessmentId, 'documents'] as const,
  survey: (assessmentId: string) => ['assessments', assessmentId, 'survey'] as const,
  hypotheses: (assessmentId: string) => ['assessments', assessmentId, 'hypotheses'] as const,
  prescriptions: (assessmentId: string) => ['assessments', assessmentId, 'prescriptions'] as const,
  treatmentPlan: (assessmentId: string) => ['assessments', assessmentId, 'treatment-plan'] as const,
  report: (assessmentId: string) => ['assessments', assessmentId, 'report'] as const,
  sharedReport: (shareToken: string) => ['reports', shareToken] as const,
  pathologies: () => ['knowledge', 'pathologies'] as const,
  remedies: () => ['knowledge', 'remedies'] as const,
  miniAssessment: () => ['funnel', 'mini-assessment'] as const,
}
