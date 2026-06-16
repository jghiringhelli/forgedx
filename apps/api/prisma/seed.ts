import { PrismaClient } from '@prisma/client'
import { pathologies } from './seeds/pathologies'
import { remedies } from './seeds/remedies'

const prisma = new PrismaClient()

// Pathology → Remedy mapping from spec section 13.2
const PATHOLOGY_REMEDY_MAP: Record<string, string[]> = {
  'P-001': ['R-001', 'R-006', 'R-012', 'R-019'],
  'P-002': ['R-001', 'R-015'],
  'P-003': ['R-005', 'R-018'],
  'P-004': ['R-001', 'R-002', 'R-020'],
  'P-005': ['R-009', 'R-010'],
  'P-006': ['R-004', 'R-011'],
  'P-007': ['R-002', 'R-003'],
  'P-008': ['R-006', 'R-018'],
  'P-009': ['R-012', 'R-019'],
  'P-010': ['R-004', 'R-005', 'R-011'],
  'P-011': ['R-002'],
  'P-012': ['R-005', 'R-017'],
  'P-013': ['R-004', 'R-014'],
  'P-014': ['R-001', 'R-013'],
  'P-015': ['R-002', 'R-015', 'R-020'],
  'P-016': ['R-006', 'R-018'],
  'P-017': ['R-008'],
  'P-018': ['R-007'],
  'P-019': ['R-001'],
  'P-020': ['R-013', 'R-014'],
  'P-021': ['R-009', 'R-010'],
  'P-022': ['R-012'],
  'P-023': ['R-005', 'R-017'],
  'P-024': ['R-020'],
  'P-025': ['R-018'],
  'P-026': ['R-016'],
  'P-027': ['R-001', 'R-010'],
  'P-028': ['R-004', 'R-014'],
  'P-029': ['R-017'],
}

