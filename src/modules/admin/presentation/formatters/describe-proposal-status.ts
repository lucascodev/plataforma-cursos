import type { AdminProposalStatus } from '../../domain/types/admin-proposal-status.type';

export const PROPOSAL_STATUS_LABELS: Record<AdminProposalStatus, string> = {
  pending: 'Na fila',
  changes_requested: 'Ajustes pedidos',
  approved: 'Aprovada',
  refused: 'Recusada',
  withdrawn: 'Retirada',
};

export function describeProposalStatus(status: AdminProposalStatus): string {
  return PROPOSAL_STATUS_LABELS[status];
}
