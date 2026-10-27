import { SaveDraftUseCase } from '../../application/use-cases/save-draft.use-case';
import { makeTeachingGateway } from './make-teaching-gateway.factory';

export function makeSaveDraft(): SaveDraftUseCase {
  return new SaveDraftUseCase(makeTeachingGateway());
}
