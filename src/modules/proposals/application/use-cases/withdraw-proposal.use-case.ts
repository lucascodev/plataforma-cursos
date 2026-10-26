import type { ProposalGateway } from '../ports/proposal-gateway.interface';

export class WithdrawProposalUseCase {
  constructor(private readonly proposalGateway: ProposalGateway) {}

  execute(id: string): Promise<void> {
    return this.proposalGateway.withdraw(id);
  }
}
