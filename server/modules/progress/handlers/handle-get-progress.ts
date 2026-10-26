import type { Services } from '../../../main/services.type';
import { isCourseSlug } from '../../../shared/http/is-course-slug';
import { jsonResponse } from '../../../shared/http/json-response';
import { problemResponse } from '../../../shared/http/problem-response';
import { withCookies } from '../../../shared/http/with-cookies';
import { resolveSession } from '../../auth/resolve-session';
import { unauthorizedResponse } from '../../auth/unauthorized-response';
import { progressPath } from '../progress-path';

export async function handleGetProgress(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
  const session = await resolveSession(request, services);
  if (!session) return unauthorizedResponse();

  const response = await services.rest.request(`${progressPath(slug, session.userId)}&select=data&limit=1`, { accessToken: session.accessToken });
  if (response.status === 401) return unauthorizedResponse();
  if (!response.ok) return problemResponse(502, 'progress-unavailable', 'Não foi possível carregar seu progresso agora.');
  const rows: unknown = await response.json();
  const first = Array.isArray(rows) ? (rows[0] as { data?: unknown } | undefined) : undefined;
  return withCookies(jsonResponse({ progress: first?.data ?? null }), session.cookies);
}
