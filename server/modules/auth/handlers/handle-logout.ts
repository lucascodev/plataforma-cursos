import type { Services } from '../../../main/services.type';
import { parseCookies } from '../../../shared/http/parse-cookies';
import { clearCookies } from '../clear-cookies';
import { SESSION_COOKIES } from '../session-cookie-names';

export async function handleLogout(request: Request, services: Services): Promise<Response> {
  const accessToken = parseCookies(request.headers.get('Cookie'))[SESSION_COOKIES.accessToken];
  if (accessToken) {
    try {
      await services.auth.signOut(accessToken);
    } catch {
      // The cookies are cleared anyway; the token expires on its own within the hour.
    }
  }
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  for (const cookie of clearCookies([SESSION_COOKIES.accessToken, SESSION_COOKIES.refreshToken])) headers.append('Set-Cookie', cookie);
  return new Response(null, { status: 204, headers });
}
