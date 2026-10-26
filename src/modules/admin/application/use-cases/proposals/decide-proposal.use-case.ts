import type { DecideProposalInputDto } from '../../dtos/decide-proposal-input.dto';
import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class DecideProposalUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(input: DecideProposalInputDto): Promise<void> {
    return this.adminGateway.decideProposal({ ...input, note: input.note.trim() });
  }
}
