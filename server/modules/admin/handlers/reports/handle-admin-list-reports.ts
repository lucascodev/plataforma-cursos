import { z } from 'zod';
import { adminReportSchema } from '../../../../../contracts/admin/admin-report.schema';
import type { Services } from '../../../../main/services.type';
import { withSession } from '../../../auth/session/with-session';
import { adminRpc } from '../../admin-rpc';

const STATUS = z.enum(['open', 'resolved', 'dismissed']);

export function handleAdminListReports(request: Request, services: Services): Promise<Response> {
  const status = STATUS.safeParse(new URL(request.url).searchParams.get('status'));
  return withSession(request, services, (session) =>
    adminRpc(services, session, 'admin_list_reports', { p_status: status.success ? status.data : 'open' }, z.array(adminReportSchema).max(200), (reports) => ({
      reports,
    })),
  );
}
