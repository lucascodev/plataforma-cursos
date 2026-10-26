import { makeServices } from '../../../server/main/make-services';
import { handleLogout } from '../../../server/modules/auth/handlers/handle-logout';
import type { RequestContext } from '../../../server/shared/http/request-context.type';

export const onRequestPost = (context: RequestContext) => handleLogout(context.request, makeServices(context.env));
