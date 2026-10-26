import type { z } from 'zod';

// Supabase answers are validated like any outside input; unknown fields are dropped before reaching the browser.
export async function readUpstreamJson<T>(response: Response, schema: z.ZodType<T>): Promise<T | null> {
  try {
    const parsed = schema.safeParse(await response.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
