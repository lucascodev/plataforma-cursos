import { z } from 'zod';
import type { Services } from '../../../../main/services.type';
import { isCourseSlug } from '../../../../shared/http/params/is-course-slug';
import { jsonResponse } from '../../../../shared/http/responses/json-response';
import { withSession } from '../../../auth/session/with-session';
import { adminRpc } from '../../admin-rpc';

export function handleAdminCheckSlug(request: Request, slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return Promise.resolve(jsonResponse({ available: false }));
  return withSession(request, services, (session) =>
    adminRpc(services, session, 'admin_check_slug', { p_slug: slug }, z.boolean(), (available) => ({ available })),
  );
}
