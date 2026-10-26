import { makeServices } from '../../../server/main/make-services';
import { handleCreateProposal } from '../../../server/modules/proposals/handlers/handle-create-proposal';
import { handleListMyProposals } from '../../../server/modules/proposals/handlers/handle-list-my-proposals';
import type { RequestContext } from '../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleListMyProposals(context.request, makeServices(context.env));
export const onRequestPost = (context: RequestContext) => handleCreateProposal(context.request, makeServices(context.env));
