import { describe, expect, it } from 'vitest'
import { podiumLayout, type PodiumPlayer } from './podium'

function seat(
  playerId: string,
  name: string,
  total: number,
  rank: number,
): PodiumPlayer {
  return { playerId, name, total, rank }
}

function ids(players: readonly PodiumPlayer[] | undefined): string[] {
  return (players ?? []).map((player) => player.playerId)
}

describe('podiumLayout', () => {
  it('places two players on the centre and left steps', () => {
    const layout = podiumLayout([
      seat('a', 'Aino', 20, 1),
      seat('m', 'Matti', 10, 2),
    ])

    expect(ids(layout.first?.players)).toEqual(['a'])
    expect(ids(layout.second?.players)).toEqual(['m'])
    expect(layout.third).toBeNull()
    expect(layout.beside).toBeNull()
  })

  it('shares the centre step when two players tie', () => {
    const layout = podiumLayout([
      seat('a', 'Aino', 0, 1),
      seat('m', 'Matti', 0, 1),
    ])

    expect(ids(layout.first?.players)).toEqual(['a', 'm'])
    expect(layout.second).toBeNull()
    expect(layout.third).toBeNull()
    expect(layout.beside).toBeNull()
  })

  it('places three distinct ranks left, centre, and right', () => {
    const layout = podiumLayout([
      seat('a', 'Aino', 30, 1),
      seat('m', 'Matti', 20, 2),
      seat('l', 'Liisa', 10, 3),
    ])

    expect(ids(layout.first?.players)).toEqual(['a'])
    expect(ids(layout.second?.players)).toEqual(['m'])
    expect(ids(layout.third?.players)).toEqual(['l'])
    expect(layout.beside).toBeNull()
  })

  it('shares the first step and leaves second empty on a 1, 1, 3 tie', () => {
    const layout = podiumLayout([
      seat('a', 'Aino', 20, 1),
      seat('m', 'Matti', 20, 1),
      seat('l', 'Liisa', 5, 3),
    ])

    expect(ids(layout.first?.players)).toEqual(['a', 'm'])
    expect(layout.second).toBeNull()
    expect(ids(layout.third?.players)).toEqual(['l'])
    expect(layout.beside).toBeNull()
  })

  it('puts every player on the first step when all three are tied', () => {
    const layout = podiumLayout([
      seat('a', 'Aino', 8, 1),
      seat('m', 'Matti', 8, 1),
      seat('l', 'Liisa', 8, 1),
    ])

    expect(ids(layout.first?.players)).toEqual(['a', 'm', 'l'])
    expect(layout.second).toBeNull()
    expect(layout.third).toBeNull()
    expect(layout.beside).toBeNull()
  })

  it('puts a distinct 4th place beside the podium', () => {
    const layout = podiumLayout([
      seat('a', 'Aino', 40, 1),
      seat('m', 'Matti', 30, 2),
      seat('l', 'Liisa', 20, 3),
      seat('p', 'Pekka', 10, 4),
    ])

    expect(ids(layout.first?.players)).toEqual(['a'])
    expect(ids(layout.second?.players)).toEqual(['m'])
    expect(ids(layout.third?.players)).toEqual(['l'])
    expect(ids(layout.beside?.players)).toEqual(['p'])
    expect(layout.beside?.step).toBe('beside')
  })

  it('puts all four players on the first step when everyone is tied', () => {
    const layout = podiumLayout([
      seat('a', 'Aino', 0, 1),
      seat('m', 'Matti', 0, 1),
      seat('l', 'Liisa', 0, 1),
      seat('p', 'Pekka', 0, 1),
    ])

    expect(ids(layout.first?.players)).toEqual(['a', 'm', 'l', 'p'])
    expect(layout.second).toBeNull()
    expect(layout.third).toBeNull()
    expect(layout.beside).toBeNull()
  })

  it('shares the second step and parks rank 4 beside it', () => {
    const layout = podiumLayout([
      seat('a', 'Aino', 30, 1),
      seat('m', 'Matti', 12, 2),
      seat('l', 'Liisa', 12, 2),
      seat('p', 'Pekka', 4, 4),
    ])

    expect(ids(layout.first?.players)).toEqual(['a'])
    expect(ids(layout.second?.players)).toEqual(['m', 'l'])
    expect(layout.third).toBeNull()
    expect(ids(layout.beside?.players)).toEqual(['p'])
  })

  it('keeps a three-way tie for first on the centre step, with last beside', () => {
    const layout = podiumLayout([
      seat('a', 'Aino', 10, 1),
      seat('m', 'Matti', 10, 1),
      seat('l', 'Liisa', 10, 1),
      seat('p', 'Pekka', 1, 4),
    ])

    expect(ids(layout.first?.players)).toEqual(['a', 'm', 'l'])
    expect(layout.second).toBeNull()
    expect(layout.third).toBeNull()
    expect(ids(layout.beside?.players)).toEqual(['p'])
  })

  it('shares the third step when two players tie for third', () => {
    const layout = podiumLayout([
      seat('a', 'Aino', 22, 1),
      seat('m', 'Matti', 14, 2),
      seat('l', 'Liisa', 6, 3),
      seat('p', 'Pekka', 6, 3),
    ])

    expect(ids(layout.third?.players)).toEqual(['l', 'p'])
    expect(layout.beside).toBeNull()
  })

  it('returns empty slots when there are no standings', () => {
    expect(podiumLayout([])).toEqual({
      second: null,
      first: null,
      third: null,
      beside: null,
    })
  })
})
