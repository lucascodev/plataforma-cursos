export class InvalidTeachingResponseError extends Error {
  constructor(path: string, options?: { cause?: unknown }) {
    super(`Unexpected answer from ${path}`, options);
    this.name = 'InvalidTeachingResponseError';
  }
}
