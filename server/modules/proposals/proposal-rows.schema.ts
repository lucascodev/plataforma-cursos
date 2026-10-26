import { z } from 'zod';
import { proposalSchema } from '../../../contracts/proposal.schema';

export const proposalRowsSchema = z.array(proposalSchema).max(50);
