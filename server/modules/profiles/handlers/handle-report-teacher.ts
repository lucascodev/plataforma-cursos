import { profileReportSchema } from '../../../../contracts/profile/profile-report.schema';
import type { Services } from '../../../main/services.type';
import { isProfileHandle } from '../../../shared/http/params/is-profile-handle';
import { MAX_FORM_BODY_BYTES } from '../../../shared/http/request-body/max-form-body-bytes';
import { readValidatedBody } from '../../../shared/http/request-body/read-validated-body';
import type { ProblemMessages } from '../../../shared/http/responses/problem-message.type';
import { problemResponse } from '../../../shared/http/responses/problem-response';
import { rpcJsonResponse } from '../../../shared/supabase/rest/rpc-json-response';
import { withSession } from '../../auth/session/with-session';

const MESSAGES: ProblemMessages = {
  'profile-not-found': [404, 'Perfil não encontrado.'],
  'cannot-report-self': [422, 'Você não pode avisar sobre o próprio perfil.'],
  'invalid-report-reason': [422, 'Escolha um motivo.'],
  'report-details-too-long': [422, 'Use até 1000 letras nos detalhes.'],
};

export function handleReportTeacher(request: Request, handle: string, services: Services): Promise<Response> {
  if (!isProfileHandle(handle)) return Promise.resolve(problemResponse(404, 'profile-not-found', 'Perfil não encontrado.'));
  return withSession(request, services, async (session) => {
    const body = await readValidatedBody(request, profileReportSchema, MAX_FORM_BODY_BYTES);
    if (!body.ok) return body.response;
    return rpcJsonResponse(services, {
      name: 'report_profile',
      args: { p_handle: handle, p_reason: body.data.reason, p_details: body.data.details },
      accessToken: session.accessToken,
      schema: null,
      toBody: () => null,
      messages: MESSAGES,
      unavailableMessage: 'Não foi possível enviar o aviso agora.',
    });
  });
}
