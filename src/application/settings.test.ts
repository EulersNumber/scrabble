import { describe, expect, it } from 'vitest'
import {
  GAMES_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  createLocalStorageSettingsStore,
  createMemoryStorage,
} from '../persistence'
import { getSettings, updateSettings } from './settings'

describe('getSettings', () => {
  it('returns sounds on when nothing is stored', () => {
    const store = createLocalStorageSettingsStore(createMemoryStorage())
    expect(getSettings(store)).toEqual({ soundsEnabled: true })
  })
})

describe('updateSettings', () => {
  it('persists the sounds toggle and leaves game storage untouched', () => {
    const storage = createMemoryStorage()
    const store = createLocalStorageSettingsStore(storage)

    const saved = updateSettings(store, { soundsEnabled: false })

    expect(saved).toEqual({ soundsEnabled: false })
    expect(getSettings(store)).toEqual({ soundsEnabled: false })
    expect(storage.getItem(GAMES_STORAGE_KEY)).toBeNull()
    expect(storage.getItem(SETTINGS_STORAGE_KEY)).toContain('"soundsEnabled":false')
  })

  it('keeps the current value when the patch omits sounds', () => {
    const store = createLocalStorageSettingsStore(createMemoryStorage())
    updateSettings(store, { soundsEnabled: false })

    expect(updateSettings(store, {})).toEqual({ soundsEnabled: false })
  })

  it('ignores a non-boolean sounds patch', () => {
    const store = createLocalStorageSettingsStore(createMemoryStorage())
    updateSettings(store, { soundsEnabled: false })

    const patched = updateSettings(store, {
      soundsEnabled: 'no' as unknown as boolean,
    })

    expect(patched.soundsEnabled).toBe(false)
  })
})
