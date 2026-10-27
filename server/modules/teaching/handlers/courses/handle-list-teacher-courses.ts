import { z } from 'zod';
import { teacherCourseSchema } from '../../../../../contracts/teaching/teacher-course.schema';
import type { Services } from '../../../../main/services.type';
import { withSession } from '../../../auth/session/with-session';
import { teachingRpc } from '../../teaching-rpc';

export function handleListTeacherCourses(request: Request, services: Services): Promise<Response> {
  return withSession(request, services, (session) =>
    teachingRpc(services, session, 'teacher_list_my_courses', {}, z.array(teacherCourseSchema).max(200), (courses) => ({ courses })),
  );
}
