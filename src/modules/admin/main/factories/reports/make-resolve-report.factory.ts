import { ResolveReportUseCase } from '../../../application/use-cases/reports/resolve-report.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeResolveReport(): ResolveReportUseCase {
  return new ResolveReportUseCase(makeAdminGateway());
}
