# Section 11 — Funnel Design

## 11.1 Funnel Purpose

ForgeDX is the **primary top-of-funnel** for:
1. **PragmaWorks Skool course** on Generative Specification (skool.com/pragmaworks)
2. **In-person GS workshops** (pragmaworks.dev/workshops)

Every user interaction is designed to create value (real diagnostic insight) while creating a natural handoff to the paid offerings.

## 11.2 Funnel Flow

```
1. LANDING (public, no auth)
   pragmaworks.dev/gs-audit OR app.forgedx.dev
   - Hero: "Find out how GS-ready your team is" + GS rubric visual
   - Social proof: DX study stats (58 developers, 116 submissions)
   - Mini-assessment CTA: "Take the free 3-minute assessment →"

2. MINI-ASSESSMENT (public, no auth)
   /gs-audit
   - 3 carefully chosen questions covering Self-describing, Defended, Executable
   - Each question is a scale (1–5) with 1-sentence context
   - No email required
   - "Calculating your GS score..." animation (1.5s)

3. SCORE TEASER (public, no auth)
   /gs-audit/results?leadId=xxx
   - Shows: "Your estimated GS score: X/14" with colored badge
   - Shows: top 2 pathology names (teased, blurred details)
   - Shows: radar chart with 3 of 7 axes visible (4 blurred)
   - CTA: "See your full GS diagnostic report →" → Clerk sign-in
   - Secondary: "Book a workshop instead" → calendly/workshop link

4. AUTH GATE (Clerk)
   → Sign in with Google / GitHub / email
   → On success: redirect to /dashboard (existing assessment shown) OR /projects/new

5. FULL ASSESSMENT (authenticated)
   - Upload GS documents: CLAUDE.md, ADRs, spec files, test files
   - Complete 45-question survey (AI-prefilled from documents)
   - Run full 8-step pipeline (~2–3 min)

6. FULL REPORT (authenticated + shareable)
   - Interactive report with all 7 property scores
   - Confirmed pathologies with evidence
   - Treatment plan with phased remedies

7. CTAs (throughout report)
   ┌─────────────────────────────────────────────────────────┐
   │ 🎓 Master Generative Specification                      │
   │ Join 200+ developers in the PragmaWorks Skool course.   │
   │ 6 weeks. Self-paced. Build your first GS-compliant      │
   │ system from scratch.                                    │
   │ [Enroll Now — $XXX] → skool.com/pragmaworks             │
   └─────────────────────────────────────────────────────────┘
   ┌─────────────────────────────────────────────────────────┐
   │ 🔨 In-Person GS Workshop                               │
   │ Apply GS directly to YOUR codebase in a 1-day workshop. │
   │ Led by Juan Carlos Ghiringhelli. Max 8 participants.    │
   │ [Book a Workshop →] → pragmaworks.dev/workshops         │
   └─────────────────────────────────────────────────────────┘
```

## 11.3 Mini-Assessment Questions (3)

These 3 questions are chosen to produce a meaningful score signal with minimal friction.

| # | GS Property | Question | Type |
|---|-------------|----------|------|
| 1 | Self-describing | "Does your team maintain a CLAUDE.md, README, or equivalent navigation root that a new developer (or AI) could use to understand the entire codebase structure in under 5 minutes?" | Scale 1–5 |
| 2 | Defended | "Do you have automated pre-commit or CI gates that block code that violates architectural rules (e.g., layer boundaries, naming conventions, forbidden patterns)?" | Scale 1–5 |
| 3 | Executable | "Are your API behavioral contracts expressed as runnable tests (Hurl probes, Postman collections, contract tests) that run against your deployed system?" | Scale 1–5 |

Mini-score formula: `SUM(3 answers) / 15 * 14` → maps 3–15 to 0–14 range.

Teaser shows the estimated overall score and the 2 pathologies most likely associated with the 2 lowest-scoring questions.

## 11.4 Lead Capture

```typescript
// After score teaser is shown
POST /api/funnel/capture-lead
{ "leadId": "uuid", "email": "user@company.com" }
// Lead is stored in MiniAssessmentLead.email
// Optional: trigger email sequence (future)
```

**When to show the email capture form:**
- After the score teaser, BEFORE the Clerk auth gate
- Framing: "Get your full report emailed to you" (optional)
- This captures leads who don't complete auth

## 11.5 Shareable Report CTAs

Every report has a **"Share your report"** button:
```
/reports/:shareToken
```
- Copy-to-clipboard link
- Share on LinkedIn (pre-filled text: "We just scored our team's GS readiness: X/14. Here's what we found:")
- The public report shows CTAs prominently (Skool + Workshop)

**Virality mechanic:** Teams share their GS score → their network sees the tool → more assessments → more Skool enrollments.

## 11.6 Environment Variables for Funnel

```bash
NEXT_PUBLIC_SKOOL_COURSE_URL=https://skool.com/pragmaworks
NEXT_PUBLIC_WORKSHOP_URL=https://pragmaworks.dev/workshops
NEXT_PUBLIC_WORKSHOP_BOOKING_URL=https://cal.com/pragmaworks/gs-workshop
```

## 11.7 Analytics Events (Future)

| Event | Trigger | Purpose |
|-------|---------|---------|
| `mini_assessment_started` | User opens /gs-audit | Top-of-funnel measure |
| `mini_assessment_completed` | Score teaser shown | Conversion rate |
| `lead_email_captured` | Email submitted | Lead quality |
| `auth_completed` | Clerk sign-in complete | Auth conversion |
| `full_assessment_started` | Pipeline triggered | Activation |
| `report_viewed` | Report page loaded | Completion |
| `skool_cta_clicked` | Skool button clicked | Revenue conversion |
| `workshop_cta_clicked` | Workshop button clicked | Revenue conversion |
| `report_shared` | Share link copied | Virality |
