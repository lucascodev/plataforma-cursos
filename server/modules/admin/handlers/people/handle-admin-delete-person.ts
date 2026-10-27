import type { Services } from '../../../../main/services.type';
import { isUuid } from '../../../../shared/http/params/is-uuid';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { withSession } from '../../../auth/session/with-session';
import { adminRpc } from '../../admin-rpc';

export function handleAdminDeletePerson(request: Request, id: string, services: Services): Promise<Response> {
  if (!isUuid(id)) return Promise.resolve(problemResponse(404, 'person-not-found', 'Pessoa não encontrada.'));
  return withSession(request, services, (session) => adminRpc(services, session, 'admin_delete_account', { p_user: id }, null, () => null));
}
