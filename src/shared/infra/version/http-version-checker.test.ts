import { describe, expect, it } from 'vitest';
import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import type { HttpClient } from '@/shared/application/ports/http/http-client.interface';
import { HttpVersionChecker } from './http-version-checker';

const clientAnswering = (answer: () => unknown): HttpClient => ({ request: async () => answer() });

describe('HttpVersionChecker', () => {
  it('reads the published build id', async () => {
    const checker = new HttpVersionChecker(clientAnswering(() => ({ buildId: 'abc123' })), 'old');
    expect(checker.currentBuildId()).toBe('old');
    expect(await checker.publishedBuildId()).toBe('abc123');
  });

  it('answers null when the file is missing or malformed', async () => {
    const missing = new HttpVersionChecker(
      clientAnswering(() => {
        throw new HttpRequestError(404);
      }),
      'old',
    );
    expect(await missing.publishedBuildId()).toBeNull();
    expect(await new HttpVersionChecker(clientAnswering(() => ({ buildId: 42 })), 'old').publishedBuildId()).toBeNull();
  });
});
