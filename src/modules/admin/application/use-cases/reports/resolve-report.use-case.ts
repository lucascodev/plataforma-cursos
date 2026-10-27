import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class ResolveReportUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(id: string, decision: 'resolved' | 'dismissed'): Promise<void> {
    return this.adminGateway.resolveReport(id, decision);
  }
}
