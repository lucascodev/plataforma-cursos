import type { Services } from '../../../../main/services.type';
import { isUuid } from '../../../../shared/http/params/is-uuid';
import { jsonResponse } from '../../../../shared/http/responses/json-response';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { withSession } from '../../../auth/session/with-session';
import { readAdminVersion } from '../../read-admin-version';

export function handleAdminGetVersion(request: Request, id: string, services: Services): Promise<Response> {
  if (!isUuid(id)) return Promise.resolve(problemResponse(404, 'version-not-found', 'Versão não encontrada.'));
  return withSession(request, services, async (session) => {
    const result = await readAdminVersion(services, session, id);
    return result.ok ? jsonResponse(result.detail) : result.response;
  });
}
