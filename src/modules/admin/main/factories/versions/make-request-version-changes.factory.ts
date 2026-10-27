import { RequestVersionChangesUseCase } from '../../../application/use-cases/versions/request-version-changes.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeRequestVersionChanges(): RequestVersionChangesUseCase {
  return new RequestVersionChangesUseCase(makeAdminGateway());
}
