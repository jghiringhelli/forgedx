import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs'
import { join, extname } from 'node:path'
import type { DetectedSignal } from '@forgedx/core'

/**
 * Recursively collect all files up to maxDepth, skipping common noise dirs.
 * Returns paths relative to root.
 */
export function collectFiles(root: string, maxDepth = 6): string[] {
  const SKIP = new Set([
    'node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'coverage',
    '__pycache__', '.venv', 'vendor', '.turbo', '.cache',
  ])
  const files: string[] = []

  function walk(dir: string, depth: number) {
    if (depth > maxDepth) return
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      if (SKIP.has(entry)) continue
      const full = join(dir, entry)
      try {
        const stat = statSync(full)
        if (stat.isDirectory()) {
          walk(full, depth + 1)
        } else {
          files.push(full)
        }
      } catch {
        // skip unreadable
      }
    }
  }

  walk(root, 0)
  return files
}

/** Check if any file in the list matches any of the given patterns */
function hasMatch(files: string[], patterns: Array<string | RegExp>): string | null {
  for (const f of files) {
    const lower = f.toLowerCase().replace(/\\/g, '/')
    for (const p of patterns) {
      if (typeof p === 'string' && lower.includes(p)) return f
      if (p instanceof RegExp && p.test(lower)) return f
    }
  }
  return null
}

