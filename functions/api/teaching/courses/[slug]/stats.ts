import { makeServices } from '../../../../../server/main/make-services';
import { handleGetCourseStats } from '../../../../../server/modules/teaching/handlers/courses/handle-get-course-stats';
import { readParam } from '../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleGetCourseStats(context.request, readParam(context, 'slug'), makeServices(context.env));
