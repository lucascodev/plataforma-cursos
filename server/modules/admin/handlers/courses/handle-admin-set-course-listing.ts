import { courseListingSchema } from '../../../../../contracts/course/course-listing.schema';
import type { Services } from '../../../../main/services.type';
import { isCourseSlug } from '../../../../shared/http/params/is-course-slug';
import { MAX_FORM_BODY_BYTES } from '../../../../shared/http/request-body/max-form-body-bytes';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { readValidatedBody } from '../../../../shared/http/request-body/read-validated-body';
import { withSession } from '../../../auth/session/with-session';
import { adminRpc } from '../../admin-rpc';

export async function handleAdminSetCourseListing(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, courseListingSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    const { listed, reason = null, note = null } = body.data;
    return adminRpc(services, session, 'admin_set_course_listed', { p_slug: slug, p_listed: listed, p_reason: reason, p_note: note }, null, () => null);
  });
}
