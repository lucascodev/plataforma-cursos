import { ListAdminProposalsUseCase } from '../../../application/use-cases/proposals/list-admin-proposals.use-case';
import { makeAdminGateway } from '../make-admin-gateway.factory';

export function makeListAdminProposals(): ListAdminProposalsUseCase {
  return new ListAdminProposalsUseCase(makeAdminGateway());
}
