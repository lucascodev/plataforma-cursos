import { z } from 'zod';
import { myProfileSchema } from '../../../../contracts/my-profile.schema';
import type { Services } from '../../../main/services.type';
import { jsonResponse } from '../../../shared/http/responses/json-response';
import { problemResponse } from '../../../shared/http/responses/problem-response';
import { readUpstreamJson } from '../../../shared/http/upstream/read-upstream-json';
import { withSession } from '../../auth/session/with-session';
import { MY_PROFILE_COLUMNS } from '../profile-columns';

export function handleGetMyProfile(request: Request, services: Services): Promise<Response> {
  return withSession(request, services, async (session) => {
    const response = await services.rest.request(
      `profiles?id=eq.${encodeURIComponent(session.userId)}&select=${MY_PROFILE_COLUMNS}&limit=1`,
      { accessToken: session.accessToken },
    );
    if (response.status === 401) return response;
    if (!response.ok) return problemResponse(502, 'unavailable', 'Não foi possível carregar seu perfil agora.');
    const rows = await readUpstreamJson(response, z.array(myProfileSchema).max(1));
    if (!rows) return problemResponse(502, 'unavailable', 'Não foi possível carregar seu perfil agora.');
    const [profile] = rows;
    if (!profile) return problemResponse(404, 'profile-not-found', 'Perfil não encontrado.');
    return jsonResponse({ profile });
  });
}
