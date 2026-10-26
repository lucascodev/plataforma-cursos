import type { AdminProposal } from '../../../domain/entities/admin-proposal.entity';
import type { PagedList } from '../../../domain/entities/paged-list.entity';
import type { ListProposalsInputDto } from '../../dtos/list-proposals-input.dto';
import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class ListAdminProposalsUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(input: ListProposalsInputDto): Promise<PagedList<AdminProposal>> {
    return this.adminGateway.listProposals(input);
  }
}
