import { makeServices } from '../../../../../server/main/make-services';
import { handleOpenDraft } from '../../../../../server/modules/teaching/handlers/drafts/handle-open-draft';
import { handleSaveDraft } from '../../../../../server/modules/teaching/handlers/drafts/handle-save-draft';
import { readParam } from '../../../../../server/shared/http/params/read-param';
import type { RequestContext } from '../../../../../server/shared/http/request-context.type';

export const onRequestPost = (context: RequestContext) => handleOpenDraft(context.request, readParam(context, 'slug'), makeServices(context.env));
export const onRequestPut = (context: RequestContext) => handleSaveDraft(context.request, readParam(context, 'slug'), makeServices(context.env));
