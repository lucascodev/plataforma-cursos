import { z } from 'zod';
import { attentionItemSchema } from '../../../../contracts/admin/attention-item.schema';
import type { Services } from '../../../main/services.type';
import { withSession } from '../../auth/session/with-session';
import { adminRpc } from '../admin-rpc';

export function handleAdminAttentionQueue(request: Request, services: Services): Promise<Response> {
  return withSession(request, services, (session) =>
    adminRpc(services, session, 'admin_attention_queue', {}, z.array(attentionItemSchema).max(30), (items) => ({ items })),
  );
}
