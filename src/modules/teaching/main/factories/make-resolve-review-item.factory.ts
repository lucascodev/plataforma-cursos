import { ResolveReviewItemUseCase } from '../../application/use-cases/resolve-review-item.use-case';
import { makeTeachingGateway } from './make-teaching-gateway.factory';

export function makeResolveReviewItem(): ResolveReviewItemUseCase {
  return new ResolveReviewItemUseCase(makeTeachingGateway());
}
