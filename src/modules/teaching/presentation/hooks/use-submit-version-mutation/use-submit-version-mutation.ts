import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SubmitVersionInputDto } from '../../../application/dtos/submit-version-input.dto';
import { makeSubmitVersion } from '../../../main/factories/make-submit-version.factory';
import { teachingQueryKeys } from '../../query-keys/teaching-query-keys';

export function useSubmitVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitVersionInputDto) => makeSubmitVersion().execute(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teachingQueryKeys.all });
    },
  });
}
