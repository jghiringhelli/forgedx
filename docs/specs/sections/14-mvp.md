# Section 14 — MVP Scope

## 14.1 Constraints

The full spec describes the complete product vision. The MVP limits scope to deliver a **working, high-quality GS diagnostic** for a single team, plus the full funnel flow.

| Dimension | MVP Limit | Full Vision |
|-----------|-----------|-------------|
| Pathologies with scoring rules | 29 (all — see §13) | 29 (complete from white paper) |
| Remedies | 20 | 30+ (extended catalog) |
| Survey questions | 45 (7 GS properties) | 60+ (extended dimensions) |
| Document types | 6 (claudeMd, adr, spec, testFile, transcript, discovery) | + report, video transcripts |
| Assessment scope | Team-level only | Team + project + org |
| Emerging patterns | Flagged, not promotable in MVP | Promote to pathology DB |
| Assessment scopes | Team-level only | Project + org |
| Auth | Clerk (admin only, no self-service) | Self-service team registration |
| GitHub repo scanning | ❌ Phase 2 | Automated signal extraction from GitHub |
| Email sequences | ❌ Phase 2 | Post-assessment email drip |
| Analytics | ❌ Phase 2 | PostHog or equivalent |
| Stripe payments | ❌ Phase 2 | Premium report credits |
| Real-time pipeline progress | Polling (5s) | WebSocket with step-level progress |
| Light mode | ❌ | Theme toggle |

## 14.2 In Scope (MVP)

- Clerk auth (admin admin, Google/GitHub/email sign-in)
- Project + Team creation
- Team member management (optional)
- Document upload (CLAUDE.md, ADRs, specs, test files, transcripts, discovery docs)
- Document processing pipeline (parse → chunk → embed → extract signals)
- Scoped RAG retrieval via pgvector
- Survey with AI-prefill from uploaded documents (3-tier confidence)
- 8-step GS assessment pipeline (deterministic scoring + LLM narrative)
- All 29 pathologies scored
- Contradiction detection with source trust hierarchy
- Hypothesis review (confirm / discard / no-info / answer confirmatory questions)
- Evidence re-evaluation after user answers
- GS opportunity mapping (per-property)
- 20 GS remedies with pathology mappings
- AI remedy prescription from curated mappings + team context
- Treatment plan generation (phased: quick wins, core, transformation)
- Treatment plan view with accept/reject actions
- AI activity logging (all calls to ai_logs)
- Report generation (structured JSON — all sections)
- Report web view (GS radar chart with Recharts)
- PDF export via Puppeteer
- Shareable report link (public URL)
- Public mini-assessment (3 questions, no auth)
- Score teaser with top pathologies
- Email lead capture (optional email before auth)
- Skool course CTA on report
- Workshop booking CTA on report
- Dark mode UI (PragmaWorks design system, forge-orange accent)

## 14.3 Out of Scope (Post-MVP)

- GitHub repo auto-scanning (Phase 2 — most valuable improvement)
- Organization-level assessment (no team required)
- Multi-team project-level consolidation
- Promoting emerging patterns to official pathologies
- AI-generated new remedies
- Dynamic AI-generated survey questions
- Direct integrations (GitHub, Jira, Slack)
- Self-service client registration
- Role-based access (multiple user roles)
- Follow-up assessments and evolution tracking
- Cross-client benchmarking
- Stripe payments for premium reports
- Email drip sequences
- PostHog analytics
- Light mode toggle
- Signal normalization layer
- Temporal/longitudinal analysis
