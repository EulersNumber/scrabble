/**
 * Application-layer error for orchestration failures (e.g. missing game).
 *
 * Distinct from {@link DomainError}: domain rules vs load/save orchestration.
 * UI can catch this type for clear messaging without treating it as unexpected.
 */
export class ApplicationError extends Error {
  override readonly name = 'ApplicationError'

  constructor(message: string) {
    super(message)
  }
}
