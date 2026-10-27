import type { Services } from '../../../main/services.type';
import { clearCookies } from '../cookies/clear-cookies';
import { resolveSession } from '../session/resolve-session';
import { SESSION_COOKIES } from '../cookies/session-cookie-names';

// The access cookie lives one hour but the refresh token lives 30 days, so an idle session is refreshed first:
// otherwise only the cookies would go away and the refresh token would stay valid at Supabase.
// scope "global" ends the sessions on every device, this one included.
export async function handleLogout(request: Request, services: Services, scope: 'local' | 'global' = 'local'): Promise<Response> {
  try {
    const session = await resolveSession(request, services);
    if (session) await services.auth.signOut(session.accessToken, scope);
  } catch (error) {
    // The cookies are cleared anyway; the person is signed out of this browser even if Supabase could not be reached.
    console.error(error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown logout error');
  }
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  for (const cookie of clearCookies([SESSION_COOKIES.accessToken, SESSION_COOKIES.refreshToken])) headers.append('Set-Cookie', cookie);
  return new Response(null, { status: 204, headers });
}
