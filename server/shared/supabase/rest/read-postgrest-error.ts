import type { PostgrestError } from './postgrest-error.type';

const readText = (value: unknown) => (typeof value === 'string' && value.length <= 200 ? value : null);

export async function readPostgrestError(response: Response): Promise<PostgrestError> {
  try {
    const body: unknown = await response.json();
    if (!body || typeof body !== 'object') return { code: null, hint: null };
    const record = body as Record<string, unknown>;
    return { code: readText(record.code), hint: readText(record.hint) };
  } catch {
    return { code: null, hint: null };
  }
}
