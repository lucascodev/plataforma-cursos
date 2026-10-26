import { makeServices } from '../../../../../server/main/make-services';
import { handleAdminGetProposal } from '../../../../../server/modules/admin/handlers/proposals/handle-admin-get-proposal';
import { readParam } from '../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleAdminGetProposal(context.request, readParam(context, 'id'), makeServices(context.env));
