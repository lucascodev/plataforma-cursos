import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PublishVersionInputDto } from '../../../application/dtos/publish-version-input.dto';
import { makePublishVersion } from '../../../main/factories/versions/make-publish-version.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

// Admin screens share counts (overview, lists, history), so every change refreshes the whole admin cache.
export function usePublishVersionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PublishVersionInputDto) => makePublishVersion().execute(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}
