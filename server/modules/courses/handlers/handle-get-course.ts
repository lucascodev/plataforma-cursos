import type { Services } from '../../../main/services.type';
import { isCourseSlug } from '../../../shared/http/is-course-slug';
import { jsonResponse } from '../../../shared/http/json-response';
import { problemResponse } from '../../../shared/http/problem-response';
import { PUBLIC_CACHE_HEADERS } from '../public-cache-headers';
import { readCourseRows } from '../read-course-rows';

export async function handleGetCourse(slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
  const response = await services.rest.request(`courses?select=content&published=eq.true&slug=eq.${slug}&limit=1`);
  if (!response.ok) return problemResponse(502, 'courses-unavailable', 'Não foi possível carregar o curso agora.');
  const [course] = readCourseRows(await response.json());
  if (!course) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
  return jsonResponse({ course }, 200, PUBLIC_CACHE_HEADERS);
}
