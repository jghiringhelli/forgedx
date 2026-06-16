import type { Pathology } from './types'

export const PATHOLOGIES: Pathology[] = [
  {
    code: 'P-001', name: 'Architectural Drift', gsProperty: 'SELF_DESCRIBING', severity: 'CRITICAL',
    description: 'Codebase gradually diverges from intended design. AI sessions produce inconsistent patterns. No navigation root or layer enforcement.',
    scoringRules: {
      signals: [
        { signal: 'no_navigation_root', weight: 0.25, source_bonus: { claudeMd: 0.20 } },
        { signal: 'no_adr_files', weight: 0.20, source_bonus: { adr: 0.15 } },
        { signal: 'inconsistent_naming', weight: 0.25, source_bonus: { testFile: 0.05, survey: 0.05 } },
        { signal: 'no_layer_enforcement', weight: 0.30, source_bonus: { claudeMd: 0.10 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-002', name: 'Session Amnesia', gsProperty: 'SELF_DESCRIBING', severity: 'HIGH',
    description: 'AI starts each session with no context. Decisions remade differently each time. No session manifest discipline.',
    scoringRules: {
      signals: [
        { signal: 'no_navigation_root', weight: 0.35, source_bonus: { claudeMd: 0.20 } },
        { signal: 'no_session_protocol', weight: 0.35, source_bonus: { claudeMd: 0.15, survey: 0.05 } },
        { signal: 'no_adr_files', weight: 0.30, source_bonus: { adr: 0.10 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-003', name: 'Implicit Contract Syndrome', gsProperty: 'COMPOSABLE', severity: 'HIGH',
    description: 'API boundaries assumed but not written. Interface contracts in developer heads. No contract tests.',
    scoringRules: {
      signals: [
        { signal: 'no_contract_tests', weight: 0.40, source_bonus: { testFile: 0.10 } },
        { signal: 'no_interface_definitions', weight: 0.30, source_bonus: { spec: 0.05, survey: 0.05 } },
        { signal: 'no_api_spec_doc', weight: 0.30, source_bonus: { spec: 0.10 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-004', name: 'Specification Debt', gsProperty: 'SELF_DESCRIBING', severity: 'CRITICAL',
    description: 'No spec document exists. Code is the only source of truth. PRD/TechSpec absent or never updated.',
    scoringRules: {
      signals: [
        { signal: 'no_spec_document', weight: 0.35, source_bonus: { spec: 0.20 } },
        { signal: 'no_navigation_root', weight: 0.25, source_bonus: { claudeMd: 0.15 } },
        { signal: 'no_adr_files', weight: 0.20, source_bonus: { adr: 0.10 } },
        { signal: 'no_claude_md', weight: 0.20, source_bonus: { claudeMd: 0.20 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-005', name: 'Context Overload', gsProperty: 'BOUNDED', severity: 'HIGH',
    description: 'Monolithic spec file >200KB. No routing between sections. AI must load entire codebase to answer any question.',
    scoringRules: {
      signals: [
        { signal: 'monolithic_spec_file', weight: 0.35, source_bonus: { spec: 0.05, survey: 0.05 } },
        { signal: 'no_spec_index', weight: 0.30, source_bonus: { claudeMd: 0.10 } },
        { signal: 'high_file_count_no_index', weight: 0.35, source_bonus: { claudeMd: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-006', name: 'Verification Gap', gsProperty: 'VERIFIABLE', severity: 'HIGH',
    description: 'No test coverage gate. Coverage <40%. No mutation testing. "It compiles" treated as done.',
    scoringRules: {
      signals: [
        { signal: 'no_test_files', weight: 0.35, source_bonus: { testFile: 0.20 } },
        { signal: 'no_coverage_config', weight: 0.35, source_bonus: { testFile: 0.10, survey: 0.05 } },
        { signal: 'no_ci_gate', weight: 0.30, source_bonus: { claudeMd: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-007', name: 'Rationale Loss', gsProperty: 'AUDITABLE', severity: 'MEDIUM',
    description: 'No ADR files. Commit messages are "fix bug". No decision log. Architectural choices undocumented.',
    scoringRules: {
      signals: [
        { signal: 'no_adr_files', weight: 0.50, source_bonus: { adr: 0.20 } },
        { signal: 'no_conventional_commits', weight: 0.30, source_bonus: { claudeMd: 0.05, survey: 0.05 } },
        { signal: 'no_decision_log', weight: 0.20, source_bonus: { spec: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-008', name: 'Layer Violation', gsProperty: 'COMPOSABLE', severity: 'HIGH',
    description: 'DB calls from controllers. Business logic in HTTP handlers. Circular imports. No depcruise or equivalent.',
    scoringRules: {
      signals: [
        { signal: 'no_layer_enforcement', weight: 0.40, source_bonus: { claudeMd: 0.10 } },
        { signal: 'no_interface_definitions', weight: 0.35, source_bonus: { testFile: 0.05, survey: 0.05 } },
        { signal: 'no_dependency_rules', weight: 0.25, source_bonus: { claudeMd: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-009', name: 'Naming Anarchy', gsProperty: 'SELF_DESCRIBING', severity: 'MEDIUM',
    description: 'Same concept has 3+ names across codebase. No domain glossary. AI generates inconsistent names.',
    scoringRules: {
      signals: [
        { signal: 'no_domain_vocabulary', weight: 0.50, source_bonus: { claudeMd: 0.15 } },
        { signal: 'inconsistent_naming', weight: 0.50, source_bonus: { testFile: 0.05, survey: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-010', name: 'Test Surface Blindness', gsProperty: 'VERIFIABLE', severity: 'HIGH',
    description: 'Tests cover execution paths but miss behavioral contracts. No E2E or contract tests.',
    scoringRules: {
      signals: [
        { signal: 'no_contract_tests', weight: 0.35, source_bonus: { testFile: 0.10 } },
        { signal: 'no_e2e_tests', weight: 0.35, source_bonus: { testFile: 0.10, survey: 0.05 } },
        { signal: 'tests_not_behavioral', weight: 0.30, source_bonus: { testFile: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-011', name: 'ADR Absence', gsProperty: 'AUDITABLE', severity: 'MEDIUM',
    description: 'Technology decisions undocumented. No ADR files. Cannot explain why current stack was chosen.',
    scoringRules: {
      signals: [
        { signal: 'no_adr_files', weight: 0.70, source_bonus: { adr: 0.20 } },
        { signal: 'no_decision_log', weight: 0.30, source_bonus: { spec: 0.05, survey: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-012', name: 'Contract Drift', gsProperty: 'EXECUTABLE', severity: 'HIGH',
    description: 'API docs describe behavior that does not match implementation. No automated check for spec-code drift.',
    scoringRules: {
      signals: [
        { signal: 'no_contract_tests', weight: 0.40, source_bonus: { testFile: 0.10 } },
        { signal: 'no_api_spec_doc', weight: 0.30, source_bonus: { spec: 0.05, survey: 0.05 } },
        { signal: 'no_executable_spec', weight: 0.30, source_bonus: { claudeMd: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-013', name: 'Unchecked Generation', gsProperty: 'DEFENDED', severity: 'CRITICAL',
    description: 'AI output accepted without running tests. No CI pipeline. Commits without passing test suite.',
    scoringRules: {
      signals: [
        { signal: 'no_ci_gate', weight: 0.40, source_bonus: { claudeMd: 0.10 } },
        { signal: 'no_pre_commit_hooks', weight: 0.30, source_bonus: { claudeMd: 0.10 } },
        { signal: 'no_test_files', weight: 0.30, source_bonus: { testFile: 0.15 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-014', name: 'Silent Assumption', gsProperty: 'DEFENDED', severity: 'HIGH',
    description: 'AI resolves decisions silently. No warnings when AI deviates from spec. No forbidden patterns catalog.',
    scoringRules: {
      signals: [
        { signal: 'no_forbidden_patterns', weight: 0.40, source_bonus: { claudeMd: 0.15 } },
        { signal: 'no_navigation_root', weight: 0.30, source_bonus: { claudeMd: 0.10 } },
        { signal: 'no_defended_spec', weight: 0.30, source_bonus: { spec: 0.05, survey: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-015', name: 'Stale Specification', gsProperty: 'AUDITABLE', severity: 'HIGH',
    description: 'Spec created once, never updated. Code diverges from spec. Spec has warnings "this may be outdated".',
    scoringRules: {
      signals: [
        { signal: 'no_spec_document', weight: 0.40, source_bonus: { spec: 0.05, survey: 0.05 } },
        { signal: 'no_adr_files', weight: 0.30, source_bonus: { claudeMd: 0.05 } },
        { signal: 'no_session_protocol', weight: 0.30, source_bonus: { testFile: 0.05, survey: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-016', name: 'Dependency Tangle', gsProperty: 'COMPOSABLE', severity: 'HIGH',
    description: 'Circular imports. Deep coupling between modules. Changing one module breaks three others.',
    scoringRules: {
      signals: [
        { signal: 'no_layer_enforcement', weight: 0.40, source_bonus: { testFile: 0.05, survey: 0.05 } },
        { signal: 'no_dependency_rules', weight: 0.35, source_bonus: { claudeMd: 0.10 } },
        { signal: 'no_interface_definitions', weight: 0.25, source_bonus: { spec: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-017', name: 'Code Duplication Creep', gsProperty: 'COMPOSABLE', severity: 'MEDIUM',
    description: 'Same logic copy-pasted 3+ times. No shared abstraction. AI generates new copies rather than reusing.',
    scoringRules: {
      signals: [
        { signal: 'no_duplication_gate', weight: 0.50, source_bonus: { testFile: 0.05, survey: 0.05 } },
        { signal: 'no_shared_utilities', weight: 0.30, source_bonus: { spec: 0.05 } },
        { signal: 'no_layer_enforcement', weight: 0.20, source_bonus: { claudeMd: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-018', name: 'Dead Code Accumulation', gsProperty: 'BOUNDED', severity: 'LOW',
    description: 'Unused files, exports, and variables accumulate. No dead code detection. Fear of deleting code.',
    scoringRules: {
      signals: [
        { signal: 'no_dead_code_gate', weight: 0.50, source_bonus: { claudeMd: 0.05, survey: 0.05 } },
        { signal: 'no_dependency_rules', weight: 0.50, source_bonus: { claudeMd: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-019', name: 'Environment Opacity', gsProperty: 'SELF_DESCRIBING', severity: 'MEDIUM',
    description: 'Env vars undocumented. No .env.example. New developers cannot onboard without tribal knowledge.',
    scoringRules: {
      signals: [
        { signal: 'no_env_example', weight: 0.50, source_bonus: { spec: 0.10, survey: 0.05 } },
        { signal: 'no_readme', weight: 0.50, source_bonus: { spec: 0.05, survey: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-020', name: 'Gate Erosion', gsProperty: 'DEFENDED', severity: 'CRITICAL',
    description: 'Quality gates exist but are routinely bypassed. Skip flags used without documentation.',
    scoringRules: {
      signals: [
        { signal: 'no_pre_commit_hooks', weight: 0.40, source_bonus: { claudeMd: 0.10, survey: 0.05 } },
        { signal: 'no_ci_gate', weight: 0.35, source_bonus: { claudeMd: 0.10 } },
        { signal: 'no_forbidden_patterns', weight: 0.25, source_bonus: { spec: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-021', name: 'Scope Creep Blindness', gsProperty: 'BOUNDED', severity: 'HIGH',
    description: 'Features added without updating spec. MVP scope not defined. Everything is in scope by default.',
    scoringRules: {
      signals: [
        { signal: 'no_spec_document', weight: 0.40, source_bonus: { spec: 0.10, survey: 0.05 } },
        { signal: 'no_navigation_root', weight: 0.35, source_bonus: { spec: 0.10 } },
        { signal: 'no_adr_files', weight: 0.25, source_bonus: { testFile: 0.05, survey: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-022', name: 'Vocabulary Drift', gsProperty: 'SELF_DESCRIBING', severity: 'MEDIUM',
    description: 'Domain terms change meaning over time. "User" means different things in API vs DB vs docs.',
    scoringRules: {
      signals: [
        { signal: 'no_domain_vocabulary', weight: 0.50, source_bonus: { claudeMd: 0.15 } },
        { signal: 'inconsistent_naming', weight: 0.50, source_bonus: { testFile: 0.05, survey: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-023', name: 'Probe Absence', gsProperty: 'EXECUTABLE', severity: 'HIGH',
    description: 'No live system probes. Tests only run against mocks. No Hurl or equivalent against running system.',
    scoringRules: {
      signals: [
        { signal: 'no_contract_tests', weight: 0.45, source_bonus: { testFile: 0.10 } },
        { signal: 'no_executable_spec', weight: 0.35, source_bonus: { claudeMd: 0.05, survey: 0.05 } },
        { signal: 'no_e2e_tests', weight: 0.20, source_bonus: { testFile: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-024', name: 'Spec-Last Development', gsProperty: 'SELF_DESCRIBING', severity: 'CRITICAL',
    description: 'Code written before spec. Spec written after (if ever). No specification-first discipline enforced.',
    scoringRules: {
      signals: [
        { signal: 'no_spec_document', weight: 0.35, source_bonus: { spec: 0.15, survey: 0.05 } },
        { signal: 'spec_last_workflow', weight: 0.35, source_bonus: { spec: 0.10, survey: 0.05 } },
        { signal: 'no_session_protocol', weight: 0.30, source_bonus: { claudeMd: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-025', name: 'Port Rigidity', gsProperty: 'COMPOSABLE', severity: 'MEDIUM',
    description: 'No port/adapter pattern. Swapping dependencies requires rewriting business logic.',
    scoringRules: {
      signals: [
        { signal: 'no_interface_definitions', weight: 0.45, source_bonus: { spec: 0.05, survey: 0.05 } },
        { signal: 'no_dependency_rules', weight: 0.30, source_bonus: { claudeMd: 0.05 } },
        { signal: 'no_layer_enforcement', weight: 0.25, source_bonus: { testFile: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-026', name: 'Confidence Inflation', gsProperty: 'VERIFIABLE', severity: 'HIGH',
    description: 'LLM returns percentage confidence scores as facts. No deterministic scoring engine. Evidence quality ignored.',
    scoringRules: {
      signals: [
        { signal: 'llm_used_for_scoring', weight: 0.50, source_bonus: { claudeMd: 0.05, survey: 0.05 } },
        { signal: 'no_deterministic_scoring', weight: 0.30, source_bonus: { spec: 0.05 } },
        { signal: 'no_test_files', weight: 0.20, source_bonus: { testFile: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-027', name: 'Navigation Blindness', gsProperty: 'BOUNDED', severity: 'HIGH',
    description: 'No routing mechanism for AI to find relevant context. CLAUDE.md missing. AI loads random files.',
    scoringRules: {
      signals: [
        { signal: 'no_navigation_root', weight: 0.40, source_bonus: { claudeMd: 0.25 } },
        { signal: 'no_spec_index', weight: 0.35, source_bonus: { claudeMd: 0.10 } },
        { signal: 'no_claude_md', weight: 0.25, source_bonus: { claudeMd: 0.25 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-028', name: 'Regression Blindness', gsProperty: 'DEFENDED', severity: 'HIGH',
    description: 'Fixes break previously working features. No regression fixtures. Bug recurs because root cause not captured.',
    scoringRules: {
      signals: [
        { signal: 'no_regression_fixtures', weight: 0.45, source_bonus: { testFile: 0.10, survey: 0.05 } },
        { signal: 'no_pre_commit_hooks', weight: 0.30, source_bonus: { claudeMd: 0.05 } },
        { signal: 'no_ci_gate', weight: 0.25, source_bonus: { claudeMd: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
  {
    code: 'P-029', name: 'Deployment Opacity', gsProperty: 'EXECUTABLE', severity: 'MEDIUM',
    description: 'No documented deployment process. Production differs from dev in unknown ways. No health probes.',
    scoringRules: {
      signals: [
        { signal: 'no_deployment_doc', weight: 0.40, source_bonus: { spec: 0.05, survey: 0.05 } },
        { signal: 'no_env_example', weight: 0.35, source_bonus: { testFile: 0.05 } },
        { signal: 'no_executable_spec', weight: 0.25, source_bonus: { claudeMd: 0.05 } },
      ],
      threshold_weak: 20, threshold_moderate: 40, threshold_strong: 65, threshold_corroborated: 80,
    },
  },
]
