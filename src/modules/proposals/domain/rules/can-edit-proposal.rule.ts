import type { ProposalStatus } from '../types/proposal-status.type';

// Mirrors the database policy: only open proposals change. The database has the final word.
export function canEditProposal(status: ProposalStatus): boolean {
  return status === 'pending' || status === 'changes_requested';
}
