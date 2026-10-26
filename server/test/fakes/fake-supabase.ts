import type { Services } from '../../main/services.type';
import { SupabaseAuthClient } from '../../shared/supabase/auth/supabase-auth-client';
import { SupabaseRestClient } from '../../shared/supabase/rest/supabase-rest-client';

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

export type Responder = (call: RecordedCall) => Response;

// Picks a response by the part of the URL after /rest/v1/ or /auth/v1/ (e.g. 'rpc/admin_overview', 'profiles').
export function respondByPath(routes: Record<string, Responder>, fallback: Responder = () => json({}, 500)): Responder {
  return (call) => {
    const path = call.url.replace(/^https:\/\/[^/]+\/(rest|auth)\/v1\//, '').split('?')[0] ?? '';
    const route = routes[path];
    return route ? route(call) : fallback(call);
  };
}

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

export function postgrestError(status: number, code: string, hint: string | null = null): Response {
  return json({ code, message: 'internal text that must not leak', details: null, hint }, status);
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
