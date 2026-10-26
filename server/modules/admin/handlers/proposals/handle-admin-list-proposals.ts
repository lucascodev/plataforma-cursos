import { proposalListSchema } from '../../../../../contracts/proposal-list.schema';
import { proposalStatusSchema } from '../../../../../contracts/proposal-status.schema';
import type { Services } from '../../../../main/services.type';
import { readPageOffset } from '../../../../shared/http/params/read-page-offset';
import { withSession } from '../../../auth/session/with-session';
import { adminRpc } from '../../admin-rpc';

const PAGE_SIZE = 50;

export function handleAdminListProposals(request: Request, services: Services): Promise<Response> {
  const url = new URL(request.url);
  const status = proposalStatusSchema.safeParse(url.searchParams.get('status'));
  return withSession(request, services, (session) =>
    adminRpc(
      services,
      session,
      'admin_list_proposals',
      { p_status: status.success ? status.data : null, p_limit: PAGE_SIZE, p_offset: readPageOffset(url, PAGE_SIZE) },
      proposalListSchema,
      (page) => page,
    ),
  );
}
