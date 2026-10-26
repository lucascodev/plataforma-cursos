import { z } from 'zod';
import { adminCourseSchema } from '../../../../../contracts/admin-course.schema';
import type { Services } from '../../../../main/services.type';
import { withSession } from '../../../auth/session/with-session';
import { adminRpc } from '../../admin-rpc';

export function handleAdminListCourses(request: Request, services: Services): Promise<Response> {
  return withSession(request, services, (session) =>
    adminRpc(services, session, 'admin_list_courses', {}, z.array(adminCourseSchema).max(1000), (courses) => ({ courses })),
  );
}
