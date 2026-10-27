import { makeServices } from '../../../../../server/main/make-services';
import { handleAdminPublishVersion } from '../../../../../server/modules/admin/handlers/versions/handle-admin-publish-version';
import { readParam } from '../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestPost = (context: RequestContext) => handleAdminPublishVersion(context.request, readParam(context, 'id'), makeServices(context.env));
