import type { ProposalDraft } from '../../domain/entities/proposal-draft.entity';
import type { Proposal } from '../../domain/entities/proposal.entity';
import type { ProposalGateway } from '../ports/proposal-gateway.interface';

export class UpdateProposalUseCase {
  constructor(private readonly proposalGateway: ProposalGateway) {}

  execute(id: string, draft: ProposalDraft): Promise<Proposal> {
    return this.proposalGateway.update(id, draft);
  }
}
