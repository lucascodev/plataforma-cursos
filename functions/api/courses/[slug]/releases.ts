import { makeServices } from '../../../../server/main/make-services';
import { handleListCourseReleases } from '../../../../server/modules/courses/handlers/handle-list-course-releases';
import { readParam } from '../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleListCourseReleases(readParam(context, 'slug'), makeServices(context.env));
