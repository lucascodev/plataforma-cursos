import { labItemKeySchema } from '../../../../../contracts/course/exercise/lab-item-key.schema';
import { labCodeUpdateSchema } from '../../../../../contracts/teaching/lab-code-update.schema';
import type { Services } from '../../../../main/services.type';
import { isCourseSlug } from '../../../../shared/http/params/is-course-slug';
import { MAX_FORM_BODY_BYTES } from '../../../../shared/http/request-body/max-form-body-bytes';
import { readValidatedBody } from '../../../../shared/http/request-body/read-validated-body';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { withSession } from '../../../auth/session/with-session';
import { teachingRpc } from '../../teaching-rpc';

export function handleSetLabCode(request: Request, slug: string, itemKey: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug) || !labItemKeySchema.safeParse(itemKey).success) {
    return Promise.resolve(problemResponse(404, 'not-found', 'Laboratório não encontrado.'));
  }
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, labCodeUpdateSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    return teachingRpc(services, session, 'teacher_set_lab_code', { p_slug: slug, p_item_key: itemKey, p_code: body.data.code }, null, () => null);
  });
}
