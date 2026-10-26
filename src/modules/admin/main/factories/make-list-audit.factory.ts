import { ListAuditUseCase } from '../../application/use-cases/list-audit.use-case';
import { makeAdminGateway } from './make-admin-gateway.factory';

export function makeListAudit(): ListAuditUseCase {
  return new ListAuditUseCase(makeAdminGateway());
}
