import { useQuery } from '@tanstack/react-query';
import { useAuthSession } from '@/modules/auth';
import { makeListProgressSummaries } from '../../../main/factories/make-list-progress-summaries.factory';
import { progressQueryKeys } from '../../query-keys/progress-query-keys';

export function useProgressSummariesQuery() {
  const userId = useAuthSession().user?.id ?? null;
  return useQuery({
    queryKey: progressQueryKeys.summaries(userId ?? 'signed-out'),
    queryFn: () => makeListProgressSummaries().execute(),
    enabled: userId !== null,
    staleTime: 60_000,
  });
}
