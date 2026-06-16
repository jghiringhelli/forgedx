# Section 13 — Knowledge Base

## 13.1 GS Pathology Catalog (29 entries — all scored)

Unlike VairixDX (10 of 53 diseases scored in MVP), ForgeDX scores **all 29 pathologies** in MVP because the full catalog is derived from the white paper and is well-defined.

Each pathology has: name, slug, category, severity, gsProperties[], symptoms[], scoringRules (JSONB).

### Scoring Rules Schema

```json
{
  "signals": [
    { "signal": "signal_id", "weight": 0.3, "source_bonus": { "claudeMd": 0.15, "adr": 0.10, "spec": 0.05, "testFile": 0.05, "survey": 0.0 } }
  ],
  "threshold_weak": 20,
  "threshold_moderate": 40,
  "threshold_strong": 65,
  "threshold_corroborated": 80
}
```

Weights sum to 1.0 (= 100 base points). Source bonuses push above 100 (thresholds calibrated accordingly).

### P-001: Architectural Drift

```json
{
  "name": "Architectural Drift",
  "slug": "architectural-drift",
  "category": "spec_discipline",
  "severity": "critical",
  "gsProperties": ["self_describing", "bounded", "defended", "auditable"],
  "symptoms": [
    "Naming inconsistency across modules",
    "Layer violations in multiple locations",
    "Conflicting patterns for same problem",
    "AI-generated code diverges from established patterns",
    "Different teams/sessions produce different solutions to same problem"
  ],
  "scoringRules": {
    "signals": [
      { "signal": "no_navigation_root", "weight": 0.25, "source_bonus": { "claudeMd": 0.20, "survey": 0.0 } },
      { "signal": "no_adr_files", "weight": 0.20, "source_bonus": { "adr": 0.15, "survey": 0.0 } },
      { "signal": "inconsistent_naming_observed", "weight": 0.25, "source_bonus": { "testFile": 0.05, "survey": 0.05 } },
      { "signal": "no_layer_enforcement_gate", "weight": 0.30, "source_bonus": { "claudeMd": 0.10, "survey": 0.0 } }
    ],
    "threshold_weak": 20, "threshold_moderate": 40, "threshold_strong": 65, "threshold_corroborated": 80
  }
}
```

### P-002: Session Amnesia
**Category:** spec_discipline | **Severity:** high | **GS Properties:** self_describing, auditable
**Symptoms:** AI starts each session with no context; decisions remade differently each time; no session manifest discipline; CLAUDE.md absent or not loaded first.
**Key signals:** `no_navigation_root` (0.35), `no_session_protocol` (0.35), `no_adr_files` (0.30)

### P-003: Implicit Contract Syndrome
**Category:** spec_discipline | **Severity:** high | **GS Properties:** self_describing, composable
**Symptoms:** API boundaries assumed but not written; interface contracts in developer heads; no Hurl or contract test files; shared types inferred.
**Key signals:** `no_contract_tests` (0.40), `no_interface_definitions` (0.30), `no_api_spec_doc` (0.30)

### P-004: Specification Debt
**Category:** spec_discipline | **Severity:** critical | **GS Properties:** all
**Symptoms:** No spec document exists; PRD/TechSpec absent or never updated; code is the only source of truth; no CLAUDE.md or navigation root.
**Key signals:** `no_spec_document` (0.35), `no_navigation_root` (0.25), `no_adr_files` (0.20), `no_claude_md` (0.20)

### P-005: Context Overload
**Category:** context_management | **Severity:** high | **GS Properties:** bounded
**Symptoms:** Monolithic spec file (>200KB); no routing between sections; AI must load entire codebase to answer any question; no bounding strategy.
**Key signals:** `monolithic_spec_file` (0.35), `no_spec_index` (0.30), `high_file_count_no_index` (0.35)

### P-006: Verification Gap
**Category:** quality_enforcement | **Severity:** high | **GS Properties:** verifiable
**Symptoms:** No test coverage gate; coverage <40%; no mutation testing; "it compiles" treated as done.
**Key signals:** `no_test_files` (0.35), `low_test_coverage_reported` (0.35), `no_ci_gate` (0.30)

### P-007: Rationale Loss
**Category:** change_governance | **Severity:** medium | **GS Properties:** auditable
**Symptoms:** No ADR files; commit messages are "fix bug" or "update code"; no decision log; architectural choices undocumented.
**Key signals:** `no_adr_files` (0.50), `no_conventional_commits` (0.30), `no_decision_log` (0.20)

### P-008: Layer Violation
**Category:** quality_enforcement | **Severity:** high | **GS Properties:** composable, defended
**Symptoms:** DB calls from controllers; business logic in HTTP handlers; circular imports; no depcruise or equivalent.
**Key signals:** `no_layer_enforcement_gate` (0.40), `layer_violations_in_code` (0.35), `no_dependency_rules` (0.25)

