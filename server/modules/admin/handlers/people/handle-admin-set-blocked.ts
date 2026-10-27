import { accountBlockSchema } from '../../../../../contracts/admin/account-block.schema';
import type { Services } from '../../../../main/services.type';
import { isUuid } from '../../../../shared/http/params/is-uuid';
import { MAX_FORM_BODY_BYTES } from '../../../../shared/http/request-body/max-form-body-bytes';
import { readValidatedBody } from '../../../../shared/http/request-body/read-validated-body';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { withSession } from '../../../auth/session/with-session';
import { adminRpc } from '../../admin-rpc';

export function handleAdminSetBlocked(request: Request, id: string, services: Services): Promise<Response> {
  if (!isUuid(id)) return Promise.resolve(problemResponse(404, 'person-not-found', 'Pessoa não encontrada.'));
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, accountBlockSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    return adminRpc(services, session, 'admin_set_blocked', { p_user: id, p_blocked: body.data.blocked }, null, () => null);
  });
}
