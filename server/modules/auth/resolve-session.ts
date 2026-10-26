import type { Services } from '../../main/services.type';
import { decodeJwtPayload } from '../../shared/crypto/decode-jwt-payload';
import { parseCookies } from '../../shared/http/parse-cookies';
import { SupabaseRequestError } from '../../shared/supabase/supabase-request-error';
import { buildSessionCookies } from './build-session-cookies';
import type { ResolvedSession } from './resolved-session.type';
import { SESSION_COOKIES } from './session-cookie-names';
import { SESSION_DURATIONS } from './session-durations';

function readValidAccess(token: string | undefined, nowSeconds: number): { token: string; userId: string } | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload?.sub || typeof payload.exp !== 'number') return null;
  if (payload.exp - SESSION_DURATIONS.accessTokenSafetyMarginSeconds <= nowSeconds) return null;
  return { token, userId: payload.sub };
}

// Returns null when there is no usable session. A refresh rotates both cookies; the caller must send them back.
export async function resolveSession(request: Request, services: Services): Promise<ResolvedSession | null> {
  const cookies = parseCookies(request.headers.get('Cookie'));
  const nowSeconds = Math.floor(services.now() / 1000);
  const current = readValidAccess(cookies[SESSION_COOKIES.accessToken], nowSeconds);
  if (current) return { accessToken: current.token, userId: current.userId, cookies: [] };

  const refreshToken = cookies[SESSION_COOKIES.refreshToken];
  if (!refreshToken) return null;
  try {
    const session = await services.auth.refresh(refreshToken);
    const refreshed = readValidAccess(session.accessToken, nowSeconds);
    if (!refreshed) return null;
    return { accessToken: refreshed.token, userId: refreshed.userId, cookies: buildSessionCookies(session) };
  } catch (error) {
    if (error instanceof SupabaseRequestError && error.status >= 500) throw error;
    return null;
  }
}
