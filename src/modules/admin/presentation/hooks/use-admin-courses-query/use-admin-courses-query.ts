import { useQuery } from '@tanstack/react-query';
import type { AdminCourseStatus } from '../../../domain/types/admin-course-status.type';
import { makeListAdminCourses } from '../../../main/factories/courses/make-list-admin-courses.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

export function useAdminCoursesQuery(query: string, status: AdminCourseStatus | null) {
  return useQuery({
    queryKey: adminQueryKeys.courses(query, status),
    queryFn: () => makeListAdminCourses().execute({ query, status }),
    staleTime: 15_000,
  });
}
