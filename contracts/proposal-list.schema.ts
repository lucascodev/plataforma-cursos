import { z } from 'zod';
import { proposalSchema } from './proposal.schema';

export const proposalListSchema = z.object({
  items: z.array(proposalSchema).max(100),
  total: z.number().int().min(0),
});

export type ProposalListRecord = z.infer<typeof proposalListSchema>;
