import { makeServices } from '../../../server/main/make-services';
import { handleListProgress } from '../../../server/modules/progress/handlers/handle-list-progress';
import type { RequestContext } from '../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleListProgress(context.request, makeServices(context.env));
