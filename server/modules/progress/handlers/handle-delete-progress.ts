import type { Services } from '../../../main/services.type';
import { isCourseSlug } from '../../../shared/http/params/is-course-slug';
import { problemResponse } from '../../../shared/http/responses/problem-response';
import { withSession } from '../../auth/session/with-session';
import { progressPath } from '../progress-path';

export async function handleDeleteProgress(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
  return withSession(request, services, async (session) => {
    const response = await services.rest.request(progressPath(slug, session.userId), {
      method: 'DELETE',
      accessToken: session.accessToken,
      prefer: 'return=minimal',
    });
    if (response.status === 401) return response;
    if (!response.ok) return problemResponse(502, 'progress-unavailable', 'Não foi possível apagar agora.');
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  });
}
