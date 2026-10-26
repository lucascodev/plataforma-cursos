import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeDeleteCourse } from '../../../main/factories/make-delete-course.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

// Admin screens share counts (overview, lists, history), so every change refreshes the whole admin cache.
export function useDeleteCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => makeDeleteCourse().execute(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}
