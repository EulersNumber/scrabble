import { currentPlayerFromHistory } from './currentPlayer'
import { DomainError } from './errors'
import { assertGameMutable } from './gameStatus'
import type { Game } from './types'

/**
 * Removes only the last turn and restores whose turn it is (D11, D36).
 *
 * Earlier turns cannot be deleted this way; use {@link editTurn} to correct them.
 * After undo, `currentPlayerId` is recomputed from remaining history (next
 * active seat after the last remaining turn, or the starter when empty).
 *
 * @param game - In-progress game with at least one turn
 * @returns A new game without the last turn and with current player restored
 * @throws {DomainError} If the game is finished or there are no turns
 */
export function undoLastTurn(game: Game): Game {
  assertGameMutable(game)

  if (game.turns.length === 0) {
    throw new DomainError('No turns to undo')
  }

  const turns = game.turns.slice(0, -1)
  const nextGame: Game = {
    ...game,
    turns,
  }

  return {
    ...nextGame,
    currentPlayerId: currentPlayerFromHistory(nextGame),
  }
}
