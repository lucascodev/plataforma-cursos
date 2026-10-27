import { z } from 'zod';

export const profileReportReasonSchema = z.enum(['false-info', 'offensive', 'suspicious-link', 'other']);

export type ProfileReportReason = z.infer<typeof profileReportReasonSchema>;
