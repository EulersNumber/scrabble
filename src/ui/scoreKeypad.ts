/**
 * Pure score-entry state for the on-screen keypad (T7.4 / D31 / D14).
 *
 * The keypad never opens the system keyboard. Callers show `display` and save
 * `value` when it is an integer. A blank display or a lone minus is not a
 * score yet (`value` is null). Domain still accepts the integer on save.
 */

/** Largest absolute score the keypad will accept (D14). Domain has no max. */
export const SCORE_ABS_MAX = 9999

export type ScoreKeypadState = {
  /** What the score display shows, e.g. `""`, `"-"`, `"0"`, `"24"`, `"-8"`. */
  display: string
  /**
   * Integer ready to save, including `0`.
   * `null` when nothing has been entered, or only a minus sign is showing.
   */
  value: number | null
}

/**
 * Empty keypad: nothing entered, so save stays disabled until a number exists.
 *
 * @returns A new blank score state
 */
export function emptyScoreKeypad(): ScoreKeypadState {
  return { display: '', value: null }
}

/**
 * Builds keypad state from a stored integer (history edit).
 *
 * Values outside {@link SCORE_ABS_MAX} are still shown so an existing turn is
 * not clamped before the user edits it. Further digits will not grow past the cap.
 *
 * @param score - Integer turn score already stored on the game
 * @returns Display text and the same integer as `value`
 * @throws When `score` is not an integer
 */
export function scoreKeypadFromInteger(score: number): ScoreKeypadState {
  if (!Number.isInteger(score)) {
    throw new Error('Score keypad value must be an integer')
  }
  return { display: String(score), value: score }
}

/**
 * Appends a digit. Drops leading zeros. Ignores the digit when the result
 * would exceed {@link SCORE_ABS_MAX}. A pending minus plus `0` becomes `0`.
 *
 * @param current - Current keypad state
 * @param digit - Whole digit from 0 through 9; anything else leaves state unchanged
 * @returns The next state, or `current` when the key is ignored
 */
export function appendScoreDigit(
  current: ScoreKeypadState,
  digit: number,
): ScoreKeypadState {
  if (!Number.isInteger(digit) || digit < 0 || digit > 9) {
    return current
  }

  const { negative, digits } = splitDisplay(current.display)

  if (digits === '' || digits === '0') {
    if (digit === 0) {
      return { display: '0', value: 0 }
    }
    return entryFromParts(negative, String(digit))
  }

  const nextDigits = `${digits}${digit}`
  if (Number(nextDigits) > SCORE_ABS_MAX) {
    return current
  }
  return entryFromParts(negative, nextDigits)
}

/**
 * Deletes the last character. A single digit or a lone minus returns to empty.
 * Backspace on `-12` leaves `-1`; one more press leaves a pending minus.
 *
 * @param current - Current keypad state
 * @returns The next state
 */
export function backspaceScore(current: ScoreKeypadState): ScoreKeypadState {
  const { display } = current
  if (display === '' || display === '-' || display.length === 1) {
    return emptyScoreKeypad()
  }

  const next = display.slice(0, -1)
  if (next === '-') {
    return { display: '-', value: null }
  }
  return entryFromParts(next.startsWith('-'), next.replace('-', ''))
}

/**
 * Clears the pad back to empty (long-press on ⌫ in the UI).
 *
 * @returns A new blank score state
 */
export function clearScoreKeypad(): ScoreKeypadState {
  return emptyScoreKeypad()
}

/**
 * Toggles the sign (D14 / D33). Empty becomes a pending minus; a pending minus
 * clears. Zero stays zero. An entered number flips between positive and negative.
 *
 * @param current - Current keypad state
 * @returns The next state
 */
export function toggleScoreSign(current: ScoreKeypadState): ScoreKeypadState {
  const { display, value } = current
  if (display === '') {
    return { display: '-', value: null }
  }
  if (display === '-') {
    return emptyScoreKeypad()
  }
  if (value === 0) {
    return { display: '0', value: 0 }
  }
  if (display.startsWith('-')) {
    return entryFromParts(false, display.slice(1))
  }
  return entryFromParts(true, display)
}

function splitDisplay(display: string): { negative: boolean; digits: string } {
  if (display.startsWith('-')) {
    return { negative: true, digits: display.slice(1) }
  }
  return { negative: false, digits: display }
}

function entryFromParts(negative: boolean, digits: string): ScoreKeypadState {
  if (digits === '') {
    return negative ? { display: '-', value: null } : emptyScoreKeypad()
  }
  const magnitude = Number(digits)
  const value = negative ? -magnitude : magnitude
  return {
    display: negative ? `-${digits}` : digits,
    value,
  }
}
