import { serializeCookie } from '../../../shared/http/cookies/serialize-cookie';
import type { SupabaseSession } from '../../../shared/supabase/auth/supabase-session.type';
import { SESSION_COOKIES } from './session-cookie-names';
import { SESSION_DURATIONS } from '../session/session-durations';

export function buildSessionCookies(session: SupabaseSession): string[] {
  return [
    serializeCookie(SESSION_COOKIES.accessToken, session.accessToken, { maxAgeSeconds: session.expiresInSeconds, sameSite: 'Lax' }),
    serializeCookie(SESSION_COOKIES.refreshToken, session.refreshToken, { maxAgeSeconds: SESSION_DURATIONS.refreshTokenSeconds, sameSite: 'Lax' }),
  ];
}
