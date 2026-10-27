import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RequestVersionChangesInputDto } from '../../../application/dtos/request-version-changes-input.dto';
import { makeRequestVersionChanges } from '../../../main/factories/versions/make-request-version-changes.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

// Admin screens share counts (overview, lists, history), so every change refreshes the whole admin cache.
export function useRequestVersionChangesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RequestVersionChangesInputDto) => makeRequestVersionChanges().execute(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}
