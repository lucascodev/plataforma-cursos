import { z } from 'zod';

export const reviewItemSchema = z.object({
  id: z.string().regex(/^r\d{1,2}$/),
  text: z.string().max(500),
  resolved: z.boolean(),
});

export type ReviewItemRecord = z.infer<typeof reviewItemSchema>;
