import { select } from '@inquirer/prompts'
import type { DetectedSignal } from '@forgedx/core'
import { SURVEY_QUESTIONS } from '@forgedx/core'

/** Signal keys that file detection can confirm — skip survey for these */
const FILE_DETECTABLE = new Set([
  'no_navigation_root', 'no_claude_md', 'no_adr_files', 'no_spec_document',
  'no_spec_index', 'no_test_files', 'no_coverage_config', 'no_ci_gate',
  'no_pre_commit_hooks', 'no_contract_tests', 'no_e2e_tests', 'no_layer_enforcement',
  'no_env_example', 'no_deployment_doc', 'no_conventional_commits',
])

/** Answer index → signal detected mapping per question */
function answerIndexToSignals(questionKey: string, answerIndex: number): Record<string, boolean> {
  switch (questionKey) {
    case 'ai_session_context':
      // 0=has navigation root, 1=manual paste, 2=fresh each time, 3=no AI
      return {
        no_navigation_root: answerIndex >= 1,
        no_session_protocol: answerIndex >= 2,
      }
    case 'spec_first_discipline':
      // 0=spec-first, 1=concurrent, 2=after, 3=no spec
      return {
        spec_last_workflow: answerIndex >= 2,
        no_spec_document: answerIndex === 3,
      }
    case 'ai_output_gate':
      // 0=full gates, 1=manual+some tests, 2=review only, 3=commit immediately
      return {
        no_pre_commit_hooks: answerIndex >= 2,
        no_ci_gate: answerIndex >= 3,
      }
    case 'architectural_decisions':
      // 0=ADR files, 1=shared doc, 2=slack/informal, 3=in heads
      return {
        no_adr_files: answerIndex >= 2,
        no_decision_log: answerIndex >= 3,
      }
    case 'has_coverage_gate':
      // 0=CI 80%+, 1=CI<50%, 2=track not gate, 3=no CI/coverage
      return {
        no_ci_gate: answerIndex === 3,
        no_coverage_config: answerIndex >= 2,
      }
    case 'naming_consistency':
      // 0=vocabulary, 1=mostly, 2=inconsistent, 3=no standards
      return {
        inconsistent_naming: answerIndex >= 2,
        no_domain_vocabulary: answerIndex >= 3,
      }
    case 'contract_tests':
      // 0=hurl/postman, 1=integration real db, 2=unit only, 3=no tests
      return {
        no_contract_tests: answerIndex >= 2,
        no_e2e_tests: answerIndex >= 2,
      }
    case 'layer_enforcement':
      // 0=tools, 1=code review, 2=sometimes slips, 3=no enforcement
      return {
        no_layer_enforcement: answerIndex >= 2,
        no_dependency_rules: answerIndex >= 3,
      }
    case 'forbidden_patterns':
      // 0=documented+linting, 1=informal, 2=no list
      return {
        no_forbidden_patterns: answerIndex >= 1,
      }
    case 'spec_update_discipline':
      // 0=always, 1=usually, 2=rarely, 3=no spec
      return {
        spec_last_workflow: answerIndex >= 2,
        no_spec_document: answerIndex === 3,
      }
    case 'session_manifests':
      // 0=every time, 1=sometimes, 2=just prompt
      return {
        no_session_protocol: answerIndex >= 1,
      }
    case 'commit_message_quality':
      // 0=conventional, 1=descriptive, 2=brief, 3=no attention
      return {
        no_conventional_commits: answerIndex >= 2,
      }
    default:
      return {}
  }
}

export async function runSurvey(
  fileSignals: DetectedSignal[],
  funnelOnly = false,
): Promise<DetectedSignal[]> {
  const surveySignals: DetectedSignal[] = []
  const existingSignalKeys = new Set(fileSignals.map((s) => s.key))

  const questions = SURVEY_QUESTIONS
    .filter((q) => !funnelOnly || q.isFunnelVisible)
    .sort((a, b) => a.order - b.order)

  console.log()

  for (const q of questions) {
    // Skip if all signals for this question are already file-detected
    const allFileDetectable = q.signalKeys.every((k) => FILE_DETECTABLE.has(k))
    const alreadyCovered = q.signalKeys.every((k) => existingSignalKeys.has(k))

    if (allFileDetectable && alreadyCovered) continue

    const choices = q.options.map((option, i) => ({ name: option, value: i }))

    let answerIndex: number
    try {
      answerIndex = await select({
        message: q.questionText,
        choices,
      })
    } catch {
      // User cancelled (Ctrl+C) — skip remaining survey
      break
    }

    const signalResults = answerIndexToSignals(q.questionKey, answerIndex)

    for (const [signalKey, detected] of Object.entries(signalResults)) {
      // Only emit survey signal if file scanner didn't already detect it
      if (!existingSignalKeys.has(signalKey)) {
        surveySignals.push({
          key: signalKey,
          detected,
          source: 'survey',
          evidence: `Survey: "${q.options[answerIndex]}"`,
        })
        existingSignalKeys.add(signalKey)
      }
    }
  }

  return surveySignals
}
