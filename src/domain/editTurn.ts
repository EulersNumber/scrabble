import { DomainError } from './errors'
import { suggestedCurrentFromTurns } from './suggestedPlayer'
import type { Game, Turn } from './types'

export type EditTurnInput = {
  playerId: string
  score: number
  word?: string
}

export function editTurn(game: Game, turnId: string, input: EditTurnInput): Game {
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
