import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeResolveReport } from '../../../main/factories/reports/make-resolve-report.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

// Admin screens share counts (overview, lists, history), so every change refreshes the whole admin cache.
export function useResolveReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'resolved' | 'dismissed' }) => makeResolveReport().execute(id, decision),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}
