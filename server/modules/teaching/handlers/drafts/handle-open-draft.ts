import { courseVersionWithContentSchema } from '../../../../../contracts/version/course-version-with-content.schema';
import type { Services } from '../../../../main/services.type';
import { isCourseSlug } from '../../../../shared/http/params/is-course-slug';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { withSession } from '../../../auth/session/with-session';
import { teachingRpc } from '../../teaching-rpc';

export function handleOpenDraft(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return Promise.resolve(problemResponse(404, 'course-not-found', 'Curso não encontrado.'));
  return withSession(request, services, (session) =>
    teachingRpc(services, session, 'teacher_open_draft', { p_slug: slug }, courseVersionWithContentSchema, (version) => ({ version })),
  );
}
