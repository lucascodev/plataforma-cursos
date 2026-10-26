import { GetAdminProposalUseCase } from '../../../application/use-cases/proposals/get-admin-proposal.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeGetAdminProposal(): GetAdminProposalUseCase {
  return new GetAdminProposalUseCase(makeAdminGateway());
}
