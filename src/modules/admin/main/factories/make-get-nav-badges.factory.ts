import { GetNavBadgesUseCase } from '../../application/use-cases/get-nav-badges.use-case';
import { makeAdminGateway } from './make-admin-gateway.factory';

export function makeGetNavBadges(): GetNavBadgesUseCase {
  return new GetNavBadgesUseCase(makeAdminGateway());
}
