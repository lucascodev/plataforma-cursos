import type { ProposalStatus } from '../../domain/types/proposal-status.type';

interface StatusDescription {
  readonly label: string;
  readonly tone: 'neutral' | 'accent' | 'warning';
}

const STATUS: Record<ProposalStatus, StatusDescription> = {
  pending: { label: 'Em análise', tone: 'neutral' },
  changes_requested: { label: 'Ajustes pedidos', tone: 'warning' },
  approved: { label: 'Aprovada', tone: 'accent' },
  refused: { label: 'Recusada', tone: 'neutral' },
  withdrawn: { label: 'Retirada', tone: 'neutral' },
};

export function describeProposalStatus(status: ProposalStatus): StatusDescription {
  return STATUS[status];
}
