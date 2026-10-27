import { makeServices } from '../../../../../server/main/make-services';
import { handleAdminSetBlocked } from '../../../../../server/modules/admin/handlers/people/handle-admin-set-blocked';
import { readParam } from '../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestPut = (context: RequestContext) => handleAdminSetBlocked(context.request, readParam(context, 'id'), makeServices(context.env));
