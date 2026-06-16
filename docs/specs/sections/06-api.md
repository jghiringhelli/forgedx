# Section 06 — API Contracts (Hono)

All endpoints prefixed `/api`. All return JSON. All require Clerk JWT except where noted. Request bodies validated with Zod at the route boundary.

## 6.1 Auth (2 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/auth/me` | ✅ | Get current user (from Clerk JWT + DB lookup) |
| POST | `/api/webhooks/clerk` | ❌ (Clerk sig) | Clerk webhook — user.created/updated |

## 6.2 Projects (5)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/projects` | ✅ | List all projects (with team count) |
| POST | `/api/projects` | ✅ | Create project |
| GET | `/api/projects/:id` | ✅ | Get project with teams |
| PATCH | `/api/projects/:id` | ✅ | Update project |
| DELETE | `/api/projects/:id` | ✅ | Delete project (cascades teams, assessments) |

**POST /api/projects body:**
```json
{ "name": "string", "clientName": "string", "description": "string?" }
```
**Response shape:** `{ id, name, clientName, description, status, createdAt }`

## 6.3 Teams (9)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/projects/:projectId/teams` | ✅ | List teams |
| POST | `/api/projects/:projectId/teams` | ✅ | Create team |
| GET | `/api/teams/:id` | ✅ | Get team detail with member count |
| PATCH | `/api/teams/:id` | ✅ | Update team |
| DELETE | `/api/teams/:id` | ✅ | Delete team (cascades) |
| GET | `/api/teams/:teamId/members` | ✅ | List team members |
| POST | `/api/teams/:teamId/members` | ✅ | Add team member |
| PATCH | `/api/team-members/:id` | ✅ | Update member |
| DELETE | `/api/team-members/:id` | ✅ | Delete member |

**POST /api/projects/:projectId/teams body:**
```json
{
  "name": "string",
  "size": "number",
  "techStack": "string[]",
  "aiToolsCurrent": "string[]",
  "methodology": "string?",
  "deploymentFrequency": "string?",
  "mainChallenges": "string?"
}
```
**Response shape:** `{ id, projectId, name, size, techStack, aiToolsCurrent, createdAt }`

## 6.4 Documents (8)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/teams/:teamId/documents` | ✅ | List team documents |
| POST | `/api/teams/:teamId/documents` | ✅ | Upload team document (multipart/form-data) |
| GET | `/api/projects/:projectId/documents` | ✅ | List org-level documents |
| POST | `/api/projects/:projectId/documents` | ✅ | Upload org-level document |
| GET | `/api/documents/:id` | ✅ | Get document detail with signals |
| DELETE | `/api/documents/:id` | ✅ | Delete document (cascades chunks) |
| POST | `/api/documents/:id/process` | ✅ | Trigger processing pipeline |
| GET | `/api/documents/:id/status` | ✅ | Check processing status |

**POST /api/teams/:teamId/documents — multipart fields:**
- `file`: the document file (PDF, TXT, MD, CSV — max 10MB)
- `type`: `DocumentType` enum value
- `name`: display name

**Response shape:** `{ id, name, type, status, storagePath, createdAt }`

## 6.5 Pathologies (8)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/pathologies` | ✅ | List pathologies (?category, ?gsProperty, ?search) |
| POST | `/api/pathologies` | ✅ | Create pathology |
| GET | `/api/pathologies/:id` | ✅ | Get pathology detail |
| PATCH | `/api/pathologies/:id` | ✅ | Update pathology |
| DELETE | `/api/pathologies/:id` | ✅ | Delete pathology |
| GET | `/api/pathologies/:id/remedies` | ✅ | Get linked remedies |
| POST | `/api/pathologies/:id/remedies` | ✅ | Link remedy to pathology |
| DELETE | `/api/pathologies/:id/remedies/:remedyId` | ✅ | Unlink remedy |

**Response shape (list item):** `{ id, name, slug, category, severity, gsProperties[], symptoms[], createdAt }`

## 6.6 Remedies (6)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/remedies` | ✅ | List remedies (?type, ?category, ?search) |
| POST | `/api/remedies` | ✅ | Create remedy |
| GET | `/api/remedies/:id` | ✅ | Get remedy with linked pathologies |
| PATCH | `/api/remedies/:id` | ✅ | Update remedy |
| DELETE | `/api/remedies/:id` | ✅ | Delete remedy |
| GET | `/api/remedies/:id/pathologies` | ✅ | Get pathologies this remedy addresses |

