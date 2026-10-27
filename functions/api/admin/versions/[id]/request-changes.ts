import { makeServices } from '../../../../../server/main/make-services';
import { handleAdminRequestVersionChanges } from '../../../../../server/modules/admin/handlers/versions/handle-admin-request-version-changes';
import { readParam } from '../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestPost = (context: RequestContext) => handleAdminRequestVersionChanges(context.request, readParam(context, 'id'), makeServices(context.env));
