import { problemResponse } from '../../../shared/http/responses/problem-response';
import { withCookies } from '../../../shared/http/cookies/with-cookies';
import { clearCookies } from '../cookies/clear-cookies';
import { SESSION_COOKIES } from '../cookies/session-cookie-names';

export function unauthorizedResponse(): Response {
  return withCookies(
    problemResponse(401, 'unauthenticated', 'Entre com o GitHub para continuar.'),
    clearCookies([SESSION_COOKIES.accessToken, SESSION_COOKIES.refreshToken]),
  );
}
