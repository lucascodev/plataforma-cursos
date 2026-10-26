import { roleChangeSchema } from '../../../../contracts/role-change.schema';
import type { Services } from '../../../main/services.type';
import { isUuid } from '../../../shared/http/is-uuid';
import { MAX_FORM_BODY_BYTES } from '../../../shared/http/max-form-body-bytes';
import { problemResponse } from '../../../shared/http/problem-response';
import { readValidatedBody } from '../../../shared/http/read-validated-body';
import { withSession } from '../../auth/with-session';
import { adminRpc } from '../admin-rpc';

export async function handleAdminSetRole(request: Request, id: string, services: Services): Promise<Response> {
  if (!isUuid(id)) return problemResponse(404, 'person-not-found', 'Pessoa não encontrada.');
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, roleChangeSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    return adminRpc(services, session, 'admin_set_role', { p_user: id, p_role: body.data.role }, null, () => null);
  });
}
