import type { Services } from '../../../main/services.type';
import { parseCookies } from '../../../shared/http/cookies/parse-cookies';
import { redirectResponse } from '../../../shared/http/responses/redirect-response';
import { buildSessionCookies } from '../cookies/build-session-cookies';
import { clearCookies } from '../cookies/clear-cookies';
import { sanitizeReturnPath } from '../sanitize-return-path';
import { SESSION_COOKIES } from '../cookies/session-cookie-names';

const LOGIN_FAILED_PATH = '/entrar?erro=login';

export async function handleCallback(request: Request, services: Services): Promise<Response> {
  const url = new URL(request.url);
  const cookies = parseCookies(request.headers.get('Cookie'));
  const verifier = cookies[SESSION_COOKIES.codeVerifier];
  const returnPath = sanitizeReturnPath(cookies[SESSION_COOKIES.returnPath]);
  const attemptCookies = clearCookies([SESSION_COOKIES.codeVerifier, SESSION_COOKIES.returnPath]);
  const code = url.searchParams.get('code');

  if (!code || !verifier || url.searchParams.has('error')) return redirectResponse(LOGIN_FAILED_PATH, attemptCookies);

  try {
    const session = await services.auth.exchangeCode(code, verifier);
    return redirectResponse(returnPath, [...attemptCookies, ...buildSessionCookies(session)]);
  } catch {
    return redirectResponse(LOGIN_FAILED_PATH, attemptCookies);
  }
}
