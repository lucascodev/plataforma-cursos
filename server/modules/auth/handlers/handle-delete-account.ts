import type { Services } from '../../../main/services.type';
import { withCookies } from '../../../shared/http/cookies/with-cookies';
import type { ProblemMessages } from '../../../shared/http/responses/problem-message.type';
import { upstreamProblem } from '../../../shared/http/upstream/upstream-problem';
import { callRpc } from '../../../shared/supabase/rest/call-rpc';
import { clearCookies } from '../cookies/clear-cookies';
import { SESSION_COOKIES } from '../cookies/session-cookie-names';
import { resolveSession } from '../session/resolve-session';
import { unauthorizedResponse } from '../session/unauthorized-response';

const MESSAGES: ProblemMessages = {
  'owns-courses': [409, 'Você tem um curso na plataforma. Peça à equipe para transferir o curso antes de excluir a conta.'],
  'last-admin': [409, 'Você é a única pessoa admin. Passe o papel para outra pessoa antes de excluir a conta.'],
};

// Not wrapped in withSession: after the account is gone the cookies are cleared, never rotated.
export async function handleDeleteAccount(request: Request, services: Services): Promise<Response> {
  const session = await resolveSession(request, services);
  if (!session) return unauthorizedResponse();
  const response = await callRpc(services, 'delete_my_account', {}, session.accessToken);
  if (!response.ok) {
    if (response.status === 401) return unauthorizedResponse();
    return withCookies(await upstreamProblem(response, MESSAGES, 'Não foi possível excluir a conta agora.'), session.cookies);
  }
  const headers = new Headers({ 'Cache-Control': 'no-store' });
  for (const cookie of clearCookies([SESSION_COOKIES.accessToken, SESSION_COOKIES.refreshToken])) headers.append('Set-Cookie', cookie);
  return new Response(null, { status: 204, headers });
}
