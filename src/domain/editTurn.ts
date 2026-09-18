import { DomainError } from './errors'
import { assertGameMutable } from './gameStatus'
import { suggestedCurrentFromTurns } from './suggestedPlayer'
import type { Game, Turn } from './types'

export type EditTurnInput = {
  playerId: string
  score: number
  word?: string
}

/**
 * Edits score, optional word, and player on any existing turn (D11, D14).
 *
 * Replaces the turn in place (same id / sequence / createdAt). Recalculates
 * `currentPlayerId` from the updated turn list so soft rotation stays consistent.
 * Empty word clears the recorded word.
 *
 * @param game - In-progress game containing the turn
 * @param turnId - Id of the turn to change
 * @param input - New player, integer score, and optional word
 * @returns A new game with the edited turn and refreshed suggestion
 * @throws {DomainError} If finished, turn/player unknown, or score is not an integer
 */
export function editTurn(game: Game, turnId: string, input: EditTurnInput): Game {
  assertGameMutable(game)

  const turnIndex = game.turns.findIndex((turn) => turn.id === turnId)
  if (turnIndex === -1) {
    throw new DomainError('Unknown turn')
  }

  const player = game.players.find((candidate) => candidate.id === input.playerId)
  if (!player) {
    throw new DomainError('Unknown player')
  }

  if (!Number.isInteger(input.score)) {
    throw new DomainError('Score must be an integer')
  }

  const word = input.word === undefined || input.word === '' ? undefined : input.word
  const existing = game.turns[turnIndex]!

  const updatedTurn: Turn = {
    id: existing.id,
    playerId: player.id,
    score: input.score,
    createdAt: existing.createdAt,
    sequence: existing.sequence,
    ...(word === undefined ? {} : { word }),
  }

  const turns = game.turns.map((turn, index) =>
    index === turnIndex ? updatedTurn : turn,
  )
  const nextGame: Game = {
    ...game,
    turns,
  }

  return {
    ...nextGame,
    currentPlayerId: suggestedCurrentFromTurns(nextGame),
  }
}
