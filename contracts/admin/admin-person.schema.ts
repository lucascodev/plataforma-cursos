import { z } from 'zod';
import { profileCardSchema } from '../profile/profile-card.schema';
import { timestampSchema } from '../date/timestamp.schema';

export const adminPersonSchema = profileCardSchema.extend({
  createdAt: timestampSchema,
  coursesOwned: z.number().int().min(0),
});

export type AdminPersonRecord = z.infer<typeof adminPersonSchema>;
