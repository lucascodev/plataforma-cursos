import { z } from 'zod';

const checkId = z.string().regex(/^[rc][a-z0-9]{1,12}$/);

export const projectChecksSchema = z.object({
  requirements: z.record(checkId, z.literal(true)),
  criteria: z.record(checkId, z.literal(true)),
});
