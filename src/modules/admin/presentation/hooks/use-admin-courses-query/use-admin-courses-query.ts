import { useQuery } from '@tanstack/react-query';
import { makeListAdminCourses } from '../../../main/factories/courses/make-list-admin-courses.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

export function useAdminCoursesQuery() {
  return useQuery({
    queryKey: adminQueryKeys.courses(),
    queryFn: () => makeListAdminCourses().execute(),
    staleTime: 15_000,
  });
}
