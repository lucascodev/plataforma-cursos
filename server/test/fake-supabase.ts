import type { Services } from '../main/services.type';
import { SupabaseAuthClient } from '../shared/supabase/supabase-auth-client';
import { SupabaseRestClient } from '../shared/supabase/supabase-rest-client';

export interface RecordedCall {
  readonly url: string;
  readonly method: string;
  readonly headers: Record<string, string>;
  readonly body: unknown;
}

export const NOW_MS = Date.UTC(2027, 0, 11, 12, 0, 0);

export function fakeJwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

export function accessToken(offsetSeconds = 3600, sub = 'user-1'): string {
  return fakeJwt({ sub, exp: Math.floor(NOW_MS / 1000) + offsetSeconds, role: 'authenticated' });
}

type Responder = (call: RecordedCall) => Response;

export function makeFakeServices(responder: Responder): { services: Services; calls: RecordedCall[] } {
  const calls: RecordedCall[] = [];
  const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers: Record<string, string> = {};
    new Headers(init?.headers).forEach((value, key) => {
      headers[key] = value;
    });
    const call: RecordedCall = {
      url: String(input),
      method: init?.method ?? 'GET',
      headers,
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
    };
    calls.push(call);
    return responder(call);
  }) as typeof fetch;
  const config = { supabaseUrl: 'https://projeto.supabase.co', publishableKey: 'sb_publishable_test' };
  return {
    calls,
    services: { config, auth: new SupabaseAuthClient(config, fetcher), rest: new SupabaseRestClient(config, fetcher), now: () => NOW_MS },
  };
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
