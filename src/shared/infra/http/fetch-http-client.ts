import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import { SessionExpiredError } from '@/shared/application/errors/session-expired.error';
import type { HttpClient } from '@/shared/application/ports/http-client.interface';
import type { HttpRequest } from '@/shared/application/ports/http-request.type';

// Browsers cap keepalive bodies at 64 KiB. Small writes keep the flag so a save started while the tab closes still lands.
const KEEPALIVE_LIMIT_BYTES = 60_000;

export class FetchHttpClient implements HttpClient {
  constructor(private readonly fetcher: typeof fetch = (input, init) => fetch(input, init)) {}

  async request({ method = 'GET', path, body }: HttpRequest): Promise<unknown> {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    let response: Response;
    try {
      response = await this.fetcher(path, {
        method,
        credentials: 'same-origin',
        headers: payload === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: payload,
        keepalive: payload !== undefined && new TextEncoder().encode(payload).byteLength < KEEPALIVE_LIMIT_BYTES,
      });
    } catch (error) {
      throw new HttpRequestError(null, { cause: error });
    }

    if (response.status === 401) throw new SessionExpiredError();
    if (!response.ok) throw new HttpRequestError(response.status);
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text) as unknown;
    } catch (error) {
      throw new HttpRequestError(response.status, { cause: error });
    }
  }
}
