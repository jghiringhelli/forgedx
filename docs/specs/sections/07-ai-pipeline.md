# Section 07 — AI Pipeline

## 7.1 Overview

The GS assessment pipeline is an **8-step sequential process** orchestrated by `PipelineService`. It runs as a background async operation after `POST /api/teams/:teamId/assessments`. Each step is a separate module in `domain/pipeline/steps/`. Frontend polls `/api/assessments/:id/status` every 5 seconds.

```
Step 1: Survey Analysis       → dimension scores, initial GS property scores
Step 2: Evidence Analysis     → contradiction detection, signal map from documents
Step 3: Signal Extraction     → extract GS-specific signals per pathology category
Step 4: Hypothesis Generation → hybrid scoring engine generates ranked hypotheses
Step 5: Confirmatory Questions → AI generates 2–3 confirmation questions per hypothesis
Step 6: GS Opportunity Mapping → evaluate each SDLC area for GS adoption gaps
Step 7: (deferred to manual)  → user confirms/discards hypotheses
Step 8: Remedy Prescription   → triggered by POST /prescriptions/generate (not auto)
Step 9: Report Generation     → triggered by POST /reports (not auto)
```

Steps 1–6 run automatically after assessment start. Steps 8–9 are user-triggered.

## 7.2 Step Contracts

### Step 1: Survey Analysis
**Input:** Survey responses for the team (from `SurveyResponse` table)
**LLM task:** Generate narrative summary per GS property (2–3 sentences each)
**Engine task:** Compute per-property score from scale responses (0.0–2.0)
**Output:** `{ propertyScores: { self_describing: 1.5, bounded: 0.5, ... }, narratives: {...}, initialSignals: string[] }`

**Property score formula:**
```
propertyScore = AVG(scale responses for that property) / 5 * 2
// Scale questions: 1–5 → maps to 0–2
// Boolean questions: yes=2, no=0, partial=1
```

**Overall GS score:** `SUM(all propertyScores)` → 0.0–14.0

### Step 2: Evidence Analysis
**Input:** Initial signals from Step 1 + all processed documents for the team
**RAG queries:** 1 per initial signal using semantic search against document chunks
**LLM task:** Analyze retrieved chunks for corroborating or contradicting evidence
**Output:** `{ contradictions: [...], evidenceMap: { signal: chunks[] }, documentSignals: string[] }`

**Contradiction detection:** Source trust hierarchy: `spec document > CLAUDE.md > ADR > test file > transcript`
If a signal from a higher-trust source contradicts a lower-trust source, flag as contradiction.

### Step 3: Signal Extraction
**Input:** Evidence map from Step 2 + full pathology catalog with symptoms
**RAG queries:** 2 batches — one per pathology category (spec_discipline, quality_enforcement, context_management, change_governance)
**LLM task:** For each pathology category, extract which signal IDs are present in the team's evidence
**Output:** `{ extractedSignals: { pathologyId: signalId[] }[] }`

**Constraint:** LLM extracts signal IDs only (from the pathology's `scoringRules.signals` list) — it does NOT score. Scoring is deterministic.

### Step 4: Hypothesis Generation (Hybrid Scoring Engine)
**Input:** Extracted signals from Step 3 (+ survey signals from Step 1)
**Engine task (deterministic):**
```
For each pathology:
  score = SUM(matched_signal.weight * 100 + matched_signal.source_bonus[source] * 100)
  evidenceLevel = determine_level(score, source_diversity, thresholds)
  
Include hypothesis if score >= threshold_weak
```
**LLM task:** Generate explanatory narrative per hypothesis (2–3 sentences)
**Output:** `Hypothesis[]` ranked by computed score

### Step 5: Confirmatory Questions
**Input:** All generated hypotheses with supporting evidence
**LLM task:** For each hypothesis with score in `[threshold_moderate, threshold_corroborated)`, generate 2–3 targeted confirmatory questions the user can answer to move evidence level up or down
**Output:** `ConfirmatoryQuestion[]` per hypothesis

### Step 6: GS Opportunity Mapping
**Input:** Team context (tech stack, methodology, current AI tools) + survey property scores
**RAG queries:** 1 per GS property area (7 queries)
**LLM task:** For each of the 7 GS properties, evaluate: current adoption level, expected improvement impact, estimated implementation effort
**Output:** `GsOpportunityMap[]` — one entry per property with adoption gap narrative

## 7.3 LLM Configuration

```typescript
const LLM_CONFIG = {
  model: 'gpt-4.1-mini',
  temperature: 0,
  response_format: { type: 'json_object' } // structured outputs
}
```

All prompts use structured JSON output. No free-text responses. Prompt templates live in `domain/pipeline/prompts/`.

## 7.4 Error Semantics

| Error | Assessment status | Recovery |
|-------|------------------|----------|
| OpenAI API timeout (>60s) | `failed` | Retry via `POST /assessments/:id/reanalyze` |
| OpenAI API 429 (rate limit) | `failed` | Retry with exponential backoff (3 attempts) |
| Step partial failure | `failed` + step logged | Retry reruns from failed step |
| Signal extraction returns empty | Continue — score = 0, evidence = weak | No retry needed |

**Stale status recovery:** `onStartup` resets any assessment stuck in `analyzing` for >10 minutes back to `evidence_pending` with an error log.

## 7.5 AI Provider Port Interface

```typescript
// domain/ports/ai-provider.port.ts
interface IAIProvider {
  complete(options: {
    system: string;
    user: string;
    responseFormat: 'json_object';
    maxTokens?: number;
  }): Promise<{ content: string; usage: TokenUsage }>;

  embed(text: string): Promise<number[]>;
}
```

Only `OpenAIAdapter` implements this port in MVP. Swap to Anthropic/Gemini by implementing a new adapter — no domain code changes required.

## 7.6 Token Budget per Step

| Step | Max input tokens | Max output tokens | Notes |
|------|-----------------|-------------------|-------|
| 1: Survey Analysis | 4,000 | 2,000 | Survey responses only |
| 2: Evidence Analysis | 6,000 | 3,000 | RAG chunks trimmed to budget |
| 3: Signal Extraction | 8,000 | 4,000 | Pathology symptoms + RAG chunks |
| 4: Hypothesis Narratives | 5,000 | 3,000 | One call per hypothesis batch |
| 5: Confirmatory Questions | 4,000 | 2,000 | Hypotheses in weak-moderate range |
| 6: Opportunity Mapping | 3,000 | 3,000 | 7 property evaluations |

**Slim context rule (from Known Pitfalls):** Structured output with >10K tokens input and complex nested schemas can hang. Always filter to relevant data before calling. Use `Promise.race` with 60s timeout.
