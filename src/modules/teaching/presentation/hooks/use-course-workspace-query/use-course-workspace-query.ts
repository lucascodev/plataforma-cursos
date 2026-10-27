import { useQuery } from '@tanstack/react-query';
import { makeGetCourseWorkspace } from '../../../main/factories/make-get-course-workspace.factory';
import { teachingQueryKeys } from '../../query-keys/teaching-query-keys';

// No background refetch: the editor keeps its own copy while the person types, and a refetch must not overwrite it.
export function useCourseWorkspaceQuery(slug: string) {
  return useQuery({
    queryKey: teachingQueryKeys.workspace(slug),
    queryFn: () => makeGetCourseWorkspace().execute(slug),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
