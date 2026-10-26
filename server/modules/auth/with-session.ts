import type { Services } from '../../main/services.type';
import { withCookies } from '../../shared/http/with-cookies';
import { resolveSession } from './resolve-session';
import type { ResolvedSession } from './resolved-session.type';
import { unauthorizedResponse } from './unauthorized-response';

// Runs a handler for a signed-in person. A 401 from the handler means Supabase rejected the token, so the session ends.
export async function withSession(
  request: Request,
  services: Services,
  run: (session: ResolvedSession) => Promise<Response>,
): Promise<Response> {
  const session = await resolveSession(request, services);
  if (!session) return unauthorizedResponse();
  const response = await run(session);
  if (response.status === 401) return unauthorizedResponse();
  return withCookies(response, session.cookies);
}
