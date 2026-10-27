import { GetAdminVersionUseCase } from '../../../application/use-cases/versions/get-admin-version.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeGetAdminVersion(): GetAdminVersionUseCase {
  return new GetAdminVersionUseCase(makeAdminGateway());
}
