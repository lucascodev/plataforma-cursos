import { proposalSchema } from '../../../../contracts/proposal.schema';
import type { Services } from '../../../main/services.type';
import { isUuid } from '../../../shared/http/is-uuid';
import { problemResponse } from '../../../shared/http/problem-response';
import { withSession } from '../../auth/with-session';
import { adminRpc } from '../admin-rpc';

export async function handleAdminGetProposal(request: Request, id: string, services: Services): Promise<Response> {
  if (!isUuid(id)) return problemResponse(404, 'proposal-not-found', 'Proposta não encontrada.');
  return withSession(request, services, (session) =>
    adminRpc(services, session, 'admin_get_proposal', { p_id: id }, proposalSchema, (proposal) => ({ proposal })),
  );
}
