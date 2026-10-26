import { z } from 'zod';
import { adminPersonSchema } from './admin-person.schema';

export const adminPersonListSchema = z.object({
  items: z.array(adminPersonSchema).max(100),
  total: z.number().int().min(0),
});

export type AdminPersonListRecord = z.infer<typeof adminPersonListSchema>;
