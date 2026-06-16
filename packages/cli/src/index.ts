#!/usr/bin/env node
import { Command } from 'commander'
import { resolve, join } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'
import { exec } from 'node:child_process'
import { buildDiagnosticResult, computeReadinessScore, getReadinessGrade } from '@forgedx/core'
import { scanProject } from './scanner/index.js'
import { runSurvey } from './survey/index.js'
import { generateHtmlReport } from './report/generator.js'

const program = new Command()

program
  .name('forgedx')
  .description('GS Readiness Diagnostic — understand how ready your team is for AI-assisted development')
  .version('0.1.0')

program
  .command('scan [path]')
  .description('Scan a project directory and generate a GS readiness diagnostic report')
  .option('-o, --output <path>', 'Output path for the HTML report')
  .option('--no-survey', 'Skip the interactive survey (file analysis only)')
  .option('--no-open', 'Do not open the report in a browser after generation')
  .option('--funnel', 'Run the short 3-question funnel survey only')
  .action(async (scanPath: string | undefined, options: {
    output?: string
    survey: boolean
    open: boolean
    funnel?: boolean
  }) => {
    const targetPath = resolve(scanPath ?? '.')

    if (!existsSync(targetPath)) {
      console.error(`\n❌ Path not found: ${targetPath}\n`)
      process.exit(1)
    }

    console.log('\n')
    console.log('  ⚡ ForgeDX — GS Readiness Diagnostic')
    console.log('  ─────────────────────────────────────')
    console.log(`  Project: ${targetPath}`)
    console.log()

    // Step 1: File scanner
    process.stdout.write('  📂 Scanning project structure...')
    const fileSignals = scanProject(targetPath)
    const detectedCount = fileSignals.filter((s) => s.detected).length
    console.log(` ${detectedCount} signals detected\n`)

    // Step 2: Survey (unless skipped)
    let surveySignals: import('@forgedx/core').DetectedSignal[] = []
    if (options.survey !== false) {
      console.log('  📝 A few quick questions to complete the picture:')
      console.log('     (These cover things we can\'t detect from files alone)\n')
      surveySignals = await runSurvey(fileSignals, options.funnel ?? false)
    }

    // Step 3: Scoring
    const allSignals = [...fileSignals, ...surveySignals]
    const result = buildDiagnosticResult(targetPath, allSignals)
    const score = computeReadinessScore(result.scored)
    const grade = getReadinessGrade(score)

    // Step 4: Report
    const reportPath = generateHtmlReport(result, options.output)

    // Step 5: Summary
    console.log('\n')
    console.log('  ╔══════════════════════════════════════╗')
    console.log(`  ║  GS Readiness Score: ${String(score).padEnd(3)} — Grade ${grade.grade}  ║`)
    console.log(`  ║  ${grade.label.padEnd(38)}║`)
    console.log('  ╚══════════════════════════════════════╝')
    console.log()

    if (result.findings.length > 0) {
      console.log('  Top findings:')
      result.findings.slice(0, 5).forEach((f, i) => {
        const emoji = { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🔵' }[f.pathology.severity] ?? '⚪'
        console.log(`    ${i + 1}. ${emoji} ${f.pathology.code}: ${f.pathology.name} (${Math.round(f.score)} pts)`)
      })
      console.log()
    }

    if (result.recommendations.length > 0) {
      console.log('  Top remedies:')
      result.recommendations.slice(0, 3).forEach((r, i) => {
        console.log(`    ${i + 1}. ${r.remedy.code}: ${r.remedy.name} [${r.remedy.effort} effort, ${r.remedy.impact} impact]`)
      })
      console.log()
    }

    console.log(`  📄 Report: ${reportPath}`)
    console.log()

    if (score < 65) {
      console.log('  💡 Ready to fix this? The Generative Specification method addresses all findings:')
      console.log('     🎓 Course → https://www.skool.com/pragmaworks')
      console.log('     🌐 Method → https://pragmaworks.dev')
      console.log()
    }

    // Open in browser
    if (options.open !== false) {
      const openCmd = process.platform === 'win32' ? `start "" "${reportPath}"`
        : process.platform === 'darwin' ? `open "${reportPath}"`
        : `xdg-open "${reportPath}"`
      exec(openCmd)
    }
  })

program
  .command('quick [path]')
  .description('Run a 3-question funnel assessment (no full survey)')
  .action(async (scanPath?: string) => {
    const targetPath = resolve(scanPath ?? '.')
    console.log('\n  ⚡ ForgeDX Quick Scan (3 questions)\n')
    const fileSignals = scanProject(targetPath)
    const surveySignals = await runSurvey(fileSignals, true)
    const allSignals = [...fileSignals, ...surveySignals]
    const result = buildDiagnosticResult(targetPath, allSignals)
    const score = computeReadinessScore(result.scored)
    const grade = getReadinessGrade(score)

    console.log(`\n  Score: ${score}/100 — ${grade.label}`)
    console.log(`  Top issues: ${result.findings.slice(0, 3).map((f) => f.pathology.name).join(', ')}`)
    console.log('\n  Run `forgedx scan` for the full diagnostic + HTML report.\n')
  })

program.parse()
