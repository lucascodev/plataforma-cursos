import { makeServices } from '../../../../server/main/make-services';
import { handleGetProposal } from '../../../../server/modules/proposals/handlers/handle-get-proposal';
import { handleUpdateProposal } from '../../../../server/modules/proposals/handlers/handle-update-proposal';
import { readParam } from '../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleGetProposal(context.request, readParam(context, 'id'), makeServices(context.env));
export const onRequestPut = (context: RequestContext) => handleUpdateProposal(context.request, readParam(context, 'id'), makeServices(context.env));
