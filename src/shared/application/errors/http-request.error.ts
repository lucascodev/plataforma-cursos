import type { HttpProblem } from './http-problem.type';

export class HttpRequestError extends Error {
  readonly problem: HttpProblem | null;

  constructor(
    readonly status: number | null,
    options?: { cause?: unknown; problem?: HttpProblem | null },
  ) {
    super(status === null ? 'Network request failed' : `Request failed with status ${status}`, options);
    this.name = 'HttpRequestError';
    this.problem = options?.problem ?? null;
  }
}
