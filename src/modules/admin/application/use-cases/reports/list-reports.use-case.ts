import type { AdminReport } from '../../../domain/entities/reports/admin-report.entity';
import type { ReportStatus } from '../../../domain/types/report-status.type';
import type { AdminGateway } from '../../ports/admin-gateway.interface';

export class ListReportsUseCase {
  constructor(private readonly adminGateway: AdminGateway) {}

  execute(status: ReportStatus): Promise<AdminReport[]> {
    return this.adminGateway.listReports(status);
  }
}
