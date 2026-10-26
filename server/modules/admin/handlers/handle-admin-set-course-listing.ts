import { courseListingSchema } from '../../../../contracts/course-listing.schema';
import type { Services } from '../../../main/services.type';
import { isCourseSlug } from '../../../shared/http/is-course-slug';
import { MAX_FORM_BODY_BYTES } from '../../../shared/http/max-form-body-bytes';
import { problemResponse } from '../../../shared/http/problem-response';
import { readValidatedBody } from '../../../shared/http/read-validated-body';
import { withSession } from '../../auth/with-session';
import { adminRpc } from '../admin-rpc';

export async function handleAdminSetCourseListing(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, courseListingSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    return adminRpc(services, session, 'admin_set_course_listed', { p_slug: slug, p_listed: body.data.listed }, null, () => null);
  });
}
