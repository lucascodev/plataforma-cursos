import { describe, expect, it } from 'vitest';
import { HttpRequestError } from '@/shared/application/errors/http-request.error';
import { SessionExpiredError } from '@/shared/application/errors/session-expired.error';
import { FetchHttpClient } from './fetch-http-client';

interface Call {
  readonly path: string;
  readonly init: RequestInit;
}

function clientReturning(response: Response | Error) {
  const calls: Call[] = [];
  const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ path: String(input), init: init ?? {} });
    if (response instanceof Error) throw response;
    return response;
  }) as typeof fetch;
  return { client: new FetchHttpClient(fetcher), calls };
}

describe('FetchHttpClient', () => {
  it('sends cookies only to its own origin and parses JSON', async () => {
    const { client, calls } = clientReturning(new Response('{"ok":true}', { status: 200 }));
    expect(await client.request({ path: '/api/me' })).toEqual({ ok: true });
    expect(calls[0]?.init.credentials).toBe('same-origin');
    expect(calls[0]?.init.method).toBe('GET');
    expect(calls[0]?.init.keepalive).toBe(false);
  });

  it('sends JSON bodies and keeps small writes alive when the tab closes', async () => {
    const { client, calls } = clientReturning(new Response(null, { status: 204 }));
    expect(await client.request({ method: 'PUT', path: '/api/progress/x', body: { a: 1 } })).toBeNull();
    expect(calls[0]?.init.body).toBe('{"a":1}');
    expect(calls[0]?.init.keepalive).toBe(true);
    await client.request({ method: 'PUT', path: '/api/progress/x', body: { text: 'x'.repeat(70_000) } });
    expect(calls[1]?.init.keepalive).toBe(false);
  });

  it('turns 401 into SessionExpiredError and other failures into HttpRequestError', async () => {
    await expect(clientReturning(new Response(null, { status: 401 })).client.request({ path: '/api/me' })).rejects.toThrow(SessionExpiredError);
    await expect(clientReturning(new Response(null, { status: 503 })).client.request({ path: '/api/me' })).rejects.toThrow(HttpRequestError);
    await expect(clientReturning(new TypeError('offline')).client.request({ path: '/api/me' })).rejects.toThrow(HttpRequestError);
    await expect(clientReturning(new Response('<html>', { status: 200 })).client.request({ path: '/api/me' })).rejects.toThrow(HttpRequestError);
  });

  it('keeps the message the API wrote for people', async () => {
    const body = JSON.stringify({ error: { code: 'slug-taken', message: 'Esse endereço já é usado por outro curso.' } });
    const { client } = clientReturning(new Response(body, { status: 409 }));
    let caught: unknown = null;
    try {
      await client.request({ method: 'POST', path: '/api/admin/proposals/x/approve', body: {} });
    } catch (error) {
      caught = error;
    }
    expect(caught instanceof HttpRequestError ? caught.problem : null).toEqual({ code: 'slug-taken', message: 'Esse endereço já é usado por outro curso.' });
  });
});
