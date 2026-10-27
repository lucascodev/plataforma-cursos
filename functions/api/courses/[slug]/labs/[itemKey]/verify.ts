import { makeServices } from '../../../../../../server/main/make-services';
import { handleVerifyLab } from '../../../../../../server/modules/labs/handlers/handle-verify-lab';
import { readParam } from '../../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../../server/shared/http/request-context.type';

export const onRequestPost = (context: RequestContext) => handleVerifyLab(context.request, readParam(context, 'slug'), readParam(context, 'itemKey'), makeServices(context.env));
