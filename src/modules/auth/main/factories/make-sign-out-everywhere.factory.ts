import { SignOutEverywhereUseCase } from '../../application/use-cases/sign-out-everywhere.use-case';
import { makeAuthGateway } from './make-auth-gateway.factory';

export function makeSignOutEverywhere(): SignOutEverywhereUseCase {
  return new SignOutEverywhereUseCase(makeAuthGateway());
}
