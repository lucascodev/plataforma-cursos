import type { Services } from '../../../main/services.type';
import { isCourseSlug } from '../../../shared/http/is-course-slug';
import { problemResponse } from '../../../shared/http/problem-response';
import { withSession } from '../../auth/with-session';
import { adminRpc } from '../admin-rpc';

export async function handleAdminDeleteCourse(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
  return withSession(request, services, (session) => adminRpc(services, session, 'admin_delete_course', { p_slug: slug }, null, () => null));
}
