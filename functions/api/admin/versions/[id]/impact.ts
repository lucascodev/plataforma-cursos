import { makeServices } from '../../../../../server/main/make-services';
import { handleAdminVersionImpact } from '../../../../../server/modules/admin/handlers/versions/handle-admin-version-impact';
import { readParam } from '../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleAdminVersionImpact(context.request, readParam(context, 'id'), makeServices(context.env));
