import { makeServices } from '../../../server/main/make-services';
import { handleLogin } from '../../../server/modules/auth/handlers/handle-login';
import type { RequestContext } from '../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleLogin(context.request, makeServices(context.env));
