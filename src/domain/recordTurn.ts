import { DomainError } from './errors'
import { assertGameMutable } from './gameStatus'
import { nextSeatAfter } from './suggestedPlayer'
import type { Game, Turn } from './types'

export type RecordTurnInput = {
  playerId: string
  score: number
  word?: string
}

/**
 * Appends one turn and advances soft rotation (D13, D14, D18).
 *
 * Accepts any seated player (not only the suggested one). After a turn for P,
 * `currentPlayerId` becomes the next seat after P (wrapping). Score must be an
 * integer; `0` is a pass; negatives are allowed. Empty/omitted word is stored
 * as absent.
 *
 * @param game - In-progress game to update
 * @param input - Player, integer score, and optional word
 * @returns A new game with the turn appended and suggestion advanced
 * @throws {DomainError} If the game is finished, the player is unknown, or the score is not an integer
 */
export function recordTurn(game: Game, input: RecordTurnInput): Game {
  assertGameMutable(game)

  const player = game.players.find((candidate) => candidate.id === input.playerId)
  if (!player) {
    throw new DomainError('Unknown player')
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
    currentPlayerId: nextSeatAfter(game, player.id),
  }
}
