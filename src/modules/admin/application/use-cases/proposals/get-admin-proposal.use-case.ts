import type { AdminProposal } from '../../../domain/entities/admin-proposal.entity';
import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class GetAdminProposalUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(id: string): Promise<AdminProposal | null> {
    return this.adminGateway.getProposal(id);
  }
}
