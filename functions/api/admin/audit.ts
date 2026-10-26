import { makeServices } from '../../../server/main/make-services';
import { handleAdminListAudit } from '../../../server/modules/admin/handlers/handle-admin-list-audit';
import type { RequestContext } from '../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleAdminListAudit(context.request, makeServices(context.env));
