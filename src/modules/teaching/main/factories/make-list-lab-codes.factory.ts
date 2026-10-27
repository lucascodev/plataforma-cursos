import { ListLabCodesUseCase } from '../../application/use-cases/list-lab-codes.use-case';
import { makeTeachingGateway } from './make-teaching-gateway.factory';

export function makeListLabCodes(): ListLabCodesUseCase {
  return new ListLabCodesUseCase(makeTeachingGateway());
}
