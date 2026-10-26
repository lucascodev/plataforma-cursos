import { describe, expect, it } from 'vitest';
import type { Proposal } from '../entities/proposal.entity';
import { canEditProposal } from './can-edit-proposal.rule';
import { countOpenProposals } from './count-open-proposals.rule';

const proposal = (status: Proposal['status']): Proposal => ({
  id: status,
  status,
  title: 'Curso',
  summary: 'Resumo',
  audience: 'Todos',
  area: 'Dados',
  language: 'pt-BR',
  outline: ['M1'],
  experience: '',
  sampleUrl: null,
  suggestedSlug: null,
  reviewNote: null,
  reviewedAt: null,
  courseSlug: null,
  createdAt: '',
  updatedAt: '',
});

describe('proposal rules', () => {
  it('only open proposals can be edited', () => {
    expect(canEditProposal('pending')).toBe(true);
    expect(canEditProposal('changes_requested')).toBe(true);
    expect(canEditProposal('approved')).toBe(false);
    expect(canEditProposal('refused')).toBe(false);
    expect(canEditProposal('withdrawn')).toBe(false);
  });

  it('counts open proposals for the limit hint', () => {
    expect(countOpenProposals([proposal('pending'), proposal('changes_requested'), proposal('approved')])).toBe(2);
  });
});
