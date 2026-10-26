import { z } from 'zod';
import { progressSummarySchema } from '../../../../contracts/progress/progress-summary.schema';
import type { Services } from '../../../main/services.type';
import { jsonResponse } from '../../../shared/http/responses/json-response';
import { problemResponse } from '../../../shared/http/responses/problem-response';
import { readUpstreamJson } from '../../../shared/http/upstream/read-upstream-json';
import { withSession } from '../../auth/session/with-session';

// Only completion flags and study days: notes and journal never leave the course page.
const SUMMARY_COLUMNS = 'courseSlug:course_slug,updatedAt:updated_at,completedItems:data->completedItems,studyDays:data->studyDays';

export function handleListProgress(request: Request, services: Services): Promise<Response> {
  return withSession(request, services, async (session) => {
    const response = await services.rest.request(
      `course_progress?user_id=eq.${encodeURIComponent(session.userId)}&select=${SUMMARY_COLUMNS}&order=updated_at.desc&limit=50`,
      { accessToken: session.accessToken },
    );
    if (response.status === 401) return response;
    if (!response.ok) return problemResponse(502, 'progress-unavailable', 'Não foi possível carregar seus estudos agora.');
    const items = await readUpstreamJson(response, z.array(progressSummarySchema).max(50));
    if (!items) return problemResponse(502, 'progress-unavailable', 'Não foi possível carregar seus estudos agora.');
    return jsonResponse({ items });
  });
}
