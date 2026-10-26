import { z } from 'zod';
import { myProfileSchema } from '../../../../contracts/profile/my-profile.schema';
import { profileUpdateSchema } from '../../../../contracts/profile/profile-update.schema';
import type { Services } from '../../../main/services.type';
import { jsonResponse } from '../../../shared/http/responses/json-response';
import { MAX_FORM_BODY_BYTES } from '../../../shared/http/request-body/max-form-body-bytes';
import { problemResponse } from '../../../shared/http/responses/problem-response';
import { readUpstreamJson } from '../../../shared/http/upstream/read-upstream-json';
import { readValidatedBody } from '../../../shared/http/request-body/read-validated-body';
import { upstreamProblem } from '../../../shared/http/upstream/upstream-problem';
import { withSession } from '../../auth/session/with-session';
import { MY_PROFILE_COLUMNS } from '../profile-columns';

export function handlePutMyProfile(request: Request, services: Services): Promise<Response> {
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, profileUpdateSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    const response = await services.rest.request(`profiles?id=eq.${encodeURIComponent(session.userId)}&select=${MY_PROFILE_COLUMNS}`, {
      method: 'PATCH',
      accessToken: session.accessToken,
      prefer: 'return=representation',
      body: {
        display_name: body.data.displayName,
        bio: body.data.bio,
        links: body.data.links,
        show_student_count: body.data.showStudentCount,
      },
    });
    if (!response.ok) return upstreamProblem(response, {}, 'Não foi possível salvar seu perfil agora.');
    const rows = await readUpstreamJson(response, z.array(myProfileSchema).max(1));
    const profile = rows?.[0];
    if (!profile) return problemResponse(404, 'profile-not-found', 'Perfil não encontrado.');
    return jsonResponse({ profile });
  });
}
