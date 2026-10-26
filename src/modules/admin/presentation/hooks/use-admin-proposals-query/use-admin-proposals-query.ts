import { useQuery } from '@tanstack/react-query';
import type { AdminProposalStatus } from '../../../domain/types/admin-proposal-status.type';
import { makeListAdminProposals } from '../../../main/factories/proposals/make-list-admin-proposals.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

export function useAdminProposalsQuery(status: AdminProposalStatus | null, page: number) {
  return useQuery({
    queryKey: adminQueryKeys.proposals(status, page),
    queryFn: () => makeListAdminProposals().execute({ status, page }),
    staleTime: 15_000,
  });
}
