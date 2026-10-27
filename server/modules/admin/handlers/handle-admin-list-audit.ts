import { auditKindSchema } from '../../../../contracts/admin/audit-kind.schema';
import { auditPageSchema } from '../../../../contracts/admin/audit-page.schema';
import type { Services } from '../../../main/services.type';
import { withSession } from '../../auth/session/with-session';
import { adminRpc } from '../admin-rpc';

function readBefore(url: URL): number | null {
  const value = Number(url.searchParams.get('before'));
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

export function handleAdminListAudit(request: Request, services: Services): Promise<Response> {
  const url = new URL(request.url);
  const kind = auditKindSchema.safeParse(url.searchParams.get('kind'));
  return withSession(request, services, (session) =>
    adminRpc(
      services,
      session,
      'admin_list_audit',
      { p_before: readBefore(url), p_limit: 50, p_kind: kind.success ? kind.data : null },
      auditPageSchema,
      (page) => page,
    ),
  );
}
