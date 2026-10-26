import { z } from 'zod';

const count = z.number().int().min(0);

export const adminOverviewSchema = z.object({
  people: z.object({ student: count, teacher: count, admin: count }),
  pendingProposals: count,
  courses: z.object({ draft: count, published: count, unlisted: count }),
  activeStudents30d: count,
});

export type AdminOverviewRecord = z.infer<typeof adminOverviewSchema>;
