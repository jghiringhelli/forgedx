import type { Prisma } from '@prisma/client'

// All 29 GS pathologies from docs/specs/sections/13-knowledge-base.md
// Scoring rules: signals sum weights to ~1.0; source bonuses add on top
export const pathologies: Prisma.PathologyKnowledgeCreateInput[] = [
  {
    code: 'P-001',
    name: 'Architectural Drift',
    gsProperty: 'SELF_DESCRIBING',
    description: 'Codebase gradually diverges from its intended design. AI sessions produce inconsistent patterns. No navigation root or layer enforcement.',
    severity: 'CRITICAL',
    scoringRules: {
      signals: [
        { signal: 'no_navigation_root', weight: 0.25, source_bonus: { claudeMd: 0.20, survey: 0.0 } },
        { signal: 'no_adr_files', weight: 0.20, source_bonus: { adr: 0.15, survey: 0.0 } },
        { signal: 'inconsistent_naming_observed', weight: 0.25, source_bonus: { testFile: 0.05, survey: 0.05 } },
        { signal: 'no_layer_enforcement_gate', weight: 0.30, source_bonus: { claudeMd: 0.10, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-002',
    name: 'Session Amnesia',
    gsProperty: 'SELF_DESCRIBING',
    description: 'AI starts each session with no context. Decisions are remade differently each time. No session manifest discipline.',
    severity: 'HIGH',
    scoringRules: {
      signals: [
        { signal: 'no_navigation_root', weight: 0.35, source_bonus: { claudeMd: 0.20, survey: 0.0 } },
        { signal: 'no_session_protocol', weight: 0.35, source_bonus: { claudeMd: 0.15, survey: 0.05 } },
        { signal: 'no_adr_files', weight: 0.30, source_bonus: { adr: 0.10, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-003',
    name: 'Implicit Contract Syndrome',
    gsProperty: 'COMPOSABLE',
    description: 'API boundaries assumed but not written. Interface contracts exist only in developer heads. No contract tests.',
    severity: 'HIGH',
    scoringRules: {
      signals: [
        { signal: 'no_contract_tests', weight: 0.40, source_bonus: { testFile: 0.10, survey: 0.0 } },
        { signal: 'no_interface_definitions', weight: 0.30, source_bonus: { spec: 0.05, survey: 0.05 } },
        { signal: 'no_api_spec_doc', weight: 0.30, source_bonus: { spec: 0.10, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-004',
    name: 'Specification Debt',
    gsProperty: 'SELF_DESCRIBING',
    description: 'No spec document exists. Code is the only source of truth. PRD/TechSpec absent or never updated.',
    severity: 'CRITICAL',
    scoringRules: {
      signals: [
        { signal: 'no_spec_document', weight: 0.35, source_bonus: { spec: 0.20, survey: 0.0 } },
        { signal: 'no_navigation_root', weight: 0.25, source_bonus: { claudeMd: 0.15, survey: 0.0 } },
        { signal: 'no_adr_files', weight: 0.20, source_bonus: { adr: 0.10, survey: 0.0 } },
        { signal: 'no_claude_md', weight: 0.20, source_bonus: { claudeMd: 0.20, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-005',
    name: 'Context Overload',
    gsProperty: 'BOUNDED',
    description: 'Monolithic spec file >200KB. No routing between sections. AI must load entire codebase to answer any question.',
    severity: 'HIGH',
    scoringRules: {
      signals: [
        { signal: 'monolithic_spec_file', weight: 0.35, source_bonus: { spec: 0.05, survey: 0.05 } },
        { signal: 'no_spec_index', weight: 0.30, source_bonus: { claudeMd: 0.10, survey: 0.0 } },
        { signal: 'high_file_count_no_index', weight: 0.35, source_bonus: { claudeMd: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-006',
    name: 'Verification Gap',
    gsProperty: 'VERIFIABLE',
    description: 'No test coverage gate. Coverage <40%. No mutation testing. "It compiles" treated as done.',
    severity: 'HIGH',
    scoringRules: {
      signals: [
        { signal: 'no_test_files', weight: 0.35, source_bonus: { testFile: 0.20, survey: 0.0 } },
        { signal: 'low_test_coverage_reported', weight: 0.35, source_bonus: { testFile: 0.10, survey: 0.05 } },
        { signal: 'no_ci_gate', weight: 0.30, source_bonus: { claudeMd: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-007',
    name: 'Rationale Loss',
    gsProperty: 'AUDITABLE',
    description: 'No ADR files. Commit messages are "fix bug". No decision log. Architectural choices undocumented.',
    severity: 'MEDIUM',
    scoringRules: {
      signals: [
        { signal: 'no_adr_files', weight: 0.50, source_bonus: { adr: 0.20, survey: 0.0 } },
        { signal: 'no_conventional_commits', weight: 0.30, source_bonus: { claudeMd: 0.05, survey: 0.05 } },
        { signal: 'no_decision_log', weight: 0.20, source_bonus: { spec: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-008',
    name: 'Layer Violation',
    gsProperty: 'COMPOSABLE',
    description: 'DB calls from controllers. Business logic in HTTP handlers. Circular imports. No depcruise or equivalent.',
    severity: 'HIGH',
    scoringRules: {
      signals: [
        { signal: 'no_layer_enforcement_gate', weight: 0.40, source_bonus: { claudeMd: 0.10, survey: 0.0 } },
        { signal: 'layer_violations_in_code', weight: 0.35, source_bonus: { testFile: 0.05, survey: 0.05 } },
        { signal: 'no_dependency_rules', weight: 0.25, source_bonus: { claudeMd: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-009',
    name: 'Naming Anarchy',
    gsProperty: 'SELF_DESCRIBING',
    description: 'Same concept has 3+ names across codebase. No domain glossary. AI generates inconsistent names.',
    severity: 'MEDIUM',
    scoringRules: {
      signals: [
        { signal: 'no_domain_vocabulary', weight: 0.50, source_bonus: { claudeMd: 0.15, survey: 0.0 } },
        { signal: 'naming_inconsistency_observed', weight: 0.50, source_bonus: { testFile: 0.05, survey: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-010',
    name: 'Test Surface Blindness',
    gsProperty: 'VERIFIABLE',
    description: 'Tests cover execution paths but miss behavioral contracts. No E2E or contract tests.',
    severity: 'HIGH',
    scoringRules: {
      signals: [
        { signal: 'no_contract_tests', weight: 0.35, source_bonus: { testFile: 0.10, survey: 0.0 } },
        { signal: 'no_e2e_tests', weight: 0.35, source_bonus: { testFile: 0.10, survey: 0.05 } },
        { signal: 'test_naming_not_behavioral', weight: 0.30, source_bonus: { testFile: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-011',
    name: 'ADR Absence',
    gsProperty: 'AUDITABLE',
    description: 'Technology decisions undocumented. No ADR files. Cannot explain why current stack was chosen.',
    severity: 'MEDIUM',
    scoringRules: {
      signals: [
        { signal: 'no_adr_files', weight: 0.70, source_bonus: { adr: 0.20, survey: 0.0 } },
        { signal: 'no_decision_files', weight: 0.30, source_bonus: { spec: 0.05, survey: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-012',
    name: 'Contract Drift',
    gsProperty: 'EXECUTABLE',
    description: 'API docs describe behavior that does not match implementation. No automated check for spec-code drift.',
    severity: 'HIGH',
    scoringRules: {
      signals: [
        { signal: 'no_contract_tests', weight: 0.40, source_bonus: { testFile: 0.10, survey: 0.0 } },
        { signal: 'no_spec_schema_drift_check', weight: 0.30, source_bonus: { spec: 0.05, survey: 0.05 } },
        { signal: 'no_executable_spec', weight: 0.30, source_bonus: { claudeMd: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-013',
    name: 'Unchecked Generation',
    gsProperty: 'DEFENDED',
    description: 'AI output accepted without running tests. No CI pipeline. Commits without passing test suite.',
    severity: 'CRITICAL',
    scoringRules: {
      signals: [
        { signal: 'no_ci_gate', weight: 0.40, source_bonus: { claudeMd: 0.10, survey: 0.0 } },
        { signal: 'no_pre_commit_hooks', weight: 0.30, source_bonus: { claudeMd: 0.10, survey: 0.0 } },
        { signal: 'no_test_files', weight: 0.30, source_bonus: { testFile: 0.15, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-014',
    name: 'Silent Assumption',
    gsProperty: 'DEFENDED',
    description: 'AI resolves decisions silently. No warnings when AI deviates from spec. No forbidden patterns catalog.',
    severity: 'HIGH',
    scoringRules: {
      signals: [
        { signal: 'no_forbidden_patterns_doc', weight: 0.40, source_bonus: { claudeMd: 0.15, survey: 0.0 } },
        { signal: 'no_navigation_root', weight: 0.30, source_bonus: { claudeMd: 0.10, survey: 0.0 } },
        { signal: 'no_defended_spec', weight: 0.30, source_bonus: { spec: 0.05, survey: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-015',
    name: 'Stale Specification',
    gsProperty: 'AUDITABLE',
    description: 'Spec created once, never updated. Code diverges from spec. Spec has warnings "this may be outdated".',
    severity: 'HIGH',
    scoringRules: {
      signals: [
        { signal: 'spec_not_updated_with_code', weight: 0.40, source_bonus: { spec: 0.05, survey: 0.05 } },
        { signal: 'no_spec_version_control', weight: 0.30, source_bonus: { claudeMd: 0.05, survey: 0.0 } },
        { signal: 'spec_code_divergence_detected', weight: 0.30, source_bonus: { testFile: 0.05, survey: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-016',
    name: 'Dependency Tangle',
    gsProperty: 'COMPOSABLE',
    description: 'Circular imports. Deep coupling between modules. Changing one module breaks three others. No explicit DI.',
    severity: 'HIGH',
    scoringRules: {
      signals: [
        { signal: 'circular_imports_detected', weight: 0.40, source_bonus: { testFile: 0.05, survey: 0.05 } },
        { signal: 'no_dependency_rules', weight: 0.35, source_bonus: { claudeMd: 0.10, survey: 0.0 } },
        { signal: 'no_interface_definitions', weight: 0.25, source_bonus: { spec: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-017',
    name: 'Code Duplication Creep',
    gsProperty: 'COMPOSABLE',
    description: 'Same logic copy-pasted 3+ times. No shared abstraction. AI generates new copies rather than reusing.',
    severity: 'MEDIUM',
    scoringRules: {
      signals: [
        { signal: 'high_duplication_detected', weight: 0.50, source_bonus: { testFile: 0.05, survey: 0.05 } },
        { signal: 'no_shared_utility_layer', weight: 0.30, source_bonus: { spec: 0.05, survey: 0.0 } },
        { signal: 'no_duplication_gate', weight: 0.20, source_bonus: { claudeMd: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-018',
    name: 'Dead Code Accumulation',
    gsProperty: 'BOUNDED',
    description: 'Unused files, exports, and variables accumulate. No dead code detection. Fear of deleting code.',
    severity: 'LOW',
    scoringRules: {
      signals: [
        { signal: 'dead_files_detected', weight: 0.50, source_bonus: { testFile: 0.05, survey: 0.05 } },
        { signal: 'no_dead_code_gate', weight: 0.50, source_bonus: { claudeMd: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-019',
    name: 'Environment Opacity',
    gsProperty: 'SELF_DESCRIBING',
    description: 'Env vars undocumented. No .env.example. New developers cannot onboard without tribal knowledge.',
    severity: 'MEDIUM',
    scoringRules: {
      signals: [
        { signal: 'no_env_example_file', weight: 0.50, source_bonus: { spec: 0.10, survey: 0.05 } },
        { signal: 'env_vars_undocumented', weight: 0.50, source_bonus: { spec: 0.05, survey: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-020',
    name: 'Gate Erosion',
    gsProperty: 'DEFENDED',
    description: 'Quality gates exist but are routinely bypassed. Skip flags used without documentation. Gates advisory not mandatory.',
    severity: 'CRITICAL',
    scoringRules: {
      signals: [
        { signal: 'gates_bypassed_without_reason', weight: 0.40, source_bonus: { claudeMd: 0.10, survey: 0.05 } },
        { signal: 'no_mandatory_gates', weight: 0.35, source_bonus: { claudeMd: 0.10, survey: 0.0 } },
        { signal: 'no_gate_audit_log', weight: 0.25, source_bonus: { spec: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-021',
    name: 'Scope Creep Blindness',
    gsProperty: 'BOUNDED',
    description: 'Features added without updating spec. MVP scope not defined. Everything is in scope by default.',
    severity: 'HIGH',
    scoringRules: {
      signals: [
        { signal: 'no_mvp_scope_doc', weight: 0.40, source_bonus: { spec: 0.10, survey: 0.05 } },
        { signal: 'no_spec_document', weight: 0.35, source_bonus: { spec: 0.10, survey: 0.0 } },
        { signal: 'untracked_features_in_code', weight: 0.25, source_bonus: { testFile: 0.05, survey: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-022',
    name: 'Vocabulary Drift',
    gsProperty: 'SELF_DESCRIBING',
    description: 'Domain terms change meaning over time. "User" means different things in API vs DB vs docs. No enforced glossary.',
    severity: 'MEDIUM',
    scoringRules: {
      signals: [
        { signal: 'no_domain_vocabulary', weight: 0.45, source_bonus: { claudeMd: 0.15, survey: 0.0 } },
        { signal: 'inconsistent_naming_observed', weight: 0.35, source_bonus: { testFile: 0.05, survey: 0.05 } },
        { signal: 'naming_inconsistency_observed', weight: 0.20, source_bonus: { spec: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-023',
    name: 'Probe Absence',
    gsProperty: 'EXECUTABLE',
    description: 'No live system probes. Tests only run against mocks. No Hurl or equivalent contract tests against running system.',
    severity: 'HIGH',
    scoringRules: {
      signals: [
        { signal: 'no_contract_tests', weight: 0.45, source_bonus: { testFile: 0.10, survey: 0.0 } },
        { signal: 'no_executable_spec', weight: 0.35, source_bonus: { claudeMd: 0.05, survey: 0.05 } },
        { signal: 'no_integration_tests', weight: 0.20, source_bonus: { testFile: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-024',
    name: 'Spec-Last Development',
    gsProperty: 'SELF_DESCRIBING',
    description: 'Code written before spec. Spec written after (if ever). No specification-first discipline enforced.',
    severity: 'CRITICAL',
    scoringRules: {
      signals: [
        { signal: 'no_spec_document', weight: 0.35, source_bonus: { spec: 0.15, survey: 0.05 } },
        { signal: 'code_predates_spec', weight: 0.35, source_bonus: { spec: 0.10, survey: 0.05 } },
        { signal: 'no_session_protocol', weight: 0.30, source_bonus: { claudeMd: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-025',
    name: 'Port Rigidity',
    gsProperty: 'COMPOSABLE',
    description: 'No port/adapter pattern. Swapping dependencies requires rewriting business logic. Vendor lock-in at domain level.',
    severity: 'MEDIUM',
    scoringRules: {
      signals: [
        { signal: 'no_interface_definitions', weight: 0.45, source_bonus: { spec: 0.05, survey: 0.05 } },
        { signal: 'no_dependency_rules', weight: 0.30, source_bonus: { claudeMd: 0.05, survey: 0.0 } },
        { signal: 'vendor_imports_in_domain', weight: 0.25, source_bonus: { testFile: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-026',
    name: 'Confidence Inflation',
    gsProperty: 'VERIFIABLE',
    description: 'LLM returns percentage confidence scores as facts. No deterministic scoring engine. Evidence quality ignored.',
    severity: 'HIGH',
    scoringRules: {
      signals: [
        { signal: 'llm_confidence_percentages_used', weight: 0.50, source_bonus: { claudeMd: 0.05, survey: 0.05 } },
        { signal: 'no_deterministic_scoring', weight: 0.30, source_bonus: { spec: 0.05, survey: 0.0 } },
        { signal: 'no_evidence_weight_system', weight: 0.20, source_bonus: { spec: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-027',
    name: 'Navigation Blindness',
    gsProperty: 'BOUNDED',
    description: 'No routing mechanism for AI to find relevant context. CLAUDE.md missing or non-functional. AI loads random files.',
    severity: 'HIGH',
    scoringRules: {
      signals: [
        { signal: 'no_navigation_root', weight: 0.40, source_bonus: { claudeMd: 0.25, survey: 0.0 } },
        { signal: 'no_spec_index', weight: 0.35, source_bonus: { claudeMd: 0.10, survey: 0.0 } },
        { signal: 'no_claude_md', weight: 0.25, source_bonus: { claudeMd: 0.25, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-028',
    name: 'Regression Blindness',
    gsProperty: 'DEFENDED',
    description: 'Fixes break previously working features. No regression fixtures. Bug recurs because root cause not captured.',
    severity: 'HIGH',
    scoringRules: {
      signals: [
        { signal: 'no_regression_fixtures', weight: 0.45, source_bonus: { testFile: 0.10, survey: 0.05 } },
        { signal: 'no_pre_commit_hooks', weight: 0.30, source_bonus: { claudeMd: 0.05, survey: 0.0 } },
        { signal: 'no_ci_gate', weight: 0.25, source_bonus: { claudeMd: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-029',
    name: 'Deployment Opacity',
    gsProperty: 'EXECUTABLE',
    description: 'No documented deployment process. Production differs from dev in unknown ways. No health probes or readiness checks.',
    severity: 'MEDIUM',
    scoringRules: {
      signals: [
        { signal: 'no_deployment_doc', weight: 0.40, source_bonus: { spec: 0.05, survey: 0.05 } },
        { signal: 'no_health_endpoint', weight: 0.35, source_bonus: { testFile: 0.05, survey: 0.0 } },
        { signal: 'no_executable_spec', weight: 0.25, source_bonus: { claudeMd: 0.05, survey: 0.0 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
]
