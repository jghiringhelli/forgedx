import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { DiagnosticResult, ScoredPathology } from '@forgedx/core'
import { computeReadinessScore, getReadinessGrade } from '@forgedx/core'

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#3b82f6',
}
const SEVERITY_BG: Record<string, string> = {
  CRITICAL: '#ef444415',
  HIGH: '#f9731615',
  MEDIUM: '#f59e0b15',
  LOW: '#3b82f615',
}
const EVIDENCE_COLOR: Record<string, string> = {
  CORROBORATED: '#ef4444',
  STRONG: '#f97316',
  MODERATE: '#f59e0b',
  WEAK: '#94a3b8',
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function severityIcon(s: string) {
  return { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🔵' }[s] ?? '⚪'
}

function effortIcon(e: string) {
  return { low: '🟢', medium: '🟡', high: '🔴' }[e] ?? '⚪'
}

function impactIcon(i: string) {
  return { critical: '🚀', high: '⬆️', medium: '➡️', low: '⬇️' }[i] ?? ''
}

function scoreBar(score: number, max = 150): string {
  const pct = Math.min((score / max) * 100, 100).toFixed(1)
  const color = score > 80 ? '#ef4444' : score > 50 ? '#f97316' : score > 25 ? '#f59e0b' : '#3b82f6'
  return `<div class="score-bar-wrap"><div class="score-bar" style="width:${pct}%;background:${color}"></div></div>`
}

function renderFinding(f: ScoredPathology, index: number): string {
  const color = SEVERITY_COLOR[f.pathology.severity] ?? '#94a3b8'
  const bg = SEVERITY_BG[f.pathology.severity] ?? '#ffffff08'
  const evColor = EVIDENCE_COLOR[f.evidenceLevel] ?? '#94a3b8'
  const evLabel = ({ CORROBORATED: 'Corroborated', STRONG: 'Strong evidence', MODERATE: 'Moderate evidence', WEAK: 'Weak signal', NONE: '' } as Record<string, string>)[f.evidenceLevel] ?? f.evidenceLevel
  const fileSignals = f.matchedSignals.filter((s) => s.source === 'file')
  const surveySignals = f.matchedSignals.filter((s) => s.source === 'survey')

  return `
<div class="card finding" style="--sev-color:${color};--sev-bg:${bg}">
  <div class="finding-stripe"></div>
  <div class="finding-body">
    <div class="finding-top">
      <div class="finding-meta">
        <span class="badge-code">${esc(f.pathology.code)}</span>
        <span class="badge-sev" style="color:${color};background:${color}18;border-color:${color}44">${severityIcon(f.pathology.severity)} ${esc(f.pathology.severity)}</span>
        <span class="badge-ev" style="color:${evColor};background:${evColor}12;border-color:${evColor}35">${evLabel}</span>
      </div>
      <div class="finding-score">
        <span class="score-pts" style="color:${evColor}">${Math.round(f.score)}</span>
        <span class="score-unit">pts</span>
      </div>
    </div>
    <h3 class="finding-title">${esc(f.pathology.name)}</h3>
    <p class="finding-desc">${esc(f.pathology.description)}</p>
    ${scoreBar(f.score)}
    <div class="finding-footer">
      <span class="gs-prop">GS property at risk: <strong>${esc(f.pathology.gsProperty)}</strong></span>
      <div class="signals">
        ${fileSignals.map((s) => `<span class="sig sig-file" title="Detected from files">📁 ${esc(s.signal.replace(/_/g, ' '))}</span>`).join('')}
        ${surveySignals.map((s) => `<span class="sig sig-survey" title="Confirmed by survey">💬 ${esc(s.signal.replace(/_/g, ' '))}</span>`).join('')}
      </div>
    </div>
  </div>
</div>`
}

function renderRemedy(
  r: DiagnosticResult['recommendations'][number],
  index: number,
): string {
  const typeLabel: Record<string, string> = {
    practice: '📚 Practice',
    protocol: '📋 Protocol',
    tool: '🔧 Tool',
    gate: '🚧 Gate',
  }
  const addresses = r.addressesPathologies
    .map((c) => `<span class="tag-code">${esc(c)}</span>`)
    .join('')
  const steps = r.remedy.steps
    .map((s, i) => `<li><span class="step-num">${i + 1}</span>${esc(s)}</li>`)
    .join('')

  return `
<div class="card remedy">
  <div class="remedy-rank">${index + 1}</div>
  <div class="remedy-body">
    <div class="remedy-top">
      <div class="remedy-meta">
        <span class="tag-type">${typeLabel[r.remedy.remediationType] ?? r.remedy.remediationType}</span>
        <span class="tag-effort">${effortIcon(r.remedy.effort)} ${esc(r.remedy.effort)} effort</span>
        <span class="tag-impact">${impactIcon(r.remedy.impact)} ${esc(r.remedy.impact)} impact</span>
      </div>
      <div class="addresses-wrap">Fixes: ${addresses}</div>
    </div>
    <h3 class="remedy-title"><span class="remedy-code">${esc(r.remedy.code)}</span> ${esc(r.remedy.name)}</h3>
    <p class="remedy-desc">${esc(r.remedy.description)}</p>
    <details class="steps-detail">
      <summary>Implementation steps →</summary>
      <ol class="steps">${steps}</ol>
    </details>
  </div>
</div>`
}

function groupByGsProperty(findings: ScoredPathology[]): Map<string, ScoredPathology[]> {
  const map = new Map<string, ScoredPathology[]>()
  for (const f of findings) {
    const key = f.pathology.gsProperty
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(f)
  }
  return map
}

const GS_PROPERTY_DESCRIPTIONS: Record<string, string> = {
  SELF_DESCRIBING: 'The codebase can explain itself to any AI or human without oral tradition.',
  BOUNDED: 'Context is scoped — no agent loads everything to answer anything.',
  DEFENDED: 'Quality gates block unvalidated AI output from reaching production.',
  AUDITABLE: 'Every decision, deviation, and change is traceable.',
  COMPOSABLE: 'Modules can be swapped, reused, or extended without cascading breakage.',
  VERIFIABLE: 'Behavior is proven by tests, not assumed by inspection.',
  EXECUTABLE: 'The spec runs — probes confirm the system does what it says.',
}
export function generateHtmlReport(result: DiagnosticResult, outputPath?: string): string {
  const score = computeReadinessScore(result.scored)
  const grade = getReadinessGrade(score)
  const projectName = result.projectPath.split(/[/\\]/).filter(Boolean).pop() ?? 'Unknown Project'
  const scanDate = result.scannedAt.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const fileSignalCount = result.signals.filter((s) => s.detected && s.source === 'file').length
  const surveySignalCount = result.signals.filter((s) => s.detected && s.source === 'survey').length
  const totalSignalsScanned = result.signals.length

  const criticalFindings = result.findings.filter((f) => f.pathology.severity === 'CRITICAL')
  const highFindings = result.findings.filter((f) => f.pathology.severity === 'HIGH')
  const mediumFindings = result.findings.filter((f) => f.pathology.severity === 'MEDIUM')
  const lowFindings = result.findings.filter((f) => f.pathology.severity === 'LOW')

  const quickWins = result.recommendations.filter(
    (r) => r.remedy.effort === 'low' && (r.remedy.impact === 'high' || r.remedy.impact === 'critical'),
  )

  const findingsHtml = result.findings.length > 0
    ? result.findings.map((f, i) => renderFinding(f, i)).join('')
    : `<div class="empty-state">No significant findings detected.</div>`

  const remediesHtml = result.recommendations.length > 0
    ? result.recommendations.map((r, i) => renderRemedy(r, i)).join('')
    : `<div class="empty-state">No remedies needed.</div>`

  const quickWinsHtml = quickWins.length > 0
    ? `<div class="quick-wins">
        <div class="quick-wins-title">Quick Wins — High impact, low effort</div>
        <div class="quick-wins-list">
          ${quickWins.map((r) => `<div class="quick-win-item">
            <span class="quick-win-code">${esc(r.remedy.code)}</span>
            <span class="quick-win-name">${esc(r.remedy.name)}</span>
            <span class="quick-win-fixes">fixes ${r.addressesPathologies.join(', ')}</span>
          </div>`).join('')}
        </div>
      </div>`
    : ''

  const groupedFindings = groupByGsProperty(result.findings)
  const propertyBreakdownHtml = [...groupedFindings.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([prop, findings]) => {
      const worstSev = findings.some((f) => f.pathology.severity === 'CRITICAL') ? 'CRITICAL'
        : findings.some((f) => f.pathology.severity === 'HIGH') ? 'HIGH'
        : findings.some((f) => f.pathology.severity === 'MEDIUM') ? 'MEDIUM' : 'LOW'
      const color = SEVERITY_COLOR[worstSev] ?? '#94a3b8'
      return `<div class="prop-card" style="border-color:${color}44">
        <div class="prop-name" style="color:${color}">${esc(prop.replace('_', ' '))}</div>
        <div class="prop-count">${findings.length} finding${findings.length > 1 ? 's' : ''}</div>
        <div class="prop-desc">${esc(GS_PROPERTY_DESCRIPTIONS[prop] ?? '')}</div>
        <div class="prop-codes">${findings.map((f) => `<span>${esc(f.pathology.code)}</span>`).join('')}</div>
      </div>`
    }).join('')

  const gradeDescriptions: Record<string, string> = {
    A: 'Your codebase shows strong GS discipline. A few targeted improvements will bring you to elite readiness.',
    B: 'Good foundation with clear improvement areas. Addressing the top findings will significantly reduce AI-generation risk.',
    C: 'Meaningful GS gaps exist. Without addressing these, AI-assisted development accumulates technical debt faster than you can resolve it.',
    D: 'Significant GS debt detected. AI sessions operate largely without guardrails — each commit compounds the risk.',
    F: 'Critical GS debt detected. Highly vulnerable to AI-generation drift, specification decay, and undetected regressions.',
  }

  const outPath = outputPath ?? join(process.cwd(), `forgedx-report-${result.scannedAt.toISOString().slice(0, 10)}.html`)
  writeFileSync(outPath, buildHtml({ score, grade, projectName, scanDate, fileSignalCount, surveySignalCount, totalSignalsScanned, criticalFindings, highFindings, mediumFindings, lowFindings, quickWinsHtml, groupedFindings, propertyBreakdownHtml, findingsHtml, remediesHtml, gradeDescriptions, result }), 'utf8')
  return outPath
}

function buildHtml(d: {
  score: number; grade: ReturnType<typeof getReadinessGrade>; projectName: string; scanDate: string
  fileSignalCount: number; surveySignalCount: number; totalSignalsScanned: number
  criticalFindings: import('@forgedx/core').ScoredPathology[]
  highFindings: import('@forgedx/core').ScoredPathology[]
  mediumFindings: import('@forgedx/core').ScoredPathology[]
  lowFindings: import('@forgedx/core').ScoredPathology[]
  quickWinsHtml: string; groupedFindings: Map<string, import('@forgedx/core').ScoredPathology[]>
  propertyBreakdownHtml: string; findingsHtml: string; remediesHtml: string
  gradeDescriptions: Record<string, string>; result: DiagnosticResult
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ForgeDX — ${esc(d.projectName)}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--brand:#6366f1;--brand-light:#818cf8;--bg:#0c0c10;--surface:#14141c;--surface2:#1e1e28;--surface3:#28283a;--text:#e2e8f0;--text-muted:#8892a4;--text-dim:#555d6b;--border:#1e2235;--border2:#252840;--radius:14px;--radius-sm:8px;--shadow:0 4px 24px rgba(0,0,0,.45)}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.65;-webkit-font-smoothing:antialiased}
a{color:var(--brand-light);text-decoration:none}a:hover{text-decoration:underline}strong{font-weight:700}
.container{max-width:880px;margin:0 auto;padding:0 20px 100px}
.header{background:linear-gradient(160deg,#0d0d1a 0%,#111127 40%,#0d1535 100%);border-bottom:1px solid var(--border2);padding:52px 24px 44px;text-align:center;position:relative;overflow:hidden}
.header::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 50% 0%,#6366f122 0%,transparent 70%);pointer-events:none}
.header-logo{font-size:2rem;font-weight:900;letter-spacing:-1px;background:linear-gradient(135deg,#c7d2fe,#818cf8,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:inline-flex;align-items:center;gap:8px}
.header-tagline{color:var(--text-muted);font-size:.85rem;margin-top:6px;letter-spacing:.5px}
.header-project{font-size:1.6rem;font-weight:800;margin-top:28px;color:var(--text)}
.header-date{color:var(--text-dim);font-size:.8rem;margin-top:6px}
.header-signals{display:inline-flex;gap:20px;margin-top:20px;background:var(--surface);border:1px solid var(--border2);border-radius:999px;padding:8px 24px;font-size:.8rem;color:var(--text-muted)}
.header-signals strong{color:var(--text)}
.score-hero{background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius);margin:28px 0 0;padding:40px 32px;text-align:center;position:relative;overflow:hidden}
.score-hero::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:${d.grade.color}}
.score-arc-wrap{display:inline-block;position:relative;width:160px;height:160px;margin-bottom:20px}
.score-arc{width:160px;height:160px;transform:rotate(-90deg)}
.score-arc-bg{fill:none;stroke:var(--surface3);stroke-width:12;stroke-linecap:round}
.score-arc-fill{fill:none;stroke:${d.grade.color};stroke-width:12;stroke-linecap:round;stroke-dasharray:${(d.score/100*408).toFixed(0)} 408;filter:drop-shadow(0 0 8px ${d.grade.color}66)}
.score-num{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:3rem;font-weight:900;color:${d.grade.color};line-height:1}
.score-denom{font-size:.75rem;color:var(--text-muted)}
.grade-pill{display:inline-block;font-size:1.1rem;font-weight:800;background:${d.grade.color}18;color:${d.grade.color};border:2px solid ${d.grade.color}44;border-radius:999px;padding:6px 22px;margin-bottom:10px;letter-spacing:.5px}
.grade-name{font-size:1.3rem;font-weight:700;color:var(--text);margin-bottom:12px}
.grade-desc{color:var(--text-muted);font-size:.9rem;max-width:520px;margin:0 auto 28px}
.sev-grid{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.sev-box{background:var(--surface2);border:1px solid var(--border2);border-radius:var(--radius-sm);padding:16px 24px;text-align:center;min-width:90px}
.sev-num{font-size:2rem;font-weight:900;line-height:1}
.sev-label{font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-top:2px}
.section-head{display:flex;align-items:baseline;gap:12px;margin:48px 0 6px;padding-bottom:14px;border-bottom:1px solid var(--border)}
.section-head h2{font-size:1.2rem;font-weight:800;color:var(--text)}
.section-count{font-size:.75rem;font-weight:700;background:var(--surface2);color:var(--text-muted);border:1px solid var(--border2);border-radius:999px;padding:2px 10px}
.section-sub{color:var(--text-muted);font-size:.85rem;margin-bottom:20px}
.pill-file{display:inline-block;background:#3b82f618;color:#60a5fa;border:1px solid #3b82f633;border-radius:4px;padding:0 6px;font-size:.8rem}
.pill-survey{display:inline-block;background:#a78bfa18;color:#c4b5fd;border:1px solid #a78bfa33;border-radius:4px;padding:0 6px;font-size:.8rem}
.card{background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius);margin-bottom:14px;display:flex;overflow:hidden;box-shadow:var(--shadow)}
.finding{border-left:3px solid var(--sev-color)}
.finding-body{padding:22px 24px;flex:1;min-width:0}
.finding-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px;flex-wrap:wrap}
.finding-meta{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.badge-code{font-family:monospace;font-size:.8rem;font-weight:700;color:var(--text-muted);background:var(--surface2);border:1px solid var(--border2);border-radius:4px;padding:2px 8px}
.badge-sev,.badge-ev{font-size:.72rem;font-weight:700;border:1px solid;border-radius:4px;padding:2px 8px;white-space:nowrap}
.finding-score{display:flex;align-items:baseline;gap:3px;flex-shrink:0}
.score-pts{font-size:1.4rem;font-weight:900}
.score-unit{font-size:.7rem;color:var(--text-muted)}
.finding-title{font-size:1rem;font-weight:700;color:var(--text);margin-bottom:6px}
.finding-desc{font-size:.875rem;color:var(--text-muted);margin-bottom:12px}
.score-bar-wrap{height:3px;background:var(--surface3);border-radius:2px;margin-bottom:12px;overflow:hidden}
.score-bar{height:100%;border-radius:2px}
.finding-footer{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}
.gs-prop{font-size:.75rem;color:var(--text-dim)}.gs-prop strong{color:var(--brand-light)}
.signals{display:flex;flex-wrap:wrap;gap:4px}
.sig{font-size:.7rem;border-radius:4px;padding:2px 7px;border:1px solid}
.sig-file{background:#3b82f610;border-color:#3b82f630;color:#60a5fa}
.sig-survey{background:#a78bfa10;border-color:#a78bfa30;color:#c4b5fd}
.remedy{align-items:stretch}
.remedy-rank{width:52px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--surface2);font-size:1.2rem;font-weight:900;color:var(--text-muted);border-right:1px solid var(--border2)}
.remedy-body{padding:22px 24px;flex:1;min-width:0}
.remedy-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px;flex-wrap:wrap}
.remedy-meta{display:flex;gap:6px;flex-wrap:wrap}
.tag-type,.tag-effort,.tag-impact{font-size:.72rem;font-weight:600;background:var(--surface2);border:1px solid var(--border2);border-radius:4px;padding:2px 8px;color:var(--text-muted)}
.addresses-wrap{font-size:.75rem;color:var(--text-dim)}
.tag-code{display:inline-block;font-family:monospace;font-size:.75rem;font-weight:700;background:var(--brand)15;border:1px solid var(--brand)30;color:var(--brand-light);border-radius:3px;padding:0 5px;margin:1px}
.remedy-title{font-size:1rem;font-weight:700;margin-bottom:6px}
.remedy-code{font-family:monospace;font-size:.85rem;font-weight:700;color:var(--text-muted);margin-right:6px}
.remedy-desc{font-size:.875rem;color:var(--text-muted);margin-bottom:12px}
.steps-detail summary{cursor:pointer;font-size:.82rem;font-weight:600;color:var(--brand-light);user-select:none;list-style:none;outline:none}
.steps-detail summary::-webkit-details-marker{display:none}
.steps{margin-top:12px;padding-left:0;list-style:none;display:flex;flex-direction:column;gap:6px}
.steps li{display:flex;gap:10px;font-size:.82rem;color:var(--text-muted);align-items:baseline}
.step-num{flex-shrink:0;width:20px;height:20px;border-radius:50%;background:var(--surface2);border:1px solid var(--border2);display:inline-flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;color:var(--text-dim)}
.quick-wins{background:linear-gradient(135deg,#052e16,#064e3b);border:1px solid #065f4655;border-radius:var(--radius);padding:20px 24px;margin-bottom:28px}
.quick-wins-title{font-size:.9rem;font-weight:700;color:#86efac;margin-bottom:14px}
.quick-wins-list{display:flex;flex-direction:column;gap:8px}
.quick-win-item{display:flex;align-items:center;gap:10px;font-size:.82rem}
.quick-win-code{font-family:monospace;font-weight:700;color:#4ade80;background:#05280f;border:1px solid #16a34a44;border-radius:4px;padding:1px 7px}
.quick-win-name{color:#d1fae5;font-weight:600}
.quick-win-fixes{color:#6ee7b7;font-size:.75rem}
.prop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:12px}
.prop-card{background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius-sm);padding:16px}
.prop-name{font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px}
.prop-count{font-size:1.2rem;font-weight:900;color:var(--text);margin-bottom:6px}
.prop-desc{font-size:.75rem;color:var(--text-muted);margin-bottom:8px;line-height:1.4}
.prop-codes{display:flex;flex-wrap:wrap;gap:4px}
.prop-codes span{font-family:monospace;font-size:.68rem;background:var(--surface2);border:1px solid var(--border2);border-radius:3px;padding:0 5px;color:var(--text-dim)}
.explainer{background:linear-gradient(135deg,#0f0c29,#1a1650);border:1px solid #4338ca44;border-radius:var(--radius);padding:36px 32px;margin-top:48px}
.explainer h2{font-size:1.2rem;font-weight:800;margin-bottom:8px;color:#c7d2fe}
.explainer p{font-size:.875rem;color:#a5b4fc;margin-bottom:16px;line-height:1.7}
.gs-props-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-top:16px}
.gs-prop-item{background:#1e1b4b;border:1px solid #312e8155;border-radius:8px;padding:12px 14px}
.gs-prop-item-name{font-size:.75rem;font-weight:800;color:#818cf8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
.gs-prop-item-desc{font-size:.75rem;color:#a5b4fc;line-height:1.4}
.cta{background:linear-gradient(135deg,#1e1b4b 0%,#2e1065 60%,#1e0a3c 100%);border:1px solid #6d28d966;border-radius:var(--radius);padding:52px 36px;text-align:center;margin-top:48px;position:relative;overflow:hidden}
.cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 40% at 50% 0%,#7c3aed22,transparent);pointer-events:none}
.cta h2{font-size:2rem;font-weight:900;margin-bottom:12px;letter-spacing:-.5px}
.cta p{color:#c4b5fd;font-size:.95rem;max-width:520px;margin:0 auto 32px;line-height:1.7}
.cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.btn{display:inline-block;padding:14px 32px;border-radius:10px;font-weight:700;font-size:.95rem;cursor:pointer;transition:opacity .15s,transform .15s}
.btn:hover{opacity:.88;transform:translateY(-1px);text-decoration:none}
.btn-primary{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 4px 20px #6366f155}
.btn-outline{background:transparent;color:#c4b5fd;border:2px solid #7c3aed88}
.cta-divider{margin:32px auto;max-width:300px;border:none;border-top:1px solid #4c1d9544}
.cta-workshop p{font-size:.85rem;color:#a78bfa;max-width:460px;margin:8px auto 0}
.cta-workshop strong{color:#ddd6fe}
.privacy-note{margin-top:24px;display:inline-flex;align-items:center;gap:6px;font-size:.75rem;color:#7c3aed;background:#1a0533;border:1px solid #4c1d9544;border-radius:999px;padding:4px 14px}
.footer{text-align:center;padding:32px 24px;color:var(--text-dim);font-size:.78rem;border-top:1px solid var(--border)}
.footer a{color:var(--text-muted)}
.footer strong{color:var(--brand-light)}
.empty-state{background:var(--surface);border:1px dashed var(--border2);border-radius:var(--radius);padding:36px;text-align:center;color:var(--text-muted);font-size:.9rem}
@media(max-width:640px){.sev-grid{gap:8px}.sev-box{min-width:70px;padding:12px 14px}}
@media print{body{background:#fff;color:#111}.card,.score-hero,.prop-card,.explainer,.cta{border:1px solid #ddd;box-shadow:none}.header{background:#f8f8ff;border:none}.cta-btns{display:none}details{display:block}}
</style>
</head>
<body>
<div class="header">
  <div class="header-logo">⚡ ForgeDX</div>
  <div class="header-tagline">Generative Specification Readiness Diagnostic</div>
  <div class="header-project">${esc(d.projectName)}</div>
  <div class="header-date">${esc(d.scanDate)}</div>
  <div class="header-signals">
    <span>📁 <strong>${d.fileSignalCount}</strong> from files</span>
    <span>💬 <strong>${d.surveySignalCount}</strong> from survey</span>
    <span>🔍 <strong>${d.totalSignalsScanned}</strong> checks</span>
  </div>
</div>
<div class="container">
  <div class="score-hero">
    <div class="score-arc-wrap">
      <svg class="score-arc" viewBox="0 0 160 160">
        <circle class="score-arc-bg" cx="80" cy="80" r="65"/>
        <circle class="score-arc-fill" cx="80" cy="80" r="65"/>
      </svg>
      <div class="score-num">${d.score}<div class="score-denom">/100</div></div>
    </div>
    <div class="grade-pill">Grade ${d.grade.grade}</div>
    <div class="grade-name">${esc(d.grade.label)}</div>
    <p class="grade-desc">${esc(d.gradeDescriptions[d.grade.grade] ?? '')}</p>
    <div class="sev-grid">
      <div class="sev-box"><div class="sev-num" style="color:#ef4444">${d.criticalFindings.length}</div><div class="sev-label">Critical</div></div>
      <div class="sev-box"><div class="sev-num" style="color:#f97316">${d.highFindings.length}</div><div class="sev-label">High</div></div>
      <div class="sev-box"><div class="sev-num" style="color:#f59e0b">${d.mediumFindings.length}</div><div class="sev-label">Medium</div></div>
      <div class="sev-box"><div class="sev-num" style="color:#3b82f6">${d.lowFindings.length}</div><div class="sev-label">Low</div></div>
      <div class="sev-box"><div class="sev-num" style="color:#818cf8">${d.result.findings.length}</div><div class="sev-label">Findings</div></div>
      <div class="sev-box"><div class="sev-num" style="color:#22c55e">${d.result.recommendations.length}</div><div class="sev-label">Remedies</div></div>
    </div>
  </div>

  ${d.groupedFindings.size > 0 ? `
  <div class="section-head"><h2>🗺️ Risk by GS Property</h2><span class="section-count">${d.groupedFindings.size} properties</span></div>
  <p class="section-sub">Which pillars of GS discipline are most at risk in this codebase.</p>
  <div class="prop-grid">${d.propertyBreakdownHtml}</div>
  ` : ''}

  ${d.quickWinsHtml}

  <div class="section-head"><h2>📋 Findings</h2><span class="section-count">${d.result.findings.length}</span></div>
  <p class="section-sub">Scored by evidence weight. <span class="pill-file">📁 file</span> = from codebase structure &nbsp;·&nbsp; <span class="pill-survey">💬 survey</span> = confirmed by your answers.</p>
  ${d.findingsHtml}

  <div class="section-head"><h2>🔧 Recommended Remedies</h2><span class="section-count">${d.result.recommendations.length}</span></div>
  <p class="section-sub">Sorted by impact-to-effort ratio. Start from #1 — each remedy addresses multiple pathologies.</p>
  ${d.remediesHtml}

  <div class="explainer">
    <h2>What is Generative Specification?</h2>
    <p>Generative Specification (GS) is a methodology for making AI-assisted development <strong>sustainable</strong>. Without it, AI code generation accumulates hidden debt — inconsistent patterns, undocumented decisions, unverified behavior — that compounds with every session.</p>
    <p>A GS-ready codebase has 7 properties. Your report scores how well your project upholds each:</p>
    <div class="gs-props-grid">
      ${Object.entries(GS_PROPERTY_DESCRIPTIONS).map(([prop, desc]) => `
      <div class="gs-prop-item">
        <div class="gs-prop-item-name">${esc(prop.replace('_', ' '))}</div>
        <div class="gs-prop-item-desc">${esc(desc)}</div>
      </div>`).join('')}
    </div>
  </div>

  <div class="cta">
    <h2>Ready to fix this — properly?</h2>
    <p>ForgeDX diagnosed the problems. The <strong>Generative Specification method</strong> is how you fix them and keep them fixed as your team scales AI-assisted development.</p>
    <div class="cta-btns">
      <a href="https://www.skool.com/pragmaworks" target="_blank" class="btn btn-primary">🎓 Join the GS Course →</a>
      <a href="https://pragmaworks.dev" target="_blank" class="btn btn-outline">🌐 Learn the Method</a>
    </div>
    <hr class="cta-divider">
    <div class="cta-workshop">
      <strong>Prefer hands-on?</strong>
      <p>PragmaWorks runs in-person GS workshops. Your team leaves with CLAUDE.md, ADR practice, gate stack, and session manifest — all customized to your stack and your actual findings from this report.</p>
    </div>
    <div class="privacy-note">🔒 Your code never left your machine — all analysis was local</div>
  </div>
</div>
<div class="footer">
  Generated by <strong>ForgeDX</strong> &mdash; a <strong>PragmaWorks</strong> open diagnostic tool &middot; <a href="https://pragmaworks.dev">pragmaworks.dev</a>
</div>
</body></html>`
}
