import type { RequestContext } from '../shared/http/request-context.type';
import { isSameOriginRequest } from '../shared/http/is-same-origin-request';
import { problemResponse } from '../shared/http/problem-response';
import { API_SECURITY_HEADERS } from './api-security-headers';
import { handleApiError } from './handle-api-errors';
import { isStaticFallback } from './is-static-fallback';

export async function handleApiMiddleware(context: RequestContext): Promise<Response> {
  let response: Response;
  if (!isSameOriginRequest(context.request)) {
    response = problemResponse(403, 'cross-origin', 'Pedido recusado.');
  } else {
    try {
      response = await context.next();
      if (isStaticFallback(response)) response = problemResponse(404, 'not-found', 'Endereço da API não encontrado.');
    } catch (error) {
      response = handleApiError(error);
    }
  }
  const result = new Response(response.body, response);
  for (const [name, value] of Object.entries(API_SECURITY_HEADERS)) result.headers.set(name, value);
  if (!result.headers.has('Cache-Control')) result.headers.set('Cache-Control', 'no-store');
  return result;
}
