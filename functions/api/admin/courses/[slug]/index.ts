import { makeServices } from '../../../../../server/main/make-services';
import { handleAdminDeleteCourse } from '../../../../../server/modules/admin/handlers/handle-admin-delete-course';
import { readParam } from '../../../../../server/shared/http/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestDelete = (context: RequestContext) => handleAdminDeleteCourse(context.request, readParam(context, 'slug'), makeServices(context.env));
