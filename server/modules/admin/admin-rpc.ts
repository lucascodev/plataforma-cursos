import type { z } from 'zod';
import type { Services } from '../../main/services.type';
import { jsonResponse } from '../../shared/http/responses/json-response';
import { problemResponse } from '../../shared/http/responses/problem-response';
import { readUpstreamJson } from '../../shared/http/upstream/read-upstream-json';
import { upstreamProblem } from '../../shared/http/upstream/upstream-problem';
import { callRpc } from '../../shared/supabase/rest/call-rpc';
import type { ResolvedSession } from '../auth/session/resolved-session.type';
import { ADMIN_ERROR_MESSAGES } from './admin-error-messages';

const UNAVAILABLE = 'Não foi possível concluir agora. Tente de novo em instantes.';

// Every admin call goes to a database function that checks the role itself; this only shapes the answer.
export async function adminRpc<T>(
  services: Services,
  session: ResolvedSession,
  name: string,
  args: Record<string, unknown>,
  schema: z.ZodType<T> | null,
  toBody: (data: T) => unknown,
): Promise<Response> {
  const response = await callRpc(services, name, args, session.accessToken);
  if (!response.ok) return upstreamProblem(response, ADMIN_ERROR_MESSAGES, UNAVAILABLE);
  if (!schema) return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  const data = await readUpstreamJson(response, schema);
  if (data === null) return problemResponse(502, 'unavailable', UNAVAILABLE);
  return jsonResponse(toBody(data));
}
