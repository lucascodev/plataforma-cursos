import { courseProgressSchema } from '../../../../contracts/course-progress.schema';
import type { Services } from '../../../main/services.type';
import { isCourseSlug } from '../../../shared/http/is-course-slug';
import { problemResponse } from '../../../shared/http/problem-response';
import { readJsonBody } from '../../../shared/http/read-json-body';
import { RequestBodyError } from '../../../shared/http/request-body-error';
import { upstreamProblem } from '../../../shared/http/upstream-problem';
import { withSession } from '../../auth/with-session';
import { MAX_PROGRESS_BODY_BYTES } from '../max-progress-body-bytes';

export async function handlePutProgress(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
  return withSession(request, services, async (session) => {
    let body: unknown;
    try {
      body = await readJsonBody(request, MAX_PROGRESS_BODY_BYTES);
    } catch (error) {
      const tooLarge = error instanceof RequestBodyError && error.reason === 'too-large';
      return problemResponse(tooLarge ? 413 : 400, 'invalid-body', tooLarge ? 'O progresso passou do tamanho máximo.' : 'Dados inválidos.');
    }
    const parsed = courseProgressSchema.safeParse((body as { progress?: unknown } | null)?.progress);
    if (!parsed.success) return problemResponse(422, 'invalid-progress', 'Dados de progresso inválidos.');

    const response = await services.rest.request('course_progress?on_conflict=user_id,course_slug', {
      method: 'POST',
      accessToken: session.accessToken,
      prefer: 'resolution=merge-duplicates,return=minimal',
      body: { user_id: session.userId, course_slug: slug, data: parsed.data },
    });
    if (response.status === 401) return response;
    // 409: the course does not exist (FK). 403: it exists but is not published (RLS). Both look the same from outside.
    if (response.status === 409 || response.status === 403) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
    if (!response.ok) return upstreamProblem(response, {}, 'Não foi possível salvar seu progresso agora.');
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  });
}
