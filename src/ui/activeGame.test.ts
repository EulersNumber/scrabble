import { describe, expect, it } from 'vitest'
import {
  normalizeOptionalWord,
  parseScoreInput,
  SCORE_ABS_MAX,
} from './activeGame'

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
