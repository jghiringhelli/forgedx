# Frontend Standards — ForgeDX

## Next.js 15 App Router Conventions

- `async` server components by default — `await auth()` from Clerk
- Client components marked with `'use client'` only when needed (event handlers, hooks, state)
- Route params in Next.js 15 are **async**: `const { id } = await params`
- No `useEffect` for data fetching — all server state via TanStack Query hooks

## TanStack Query Pattern

```typescript
// hooks/use-assessment.ts — canonical hook structure
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { apiClient } from '@/lib/api-client'

export function useAssessment(assessmentId: string) {
  return useQuery({
    queryKey: queryKeys.assessment(assessmentId),
    queryFn: () => apiClient.get(`/assessments/${assessmentId}`),
    enabled: !!assessmentId,
  })
}

export function useRunAssessment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (teamId: string) => apiClient.post(`/teams/${teamId}/assessments`, {}),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.assessments() })
    },
  })
}
```

## Query Key Factory

```typescript
// lib/query-keys.ts — type-safe, no magic strings
export const queryKeys = {
  projects: () => ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  teams: (projectId: string) => ['projects', projectId, 'teams'] as const,
  assessment: (id: string) => ['assessments', id] as const,
  assessmentStatus: (id: string) => ['assessments', id, 'status'] as const,
  hypotheses: (assessmentId: string) => ['assessments', assessmentId, 'hypotheses'] as const,
  report: (id: string) => ['reports', id] as const,
}
```

## Component Structure

```typescript
// components/assessment/HypothesisCard.tsx
// - Props interface defined above component
// - No inline logic — extract to hooks
// - shadcn/ui primitives only in components/ui/
// - Domain components in components/assessment/, components/report/, etc.
```

## Assessment Status Polling

```typescript
// hooks/use-assessment.ts
useQuery({
  queryKey: queryKeys.assessmentStatus(assessmentId),
  queryFn: () => apiClient.get(`/assessments/${assessmentId}/status`),
  refetchInterval: (query) =>
    query.state.data?.status === 'analyzing' ? 5000 : false,
})
```

Stop polling when status leaves `analyzing`. Always clean up.

## Error + Loading States

Every data-fetching component handles three states:
1. `isPending` → render `<Skeleton />` (shadcn)
2. `isError` → render error card with retry button
3. `data` → render content

No silent failures. No "loading..." text — use Skeleton components.

## Clerk Auth in Client Components

```typescript
import { useAuth } from '@clerk/nextjs'
const { userId, getToken } = useAuth()
// Pass token to apiClient via interceptor — don't pass manually
```

In server components: `const { userId } = await auth()` (always await)

## Public vs Authenticated Routes

Public pages (`(public)/`): no Clerk imports, no auth checks
Authenticated pages (`(auth)/`): `auth().protect()` via Next.js middleware — no redundant checks needed in page components
