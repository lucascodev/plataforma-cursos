import { adminNavBadgesSchema } from '../../../../contracts/admin/admin-nav-badges.schema';
import type { Services } from '../../../main/services.type';
import { withSession } from '../../auth/session/with-session';
import { adminRpc } from '../admin-rpc';

export function handleAdminNavBadges(request: Request, services: Services): Promise<Response> {
  return withSession(request, services, (session) =>
    adminRpc(services, session, 'admin_nav_badges', {}, adminNavBadgesSchema, (badges) => ({ badges })),
  );
}
