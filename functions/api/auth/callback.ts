import { makeServices } from '../../../server/main/make-services';
import { handleCallback } from '../../../server/modules/auth/handlers/handle-callback';
import type { RequestContext } from '../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleCallback(context.request, makeServices(context.env));
