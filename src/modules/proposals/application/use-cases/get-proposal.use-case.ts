import type { Proposal } from '../../domain/entities/proposal.entity';
import type { ProposalGateway } from '../ports/proposal-gateway.interface';

export class GetProposalUseCase {
  constructor(private readonly proposalGateway: ProposalGateway) {}

  execute(id: string): Promise<Proposal | null> {
    return this.proposalGateway.get(id);
  }
}
