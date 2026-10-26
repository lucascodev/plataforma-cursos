import { makeServices } from '../../../server/main/make-services';
import { handleAdminOverview } from '../../../server/modules/admin/handlers/handle-admin-overview';
import type { RequestContext } from '../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleAdminOverview(context.request, makeServices(context.env));
