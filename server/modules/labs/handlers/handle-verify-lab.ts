import { z } from 'zod';
import { labItemKeySchema } from '../../../../contracts/course/exercise/lab-item-key.schema';
import { labVerifyRequestSchema } from '../../../../contracts/course/exercise/lab-verify-request.schema';
import type { Services } from '../../../main/services.type';
import { isCourseSlug } from '../../../shared/http/params/is-course-slug';
import { MAX_FORM_BODY_BYTES } from '../../../shared/http/request-body/max-form-body-bytes';
import { readValidatedBody } from '../../../shared/http/request-body/read-validated-body';
import { problemResponse } from '../../../shared/http/responses/problem-response';
import { rpcJsonResponse } from '../../../shared/supabase/rest/rpc-json-response';
import { withSession } from '../../auth/session/with-session';
import { LAB_ERROR_MESSAGES } from '../lab-error-messages';

export function handleVerifyLab(request: Request, slug: string, itemKey: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug) || !labItemKeySchema.safeParse(itemKey).success) {
    return Promise.resolve(problemResponse(404, 'not-found', 'Laboratório não encontrado.'));
  }
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, labVerifyRequestSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    return rpcJsonResponse(services, {
      name: 'verify_lab_code',
      args: { p_slug: slug, p_item_key: itemKey, p_code: body.data.code },
      accessToken: session.accessToken,
      schema: z.boolean(),
      toBody: (completed) => ({ completed }),
      messages: LAB_ERROR_MESSAGES,
      unavailableMessage: 'Não foi possível conferir o código agora.',
    });
  });
}
