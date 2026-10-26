import { adminPersonListSchema } from '../../../../../contracts/admin-person-list.schema';
import { userRoleSchema } from '../../../../../contracts/user-role.schema';
import type { Services } from '../../../../main/services.type';
import { readPageOffset } from '../../../../shared/http/params/read-page-offset';
import { withSession } from '../../../auth/session/with-session';
import { adminRpc } from '../../admin-rpc';

const PAGE_SIZE = 50;

export function handleAdminListPeople(request: Request, services: Services): Promise<Response> {
  const url = new URL(request.url);
  const role = userRoleSchema.safeParse(url.searchParams.get('role'));
  const query = (url.searchParams.get('q') ?? '').trim().slice(0, 80);
  return withSession(request, services, (session) =>
    adminRpc(
      services,
      session,
      'admin_list_people',
      { p_query: query || null, p_role: role.success ? role.data : null, p_limit: PAGE_SIZE, p_offset: readPageOffset(url, PAGE_SIZE) },
      adminPersonListSchema,
      (page) => page,
    ),
  );
}
