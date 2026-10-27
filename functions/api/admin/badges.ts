import { makeServices } from '../../../server/main/make-services';
import { handleAdminNavBadges } from '../../../server/modules/admin/handlers/handle-admin-nav-badges';
import type { RequestContext } from '../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleAdminNavBadges(context.request, makeServices(context.env));
