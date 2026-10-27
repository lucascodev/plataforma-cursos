import { versionPublishRequestSchema } from '../../../../../contracts/admin/version-publish-request.schema';
import { courseVersionSchema } from '../../../../../contracts/version/course-version.schema';
import type { Services } from '../../../../main/services.type';
import { isUuid } from '../../../../shared/http/params/is-uuid';
import { MAX_FORM_BODY_BYTES } from '../../../../shared/http/request-body/max-form-body-bytes';
import { readValidatedBody } from '../../../../shared/http/request-body/read-validated-body';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { withSession } from '../../../auth/session/with-session';
import { courseInvalidResponse } from '../../../../shared/course/course-invalid-response';
import { findCourseErrors } from '../../../../shared/course/find-course-errors';
import { adminRpc } from '../../admin-rpc';
import { readAdminVersion } from '../../read-admin-version';

// The course schema runs again here: a version that reaches the catalog always opens on the course page.
export function handleAdminPublishVersion(request: Request, id: string, services: Services): Promise<Response> {
  if (!isUuid(id)) return Promise.resolve(problemResponse(404, 'version-not-found', 'Versão não encontrada.'));
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, versionPublishRequestSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    const result = await readAdminVersion(services, session, id);
    if (!result.ok) return result.response;
    const { version } = result.detail;
    if (version.revision !== body.data.revision) {
      return problemResponse(409, 'version-conflict', 'A versão mudou desde que você abriu esta página. Recarregue para ver a atual.');
    }
    const errors = findCourseErrors(version.content);
    if (errors.length > 0) return courseInvalidResponse(errors);
    return adminRpc(
      services,
      session,
      'admin_publish_version',
      { p_id: id, p_release_note: body.data.releaseNote, p_revision: version.revision },
      courseVersionSchema,
      (published) => ({ version: published }),
    );
  });
}
