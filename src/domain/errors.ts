export class DomainError extends Error {
  override readonly name = 'DomainError'

  constructor(message: string) {
    super(message)
  }
}
