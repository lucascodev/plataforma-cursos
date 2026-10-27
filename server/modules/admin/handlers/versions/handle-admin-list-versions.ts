import { z } from 'zod';
import { courseVersionSchema } from '../../../../../contracts/version/course-version.schema';
import type { Services } from '../../../../main/services.type';
import { isCourseSlug } from '../../../../shared/http/params/is-course-slug';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { withSession } from '../../../auth/session/with-session';
import { adminRpc } from '../../admin-rpc';

export function handleAdminListVersions(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return Promise.resolve(problemResponse(404, 'course-not-found', 'Curso não encontrado.'));
  return withSession(request, services, (session) =>
    adminRpc(services, session, 'admin_list_versions', { p_slug: slug }, z.array(courseVersionSchema).max(500), (versions) => ({ versions })),
  );
}
