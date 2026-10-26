import { ListMyProposalsUseCase } from '../../application/use-cases/list-my-proposals.use-case';
import { makeProposalGateway } from './make-proposal-gateway.factory';

export function makeListMyProposals(): ListMyProposalsUseCase {
  return new ListMyProposalsUseCase(makeProposalGateway());
}
