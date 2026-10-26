import { SignOutUseCase } from '../../application/use-cases/sign-out.use-case';
import { makeAuthGateway } from './make-auth-gateway.factory';

export function makeSignOut(): SignOutUseCase {
  return new SignOutUseCase(makeAuthGateway());
}
