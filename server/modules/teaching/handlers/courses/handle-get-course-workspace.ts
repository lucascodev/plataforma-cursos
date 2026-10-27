import type { Services } from '../../../../main/services.type';
import { isCourseSlug } from '../../../../shared/http/params/is-course-slug';
import { jsonResponse } from '../../../../shared/http/responses/json-response';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { withSession } from '../../../auth/session/with-session';
import { readCourseWorkspace } from '../../read-course-workspace';

export function handleGetCourseWorkspace(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return Promise.resolve(problemResponse(404, 'course-not-found', 'Curso não encontrado.'));
  return withSession(request, services, async (session) => {
    const result = await readCourseWorkspace(services, session, slug);
    return result.ok ? jsonResponse({ workspace: result.workspace }) : result.response;
  });
}
