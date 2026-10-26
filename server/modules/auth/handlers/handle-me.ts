import type { Services } from '../../../main/services.type';
import { jsonResponse } from '../../../shared/http/json-response';
import { withCookies } from '../../../shared/http/with-cookies';
import { mapSupabaseUser } from '../map-supabase-user';
import { resolveSession } from '../resolve-session';
import { unauthorizedResponse } from '../unauthorized-response';

export async function handleMe(request: Request, services: Services): Promise<Response> {
  const session = await resolveSession(request, services);
  if (!session) return unauthorizedResponse();
  const user = await services.auth.getUser(session.accessToken);
  if (!user) return unauthorizedResponse();
  return withCookies(jsonResponse({ user: mapSupabaseUser(user) }), session.cookies);
}
