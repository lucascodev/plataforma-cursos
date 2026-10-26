import type { HttpProblem } from '@/shared/application/errors/http-problem.type';

// The API answers errors as { error: { code, message } } with the message already written for people.
export function readHttpProblem(text: string): HttpProblem | null {
  try {
    const body: unknown = JSON.parse(text);
    const error = body && typeof body === 'object' ? (body as { error?: unknown }).error : null;
    if (!error || typeof error !== 'object') return null;
    const { code, message } = error as Record<string, unknown>;
    if (typeof code !== 'string' || typeof message !== 'string' || message.length > 300) return null;
    return { code, message };
  } catch {
    return null;
  }
}
