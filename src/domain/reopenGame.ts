import { DomainError } from './errors'
import type { Game } from './types'

/**
 * Returns a finished game to in-progress so scores can be fixed (D16).
 *
 * Clears `finishedAt` and sets `status` to `in_progress`. Turns and the
 * suggested current player are left as they were.
 *
 * @param game - Finished game to reopen
 * @returns A new game document that accepts scoring mutations again
 * @throws {DomainError} If the game is not finished
 */
export function reopenGame(game: Game): Game {
  if (game.status !== 'finished') {
    throw new DomainError('Only finished games can be reopened')
  }

  return {
    ...game,
    status: 'in_progress',
    finishedAt: null,
  }
}