### P-009: Naming Anarchy
**Category:** spec_discipline | **Severity:** medium | **GS Properties:** self_describing
**Symptoms:** Same concept has 3+ names across codebase; no domain glossary; AI generates inconsistent names.
**Key signals:** `no_domain_vocabulary` (0.50), `naming_inconsistency_observed` (0.50)

### P-010: Test Surface Blindness
**Category:** quality_enforcement | **Severity:** high | **GS Properties:** verifiable
**Symptoms:** Tests cover execution paths but miss behavioral contracts; no E2E or contract tests; passing tests don't catch behavioral regressions.
**Key signals:** `no_contract_tests` (0.35), `no_e2e_tests` (0.35), `test_naming_not_behavioral` (0.30)

### P-011: ADR Absence
**Category:** change_governance | **Severity:** medium | **GS Properties:** auditable
**Symptoms:** Technology decisions undocumented; no ADR files; can't explain why current stack was chosen.
**Key signals:** `no_adr_files` (0.70), `no_decision_files` (0.30)

### P-012: Contract Drift
**Category:** quality_enforcement | **Severity:** high | **GS Properties:** executable, verifiable
**Symptoms:** API docs describe behavior that doesn't match implementation; no automated check for spec-code drift.
**Key signals:** `no_contract_tests` (0.40), `no_spec_schema_drift_check` (0.30), `no_executable_spec` (0.30)

### P-013: Unchecked Generation
**Category:** quality_enforcement | **Severity:** critical | **GS Properties:** defended, verifiable
**Symptoms:** AI output accepted without running tests; no CI pipeline; commits without passing test suite; "vibes check" as quality gate.
**Key signals:** `no_ci_gate` (0.40), `no_pre_commit_hooks` (0.30), `no_test_files` (0.30)

### P-014: Silent Assumption
**Category:** spec_discipline | **Severity:** high | **GS Properties:** self_describing, defended
**Symptoms:** AI resolves decisions silently; no warnings when AI deviates from spec; no forbidden patterns catalog.
**Key signals:** `no_forbidden_patterns_doc` (0.40), `no_navigation_root` (0.30), `no_defended_spec` (0.30)

### P-015: Stale Specification
**Category:** spec_discipline | **Severity:** high | **GS Properties:** all
**Symptoms:** Spec created once, never updated; code diverges from spec; spec has warnings "this may be outdated".
**Key signals:** `spec_not_updated_with_code` (0.40), `no_spec_version_control` (0.30), `spec_code_divergence_detected` (0.30)

### P-016–P-029
See seed data in `apps/api/prisma/seeds/pathologies.ts` for full scoring rules.

## 13.2 GS Remedy Catalog (20 entries)

| ID | Name | Type | Effort | Impact | Key Pathologies Addressed |
|----|------|------|--------|--------|--------------------------|
| R-001 | Navigation Root (CLAUDE.md) | practice | low | high | P-002, P-004, P-009, P-014 |
| R-002 | ADR Practice | practice | low | high | P-007, P-011, P-015 |
| R-003 | Conventional Commits | protocol | low | medium | P-007, P-015 |
| R-004 | TDD Protocol (RED→GREEN→REFACTOR) | protocol | medium | high | P-006, P-010, P-013 |
| R-005 | Hurl Contract Tests | tool | medium | high | P-003, P-010, P-012 |
| R-006 | Layer Enforcement (depcruise) | gate | low | high | P-001, P-008, P-016 |
| R-007 | Dead Code Elimination (knip) | gate | low | medium | P-018 |
| R-008 | Duplication Gate (jscpd) | gate | low | medium | P-017 |
| R-009 | Bounded Spec Sections | practice | medium | high | P-005, P-015, P-027 |
| R-010 | Spec Index + Decision Tree | practice | low | high | P-005, P-027 |
| R-011 | Mutation Testing (Stryker/Vitest) | tool | medium | high | P-006, P-010 |
| R-012 | Domain Vocabulary Glossary | practice | low | medium | P-001, P-009, P-022 |
| R-013 | Forbidden Patterns Catalog | practice | medium | high | P-008, P-013, P-014, P-020, P-028 |
| R-014 | Pre-commit Gate Stack | gate | medium | high | P-013, P-020, P-028 |
| R-015 | Session Manifest Discipline | protocol | low | high | P-002, P-014 |
| R-016 | Hybrid Scoring Engine Pattern | practice | high | high | P-006, P-026 |
| R-017 | Executable Behavioral Probes | practice | medium | high | P-012, P-023, P-029 |
| R-018 | Interface-based Dependency Injection | practice | medium | high | P-003, P-008, P-025 |
| R-019 | Screaming Architecture | practice | low | medium | P-001, P-009, P-027 |
| R-020 | Specification-First Protocol | protocol | high | critical | P-004, P-013, P-015, P-024 |
