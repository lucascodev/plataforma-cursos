import { makeServices } from '../../../../server/main/make-services';
import { handleAdminListProposals } from '../../../../server/modules/admin/handlers/handle-admin-list-proposals';
import type { RequestContext } from '../../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleAdminListProposals(context.request, makeServices(context.env));
