import { z } from 'zod';

export const proposalReviewSchema = z.object({
  note: z.string().trim().min(1, 'Explique o motivo para quem propôs.').max(2000),
});

export type ProposalReviewRecord = z.infer<typeof proposalReviewSchema>;
