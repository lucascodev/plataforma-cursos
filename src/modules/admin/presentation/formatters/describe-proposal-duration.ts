import type { AdminProposal } from '../../domain/entities/admin-proposal.entity';

const DURATIONS: Readonly<Record<NonNullable<AdminProposal['duration']>, string>> = {
  'up-to-3-months': 'Até 3 meses',
  '3-to-6-months': '3 a 6 meses',
  '6-to-12-months': '6 a 12 meses',
  'over-12-months': 'Mais de 12 meses',
};

export function describeProposalDuration(duration: AdminProposal['duration']): string {
  return duration ? DURATIONS[duration] : 'Não informada';
}
