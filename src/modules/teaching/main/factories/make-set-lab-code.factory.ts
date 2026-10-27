import { SetLabCodeUseCase } from '../../application/use-cases/set-lab-code.use-case';
import { makeTeachingGateway } from './make-teaching-gateway.factory';

export function makeSetLabCode(): SetLabCodeUseCase {
  return new SetLabCodeUseCase(makeTeachingGateway());
}
