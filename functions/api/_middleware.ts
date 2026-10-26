import { handleApiMiddleware } from '../../server/main/handle-api-middleware';
import type { RequestContext } from '../../server/shared/http/request-context.type';

export const onRequest = (context: RequestContext) => handleApiMiddleware(context);
