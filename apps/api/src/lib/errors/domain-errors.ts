// Custom error types for ForgeDX domain

export class AssessmentNotFoundError extends Error {
  constructor(id: string) {
    super(`Assessment ${id} not found`)
    this.name = 'AssessmentNotFoundError'
  }
}

export class AssessmentAlreadyRunningError extends Error {
  constructor(id: string) {
    super(`Assessment ${id} is already running`)
    this.name = 'AssessmentAlreadyRunningError'
  }
}

export class InsufficientEvidenceError extends Error {
  constructor() {
    super('No evidence available — upload a document or complete the survey')
    this.name = 'InsufficientEvidenceError'
  }
}

export class AssessmentCompletedError extends Error {
  constructor(id: string) {
    super(`Assessment ${id} is already completed`)
    this.name = 'AssessmentCompletedError'
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

export class NoConfirmedHypothesesError extends Error {
  constructor() {
    super('No confirmed hypotheses — confirm at least one before generating prescriptions')
    this.name = 'NoConfirmedHypothesesError'
  }
}
