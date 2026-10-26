import { SubmitProposalUseCase } from '../../application/use-cases/submit-proposal.use-case';
import { makeProposalGateway } from './make-proposal-gateway.factory';

export function makeSubmitProposal(): SubmitProposalUseCase {
  return new SubmitProposalUseCase(makeProposalGateway());
}
