import { z } from 'zod';
import { timestampSchema } from '../date/timestamp.schema.ts';
import { profileCardSchema } from '../profile/profile-card.schema.ts';
import { profileReportReasonSchema } from '../profile/profile-report-reason.schema.ts';

export const adminReportSchema = z.object({
  id: z.guid(),
  status: z.enum(['open', 'resolved', 'dismissed']),
  reason: profileReportReasonSchema,
  details: z.string().max(1000),
  createdAt: timestampSchema,
  resolvedAt: timestampSchema.nullable(),
  profile: profileCardSchema.nullable(),
  reporter: profileCardSchema.nullable(),
});

export type AdminReportRecord = z.infer<typeof adminReportSchema>;
