import { DomainError } from './errors'
import { nextSeatAfter } from './suggestedPlayer'
import type { Game, Turn } from './types'

export type RecordTurnInput = {
  playerId: string
  score: number
  word?: string
}

export function recordTurn(game: Game, input: RecordTurnInput): Game {
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
