import { ApproveProposalUseCase } from '../../application/use-cases/approve-proposal.use-case';
import { makeAdminGateway } from './make-admin-gateway.factory';

export function makeApproveProposal(): ApproveProposalUseCase {
  return new ApproveProposalUseCase(makeAdminGateway());
}
