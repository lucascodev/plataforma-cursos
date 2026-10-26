import { adminOverviewSchema } from '../../../../contracts/admin/admin-overview.schema';
import type { Services } from '../../../main/services.type';
import { withSession } from '../../auth/session/with-session';
import { adminRpc } from '../admin-rpc';

export function handleAdminOverview(request: Request, services: Services): Promise<Response> {
  return withSession(request, services, (session) =>
    adminRpc(services, session, 'admin_overview', {}, adminOverviewSchema, (overview) => ({ overview })),
  );
}
