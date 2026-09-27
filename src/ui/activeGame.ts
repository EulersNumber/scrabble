/**
 * Pure helpers for the active-game score entry and correction flow (T4.2, T4.3, T7.3).
 *
 * Keeps score parsing, word normalize, turn-list presentation, and soft-rotation
 * next-seat preview helpers out of the React screen so they stay unit-testable.
 * Domain still owns final integer validation (D14), undo/edit rules (D11), and
 * suggested-current updates (D13).
 */

import type { Player, Turn } from '../domain'

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

/**
 * Soft-rotation preview: who would be suggested after a turn for `playerId` (D13, T7.3).
 *
 * Mirrors domain seat wrap without requiring a full `Game`. Used only as a UI
 * hint — logging another seat remains allowed.
 *
 * @param players - Seating order (2–4)
 * @param playerId - Player about to be logged
 * @returns The next seated player, or `undefined` if `playerId` is unknown / list empty
 */
export function nextSeatPlayer(
  players: readonly Player[],
  playerId: string,
): Player | undefined {
  if (players.length === 0) {
    return undefined
  }
  const index = players.findIndex((player) => player.id === playerId)
  if (index === -1) {
    return undefined
  }
  return players[(index + 1) % players.length]
}
