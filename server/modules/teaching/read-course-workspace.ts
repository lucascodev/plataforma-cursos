import { courseWorkspaceSchema, type CourseWorkspaceRecord } from '../../../contracts/teaching/course-workspace.schema';
import type { Services } from '../../main/services.type';
import { problemResponse } from '../../shared/http/responses/problem-response';
import { readUpstreamJson } from '../../shared/http/upstream/read-upstream-json';
import { upstreamProblem } from '../../shared/http/upstream/upstream-problem';
import { callRpc } from '../../shared/supabase/rest/call-rpc';
import type { ResolvedSession } from '../auth/session/resolved-session.type';
import { TEACHING_ERROR_MESSAGES } from './teaching-error-messages';

const UNAVAILABLE = 'Não foi possível carregar o curso agora.';

export type WorkspaceResult = { readonly ok: true; readonly workspace: CourseWorkspaceRecord } | { readonly ok: false; readonly response: Response };

export async function readCourseWorkspace(services: Services, session: ResolvedSession, slug: string): Promise<WorkspaceResult> {
  const response = await callRpc(services, 'teacher_get_open_version', { p_slug: slug }, session.accessToken);
  if (!response.ok) return { ok: false, response: await upstreamProblem(response, TEACHING_ERROR_MESSAGES, UNAVAILABLE) };
  const workspace = await readUpstreamJson(response, courseWorkspaceSchema);
  if (!workspace) return { ok: false, response: problemResponse(502, 'unavailable', UNAVAILABLE) };
  return { ok: true, workspace };
}
