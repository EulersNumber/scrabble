/**
 * Pure helpers for the active-game score entry, correction, and game menu
 * (T4.2, T4.3, T7.3).
 *
 * Keeps score parsing, word normalize, turn-list presentation, and which menu
 * actions apply out of the React screen so they stay unit-testable. Domain
 * still owns final integer validation (D14) and undo/edit rules (D11).
 */

import type { GameStatus, Player, Turn } from '../domain'
import { SCORE_ABS_MAX } from './scoreKeypad'

export { SCORE_ABS_MAX }

export type ParseScoreResult =
  | { ok: true; score: number }
  | { ok: false; reason: 'empty' | 'not_integer' | 'out_of_range' }

/**
 * Parses a raw score string into an integer.
 *
 * The on-screen keypad (T7.4) does not use this; it keeps its own display and
 * value. This remains the check for a typed string: trims whitespace, accepts
 * an optional leading `+` or `-`, and rejects blanks, decimals, and values
 * whose absolute value exceeds {@link SCORE_ABS_MAX}.
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

/**
 * Returns turns newest-first for the active-game history list (T4.3).
 *
 * Domain stores turns in append order (oldest first). The scorepad shows the
 * latest play at the top so undo/edit targets are easy to find.
 *
 * @param turns - Game turn list in domain (oldest-first) order
 * @returns A new array with newest turn first
 */
export function turnsNewestFirst(turns: readonly Turn[]): Turn[] {
  return [...turns].reverse()
}

/**
 * Resolves a player display name for a turn row.
 *
 * @param players - Seated players on the game
 * @param playerId - Turn's player id
 * @returns The player name, or the raw id if the seat is missing
 */
export function playerNameById(
  players: readonly Player[],
  playerId: string,
): string {
  return players.find((player) => player.id === playerId)?.name ?? playerId
}

/** Secondary actions in the open-game menu (T7.3 / D34). Settings arrive in T9.1. */
export type GameMenuAction = 'turns' | 'finish' | 'reopen' | 'delete'

/**
 * Chooses game-menu entries from status (T7.3 / D34 / D16 / D30).
 *
 * In progress: turn history, finish, delete. Finished: turn history, reopen,
 * delete. Undo stays on the turn screen and is not a menu entry. No settings
 * item until T9.1.
 *
 * @param status - Current game lifecycle
 * @returns Menu actions in display order
 */
export function gameMenuActions(status: GameStatus): GameMenuAction[] {
  if (status === 'finished') {
    return ['turns', 'reopen', 'delete']
  }
  return ['turns', 'finish', 'delete']
}
