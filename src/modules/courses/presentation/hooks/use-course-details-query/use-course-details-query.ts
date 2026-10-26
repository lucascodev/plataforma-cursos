import { useQuery } from '@tanstack/react-query';
import { CourseNotFoundError } from '../../../domain/errors/course-not-found.error';
import { makeGetCourseBySlug } from '../../../main/factories/make-get-course-by-slug.factory';
import { courseQueryKeys } from '../../query-keys/course-query-keys';

export function useCourseDetailsQuery(slug: string) {
  return useQuery({
    queryKey: courseQueryKeys.detail(slug),
    queryFn: () => makeGetCourseBySlug().execute({ slug }),
    staleTime: 5 * 60_000,
    retry: (failureCount, error) => !(error instanceof CourseNotFoundError) && failureCount < 1,
  });
}
