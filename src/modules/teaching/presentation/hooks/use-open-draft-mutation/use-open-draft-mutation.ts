import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeOpenDraft } from '../../../main/factories/make-open-draft.factory';
import { teachingQueryKeys } from '../../query-keys/teaching-query-keys';

export function useOpenDraftMutation(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => makeOpenDraft().execute(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teachingQueryKeys.all });
    },
  });
}
