import { DecideProposalUseCase } from '../../application/use-cases/decide-proposal.use-case';
import { makeAdminGateway } from './make-admin-gateway.factory';

export function makeDecideProposal(): DecideProposalUseCase {
  return new DecideProposalUseCase(makeAdminGateway());
}
