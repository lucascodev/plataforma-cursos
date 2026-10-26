import { makeServices } from '../../../../../server/main/make-services';
import { handleAdminSetRole } from '../../../../../server/modules/admin/handlers/handle-admin-set-role';
import { readParam } from '../../../../../server/shared/http/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestPut = (context: RequestContext) => handleAdminSetRole(context.request, readParam(context, 'id'), makeServices(context.env));
