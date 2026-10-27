import { GetVersionImpactUseCase } from '../../../application/use-cases/versions/get-version-impact.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeGetVersionImpact(): GetVersionImpactUseCase {
  return new GetVersionImpactUseCase(makeAdminGateway());
}
