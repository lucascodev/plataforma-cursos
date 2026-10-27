import { courseVersionSchema } from '../../../../../contracts/version/course-version.schema';
import type { Services } from '../../../../main/services.type';
import { isUuid } from '../../../../shared/http/params/is-uuid';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { withSession } from '../../../auth/session/with-session';
import { adminRpc } from '../../admin-rpc';

export function handleAdminRestoreVersion(request: Request, id: string, services: Services): Promise<Response> {
  if (!isUuid(id)) return Promise.resolve(problemResponse(404, 'version-not-found', 'Versão não encontrada.'));
  return withSession(request, services, (session) =>
    adminRpc(services, session, 'admin_restore_version', { p_id: id }, courseVersionSchema, (version) => ({ version })),
  );
}
