import { courseSlugSchema } from '@contracts/course-slug.schema';
import { useState } from 'react';
import { readErrorMessage } from '@/shared/presentation/formatters/read-error-message';
import type { AdminProposal } from '../../../domain/entities/admin-proposal.entity';
import { suggestCourseSlug } from '../../../domain/rules/suggest-course-slug.rule';
import { useApproveProposalMutation } from '../use-approve-proposal-mutation/use-approve-proposal-mutation';
import { useDecideProposalMutation } from '../use-decide-proposal-mutation/use-decide-proposal-mutation';

export function useProposalReview(proposal: AdminProposal) {
  const approve = useApproveProposalMutation();
  const decide = useDecideProposalMutation();
  const [slug, setSlug] = useState(proposal.suggestedSlug ?? suggestCourseSlug(proposal.title));
  const [note, setNote] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const slugError = courseSlugSchema.safeParse(slug).success ? null : 'Use letras minúsculas, números e hífens (até 60).';
  const failed = approve.error ?? decide.error;

  const runDecision = (decision: 'changes_requested' | 'refused') => {
    if (!note.trim()) {
      setLocalError(decision === 'refused' ? 'Explique o motivo da recusa.' : 'Diga o que precisa mudar.');
      return;
    }
    setLocalError(null);
    decide.mutate({ id: proposal.id, decision, note });
  };

  return {
    slug,
    note,
    slugError,
    isWorking: approve.isPending || decide.isPending,
    error: localError ?? (failed ? readErrorMessage(failed, 'Não foi possível concluir agora.') : null),
    approvedSlug: approve.data?.courseSlug ?? null,
    decided: decide.isSuccess,
    setSlug: (value: string) => setSlug(value.toLowerCase()),
    setNote,
    approve: () => {
      if (slugError) return;
      setLocalError(null);
      approve.mutate({ id: proposal.id, slug, note });
    },
    requestChanges: () => runDecision('changes_requested'),
    refuse: () => runDecision('refused'),
  };
}
