import { DomainError } from './errors'
import type { Game } from './types'

/**
 * Marks an in-progress game as finished (D16).
 *
 * Sets `status` to `finished` and `finishedAt` to the current ISO timestamp.
 * Scoring mutations are rejected until {@link reopenGame}. Turns and standings
 * are unchanged; finish is a status change only.
 *
 * @param game - Game to finish
 * @returns A new game document with finished status and timestamp
 * @throws {DomainError} If the game is already finished
 */
export function finishGame(game: Game): Game {
  if (game.status === 'finished') {
    throw new DomainError('Game is already finished')
  }

  return {
    ...game,
    status: 'finished',
    finishedAt: new Date().toISOString(),
  }
}
