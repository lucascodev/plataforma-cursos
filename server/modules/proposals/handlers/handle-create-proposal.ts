import { proposalInputSchema } from '../../../../contracts/proposal-input.schema';
import type { Services } from '../../../main/services.type';
import { jsonResponse } from '../../../shared/http/responses/json-response';
import { MAX_FORM_BODY_BYTES } from '../../../shared/http/request-body/max-form-body-bytes';
import { problemResponse } from '../../../shared/http/responses/problem-response';
import { readUpstreamJson } from '../../../shared/http/upstream/read-upstream-json';
import { readValidatedBody } from '../../../shared/http/request-body/read-validated-body';
import { upstreamProblem } from '../../../shared/http/upstream/upstream-problem';
import { withSession } from '../../auth/session/with-session';
import { PROPOSAL_COLUMNS } from '../proposal-columns';
import { PROPOSAL_ERROR_MESSAGES } from '../proposal-error-messages';
import { proposalRowsSchema } from '../proposal-rows.schema';
import { toProposalRow } from '../to-proposal-row';

export function handleCreateProposal(request: Request, services: Services): Promise<Response> {
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, proposalInputSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    const response = await services.rest.request(`course_proposals?select=${PROPOSAL_COLUMNS}`, {
      method: 'POST',
      accessToken: session.accessToken,
      prefer: 'return=representation',
      body: toProposalRow(body.data),
    });
    if (!response.ok) return upstreamProblem(response, PROPOSAL_ERROR_MESSAGES, 'Não foi possível enviar a proposta agora.');
    const proposal = (await readUpstreamJson(response, proposalRowsSchema))?.[0];
    if (!proposal) return problemResponse(502, 'unavailable', 'Não foi possível enviar a proposta agora.');
    return jsonResponse({ proposal }, 201);
  });
}
