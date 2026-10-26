export class ProgressStorageError extends Error {
  constructor(
    readonly operation: 'load' | 'save' | 'clear',
    options?: { cause?: unknown },
  ) {
    super(`Progress storage failed to ${operation}`, options);
    this.name = 'ProgressStorageError';
  }
}
