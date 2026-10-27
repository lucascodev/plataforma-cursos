import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeSetBlocked } from '../../../main/factories/people/make-set-blocked.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

// Admin screens share counts (overview, lists, history), so every change refreshes the whole admin cache.
export function useSetBlockedMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ personId, blocked }: { personId: string; blocked: boolean }) => makeSetBlocked().execute(personId, blocked),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}
