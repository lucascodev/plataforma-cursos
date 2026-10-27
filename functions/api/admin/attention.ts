import { makeServices } from '../../../server/main/make-services';
import { handleAdminAttentionQueue } from '../../../server/modules/admin/handlers/handle-admin-attention-queue';
import type { RequestContext } from '../../../server/shared/http/request-context.type';

export const onRequestGet = (context: RequestContext) => handleAdminAttentionQueue(context.request, makeServices(context.env));