/** Read a file safely, return null on error */
function readSafe(path: string): string | null {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

/** Main scanner: detects all signals from the filesystem */
export function scanProject(projectPath: string): DetectedSignal[] {
  const files = collectFiles(projectPath)
  const rel = (f: string) => f.replace(projectPath, '').replace(/\\/g, '/')
  const signal = (key: string, detected: boolean, evidence?: string): DetectedSignal => ({
    key, detected, source: 'file', evidence,
  })

  // ── Navigation root ──────────────────────────────────────────────────────
  const claudeMd = hasMatch(files, [/\/(claude\.md|agents\.md|copilot-instructions\.md)$/i])
  const no_claude_md = !claudeMd
  const no_navigation_root = !claudeMd

  // Does CLAUDE.md actually reference other files? (not just a placeholder)
  let navigationQuality = 'none'
  if (claudeMd) {
    const content = readSafe(claudeMd) ?? ''
    const links = (content.match(/\[.*?\]\(.*?\)/g) ?? []).length
    const lines = content.split('\n').length
    if (links >= 3 && lines >= 20) navigationQuality = 'full'
    else if (links >= 1 || lines >= 10) navigationQuality = 'partial'
    else navigationQuality = 'empty'
  }

  // ── ADR files ─────────────────────────────────────────────────────────────
  const adrFiles = files.filter((f) =>
    /\/(adr|adrs|decisions|decision-records)\//i.test(f) ||
    /\/adr-\d+/i.test(f) ||
    /\/\d{3,4}-.*\.md$/i.test(f),
  )
  const no_adr_files = adrFiles.length === 0

  // ── Spec document ─────────────────────────────────────────────────────────
  const specFiles = files.filter((f) =>
    /\/(spec|specs|prd|design|architecture)\//i.test(f) ||
    /\/(spec|prd|techspec|tech-spec|architecture)\.md$/i.test(f),
  )
  const no_spec_document = specFiles.length === 0

  // ── Spec index (spec-map.md, index.md inside spec/) ───────────────────────
  const specIndex = hasMatch(files, [/\/(spec-map|spec-index|index)\.md$/i])
  const no_spec_index = !specIndex

  // Monolithic spec: single spec file > 200KB
  let monolithic_spec_file = false
  for (const f of specFiles) {
    try {
      const size = statSync(f).size
      if (size > 200 * 1024) {
        monolithic_spec_file = true
        break
      }
    } catch {}
  }

  // ── Test files ────────────────────────────────────────────────────────────
  const testFiles = files.filter((f) =>
    /\.(test|spec)\.(ts|tsx|js|jsx|py|rb|go|rs)$/.test(f) ||
    /\/__tests__\//.test(f) ||
    /\/test\//.test(f),
  )
  const no_test_files = testFiles.length === 0

  // ── Test coverage config ──────────────────────────────────────────────────
  const coverageConfig = hasMatch(files, [
    'vitest.config', 'jest.config', '.nycrc', 'codecov',
    /\/coverage\.json$/,
  ])
  // Check if coverage threshold is configured
  let no_coverage_config = !coverageConfig
  if (coverageConfig) {
    const content = readSafe(coverageConfig) ?? ''
    if (!/threshold|80|90|70/i.test(content)) no_coverage_config = true
  }

  // ── CI gate ───────────────────────────────────────────────────────────────
  const ciFiles = files.filter((f) =>
    /\/\.github\/workflows\//i.test(f) ||
    /\/(\.circleci|\.travis|jenkins|\.gitlab-ci)/i.test(f) ||
    /(ci\.yml|cd\.yml|pipeline\.yml|build\.yml)$/i.test(f),
  )
  const no_ci_gate = ciFiles.length === 0

  // ── Pre-commit hooks ──────────────────────────────────────────────────────
  const preCommitHook = hasMatch(files, [
    '/husky/', '/.husky/',
    '.pre-commit-config.yaml',
    /\/\.git\/hooks\/pre-commit$/,
    /\/lefthook\.(yml|yaml|json)$/i,
  ])
  const no_pre_commit_hooks = !preCommitHook

  // ── Contract / Hurl tests ─────────────────────────────────────────────────
  const contractTests = hasMatch(files, [
    '.hurl',
    '.postman_collection.json',
    /\/insomnia.*\.json$/i,
    /\/contracts\//i,
    /\/pact\//i,
  ])
  const no_contract_tests = !contractTests

  // ── E2E tests ─────────────────────────────────────────────────────────────
  const e2eTests = hasMatch(files, [
    'playwright.config', 'cypress.config',
    /\/e2e\//i,
    /\.e2e\.(ts|js|spec)/i,
    '.feature',
  ])
  const no_e2e_tests = !e2eTests

  // ── Layer enforcement ─────────────────────────────────────────────────────
  const layerEnforcement = hasMatch(files, [
    '.dependency-cruiser',
    'eslint-plugin-boundaries',
    /\/depcheck\.(js|cjs|json)$/i,
  ])
  // Also check package.json / eslint config for eslint-plugin-boundaries
  const pkgJson = hasMatch(files, [/\/package\.json$/])
  let no_layer_enforcement = !layerEnforcement
  if (pkgJson) {
    const content = readSafe(pkgJson) ?? ''
    if (content.includes('eslint-plugin-boundaries') || content.includes('dependency-cruiser')) {
      no_layer_enforcement = false
    }
  }

  // ── Dependency rules (explicit DI / ports pattern) ────────────────────────
  const portsDir = hasMatch(files, [/\/ports\//i, /\/adapters\//i, /\/interfaces\//i])
  const no_interface_definitions = !portsDir
  const no_dependency_rules = !layerEnforcement && !portsDir

  // ── Domain vocabulary ─────────────────────────────────────────────────────
  const vocabularyFile = hasMatch(files, [
    /\/vocab(ulary)?\.md$/i,
    /\/glossary\.md$/i,
    /\/dictionary\.md$/i,
    /\/ubiquitous-language\.md$/i,
  ])
  // Also check CLAUDE.md for a vocabulary section
  let no_domain_vocabulary = !vocabularyFile
  if (!vocabularyFile && claudeMd) {
    const content = readSafe(claudeMd) ?? ''
    if (/vocabulary|glossary|canonical|domain terms/i.test(content)) {
      no_domain_vocabulary = false
    }
  }

  // ── Conventional commits config ───────────────────────────────────────────
  const conventionalCommits = hasMatch(files, [
    '.commitlintrc',
    '.gitmessage',
    /\/commitlint\.config\./i,
    /\/conventional-changelog/i,
  ])
  const no_conventional_commits = !conventionalCommits

  // ── Session protocol ──────────────────────────────────────────────────────
  const sessionProtocol = hasMatch(files, [
    /\/session.*manifest/i,
    /\/sessions?\//i,
    /\/session-prompts\//i,
  ])
  // Also check CLAUDE.md for session protocol section
  let no_session_protocol = !sessionProtocol
  if (!sessionProtocol && claudeMd) {
    const content = readSafe(claudeMd) ?? ''
    if (/session.*manifest|every session|start.*session/i.test(content)) {
      no_session_protocol = false
    }
  }

  // ── Forbidden patterns doc ────────────────────────────────────────────────
  const forbiddenPatternsDoc = hasMatch(files, [
    /\/forbidden.?patterns/i,
    /\/anti.?patterns/i,
    /\/prohibited/i,
  ])
  let no_forbidden_patterns = !forbiddenPatternsDoc
  if (!forbiddenPatternsDoc && claudeMd) {
    const content = readSafe(claudeMd) ?? ''
    if (/forbidden|prohibited|never use|do not use/i.test(content)) {
      no_forbidden_patterns = false
    }
  }

  // ── Decision log ─────────────────────────────────────────────────────────
  const decisionLog = hasMatch(files, [
    /\/decision.?log/i,
    /\/changelog\.md$/i,
    /\/delta.?log/i,
  ])
  const no_decision_log = !decisionLog && no_adr_files

  // ── .env.example ─────────────────────────────────────────────────────────
  const envExample = hasMatch(files, ['.env.example', '.env.sample', '.env.template'])
  const no_env_example = !envExample

  // ── README ────────────────────────────────────────────────────────────────
  const readme = hasMatch(files, [/\/readme\.md$/i, /\/readme\.txt$/i])
  const no_readme = !readme

  // ── Deployment doc ────────────────────────────────────────────────────────
  const deployDoc = hasMatch(files, [
    /\/deploy(ment)?\.md$/i,
    /\/runbook/i,
    /\/ops\//i,
    'dockerfile',
    'docker-compose',
  ])
  const no_deployment_doc = !deployDoc

  // ── Executable spec (Hurl + spec in same place) ───────────────────────────
  const no_executable_spec = no_contract_tests && no_e2e_tests

  // ── Duplication gate ──────────────────────────────────────────────────────
  const dupGate = hasMatch(files, ['.jscpd', /jscpd\.config/i])
  const no_duplication_gate = !dupGate

  // ── Dead code gate ────────────────────────────────────────────────────────
  const deadCodeGate = hasMatch(files, ['knip.json', '.knip', /knip\.config/i])
  const no_dead_code_gate = !deadCodeGate

  // ── Shared utilities ─────────────────────────────────────────────────────
  const sharedUtils = hasMatch(files, [/\/utils?\//i, /\/shared\//i, /\/common\//i, /\/helpers?\//i])
  const no_shared_utilities = !sharedUtils

  // ── Regression fixtures ───────────────────────────────────────────────────
  const regressionFixtures = hasMatch(files, [/\/fixtures?\//i, /\/regression/i])
  const no_regression_fixtures = !regressionFixtures

  // ── File count heuristic (high files, no index) ───────────────────────────
  const srcFiles = files.filter((f) => /\.(ts|tsx|js|jsx|py|rb|go|rs|java|cs)$/.test(f))
  const high_file_count_no_index = srcFiles.length > 50 && no_spec_index

  // ── Naming consistency heuristic ─────────────────────────────────────────
  // Look for multiple names for common concepts in directory names
  const dirNames = files.map((f) => f.split('/').slice(-2, -1)[0]?.toLowerCase() ?? '').filter(Boolean)
  const userConcepts = dirNames.filter((d) => ['user', 'member', 'account', 'profile', 'person'].includes(d))
  const inconsistent_naming = new Set(userConcepts).size > 1

  // ── LLM used for scoring ─────────────────────────────────────────────────
  // Check if project uses OpenAI/LLM for scoring/confidence (antipattern)
  const llmUsed = hasMatch(files, [/openai/i, /anthropic/i, /gpt/i])
  let llm_used_for_scoring = false
  if (llmUsed) {
    const content = readSafe(llmUsed) ?? ''
    if (/confidence|score|probability|percentage/i.test(content)) {
      llm_used_for_scoring = true
    }
  }
  const no_deterministic_scoring = llm_used_for_scoring

  // ── Spec-last workflow heuristic ─────────────────────────────────────────
  // If there's code but no spec (detected above), it's likely spec-last
  const spec_last_workflow = !no_test_files && no_spec_document && specFiles.length === 0
  const no_defended_spec = no_forbidden_patterns && no_navigation_root

  // ── API spec doc ──────────────────────────────────────────────────────────
  const apiSpec = hasMatch(files, [
    /\/openapi\.(yml|yaml|json)$/i,
    /\/swagger\.(yml|yaml|json)$/i,
    /\/api(-spec|-docs)?\.md$/i,
  ])
  const no_api_spec_doc = !apiSpec

  return [
    signal('no_navigation_root', no_navigation_root, no_navigation_root ? 'No CLAUDE.md, AGENTS.md, or copilot-instructions.md found' : `Found: ${rel(claudeMd!)}`),
    signal('no_claude_md', no_claude_md, no_claude_md ? 'No CLAUDE.md found' : `Found: ${rel(claudeMd!)}`),
    signal('no_adr_files', no_adr_files, no_adr_files ? 'No ADR directory found (adrs/, decisions/, etc.)' : `Found ${adrFiles.length} ADR file(s)`),
    signal('no_spec_document', no_spec_document, no_spec_document ? 'No spec/docs directory or spec file found' : `Found ${specFiles.length} spec file(s)`),
    signal('no_spec_index', no_spec_index, no_spec_index ? 'No spec index or spec-map.md found' : `Found: ${rel(specIndex!)}`),
    signal('monolithic_spec_file', monolithic_spec_file, monolithic_spec_file ? 'Found spec file > 200KB (too large for context window)' : undefined),
    signal('high_file_count_no_index', high_file_count_no_index, high_file_count_no_index ? `${srcFiles.length} source files but no spec index` : undefined),
    signal('no_test_files', no_test_files, no_test_files ? 'No test files found (*.test.*, *.spec.*)' : `Found ${testFiles.length} test file(s)`),
    signal('no_coverage_config', no_coverage_config, no_coverage_config ? 'No coverage configuration with thresholds found' : `Found: ${rel(coverageConfig!)}`),
    signal('no_ci_gate', no_ci_gate, no_ci_gate ? 'No CI pipeline found (.github/workflows/, .circleci, etc.)' : `Found ${ciFiles.length} CI file(s)`),
    signal('no_pre_commit_hooks', no_pre_commit_hooks, no_pre_commit_hooks ? 'No pre-commit hooks found (husky, lefthook, .pre-commit-config.yaml)' : `Found: ${rel(preCommitHook!)}`),
    signal('no_contract_tests', no_contract_tests, no_contract_tests ? 'No contract tests found (.hurl, .postman, pact/)' : `Found: ${rel(contractTests!)}`),
    signal('no_e2e_tests', no_e2e_tests, no_e2e_tests ? 'No E2E tests found (playwright.config, cypress.config, e2e/)' : `Found: ${rel(e2eTests!)}`),
    signal('no_layer_enforcement', no_layer_enforcement, no_layer_enforcement ? 'No layer enforcement tool found (dependency-cruiser, eslint-plugin-boundaries)' : 'Layer enforcement configured'),
    signal('no_interface_definitions', no_interface_definitions, no_interface_definitions ? 'No ports/adapters/interfaces directory found' : `Found: ${rel(portsDir!)}`),
    signal('no_dependency_rules', no_dependency_rules, no_dependency_rules ? 'No dependency rules configured' : undefined),
    signal('no_domain_vocabulary', no_domain_vocabulary, no_domain_vocabulary ? 'No vocabulary.md, glossary.md, or vocabulary section in CLAUDE.md' : 'Vocabulary found'),
    signal('no_conventional_commits', no_conventional_commits, no_conventional_commits ? 'No commitlint or conventional commits config found' : `Found: ${rel(conventionalCommits!)}`),
    signal('no_session_protocol', no_session_protocol, no_session_protocol ? 'No session manifest or session protocol documentation found' : 'Session protocol found'),
    signal('no_forbidden_patterns', no_forbidden_patterns, no_forbidden_patterns ? 'No forbidden-patterns.md or anti-patterns documentation found' : 'Forbidden patterns documented'),
    signal('no_decision_log', no_decision_log, no_decision_log ? 'No decision log or changelog found' : 'Decision log found'),
    signal('no_env_example', no_env_example, no_env_example ? 'No .env.example or .env.sample found' : `Found: ${rel(envExample!)}`),
    signal('no_readme', no_readme, no_readme ? 'No README.md found' : `Found: ${rel(readme!)}`),
    signal('no_deployment_doc', no_deployment_doc, no_deployment_doc ? 'No deployment docs, Dockerfile, or docker-compose found' : 'Deployment documentation found'),
    signal('no_executable_spec', no_executable_spec, no_executable_spec ? 'No executable spec (contract tests + E2E)' : undefined),
    signal('no_duplication_gate', no_duplication_gate, no_duplication_gate ? 'No jscpd or duplication gate configured' : 'Duplication gate configured'),
    signal('no_dead_code_gate', no_dead_code_gate, no_dead_code_gate ? 'No knip or dead code gate configured' : 'Dead code gate configured'),
    signal('no_shared_utilities', no_shared_utilities, no_shared_utilities ? 'No shared utilities/helpers directory found' : `Found: ${rel(sharedUtils!)}`),
    signal('no_regression_fixtures', no_regression_fixtures, no_regression_fixtures ? 'No regression fixtures directory found' : `Found: ${rel(regressionFixtures!)}`),
    signal('inconsistent_naming', inconsistent_naming, inconsistent_naming ? 'Multiple names detected for same domain concept in directory names' : undefined),
    signal('no_api_spec_doc', no_api_spec_doc, no_api_spec_doc ? 'No OpenAPI/Swagger spec or api-spec.md found' : `Found: ${rel(apiSpec!)}`),
    signal('llm_used_for_scoring', llm_used_for_scoring, llm_used_for_scoring ? 'LLM appears to be used for scoring/confidence — consider hybrid deterministic engine' : undefined),
    signal('no_deterministic_scoring', no_deterministic_scoring),
    signal('spec_last_workflow', spec_last_workflow, spec_last_workflow ? 'Code exists but no spec found — likely spec-last development' : undefined),
    signal('no_defended_spec', no_defended_spec, no_defended_spec ? 'No forbidden patterns + no navigation root = undefended spec' : undefined),
    signal('tests_not_behavioral', testFiles.length > 0 && testFiles.filter((f) => /behavior|should|given.*when.*then/i.test(readSafe(f) ?? '')).length === 0, 'Tests may not follow behavioral naming conventions'),
  ]
}
