import { auditPageSchema } from '../../../../contracts/audit-page.schema';
import type { Services } from '../../../main/services.type';
import { withSession } from '../../auth/session/with-session';
import { adminRpc } from '../admin-rpc';

function readBefore(url: URL): number | null {
  const value = Number(url.searchParams.get('before'));
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

export function handleAdminListAudit(request: Request, services: Services): Promise<Response> {
  const before = readBefore(new URL(request.url));
  return withSession(request, services, (session) =>
    adminRpc(services, session, 'admin_list_audit', { p_before: before, p_limit: 50 }, auditPageSchema, (page) => page),
  );
}
