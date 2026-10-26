import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DecideProposalInputDto } from '../../../application/dtos/decide-proposal-input.dto';
import { makeDecideProposal } from '../../../main/factories/proposals/make-decide-proposal.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

// Admin screens share counts (overview, lists, history), so every change refreshes the whole admin cache.
export function useDecideProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DecideProposalInputDto) => makeDecideProposal().execute(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}
