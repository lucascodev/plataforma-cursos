import { z } from 'zod';
import { courseSlugSchema } from '../../../../../contracts/course/course-slug.schema';
import { proposalApprovalSchema } from '../../../../../contracts/proposal/proposal-approval.schema';
import type { Services } from '../../../../main/services.type';
import { isUuid } from '../../../../shared/http/params/is-uuid';
import { MAX_FORM_BODY_BYTES } from '../../../../shared/http/request-body/max-form-body-bytes';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { readValidatedBody } from '../../../../shared/http/request-body/read-validated-body';
import { withSession } from '../../../auth/session/with-session';
import { adminRpc } from '../../admin-rpc';

const approvalResultSchema = z.object({ courseSlug: courseSlugSchema });

export async function handleAdminApproveProposal(request: Request, id: string, services: Services): Promise<Response> {
  if (!isUuid(id)) return problemResponse(404, 'proposal-not-found', 'Proposta não encontrada.');
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, proposalApprovalSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    return adminRpc(
      services,
      session,
      'approve_proposal',
      { p_id: id, p_slug: body.data.slug, p_note: body.data.note },
      approvalResultSchema,
      (result) => result,
    );
  });
}
