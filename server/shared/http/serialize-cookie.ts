import type { CookieOptions } from './cookie-options.type';

// "__Host-" cookies must be Secure, have Path=/ and no Domain: the browser then refuses them from subdomains and plain http.
export function serializeCookie(name: string, value: string, options: CookieOptions): string {
  return [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    `SameSite=${options.sameSite}`,
  ].join('; ');
}
