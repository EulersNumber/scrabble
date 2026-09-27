import { describe, expect, it } from 'vitest'
import {
  appendScoreDigit,
  backspaceScore,
  clearScoreKeypad,
  emptyScoreKeypad,
  SCORE_ABS_MAX,
  scoreKeypadFromInteger,
  toggleScoreSign,
  type ScoreKeypadState,
} from './scoreKeypad'

const empty = emptyScoreKeypad()

function entry(display: string, value: number | null): ScoreKeypadState {
  return { display, value }
}

describe('appendScoreDigit', () => {
  it('builds a number and drops leading zeros', () => {
    const zero = appendScoreDigit(empty, 0)
    expect(zero).toEqual(entry('0', 0))
    expect(appendScoreDigit(zero, 0)).toEqual(entry('0', 0))
    expect(appendScoreDigit(zero, 5)).toEqual(entry('5', 5))

    const twenty = appendScoreDigit(appendScoreDigit(empty, 2), 4)
    expect(twenty).toEqual(entry('24', 24))
  })

  it('keeps a pending minus, except zero which collapses to 0', () => {
    const pending = toggleScoreSign(empty)
    expect(appendScoreDigit(pending, 8)).toEqual(entry('-8', -8))
    expect(appendScoreDigit(pending, 0)).toEqual(entry('0', 0))
  })

  it('ignores digits that would pass the sanity cap', () => {
    const max = scoreKeypadFromInteger(SCORE_ABS_MAX)
    expect(appendScoreDigit(max, 1)).toBe(max)
    expect(appendScoreDigit(max, 0)).toBe(max)

    const min = scoreKeypadFromInteger(-SCORE_ABS_MAX)
    expect(appendScoreDigit(min, 9)).toBe(min)

    const under = scoreKeypadFromInteger(999)
    expect(appendScoreDigit(under, 9)).toEqual(entry('9999', 9999))
  })

  it('ignores a non-digit without changing state', () => {
    const current = entry('12', 12)
    expect(appendScoreDigit(current, 10)).toBe(current)
    expect(appendScoreDigit(current, -1)).toBe(current)
    expect(appendScoreDigit(current, 1.5)).toBe(current)
  })
})

describe('backspaceScore', () => {
  it('removes one character and can leave a pending minus', () => {
    expect(backspaceScore(entry('24', 24))).toEqual(entry('2', 2))
    expect(backspaceScore(entry('2', 2))).toEqual(empty)
    expect(backspaceScore(entry('-12', -12))).toEqual(entry('-1', -1))
    expect(backspaceScore(entry('-1', -1))).toEqual(entry('-', null))
    expect(backspaceScore(entry('-', null))).toEqual(empty)
    expect(backspaceScore(empty)).toEqual(empty)
  })
})

describe('clearScoreKeypad', () => {
  it('returns an empty pad', () => {
    expect(clearScoreKeypad()).toEqual(empty)
    expect(clearScoreKeypad()).not.toBe(emptyScoreKeypad())
  })
})

describe('toggleScoreSign', () => {
  it('flips an entered score and treats zero and empty specially', () => {
    expect(toggleScoreSign(empty)).toEqual(entry('-', null))
    expect(toggleScoreSign(entry('-', null))).toEqual(empty)
    expect(toggleScoreSign(entry('0', 0))).toEqual(entry('0', 0))
    expect(toggleScoreSign(entry('24', 24))).toEqual(entry('-24', -24))
    expect(toggleScoreSign(entry('-24', -24))).toEqual(entry('24', 24))
  })
})

describe('scoreKeypadFromInteger', () => {
  it('round-trips stored integers, including values past the cap', () => {
    expect(scoreKeypadFromInteger(0)).toEqual(entry('0', 0))
    expect(scoreKeypadFromInteger(15)).toEqual(entry('15', 15))
    expect(scoreKeypadFromInteger(-8)).toEqual(entry('-8', -8))
    expect(scoreKeypadFromInteger(SCORE_ABS_MAX + 1)).toEqual(
      entry('10000', 10000),
    )
  })

  it('rejects non-integers', () => {
    expect(() => scoreKeypadFromInteger(1.5)).toThrow(/integer/)
  })
})
