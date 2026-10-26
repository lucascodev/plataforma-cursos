// Supabase refresh tokens are short opaque strings. Anything else is refused here, so a forged cookie
// cannot make this server spend the shared Auth rate limit on refresh calls that are bound to fail.
const REFRESH_TOKEN_FORMAT = /^[A-Za-z0-9._-]{8,512}$/;

export function isPlausibleRefreshToken(token: string): boolean {
  return REFRESH_TOKEN_FORMAT.test(token);
}
