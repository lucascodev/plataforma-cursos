export class HttpRequestError extends Error {
  constructor(
    readonly status: number | null,
    options?: { cause?: unknown },
  ) {
    super(status === null ? 'Network request failed' : `Request failed with status ${status}`, options);
    this.name = 'HttpRequestError';
  }
}
