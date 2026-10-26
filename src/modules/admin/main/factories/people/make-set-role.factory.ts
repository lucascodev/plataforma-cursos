import { SetRoleUseCase } from '../../../application/use-cases/people/set-role.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeSetRole(): SetRoleUseCase {
  return new SetRoleUseCase(makeAdminGateway());
}
