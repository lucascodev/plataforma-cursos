import { describe, expect, it } from 'vitest';
import { findMissingProposalDetails } from './find-missing-proposal-details.rule';
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
  level: null,
  duration: null,
  commitmentsAccepted: false,
  commitmentsAcceptedAt: null,
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

describe('findMissingProposalDetails', () => {
  const draft = {
    title: 'Curso',
    summary: 'Resumo',
    audience: 'Todos',
    area: 'Dados',
    language: 'pt-BR',
    outline: ['Um'],
    experience: '',
    sampleUrl: null,
    suggestedSlug: null,
    level: null,
    duration: null,
    commitmentsAccepted: false,
  };

  it('asks for level, duration and the commitments', () => {
    expect(Object.keys(findMissingProposalDetails(draft))).toEqual(['level', 'duration', 'commitmentsAccepted']);
  });

  it('passes when everything is filled', () => {
    expect(findMissingProposalDetails({ ...draft, level: 'beginner', duration: '3-to-6-months', commitmentsAccepted: true })).toEqual({});
  });
});
