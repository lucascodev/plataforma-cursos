export class RequestBodyError extends Error {
  constructor(readonly reason: 'not-json' | 'too-large' | 'wrong-type') {
    super(`Invalid request body: ${reason}`);
    this.name = 'RequestBodyError';
  }
}
