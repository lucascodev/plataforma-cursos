import { teacherProfileSchema } from '../../../../contracts/teacher-profile.schema';
import type { Services } from '../../../main/services.type';
import { isProfileHandle } from '../../../shared/http/params/is-profile-handle';
import { jsonResponse } from '../../../shared/http/responses/json-response';
import { problemResponse } from '../../../shared/http/responses/problem-response';
import { PUBLIC_CACHE_HEADERS } from '../../../shared/http/responses/public-cache-headers';
import { callRpc } from '../../../shared/supabase/rest/call-rpc';

const notFound = () => problemResponse(404, 'teacher-not-found', 'Perfil não encontrado.');

export async function handleGetTeacherProfile(handle: string, services: Services): Promise<Response> {
  if (!isProfileHandle(handle)) return notFound();
  const response = await callRpc(services, 'public_teacher_profile', { p_handle: handle });
  if (!response.ok) return problemResponse(502, 'unavailable', 'Não foi possível carregar o perfil agora.');
  const body: unknown = await response.json().catch(() => undefined);
  if (body === null) return notFound();
  const parsed = teacherProfileSchema.safeParse(body);
  if (!parsed.success) return problemResponse(502, 'unavailable', 'Não foi possível carregar o perfil agora.');
  return jsonResponse({ teacher: parsed.data }, 200, PUBLIC_CACHE_HEADERS);
}
