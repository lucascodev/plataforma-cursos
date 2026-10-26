import type { AdminOverview } from '../../domain/entities/admin-overview.entity';
import type { AdminGateway } from '../ports/admin-gateway.interface';

export class GetAdminOverviewUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(): Promise<AdminOverview> {
    return this.adminGateway.getOverview();
  }
}
