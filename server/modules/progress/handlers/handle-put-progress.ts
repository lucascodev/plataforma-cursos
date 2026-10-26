import { progressSaveRequestSchema } from '../../../../contracts/progress/progress-save-request.schema';
import { progressRevisionSchema } from '../../../../contracts/progress/progress-revision.schema';
import type { Services } from '../../../main/services.type';
import { isCourseSlug } from '../../../shared/http/params/is-course-slug';
import { readValidatedBody } from '../../../shared/http/request-body/read-validated-body';
import { jsonResponse } from '../../../shared/http/responses/json-response';
import { problemResponse } from '../../../shared/http/responses/problem-response';
import { readUpstreamJson } from '../../../shared/http/upstream/read-upstream-json';
import { upstreamProblem } from '../../../shared/http/upstream/upstream-problem';
import { callRpc } from '../../../shared/supabase/rest/call-rpc';
import { withSession } from '../../auth/session/with-session';
import { MAX_PROGRESS_BODY_BYTES } from '../max-progress-body-bytes';
import { PROGRESS_ERROR_MESSAGES } from '../progress-error-messages';

const UNAVAILABLE = 'Não foi possível salvar seu progresso agora.';

export async function handlePutProgress(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, progressSaveRequestSchema, MAX_PROGRESS_BODY_BYTES);
    if (!body.ok) return body.response;

    const response = await callRpc(
      services,
      'save_course_progress',
      { p_slug: slug, p_data: body.data.progress, p_base_revision: body.data.baseRevision ?? null },
      session.accessToken,
    );
    if (response.status === 401) return response;
    // RLS refuses courses that are not published; from outside that looks the same as a course that does not exist.
    if (response.status === 403) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
    if (!response.ok) return upstreamProblem(response, PROGRESS_ERROR_MESSAGES, UNAVAILABLE);
    const revision = await readUpstreamJson(response, progressRevisionSchema);
    if (revision === null) return problemResponse(502, 'progress-unavailable', UNAVAILABLE);
    return jsonResponse({ revision });
  });
}
