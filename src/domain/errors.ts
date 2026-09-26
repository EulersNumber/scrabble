/**
 * Domain error for invariant / rule violations in game logic.
 *
 * Callers (use cases / UI) should catch this type to show a clear message
 * without treating it as an unexpected failure.
 */
export class DomainError extends Error {
  override readonly name = 'DomainError'

  constructor(message: string) {
    super(message)
  }
}
