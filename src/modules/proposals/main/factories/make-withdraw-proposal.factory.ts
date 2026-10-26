import { WithdrawProposalUseCase } from '../../application/use-cases/withdraw-proposal.use-case';
import { makeProposalGateway } from './make-proposal-gateway.factory';

export function makeWithdrawProposal(): WithdrawProposalUseCase {
  return new WithdrawProposalUseCase(makeProposalGateway());
}
