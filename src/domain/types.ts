export type GameStatus = 'in_progress' | 'finished'

export type Player = {
  id: string
  name: string
}

export type Turn = {
  id: string
  playerId: string
  score: number
  word?: string
  createdAt: string
  sequence: number
}

export type Game = {
  id: string
  createdAt: string
  status: GameStatus
  finishedAt: string | null
  players: Player[]
  turns: Turn[]
  currentPlayerId: string
}
