import { z } from 'zod';

export const codeRunResultSchema = z.object({
  results: z.array(z.object({ id: z.string().max(200), passed: z.boolean(), message: z.string().max(4000) })).max(200),
  error: z.string().max(4000).nullable(),
  output: z.string().max(50_000),
});
