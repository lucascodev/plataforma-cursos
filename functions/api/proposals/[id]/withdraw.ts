import { makeServices } from '../../../../server/main/make-services';
import { handleWithdrawProposal } from '../../../../server/modules/proposals/handlers/handle-withdraw-proposal';
import { readParam } from '../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../server/shared/http/request-context.type';

export const onRequestPost = (context: RequestContext) => handleWithdrawProposal(context.request, readParam(context, 'id'), makeServices(context.env));
