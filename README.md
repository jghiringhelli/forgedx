# ⚡ ForgeDX

**Generative Specification Readiness Diagnostic**

Scan your codebase. Get a scored report. Know exactly where your team is vulnerable to AI-generation drift — and what to do about it.

> **Your code never leaves your machine.** ForgeDX runs entirely locally — no upload, no cloud, no NDA required.

---

## What It Does

ForgeDX scans your project's file structure, detects ~35 signals, asks you ~12 targeted questions, and generates a standalone HTML diagnostic report.

It scores your codebase against **29 pathologies** derived from the [Generative Specification white paper](https://pragmaworks.dev) — things like:

- 🔴 **Specification Debt** — code is the only source of truth
- 🔴 **Unchecked Generation** — AI output committed without running tests
- 🟠 **Session Amnesia** — AI starts fresh every session with no context
- 🟠 **Layer Violation** — business logic leaking into wrong architectural layers
- 🟡 **Rationale Loss** — no ADR files, no decision log

The result is a **GS Readiness Score (0–100)** with a grade, a prioritized list of findings, and a step-by-step remediation roadmap — all in a polished HTML file you can share with your team.

---

## Quickstart

### Option 1: Run directly with any AI assistant CLI

If you use **GitHub Copilot CLI**, **Claude Code**, **Cursor**, or any AI coding assistant with terminal access, just ask it:

```
Run `npx @forgedx/cli scan .` in this directory and show me the report
```

The assistant will run the scan, answer the survey on your behalf based on codebase context, and open the report.

### Option 2: Run yourself

```bash
# Scan current directory
npx @forgedx/cli scan .

# Scan a specific project
npx @forgedx/cli scan /path/to/my-project

# Skip the survey (file analysis only, faster)
npx @forgedx/cli scan . --no-survey

# 3-question quick check
npx @forgedx/cli quick .

# Save report to specific path
npx @forgedx/cli scan . --output ./reports/my-team-diagnostic.html
```

### Option 3: Install globally

```bash
npm install -g @forgedx/cli
forgedx scan .
```

---

## What Gets Scanned

ForgeDX never reads file *contents* for privacy-sensitive data. It checks for the *presence* of:

| Signal | Detects |
|--------|---------|
| `CLAUDE.md` / `AGENTS.md` | Navigation root for AI sessions |
| `docs/adrs/` | Architecture Decision Records |
| `docs/specs/` / `PRD*.md` | Specification documents |
| `*.test.*` / `*.spec.*` | Test files |
| `vitest.config.*` / `jest.config.*` | Coverage configuration |
| `.github/workflows/` | CI pipeline |
| `.husky/` / `.pre-commit-config.yaml` | Pre-commit hooks |
| `*.hurl` / `.postman_collection.json` | Contract tests |
| `playwright.config.*` / `cypress.config.*` | E2E tests |
| `.dependency-cruiser.*` | Layer enforcement |
| `docs/ports/` / `interfaces/` | Port/adapter pattern |
| `vocabulary.md` / `glossary.md` | Domain vocabulary |
| `.commitlintrc.*` | Conventional commits |
| `.env.example` | Environment documentation |
| `docs/standards/forbidden-patterns.md` | Forbidden patterns catalog |
| `.jscpd.json` | Code duplication gate |
| `knip.json` | Dead code gate |
| `README.md` | Project documentation |
| ... | 16 more signals |

**Survey questions** cover the remaining signals that can't be detected from file structure alone: spec-first discipline, AI session workflow, naming consistency, layer enforcement culture.

---

## Sample Output

```
  ⚡ ForgeDX — GS Readiness Diagnostic
  ─────────────────────────────────────
  Project: my-saas-app

  📂 Scanning project structure... 12 signals detected

  📝 A few quick questions (covers what files can't tell us)...

  ╔══════════════════════════════════════╗
  ║  GS Readiness Score: 58  — Grade C  ║
  ║  At Risk                            ║
  ╚══════════════════════════════════════╝

  Top findings:
    1. 🔴 P-004: Specification Debt (87 pts)
    2. 🔴 P-013: Unchecked Generation (82 pts)
    3. 🟠 P-002: Session Amnesia (75 pts)
    4. 🟠 P-008: Layer Violation (70 pts)
    5. 🟡 P-007: Rationale Loss (65 pts)

  Top remedies:
    1. R-001: Navigation Root (CLAUDE.md) [low effort, high impact]
    2. R-014: Pre-commit Gate Stack [medium effort, high impact]
    3. R-020: Specification-First Protocol [high effort, critical impact]

  📄 Report: ./forgedx-report-2026-06-15.html
  
  💡 Ready to fix this? https://pragmaworks.dev
```

The HTML report includes:
- Score arc with grade and interpretation
- Risk breakdown by GS property (7 properties)
- ⚡ Quick wins (high impact, low effort — do these first)
- All findings with evidence level and source (file vs. survey)
- Prioritized remedies with step-by-step implementation
- What is Generative Specification? explainer
- CTA to the PragmaWorks course and workshops

---

## Using With an AI Assistant

ForgeDX is designed to work hand-in-hand with AI coding assistants. The tool generates the diagnostic; the assistant helps you fix it.

### GitHub Copilot CLI

```bash
# In your project directory
gh copilot suggest "run forgedx scan on this project"

# Or just:
forgedx scan .
# Then ask: "Based on the forgedx-report.html findings, help me create CLAUDE.md"
```

### Claude Code / Cursor / Windsurf

After running the scan, open the report and paste the findings section into your AI session:

```
I ran ForgeDX on my project. Here are the top findings:

[paste findings from report]

Start with R-001 (Navigation Root). Help me create a CLAUDE.md for this project 
based on what you see in the codebase.
```

The AI has the exact remediation steps from the report. It knows what to build.

### Letting the AI answer the survey

If you're running ForgeDX through an AI assistant CLI, you can ask the assistant to answer the survey questions based on its knowledge of the codebase:

```
Run `forgedx scan .` and answer the survey questions based on what you observe 
in the codebase. For anything you're unsure about, choose the most conservative answer.
```

---

## The 29 Pathologies

| Code | Name | Severity | GS Property |
|------|------|----------|-------------|
| P-001 | Architectural Drift | CRITICAL | SELF_DESCRIBING |
| P-002 | Session Amnesia | HIGH | SELF_DESCRIBING |
| P-003 | Implicit Contract Syndrome | HIGH | COMPOSABLE |
| P-004 | Specification Debt | CRITICAL | SELF_DESCRIBING |
| P-005 | Context Overload | HIGH | BOUNDED |
| P-006 | Verification Gap | HIGH | VERIFIABLE |
| P-007 | Rationale Loss | MEDIUM | AUDITABLE |
| P-008 | Layer Violation | HIGH | COMPOSABLE |
| P-009 | Naming Anarchy | MEDIUM | SELF_DESCRIBING |
| P-010 | Test Surface Blindness | HIGH | VERIFIABLE |
| P-011 | ADR Absence | MEDIUM | AUDITABLE |
| P-012 | Contract Drift | HIGH | EXECUTABLE |
| P-013 | Unchecked Generation | CRITICAL | DEFENDED |
| P-014 | Silent Assumption | HIGH | DEFENDED |
| P-015 | Stale Specification | HIGH | AUDITABLE |
| P-016 | Dependency Tangle | HIGH | COMPOSABLE |
| P-017 | Code Duplication Creep | MEDIUM | COMPOSABLE |
| P-018 | Dead Code Accumulation | LOW | BOUNDED |
| P-019 | Environment Opacity | MEDIUM | SELF_DESCRIBING |
| P-020 | Gate Erosion | CRITICAL | DEFENDED |
| P-021 | Scope Creep Blindness | HIGH | BOUNDED |
| P-022 | Vocabulary Drift | MEDIUM | SELF_DESCRIBING |
| P-023 | Probe Absence | HIGH | EXECUTABLE |
| P-024 | Spec-Last Development | CRITICAL | SELF_DESCRIBING |
| P-025 | Port Rigidity | MEDIUM | COMPOSABLE |
| P-026 | Confidence Inflation | HIGH | VERIFIABLE |
| P-027 | Navigation Blindness | HIGH | BOUNDED |
| P-028 | Regression Blindness | HIGH | DEFENDED |
| P-029 | Deployment Opacity | MEDIUM | EXECUTABLE |

---

## How Scoring Works

ForgeDX uses a **deterministic hybrid scoring engine** — no LLM, no "AI confidence percentages". Same inputs always produce the same score.

Each pathology has a set of signals with weights. When a signal is detected:
- **From files**: base weight applies, plus a source bonus (file evidence is harder to fake than a survey answer)
- **From survey**: base weight applies with a smaller bonus
- Multiple signals pointing to the same pathology **corroborate** it, raising the evidence level

Evidence levels: `Weak → Moderate → Strong → Corroborated`

The **GS Readiness Score** (0–100) is derived by inverting the total weighted risk across all pathologies, adjusted by severity (CRITICAL pathologies penalize more than LOW ones).

---

## Why Local?

**Inspired by VairixDX** (which sends your code to a cloud API), ForgeDX takes the opposite approach:

| | VairixDX | ForgeDX |
|--|---------|---------|
| Code stays local | ❌ uploads to server | ✅ never leaves machine |
| NDA required | potentially | never |
| API keys needed | OpenAI + Supabase + Auth | none |
| Internet required | yes | no |
| Runs in CI | no | yes |
| Score method | LLM confidence | deterministic engine |

This makes ForgeDX safe for enterprise codebases, client work, and regulated industries.

---

## Fix What You Find

ForgeDX tells you **what** is wrong and **how** to fix it. The **Generative Specification method** is the system behind the remedies.

- 📖 **Learn the method** → [pragmaworks.dev](https://pragmaworks.dev)
- 🎓 **Course (self-paced)** → [skool.com/pragmaworks](https://www.skool.com/pragmaworks)
- 🏢 **Team workshop (in-person)** → [pragmaworks.dev/workshops](https://pragmaworks.dev)

The workshop takes your actual ForgeDX report and turns the findings into working infrastructure — CLAUDE.md, ADR files, gate stack, session manifest — customized to your team's stack.

---

## Contributing

ForgeDX is open source. To add a new signal detector:

1. Add the signal key to `packages/core/src/types.ts` (if new)
2. Add detection logic in `packages/cli/src/scanner/index.ts`
3. Wire the signal into the relevant pathology's `scoringRules.signals` in `packages/core/src/pathologies.ts`
4. Add a survey question if the signal can't be file-detected (in `packages/core/src/questions.ts`)

```bash
# Development
cd packages/cli
pnpm run dev -- scan /path/to/test-project --no-survey --no-open

# Typecheck
pnpm typecheck

# Test
pnpm test
```

---

*Built by [PragmaWorks](https://pragmaworks.dev) · MIT License*
