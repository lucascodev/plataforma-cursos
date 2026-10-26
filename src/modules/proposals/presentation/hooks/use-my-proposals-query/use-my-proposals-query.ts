import { useQuery } from '@tanstack/react-query';
import { useAuthSession } from '@/modules/auth';
import { makeListMyProposals } from '../../../main/factories/make-list-my-proposals.factory';
import { proposalQueryKeys } from '../../query-keys/proposal-query-keys';

export function useMyProposalsQuery() {
  const userId = useAuthSession().user?.id ?? null;
  return useQuery({
    queryKey: proposalQueryKeys.mine(userId ?? 'signed-out'),
    queryFn: () => makeListMyProposals().execute(),
    enabled: userId !== null,
    staleTime: 30_000,
  });
}
