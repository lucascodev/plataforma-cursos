import { SetBlockedUseCase } from '../../../application/use-cases/people/set-blocked.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeSetBlocked(): SetBlockedUseCase {
  return new SetBlockedUseCase(makeAdminGateway());
}
