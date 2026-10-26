import { UpdateProposalUseCase } from '../../application/use-cases/update-proposal.use-case';
import { makeProposalGateway } from './make-proposal-gateway.factory';

export function makeUpdateProposal(): UpdateProposalUseCase {
  return new UpdateProposalUseCase(makeProposalGateway());
}
