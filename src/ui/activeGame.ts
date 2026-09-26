/**
 * Pure helpers for the active-game score entry flow (T4.2).
 *
 * Keeps score parsing and soft-rotation defaults out of the React screen so
 * they stay unit-testable. Domain still owns final integer validation (D14).
 */

/** UI sanity cap for typed scores (D14); domain has no max. */
export const SCORE_ABS_MAX = 9999

export type ParseScoreResult =
  | { ok: true; score: number }
  | { ok: false; reason: 'empty' | 'not_integer' | 'out_of_range' }

/**
 * Parses a score field from the active-game form into an integer.
 *
 * Trims whitespace; accepts an optional leading `+` or `-`. Rejects blanks,
 * decimals, and values whose absolute value exceeds {@link SCORE_ABS_MAX}.
 *
 * @param raw - Text from the score input
 * @returns Parsed integer score, or a reason the field is invalid
 */
export function parseScoreInput(raw: string): ParseScoreResult {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return { ok: false, reason: 'empty' }
  }

  if (!/^[+-]?\d+$/.test(trimmed)) {
    return { ok: false, reason: 'not_integer' }
  }

  const score = Number(trimmed)
  if (!Number.isInteger(score)) {
    return { ok: false, reason: 'not_integer' }
  }

  if (Math.abs(score) > SCORE_ABS_MAX) {
    return { ok: false, reason: 'out_of_range' }
  }

  return { ok: true, score }
}

/**
 * Normalizes the optional word field before calling `recordTurn`.
 *
 * Blank / whitespace-only becomes `undefined` so the domain stores no word.
 *
 * @param raw - Text from the word input
 * @returns Trimmed word, or `undefined` when empty
 */
export function normalizeOptionalWord(raw: string): string | undefined {
  const trimmed = raw.trim()
  return trimmed === '' ? undefined : trimmed
}
