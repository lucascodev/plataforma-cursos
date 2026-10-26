import { makeServices } from '../../../server/main/make-services';
import { handleListCourses } from '../../../server/modules/courses/handlers/handle-list-courses';
import type { RequestContext } from '../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleListCourses(makeServices(context.env));
