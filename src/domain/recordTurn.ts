import { nextActiveSeat } from './currentPlayer'
import { DomainError } from './errors'
import { assertGameMutable } from './gameStatus'
import type { Game, Turn } from './types'

export type RecordTurnInput = {
  playerId: string
  score: number
  word?: string
}

/**
 * Appends one turn for the current player and advances the seat (D14, D18, D36).
 *
 * Rejects any player other than `currentPlayerId`. After a score or pass (0),
 * current becomes the next active seat (wrapping). Until elimination exists,
 * every seated player is active. Score must be an integer; negatives are
 * allowed. Empty or omitted word is stored as absent. Saved games may still
 * contain off-rotation turns from before this rule; those stay readable, and
 * only new recordings are strict.
 *
 * @param game - In-progress game to update
 * @param input - Current player, integer score, and optional word
 * @returns A new game with the turn appended and current player advanced
 * @throws {DomainError} If the game is finished, the player is unknown, the player is not current, or the score is not an integer
 */
export function recordTurn(game: Game, input: RecordTurnInput): Game {
  assertGameMutable(game)

  const player = game.players.find((candidate) => candidate.id === input.playerId)
  if (!player) {
    throw new DomainError('Unknown player')
  }

  if (player.id !== game.currentPlayerId) {
    throw new DomainError("It is not this player's turn")
  }

  if (!Number.isInteger(input.score)) {
    throw new DomainError('Score must be an integer')
  }

  const word = input.word === undefined || input.word === '' ? undefined : input.word

  const turn: Turn = {
    id: crypto.randomUUID(),
    playerId: player.id,
    score: input.score,
    createdAt: new Date().toISOString(),
    sequence: game.turns.length,
    ...(word === undefined ? {} : { word }),
  }

  return {
    ...game,
    turns: [...game.turns, turn],
    currentPlayerId: nextActiveSeat(game, player.id),
  }
}
