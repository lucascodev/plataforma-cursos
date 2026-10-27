import { WithdrawVersionUseCase } from '../../application/use-cases/withdraw-version.use-case';
import { makeTeachingGateway } from './make-teaching-gateway.factory';

export function makeWithdrawVersion(): WithdrawVersionUseCase {
  return new WithdrawVersionUseCase(makeTeachingGateway());
}
