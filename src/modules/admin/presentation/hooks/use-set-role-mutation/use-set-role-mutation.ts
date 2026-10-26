import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AdminRole } from '../../../domain/types/admin-role.type';
import { makeSetRole } from '../../../main/factories/make-set-role.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

// Admin screens share counts (overview, lists, history), so every change refreshes the whole admin cache.
export function useSetRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ personId, role }: { personId: string; role: AdminRole }) => makeSetRole().execute(personId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}
