import { makeServices } from '../../../../../../server/main/make-services';
import { handleResolveReviewItem } from '../../../../../../server/modules/teaching/handlers/drafts/handle-resolve-review-item';
import { readParam } from '../../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../../server/shared/http/request-context.type';

export const onRequestPut = (context: RequestContext) => handleResolveReviewItem(context.request, readParam(context, 'slug'), readParam(context, 'itemId'), makeServices(context.env));
