import { OpenDraftUseCase } from '../../application/use-cases/open-draft.use-case';
import { makeTeachingGateway } from './make-teaching-gateway.factory';

export function makeOpenDraft(): OpenDraftUseCase {
  return new OpenDraftUseCase(makeTeachingGateway());
}
