import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProposalDraft } from '../../../domain/entities/proposal-draft.entity';
import { makeUpdateProposal } from '../../../main/factories/make-update-proposal.factory';
import { proposalQueryKeys } from '../../query-keys/proposal-query-keys';

export function useUpdateProposalMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: ProposalDraft) => makeUpdateProposal().execute(id, draft),
    onSuccess: (proposal) => {
      queryClient.setQueryData(proposalQueryKeys.detail(id), proposal);
      void queryClient.invalidateQueries({ queryKey: proposalQueryKeys.all });
    },
  });
}