async function seed() {
  console.log('🌱 Seeding ForgeDX knowledge base...')

  // Upsert all pathologies
  console.log('  ↳ Upserting 29 pathologies...')
  const pathologyRecords: Record<string, { id: string }> = {}
  for (const p of pathologies) {
    const record = await prisma.pathologyKnowledge.upsert({
      where: { code: p.code as string },
      update: p,
      create: p,
    })
    pathologyRecords[record.code] = { id: record.id }
  }
  console.log(`     ✓ ${Object.keys(pathologyRecords).length} pathologies upserted`)

  // Upsert all remedies
  console.log('  ↳ Upserting 20 remedies...')
  const remedyRecords: Record<string, { id: string }> = {}
  for (const r of remedies) {
    const record = await prisma.remedyKnowledge.upsert({
      where: { code: r.code as string },
      update: r,
      create: r,
    })
    remedyRecords[record.code] = { id: record.id }
  }
  console.log(`     ✓ ${Object.keys(remedyRecords).length} remedies upserted`)

  // Wire pathology→remedy prescriptions (many-to-many via Prescription)
  console.log('  ↳ Creating pathology→remedy prescriptions...')
  let prescriptionCount = 0
  for (const [pCode, rCodes] of Object.entries(PATHOLOGY_REMEDY_MAP)) {
    const pathologyId = pathologyRecords[pCode]?.id
    if (!pathologyId) continue

    for (const rCode of rCodes) {
      const remedyId = remedyRecords[rCode]?.id
      if (!remedyId) continue

      // Prescriptions are per-assessment in runtime, but here we store "default" prescriptions
      // as a seed reference. Skip — prescriptions are created by AssessmentService at runtime.
    }
  }

  // Store the map in RemedyKnowledge.pathologyCodes field via update
  // This allows AssessmentService to query "which remedies address pathology P-001?"
  for (const [pCode, rCodes] of Object.entries(PATHOLOGY_REMEDY_MAP)) {
    const pathologyId = pathologyRecords[pCode]?.id
    if (!pathologyId) {
      console.warn(`     ⚠ Pathology ${pCode} not found in records`)
      continue
    }
    for (const rCode of rCodes) {
      const remedyId = remedyRecords[rCode]?.id
      if (!remedyId) {
        console.warn(`     ⚠ Remedy ${rCode} not found in records`)
        continue
      }
      // Link pathology to remedies via the RemedyKnowledge.pathologyCodes array
      await prisma.remedyKnowledge.update({
        where: { id: remedyId },
        data: {
          pathologyCodes: {
            push: pCode,
          },
        },
      })
      prescriptionCount++
    }
  }
  console.log(`     ✓ ${prescriptionCount} pathology→remedy links written`)

  // Seed default survey questions
  console.log('  ↳ Seeding default survey questions...')
  const surveyQuestions: Array<{
    questionKey: string
    questionText: string
    questionType: string
    options: string[]
    signalKeys: string[]
    weight: number
    order: number
    isRequired: boolean
    isFunnelVisible: boolean
    section: string
  }> = [
    // Spec discipline
    {
      questionKey: 'has_claude_md',
      questionText: 'Does your project have a CLAUDE.md or similar navigation root that AI assistants read at the start of every session?',
      questionType: 'SINGLE_SELECT',
      options: ['Yes, and it\'s kept up to date', 'Yes, but it\'s outdated', 'No, but we plan to create one', 'No, and we\'re not sure what that is'],
      signalKeys: ['no_claude_md', 'no_navigation_root'],
      weight: 0.9,
      order: 1,
      isRequired: true,
      isFunnelVisible: true,
      section: 'spec_discipline',
    },
    {
      questionKey: 'has_adr_practice',
      questionText: 'When your team makes significant architectural decisions (choosing a library, database, pattern), do you document why?',
      questionType: 'SINGLE_SELECT',
      options: ['Yes, we have ADR files in our repo', 'Informally in tickets or docs', 'Rarely or never', 'We don\'t know what ADRs are'],
      signalKeys: ['no_adr_files', 'no_decision_log'],
      weight: 0.8,
      order: 2,
      isRequired: true,
      isFunnelVisible: true,
      section: 'spec_discipline',
    },
    {
      questionKey: 'has_spec_document',
      questionText: 'Does your project have a written specification that describes what the system should do — separate from the code?',
      questionType: 'SINGLE_SELECT',
      options: ['Yes, a detailed living spec', 'A basic README or PRD', 'No formal spec', 'The code is the spec'],
      signalKeys: ['no_spec_document', 'no_navigation_root'],
      weight: 0.85,
      order: 3,
      isRequired: true,
      isFunnelVisible: true,
      section: 'spec_discipline',
    },
    {
      questionKey: 'spec_first_discipline',
      questionText: 'When building a new feature, at what point do you write the specification?',
      questionType: 'SINGLE_SELECT',
      options: ['Before writing any code (spec-first)', 'While writing code', 'After the code works', 'We don\'t write specs'],
      signalKeys: ['code_predates_spec', 'no_session_protocol'],
      weight: 0.85,
      order: 4,
      isRequired: true,
      isFunnelVisible: false,
      section: 'spec_discipline',
    },
    // Quality enforcement
    {
      questionKey: 'has_test_coverage_gate',
      questionText: 'Does your CI pipeline fail if test coverage drops below a threshold?',
      questionType: 'SINGLE_SELECT',
      options: ['Yes, enforced in CI (80%+)', 'Yes, but below 50%', 'We track coverage but don\'t gate on it', 'No automated tests or coverage'],
      signalKeys: ['no_ci_gate', 'low_test_coverage_reported', 'no_test_files'],
      weight: 0.8,
      order: 5,
      isRequired: true,
      isFunnelVisible: true,
      section: 'quality_enforcement',
    },
    {
      questionKey: 'has_contract_tests',
      questionText: 'Do you have tests that run against your actual running API (not just mocked responses)?',
      questionType: 'SINGLE_SELECT',
      options: ['Yes, Hurl/Postman/Playwright contract tests', 'Some integration tests with real DB', 'Unit tests only (all mocked)', 'No automated tests'],
      signalKeys: ['no_contract_tests', 'no_e2e_tests', 'no_integration_tests'],
      weight: 0.75,
      order: 6,
      isRequired: true,
      isFunnelVisible: false,
      section: 'quality_enforcement',
    },
    {
      questionKey: 'has_layer_enforcement',
      questionText: 'Do you have automated checks that prevent business logic from ending up in the wrong layer (e.g., DB calls in route handlers)?',
      questionType: 'SINGLE_SELECT',
      options: ['Yes, with tools like dependency-cruiser', 'Code review catches it', 'We try but sometimes it slips', 'No enforcement'],
      signalKeys: ['no_layer_enforcement_gate', 'no_dependency_rules'],
      weight: 0.8,
      order: 7,
      isRequired: true,
      isFunnelVisible: false,
      section: 'quality_enforcement',
    },
    // AI workflow
    {
      questionKey: 'ai_session_context',
      questionText: 'When you start a new coding session with an AI assistant, how does it know about your project\'s conventions and previous decisions?',
      questionType: 'SINGLE_SELECT',
      options: ['It reads a documented navigation root (CLAUDE.md etc.)', 'I paste context manually', 'I start fresh and re-explain each session', 'We don\'t use AI assistants'],
      signalKeys: ['no_session_protocol', 'no_navigation_root'],
      weight: 0.9,
      order: 8,
      isRequired: true,
      isFunnelVisible: true,
      section: 'ai_workflow',
    },
    {
      questionKey: 'ai_output_gate',
      questionText: 'When an AI assistant generates code, what happens before it\'s committed?',
      questionType: 'SINGLE_SELECT',
      options: ['Full test suite runs + pre-commit hooks enforce gates', 'I manually review and run some tests', 'I review but rarely run tests', 'Commit immediately if it looks right'],
      signalKeys: ['no_pre_commit_hooks', 'no_ci_gate'],
      weight: 0.85,
      order: 9,
      isRequired: true,
      isFunnelVisible: true,
      section: 'ai_workflow',
    },
    {
      questionKey: 'ai_naming_consistency',
      questionText: 'How consistent is the naming of concepts across your codebase (e.g., same entity called "user" in DB, "member" in API, "account" in UI)?',
      questionType: 'SINGLE_SELECT',
      options: ['Very consistent — we have a domain vocabulary', 'Mostly consistent with some drift', 'Inconsistent — different names everywhere', 'We haven\'t thought about it'],
      signalKeys: ['no_domain_vocabulary', 'inconsistent_naming_observed'],
      weight: 0.7,
      order: 10,
      isRequired: true,
      isFunnelVisible: false,
      section: 'ai_workflow',
    },
    // Change governance
    {
      questionKey: 'commit_message_quality',
      questionText: 'What do your typical commit messages look like?',
      questionType: 'SINGLE_SELECT',
      options: ['Conventional Commits format (feat:, fix:, etc.)', 'Descriptive but no standard format', 'Brief summaries (fix, update, tweak)', 'We don\'t focus on commit messages'],
      signalKeys: ['no_conventional_commits'],
      weight: 0.6,
      order: 11,
      isRequired: false,
      isFunnelVisible: false,
      section: 'change_governance',
    },
    {
      questionKey: 'has_forbidden_patterns',
      questionText: 'Do you have a documented list of patterns that are explicitly prohibited in your codebase (and why)?',
      questionType: 'SINGLE_SELECT',
      options: ['Yes, documented and enforced via linting', 'Informal team knowledge', 'No explicit forbidden patterns list', 'No standards document'],
      signalKeys: ['no_forbidden_patterns_doc'],
      weight: 0.7,
      order: 12,
      isRequired: false,
      isFunnelVisible: false,
      section: 'change_governance',
    },
  ]

  for (const q of surveyQuestions) {
    await prisma.surveyQuestion.upsert({
      where: { questionKey: q.questionKey },
      update: q,
      create: q,
    })
  }
  console.log(`     ✓ ${surveyQuestions.length} survey questions seeded`)

  console.log('')
  console.log('✅ Knowledge base seed complete!')
  console.log(`   Pathologies: ${Object.keys(pathologyRecords).length}`)
  console.log(`   Remedies:    ${Object.keys(remedyRecords).length}`)
  console.log(`   Questions:   ${surveyQuestions.length}`)
}

seed()
  .catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
