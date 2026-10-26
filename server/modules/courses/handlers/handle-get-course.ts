import type { Services } from '../../../main/services.type';
import { isCourseSlug } from '../../../shared/http/params/is-course-slug';
import { jsonResponse } from '../../../shared/http/responses/json-response';
import { problemResponse } from '../../../shared/http/responses/problem-response';
import { PUBLIC_CACHE_HEADERS } from '../../../shared/http/responses/public-cache-headers';
import { readCourseAuthor } from '../read-course-author';
import { readCourseRows } from '../read-course-rows';

export async function handleGetCourse(slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
  const response = await services.rest.request(
    `courses?select=content,owner:profiles(handle,display_name,avatar_url)&published=eq.true&slug=eq.${slug}&limit=1`,
  );
  if (!response.ok) return problemResponse(502, 'courses-unavailable', 'Não foi possível carregar o curso agora.');
  const rows: unknown = await response.json();
  const [course] = readCourseRows(rows);
  if (!course) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
  const author = Array.isArray(rows) ? readCourseAuthor(rows[0]) : null;
  return jsonResponse({ course, author }, 200, PUBLIC_CACHE_HEADERS);
}
