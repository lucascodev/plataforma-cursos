import { useQuery } from '@tanstack/react-query';
import { makeGetCourseStats } from '../../../main/factories/make-get-course-stats.factory';
import { teachingQueryKeys } from '../../query-keys/teaching-query-keys';

export function useCourseStatsQuery(slug: string) {
  return useQuery({
    queryKey: teachingQueryKeys.stats(slug),
    queryFn: () => makeGetCourseStats().execute(slug),
    staleTime: 60_000,
  });
}
