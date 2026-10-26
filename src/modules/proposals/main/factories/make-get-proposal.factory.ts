import { GetProposalUseCase } from '../../application/use-cases/get-proposal.use-case';
import { makeProposalGateway } from './make-proposal-gateway.factory';

export function makeGetProposal(): GetProposalUseCase {
  return new GetProposalUseCase(makeProposalGateway());
}
