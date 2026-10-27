import { z } from 'zod';
import { draftSaveRequestSchema } from '../../../../../contracts/teaching/draft-save-request.schema';
import type { Services } from '../../../../main/services.type';
import { isCourseSlug } from '../../../../shared/http/params/is-course-slug';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { readValidatedBody } from '../../../../shared/http/request-body/read-validated-body';
import { withSession } from '../../../auth/session/with-session';
import { MAX_DRAFT_BODY_BYTES } from '../../max-draft-body-bytes';
import { teachingRpc } from '../../teaching-rpc';

export function handleSaveDraft(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return Promise.resolve(problemResponse(404, 'course-not-found', 'Curso não encontrado.'));
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, draftSaveRequestSchema, MAX_DRAFT_BODY_BYTES);
    if (!body.ok) return body.response;
    if (body.data.content.slug !== slug) return problemResponse(422, 'invalid-content', 'O conteúdo do rascunho é inválido.');
    return teachingRpc(
      services,
      session,
      'teacher_save_draft',
      { p_id: body.data.versionId, p_content: body.data.content, p_revision: body.data.revision },
      z.number().int().min(1),
      (revision) => ({ revision }),
    );
  });
}
