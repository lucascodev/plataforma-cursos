import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SetLabCodeInputDto } from '../../../application/dtos/set-lab-code-input.dto';
import { makeSetLabCode } from '../../../main/factories/make-set-lab-code.factory';
import { teachingQueryKeys } from '../../query-keys/teaching-query-keys';

export function useSetLabCodeMutation(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<SetLabCodeInputDto, 'slug'>) => makeSetLabCode().execute({ slug, ...input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teachingQueryKeys.labCodes(slug) });
    },
  });
}
