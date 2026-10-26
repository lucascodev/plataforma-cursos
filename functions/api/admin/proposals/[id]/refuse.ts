import { makeServices } from '../../../../../server/main/make-services';
import { handleAdminReviewProposal } from '../../../../../server/modules/admin/handlers/handle-admin-review-proposal';
import { readParam } from '../../../../../server/shared/http/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestPost = (context: RequestContext) =>
  handleAdminReviewProposal(context.request, readParam(context, 'id'), 'refused', makeServices(context.env));
