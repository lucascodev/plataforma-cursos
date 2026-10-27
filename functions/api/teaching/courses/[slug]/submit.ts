import { makeServices } from '../../../../../server/main/make-services';
import { handleSubmitVersion } from '../../../../../server/modules/teaching/handlers/drafts/handle-submit-version';
import { readParam } from '../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestPost = (context: RequestContext) => handleSubmitVersion(context.request, readParam(context, 'slug'), makeServices(context.env));
