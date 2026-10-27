import { makeServices } from '../../../../server/main/make-services';
import { handleReportTeacher } from '../../../../server/modules/profiles/handlers/handle-report-teacher';
import { readParam } from '../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../server/shared/http/request-context.type';

export const onRequestPost = (context: RequestContext) => handleReportTeacher(context.request, readParam(context, 'handle'), makeServices(context.env));
