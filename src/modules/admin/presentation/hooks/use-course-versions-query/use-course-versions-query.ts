import { useQuery } from '@tanstack/react-query';
import { makeListCourseVersions } from '../../../main/factories/versions/make-list-course-versions.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

export function useCourseVersionsQuery(slug: string) {
  return useQuery({ queryKey: adminQueryKeys.courseVersions(slug), queryFn: () => makeListCourseVersions().execute(slug), staleTime: 15_000 });
}
