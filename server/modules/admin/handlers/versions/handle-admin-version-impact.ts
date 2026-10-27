import { versionImpactSchema } from '../../../../../contracts/admin/version-impact.schema';
import { diffCourseVersions } from '../../../../../contracts/version/diff/diff-course-versions';
import type { Services } from '../../../../main/services.type';
import { isUuid } from '../../../../shared/http/params/is-uuid';
import { problemResponse } from '../../../../shared/http/responses/problem-response';
import { withSession } from '../../../auth/session/with-session';
import { adminRpc } from '../../admin-rpc';
import { readAdminVersion } from '../../read-admin-version';

// The removed lessons come from the same diff the review page shows, computed here so the browser never picks the keys.
export function handleAdminVersionImpact(request: Request, id: string, services: Services): Promise<Response> {
  if (!isUuid(id)) return Promise.resolve(problemResponse(404, 'version-not-found', 'Versão não encontrada.'));
  return withSession(request, services, async (session) => {
    const result = await readAdminVersion(services, session, id);
    if (!result.ok) return result.response;
    const { removedItemKeys } = diffCourseVersions(result.detail.publishedContent, result.detail.version.content);
    return adminRpc(services, session, 'admin_version_impact', { p_id: id, p_keys: removedItemKeys }, versionImpactSchema, (impact) => ({ impact }));
  });
}
