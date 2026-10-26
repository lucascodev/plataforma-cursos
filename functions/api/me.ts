import { makeServices } from '../../server/main/make-services';
import { handleMe } from '../../server/modules/auth/handlers/handle-me';
import type { RequestContext } from '../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleMe(context.request, makeServices(context.env));
