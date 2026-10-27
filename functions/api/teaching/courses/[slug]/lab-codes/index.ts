import { makeServices } from '../../../../../../server/main/make-services';
import { handleListLabCodes } from '../../../../../../server/modules/teaching/handlers/labs/handle-list-lab-codes';
import { readParam } from '../../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleListLabCodes(context.request, readParam(context, 'slug'), makeServices(context.env));
