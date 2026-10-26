import { GetAdminOverviewUseCase } from '../../application/use-cases/get-admin-overview.use-case';
import { makeAdminGateway } from './make-admin-gateway.factory';

export function makeGetAdminOverview(): GetAdminOverviewUseCase {
  return new GetAdminOverviewUseCase(makeAdminGateway());
}
