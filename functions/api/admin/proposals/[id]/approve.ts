import { makeServices } from '../../../../../server/main/make-services';
import { handleAdminApproveProposal } from '../../../../../server/modules/admin/handlers/proposals/handle-admin-approve-proposal';
import { readParam } from '../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestPost = (context: RequestContext) => handleAdminApproveProposal(context.request, readParam(context, 'id'), makeServices(context.env));
