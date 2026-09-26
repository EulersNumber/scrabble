import { DomainError } from './errors'
import { assertGameMutable } from './gameStatus'
import { suggestedCurrentFromTurns } from './suggestedPlayer'
import type { Game } from './types'

/**
 * Removes only the last turn and restores the suggested player (D11, D13).
 *
 * Earlier turns cannot be deleted this way; use {@link editTurn} to correct them.
 * After undo, `currentPlayerId` is recomputed from remaining history.
 *
 * @param game - In-progress game with at least one turn
 * @returns A new game without the last turn and with restored suggestion
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
    currentPlayerId: suggestedCurrentFromTurns(nextGame),
  }
}
