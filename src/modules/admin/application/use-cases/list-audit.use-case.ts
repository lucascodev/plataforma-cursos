import type { AuditPage } from '../../domain/entities/audit-page.entity';
import type { AdminGateway } from '../ports/admin-gateway.interface';

export class ListAuditUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(before: number | null): Promise<AuditPage> {
    return this.adminGateway.listAudit(before);
  }
}
