import { adminVersionDetailSchema, type AdminVersionDetailRecord } from '../../../contracts/admin/admin-version-detail.schema';
import type { Services } from '../../main/services.type';
import { problemResponse } from '../../shared/http/responses/problem-response';
import { readUpstreamJson } from '../../shared/http/upstream/read-upstream-json';
import { upstreamProblem } from '../../shared/http/upstream/upstream-problem';
import { callRpc } from '../../shared/supabase/rest/call-rpc';
import type { ResolvedSession } from '../auth/session/resolved-session.type';
import { ADMIN_ERROR_MESSAGES } from './admin-error-messages';

const UNAVAILABLE = 'Não foi possível carregar a versão agora.';

export type AdminVersionResult = { readonly ok: true; readonly detail: AdminVersionDetailRecord } | { readonly ok: false; readonly response: Response };

export async function readAdminVersion(services: Services, session: ResolvedSession, id: string): Promise<AdminVersionResult> {
  const response = await callRpc(services, 'admin_get_version', { p_id: id }, session.accessToken);
  if (!response.ok) return { ok: false, response: await upstreamProblem(response, ADMIN_ERROR_MESSAGES, UNAVAILABLE) };
  const detail = await readUpstreamJson(response, adminVersionDetailSchema);
  if (!detail) return { ok: false, response: problemResponse(502, 'unavailable', UNAVAILABLE) };
  return { ok: true, detail };
}
