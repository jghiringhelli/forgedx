export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type GsProperty = 'SELF_DESCRIBING' | 'BOUNDED' | 'DEFENDED' | 'AUDITABLE' | 'COMPOSABLE' | 'VERIFIABLE' | 'EXECUTABLE'
export type RemediationType = 'practice' | 'protocol' | 'tool' | 'gate'
export type EffortLevel = 'low' | 'medium' | 'high'
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical'

export interface Signal {
  signal: string
  weight: number
  source_bonus?: {
    claudeMd?: number
    adr?: number
    spec?: number
    testFile?: number
    survey?: number
  }
}

export interface ScoringRules {
  signals: Signal[]
  threshold_weak: number
  threshold_moderate: number
  threshold_strong: number
  threshold_corroborated: number
}

export interface Pathology {
  code: string
  name: string
  gsProperty: GsProperty
  description: string
  severity: Severity
  scoringRules: ScoringRules
}

export interface Remedy {
  code: string
  name: string
  description: string
  remediationType: RemediationType
  effort: EffortLevel
  impact: ImpactLevel
  gsProperties: GsProperty[]
  pathologyCodes: string[]
  steps: string[]
}

export type QuestionType = 'SINGLE_SELECT'

export interface SurveyQuestion {
  questionKey: string
  questionText: string
  questionType: QuestionType
  options: string[]
  /** Which signals this answer can confirm */
  signalKeys: string[]
  /** 0–1 weight applied to confirmed signals when answer is negative */
  weight: number
  order: number
  isRequired: boolean
  /** Show in the 3-question funnel preview */
  isFunnelVisible: boolean
  section: 'spec_discipline' | 'quality_enforcement' | 'ai_workflow' | 'change_governance'
}

// ─── Scanner output ──────────────────────────────────────────────────────────

export type SignalSource = 'file' | 'survey'

export interface DetectedSignal {
  key: string
  detected: boolean
  source: SignalSource
  evidence?: string  // e.g. "Found: CLAUDE.md" or "Survey: answered 'No'"
}

// ─── Scoring output ──────────────────────────────────────────────────────────

export type EvidenceLevel = 'NONE' | 'WEAK' | 'MODERATE' | 'STRONG' | 'CORROBORATED'

export interface ScoredPathology {
  pathology: Pathology
  score: number
  evidenceLevel: EvidenceLevel
  matchedSignals: Array<{ signal: string; contribution: number; source: SignalSource }>
}

export interface DiagnosticResult {
  projectPath: string
  scannedAt: Date
  signals: DetectedSignal[]
  scored: ScoredPathology[]
  /** Top pathologies sorted by score descending */
  findings: ScoredPathology[]
  /** Remedies recommended based on top findings */
  recommendations: Array<{ remedy: Remedy; addressesPathologies: string[] }>
}
