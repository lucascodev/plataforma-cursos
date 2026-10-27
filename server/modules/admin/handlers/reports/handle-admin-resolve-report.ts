import type { Services } from '../../../../main/services.type';
import { isUuid } from '../../../../shared/http/params/is-uuid';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { withSession } from '../../../auth/session/with-session';
import { adminRpc } from '../../admin-rpc';

export function handleAdminResolveReport(request: Request, id: string, decision: 'resolved' | 'dismissed', services: Services): Promise<Response> {
  if (!isUuid(id)) return Promise.resolve(problemResponse(404, 'report-not-found', 'Aviso não encontrado.'));
  return withSession(request, services, (session) =>
    adminRpc(services, session, 'admin_resolve_report', { p_id: id, p_decision: decision }, null, () => null),
  );
}
