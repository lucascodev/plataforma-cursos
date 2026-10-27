import { EndSessionsUseCase } from '../../../application/use-cases/people/end-sessions.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeEndSessions(): EndSessionsUseCase {
  return new EndSessionsUseCase(makeAdminGateway());
}
