import { describe, expect, it } from 'vitest'
import type { Turn } from '../domain'
import {
  gameMenuActions,
  normalizeOptionalWord,
  parseScoreInput,
  playerNameById,
  SCORE_ABS_MAX,
  turnsNewestFirst,
} from './activeGame'

function turn(partial: Pick<Turn, 'id' | 'sequence'> & Partial<Turn>): Turn {
  return {
    playerId: 'p1',
    score: 0,
    createdAt: '2026-09-26T00:00:00.000Z',
    ...partial,
  }
}

describe('parseScoreInput', () => {
  it('accepts integers including zero and negatives', () => {
    expect(parseScoreInput('0')).toEqual({ ok: true, score: 0 })
    expect(parseScoreInput('12')).toEqual({ ok: true, score: 12 })
    expect(parseScoreInput('-5')).toEqual({ ok: true, score: -5 })
    expect(parseScoreInput('+8')).toEqual({ ok: true, score: 8 })
  })

  it('trims whitespace', () => {
    expect(parseScoreInput('  10  ')).toEqual({ ok: true, score: 10 })
  })

  it('rejects empty, non-integers, and out-of-range values', () => {
    expect(parseScoreInput('')).toEqual({ ok: false, reason: 'empty' })
    expect(parseScoreInput('   ')).toEqual({ ok: false, reason: 'empty' })
    expect(parseScoreInput('1.5')).toEqual({ ok: false, reason: 'not_integer' })
    expect(parseScoreInput('abc')).toEqual({ ok: false, reason: 'not_integer' })
    expect(parseScoreInput(`${SCORE_ABS_MAX + 1}`)).toEqual({
      ok: false,
      reason: 'out_of_range',
    })
    expect(parseScoreInput(`-${SCORE_ABS_MAX + 1}`)).toEqual({
      ok: false,
      reason: 'out_of_range',
    })
  })
})

describe('normalizeOptionalWord', () => {
  it('returns undefined for blank input and trims words', () => {
    expect(normalizeOptionalWord('')).toBeUndefined()
    expect(normalizeOptionalWord('   ')).toBeUndefined()
    expect(normalizeOptionalWord('  kissa  ')).toBe('kissa')
  })
})

describe('turnsNewestFirst', () => {
  it('returns newest turn first without mutating the original list', () => {
    const turns = [
      turn({ id: 't1', sequence: 0, score: 10 }),
      turn({ id: 't2', sequence: 1, score: 7 }),
      turn({ id: 't3', sequence: 2, score: 4 }),
    ]
    const newestFirst = turnsNewestFirst(turns)
    expect(newestFirst.map((entry) => entry.id)).toEqual(['t3', 't2', 't1'])
    expect(turns.map((entry) => entry.id)).toEqual(['t1', 't2', 't3'])
  })

  it('handles empty history', () => {
    expect(turnsNewestFirst([])).toEqual([])
  })
})

describe('gameMenuActions', () => {
  it('offers history, finish, settings, and delete while the game is in progress', () => {
    expect(gameMenuActions('in_progress')).toEqual([
      'turns',
      'finish',
      'settings',
      'delete',
    ])
  })

  it('swaps finish for reopen when the game is finished', () => {
    expect(gameMenuActions('finished')).toEqual([
      'turns',
      'reopen',
      'settings',
      'delete',
    ])
  })
})

describe('playerNameById', () => {
  it('returns the matching player name or the id as fallback', () => {
    const players = [
      { id: 'a', name: 'Aino' },
      { id: 'b', name: 'Matti' },
    ]
    expect(playerNameById(players, 'b')).toBe('Matti')
    expect(playerNameById(players, 'missing')).toBe('missing')
  })
})
