import { useQuery } from '@tanstack/react-query';
import { makeListAudit } from '../../../main/factories/make-list-audit.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

export function useAuditQuery(before: number | null) {
  return useQuery({
    queryKey: adminQueryKeys.audit(before),
    queryFn: () => makeListAudit().execute(before),
    staleTime: 15_000,
  });
}
