import { useQuery } from '@tanstack/react-query';
import { makeGetVersionImpact } from '../../../main/factories/versions/make-get-version-impact.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

export function useVersionImpactQuery(id: string) {
  return useQuery({ queryKey: adminQueryKeys.versionImpact(id), queryFn: () => makeGetVersionImpact().execute(id), staleTime: 60_000 });
}
