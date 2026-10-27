import { z } from 'zod';

export const proposalLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);

export type ProposalLevel = z.infer<typeof proposalLevelSchema>;
