import { makeServices } from '../../../server/main/make-services';
import { handleDeleteProgress } from '../../../server/modules/progress/handlers/handle-delete-progress';
import { handleGetProgress } from '../../../server/modules/progress/handlers/handle-get-progress';
import { handlePutProgress } from '../../../server/modules/progress/handlers/handle-put-progress';
import { readParam } from '../../../server/shared/http/read-param';
import type { RequestContext } from '../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleGetProgress(context.request, readParam(context, 'slug'), makeServices(context.env));
export const onRequestPut = (context: RequestContext) => handlePutProgress(context.request, readParam(context, 'slug'), makeServices(context.env));
export const onRequestDelete = (context: RequestContext) => handleDeleteProgress(context.request, readParam(context, 'slug'), makeServices(context.env));
