import type { Services } from '../../../main/services.type';
import { jsonResponse } from '../../../shared/http/responses/json-response';
import { problemResponse } from '../../../shared/http/responses/problem-response';
import { PUBLIC_CACHE_HEADERS } from '../../../shared/http/responses/public-cache-headers';
import { readCourseAuthor } from '../read-course-author';
import { readCourseRows } from '../read-course-rows';

// Courses taken out of the catalog stay readable by slug for the people already studying them.
// Authors go in a map keyed by slug so clients that only read "courses" keep working.
export async function handleListCourses(services: Services): Promise<Response> {
  const response = await services.rest.request(
    'courses?select=slug,content,owner:profiles(handle,display_name,avatar_url,headline)&published=eq.true&listed=eq.true&order=slug.asc',
  );
  if (!response.ok) return problemResponse(502, 'courses-unavailable', 'Não foi possível carregar os cursos agora.');
  const rows: unknown = await response.json();
  const authors = Array.isArray(rows)
    ? Object.fromEntries(
        rows.flatMap((row) => (row && typeof row === 'object' && typeof (row as { slug?: unknown }).slug === 'string' ? [[(row as { slug: string }).slug, readCourseAuthor(row)]] : [])),
      )
    : {};
  return jsonResponse({ courses: readCourseRows(rows), authors }, 200, PUBLIC_CACHE_HEADERS);
}
