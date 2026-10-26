import { accessToken } from './fake-supabase';

export const SITE = 'https://cursos.exemplo.dev';

export function signedIn(path: string, init: { method?: string; body?: unknown } = {}): Request {
  const headers: Record<string, string> = { Cookie: `__Host-ca-access=${encodeURIComponent(accessToken())}` };
  if (init.body !== undefined) headers['Content-Type'] = 'application/json';
  return new Request(`${SITE}${path}`, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}

export function signedOut(path: string, init: { method?: string; body?: unknown } = {}): Request {
  return new Request(`${SITE}${path}`, {
    method: init.method ?? 'GET',
    headers: init.body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}
