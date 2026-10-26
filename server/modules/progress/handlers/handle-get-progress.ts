import type { Services } from '../../../main/services.type';
import { isCourseSlug } from '../../../shared/http/is-course-slug';
import { jsonResponse } from '../../../shared/http/json-response';
import { problemResponse } from '../../../shared/http/problem-response';
import { withSession } from '../../auth/with-session';
import { progressPath } from '../progress-path';

export async function handleGetProgress(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
  return withSession(request, services, async (session) => {
    const response = await services.rest.request(`${progressPath(slug, session.userId)}&select=data&limit=1`, { accessToken: session.accessToken });
    if (response.status === 401) return response;
    if (!response.ok) return problemResponse(502, 'progress-unavailable', 'Não foi possível carregar seu progresso agora.');
    const rows: unknown = await response.json();
    const first = Array.isArray(rows) ? (rows[0] as { data?: unknown } | undefined) : undefined;
    return jsonResponse({ progress: first?.data ?? null });
  });
}
