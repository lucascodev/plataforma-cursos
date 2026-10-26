import { z } from 'zod';

export const proposalStatusSchema = z.enum(['pending', 'changes_requested', 'approved', 'refused', 'withdrawn']);

export type ProposalStatus = z.infer<typeof proposalStatusSchema>;
