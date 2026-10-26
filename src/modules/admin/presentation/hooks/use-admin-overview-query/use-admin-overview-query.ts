import { useQuery } from '@tanstack/react-query';
import { makeGetAdminOverview } from '../../../main/factories/make-get-admin-overview.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

export function useAdminOverviewQuery() {
  return useQuery({
    queryKey: adminQueryKeys.overview(),
    queryFn: () => makeGetAdminOverview().execute(),
    staleTime: 30_000,
  });
}
