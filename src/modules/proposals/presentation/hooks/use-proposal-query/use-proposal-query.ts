import { useQuery } from '@tanstack/react-query';
import { useAuthSession } from '@/modules/auth';
import { makeGetProposal } from '../../../main/factories/make-get-proposal.factory';
import { proposalQueryKeys } from '../../query-keys/proposal-query-keys';

export function useProposalQuery(id: string) {
  const signedIn = useAuthSession().user !== null;
  return useQuery({
    queryKey: proposalQueryKeys.detail(id),
    queryFn: () => makeGetProposal().execute(id),
    enabled: signedIn,
    staleTime: 30_000,
  });
}
