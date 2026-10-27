import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeWithdrawVersion } from '../../../main/factories/make-withdraw-version.factory';
import { teachingQueryKeys } from '../../query-keys/teaching-query-keys';

export function useWithdrawVersionMutation(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => makeWithdrawVersion().execute(slug, versionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teachingQueryKeys.all });
    },
  });
}
