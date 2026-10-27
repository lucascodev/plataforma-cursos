import { makeServices } from '../../../../../server/main/make-services';
import { handleAdminDeletePerson } from '../../../../../server/modules/admin/handlers/people/handle-admin-delete-person';
import { readParam } from '../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestDelete = (context: RequestContext) => handleAdminDeletePerson(context.request, readParam(context, 'id'), makeServices(context.env));
