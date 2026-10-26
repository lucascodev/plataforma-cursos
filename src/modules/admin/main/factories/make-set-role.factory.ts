import { SetRoleUseCase } from '../../application/use-cases/set-role.use-case';
import { makeAdminGateway } from './make-admin-gateway.factory';

export function makeSetRole(): SetRoleUseCase {
  return new SetRoleUseCase(makeAdminGateway());
}
