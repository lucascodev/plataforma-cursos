import { z } from 'zod';
import { reviewItemResolutionSchema } from '../../../../../contracts/teaching/review-item-resolution.schema';
import { reviewItemSchema } from '../../../../../contracts/version/review-item.schema';
import type { Services } from '../../../../main/services.type';
import { isCourseSlug } from '../../../../shared/http/params/is-course-slug';
import { MAX_FORM_BODY_BYTES } from '../../../../shared/http/request-body/max-form-body-bytes';
import { readValidatedBody } from '../../../../shared/http/request-body/read-validated-body';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { withSession } from '../../../auth/session/with-session';
import { teachingRpc } from '../../teaching-rpc';

const REVIEW_ITEM_ID = /^r\d{1,2}$/;

export function handleResolveReviewItem(request: Request, slug: string, itemId: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug) || !REVIEW_ITEM_ID.test(itemId)) {
    return Promise.resolve(problemResponse(404, 'review-item-not-found', 'Ajuste não encontrado.'));
  }
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, reviewItemResolutionSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    return teachingRpc(
      services,
      session,
      'teacher_resolve_review_item',
      { p_id: body.data.versionId, p_item_id: itemId, p_resolved: body.data.resolved },
      z.array(reviewItemSchema).max(20),
      (reviewItems) => ({ reviewItems }),
    );
  });
}
