import { makeServices } from '../../../../server/main/make-services';
import { handleAdminListPeople } from '../../../../server/modules/admin/handlers/people/handle-admin-list-people';
import type { RequestContext } from '../../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleAdminListPeople(context.request, makeServices(context.env));
