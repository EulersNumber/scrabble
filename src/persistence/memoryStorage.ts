import type { KeyValueStorage } from './KeyValueStorage'

/**
 * In-memory {@link KeyValueStorage} for unit tests.
 *
 * @returns A fresh empty storage instance
 */
export function createMemoryStorage(): KeyValueStorage {
  const data = new Map<string, string>()

  return {
    getItem(key: string): string | null {
      return data.has(key) ? data.get(key)! : null
    },
    setItem(key: string, value: string): void {
      data.set(key, value)
    },
    removeItem(key: string): void {
      data.delete(key)
    },
  }
}
