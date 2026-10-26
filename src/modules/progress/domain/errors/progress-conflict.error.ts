export class ProgressConflictError extends Error {
  constructor(options?: { cause?: unknown }) {
    super('Progress was saved somewhere else since it was loaded', options);
    this.name = 'ProgressConflictError';
  }
}
