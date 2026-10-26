import { proposalSchema } from '@contracts/proposal.schema';
import { z } from 'zod';

export const proposalListResponseSchema = z.object({ proposals: z.array(proposalSchema).max(50) });
