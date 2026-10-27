import { makeServices } from '../../../../../server/main/make-services';
import { handleAdminResolveReport } from '../../../../../server/modules/admin/handlers/reports/handle-admin-resolve-report';
import { readParam } from '../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestPost = (context: RequestContext) => handleAdminResolveReport(context.request, readParam(context, 'id'), 'dismissed', makeServices(context.env));
