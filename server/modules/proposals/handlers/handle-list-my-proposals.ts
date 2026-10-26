import type { Services } from '../../../main/services.type';
import { jsonResponse } from '../../../shared/http/json-response';
import { problemResponse } from '../../../shared/http/problem-response';
import { readUpstreamJson } from '../../../shared/http/read-upstream-json';
import { withSession } from '../../auth/with-session';
import { PROPOSAL_COLUMNS } from '../proposal-columns';
import { proposalRowsSchema } from '../proposal-rows.schema';

export function handleListMyProposals(request: Request, services: Services): Promise<Response> {
  return withSession(request, services, async (session) => {
    const response = await services.rest.request(
      `course_proposals?author_id=eq.${encodeURIComponent(session.userId)}&select=${PROPOSAL_COLUMNS}&order=created_at.desc&limit=50`,
      { accessToken: session.accessToken },
    );
    if (response.status === 401) return response;
    if (!response.ok) return problemResponse(502, 'unavailable', 'Não foi possível carregar suas propostas agora.');
    const proposals = await readUpstreamJson(response, proposalRowsSchema);
    if (!proposals) return problemResponse(502, 'unavailable', 'Não foi possível carregar suas propostas agora.');
    return jsonResponse({ proposals });
  });
}
