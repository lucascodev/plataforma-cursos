import { z } from 'zod';
import { profileReportReasonSchema } from './profile-report-reason.schema.ts';

export const profileReportSchema = z.object({
  reason: profileReportReasonSchema,
  details: z.string().trim().max(1000, 'Use até 1000 letras.'),
});

export type ProfileReportRecord = z.infer<typeof profileReportSchema>;
