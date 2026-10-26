import { proposalInputSchema } from '../../../../contracts/proposal-input.schema';
import type { Services } from '../../../main/services.type';
import { isUuid } from '../../../shared/http/is-uuid';
import { jsonResponse } from '../../../shared/http/json-response';
import { MAX_FORM_BODY_BYTES } from '../../../shared/http/max-form-body-bytes';
import { problemResponse } from '../../../shared/http/problem-response';
import { readUpstreamJson } from '../../../shared/http/read-upstream-json';
import { readValidatedBody } from '../../../shared/http/read-validated-body';
import { upstreamProblem } from '../../../shared/http/upstream-problem';
import { withSession } from '../../auth/with-session';
import { PROPOSAL_COLUMNS } from '../proposal-columns';
import { PROPOSAL_ERROR_MESSAGES } from '../proposal-error-messages';
import { proposalRowsSchema } from '../proposal-rows.schema';
import { toProposalRow } from '../to-proposal-row';

// RLS only matches open proposals of the author, so zero rows back means the proposal is closed or not theirs.
export async function handleUpdateProposal(request: Request, id: string, services: Services): Promise<Response> {
  if (!isUuid(id)) return problemResponse(404, 'proposal-not-found', 'Proposta não encontrada.');
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, proposalInputSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    const response = await services.rest.request(`course_proposals?id=eq.${id}&select=${PROPOSAL_COLUMNS}`, {
      method: 'PATCH',
      accessToken: session.accessToken,
      prefer: 'return=representation',
      body: toProposalRow(body.data),
    });
    if (!response.ok) return upstreamProblem(response, PROPOSAL_ERROR_MESSAGES, 'Não foi possível salvar a proposta agora.');
    const proposal = (await readUpstreamJson(response, proposalRowsSchema))?.[0];
    if (!proposal) return problemResponse(409, 'proposal-locked', 'Esta proposta não pode mais ser editada.');
    return jsonResponse({ proposal });
  });
}
