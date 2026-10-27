import { useQuery } from '@tanstack/react-query';
import { makeGetAdminVersion } from '../../../main/factories/versions/make-get-admin-version.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

export function useAdminVersionQuery(id: string) {
  return useQuery({ queryKey: adminQueryKeys.version(id), queryFn: () => makeGetAdminVersion().execute(id), staleTime: 15_000 });
}
