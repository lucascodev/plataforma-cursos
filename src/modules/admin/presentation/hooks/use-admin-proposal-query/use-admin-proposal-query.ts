import { useQuery } from '@tanstack/react-query';
import { makeGetAdminProposal } from '../../../main/factories/proposals/make-get-admin-proposal.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

export function useAdminProposalQuery(id: string) {
  return useQuery({
    queryKey: adminQueryKeys.proposal(id),
    queryFn: () => makeGetAdminProposal().execute(id),
    staleTime: 15_000,
  });
}
