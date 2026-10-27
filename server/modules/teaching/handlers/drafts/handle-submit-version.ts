import { versionSubmitRequestSchema } from '../../../../../contracts/teaching/version-submit-request.schema';
import { courseVersionSchema } from '../../../../../contracts/version/course-version.schema';
import type { Services } from '../../../../main/services.type';
import { isCourseSlug } from '../../../../shared/http/params/is-course-slug';
import { MAX_FORM_BODY_BYTES } from '../../../../shared/http/request-body/max-form-body-bytes';
import { readValidatedBody } from '../../../../shared/http/request-body/read-validated-body';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { withSession } from '../../../auth/session/with-session';
import { courseInvalidResponse } from '../../../../shared/course/course-invalid-response';
import { findCourseErrors } from '../../../../shared/course/find-course-errors';
import { readCourseWorkspace } from '../../read-course-workspace';
import { teachingRpc } from '../../teaching-rpc';
import { VERSION_CONFLICT_MESSAGE } from '../../version-conflict-message';

// The content is checked here, against the exact revision being sent: the database then refuses the send if the
// draft changed after this check.
export function handleSubmitVersion(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return Promise.resolve(problemResponse(404, 'course-not-found', 'Curso não encontrado.'));
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, versionSubmitRequestSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    const result = await readCourseWorkspace(services, session, slug);
    if (!result.ok) return result.response;
    const version = result.workspace.openVersion;
    if (!version || version.id !== body.data.versionId || version.revision !== body.data.revision) {
      return problemResponse(409, 'version-conflict', VERSION_CONFLICT_MESSAGE);
    }
    const errors = findCourseErrors(version.content);
    if (errors.length > 0) return courseInvalidResponse(errors);
    return teachingRpc(
      services,
      session,
      'teacher_submit_version',
      { p_id: version.id, p_kind: body.data.kind, p_message: body.data.message, p_revision: version.revision },
      courseVersionSchema,
      (submitted) => ({ version: submitted }),
    );
  });
}
