import { RestoreVersionUseCase } from '../../../application/use-cases/versions/restore-version.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeRestoreVersion(): RestoreVersionUseCase {
  return new RestoreVersionUseCase(makeAdminGateway());
}
