import { z } from 'zod';

export const proposalDurationSchema = z.enum(['up-to-3-months', '3-to-6-months', '6-to-12-months', 'over-12-months']);

export type ProposalDuration = z.infer<typeof proposalDurationSchema>;