## 6.7 Surveys (6)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/survey-templates` | ✅ | List templates (?gsProperty, ?active) |
| POST | `/api/survey-templates` | ✅ | Create template |
| PATCH | `/api/survey-templates/:id` | ✅ | Update template |
| DELETE | `/api/survey-templates/:id` | ✅ | Delete template |
| GET | `/api/teams/:teamId/survey` | ✅ | Get survey for team (auto-creates assessment, includes AI prefill) |
| POST | `/api/teams/:teamId/survey` | ✅ | Submit survey responses |

**GET /api/teams/:teamId/survey response shape:**
```json
{
  "assessmentId": "uuid",
  "questions": [
    {
      "templateId": "uuid",
      "gsProperty": "self_describing",
      "dimension": "string",
      "question": "string",
      "questionType": "scale|boolean|text|multi_select",
      "prefill": { "answer": "...", "source": "ai_prefilled", "confidence": 0.82 }
    }
  ]
}
```

## 6.8 Assessments (6)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/teams/:teamId/assessments` | ✅ | Start team assessment (returns immediately, pipeline runs async) |
| POST | `/api/projects/:projectId/assessments` | ✅ | Start project-level assessment |
| POST | `/api/projects/:projectId/assessments/org` | ✅ | Start org-level assessment |
| GET | `/api/assessments/:id` | ✅ | Get assessment with hypotheses |
| GET | `/api/assessments/:id/status` | ✅ | Check pipeline status (poll every 5s) |
| POST | `/api/assessments/:id/reanalyze` | ✅ | Re-analyze after new evidence |

**POST /api/teams/:teamId/assessments response shape:**
```json
{ "assessmentId": "uuid", "status": "analyzing" }
```

**GET /api/assessments/:id/status response shape:**
```json
{
  "status": "analyzing | hypotheses_ready | failed",
  "progress": { "step": 3, "total": 8, "stepName": "Signal Extraction" },
  "error": null
}
```

## 6.9 Hypotheses (7)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/assessments/:assessmentId/hypotheses` | ✅ | List hypotheses with confirmatory questions |
| PATCH | `/api/hypotheses/:id/confirm` | ✅ | Confirm hypothesis |
| PATCH | `/api/hypotheses/:id/discard` | ✅ | Discard hypothesis |
| PATCH | `/api/hypotheses/:id/no-info` | ✅ | Mark no info available |
| POST | `/api/hypotheses/:id/what-to-confirm` | ✅ | Ask AI what evidence is needed |
| POST | `/api/hypotheses/:id/promote-pattern` | ✅ | Promote emerging pattern to pathology |
| POST | `/api/hypotheses/:id/answer` | ✅ | Answer confirmatory question |

## 6.10 GS Opportunity Map (1)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/assessments/:assessmentId/opportunity-map` | ✅ | Get GS opportunity map |

## 6.11 Prescriptions (3)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/assessments/:assessmentId/prescriptions` | ✅ | Get prescribed remedies |
| POST | `/api/assessments/:assessmentId/prescriptions/generate` | ✅ | Trigger AI prescription |
| PATCH | `/api/prescriptions/:id` | ✅ | Update prescription status |

## 6.12 Reports (4)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/assessments/:assessmentId/report` | ✅ | Generate report |
| GET | `/api/reports/:id` | ✅ | Get report content |
| GET | `/api/reports/:id/pdf` | ✅ | Download PDF |
| GET | `/api/reports/:shareToken/public` | ❌ | Public shareable report data |

## 6.13 AI Logs (2)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/assessments/:assessmentId/logs` | ✅ | Get AI logs for assessment |
| GET | `/api/ai-logs` | ✅ | List all logs (?projectId, ?stage, ?limit) |

## 6.14 Funnel (Public — 3)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/funnel/questions` | ❌ | Get 3 mini-assessment questions |
| POST | `/api/funnel/submit` | ❌ | Submit mini-assessment, get score + lead ID |
| POST | `/api/funnel/capture-lead` | ❌ | Associate email with mini-assessment lead |

**POST /api/funnel/submit body:**
```json
{ "sessionId": "uuid", "responses": [{ "questionId": "uuid", "answer": "..." }] }
```
**Response shape:**
```json
{
  "leadId": "uuid",
  "score": 4.5,
  "maxScore": 14,
  "topPathologies": ["Specification Debt", "ADR Absence", "Verification Gap"],
  "teaser": "Your team shows 3 critical GS pathologies. See your full report →"
}
```

**Total: 67 endpoints across 14 groups.**
