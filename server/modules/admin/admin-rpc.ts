import type { z } from 'zod';
import type { Services } from '../../main/services.type';
import { rpcJsonResponse } from '../../shared/supabase/rest/rpc-json-response';
import type { ResolvedSession } from '../auth/session/resolved-session.type';
import { ADMIN_ERROR_MESSAGES } from './admin-error-messages';

const UNAVAILABLE = 'Não foi possível concluir agora. Tente de novo em instantes.';

// Every admin call goes to a database function that checks the role itself; this only shapes the answer.
export function adminRpc<T>(
  services: Services,
  session: ResolvedSession,
  name: string,
  args: Record<string, unknown>,
  schema: z.ZodType<T> | null,
  toBody: (data: T) => unknown,
): Promise<Response> {
  return rpcJsonResponse(services, {
    name,
    args,
    accessToken: session.accessToken,
    schema,
    toBody,
    messages: ADMIN_ERROR_MESSAGES,
    unavailableMessage: UNAVAILABLE,
  });
}
