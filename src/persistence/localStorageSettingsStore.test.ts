import { describe, expect, it } from 'vitest'
import { createGame } from '../domain'
import { GAMES_STORAGE_KEY, createLocalStorageGameStore } from './localStorageGameStore'
import {
  SETTINGS_STORAGE_KEY,
  createLocalStorageSettingsStore,
} from './localStorageSettingsStore'
import { createMemoryStorage } from './memoryStorage'

describe('createLocalStorageSettingsStore', () => {
  it('defaults sounds to on when the key is missing and does not write', () => {
    const storage = createMemoryStorage()
    const store = createLocalStorageSettingsStore(storage)

    expect(store.load()).toEqual({ soundsEnabled: true })
    expect(storage.getItem(SETTINGS_STORAGE_KEY)).toBeNull()
  })

  it('round-trips sounds off and on under its own key', () => {
    const storage = createMemoryStorage()
    const store = createLocalStorageSettingsStore(storage)

    store.save({ soundsEnabled: false })
    expect(store.load()).toEqual({ soundsEnabled: false })

    store.save({ soundsEnabled: true })
    expect(store.load()).toEqual({ soundsEnabled: true })

    const raw = storage.getItem(SETTINGS_STORAGE_KEY)
    expect(JSON.parse(raw ?? '')).toEqual({ version: 1, soundsEnabled: true })
    expect(storage.getItem(GAMES_STORAGE_KEY)).toBeNull()
  })

  it('does not share storage with the game document', () => {
    const storage = createMemoryStorage()
    const settings = createLocalStorageSettingsStore(storage)
    const games = createLocalStorageGameStore(storage)

    settings.save({ soundsEnabled: false })
    const game = createGame(['Aino', 'Matti'])
    games.save(game)

    expect(settings.load()).toEqual({ soundsEnabled: false })
    expect(games.getById(game.id)).toEqual(game)
    expect(JSON.parse(storage.getItem(GAMES_STORAGE_KEY) ?? '{}')).not.toHaveProperty(
      'soundsEnabled',
    )
  })

  it('returns a copy so mutating the result does not change the next load', () => {
    const store = createLocalStorageSettingsStore(createMemoryStorage())
    store.save({ soundsEnabled: false })

    const loaded = store.load()
    loaded.soundsEnabled = true

    expect(store.load().soundsEnabled).toBe(false)
  })

  it.each([
    ['empty string', ''],
    ['whitespace', '   '],
    ['broken json', '{'],
    ['array', '[]'],
    ['null', 'null'],
    ['string', '"off"'],
    ['missing field', '{"version":1}'],
    ['wrong type', '{"version":1,"soundsEnabled":"no"}'],
  ])('uses defaults for %s', (_label, raw) => {
    const storage = createMemoryStorage()
    storage.setItem(SETTINGS_STORAGE_KEY, raw)
    const store = createLocalStorageSettingsStore(storage)

    expect(store.load()).toEqual({ soundsEnabled: true })
  })

  it('keeps a valid sounds flag from an object without a known version', () => {
    const storage = createMemoryStorage()
    storage.setItem(SETTINGS_STORAGE_KEY, '{"soundsEnabled":false,"extra":1}')
    const store = createLocalStorageSettingsStore(storage)

    expect(store.load()).toEqual({ soundsEnabled: false })
  })

  it('drops unknown fields on the next save', () => {
    const storage = createMemoryStorage()
    storage.setItem(
      SETTINGS_STORAGE_KEY,
      '{"version":99,"soundsEnabled":false,"extra":1}',
    )
    const store = createLocalStorageSettingsStore(storage)

    expect(store.load()).toEqual({ soundsEnabled: false })
    store.save(store.load())

    expect(JSON.parse(storage.getItem(SETTINGS_STORAGE_KEY) ?? '')).toEqual({
      version: 1,
      soundsEnabled: false,
    })
  })
})
