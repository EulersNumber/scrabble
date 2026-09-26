/**
 * Minimal string key-value storage used by the local game store.
 *
 * Matches the subset of the Web Storage API we need so tests can inject a
 * memory fake without a browser `localStorage`.
 */
export type KeyValueStorage = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}
