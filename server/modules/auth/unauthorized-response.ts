import { problemResponse } from '../../shared/http/problem-response';
import { withCookies } from '../../shared/http/with-cookies';
import { clearCookies } from './clear-cookies';
import { SESSION_COOKIES } from './session-cookie-names';

export function unauthorizedResponse(): Response {
  return withCookies(
    problemResponse(401, 'unauthenticated', 'Entre com o GitHub para continuar.'),
    clearCookies([SESSION_COOKIES.accessToken, SESSION_COOKIES.refreshToken]),
  );
}
