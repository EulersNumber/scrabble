/**
 * Core domain types for the scorekeeping aggregate.
 *
 * Turn history is the source of truth; totals and ranks are derived (D3).
 */

/** Lifecycle of a game: scoring allowed only while `in_progress` (D16). */
export type GameStatus = 'in_progress' | 'finished'

/** Player scoped to one game; seating order is the `Game.players` list order. */
export type Player = {
  id: string
  name: string
}

/**
 * One recorded play (or pass). Optional `word` is omitted when not recorded.
 * `sequence` is the 0-based index at append time.
 */
export type Turn = {
  id: string
  playerId: string
  score: number
  word?: string
  createdAt: string
  sequence: number
}

/**
 * Game aggregate: players + ordered turns + soft-rotation suggestion.
 * `finishedAt` is set only when `status` is `finished`.
 */
export type Game = {
  id: string
  createdAt: string
  status: GameStatus
  finishedAt: string | null
  players: Player[]
  turns: Turn[]
  currentPlayerId: string
}
