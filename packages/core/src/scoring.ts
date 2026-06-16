import type { DetectedSignal, DiagnosticResult, EvidenceLevel, Remedy, ScoredPathology } from './types'
import { PATHOLOGIES } from './pathologies'
import { REMEDIES } from './remedies'

/** Pure deterministic scoring — same inputs always produce same output */
export function scorePathologies(signals: DetectedSignal[]): ScoredPathology[] {
  const signalMap = new Map<string, DetectedSignal>()
  for (const s of signals) {
    signalMap.set(s.key, s)
  }

  return PATHOLOGIES.map((pathology) => {
    let score = 0
    const matchedSignals: ScoredPathology['matchedSignals'] = []

    // Track theoretical max for this pathology (used to normalize evidence level)
    let maxPossibleForPathology = 0

    for (const { signal, weight, source_bonus } of pathology.scoringRules.signals) {
      // Max this signal can ever contribute (base weight + best possible source bonus)
      const bestBonus = source_bonus
        ? Math.max(0, ...(Object.values(source_bonus).filter((v) => v !== undefined) as number[]))
        : 0
      maxPossibleForPathology += weight * 100 + bestBonus * 100

      const detected = signalMap.get(signal)
      if (!detected?.detected) continue

      let contribution = weight * 100
      if (source_bonus && detected.source === 'file') {
        const bonus =
          source_bonus.claudeMd ?? source_bonus.adr ?? source_bonus.spec ??
          source_bonus.testFile ?? 0
        contribution += bonus * 100
      } else if (source_bonus?.survey && detected.source === 'survey') {
        contribution += source_bonus.survey * 100
      }

      score += contribution
      matchedSignals.push({ signal, contribution, source: detected.source })
    }

    // Evidence level = what fraction of the theoretical max score was achieved
    // This is consistent across pathologies regardless of how many signals they have
    const completeness = maxPossibleForPathology > 0 ? score / maxPossibleForPathology : 0
    let evidenceLevel: EvidenceLevel = 'NONE'
    if (completeness >= 0.80) evidenceLevel = 'CORROBORATED' // 80%+ of signals firing with bonuses
    else if (completeness >= 0.55) evidenceLevel = 'STRONG'   // majority of signals
    else if (completeness >= 0.30) evidenceLevel = 'MODERATE' // some signals
    else if (completeness >= 0.10) evidenceLevel = 'WEAK'     // one or two weak signals

    return { pathology, score, evidenceLevel, matchedSignals }
  }).sort((a, b) => b.score - a.score)
}

/** Select top N findings (evidence level WEAK or above, score > 0) */
export function getFindings(scored: ScoredPathology[], maxFindings = 10): ScoredPathology[] {
  return scored.filter((s) => s.evidenceLevel !== 'NONE' && s.score > 0).slice(0, maxFindings)
}

/** Select remedies that address the top findings, deduplicated and priority-sorted */
export function getRecommendations(
  findings: ScoredPathology[],
  maxRemedies = 8,
): Array<{ remedy: Remedy; addressesPathologies: string[] }> {
  const pathologyCodes = new Set(findings.map((f) => f.pathology.code))

  const remedyMap = new Map<
    string,
    { remedy: Remedy; addressesPathologies: string[]; totalScore: number }
  >()

  for (const remedy of REMEDIES) {
    const addressed = remedy.pathologyCodes.filter((c) => pathologyCodes.has(c))
    if (addressed.length === 0) continue

    const totalScore = addressed.reduce((sum, code) => {
      const finding = findings.find((f) => f.pathology.code === code)
      return sum + (finding?.score ?? 0)
    }, 0)

    remedyMap.set(remedy.code, { remedy, addressesPathologies: addressed, totalScore })
  }

  return [...remedyMap.values()]
    .sort((a, b) => {
      // Sort by: impact weight × number of pathologies addressed × total score
      const impactWeight = (r: Remedy) =>
        r.impact === 'critical' ? 4 : r.impact === 'high' ? 3 : r.impact === 'medium' ? 2 : 1
      const effortPenalty = (r: Remedy) =>
        r.effort === 'low' ? 1.2 : r.effort === 'medium' ? 1.0 : 0.8
      const scoreA = impactWeight(a.remedy) * effortPenalty(a.remedy) * a.addressesPathologies.length * a.totalScore
      const scoreB = impactWeight(b.remedy) * effortPenalty(b.remedy) * b.addressesPathologies.length * b.totalScore
      return scoreB - scoreA
    })
    .slice(0, maxRemedies)
    .map(({ remedy, addressesPathologies }) => ({ remedy, addressesPathologies }))
}

/** Compute an overall GS Readiness Score (0–100, higher = more ready) */
export function computeReadinessScore(scored: ScoredPathology[]): number {
  const findings = getFindings(scored)
  if (findings.length === 0) return 95 // No findings = near perfect

  const severityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 } as const

  // Evidence discount: only well-corroborated findings drive down the score significantly.
  // WEAK signal → 20% weight (barely relevant), CORROBORATED → 100% (undeniable).
  const evidenceDiscount = {
    CORROBORATED: 1.00,
    STRONG: 0.75,
    MODERATE: 0.45,
    WEAK: 0.20,
    NONE: 0,
  } as const

  // Realistic worst-case max: actual severity distribution of all 29 pathologies at 100pts each.
  // 5 CRITICAL(×4) + 12 HIGH(×3) + 8 MEDIUM(×2) + 4 LOW(×1) = (20+36+16+4) × 100 = 7,600
  const REALISTIC_MAX = 7_600

  const totalRisk = findings.reduce((sum, f) => {
    const sw = severityWeight[f.pathology.severity as keyof typeof severityWeight] ?? 1
    const ed = evidenceDiscount[f.evidenceLevel as keyof typeof evidenceDiscount] ?? 0.45
    return sum + f.score * sw * ed
  }, 0)

  const riskRatio = Math.min(totalRisk / REALISTIC_MAX, 1)
  return Math.max(0, Math.round((1 - riskRatio) * 100))
}

/** Grade based on readiness score */
export function getReadinessGrade(score: number): { grade: string; label: string; color: string } {
  if (score >= 80) return { grade: 'A', label: 'GS-Ready', color: '#22c55e' }
  if (score >= 65) return { grade: 'B', label: 'Progressing', color: '#84cc16' }
  if (score >= 50) return { grade: 'C', label: 'At Risk', color: '#f59e0b' }
  if (score >= 35) return { grade: 'D', label: 'Vulnerable', color: '#f97316' }
  return { grade: 'F', label: 'Critical Debt', color: '#ef4444' }
}

/** Build the full diagnostic result */
export function buildDiagnosticResult(
  projectPath: string,
  signals: DetectedSignal[],
): DiagnosticResult {
  const scored = scorePathologies(signals)
  const findings = getFindings(scored)
  const recommendations = getRecommendations(findings)

  return {
    projectPath,
    scannedAt: new Date(),
    signals,
    scored,
    findings,
    recommendations,
  }
}
