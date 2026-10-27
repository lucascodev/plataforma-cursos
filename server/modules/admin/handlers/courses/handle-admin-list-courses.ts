import { z } from 'zod';
import { adminCourseStatusSchema } from '../../../../../contracts/admin/admin-course-status.schema';
import { adminCourseSchema } from '../../../../../contracts/admin/admin-course.schema';
import type { Services } from '../../../../main/services.type';
import { withSession } from '../../../auth/session/with-session';
import { adminRpc } from '../../admin-rpc';

const MAX_QUERY_LENGTH = 80;

export function handleAdminListCourses(request: Request, services: Services): Promise<Response> {
  const url = new URL(request.url);
  const status = adminCourseStatusSchema.safeParse(url.searchParams.get('status'));
  const query = (url.searchParams.get('q') ?? '').trim().slice(0, MAX_QUERY_LENGTH);
  return withSession(request, services, (session) =>
    adminRpc(
      services,
      session,
      'admin_list_courses',
      { p_query: query || null, p_status: status.success ? status.data : null },
      z.array(adminCourseSchema).max(1000),
      (courses) => ({ courses }),
    ),
  );
}
