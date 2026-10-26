import { makeServices } from '../../../server/main/make-services';
import { handleGetMyProfile } from '../../../server/modules/profiles/handlers/handle-get-my-profile';
import { handlePutMyProfile } from '../../../server/modules/profiles/handlers/handle-put-my-profile';
import type { RequestContext } from '../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleGetMyProfile(context.request, makeServices(context.env));
export const onRequestPut = (context: RequestContext) => handlePutMyProfile(context.request, makeServices(context.env));
