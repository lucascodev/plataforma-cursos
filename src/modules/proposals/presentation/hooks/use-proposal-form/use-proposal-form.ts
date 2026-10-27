import { proposalInputSchema } from '@contracts/proposal/proposal-input.schema';
import { useState, type FormEvent } from 'react';
import type { ProposalDraft } from '../../../domain/entities/proposal-draft.entity';
import { findMissingProposalDetails } from '../../../domain/rules/find-missing-proposal-details.rule';

const MAX_MODULES = 30;

const EMPTY_DRAFT: ProposalDraft = {
  title: '',
  summary: '',
  audience: '',
  area: 'Programação',
  language: 'pt-BR',
  outline: [''],
  experience: '',
  sampleUrl: null,
  suggestedSlug: null,
  level: null,
  duration: null,
  commitmentsAccepted: false,
};

type FieldErrors = Partial<Record<keyof ProposalDraft, string>>;

// Validates with the same contract the API uses, so most mistakes show up before anything is sent.
export function useProposalForm(initial: ProposalDraft | null, onValid: (draft: ProposalDraft) => void) {
  const [draft, setDraft] = useState<ProposalDraft>(initial ?? EMPTY_DRAFT);
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = <K extends keyof ProposalDraft>(field: K, value: ProposalDraft[K]) => setDraft((current) => ({ ...current, [field]: value }));
  const setOutline = (outline: readonly string[]) => set('outline', outline);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = proposalInputSchema.safeParse({
      ...draft,
      outline: draft.outline.map((title) => title.trim()).filter(Boolean),
      sampleUrl: draft.sampleUrl?.trim() || null,
      suggestedSlug: draft.suggestedSlug?.trim() || null,
    });
    const missing = findMissingProposalDetails(draft);
    if (!parsed.success || Object.keys(missing).length > 0) {
      const next: FieldErrors = { ...missing };
      for (const issue of parsed.success ? [] : parsed.error.issues) {
        const field = issue.path[0] as keyof ProposalDraft | undefined;
        if (field && !next[field]) next[field] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    onValid({ ...draft, ...parsed.data, level: draft.level, duration: draft.duration, commitmentsAccepted: true });
  };

  return {
    draft,
    errors,
    hasErrors: Object.keys(errors).length > 0,
    set,
    addModule: () => setOutline(draft.outline.length < MAX_MODULES ? [...draft.outline, ''] : draft.outline),
    updateModule: (index: number, title: string) => setOutline(draft.outline.map((current, position) => (position === index ? title : current))),
    removeModule: (index: number) => setOutline(draft.outline.filter((_, position) => position !== index)),
    moveModule: (index: number, offset: -1 | 1) => {
      const target = index + offset;
      if (target < 0 || target >= draft.outline.length) return;
      const next = [...draft.outline];
      [next[index], next[target]] = [next[target] ?? '', next[index] ?? ''];
      setOutline(next);
    },
    canAddModule: draft.outline.length < MAX_MODULES,
    submit,
  };
}
