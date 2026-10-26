import { makeServices } from '../../../../../server/main/make-services';
import { handleAdminSetCourseListing } from '../../../../../server/modules/admin/handlers/handle-admin-set-course-listing';
import { readParam } from '../../../../../server/shared/http/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestPut = (context: RequestContext) => handleAdminSetCourseListing(context.request, readParam(context, 'slug'), makeServices(context.env));
