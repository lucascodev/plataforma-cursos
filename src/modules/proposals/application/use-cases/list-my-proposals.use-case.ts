import type { Proposal } from '../../domain/entities/proposal.entity';
import type { ProposalGateway } from '../ports/proposal-gateway.interface';

export class ListMyProposalsUseCase {
  constructor(private readonly proposalGateway: ProposalGateway) {}

  execute(): Promise<Proposal[]> {
    return this.proposalGateway.listMine();
  }
}
