import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeSetCourseListed } from '../../../main/factories/courses/make-set-course-listed.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

// Admin screens share counts (overview, lists, history), so every change refreshes the whole admin cache.
export function useCourseListingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, listed }: { slug: string; listed: boolean }) => makeSetCourseListed().execute(slug, listed),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}
