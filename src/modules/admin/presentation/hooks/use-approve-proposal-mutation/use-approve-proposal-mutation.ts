import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApproveProposalInputDto } from '../../../application/dtos/approve-proposal-input.dto';
import { makeApproveProposal } from '../../../main/factories/proposals/make-approve-proposal.factory';
import { adminQueryKeys } from '../../query-keys/admin-query-keys';

// Admin screens share counts (overview, lists, history), so every change refreshes the whole admin cache.
export function useApproveProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ApproveProposalInputDto) => makeApproveProposal().execute(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
    },
  });
}
