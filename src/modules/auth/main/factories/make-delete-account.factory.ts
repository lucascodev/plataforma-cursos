import { DeleteAccountUseCase } from '../../application/use-cases/delete-account.use-case';
import { makeAuthGateway } from './make-auth-gateway.factory';

export function makeDeleteAccount(): DeleteAccountUseCase {
  return new DeleteAccountUseCase(makeAuthGateway());
}
