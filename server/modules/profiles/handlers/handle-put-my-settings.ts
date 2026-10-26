import { accountSettingsSchema } from '../../../../contracts/account-settings.schema';
import type { Services } from '../../../main/services.type';
import { jsonResponse } from '../../../shared/http/json-response';
import { MAX_FORM_BODY_BYTES } from '../../../shared/http/max-form-body-bytes';
import { readValidatedBody } from '../../../shared/http/read-validated-body';
import { upstreamProblem } from '../../../shared/http/upstream-problem';
import { withSession } from '../../auth/with-session';

export function handlePutMySettings(request: Request, services: Services): Promise<Response> {
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, accountSettingsSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    const response = await services.rest.request('account_settings?on_conflict=user_id', {
      method: 'POST',
      accessToken: session.accessToken,
      prefer: 'resolution=merge-duplicates,return=minimal',
      body: { user_id: session.userId, ...body.data },
    });
    if (!response.ok) return upstreamProblem(response, {}, 'Não foi possível salvar suas preferências agora.');
    return jsonResponse({ settings: body.data });
  });
}
