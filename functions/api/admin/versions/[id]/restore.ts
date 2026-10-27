import { makeServices } from '../../../../../server/main/make-services';
import { handleAdminRestoreVersion } from '../../../../../server/modules/admin/handlers/versions/handle-admin-restore-version';
import { readParam } from '../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestPost = (context: RequestContext) => handleAdminRestoreVersion(context.request, readParam(context, 'id'), makeServices(context.env));
