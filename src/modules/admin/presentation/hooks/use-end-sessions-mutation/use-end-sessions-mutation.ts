import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeEndSessions } from '../../../main/factories/people/make-end-sessions.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

// Admin screens share counts (overview, lists, history), so every change refreshes the whole admin cache.
export function useEndSessionsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (personId: string) => makeEndSessions().execute(personId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}
