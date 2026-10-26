import { serializeCookie } from '../../shared/http/serialize-cookie';

export function clearCookies(names: readonly string[]): string[] {
  return names.map((name) => serializeCookie(name, '', { maxAgeSeconds: 0, sameSite: 'Lax' }));
}
