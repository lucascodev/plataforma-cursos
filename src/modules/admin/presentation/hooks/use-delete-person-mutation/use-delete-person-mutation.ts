import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeDeletePerson } from '../../../main/factories/people/make-delete-person.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

// Admin screens share counts (overview, lists, history), so every change refreshes the whole admin cache.
export function useDeletePersonMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (personId: string) => makeDeletePerson().execute(personId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}
