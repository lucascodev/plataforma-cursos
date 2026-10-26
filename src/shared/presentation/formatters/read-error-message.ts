import { HttpRequestError } from '@/shared/application/errors/http-request.error';

export function readErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpRequestError) {
    if (error.status === null) return 'Sem conexão. Confira a internet e tente de novo.';
    if (error.problem) return error.problem.message;
  }
  return fallback;
}
