import { makeServices } from '../../../../../server/main/make-services';
import { handleWithdrawVersion } from '../../../../../server/modules/teaching/handlers/drafts/handle-withdraw-version';
import { readParam } from '../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestPost = (context: RequestContext) => handleWithdrawVersion(context.request, readParam(context, 'slug'), makeServices(context.env));
