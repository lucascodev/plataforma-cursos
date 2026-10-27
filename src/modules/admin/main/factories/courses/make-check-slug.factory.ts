import { CheckSlugUseCase } from '../../../application/use-cases/courses/check-slug.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeCheckSlug(): CheckSlugUseCase {
  return new CheckSlugUseCase(makeAdminGateway());
}
