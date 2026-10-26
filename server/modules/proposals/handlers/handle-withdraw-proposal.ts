import type { Services } from '../../../main/services.type';
import { emptyResponse } from '../../../shared/http/responses/empty-response';
import { isUuid } from '../../../shared/http/params/is-uuid';
import { problemResponse } from '../../../shared/http/responses/problem-response';
import { upstreamProblem } from '../../../shared/http/upstream/upstream-problem';
import { callRpc } from '../../../shared/supabase/rest/call-rpc';
import { withSession } from '../../auth/session/with-session';
import { PROPOSAL_ERROR_MESSAGES } from '../proposal-error-messages';

export async function handleWithdrawProposal(request: Request, id: string, services: Services): Promise<Response> {
  if (!isUuid(id)) return problemResponse(404, 'proposal-not-found', 'Proposta não encontrada.');
  return withSession(request, services, async (session) => {
    const response = await callRpc(services, 'withdraw_proposal', { p_id: id }, session.accessToken);
    if (!response.ok) return upstreamProblem(response, PROPOSAL_ERROR_MESSAGES, 'Não foi possível retirar a proposta agora.');
    return emptyResponse();
  });
}
