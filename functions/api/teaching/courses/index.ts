import { makeServices } from '../../../../server/main/make-services';
import { handleListTeacherCourses } from '../../../../server/modules/teaching/handlers/courses/handle-list-teacher-courses';
import type { RequestContext } from '../../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleListTeacherCourses(context.request, makeServices(context.env));
