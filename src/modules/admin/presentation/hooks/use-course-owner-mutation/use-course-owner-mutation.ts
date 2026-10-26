import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeSetCourseOwner } from '../../../main/factories/make-set-course-owner.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

// Admin screens share counts (overview, lists, history), so every change refreshes the whole admin cache.
export function useCourseOwnerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, handle }: { slug: string; handle: string }) => makeSetCourseOwner().execute(slug, handle),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}
