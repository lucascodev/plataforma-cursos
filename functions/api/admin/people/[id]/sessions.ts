import { makeServices } from '../../../../../server/main/make-services';
import { handleAdminEndSessions } from '../../../../../server/modules/admin/handlers/people/handle-admin-end-sessions';
import { readParam } from '../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestDelete = (context: RequestContext) => handleAdminEndSessions(context.request, readParam(context, 'id'), makeServices(context.env));
