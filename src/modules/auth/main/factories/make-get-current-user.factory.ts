import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case';
import { makeAuthGateway } from './make-auth-gateway.factory';

export function makeGetCurrentUser(): GetCurrentUserUseCase {
  return new GetCurrentUserUseCase(makeAuthGateway());
}
