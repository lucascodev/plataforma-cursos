import { z } from 'zod';
import { courseReleaseSchema } from '../../../../contracts/course/course-release.schema';
import type { Services } from '../../../main/services.type';
import { isCourseSlug } from '../../../shared/http/params/is-course-slug';
import { jsonResponse } from '../../../shared/http/responses/json-response';
import { problemResponse } from '../../../shared/http/responses/problem-response';
import { PUBLIC_CACHE_HEADERS } from '../../../shared/http/responses/public-cache-headers';
import { readUpstreamJson } from '../../../shared/http/upstream/read-upstream-json';
import { callRpc } from '../../../shared/supabase/rest/call-rpc';

const UNAVAILABLE = 'Não foi possível carregar o histórico de versões agora.';

export async function handleListCourseReleases(slug: string, services: Services): Promise<Response> {
  if (!isCourseSlug(slug)) return problemResponse(404, 'course-not-found', 'Curso não encontrado.');
  const response = await callRpc(services, 'public_course_releases', { p_slug: slug });
  if (!response.ok) return problemResponse(502, 'unavailable', UNAVAILABLE);
  const releases = await readUpstreamJson(response, z.array(courseReleaseSchema).max(500));
  if (!releases) return problemResponse(502, 'unavailable', UNAVAILABLE);
  return jsonResponse({ releases }, 200, PUBLIC_CACHE_HEADERS);
}
