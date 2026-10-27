import { makeServices } from '../../../../../server/main/make-services';
import { handleAdminListVersions } from '../../../../../server/modules/admin/handlers/versions/handle-admin-list-versions';
import { readParam } from '../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleAdminListVersions(context.request, readParam(context, 'slug'), makeServices(context.env));
