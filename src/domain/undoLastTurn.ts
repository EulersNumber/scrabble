import { DomainError } from './errors'
import { suggestedCurrentFromTurns } from './suggestedPlayer'
import type { Game } from './types'

export function undoLastTurn(game: Game): Game {
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
