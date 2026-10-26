import { useQuery } from '@tanstack/react-query';
import { makeListCourses } from '../../../main/factories/make-list-courses.factory';
import { courseQueryKeys } from '../../query-keys/course-query-keys';

export function useCourseCatalogQuery() {
  return useQuery({
    queryKey: courseQueryKeys.catalog(),
    queryFn: () => makeListCourses().execute(),
    staleTime: 5 * 60_000,
  });
}
