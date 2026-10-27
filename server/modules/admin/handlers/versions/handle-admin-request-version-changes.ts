import { versionChangesRequestSchema } from '../../../../../contracts/admin/version-changes-request.schema';
import { courseVersionSchema } from '../../../../../contracts/version/course-version.schema';
import type { Services } from '../../../../main/services.type';
import { isUuid } from '../../../../shared/http/params/is-uuid';
import { MAX_FORM_BODY_BYTES } from '../../../../shared/http/request-body/max-form-body-bytes';
import { readValidatedBody } from '../../../../shared/http/request-body/read-validated-body';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { withSession } from '../../../auth/session/with-session';
import { adminRpc } from '../../admin-rpc';

export function handleAdminRequestVersionChanges(request: Request, id: string, services: Services): Promise<Response> {
  if (!isUuid(id)) return Promise.resolve(problemResponse(404, 'version-not-found', 'Versão não encontrada.'));
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, versionChangesRequestSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    return adminRpc(
      services,
      session,
      'admin_request_version_changes',
      { p_id: id, p_items: body.data.items, p_revision: body.data.revision },
      courseVersionSchema,
      (version) => ({ version }),
    );
  });
}
