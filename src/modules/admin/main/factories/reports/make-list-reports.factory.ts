import { ListReportsUseCase } from '../../../application/use-cases/reports/list-reports.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeListReports(): ListReportsUseCase {
  return new ListReportsUseCase(makeAdminGateway());
}
