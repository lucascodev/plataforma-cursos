import { makeServices } from '../../../server/main/make-services';
import { handleGetCourse } from '../../../server/modules/courses/handlers/handle-get-course';
import { readParam } from '../../../server/shared/http/read-param';
import type { RequestContext } from '../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleGetCourse(readParam(context, 'slug'), makeServices(context.env));
