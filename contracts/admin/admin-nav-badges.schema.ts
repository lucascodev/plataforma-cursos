import { z } from 'zod';

export const adminNavBadgesSchema = z.object({
  pendingProposals: z.number().int().min(0),
  versionsInReview: z.number().int().min(0),
  openReports: z.number().int().min(0),
});

export type AdminNavBadgesRecord = z.infer<typeof adminNavBadgesSchema>;
