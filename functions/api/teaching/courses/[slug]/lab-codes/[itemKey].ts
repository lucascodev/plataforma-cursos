import { makeServices } from '../../../../../../server/main/make-services';
import { handleSetLabCode } from '../../../../../../server/modules/teaching/handlers/labs/handle-set-lab-code';
import { readParam } from '../../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../../server/shared/http/request-context.type';

export const onRequestPut = (context: RequestContext) => handleSetLabCode(context.request, readParam(context, 'slug'), readParam(context, 'itemKey'), makeServices(context.env));
