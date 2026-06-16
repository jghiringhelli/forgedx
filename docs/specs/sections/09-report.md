# Section 09 — Report

## 9.1 Report JSON Structure

The report is a structured JSON object stored in `Report.content`. It is the single source of truth for both the web view and the PDF export.

```typescript
interface ReportContent {
  metadata: {
    teamName: string;
    projectName: string;
    generatedAt: string; // ISO 8601
    assessmentId: string;
  };
  executiveSummary: {
    gsScore: number;            // 0–14
    gsScoreLabel: string;       // "Developing" | "Progressing" | "Strong" | "Critical"
    narrative: string;          // 2–3 paragraph summary
    topPathologies: string[];   // top 3 confirmed pathology names
    priorityRemedy: string;     // single highest-leverage remedy
  };
  gsScorecard: {
    overall: number;            // 0–14
    propertyScores: {
      self_describing: number;  // 0–2
      bounded: number;
      verifiable: number;
      defended: number;
      auditable: number;
      composable: number;
      executable: number;
    };
    benchmarkContext: string;   // e.g. "Teams at this stage typically exhibit..."
  };
  pathologyFindings: Array<{
    pathologyId: string;
    name: string;
    severity: string;
    evidenceLevel: string;
    score: number;
    supportingEvidence: Array<{ excerpt: string; source: string; trustTier: number }>;
    remedies: string[];         // top 3 remedy names
    gsProperties: string[];
  }>;
  gsOpportunityMap: Array<{
    gsProperty: string;
    currentScore: number;       // 0–2
    expectedImpactOfImprovement: string; // "high" | "medium" | "low"
    effortToImplement: string;
    topRemedy: string;
    rationale: string;
  }>;
  treatmentPlan: {
    quickWins: TreatmentItem[];     // 0–30 days
    coreTreatment: TreatmentItem[]; // 1–3 months
    transformation: TreatmentItem[]; // 3–6 months
  };
  roadmap: Array<{
    month: number;
    milestone: string;
    gsPropertyTargeted: string;
    expectedScoreDelta: number;
  }>;
  callToAction: {
    skoolCourseUrl: string;     // env var: NEXT_PUBLIC_SKOOL_COURSE_URL
    workshopUrl: string;        // env var: NEXT_PUBLIC_WORKSHOP_URL
    shareToken: string;         // for shareable link
  };
}

interface TreatmentItem {
  remedyId: string;
  remedyName: string;
  pathologiesAddressed: string[];
  phase: string;
  effort: string;
  expectedImpact: string;
  implementationSteps: string[];
  status: 'proposed' | 'accepted' | 'rejected' | 'started' | 'completed';
}
```

## 9.2 PDF Export

**Flow:** `POST /api/assessments/:id/report` → generate JSON → `GET /api/reports/:id/render` (unauthenticated Next.js route) → Puppeteer screenshot → `page.pdf()` → store in Supabase Storage → return presigned URL

**Render endpoint:** `GET /app/api/pdf-render/:reportId` — standalone HTML page, no auth, uses report `shareToken` in query param for Puppeteer access.

**PDF layout (A4):**
1. Cover page: ForgeDX logo + team name + GS score hero + date
2. Executive summary (text)
3. GS Scorecard: 7-property radar chart + score table
4. Pathology Findings: cards per confirmed pathology
5. GS Opportunity Map: table with property × effort × impact
6. Treatment Plan: phased timeline cards
7. Roadmap: month-by-month milestones
8. Back cover: Skool CTA + Workshop CTA + pragmaworks.dev

**Puppeteer config:**
```typescript
const PDF_CONFIG = {
  format: 'A4',
  printBackground: true,
  margin: { top: '16mm', right: '14mm', bottom: '16mm', left: '14mm' },
  waitForSelector: '[data-pdf-ready="true"]', // Recharts SVG complete signal
}
```

## 9.3 Shareable Report

Every report has a unique `shareToken` (UUID). Public access at `/reports/:shareToken` (no auth).

- The public view shows the full report (all sections)
- No edit controls (confirm/discard, etc.)
- CTAs (Skool, Workshop) are prominent

**Security:** `shareToken` is an unpredictable UUID. No sequential IDs in public URLs. Revocation: delete the token (sets `Report.shareToken = null`).

## 9.4 Report Generation Prompt (Step 8 of Pipeline)

```
System: You are a Generative Specification expert. Generate a concise, evidence-based report 
narrative for a software development team based on their GS assessment results. 
Be direct. Use concrete observations from the evidence. 
Format all output as valid JSON matching the schema provided.

User: [assessment data: property scores, confirmed pathologies with evidence, team context]
```
