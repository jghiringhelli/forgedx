# Section 10 — Frontend Structure

## 10.1 Next.js 15 App Router Layout

```
apps/web/src/
  app/
    layout.tsx              — Root layout: ClerkProvider + theme setup
    (public)/               — Route group: no auth required
      layout.tsx            — Public layout (landing nav + footer)
      page.tsx              — Landing: hero, rubric visual, mini-assessment CTA
      gs-audit/
        page.tsx            — Mini-assessment: 3 questions
        results/
          page.tsx          — Score teaser: badge, blurred radar, CTAs
    (auth)/                 — Route group: Clerk-protected
      layout.tsx            — App shell: sidebar + header
      dashboard/
        page.tsx            — Projects list
      projects/
        new/
          page.tsx
        [id]/
          page.tsx
          teams/
            new/
              page.tsx
            [teamId]/
              page.tsx      — Team overview (documents, survey status, assessment)
              documents/
                page.tsx
              survey/
                page.tsx
              assessment/
                page.tsx    — Run + status polling
              hypotheses/
                page.tsx
              prescriptions/
                page.tsx
              report/
                page.tsx
      knowledge/
        pathologies/
          page.tsx
        remedies/
          page.tsx
    reports/
      [shareToken]/
        page.tsx            — Public shareable report (no auth)
    api/
      pdf-render/
        [reportId]/
          route.ts          — Standalone HTML for Puppeteer (no auth, uses shareToken param)
  components/
    ui/                     — shadcn/ui only (never customize, extend via composition)
    assessment/
      HypothesisCard.tsx    — Pathology name + severity + evidence level + actions
      GsScoreRadar.tsx      — Recharts RadarChart (7 GS properties)
      TreatmentPlanView.tsx — Phased remedy cards with accept/reject
      PropertyScoreBar.tsx  — Per-property score progress bar
    knowledge/
      PathologyCard.tsx
      RemedyCard.tsx
    report/
      ReportView.tsx        — Full interactive report
      PdfExportButton.tsx
      ShareReportButton.tsx
    funnel/
      MiniAssessmentForm.tsx
      ScoreTeaser.tsx       — Score badge + blurred radar + auth CTA
      SkoolCta.tsx          — Skool course CTA card
      WorkshopCta.tsx       — Workshop booking CTA card
    layout/
      AppSidebar.tsx
      AppHeader.tsx
  hooks/
    use-mini-assessment.ts
    use-projects.ts
    use-teams.ts
    use-documents.ts
    use-survey.ts
    use-assessment.ts
    use-hypotheses.ts
    use-prescriptions.ts
    use-report.ts
  lib/
    api-client.ts           — TanStack Query base (axios or fetch with JWT headers from Clerk)
    auth.ts                 — Clerk auth helpers + useAuth wrapper
    query-keys.ts           — TanStack Query key factory (type-safe)
    schemas/                — Zod schemas mirroring API response shapes
```

## 10.2 API Client Pattern

```typescript
// lib/api-client.ts
// Uses Clerk's getToken() to inject Bearer token on every request
// TanStack Query for all server state
// No manual loading/error state — handled by useQuery/useMutation
```

## 10.3 Assessment Status Polling

```typescript
// hooks/use-assessment.ts
const { data } = useQuery({
  queryKey: queryKeys.assessmentStatus(assessmentId),
  queryFn: () => apiClient.get(`/assessments/${assessmentId}/status`),
  refetchInterval: (query) => {
    const status = query.state.data?.status;
    return status === 'analyzing' ? 5000 : false; // poll every 5s while analyzing
  },
});
```

## 10.4 Page Contracts

Every page component has a clearly defined data contract:
- Receives route params via `params` prop (Next.js 15 async params)
- Loads its data via a TanStack Query hook (server state)
- Renders loading skeleton (shadcn Skeleton) while data is pending
- Renders error state with retry option on failure
- No direct `fetch` calls in page components — always via hooks

## 10.5 Funnel Page Behavior

**`/gs-audit` (Mini-assessment):**
- Loads 3 questions from `GET /api/funnel/questions`
- Local form state (no TanStack Query — one-time submission)
- On submit: `POST /api/funnel/submit` → redirect to `/gs-audit/results?leadId=xxx`
- No auth check (public route)

**`/gs-audit/results` (Score Teaser):**
- Reads `leadId` from URL query param
- Fetches lead data (score + topPathologies)
- Shows full GS score badge
- Shows 2 pathology names; details blurred with `blur-sm` + `pointer-events-none`
- Shows partial radar chart (3 of 7 axes visible, 4 blurred)
- "See full report →" button → Clerk sign-in → redirect to `/dashboard`
- Optional email capture form below score

**`/reports/:shareToken` (Public Report):**
- No Clerk auth
- Fetches from `GET /api/reports/:shareToken/public`
- Full report view (ReportView component, read-only mode)
- CTAs: Skool + Workshop prominent at top and bottom
