import { proposalReviewSchema } from '../../../../contracts/proposal-review.schema';
import type { Services } from '../../../main/services.type';
import { isUuid } from '../../../shared/http/is-uuid';
import { MAX_FORM_BODY_BYTES } from '../../../shared/http/max-form-body-bytes';
import { problemResponse } from '../../../shared/http/problem-response';
import { readValidatedBody } from '../../../shared/http/read-validated-body';
import { withSession } from '../../auth/with-session';
import { adminRpc } from '../admin-rpc';

export type ProposalDecision = 'changes_requested' | 'refused';

export async function handleAdminReviewProposal(
  request: Request,
  id: string,
  decision: ProposalDecision,
  services: Services,
): Promise<Response> {
  if (!isUuid(id)) return problemResponse(404, 'proposal-not-found', 'Proposta não encontrada.');
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, proposalReviewSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    return adminRpc(services, session, 'review_proposal', { p_id: id, p_decision: decision, p_note: body.data.note }, null, () => null);
  });
}
