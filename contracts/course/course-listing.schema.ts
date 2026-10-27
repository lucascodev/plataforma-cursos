import { z } from 'zod';
import { unlistReasonSchema } from '../admin/unlist-reason.schema.ts';

export const courseListingSchema = z.object({
  listed: z.boolean(),
  reason: unlistReasonSchema.nullable().optional(),
  note: z.string().trim().max(500, 'Use até 500 letras.').optional(),
});

export type CourseListingRecord = z.infer<typeof courseListingSchema>;
