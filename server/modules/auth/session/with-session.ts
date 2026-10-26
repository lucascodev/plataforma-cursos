import { handleApiError } from '../../../shared/http/responses/handle-api-error';
import type { Services } from '../../../main/services.type';
import { withCookies } from '../../../shared/http/cookies/with-cookies';
import { resolveSession } from './resolve-session';
import type { ResolvedSession } from './resolved-session.type';
import { unauthorizedResponse } from './unauthorized-response';

// Runs a handler for a signed-in person. A 401 from the handler means Supabase rejected the token, so the session ends.
// Every other outcome, errors included, carries the rotated cookies: losing them would leave the browser with a used refresh token.
export async function withSession(
  request: Request,
  services: Services,
  run: (session: ResolvedSession) => Promise<Response>,
): Promise<Response> {
  const session = await resolveSession(request, services);
  if (!session) return unauthorizedResponse();
  let response: Response;
  try {
    response = await run(session);
  } catch (error) {
    if (session.cookies.length === 0) throw error;
    response = handleApiError(error);
  }
  if (response.status === 401) return unauthorizedResponse();
  return withCookies(response, session.cookies);
}
