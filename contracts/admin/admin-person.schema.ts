import { z } from 'zod';
import { profileCardSchema } from '../profile/profile-card.schema.ts';
import { timestampSchema } from '../date/timestamp.schema.ts';

export const adminPersonSchema = profileCardSchema.extend({
  createdAt: timestampSchema,
  coursesOwned: z.number().int().min(0),
  // Defaults keep answers from before these fields existed readable.
  coursesStudying: z.number().int().min(0).default(0),
  lastSignInAt: timestampSchema.nullable().default(null),
  blockedAt: timestampSchema.nullable().default(null),
});

export type AdminPersonRecord = z.infer<typeof adminPersonSchema>;
