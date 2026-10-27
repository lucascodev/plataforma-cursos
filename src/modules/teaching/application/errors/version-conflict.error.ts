// The draft changed somewhere else (another tab or device) since this one was loaded.
export class VersionConflictError extends Error {
  constructor(options?: { cause?: unknown }) {
    super('The course version changed since it was loaded', options);
    this.name = 'VersionConflictError';
  }
}
