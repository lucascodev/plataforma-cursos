import { ServerMisconfiguredError } from '../../env/server-misconfigured.error';
import { problemResponse } from './problem-response';

export function handleApiError(error: unknown): Response {
  if (error instanceof ServerMisconfiguredError) {
    console.error(error.message);
    return problemResponse(503, 'unavailable', 'A plataforma está em manutenção. Tente de novo em instantes.');
  }
  console.error(error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown error');
  return problemResponse(500, 'internal', 'Algo deu errado. Tente de novo em instantes.');
}
