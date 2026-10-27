import { makeServices } from '../../../../server/main/make-services';
import { handleAdminCheckSlug } from '../../../../server/modules/admin/handlers/courses/handle-admin-check-slug';
import { readParam } from '../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleAdminCheckSlug(context.request, readParam(context, 'slug'), makeServices(context.env));
