import type { Services } from '../../../main/services.type';
import { isUuid } from '../../../shared/http/is-uuid';
import { jsonResponse } from '../../../shared/http/json-response';
import { problemResponse } from '../../../shared/http/problem-response';
import { readUpstreamJson } from '../../../shared/http/read-upstream-json';
import { withSession } from '../../auth/with-session';
import { PROPOSAL_COLUMNS } from '../proposal-columns';
import { proposalRowsSchema } from '../proposal-rows.schema';

const notFound = () => problemResponse(404, 'proposal-not-found', 'Proposta não encontrada.');

// RLS lets the author (and admins) read a proposal; for anyone else it simply does not exist.
export async function handleGetProposal(request: Request, id: string, services: Services): Promise<Response> {
  if (!isUuid(id)) return notFound();
  return withSession(request, services, async (session) => {
    const response = await services.rest.request(`course_proposals?id=eq.${id}&select=${PROPOSAL_COLUMNS}&limit=1`, {
      accessToken: session.accessToken,
    });
    if (response.status === 401) return response;
    if (!response.ok) return problemResponse(502, 'unavailable', 'Não foi possível carregar a proposta agora.');
    const proposal = (await readUpstreamJson(response, proposalRowsSchema))?.[0];
    return proposal ? jsonResponse({ proposal }) : notFound();
  });
}
