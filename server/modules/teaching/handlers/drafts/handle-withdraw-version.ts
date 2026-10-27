import { versionReferenceSchema } from '../../../../../contracts/teaching/version-reference.schema';
import { courseVersionSchema } from '../../../../../contracts/version/course-version.schema';
import type { Services } from '../../../../main/services.type';
import { isCourseSlug } from '../../../../shared/http/params/is-course-slug';
import { MAX_FORM_BODY_BYTES } from '../../../../shared/http/request-body/max-form-body-bytes';
import { readValidatedBody } from '../../../../shared/http/request-body/read-validated-body';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { withSession } from '../../../auth/session/with-session';
import { teachingRpc } from '../../teaching-rpc';

export function handleWithdrawVersion(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return Promise.resolve(problemResponse(404, 'course-not-found', 'Curso não encontrado.'));
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, versionReferenceSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    return teachingRpc(services, session, 'teacher_withdraw_version', { p_id: body.data.versionId }, courseVersionSchema, (version) => ({
      version,
    }));
  });
}
