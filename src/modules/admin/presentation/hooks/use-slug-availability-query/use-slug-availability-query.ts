import { useQuery } from '@tanstack/react-query';
import { makeCheckSlug } from '../../../main/factories/courses/make-check-slug.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

// Only asks once the slug is well formed; the format itself is checked in the form.
export function useSlugAvailabilityQuery(slug: string, isWellFormed: boolean) {
  return useQuery({
    queryKey: adminQueryKeys.slug(slug),
    queryFn: () => makeCheckSlug().execute(slug),
    enabled: isWellFormed,
    staleTime: 10_000,
  });
}
