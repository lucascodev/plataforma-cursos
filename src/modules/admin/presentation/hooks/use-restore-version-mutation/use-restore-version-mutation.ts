import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeRestoreVersion } from '../../../main/factories/versions/make-restore-version.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

// Admin screens share counts (overview, lists, history), so every change refreshes the whole admin cache.
export function useRestoreVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => makeRestoreVersion().execute(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}
