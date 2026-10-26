import { jsonResponse } from './json-response';

export function problemResponse(status: number, code: string, message: string): Response {
  return jsonResponse({ error: { code, message } }, status);
}
