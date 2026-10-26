import { proposalSchema } from '@contracts/proposal/proposal.schema';
import { z } from 'zod';

export const proposalResponseSchema = z.object({ proposal: proposalSchema });
