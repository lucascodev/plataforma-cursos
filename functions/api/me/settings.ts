import { makeServices } from '../../../server/main/make-services';
import { handleGetMySettings } from '../../../server/modules/profiles/handlers/handle-get-my-settings';
import { handlePutMySettings } from '../../../server/modules/profiles/handlers/handle-put-my-settings';
import type { RequestContext } from '../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleGetMySettings(context.request, makeServices(context.env));
export const onRequestPut = (context: RequestContext) => handlePutMySettings(context.request, makeServices(context.env));
