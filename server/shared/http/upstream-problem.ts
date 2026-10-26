import { readPostgrestError } from '../supabase/read-postgrest-error';
import type { ProblemMessages } from './problem-message.type';
import { problemResponse } from './problem-response';

// Turns a Supabase error into a response in Portuguese. The text Supabase sent never reaches the browser.
export async function upstreamProblem(response: Response, messages: ProblemMessages, unavailableMessage: string): Promise<Response> {
  if (response.status === 401) return problemResponse(401, 'unauthenticated', 'Entre com o GitHub para continuar.');
  const { hint } = await readPostgrestError(response);
  if (hint === 'rate-limited') return problemResponse(429, 'rate-limited', 'Muitas alterações em pouco tempo. Espere alguns minutos e tente de novo.');
  const known = hint ? messages[hint] : undefined;
  if (hint && known) return problemResponse(known[0], hint, known[1]);
  if (response.status === 403) return problemResponse(403, 'forbidden', 'Você não tem permissão para isso.');
  if (response.status === 404) return problemResponse(404, 'not-found', 'Não encontrado.');
  return problemResponse(502, 'unavailable', unavailableMessage);
}
