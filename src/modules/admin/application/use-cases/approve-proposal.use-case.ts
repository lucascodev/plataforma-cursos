import type { ApproveProposalInputDto } from '../dtos/approve-proposal-input.dto';
import type { AdminGateway } from '../ports/admin-gateway.interface';

export class ApproveProposalUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(input: ApproveProposalInputDto): Promise<{ courseSlug: string }> {
    return this.adminGateway.approveProposal({ ...input, slug: input.slug.trim(), note: input.note.trim() });
  }
}
