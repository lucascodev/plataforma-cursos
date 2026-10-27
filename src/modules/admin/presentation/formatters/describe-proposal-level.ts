import type { AdminProposal } from '../../domain/entities/admin-proposal.entity';

const LEVELS: Readonly<Record<NonNullable<AdminProposal['level']>, string>> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

export function describeProposalLevel(level: AdminProposal['level']): string {
  return level ? LEVELS[level] : 'Não informado';
}
