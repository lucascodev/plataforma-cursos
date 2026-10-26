import type { Proposal } from '../entities/proposal.entity';
import { canEditProposal } from './can-edit-proposal.rule';

export const MAX_OPEN_PROPOSALS = 3;

export function countOpenProposals(proposals: readonly Proposal[]): number {
  return proposals.filter((proposal) => canEditProposal(proposal.status)).length;
}
