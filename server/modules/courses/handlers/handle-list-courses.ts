import type { Services } from '../../../main/services.type';
import { jsonResponse } from '../../../shared/http/json-response';
import { problemResponse } from '../../../shared/http/problem-response';
import { PUBLIC_CACHE_HEADERS } from '../../../shared/http/public-cache-headers';
import { readCourseRows } from '../read-course-rows';

// Courses taken out of the catalog stay readable by slug for the people already studying them.
export async function handleListCourses(services: Services): Promise<Response> {
  const response = await services.rest.request('courses?select=content&published=eq.true&listed=eq.true&order=slug.asc');
  if (!response.ok) return problemResponse(502, 'courses-unavailable', 'Não foi possível carregar os cursos agora.');
  return jsonResponse({ courses: readCourseRows(await response.json()) }, 200, PUBLIC_CACHE_HEADERS);
}
