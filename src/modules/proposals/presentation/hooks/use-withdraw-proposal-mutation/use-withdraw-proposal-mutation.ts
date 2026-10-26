import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeWithdrawProposal } from '../../../main/factories/make-withdraw-proposal.factory';
import { proposalQueryKeys } from '../../query-keys/proposal-query-keys';

export function useWithdrawProposalMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => makeWithdrawProposal().execute(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: proposalQueryKeys.all });
    },
  });
}
