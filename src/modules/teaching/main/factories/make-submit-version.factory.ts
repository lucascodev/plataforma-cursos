import { SubmitVersionUseCase } from '../../application/use-cases/submit-version.use-case';
import { makeTeachingGateway } from './make-teaching-gateway.factory';

export function makeSubmitVersion(): SubmitVersionUseCase {
  return new SubmitVersionUseCase(makeTeachingGateway());
}
