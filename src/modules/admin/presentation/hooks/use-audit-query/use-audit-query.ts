import { useQuery } from '@tanstack/react-query';
import type { AuditKind } from '../../../domain/types/audit-kind.type';
import { makeListAudit } from '../../../main/factories/make-list-audit.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

export function useAuditQuery(before: number | null, kind: AuditKind | null) {
  return useQuery({
    queryKey: adminQueryKeys.audit(before, kind),
    queryFn: () => makeListAudit().execute(before, kind),
    staleTime: 15_000,
  });
}
