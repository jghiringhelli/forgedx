# ADR-005 — Hybrid Scoring Engine

**Date:** 2026-06-11
**Status:** Accepted
**Context:**
The assessment pipeline must produce GS scores (evidence levels: weak/moderate/strong/corroborated) for each pathology. Two approaches: (1) ask the LLM to score directly, (2) LLM extracts signals deterministically scored by the engine.

**Decision:** Hybrid scoring engine — LLM extracts signals; deterministic engine computes scores.

**Scoring formula:**
```
score = SUM(matched_signal.weight * 100 + matched_signal.source_bonus[docType] * 100)
evidenceLevel = determine_level(score, source_diversity_count, thresholds)
```

**Rationale:**
1. **LLM confidence inflation.** LLMs tend to express overconfident probability estimates. A score of "78% likely" from an LLM is not reproducible or falsifiable. A deterministic formula on extracted signals is.
2. **Reproducibility.** Two runs with the same signals always produce the same score. LLM-computed scores vary by run.
3. **Auditability.** The score is explainable: "Score = 75 because signals X, Y, Z were present with weights 0.3, 0.4, 0.3."
4. **Trust hierarchy.** Source bonuses (`claudeMd: 0.15` vs `survey: 0.0`) encode the source trust hierarchy from the spec.
5. **This is GS exemplar.** The scoring engine is itself an instance of the Verifiable property — it produces a score the user can inspect and challenge.

**Anti-double-counting rule (critical):**
Survey answers auto-filled from documents (`ai_auto`, `ai_prefilled`) count as `document` origin for evidence level. Only `manual` survey answers add an independent source. This prevents inflating evidence level by counting the same evidence twice.

**Consequences:**
- ✅ Deterministic, reproducible, auditable scores
- ✅ LLM focused on narrative generation (its strength) not scoring (its weakness)
- ✅ Source trust hierarchy encoded in data, not prompt
- ⚠️ Scoring rules must be authored per pathology — higher authoring cost, but each rule is a knowledge artifact that accumulates
