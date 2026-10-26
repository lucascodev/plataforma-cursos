import type { Services } from '../../../main/services.type';
import { createCodeChallenge } from '../../../shared/crypto/create-code-challenge';
import { createRandomToken } from '../../../shared/crypto/create-random-token';
import { redirectResponse } from '../../../shared/http/redirect-response';
import { serializeCookie } from '../../../shared/http/serialize-cookie';
import { sanitizeReturnPath } from '../sanitize-return-path';
import { SESSION_COOKIES } from '../session-cookie-names';
import { SESSION_DURATIONS } from '../session-durations';

export async function handleLogin(request: Request, services: Services): Promise<Response> {
  const url = new URL(request.url);
  const verifier = createRandomToken(48);
  const challenge = await createCodeChallenge(verifier);
  const callbackUrl = `${url.origin}/api/auth/callback`;
  const attempt = { maxAgeSeconds: SESSION_DURATIONS.loginAttemptSeconds, sameSite: 'Lax' } as const;

  return redirectResponse(services.auth.authorizeUrl(callbackUrl, challenge), [
    serializeCookie(SESSION_COOKIES.codeVerifier, verifier, attempt),
    serializeCookie(SESSION_COOKIES.returnPath, sanitizeReturnPath(url.searchParams.get('returnTo')), attempt),
  ]);
}
