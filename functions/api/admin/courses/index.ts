import { makeServices } from '../../../../server/main/make-services';
import { handleAdminListCourses } from '../../../../server/modules/admin/handlers/courses/handle-admin-list-courses';
import type { RequestContext } from '../../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleAdminListCourses(context.request, makeServices(context.env));
