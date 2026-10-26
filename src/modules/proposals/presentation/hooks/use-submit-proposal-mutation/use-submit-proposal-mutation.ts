import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProposalDraft } from '../../../domain/entities/proposal-draft.entity';
import { makeSubmitProposal } from '../../../main/factories/make-submit-proposal.factory';
import { proposalQueryKeys } from '../../query-keys/proposal-query-keys';

export function useSubmitProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: ProposalDraft) => makeSubmitProposal().execute(draft),
    onSuccess: (proposal) => {
      queryClient.setQueryData(proposalQueryKeys.detail(proposal.id), proposal);
      void queryClient.invalidateQueries({ queryKey: proposalQueryKeys.all });
    },
  });
}
