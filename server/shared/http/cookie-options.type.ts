export interface CookieOptions {
  readonly maxAgeSeconds: number;
  readonly sameSite: 'Lax' | 'Strict';
}
