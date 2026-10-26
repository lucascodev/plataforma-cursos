import { authUserSchema } from '../../../../contracts/auth-user.schema';
import type { Services } from '../../../main/services.type';
import { jsonResponse } from '../../../shared/http/responses/json-response';
import { problemResponse } from '../../../shared/http/responses/problem-response';
import { readUpstreamJson } from '../../../shared/http/upstream/read-upstream-json';
import { callRpc } from '../../../shared/supabase/rest/call-rpc';
import { withSession } from '../session/with-session';

// ensure_profile also validates the token in Supabase and creates the profile if sign-up could not.
export function handleMe(request: Request, services: Services): Promise<Response> {
  return withSession(request, services, async (session) => {
    const response = await callRpc(services, 'ensure_profile', {}, session.accessToken);
    if (response.status === 401) return response;
    if (!response.ok) return problemResponse(502, 'unavailable', 'Não foi possível carregar sua conta agora.');
    const user = await readUpstreamJson(response, authUserSchema);
    if (!user) return problemResponse(502, 'unavailable', 'Não foi possível carregar sua conta agora.');
    return jsonResponse({ user });
  });
}
