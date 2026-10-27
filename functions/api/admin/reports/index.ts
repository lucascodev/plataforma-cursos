import { makeServices } from '../../../../server/main/make-services';
import { handleAdminListReports } from '../../../../server/modules/admin/handlers/reports/handle-admin-list-reports';
import type { RequestContext } from '../../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleAdminListReports(context.request, makeServices(context.env));
