import type { Context } from 'hono'
import {
  AssessmentNotFoundError,
  AssessmentAlreadyRunningError,
  InsufficientEvidenceError,
  AssessmentCompletedError,
  UnauthorizedError,
  NoConfirmedHypothesesError,
} from '../lib/errors/domain-errors.js'

export function errorHandler(err: Error, c: Context) {
  if (err instanceof UnauthorizedError)
    return c.json({ error: err.message, code: 'UNAUTHORIZED' }, 401)
  if (err instanceof AssessmentNotFoundError)
    return c.json({ error: err.message, code: 'ASSESSMENT_NOT_FOUND' }, 404)
  if (err instanceof AssessmentAlreadyRunningError)
    return c.json({ error: err.message, code: 'ASSESSMENT_ALREADY_RUNNING' }, 409)
  if (err instanceof InsufficientEvidenceError)
    return c.json({ error: err.message, code: 'INSUFFICIENT_EVIDENCE' }, 422)
  if (err instanceof AssessmentCompletedError)
    return c.json({ error: err.message, code: 'ASSESSMENT_COMPLETED' }, 422)
  if (err instanceof NoConfirmedHypothesesError)
    return c.json({ error: err.message, code: 'NO_CONFIRMED_HYPOTHESES' }, 422)

  console.error('[ERROR]', err.stack ?? err.message)
  return c.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, 500)
}

