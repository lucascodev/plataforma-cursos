import type { Services } from '../../../main/services.type';
import { isCourseSlug } from '../../../shared/http/is-course-slug';
import { problemResponse } from '../../../shared/http/problem-response';
import { withCookies } from '../../../shared/http/with-cookies';
import { resolveSession } from '../../auth/resolve-session';
import { unauthorizedResponse } from '../../auth/unauthorized-response';
import { progressPath } from '../progress-path';

export async function handleDeleteProgress(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
  const session = await resolveSession(request, services);
  if (!session) return unauthorizedResponse();

  const response = await services.rest.request(progressPath(slug, session.userId), {
    method: 'DELETE',
    accessToken: session.accessToken,
    prefer: 'return=minimal',
  });
  if (response.status === 401) return unauthorizedResponse();
  if (!response.ok) return problemResponse(502, 'progress-unavailable', 'Não foi possível apagar agora.');
  return withCookies(new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } }), session.cookies);
}
